import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

declare global {
  namespace Express {
    interface Request { requestId: string; }
  }
}

export const requestId: RequestHandler = (req, res, next) => {
  const supplied = req.get("X-Request-Id");
  const id = supplied && /^[A-Za-z0-9._:-]{1,128}$/.test(supplied) ? supplied : randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};