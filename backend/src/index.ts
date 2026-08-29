import "dotenv/config";
import express from "express";
import path from "node:path";
import multer from "multer";
import cors from "cors";
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

app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

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
  console.error(err);
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Şəkil 5 MB-dan böyük ola bilməz." : "Yalnız JPG, PNG, WEBP və GIF şəkillərinə icazə verilir.";
    return res.status(400).json({ error: message });
  }
  res.status(500).json({ error: "Serverdə xəta baş verdi. Zəhmət olmasa yenidən cəhd edin." });
});

app.listen(PORT, () => {
  console.log(`MQİCMA backend running on http://localhost:${PORT}`);
});
