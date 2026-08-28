import { Router } from "express";
import { z } from "zod";
import { Categories } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const categoriesRouter = Router();
const categorySchema = z.object({ name: z.string().trim().min(1, "Kateqoriya adı tələb olunur."), type: z.enum(["product", "service"]) });

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [product, service] }
 *     responses:
 *       200: { description: Kateqoriya siyahısı }
 *   post:
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/CategoryInput' } } }
 *     responses:
 *       201: { description: Yaradıldı }
 *       400: { description: Validasiya xətası }
 *       401: { description: Giriş tələb olunur }
 *       409: { description: Təkrar kateqoriya }
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/CategoryInput' } } }
 *     responses:
 *       200: { description: Yeniləndi }
 *       400: { description: Validasiya xətası }
 *       401: { description: Giriş tələb olunur }
 *       404: { description: Tapılmadı }
 *       409: { description: Təkrar kateqoriya }
 *   delete:
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       204: { description: Silindi }
 *       401: { description: Giriş tələb olunur }
 *       404: { description: Tapılmadı }
 */

categoriesRouter.get("/", (req, res) => {
  const type = req.query.type === "product" || req.query.type === "service" ? req.query.type : undefined;
  return res.json(Categories.list(type));
});
categoriesRouter.post("/", requireAuth, (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  try { return res.status(201).json(Categories.create(parsed.data)); }
  catch { return res.status(409).json({ error: "Bu kateqoriya artıq mövcuddur." }); }
});
categoriesRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  try {
    const category = Categories.update(req.params.id, parsed.data);
    if (!category) return res.status(404).json({ error: "Kateqoriya tapılmadı." });
    return res.json(category);
  } catch { return res.status(409).json({ error: "Bu kateqoriya artıq mövcuddur." }); }
});
categoriesRouter.delete("/:id", requireAuth, (req, res) => {
  if (!Categories.remove(req.params.id)) return res.status(404).json({ error: "Kateqoriya tapılmadı." });
  return res.status(204).send();
});
