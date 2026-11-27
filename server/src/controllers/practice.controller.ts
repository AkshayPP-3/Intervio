import type { Request, Response } from "express";
import {
  evaluatePracticeAnswersSchema,
  generatePracticeQuestionsSchema,
} from "../schemas/practice.schema.js";
import * as practiceService from "../services/practice.service.js";
import appError from "../utils/appError.js";

export const generatePracticeQuestions = async (
  req: Request,
  res: Response,
) => {
  if (!req.user?.userId) {
    throw new appError("Authentication required", 401);
  }

  const { topic, count } = generatePracticeQuestionsSchema.parse(req.body);
  const questions = await practiceService.generatePracticeQuestions(topic, count);

  res.status(200).json({
    success: true,
    data: {
      questions: questions.map((item, index) => ({
        id: String(index + 1),
        question: item.question,
      })),
    },
  });
};

export const evaluatePracticeAnswers = async (
  req: Request,
  res: Response,
) => {
  if (!req.user?.userId) {
    throw new appError("Authentication required", 401);
  }

  const { topic, qa } = evaluatePracticeAnswersSchema.parse(req.body);
  const results = await practiceService.evaluatePracticeAnswers(topic, qa);

  res.status(200).json({
    success: true,
    data: { results },
  });
};
