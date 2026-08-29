import { Router } from "express";
import { getContent, updateContent } from "../controllers/content.controller";
import { requireAuth } from "../middleware/requireAuth";
export const contentRouter = Router();
contentRouter.get("/", getContent);
contentRouter.put("/", requireAuth, updateContent);
