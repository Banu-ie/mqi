import { Router } from "express";
import { z } from "zod";
import { Products } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";


// We create and export the router from THIS file
export const servicesRouter = Router();

// Your actual routes go here
servicesRouter.get("/", (req, res) => {
  res.json({ message: "Products route working" });
});
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

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Bütün məhsulları siyahıla
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: all
 *         schema: { type: boolean }
 *         description: true olarsa, qeyri-aktiv məhsullar da daxil olur (admin üçün)
 *     responses:
 *       200:
 *         description: Məhsul siyahısı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Product' }
 */
productsRouter.get("/", (req, res) => {
  const includeAll = req.query.all === "true";
  res.json(Products.list(includeAll));
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Tək məhsulu ID ilə gətir
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Məhsul
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404:
 *         description: Məhsul tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
productsRouter.get("/:id", (req, res) => {
  const product = Products.get(req.params.id);
  if (!product) return res.status(404).json({ error: "Məhsul tapılmadı." });
  res.json(product);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Yeni məhsul yarat (yalnız admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       201:
 *         description: Yaradılan məhsul
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Validasiya xətası
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token yoxdur və ya etibarsızdır
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
productsRouter.post("/", requireAuth, (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const product = Products.create(parsed.data);
  res.status(201).json(product);
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Məhsulu yenilə (yalnız admin)
 *     tags: [Products]
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
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       200:
 *         description: Yenilənmiş məhsul
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Validasiya xətası
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Məhsul tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
productsRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const product = Products.update(req.params.id, parsed.data);
  if (!product) return res.status(404).json({ error: "Məhsul tapılmadı." });
  res.json(product);
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Məhsulu sil (yalnız admin)
 *     tags: [Products]
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
 *         description: Məhsul tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
productsRouter.delete("/:id", requireAuth, (req, res) => {
  const ok = Products.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: "Məhsul tapılmadı." });
  res.status(204).send();
});
