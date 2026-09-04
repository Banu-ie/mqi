import type { Request, Response } from "express";
import { z } from "zod";
import { withTransaction } from "../db";
import { Categories, Products } from "../db/models";

const categorySchema = z.object({ name: z.string().trim().min(1, "Kateqoriya adı tələb olunur."), type: z.enum(["product", "service"]) });

export async function getCategories(req: Request, res: Response) { const type = req.query.type === "product" || req.query.type === "service" ? req.query.type : undefined; return res.json(await Categories.list(type)); }

export async function createCategory(req: Request, res: Response) { const parsed = categorySchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); try { return res.status(201).json(await Categories.create(parsed.data)); } catch { return res.status(409).json({ error: "Bu kateqoriya artıq mövcuddur." }); } }

export async function updateCategory(req: Request, res: Response) {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });

  const existing = await Categories.get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Kateqoriya tapılmadı." });

  // Products reference their category by name, so a rename has to be carried
  // over to them in the same transaction or those products fall out of every
  // category filter.
  const renamedTo = parsed.data.name && parsed.data.name !== existing.name ? parsed.data.name : null;
  try {
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
        await client.query(`UPDATE products SET category = $1, updated_at = now() WHERE category = $2`, [renamedTo, existing.name]);
      }
      return updated ?? null;
    });
    if (!category) return res.status(404).json({ error: "Kateqoriya tapılmadı." });
    return res.json(category);
  } catch {
    return res.status(409).json({ error: "Bu kateqoriya artıq mövcuddur." });
  }
}

export async function deleteCategory(req: Request, res: Response) {
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
  return res.status(204).send();
}
