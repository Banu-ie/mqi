import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Admins, AdminSessions } from "../db/models";
import { signAdminToken } from "../lib/auth";
import type { AuthedRequest } from "../middleware/requireAuth";
import { randomUUID } from "node:crypto";
import { verifyTurnstile } from "../lib/turnstile";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  clearAdminCookie,
} from "../lib/sessionCookie";
const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(1024),
  captchaToken: z.string().max(2048).optional(),
});
const DUMMY_PASSWORD_HASH =
  "$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Email və şifrə tələb olunur." });
  if (!(await verifyTurnstile(parsed.data.captchaToken, req)))
    return res.status(400).json({ error: "CAPTCHA yoxlaması tamamlanmayıb. Yenidən cəhd edin." });
  const admin = await Admins.findByEmail(parsed.data.email);
  const passwordHash = admin?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    passwordHash,
  );
  if (!admin || !passwordMatches) {
    clearAdminCookie(res);
    return res.status(401).json({ error: "Email və ya şifrə yanlışdır." });
  }
  if (Number(admin.passwordHash.slice(4, 6)) < 12) {
    await Admins.updatePasswordHash(admin.id, await bcrypt.hash(parsed.data.password, 12));
  }
  const sessionId = randomUUID();
  await AdminSessions.create(sessionId, admin.id);
  const token = signAdminToken({
    sub: admin.id,
    sid: sessionId,
    email: admin.email,
    role: admin.role,
    tokenVersion: admin.tokenVersion,
  });
  res.cookie(ADMIN_COOKIE, token, ADMIN_COOKIE_OPTIONS);
  return res.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
}
export async function logout(req: AuthedRequest, res: Response) {
  await AdminSessions.revoke(req.admin!.sid);
  await Admins.bumpTokenVersion(req.admin!.sub);
  clearAdminCookie(res);
  return res.status(204).send();
}
export async function getMe(req: AuthedRequest, res: Response) {
  const admin = await Admins.findById(req.admin!.sub);
  if (!admin) return res.status(401).json({ error: "İstifadəçi tapılmadı." });
  return res.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
}
