import type { Request, Response } from "express";
import { z } from "zod";
import { Events } from "../db/models";

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Başlıq tələb olunur."),

  date: z
    .string()
    .refine(isValidDate, "Tarix düzgün deyil."),

  location: z
    .string()
    .trim()
    .min(1, "Məkan tələb olunur."),

  shortDesc: z
    .string()
    .trim()
    .min(1, "Qısa təsvir tələb olunur."),

  fullDesc: z
    .string()
    .default(""),

  image: z
    .string()
    .url("Şəkil düzgün URL olmalıdır.")
    .or(z.literal("")),

  status: z
    .enum(["upcoming", "past"])
    .default("upcoming"),
});

export function getEvents(req: Request, res: Response) {
  const status =
    req.query.status === "upcoming" || req.query.status === "past"
      ? req.query.status
      : undefined;
  return res.json(Events.list(status));
}
export function getEventById(req: Request, res: Response) {
  const event = Events.get(req.params.id);
  if (!event) return res.status(404).json({ error: "Tədbir tapılmadı." });
  return res.json(event);
}
export function createEvent(req: Request, res: Response) {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  return res.status(201).json(Events.create(parsed.data));
}
export function updateEvent(req: Request, res: Response) {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const event = Events.update(req.params.id, parsed.data);
  if (!event) return res.status(404).json({ error: "Tədbir tapılmadı." });
  return res.json(event);
}
export function deleteEvent(req: Request, res: Response) {
  if (!Events.remove(req.params.id))
    return res.status(404).json({ error: "Tədbir tapılmadı." });
  return res.status(204).send();
}
