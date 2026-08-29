import type { Request, Response } from "express";
import { z } from "zod";
import { SiteContent } from "../db/models";
const contentSchema = z.object({ heroHeadline: z.string().trim().min(1), heroSubtext: z.string().trim().min(1), aboutIntro: z.string().trim().min(1), mission: z.string().trim().min(1), phone: z.string().trim().min(1), email: z.string().email(), instagram: z.string().trim().min(1), address: z.string().trim().min(1) });
export function getContent(_req: Request, res: Response) { const content = SiteContent.get(); if (!content) return res.status(404).json({ error: "Məzmun tapılmadı." }); return res.json(content); }
export function updateContent(req: Request, res: Response) { const parsed = contentSchema.partial().safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." }); return res.json(SiteContent.update(parsed.data)); }
