// VITE_API_URL is baked in at build time. In development we fall back to the
// local backend; in a production build we fall back to a same-origin /api so a
// misconfigured deploy cannot end up pointing browsers at localhost. Vite
// statically replaces import.meta.env.DEV, so the localhost literal is dropped
// from the production bundle entirely.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:4000/api" : "/api");

// Uploaded images are served from the backend root, not under /api. With the
// same-origin fallback this correctly resolves to a root-relative path.
export const resolveMediaUrl = (value: string) =>
  value.startsWith("/") ? `${API_BASE_URL.replace(/\/api\/?$/, "")}${value}` : value;
const TOKEN_KEY = "mqicma_admin_token";

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = "ApiError"; }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

interface RequestOptions { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown; auth?: boolean; }
export async function apiRequest<T>(path: string, { method = "GET", body, auth = false }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let response: Response;
  try { response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body) }); }
  catch { throw new ApiError("Serverə qoşulmaq mümkün olmadı. İnternet bağlantınızı yoxlayın.", 0); }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  let data: unknown = null;
  if (text) { try { data = JSON.parse(text); } catch { /* handled as an API error below */ } }
  if (!response.ok) {
    if (auth && response.status === 401) clearToken();
    throw new ApiError((data as { error?: string } | null)?.error || "Naməlum xəta baş verdi.", response.status);
  }
  return data as T;
}
