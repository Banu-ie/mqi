import { Router } from "express";
import { z } from "zod";
import { Categories } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().min(1, "Kateqoriya adı tələb olunur."),
  type: z.enum(["product", "service"]),
});

categoriesRouter.get("/", (req, res) => {
  const type = req.query.type;
  const filter = type === "product" || type === "service" ? type : undefined;
  res.json(Categories.list(filter));
});

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

categoriesRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const category = Categories.update(req.params.id, parsed.data);
  if (!category) return res.status(404).json({ error: "Kateqoriya tapılmadı." });
  res.json(category);
});

categoriesRouter.delete("/:id", requireAuth, (req, res) => {
  const ok = Categories.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: "Kateqoriya tapılmadı." });
  res.status(204).send();
});
