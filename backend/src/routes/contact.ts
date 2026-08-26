import { Router } from "express";
import { z } from "zod";
import { ContactMessages } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const contactRouter = Router();

const messageSchema = z.object({
  name: z.string().min(1, "Ad tələb olunur."),
  phone: z.string().min(1, "Telefon tələb olunur."),
  message: z.string().min(1, "Mesaj tələb olunur."),
});

contactRouter.post("/", (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const saved = ContactMessages.create(parsed.data);
  res.status(201).json(saved);
});

contactRouter.get("/", requireAuth, (_req, res) => {
  res.json(ContactMessages.list());
});
