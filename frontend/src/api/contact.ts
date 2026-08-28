import { apiRequest } from "./client";
import type { ContactMessage } from "./types";
export type ContactInput = Omit<ContactMessage, "id" | "createdAt">;
export const sendContactMessage = (input: ContactInput) => apiRequest<ContactMessage>("/contact", { method: "POST", body: input });
export const listContactMessages = () => apiRequest<ContactMessage[]>("/contact", { auth: true });
