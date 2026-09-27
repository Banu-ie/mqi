import { Router } from "express";
import { createContact, getContacts } from "../controllers/contact.controller";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
export const contactRouter = Router();
contactRouter.post("/", asyncHandler(createContact));
contactRouter.get("/", requireAuth, asyncHandler(getContacts));
