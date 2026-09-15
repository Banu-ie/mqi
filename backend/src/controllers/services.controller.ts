import type { Request, Response } from "express";
import { z } from "zod";
import { Services } from "../db/models";
import { storeUpload } from "../lib/imageStore";

const serviceSchema = z.object({
  name: z.string().trim().min(1, "Xidmət adı tələb olunur."),
  description: z.string().trim().min(1, "Qısa təsvir tələb olunur."),
  fullDesc: z.string().default(""),
  image: z.string().refine((value) => value === "" || value.startsWith("/uploads/") || /^https?:\/\//i.test(value), "Şəkil düzgün deyil."),
  forWhom: z.string().default(""),
  benefits: z.preprocess((value) => typeof value === "string" ? value.split("\n").map((item) => item.trim()).filter(Boolean) : value, z.array(z.string()).default([])),
  status: z.enum(["active", "inactive"]).default("active"),
});

function serialize(service: Awaited<ReturnType<typeof Services.get>> | null) {
  if (!service) return service;
  try { const benefits = JSON.parse(service.benefits); return { ...service, benefits: Array.isArray(benefits) ? benefits : [] }; }
  catch { return { ...service, benefits: [] }; }
}
/**
 * The image this request is asking for, storing an uploaded file in the
 * database on the way past (see middleware/upload). Call it once per request:
 * it writes, so calling it twice would store the same picture twice.
 */
async function imageValue(req: Request, fallback = "") { return req.file ? storeUpload("services", req.file) : (typeof req.body.image === "string" ? req.body.image : fallback); }
async function input(req: Request, includeDefaults: boolean) { return { ...req.body, ...(includeDefaults || req.file ? { image: await imageValue(req) } : {}) }; }

export async function getServices(req: Request, res: Response) { return res.json((await Services.list(req.query.all === "true")).map(serialize)); }
export async function getServiceById(req: Request, res: Response) { const service = serialize(await Services.get(req.params.id)); if (!service) return res.status(404).json({ error: "Xidmət tapılmadı." }); return res.json(service); }
export async function createService(req: Request, res: Response) { const parsed = serviceSchema.safeParse(await input(req, true)); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); return res.status(201).json(serialize(await Services.create(parsed.data))); }
export async function updateService(req: Request, res: Response) { const parsed = serviceSchema.partial().safeParse(await input(req, false)); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); const updated = await Services.update(req.params.id, parsed.data); if (!updated) return res.status(404).json({ error: "Xidmət tapılmadı." }); return res.json(serialize(updated)); }
export async function deleteService(req: Request, res: Response) { if (!(await Services.remove(req.params.id))) return res.status(404).json({ error: "Xidmət tapılmadı." }); return res.status(204).send(); }
