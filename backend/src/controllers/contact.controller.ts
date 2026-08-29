import type { Request, Response } from "express";
import { z } from "zod";
import { ContactMessages } from "../db/models";
const phonePattern = /^(?:\+994|00994|0)(?:10|12|18|20|21|22|23|24|25|26|33|35|36|50|51|55|60|70|77|99)\d{7}$/;
const messageSchema = z.object({ name: z.string().trim().min(1, "Ad tələb olunur."), phone: z.string().trim().min(1, "Telefon tələb olunur.").refine((phone) => phonePattern.test(phone.replace(/[\s()-]/g, "")), "Azərbaycan nömrəsini +994 50 123 45 67 formatında daxil edin."), message: z.string().trim().min(1, "Mesaj tələb olunur.") });
export function createContact(req: Request, res: Response) { const parsed = messageSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); return res.status(201).json(ContactMessages.create(parsed.data)); }
export function getContacts(_req: Request, res: Response) { return res.json(ContactMessages.list()); }
