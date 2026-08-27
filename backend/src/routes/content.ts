import { Router } from "express";
import { z } from "zod";
import { ContactMessages } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";


// We create and export the router from THIS file
export const contentRouter = Router();

// Your actual routes go here
contentRouter.get("/", (req, res) => {
  res.json({ message: "Products route working" });
});
export const contactRouter = Router();

const messageSchema = z.object({
  name: z.string().min(1, "Ad tələb olunur."),
  phone: z.string().min(1, "Telefon tələb olunur.").refine((phone) => /^(?:\+994|00994|0)(?:10|12|18|20|21|22|23|24|25|26|33|35|36|50|51|55|60|70|77|99)\d{7}$/.test(phone.replace(/[\s()-]/g, "")), "Azərbaycan nömrəsini +994 50 123 45 67 formatında daxil edin."),
  message: z.string().min(1, "Mesaj tələb olunur."),
});

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Əlaqə formundan mesaj göndər (ictimai)
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ContactMessageInput' }
 *     responses:
 *       201:
 *         description: Mesaj qeydə alındı
 *       400:
 *         description: Validasiya xətası
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
contactRouter.post("/", (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const saved = ContactMessages.create(parsed.data);
  res.status(201).json(saved);
});

/**
 * @swagger
 * /contact:
 *   get:
 *     summary: Bütün əlaqə mesajlarını gətir (yalnız admin)
 *     tags: [Contact]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Mesaj siyahısı
 *       401:
 *         description: Token yoxdur və ya etibarsızdır
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
contactRouter.get("/", requireAuth, (_req, res) => {
  res.json(ContactMessages.list());
});
