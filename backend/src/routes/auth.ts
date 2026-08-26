import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Admins } from "../db/models";
import { signAdminToken } from "../lib/auth";
import { requireAuth, AuthedRequest } from "../middleware/requireAuth";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Email və şifrə tələb olunur." });
  }
  const { email, password } = parsed.data;
  const admin = Admins.findByEmail(email);
  if (!admin) {
    return res.status(401).json({ error: "Email və ya şifrə yanlışdır." });
  }
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Email və ya şifrə yanlışdır." });
  }
  const token = signAdminToken({ sub: admin.id, email: admin.email, role: admin.role });
  return res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const admin = Admins.findById(req.admin!.sub);
  if (!admin) return res.status(401).json({ error: "İstifadəçi tapılmadı." });
  return res.json({ admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
});
