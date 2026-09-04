import { Request, Response, NextFunction } from "express";
import { verifyAdminToken, AdminTokenPayload } from "../lib/auth";

export interface AuthedRequest extends Request {
  admin?: AdminTokenPayload;
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Giriş tələb olunur." });
  }

  const token = header.slice("Bearer ".length);

  try {
    req.admin = verifyAdminToken(token);
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
