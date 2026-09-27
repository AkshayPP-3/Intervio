import { Router } from "express";
import {
  createAnswerController,
  getAnswerByQuestionController,
  getAnswerByIdController,
} from "../controllers/answer.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const answerRouter = Router();
answerRouter.post(
  "/",
  authMiddleware,
  createAnswerController
);

answerRouter.get(
  "/question/:questionId",
  authMiddleware,
  getAnswerByQuestionController
);

answerRouter.get(
  "/:answerId",
  authMiddleware,
  getAnswerByIdController
);

export default answerRouter;