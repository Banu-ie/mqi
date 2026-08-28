import { Router } from "express";
import { z } from "zod";
import { Events } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const eventsRouter = Router();
const eventSchema = z.object({
  title: z.string().trim().min(1, "Başlıq tələb olunur."),
  date: z.string().refine((value) => /^\\d{4}-\\d{2}-\\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)), "Tarix düzgün deyil."),
  location: z.string().trim().min(1, "Məkan tələb olunur."),
  shortDesc: z.string().trim().min(1, "Qısa təsvir tələb olunur."),
  fullDesc: z.string().default(""),
  image: z.string().url("Şəkil düzgün URL olmalıdır.").or(z.literal("")),
  status: z.enum(["upcoming", "past"]).default("upcoming"),
});

/** @swagger
 * /events:
 *   get: { tags: [Events], parameters: [{ in: query, name: status, schema: { type: string, enum: [upcoming, past] } }], responses: { 200: { description: Tədbir siyahısı } } }
 *   post: { tags: [Events], security: [{ bearerAuth: [] }], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/EventInput' } } } }, responses: { 201: { description: Yaradıldı }, 400: { description: Validasiya xətası }, 401: { description: Giriş tələb olunur } } }
 * /events/{id}:
 *   get: { tags: [Events], parameters: [{ in: path, name: id, required: true, schema: { type: string } }], responses: { 200: { description: Tədbir }, 404: { description: Tapılmadı } } }
 *   put: { tags: [Events], security: [{ bearerAuth: [] }], parameters: [{ in: path, name: id, required: true, schema: { type: string } }], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/EventInput' } } } }, responses: { 200: { description: Yeniləndi }, 400: { description: Validasiya xətası }, 401: { description: Giriş tələb olunur }, 404: { description: Tapılmadı } } }
 *   delete: { tags: [Events], security: [{ bearerAuth: [] }], parameters: [{ in: path, name: id, required: true, schema: { type: string } }], responses: { 204: { description: Silindi }, 401: { description: Giriş tələb olunur }, 404: { description: Tapılmadı } } }
 */

eventsRouter.get("/", (req, res) => {
  const status = req.query.status === "upcoming" || req.query.status === "past" ? req.query.status : undefined;
  return res.json(Events.list(status));
});
eventsRouter.get("/:id", (req, res) => {
  const event = Events.get(req.params.id);
  if (!event) return res.status(404).json({ error: "Tədbir tapılmadı." });
  return res.json(event);
});
eventsRouter.post("/", requireAuth, (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  return res.status(201).json(Events.create(parsed.data));
});
eventsRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const event = Events.update(req.params.id, parsed.data);
  if (!event) return res.status(404).json({ error: "Tədbir tapılmadı." });
  return res.json(event);
});
eventsRouter.delete("/:id", requireAuth, (req, res) => {
  if (!Events.remove(req.params.id)) return res.status(404).json({ error: "Tədbir tapılmadı." });
  return res.status(204).send();
});
