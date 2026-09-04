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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Admin girişi (email + şifrə)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       200:
 *         description: Giriş uğurludur, JWT token qaytarılır
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 *       400:
 *         description: Email və ya şifrə göndərilməyib
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Email və ya şifrə yanlışdır
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Email və şifrə tələb olunur." });
  }
  const { email, password } = parsed.data;
  const admin = await Admins.findByEmail(email);
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

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Cari daxil olmuş admin haqqında məlumat
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Admin məlumatı
 *       401:
 *         description: Token yoxdur, etibarsızdır və ya istifadəçi tapılmadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const admin = await Admins.findById(req.admin!.sub);
  if (!admin) return res.status(401).json({ error: "İstifadəçi tapılmadı." });
  return res.json({ admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
});
