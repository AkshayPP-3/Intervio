import { Router } from "express";
import {
  evaluatePracticeAnswers,
  generatePracticeQuestions,
} from "../controllers/practice.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { aiRateLimiter } from "../middleware/rateLimit.niddleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  evaluatePracticeAnswersSchema,
  generatePracticeQuestionsSchema,
} from "../schemas/practice.schema.js";

const practiceRouter = Router();

practiceRouter.use(authMiddleware);

practiceRouter.post(
  "/questions",
  validate(generatePracticeQuestionsSchema),
  aiRateLimiter,
  generatePracticeQuestions,
);

practiceRouter.post(
  "/evaluate",
  validate(evaluatePracticeAnswersSchema),
  aiRateLimiter,
  evaluatePracticeAnswers,
);

export default practiceRouter;
