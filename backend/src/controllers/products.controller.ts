import type { Request, Response } from "express";
import { z } from "zod";
import { Products, type ProductRow } from "../db/models";
import { MAX_PRODUCT_IMAGES } from "../middleware/upload";

const imageRef = z.string().refine(
  (value) => value === "" || value.startsWith("/uploads/") || /^https?:\/\//i.test(value),
  "Şəkil düzgün deyil.",
);

/**
 * A gallery arrives as a form field, so it can reach us three ways: a JSON
 * array (what the admin panel sends), repeated fields (which multer hands over
 * already split), or a single bare URL. Normalise all three to an array.
 */
function parseImageList(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed === "") return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Not JSON after all — fall through and treat it as one URL.
    }
  }
  return [trimmed];
}

const productSchema = z.object({
  name: z.string().trim().min(1, "Məhsul adı tələb olunur."),
  price: z.coerce.number().finite().nonnegative("Qiymət mənfi ola bilməz."),
  category: z.string().trim().min(1, "Kateqoriya tələb olunur."),
  shortDesc: z.string().trim().min(1, "Qısa təsvir tələb olunur."),
  fullDesc: z.string().default(""),
  image: imageRef,
  images: z.preprocess(
    parseImageList,
    z.array(imageRef).max(MAX_PRODUCT_IMAGES, `Ən çox ${MAX_PRODUCT_IMAGES} şəkil əlavə edilə bilər.`).default([]),
  ),
  status: z.enum(["active", "inactive"]).default("active"),
});

/** Multer's `.fields()` form: files land grouped by field name, not on `req.file`. */
function filesFor(req: Request, field: string): Express.Multer.File[] {
  const files = req.files;
  if (!files || Array.isArray(files)) return [];
  return files[field] ?? [];
}

const toUploadPath = (file: Express.Multer.File) => `/uploads/products/${file.filename}`;

/**
 * Works out the gallery a request is asking for, or undefined when the request
 * says nothing about images at all — which is how a partial update leaves an
 * existing gallery alone.
 *
 * The request describes the gallery in full: entries listed under `images` are
 * the existing pictures to keep, in order, and freshly uploaded files are
 * appended after them. The cover is simply the first entry, so `image` never
 * drifts from the gallery it belongs to.
 */
function resolveGallery(req: Request): { images: string[]; image: string } | undefined {
  const uploadedCover = filesFor(req, "image").map(toUploadPath);
  const uploadedGallery = filesFor(req, "images").map(toUploadPath);
  const listed = parseImageList(req.body?.images);
  const bodyCover = typeof req.body?.image === "string" ? req.body.image.trim() : undefined;

  const saysNothing =
    listed === undefined &&
    bodyCover === undefined &&
    uploadedCover.length === 0 &&
    uploadedGallery.length === 0;
  if (saysNothing) return undefined;

  const kept = Array.isArray(listed) ? listed.filter((v): v is string => typeof v === "string") : [];

  // A file uploaded under the legacy single `image` field is meant as the
  // cover, so it leads.
  let gallery = [...uploadedCover, ...kept, ...uploadedGallery]
    .map((entry) => entry.trim())
    .filter(Boolean);

  // A client that only knows about one picture sends just `image`; that alone
  // is the whole gallery.
  if (gallery.length === 0 && bodyCover) gallery = [bodyCover];

  gallery = [...new Set(gallery)];
  return { images: gallery, image: gallery[0] ?? "" };
}

/** Hands callers the gallery as a real array, never the JSON text the column holds. */
function serialize<T extends ProductRow>(product: T | null | undefined) {
  if (!product) return product;
  let gallery: string[] = [];
  try {
    const parsed: unknown = JSON.parse(product.images);
    if (Array.isArray(parsed)) gallery = parsed.filter((v): v is string => typeof v === "string");
  } catch {
    gallery = [];
  }
  // A row written before galleries existed still has its cover; show it rather
  // than an empty gallery.
  if (gallery.length === 0 && product.image) gallery = [product.image];
  return { ...product, images: gallery };
}

export async function getProducts(req: Request, res: Response) {
  return res.json((await Products.list(req.query.all === "true")).map(serialize));
}
export async function getProductById(req: Request, res: Response) {
  const product = serialize(await Products.get(req.params.id));
  if (!product) return res.status(404).json({ error: "Məhsul tapılmadı." });
  return res.json(product);
}
export async function createProduct(req: Request, res: Response) {
  const gallery = resolveGallery(req) ?? { images: [], image: "" };
  const parsed = productSchema.safeParse({ ...req.body, ...gallery });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  return res.status(201).json(serialize(await Products.create(parsed.data)));
}
export async function updateProduct(req: Request, res: Response) {
  const gallery = resolveGallery(req);
  const patch: Record<string, unknown> = { ...req.body };
  delete patch.image;
  delete patch.images;
  const parsed = productSchema.partial().safeParse({ ...patch, ...(gallery ?? {}) });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const product = serialize(await Products.update(req.params.id, parsed.data));
  if (!product) return res.status(404).json({ error: "Məhsul tapılmadı." });
  return res.json(product);
}
export async function deleteProduct(req: Request, res: Response) {
  if (!(await Products.remove(req.params.id))) return res.status(404).json({ error: "Məhsul tapılmadı." });
  return res.status(204).send();
}
