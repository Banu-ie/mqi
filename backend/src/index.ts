import "dotenv/config";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";
import { runMigrations, SCHEMA } from "./db";
import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";
import { servicesRouter } from "./routes/services";
import { eventsRouter } from "./routes/events";
import { categoriesRouter } from "./routes/categories";
import { contentRouter } from "./routes/content";
import { contactRouter } from "./routes/contact";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:4173,http://localhost:8443")
  .split(",")
  .map((origin) => origin.trim());

// Behind a hosting proxy (Render/Fly/Railway) the client IP arrives in
// X-Forwarded-For; without this the rate limiters would see the proxy IP only.
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

// crossOriginResourcePolicy is relaxed so uploaded images can be loaded from
// the frontend when it is served from a different origin.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // The SPA is served from this same origin, so the default CSP (which allows
    // only 'self') would block the Google Fonts stylesheet and the remote
    // imagery the site content links to. Everything else stays locked down.
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
        "connect-src": ["'self'"],
      },
    },
  }),
);
app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json({ limit: "100kb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const rateLimitMessage = (message: string) => ({
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: message },
});

// Broad ceiling for the whole API, then tighter limits on the two endpoints an
// abuser would actually target: credential stuffing on login and contact spam.
const apiLimiter = rateLimit({
  ...rateLimitMessage("Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin."),
  limit: 300,
});
const loginLimiter = rateLimit({
  ...rateLimitMessage("Çox sayda giriş cəhdi. 15 dəqiqə sonra yenidən cəhd edin."),
  limit: 10,
  skipSuccessfulRequests: true,
});
const contactLimiter = rateLimit({
  ...rateLimitMessage("Çox sayda mesaj göndərildi. Bir saat sonra yenidən cəhd edin."),
  windowMs: 60 * 60 * 1000,
  limit: 5,
});

app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Swagger UI ships inline styles/scripts that helmet's default CSP blocks.
app.use("/api/docs", helmet({ contentSecurityPolicy: false }), swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

app.use("/api/auth/login", loginLimiter);
app.post("/api/contact", contactLimiter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/events", eventsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/content", contentRouter);
app.use("/api/contact", contactRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Endpoint tapılmadı." });
});

// The built frontend is copied to backend/public at build time. When it is
// present this process serves the site and the API from one origin: no CORS,
// and no backend hostname to configure anywhere. When it is absent (local dev,
// tests) the server stays API-only and Vite serves the frontend instead.
const FRONTEND_DIR = path.join(process.cwd(), "public");

if (fs.existsSync(path.join(FRONTEND_DIR, "index.html"))) {
  // Asset filenames carry a content hash, so they are safe to cache forever.
  // index.html must not be, or browsers keep booting the previous deploy.
  app.use(express.static(FRONTEND_DIR, { index: false, maxAge: "1y" }));

  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    // A miss under /api or /uploads is a genuine 404, not a client-side route.
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    res.sendFile(path.join(FRONTEND_DIR, "index.html"));
  });
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Rejected uploads are client faults with a specific cause worth reporting.
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE"
      ? "Şəkil 5 MB-dan böyük ola bilməz."
      : "Yalnız JPG, PNG, WEBP və GIF şəkillərinə icazə verilir.";
    return res.status(400).json({ error: message });
  }
  // body-parser surfaces malformed/oversized request bodies as errors with a
  // `type` field. Those are client faults and must not be reported as 500s.
  const bodyError = err as { type?: string; status?: number } | null;
  if (bodyError?.type === "entity.too.large") {
    return res.status(413).json({ error: "Göndərilən məlumat həddindən artıq böyükdür." });
  }
  if (bodyError?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Sorğu formatı yanlışdır." });
  }
  // Anything else is genuinely unexpected: log it server-side, and never leak
  // the message or stack to the client.
  console.error(err);
  res.status(500).json({ error: "Serverdə xəta baş verdi. Zəhmət olmasa yenidən cəhd edin." });
});

export { app };

// Only bind a port when started as a program. Importing this module (the test
// suite does) should build the app without occupying a port.
if (require.main === module) {
  // Migrations run once at startup, before the port opens, so the process
  // never serves traffic against a schema that is not ready yet.
  runMigrations()
    .then((applied) => {
      console.log(`Database schema: ${SCHEMA}`);
      if (applied.length) console.log(`Applied migrations: ${applied.join(", ")}`);
      app.listen(PORT, () => {
        console.log(`MQİCMA backend running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to prepare the database:", error);
      process.exit(1);
    });
}
