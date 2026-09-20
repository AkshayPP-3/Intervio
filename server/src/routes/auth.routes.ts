import { Router } from "express";
import validate from "../middleware/validate.middleware";
import authController from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const authRouter = Router();

authRouter.post(
    "/register",
    validate(registerSchema),
    authController.register,
)

authRouter.post(
    "/login",
    validate(loginSchema),
    authController.login,
)
export default authRouter;