import type { Request, Response, NextFunction } from "express";

import {
  createAIEvaluation,
  getEvaluationByInterview,
  getEvaluationById,
} from "../services/interview/evaluation.service.js";

import { createEvaluationSchema } from "../schemas/evaluation.schema.js";

import appError from "../utils/appError.js";

export const createEvaluationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createEvaluationSchema.parse(req.body);
    const userId = req.user.userId;
    const evaluation = await createAIEvaluation(
      userId,
      validatedData.interviewId
    );
    res.status(201).json({
      success: true,
      message: "Evaluation created successfully",
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};
export const getEvaluationByInterviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const interviewId = req.params.interviewId;
    if (typeof interviewId !== "string") {
      throw new appError("Invalid interview ID", 400);
    }
    const userId = req.user.userId;
    const evaluation = await getEvaluationByInterview(
      userId,
      interviewId
    );
    res.status(200).json({
      success: true,
      message: "Evaluation fetched successfully",
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};
export const getEvaluationByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const evaluationId = req.params.evaluationId;
    if (typeof evaluationId !== "string") {
      throw new appError("Invalid evaluation ID", 400);
    }
    const userId = req.user.userId;
    const evaluation = await getEvaluationById(
      userId,
      evaluationId
    );
    res.status(200).json({
      success: true,
      message: "Evaluation fetched successfully",
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};