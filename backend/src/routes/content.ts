import { Router } from "express";
import { z } from "zod";
import { SiteContent } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const contentRouter = Router();

const contentSchema = z.object({
  heroHeadline: z.string().min(1),
  heroSubtext: z.string().min(1),
  aboutIntro: z.string().min(1),
  mission: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  instagram: z.string().min(1),
  address: z.string().min(1),
});

/**
 * @swagger
 * /content:
 *   get:
 *     summary: Sayt məzmununu gətir (hero, haqqımızda, əlaqə məlumatları)
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Sayt məzmunu
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SiteContent' }
 *       404:
 *         description: Məzmun tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
contentRouter.get("/", (_req, res) => {
  const content = SiteContent.get();
  if (!content) return res.status(404).json({ error: "Məzmun tapılmadı." });
  res.json(content);
});

/**
 * @swagger
 * /content:
 *   put:
 *     summary: Sayt məzmununu yenilə (yalnız admin)
 *     tags: [Content]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SiteContent' }
 *     responses:
 *       200:
 *         description: Yenilənmiş məzmun
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SiteContent' }
 *       400:
 *         description: Validasiya xətası
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
contentRouter.put("/", requireAuth, (req, res) => {
  const parsed = contentSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const content = SiteContent.update(parsed.data);
  res.json(content);
});
