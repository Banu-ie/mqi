import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";
import { authRouter } from "./routes/auth";


import { productsRouter } from "./routes/services";
import { servicesRouter } from "./routes/services";
import { eventsRouter } from "./routes/products";
import { categoriesRouter } from "./routes/contact";
import { contentRouter } from "./routes/events";
import { contactRouter } from "./routes/content";
const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:8443")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json());

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
  res.status(500).json({ error: "Serverdə xəta baş verdi. Zəhmət olmasa yenidən cəhd edin." });
});

app.listen(PORT, () => {
  console.log(`MQİCMA backend running on http://localhost:${PORT}`);
});
