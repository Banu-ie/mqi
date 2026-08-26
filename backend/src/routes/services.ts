import { Router } from "express";
import { z } from "zod";
import { Services } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const servicesRouter = Router();

const serviceSchema = z.object({
  name: z.string().min(1, "Xidmət adı tələb olunur."),
  description: z.string().min(1, "Qısa təsvir tələb olunur."),
  fullDesc: z.string().default(""),
  image: z.string().url("Şəkil düzgün URL olmalıdır.").or(z.literal("")),
  forWhom: z.string().default(""),
  benefits: z.array(z.string()).default([]),
  status: z.enum(["active", "inactive"]).default("active"),
});

function serialize<T extends { benefits: string }>(service: T) {
  return { ...service, benefits: JSON.parse(service.benefits) as string[] };
}

servicesRouter.get("/", (req, res) => {
  const includeAll = req.query.all === "true";
  res.json(Services.list(includeAll).map(serialize));
});

servicesRouter.get("/:id", (req, res) => {
  const service = Services.get(req.params.id);
  if (!service) return res.status(404).json({ error: "Xidmət tapılmadı." });
  res.json(serialize(service));
});

servicesRouter.post("/", requireAuth, (req, res) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const service = Services.create(parsed.data);
  res.status(201).json(serialize(service));
});

servicesRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = serviceSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const service = Services.update(req.params.id, parsed.data);
  if (!service) return res.status(404).json({ error: "Xidmət tapılmadı." });
  res.json(serialize(service));
});

servicesRouter.delete("/:id", requireAuth, (req, res) => {
  const ok = Services.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: "Xidmət tapılmadı." });
  res.status(204).send();
});
