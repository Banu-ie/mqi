import { Router } from "express";
import { z } from "zod";
import { ContactMessages } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const contactRouter = Router();
const phonePattern = /^(?:\\+994|00994|0)(?:10|12|18|20|21|22|23|24|25|26|33|35|36|50|51|55|60|70|77|99)\\d{7}$/;
const messageSchema = z.object({
  name: z.string().trim().min(1, "Ad tələb olunur."),
  phone: z.string().trim().min(1, "Telefon tələb olunur.").refine((phone) => phonePattern.test(phone.replace(/[\\s()-]/g, "")), "Azərbaycan nömrəsini +994 50 123 45 67 formatında daxil edin."),
  message: z.string().trim().min(1, "Mesaj tələb olunur."),
});

/** @swagger
 * /contact:
 *   post: { tags: [Contact], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ContactMessageInput' } } } }, responses: { 201: { description: Qəbul edildi }, 400: { description: Validasiya xətası } } }
 *   get: { tags: [Contact], security: [{ bearerAuth: [] }], responses: { 200: { description: Mesaj siyahısı }, 401: { description: Giriş tələb olunur } } }
 */
contactRouter.post("/", (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  return res.status(201).json(ContactMessages.create(parsed.data));
});
contactRouter.get("/", requireAuth, (_req, res) => res.json(ContactMessages.list()));
