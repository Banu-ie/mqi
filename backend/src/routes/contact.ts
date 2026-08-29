import { Router } from "express";
import { createContact, getContacts } from "../controllers/contact.controller";
import { requireAuth } from "../middleware/requireAuth";
export const contactRouter = Router();
contactRouter.post("/", createContact);
contactRouter.get("/", requireAuth, getContacts);
