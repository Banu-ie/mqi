import type { Request, Response } from "express";
import { z } from "zod";
import { SiteContent } from "../db/models";
const contentSchema = z.object({ heroHeadline: z.string().trim().min(1).max(200), heroSubtext: z.string().trim().min(1).max(2_000), aboutIntro: z.string().trim().min(1).max(10_000), mission: z.string().trim().min(1).max(10_000), phone: z.string().trim().min(1).max(32), email: z.string().email().max(320), instagram: z.string().trim().min(1).max(100), address: z.string().trim().min(1).max(500) });
export async function getContent(_req: Request, res: Response) { const content = await SiteContent.get(); if (!content) return res.status(404).json({ error: "Məzmun tapılmadı." }); return res.json(content); }
export async function updateContent(req: Request, res: Response) { const parsed = contentSchema.partial().safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); return res.json(await SiteContent.update(parsed.data)); }
