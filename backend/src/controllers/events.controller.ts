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
  title: z.string().trim().min(1, "Başlıq tələb olunur."),

  date: z.string().refine(isValidDate, "Tarix düzgün deyil."),

  location: z.string().trim().min(1, "Məkan tələb olunur."),

  shortDesc: z.string().trim().min(1, "Qısa təsvir tələb olunur."),

  fullDesc: z.string().default(""),

  image: z
    .string()
    .refine(
      (value) =>
        value === "" ||
        value.startsWith("/uploads/") ||
        /^https?:\/\//i.test(value),
      "Şəkil düzgün deyil.",
    ),

  status: z.enum(["upcoming", "past"]).default("upcoming"),
});

function imageValue(req: Request, fallback = "") {
  return req.file
    ? `/uploads/events/${req.file.filename}`
    : typeof req.body.image === "string"
      ? req.body.image
      : fallback;
}

export async function getEvents(req: Request, res: Response) {
  const status =
    req.query.status === "upcoming" || req.query.status === "past"
      ? req.query.status
      : undefined;
  return res.json(await Events.list(status));
}
export async function getEventById(req: Request, res: Response) {
  const event = await Events.get(req.params.id);
  if (!event) return res.status(404).json({ error: "Tədbir tapılmadı." });
  return res.json(event);
}
export async function createEvent(req: Request, res: Response) {
  const parsed = eventSchema.safeParse({ ...req.body, image: imageValue(req) });
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  return res
    .status(201)
    .json(await Events.create({ ...parsed.data, image: imageValue(req) }));
}
export async function updateEvent(req: Request, res: Response) {
  const parsed = eventSchema
    .partial()
    .safeParse({
      ...req.body,
      ...(req.file ? { image: imageValue(req) } : {}),
    });
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const event = await Events.update(req.params.id, parsed.data);
  if (!event) return res.status(404).json({ error: "Tədbir tapılmadı." });
  return res.json(event);
}
export async function deleteEvent(req: Request, res: Response) {
  if (!(await Events.remove(req.params.id)))
    return res.status(404).json({ error: "Tədbir tapılmadı." });
  return res.status(204).send();
}
