import type { RequestHandler } from "express";
import { z } from "zod";

const uuidParam = z.object({ id: z.string().uuid() });

export const validateUuidParam: RequestHandler = (req, res, next) => {
  const result = uuidParam.safeParse(req.params);
  if (!result.success) return res.status(400).json({ error: "ID yanlışdır." });
  next();
};
