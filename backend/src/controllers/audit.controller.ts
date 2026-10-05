import type { Request, Response } from "express";
import { AuditLogs } from "../db/models";

export async function getAuditLog(req: Request, res: Response) {
  const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Math.floor(Number(req.query.pageSize) || 50)),
  );
  const [items, total] = await Promise.all([
    AuditLogs.list(page, pageSize),
    AuditLogs.count(),
  ]);
  return res.json({ items, total, page, pageSize });
}
