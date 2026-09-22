import { Router } from "express";
import validate from "../middleware/validate.middleware";
import authMiddleware from "../middleware/auth.middleware";
import userController from "../controllers/user.controller";
import { updateUserSchema } from "../schemas/user.schema";

const userRouter = Router();

userRouter.get(
    "/me",
    authMiddleware,
    userController.getMe,
)

userRouter.patch(
    "/me",
    validate(updateUserSchema),
    userController.updatedMe,
)