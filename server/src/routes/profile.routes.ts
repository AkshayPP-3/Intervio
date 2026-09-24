import { Router } from "express";
import profileController from "../controllers/profile.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const profileRouter = Router();

profileRouter.post(
    "/",
    authMiddleware,
    profileController.createProfile
);