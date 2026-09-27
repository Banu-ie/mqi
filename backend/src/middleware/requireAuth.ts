import { Request, Response, NextFunction } from "express";
import { verifyAdminToken, AdminTokenPayload } from "../lib/auth";
import { Admins, AdminSessions } from "../db/models";

export interface AuthedRequest extends Request {
  admin?: AdminTokenPayload;
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Giriş tələb olunur." });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAdminToken(token);
    const admin = await Admins.findById(payload.sub);
    if (!admin || admin.tokenVersion !== payload.tokenVersion) {
      return res
        .status(401)
        .json({ error: "Sessiya ləğv edilib. Yenidən daxil olun." });
    }
    if (!(await AdminSessions.touchIfActive(payload.sid, payload.sub))) {
      return res
        .status(401)
        .json({ error: "Sessiyanın vaxtı bitib. Yenidən daxil olun." });
    }
    req.admin = payload;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Sessiya etibarsızdır. Yenidən daxil olun." });
  }
}

/**
 * True when the request carries a valid admin token. Unlike requireAuth this
 * never rejects, so it can gate *parts* of an otherwise public endpoint.
 */
export function hasValidAdminToken(req: Request): boolean {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return false;
  try {
    verifyAdminToken(header.slice("Bearer ".length));
    return true;
  } catch {
    return false;
  }
}
