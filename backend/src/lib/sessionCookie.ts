import type { CookieOptions, Response } from "express";

export const ADMIN_COOKIE = "mqicma_admin";
export const ADMIN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api",
  maxAge: 12 * 60 * 60 * 1000,
};

export function clearAdminCookie(res: Response) {
  const { maxAge: _maxAge, ...options } = ADMIN_COOKIE_OPTIONS;
  res.clearCookie(ADMIN_COOKIE, options);
}
