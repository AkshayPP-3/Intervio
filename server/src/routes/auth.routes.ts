import { Router } from "express";
import validate from "../middleware/validate.middleware";
import authController from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { authRateLimiter } from "../middleware/rateLimit.niddleware";

const authRouter = Router();

authRouter.post(
    "/register",
    validate(registerSchema),
    authRateLimiter,
    authController.register,
)

authRouter.post(
    "/login",
    validate(loginSchema),
    authRateLimiter,
    authController.login,
)
export default authRouter;