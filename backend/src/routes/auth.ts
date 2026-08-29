import { Router } from "express";
import { getMe, login } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
export const authRouter = Router();
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, getMe);
