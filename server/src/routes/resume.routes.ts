import { Router } from "express";
import resumeController from "../controllers/resume.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const resumeRouter = Router();

resumeRouter.post(
    "/",
    authMiddleware,
    resumeController.createResume,
);

resumeRouter.get(
    "/",
    authMiddleware,
    resumeController.getResumes,
);

resumeRouter.get(
    "/:resumeId",
    authMiddleware,
    resumeController.getResume,
);

resumeRouter.patch(
    "/:resumeId",
    authMiddleware,
    resumeController.updateResume,
);

resumeRouter.delete(
    "/:resumeId",
    authMiddleware,
    resumeController.deleteResume,
);

export default resumeRouter;