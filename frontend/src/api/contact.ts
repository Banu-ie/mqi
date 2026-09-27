import { apiRequest } from "./client";
import type { ContactMessage, ContactPage } from "./types";
export type ContactInput = Omit<ContactMessage, "id" | "createdAt">;
export const sendContactMessage = (input: ContactInput) =>
  apiRequest<ContactMessage>("/contact", { method: "POST", body: input });
export const listContactMessages = (page = 1) =>
  apiRequest<ContactPage>(`/contact?page=${page}`, { auth: true });
export const countContactMessages = () =>
  apiRequest<{ count: number }>("/contact/count", { auth: true });
export const deleteContactMessage = (id: string) =>
  apiRequest<void>(`/contact/${id}`, { method: "DELETE", auth: true });
