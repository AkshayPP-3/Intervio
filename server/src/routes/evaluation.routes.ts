import { Router } from "express";
import {
  createEvaluationController,
  getEvaluationByInterviewController,
  getEvaluationByIdController,
} from "../controllers/evaluation.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { aiRateLimiter } from "../middleware/rateLimit.niddleware.js";

const evaluationRouter = Router();

evaluationRouter.post(
  "/",
  authMiddleware,
  aiRateLimiter,
  createEvaluationController
);

evaluationRouter.get(
  "/interview/:interviewId",
  authMiddleware,
  getEvaluationByInterviewController
);

evaluationRouter.get(
  "/:evaluationId",
  authMiddleware,
  getEvaluationByIdController
);

export default evaluationRouter;