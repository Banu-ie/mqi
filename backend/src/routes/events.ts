import { Router } from "express";
import { z } from "zod";
import { Events } from "../db/models";
import { requireAuth } from "../middleware/requireAuth";

export const eventsRouter = Router();

const eventSchema = z.object({
  title: z.string().min(1, "Başlıq tələb olunur."),
  date: z.string().min(1, "Tarix tələb olunur."),
  location: z.string().min(1, "Məkan tələb olunur."),
  shortDesc: z.string().min(1, "Qısa təsvir tələb olunur."),
  fullDesc: z.string().default(""),
  image: z.string().url("Şəkil düzgün URL olmalıdır.").or(z.literal("")),
  status: z.enum(["upcoming", "past"]).default("upcoming"),
});

eventsRouter.get("/", (req, res) => {
  const status = req.query.status;
  const filter = status === "upcoming" || status === "past" ? status : undefined;
  res.json(Events.list(filter));
});

eventsRouter.get("/:id", (req, res) => {
  const event = Events.get(req.params.id);
  if (!event) return res.status(404).json({ error: "Tədbir tapılmadı." });
  res.json(event);
});

eventsRouter.post("/", requireAuth, (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const event = Events.create(parsed.data);
  res.status(201).json(event);
});

eventsRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const event = Events.update(req.params.id, parsed.data);
  if (!event) return res.status(404).json({ error: "Tədbir tapılmadı." });
  res.json(event);
});

eventsRouter.delete("/:id", requireAuth, (req, res) => {
  const ok = Events.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: "Tədbir tapılmadı." });
  res.status(204).send();
});
