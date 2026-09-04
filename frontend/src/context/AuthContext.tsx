import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "../api/auth";
import { clearToken, getToken, setToken } from "../api/client";
import type { Admin } from "../api/types";

interface AuthContextValue { admin: Admin | null; isLoading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; }
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!getToken()) { setIsLoading(false); return; }
    authApi.me().then(({ admin: currentAdmin }) => setAdmin(currentAdmin)).catch(() => { clearToken(); setAdmin(null); }).finally(() => setIsLoading(false));
  }, []);
  const login = async (email: string, password: string) => { const result = await authApi.login(email, password); setToken(result.token); setAdmin(result.admin); };
  const logout = () => { clearToken(); setAdmin(null); };
  return <AuthContext.Provider value={{ admin, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within an AuthProvider"); return context; }
