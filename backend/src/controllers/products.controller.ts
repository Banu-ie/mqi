import type { Request, Response } from "express";
import { z } from "zod";
import { Products } from "../db/models";

const productSchema = z.object({
  name: z.string().trim().min(1, "Məhsul adı tələb olunur."),
  price: z.coerce.number().finite().nonnegative("Qiymət mənfi ola bilməz."),
  category: z.string().trim().min(1, "Kateqoriya tələb olunur."),
  shortDesc: z.string().trim().min(1, "Qısa təsvir tələb olunur."),
  fullDesc: z.string().default(""),
  image: z.string().refine((value) => value === "" || value.startsWith("/uploads/") || /^https?:\/\//i.test(value), "Şəkil düzgün deyil."),
  status: z.enum(["active", "inactive"]).default("active"),
});

function imageValue(req: Request, fallback = "") { return req.file ? `/uploads/products/${req.file.filename}` : (typeof req.body.image === "string" ? req.body.image : fallback); }
function validate(input: unknown) { return productSchema.safeParse(input); }

export async function getProducts(req: Request, res: Response) {
  return res.json(await Products.list(req.query.all === "true"));
}
export async function getProductById(req: Request, res: Response) {
  const product = await Products.get(req.params.id);
  if (!product) return res.status(404).json({ error: "Məhsul tapılmadı." });
  return res.json(product);
}
export async function createProduct(req: Request, res: Response) {
  const parsed = validate({ ...req.body, image: imageValue(req) });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  return res.status(201).json(await Products.create({ ...parsed.data, image: imageValue(req) }));
}
export async function updateProduct(req: Request, res: Response) {
  const parsed = productSchema.partial().safeParse({ ...req.body, ...(req.file ? { image: imageValue(req) } : {}) });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const product = await Products.update(req.params.id, parsed.data);
  if (!product) return res.status(404).json({ error: "Məhsul tapılmadı." });
  return res.json(product);
}
export async function deleteProduct(req: Request, res: Response) {
  if (!(await Products.remove(req.params.id))) return res.status(404).json({ error: "Məhsul tapılmadı." });
  return res.status(204).send();
}
