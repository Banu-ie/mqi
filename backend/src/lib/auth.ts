import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not set. Copy backend/.env.example to backend/.env and set a value."
  );
}

export interface AdminTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "12h" });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as AdminTokenPayload;
}
