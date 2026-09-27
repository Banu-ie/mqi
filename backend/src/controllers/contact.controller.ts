import type { Request, Response } from "express";
import { z } from "zod";
import { ContactMessages } from "../db/models";
const phonePattern = /^(?:\+994|00994|0)(?:10|12|18|20|21|22|23|24|25|26|33|35|36|50|51|55|60|70|77|99)\d{7}$/;
const messageSchema = z.object({ name: z.string().trim().min(1, "Ad tələb olunur."), phone: z.string().trim().min(1, "Telefon tələb olunur.").refine((phone) => phonePattern.test(phone.replace(/[\s()-]/g, "")), "Azərbaycan nömrəsini +994 50 123 45 67 formatında daxil edin."), message: z.string().trim().min(1, "Mesaj tələb olunur.") });
export async function createContact(req: Request, res: Response) { const parsed = messageSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); return res.status(201).json(await ContactMessages.create(parsed.data)); }
function pagination(req: Request) {
	const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
	const pageSize = Math.min(100, Math.max(1, Math.floor(Number(req.query.pageSize) || 50)));
	return { page, pageSize };
}
export async function getContacts(req: Request, res: Response) {
	const { page, pageSize } = pagination(req);
	const [items, total] = await Promise.all([ContactMessages.list(page, pageSize), ContactMessages.count()]);
	return res.json({ items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) });
}
export async function getContactCount(_req: Request, res: Response) {
	return res.json({ count: await ContactMessages.count() });
}
export async function deleteContact(req: Request, res: Response) {
	if (!(await ContactMessages.remove(req.params.id))) return res.status(404).json({ error: "Mesaj tapılmadı." });
	return res.status(204).send();
}
