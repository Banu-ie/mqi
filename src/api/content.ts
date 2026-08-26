import { apiRequest } from "./client";
import type { SiteContent } from "./types";
export const getContent = () => apiRequest<SiteContent>("/content");
export const updateContent = (input: Partial<SiteContent>) => apiRequest<SiteContent>("/content", { method: "PUT", body: input, auth: true });
