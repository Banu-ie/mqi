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

/** @swagger
 * /services:
 *   get: { tags: [Services], parameters: [{ in: query, name: all, schema: { type: boolean } }], responses: { 200: { description: Xidmət siyahısı } } }
 *   post: { tags: [Services], security: [{ bearerAuth: [] }], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ServiceInput' } } } }, responses: { 201: { description: Yaradıldı }, 400: { description: Validasiya xətası }, 401: { description: Giriş tələb olunur } } }
 * /services/{id}:
 *   get: { tags: [Services], parameters: [{ in: path, name: id, required: true, schema: { type: string } }], responses: { 200: { description: Xidmət }, 404: { description: Tapılmadı } } }
 *   put: { tags: [Services], security: [{ bearerAuth: [] }], parameters: [{ in: path, name: id, required: true, schema: { type: string } }], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ServiceInput' } } } }, responses: { 200: { description: Yeniləndi }, 400: { description: Validasiya xətası }, 401: { description: Giriş tələb olunur }, 404: { description: Tapılmadı } } }
 *   delete: { tags: [Services], security: [{ bearerAuth: [] }], parameters: [{ in: path, name: id, required: true, schema: { type: string } }], responses: { 204: { description: Silindi }, 401: { description: Giriş tələb olunur }, 404: { description: Tapılmadı } } }
 */

function serializeService<T extends { benefits: string }>(service: T) {
  let benefits: string[] = [];
  try {
    const parsed = JSON.parse(service.benefits);
    if (Array.isArray(parsed) && parsed.every((item): item is string => typeof item === "string")) benefits = parsed;
  } catch { /* Return an empty list for legacy or malformed rows. */ }
  return { ...service, benefits };
}

servicesRouter.get("/", (req, res, next) => {
  const includeAll = req.query.all === "true";
  if (includeAll) return requireAuth(req, res, next);
  return res.json(Services.list(false).map(serializeService));
}, (_req, res) => {
  res.json(Services.list(true).map(serializeService));
});

servicesRouter.get("/:id", (req, res) => {
  const service = Services.get(req.params.id);
  if (!service) return res.status(404).json({ error: "Xidmət tapılmadı." });
  res.json(serializeService(service));
});

servicesRouter.post("/", requireAuth, (req, res) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  res.status(201).json(serializeService(Services.create(parsed.data)));
});

servicesRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = serviceSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const service = Services.update(req.params.id, parsed.data);
  if (!service) return res.status(404).json({ error: "Xidmət tapılmadı." });
  res.json(serializeService(service));
});

servicesRouter.delete("/:id", requireAuth, (req, res) => {
  if (!Services.remove(req.params.id)) return res.status(404).json({ error: "Xidmət tapılmadı." });
  res.status(204).send();
});
