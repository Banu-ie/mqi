import type { Request } from "express";

/** Turnstile is opt-in until its server secret is configured in production. */
export async function verifyTurnstile(token: unknown, req: Request): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || token.length < 1 || token.length > 2048)
    return false;

  const body = new URLSearchParams({ secret, response: token });
  const remoteIp = req.ip;
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body, signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
