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

function serializeService<T extends { benefits: string }>(service: T) {
  return { ...service, benefits: JSON.parse(service.benefits) as string[] };
}

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Xidmətlərin siyahısı
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: all
 *         required: false
 *         schema: { type: string, enum: ['true'] }
 *         description: "'true' olduqda deaktiv xidmətlər də qaytarılır"
 *     responses:
 *       200:
 *         description: Xidmət siyahısı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Service' }
 */
servicesRouter.get("/", (req, res) => {
  const includeAll = req.query.all === "true";
  res.json(Services.list(includeAll).map(serializeService));
});

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Bir xidmətin detalları
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Xidmət
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Service' }
 *       404:
 *         description: Xidmət tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
servicesRouter.get("/:id", (req, res) => {
  const service = Services.get(req.params.id);
  if (!service) return res.status(404).json({ error: "Xidmət tapılmadı." });
  res.json(serializeService(service));
});

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Yeni xidmət yarat (yalnız admin)
 *     tags: [Services]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ServiceInput' }
 *     responses:
 *       201:
 *         description: Yaradıldı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Service' }
 *       400:
 *         description: Yanlış məlumat
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Giriş tələb olunur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
servicesRouter.post("/", requireAuth, (req, res) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  res.status(201).json(serializeService(Services.create(parsed.data)));
});

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Xidməti yenilə (yalnız admin)
 *     tags: [Services]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ServiceInput' }
 *     responses:
 *       200:
 *         description: Yeniləndi
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Service' }
 *       400:
 *         description: Yanlış məlumat
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Giriş tələb olunur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Xidmət tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
servicesRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = serviceSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const service = Services.update(req.params.id, parsed.data);
  if (!service) return res.status(404).json({ error: "Xidmət tapılmadı." });
  res.json(serializeService(service));
});

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Xidməti sil (yalnız admin)
 *     tags: [Services]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Silindi
 *       401:
 *         description: Giriş tələb olunur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Xidmət tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
servicesRouter.delete("/:id", requireAuth, (req, res) => {
  if (!Services.remove(req.params.id)) return res.status(404).json({ error: "Xidmət tapılmadı." });
  res.status(204).send();
});
