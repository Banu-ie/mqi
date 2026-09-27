import { Router } from "express";
import { getContent, updateContent } from "../controllers/content.controller";
import { requireAdmin } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
export const contentRouter = Router();
contentRouter.get("/", asyncHandler(getContent));
contentRouter.put("/", requireAdmin, asyncHandler(updateContent));
