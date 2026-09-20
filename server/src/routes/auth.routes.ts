import { Router } from "express";
import validate from "../middleware/validate.middleware";
import authController from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { register } from "node:module";

const router = Router();

router.post(
    "/register",
    validate(registerSchema),
    authController.register,
)

router.post(
    "/login",
    validate(loginSchema),
    authController.login,
)
export default router;