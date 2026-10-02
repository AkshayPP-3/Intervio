import { prisma } from "../../config/prisma.js";
import appError from "../../utils/appError.js";
import { evaluateInterview } from "../ai/gemini.service.js";

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
  userId: string,
  data: CreateEvaluationData
) => {
  // Check that the interview belongs to the logged-in user
  const interview = await prisma.interview.findFirst({
    where: {
      id: data.interviewId,
      userId,
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
  userId: string,
  interviewId: string
) => {
  const evaluation = await prisma.evaluation.findFirst({
    where: {
      interviewId,
      interview: {
        userId,
      },
    },
  });

  if (!evaluation) {
    throw new appError("Evaluation not found", 404);
  }

  return evaluation;
};

export const getEvaluationById = async (
  userId: string,
  evaluationId: string
) => {
  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id: evaluationId,
      interview: {
        userId,
      },
    },
  });

  if (!evaluation) {
    throw new appError("Evaluation not found", 404);
  }

  return evaluation;
};

export const createAIEvaluation = async (
  userId: string,
  interviewId: string
) => {
  // Get interview only if it belongs to logged-in user
  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
      userId,
    },
    include: {
      questions: {
        include: {
          answer: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!interview) {
    throw new appError("Interview not found", 404);
  }

  // Don't evaluate an already completed interview
  if (interview.status === "COMPLETED") {
    throw new appError(
      "Interview is already completed",
      400
    );
  }

  const existingEvaluation = await prisma.evaluation.findUnique({
    where: {
      interviewId,
    },
  });

  if (existingEvaluation) {
    throw new appError(
      "Evaluation already exists for this interview",
      409
    );
  }

  // Check that every question has an answer
  const unansweredQuestions = interview.questions.filter(
    (question) =>
      !question.answer ||
      !question.answer.answerText ||
      question.answer.answerText.trim() === ""
  );

  if (unansweredQuestions.length > 0) {
    throw new appError(
      "All interview questions must be answered before evaluation",
      400
    );
  }

  // Prepare data for Gemini
  const evaluationData = {
    role: interview.role,
    difficulty: interview.difficulty,
    language: interview.language,

    questions: interview.questions.map((question) => ({
      question: question.questionText,
      answer: question.answer!.answerText!,
    })),
  };

  // Send interview to Gemini
  const result = await evaluateInterview(evaluationData);

  // Save evaluation
  const evaluation = await prisma.evaluation.create({
    data: {
      interviewId: interview.id,

      overallScore: result.overallScore,
      technicalScore: result.technicalScore,
      communicationScore: result.communicationScore,
      confidenceScore: result.confidenceScore,

      feedback: result.feedback,

      strengths: JSON.stringify(result.strengths),
      weaknesses: JSON.stringify(result.weaknesses),
    },
  });

  // Mark interview as completed
  await prisma.interview.update({
    where: {
      id: interview.id,
    },
    data: {
      status: "COMPLETED",
    },
  });

  return evaluation;
};