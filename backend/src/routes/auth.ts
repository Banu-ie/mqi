import { Router } from "express";
import { getMe, login, logout } from "../controllers/auth.controller";
import { requireAdmin } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
export const authRouter = Router();
authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", requireAdmin, asyncHandler(getMe));
authRouter.post("/logout", requireAdmin, asyncHandler(logout));
