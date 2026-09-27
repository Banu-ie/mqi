import { Router } from "express";
import {
  createContact,
  deleteContact,
  getContactCount,
  getContacts,
} from "../controllers/contact.controller";
import { requireAdmin } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateUuidParam } from "../middleware/validateUuidParam";
export const contactRouter = Router();
contactRouter.post("/", asyncHandler(createContact));
contactRouter.get("/", requireAdmin, asyncHandler(getContacts));
contactRouter.get("/count", requireAdmin, asyncHandler(getContactCount));
contactRouter.delete(
  "/:id",
  validateUuidParam,
  requireAdmin,
  asyncHandler(deleteContact),
);
