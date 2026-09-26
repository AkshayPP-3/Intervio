import { Router } from "express";
import {
  createQuestionController,
  getQuestionsByInterviewController,
  getQuestionByIdController,
} from "../controllers/question.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const questionRouter = Router();

questionRouter.post(
  "/",
  authMiddleware,
  createQuestionController
);

questionRouter.get(
  "/interview/:interviewId",
  authMiddleware,
  getQuestionsByInterviewController
);

questionRouter.get(
  "/:questionId",
  authMiddleware,
  getQuestionByIdController
);

export default questionRouter;