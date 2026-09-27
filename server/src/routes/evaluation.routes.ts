// src/routes/evaluation.routes.ts

import { Router } from "express";

import {
  createEvaluationController,
  getEvaluationByInterviewController,
  getEvaluationByIdController,
} from "../controllers/evaluation.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const evaluationRouter = Router();

evaluationRouter.post(
  "/",
  authMiddleware,
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