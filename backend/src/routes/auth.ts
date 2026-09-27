import { Router } from "express";
import { getMe, login } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
export const authRouter = Router();
authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", requireAuth, asyncHandler(getMe));
