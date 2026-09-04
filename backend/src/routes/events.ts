import { Router } from "express";
import { z } from "zod";
import { Events } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const eventsRouter = Router();

const eventSchema = z.object({
  title: z.string().min(1, "Başlıq tələb olunur."),
  date: z.string().min(1, "Tarix tələb olunur."),
  location: z.string().min(1, "Məkan tələb olunur."),
  shortDesc: z.string().min(1, "Qısa təsvir tələb olunur."),
  fullDesc: z.string().default(""),
  image: z.string().url("Şəkil düzgün URL olmalıdır.").or(z.literal("")),
  status: z.enum(["upcoming", "past"]).default("upcoming"),
});

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Bütün tədbirləri siyahıla
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [upcoming, past] }
 *         description: Tədbirləri statusa görə filtrlə
 *     responses:
 *       200:
 *         description: Tədbir siyahısı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Event' }
 */
eventsRouter.get("/", async (req, res) => {
  const status = req.query.status;
  const filter = status === "upcoming" || status === "past" ? status : undefined;
  res.json(await Events.list(filter));
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Tək tədbiri ID ilə gətir
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tədbir
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 *       404:
 *         description: Tədbir tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
eventsRouter.get("/:id", async (req, res) => {
  const event = await Events.get(req.params.id);
  if (!event) return res.status(404).json({ error: "Tədbir tapılmadı." });
  res.json(event);
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Yeni tədbir yarat (yalnız admin)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EventInput' }
 *     responses:
 *       201:
 *         description: Yaradılan tədbir
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 *       400:
 *         description: Validasiya xətası
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token yoxdur və ya etibarsızdır
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
eventsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const event = await Events.create(parsed.data);
  res.status(201).json(event);
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Tədbiri yenilə (yalnız admin)
 *     tags: [Events]
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
 *           schema: { $ref: '#/components/schemas/EventInput' }
 *     responses:
 *       200:
 *         description: Yenilənmiş tədbir
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 *       400:
 *         description: Validasiya xətası
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Tədbir tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
eventsRouter.put("/:id", requireAuth, async (req, res) => {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const event = await Events.update(req.params.id, parsed.data);
  if (!event) return res.status(404).json({ error: "Tədbir tapılmadı." });
  res.json(event);
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Tədbiri sil (yalnız admin)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Silindi
 *       404:
 *         description: Tədbir tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
eventsRouter.delete("/:id", requireAuth, async (req, res) => {
  const ok = await Events.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: "Tədbir tapılmadı." });
  res.status(204).send();
});
