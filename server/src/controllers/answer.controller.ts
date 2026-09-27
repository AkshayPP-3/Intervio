import type { Request, Response, NextFunction } from "express";

import {
  createAnswer,
  getAnswerByQuestion,
  getAnswerById,
} from "../services/interview/answer.service.js";

import { createAnswerSchema } from "../schemas/answer.schema.js";

import appError from "../utils/appError.js";

export const createAnswerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createAnswerSchema.parse(req.body);

    const answer = await createAnswer(validatedData);

    res.status(201).json({
      success: true,
      message: "Answer created successfully",
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};