import type { Request, Response, NextFunction } from "express";
import {
  createQuestion,
  getQuestionsByInterview,
  getQuestionById,
} from "../services/interview/question.service.js";
import appError from "../utils/appError.js";
import { createQuestionSchema } from "../schemas/question.schema.js";

export const createQuestionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createQuestionSchema.parse(req.body);

    const question = await createQuestion(validatedData);

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsByInterviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const interviewId = req.params.interviewId;

    if (typeof interviewId !== "string") {
      throw new appError("Invalid interview ID", 400);
    }

    const questions = await getQuestionsByInterview(interviewId);

    res.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { questionId } = req.params;

    if (!questionId || Array.isArray(questionId)) {
      throw new appError("Invalid question ID", 400);
    }

    const question = await getQuestionById(questionId);

    res.status(200).json({
      success: true,
      message: "Question fetched successfully",
      data: question,
    });
  } catch (error) {
    next(error);
  }
};
