import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Admins } from "../db/models";
import { signAdminToken } from "../lib/auth";
import type { AuthedRequest } from "../middleware/requireAuth";
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const DUMMY_PASSWORD_HASH =
  "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Email və şifrə tələb olunur." });
  const admin = await Admins.findByEmail(parsed.data.email);
  const passwordHash = admin?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    passwordHash,
  );
  if (!admin || !passwordMatches)
    return res.status(401).json({ error: "Email və ya şifrə yanlışdır." });
  const token = signAdminToken({
    sub: admin.id,
    email: admin.email,
    role: admin.role,
  });
  return res.json({
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
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
