import { apiRequest } from "./client";
import type { Admin } from "./types";
export interface LoginResponse { admin: Admin; }
export const login = (email: string, password: string, captchaToken?: string) => apiRequest<LoginResponse>("/auth/login", { method: "POST", body: { email, password, captchaToken } });
export const me = () => apiRequest<{ admin: Admin }>("/auth/me", { auth: true });
export const logout = () => apiRequest<void>("/auth/logout", { method: "POST", auth: true });
