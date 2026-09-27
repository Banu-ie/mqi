import { Request, Response, NextFunction, type RequestHandler } from "express";
import { verifyAdminToken, AdminTokenPayload } from "../lib/auth";
import { Admins, AdminSessions } from "../db/models";
import { ADMIN_COOKIE, clearAdminCookie } from "../lib/sessionCookie";

function cookieValue(header: string | undefined, name: string): string | undefined {
  for (const part of header?.split(";") ?? []) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    return part.slice(separator + 1).trim();
  }
  return undefined;
}

function allowedOrigins(): Set<string> {
  const configured = [
    process.env.PUBLIC_ORIGIN,
    ...(process.env.CORS_ORIGIN ?? "").split(","),
    ...(process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:5173", "http://localhost:4173", "http://localhost:8443"]),
  ];
  return new Set(
    configured.flatMap((value) => {
      if (!value?.trim()) return [];
      try {
        return [new URL(value.trim()).origin];
      } catch {
        return [];
      }
    }),
  );
}

export interface AuthedRequest extends Request {
  admin?: AdminTokenPayload;
}

export function authorize(...roles: string[]): RequestHandler {
  return (req, res, next) => {
    const admin = (req as AuthedRequest).admin;
    if (!admin) return res.status(401).json({ error: "Giriş tələb olunur." });
    if (!roles.includes(admin.role)) {
      return res.status(403).json({ error: "Bu əməliyyat üçün icazə yoxdur." });
    }
    next();
  };
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  return requireAuth(req, res, (error?: unknown) => {
    if (error) return next(error);
    return authorize("admin")(req, res, next);
  });
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = cookieValue(req.headers.cookie, ADMIN_COOKIE);
  if (!token) {
    clearAdminCookie(res);
    return res.status(401).json({ error: "Giriş tələb olunur." });
  }

  const origin = req.get("origin");
  let originIsAllowed = true;
  if (origin) {
    try {
      originIsAllowed = allowedOrigins().has(new URL(origin).origin);
    } catch {
      originIsAllowed = false;
    }
  }
  if (
    (req.get("sec-fetch-site") === "cross-site" ||
      !originIsAllowed) &&
    req.method !== "GET" &&
    req.method !== "HEAD"
  ) {
    return res.status(403).json({ error: "Sorğunun mənşəyinə icazə verilmir." });
  }

  try {
    const payload = verifyAdminToken(token);
    const admin = await Admins.findById(payload.sub);
    if (!admin || admin.tokenVersion !== payload.tokenVersion) {
      clearAdminCookie(res);
      return res
        .status(401)
        .json({ error: "Sessiya ləğv edilib. Yenidən daxil olun." });
    }
    if (!(await AdminSessions.touchIfActive(payload.sid, payload.sub))) {
      clearAdminCookie(res);
      return res
        .status(401)
        .json({ error: "Sessiyanın vaxtı bitib. Yenidən daxil olun." });
    }
    req.admin = payload;
    next();
  } catch {
    clearAdminCookie(res);
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
  const token = cookieValue(req.headers.cookie, ADMIN_COOKIE);
  if (!token) return false;
  try {
    verifyAdminToken(token);
    return true;
  } catch {
    return false;
  }
}
