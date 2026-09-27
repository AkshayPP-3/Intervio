// src/services/interview/evaluation.service.ts

import {prisma} from "../../config/prisma.js";
import appError from "../../utils/appError.js";

interface CreateEvaluationData {
  interviewId: string;
  overallScore?: number | undefined;
  technicalScore?: number | undefined;
  communicationScore?: number | undefined;
  confidenceScore?: number | undefined;
  feedback?: string | undefined;
  strengths?: string | undefined;
  weaknesses?: string | undefined;
}

export const createEvaluation = async (
  data: CreateEvaluationData
) => {
  const interview = await prisma.interview.findUnique({
    where: {
      id: data.interviewId,
    },
  });
  if (!interview) {
    throw new appError("Interview not found", 404);
  }
  const existingEvaluation = await prisma.evaluation.findUnique({
    where: {
      interviewId: data.interviewId,
    },
  });
  if (existingEvaluation) {
    throw new appError(
      "Evaluation already exists for this interview",
      409
    );
  }
  const evaluation = await prisma.evaluation.create({
    data: {
      interviewId: data.interviewId,

      ...(data.overallScore !== undefined && {
        overallScore: data.overallScore,
      }),

      ...(data.technicalScore !== undefined && {
        technicalScore: data.technicalScore,
      }),

      ...(data.communicationScore !== undefined && {
        communicationScore: data.communicationScore,
      }),

      ...(data.confidenceScore !== undefined && {
        confidenceScore: data.confidenceScore,
      }),

      ...(data.feedback !== undefined && {
        feedback: data.feedback,
      }),

      ...(data.strengths !== undefined && {
        strengths: data.strengths,
      }),

      ...(data.weaknesses !== undefined && {
        weaknesses: data.weaknesses,
      }),
    },
  });
  return evaluation;
};
export const getEvaluationByInterview = async (
  interviewId: string
) => {
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      interviewId,
    },
  });
  if (!evaluation) {
    throw new appError("Evaluation not found", 404);
  }
  return evaluation;
};
export const getEvaluationById = async (
  evaluationId: string
) => {
  const evaluation = await prisma.evaluation.findUnique({
    where: {
      id: evaluationId,
    },
  });
  if (!evaluation) {
    throw new appError("Evaluation not found", 404);
  }
  return evaluation;
};