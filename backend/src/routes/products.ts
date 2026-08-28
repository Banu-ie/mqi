import { Router } from "express";
import { z } from "zod";
import { Products } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const productsRouter = Router();
const productSchema = z.object({
  name: z.string().trim().min(1, "Məhsul adı tələb olunur."),
  price: z.number().finite().nonnegative("Qiymət mənfi ola bilməz."),
  category: z.string().trim().min(1, "Kateqoriya tələb olunur."),
  shortDesc: z.string().trim().min(1, "Qısa təsvir tələb olunur."),
  fullDesc: z.string().default(""),
  image: z.string().url("Şəkil düzgün URL olmalıdır.").or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});

/** @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     parameters: [{ in: query, name: all, schema: { type: boolean } }]
 *     responses: { 200: { description: Məhsul siyahısı } }
 */
productsRouter.get("/", (req, res, next) => {
  if (req.query.all === "true") return requireAuth(req, res, next);
  return res.json(Products.list(false));
}, (_req, res) => res.json(Products.list(true)));

/** @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Məhsul }, 404: { description: Tapılmadı } }
 */
productsRouter.get("/:id", (req, res) => {
  const product = Products.get(req.params.id);
  if (!product) return res.status(404).json({ error: "Məhsul tapılmadı." });
  return res.json(product);
});

/** @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ProductInput' } } } }
 *     responses: { 201: { description: Yaradıldı }, 400: { description: Validasiya xətası }, 401: { description: Giriş tələb olunur } }
 */
productsRouter.post("/", requireAuth, (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  return res.status(201).json(Products.create(parsed.data));
});

productsRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const product = Products.update(req.params.id, parsed.data);
  if (!product) return res.status(404).json({ error: "Məhsul tapılmadı." });
  return res.json(product);
});

productsRouter.delete("/:id", requireAuth, (req, res) => {
  if (!Products.remove(req.params.id)) return res.status(404).json({ error: "Məhsul tapılmadı." });
  return res.status(204).send();
});
