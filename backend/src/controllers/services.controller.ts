import type { Request, Response } from "express";
import { z } from "zod";
import { Services } from "../db/models";

const serviceSchema = z.object({
  name: z.string().trim().min(1, "Xidmət adı tələb olunur."),
  description: z.string().trim().min(1, "Qısa təsvir tələb olunur."),
  fullDesc: z.string().default(""),
  image: z.string().refine((value) => value === "" || value.startsWith("/uploads/") || /^https?:\/\//i.test(value), "Şəkil düzgün deyil."),
  forWhom: z.string().default(""),
  benefits: z.preprocess((value) => typeof value === "string" ? value.split("\n").map((item) => item.trim()).filter(Boolean) : value, z.array(z.string()).default([])),
  status: z.enum(["active", "inactive"]).default("active"),
});

function serialize(service: ReturnType<typeof Services.get>) {
  if (!service) return service;
  try { const benefits = JSON.parse(service.benefits); return { ...service, benefits: Array.isArray(benefits) ? benefits : [] }; }
  catch { return { ...service, benefits: [] }; }
}
function imageValue(req: Request, fallback = "") { return req.file ? `/uploads/services/${req.file.filename}` : (typeof req.body.image === "string" ? req.body.image : fallback); }
function input(req: Request, includeDefaults: boolean) { return { ...req.body, ...(includeDefaults || req.file ? { image: imageValue(req) } : {}) }; }

export function getServices(req: Request, res: Response) { return res.json(Services.list(req.query.all === "true").map(serialize)); }
export function getServiceById(req: Request, res: Response) { const service = serialize(Services.get(req.params.id)); if (!service) return res.status(404).json({ error: "Xidmət tapılmadı." }); return res.json(service); }
export function createService(req: Request, res: Response) { const parsed = serviceSchema.safeParse(input(req, true)); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); return res.status(201).json(serialize(Services.create({ ...parsed.data, image: imageValue(req) }))); }
export function updateService(req: Request, res: Response) { const parsed = serviceSchema.partial().safeParse(input(req, false)); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); const updated = Services.update(req.params.id, parsed.data); if (!updated) return res.status(404).json({ error: "Xidmət tapılmadı." }); return res.json(serialize(updated)); }
export function deleteService(req: Request, res: Response) { if (!Services.remove(req.params.id)) return res.status(404).json({ error: "Xidmət tapılmadı." }); return res.status(204).send(); }
