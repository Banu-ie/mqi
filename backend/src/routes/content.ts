import { Router } from "express";
import { z } from "zod";
import { SiteContent } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const contentRouter = Router();
const contentSchema = z.object({
  heroHeadline: z.string().trim().min(1), heroSubtext: z.string().trim().min(1), aboutIntro: z.string().trim().min(1),
  mission: z.string().trim().min(1), phone: z.string().trim().min(1), email: z.string().email(), instagram: z.string().trim().min(1), address: z.string().trim().min(1),
});

/** @swagger
 * /content:
 *   get: { tags: [Content], responses: { 200: { description: Sayt məzmunu }, 404: { description: Tapılmadı } } }
 *   put: { tags: [Content], security: [{ bearerAuth: [] }], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/SiteContent' } } } }, responses: { 200: { description: Yeniləndi }, 400: { description: Validasiya xətası }, 401: { description: Giriş tələb olunur } } }
 */
contentRouter.get("/", (_req, res) => {
  const content = SiteContent.get();
  if (!content) return res.status(404).json({ error: "Məzmun tapılmadı." });
  return res.json(content);
});
contentRouter.put("/", requireAuth, (req, res) => {
  const parsed = contentSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  return res.json(SiteContent.update(parsed.data));
});
