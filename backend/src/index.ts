import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";
import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";
import { servicesRouter } from "./routes/services";
import { eventsRouter } from "./routes/events";
import { categoriesRouter } from "./routes/categories";
import { contentRouter } from "./routes/content";
import { contactRouter } from "./routes/contact";
const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:8443")
  .split(",")
  .map((origin) => origin.trim());

// Behind a hosting proxy (Render/Fly/Railway) the client IP arrives in
// X-Forwarded-For; without this the rate limiters would see the proxy IP only.
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json({ limit: "100kb" }));

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

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
  app.listen(PORT, () => {
    console.log(`MQİCMA backend running on http://localhost:${PORT}`);
  });
}
