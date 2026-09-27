import { Router } from "express";
import {
  createContact,
  deleteContact,
  getContactCount,
  getContacts,
} from "../controllers/contact.controller";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateUuidParam } from "../middleware/validateUuidParam";
export const contactRouter = Router();
contactRouter.post("/", asyncHandler(createContact));
contactRouter.get("/", requireAuth, asyncHandler(getContacts));
contactRouter.get("/count", requireAuth, asyncHandler(getContactCount));
contactRouter.delete(
  "/:id",
  validateUuidParam,
  requireAuth,
  asyncHandler(deleteContact),
);
