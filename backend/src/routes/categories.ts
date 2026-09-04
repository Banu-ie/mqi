import { Router } from "express";
import { z } from "zod";
import { withTransaction } from "../db";
import { Categories, Products } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

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
categoriesRouter.get("/", async (req, res) => {
  const type = req.query.type;
  const filter = type === "product" || type === "service" ? type : undefined;
  res.json(await Categories.list(filter));
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
categoriesRouter.post("/", requireAuth, async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  try {
    const category = await Categories.create(parsed.data);
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
categoriesRouter.put("/:id", requireAuth, async (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const existing = await Categories.get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Kateqoriya tapılmadı." });

  // Products reference their category by name, so a rename has to be carried
  // over to them in the same transaction or those products fall out of every
  // category filter.
  const renamedTo = parsed.data.name && parsed.data.name !== existing.name ? parsed.data.name : null;
  const category = await withTransaction(async (client) => {
    const set: string[] = [];
    const values: unknown[] = [];
    if (parsed.data.name !== undefined) { values.push(parsed.data.name); set.push(`name = $${values.length}`); }
    if (parsed.data.type !== undefined) { values.push(parsed.data.type); set.push(`type = $${values.length}`); }
    set.push("updated_at = now()");
    values.push(req.params.id);
    const updated = (
      await client.query<{ id: string; name: string; type: "product" | "service" }>(
        `UPDATE categories SET ${set.join(", ")} WHERE id = $${values.length} RETURNING id, name, type`,
        values,
      )
    ).rows[0];
    if (updated && renamedTo) {
      await client.query(`UPDATE products SET category = $1, updated_at = now() WHERE category = $2`, [
        renamedTo,
        existing.name,
      ]);
    }
    return updated ?? null;
  });

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
 *       409:
 *         description: Kateqoriya istifadədədir (məhsullar bağlıdır)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Kateqoriya tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
categoriesRouter.delete("/:id", requireAuth, async (req, res) => {
  const existing = await Categories.get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Kateqoriya tapılmadı." });

  // Refuse to orphan products: without a foreign key nothing else would stop
  // this from leaving rows pointing at a category that no longer exists.
  const inUse = existing.type === "product" ? await Products.countByCategory(existing.name) : 0;
  if (inUse > 0) {
    return res.status(409).json({
      error: `Bu kateqoriyada ${inUse} məhsul var. Əvvəlcə həmin məhsulları başqa kateqoriyaya keçirin.`,
    });
  }

  await Categories.remove(req.params.id);
  res.status(204).send();
});
