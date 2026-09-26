import type { Request, Response, NextFunction } from "express";
import * as interviewService from "../services/interview/interview.service.js";
import appError from "../utils/appError.js";

export const createInterview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const interview = await interviewService.createInterview(
      userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { interviewId } = req.params;
    if (!interviewId || Array.isArray(interviewId)) {
        throw new appError("Invalid interview ID", 400);
    }
    const interview = await interviewService.getInterviewById(
      userId,
      interviewId
    );
    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserInterviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const interviews = await interviewService.getUserInterviews(userId);

    res.status(200).json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInterviewStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { interviewId } = req.params;
    const { status } = req.body;
    if (!interviewId || Array.isArray(interviewId)) {
        throw new appError("Invalid interview ID", 400);
    }
    const interview = await interviewService.updateInterviewStatus(
      userId,
      interviewId,
      status
    );

    res.status(200).json({
      success: true,
      message: "Interview status updated successfully",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInterview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { interviewId } = req.params;
    if (!interviewId || Array.isArray(interviewId)) {
        throw new appError("Invalid interview ID", 400);
    }
    const result = await interviewService.deleteInterview(
      userId,
      interviewId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};