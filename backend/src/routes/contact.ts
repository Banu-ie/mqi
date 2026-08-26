import { Router } from "express";
import { z } from "zod";
import { Categories } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";


// We create and export the router from THIS file
export const contactRouter = Router();

// Your actual routes go here
contactRouter.get("/", (req, res) => {
  res.json({ message: "Products route working" });
});
export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().min(1, "Kateqoriya adı tələb olunur."),
  type: z.enum(["product", "service"]),
});

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Bütün kateqoriyaları siyahıla
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [product, service] }
 *         description: Kateqoriyaları növə görə filtrlə
 *     responses:
 *       200:
 *         description: Kateqoriya siyahısı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Category' }
 */
categoriesRouter.get("/", (req, res) => {
  const type = req.query.type;
  const filter = type === "product" || type === "service" ? type : undefined;
  res.json(Categories.list(filter));
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Yeni kateqoriya yarat (yalnız admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CategoryInput' }
 *     responses:
 *       201:
 *         description: Yaradılan kateqoriya
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       400:
 *         description: Validasiya xətası
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Kateqoriya artıq mövcuddur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
categoriesRouter.post("/", requireAuth, (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  try {
    const category = Categories.create(parsed.data);
    res.status(201).json(category);
  } catch {
    res.status(409).json({ error: "Bu kateqoriya artıq mövcuddur." });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Kateqoriyanı yenilə (yalnız admin)
 *     tags: [Categories]
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
 *           schema: { $ref: '#/components/schemas/CategoryInput' }
 *     responses:
 *       200:
 *         description: Yenilənmiş kateqoriya
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       400:
 *         description: Validasiya xətası
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Kateqoriya tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
categoriesRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const category = Categories.update(req.params.id, parsed.data);
  if (!category) return res.status(404).json({ error: "Kateqoriya tapılmadı." });
  res.json(category);
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Kateqoriyanı sil (yalnız admin)
 *     tags: [Categories]
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
 *         description: Kateqoriya tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
categoriesRouter.delete("/:id", requireAuth, (req, res) => {
  const ok = Categories.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: "Kateqoriya tapılmadı." });
  res.status(204).send();
});
