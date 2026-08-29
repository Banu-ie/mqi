import type { Request, Response } from "express";
import { z } from "zod";
import { Categories } from "../db/models";
const categorySchema = z.object({ name: z.string().trim().min(1, "Kateqoriya adı tələb olunur."), type: z.enum(["product", "service"]) });
export function getCategories(req: Request, res: Response) { const type = req.query.type === "product" || req.query.type === "service" ? req.query.type : undefined; return res.json(Categories.list(type)); }
export function createCategory(req: Request, res: Response) { const parsed = categorySchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); try { return res.status(201).json(Categories.create(parsed.data)); } catch { return res.status(409).json({ error: "Bu kateqoriya artıq mövcuddur." }); } }
export function updateCategory(req: Request, res: Response) { const parsed = categorySchema.partial().safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); try { const category = Categories.update(req.params.id, parsed.data); if (!category) return res.status(404).json({ error: "Kateqoriya tapılmadı." }); return res.json(category); } catch { return res.status(409).json({ error: "Bu kateqoriya artıq mövcuddur." }); } }
export function deleteCategory(req: Request, res: Response) { if (!Categories.remove(req.params.id)) return res.status(404).json({ error: "Kateqoriya tapılmadı." }); return res.status(204).send(); }
