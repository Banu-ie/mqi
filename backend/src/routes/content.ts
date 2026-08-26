import { Router } from "express";
import { z } from "zod";
import { SiteContent } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const contentRouter = Router();

const contentSchema = z.object({
  heroHeadline: z.string().min(1),
  heroSubtext: z.string().min(1),
  aboutIntro: z.string().min(1),
  mission: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  instagram: z.string().min(1),
  address: z.string().min(1),
});

contentRouter.get("/", (_req, res) => {
  const content = SiteContent.get();
  if (!content) return res.status(404).json({ error: "Məzmun tapılmadı." });
  res.json(content);
});

contentRouter.put("/", requireAuth, (req, res) => {
  const parsed = contentSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const content = SiteContent.update(parsed.data);
  res.json(content);
});
