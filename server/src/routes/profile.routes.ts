import { Router } from "express";
import profileController from "../controllers/profile.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const profileRouter = Router();

profileRouter.post(
    "/",
    authMiddleware,
    profileController.createProfile
);
profileRouter.get(
    "/",
    authMiddleware,
    profileController.getProfile
);
profileRouter.patch(
    "/",
    authMiddleware,
    profileController.updateProfile
);
profileRouter.delete(
    "/",
    authMiddleware,
    profileController.deleteProfile
);

export default profileRouter;