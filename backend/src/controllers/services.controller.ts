import type { Request, Response } from "express";
import { z } from "zod";
import { AuditLogs, Services } from "../db/models";
import type { AuthedRequest } from "../middleware/requireAuth";
import { storeUpload } from "../lib/imageStore";
import { imageRef } from "../lib/imageRef";

const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Xidmət adı tələb olunur.")
    .max(200, "Xidmət adı çox uzundur."),
  description: z
    .string()
    .trim()
    .min(1, "Qısa təsvir tələb olunur.")
    .max(2_000, "Qısa təsvir çox uzundur."),
  fullDesc: z.string().max(10_000, "Tam təsvir çox uzundur.").default(""),
  image: imageRef,
  forWhom: z.string().max(1_000, "Auditoriya təsviri çox uzundur.").default(""),
  benefits: z.preprocess(
    (value) =>
      typeof value === "string"
        ? value
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
        : value,
    z
      .array(z.string().max(500, "Üstünlük çox uzundur."))
      .max(20, "Çox sayda üstünlük var.")
      .default([]),
  ),
  status: z.enum(["active", "inactive"]).default("active"),
});

function serialize(service: Awaited<ReturnType<typeof Services.get>> | null) {
  if (!service) return service;
  try {
    const benefits = JSON.parse(service.benefits);
    return { ...service, benefits: Array.isArray(benefits) ? benefits : [] };
  } catch {
    return { ...service, benefits: [] };
  }
}
/**
 * The image this request is asking for, storing an uploaded file in the
 * database on the way past (see middleware/upload). Call it once per request:
 * it writes, so calling it twice would store the same picture twice.
 */
async function imageValue(req: Request, fallback = "") {
  return req.file
    ? storeUpload("services", req.file)
    : typeof req.body.image === "string"
      ? req.body.image
      : fallback;
}
async function input(req: Request, includeDefaults: boolean) {
  return {
    ...req.body,
    ...(includeDefaults || req.file ? { image: await imageValue(req) } : {}),
  };
}

export async function getServices(req: Request, res: Response) {
  return res.json(
    (await Services.list(req.query.all === "true")).map(serialize),
  );
}
export async function getServiceById(req: Request, res: Response) {
  const service = serialize(await Services.getActive(req.params.id));
  if (!service) return res.status(404).json({ error: "Xidmət tapılmadı." });
  return res.json(service);
}
export async function createService(req: AuthedRequest, res: Response) {
  const parsed = serviceSchema.safeParse(await input(req, true));
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const service = await Services.create(parsed.data);
  await AuditLogs.record(req.admin!.sub, "create", "services", service.id);
  return res.status(201).json(serialize(service));
}
export async function updateService(req: AuthedRequest, res: Response) {
  const parsed = serviceSchema.partial().safeParse(await input(req, false));
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." });
  const updated = await Services.update(req.params.id, parsed.data);
  if (!updated) return res.status(404).json({ error: "Xidmət tapılmadı." });
  await AuditLogs.record(req.admin!.sub, "update", "services", req.params.id);
  return res.json(serialize(updated));
}
export async function deleteService(req: AuthedRequest, res: Response) {
  if (!(await Services.remove(req.params.id)))
    return res.status(404).json({ error: "Xidmət tapılmadı." });
  await AuditLogs.record(req.admin!.sub, "soft_delete", "services", req.params.id);
  return res.status(204).send();
}
