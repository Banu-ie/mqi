import { Router } from "express";
import { z } from "zod";
import { Products } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const productsRouter = Router();

const productSchema = z.object({
  name: z.string().min(1, "Məhsul adı tələb olunur."),
  price: z.number().nonnegative("Qiymət mənfi ola bilməz."),
  category: z.string().min(1, "Kateqoriya tələb olunur."),
  shortDesc: z.string().min(1, "Qısa təsvir tələb olunur."),
  fullDesc: z.string().default(""),
  image: z.string().url("Şəkil düzgün URL olmalıdır.").or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});

productsRouter.get("/", (req, res) => {
  const includeAll = req.query.all === "true";
  res.json(Products.list(includeAll));
});

productsRouter.get("/:id", (req, res) => {
  const product = Products.get(req.params.id);
  if (!product) return res.status(404).json({ error: "Məhsul tapılmadı." });
  res.json(product);
});

productsRouter.post("/", requireAuth, (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const product = Products.create(parsed.data);
  res.status(201).json(product);
});

productsRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const product = Products.update(req.params.id, parsed.data);
  if (!product) return res.status(404).json({ error: "Məhsul tapılmadı." });
  res.json(product);
});

productsRouter.delete("/:id", requireAuth, (req, res) => {
  const ok = Products.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: "Məhsul tapılmadı." });
  res.status(204).send();
});
