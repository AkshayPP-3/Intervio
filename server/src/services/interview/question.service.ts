import { prisma } from "../../config/prisma.js";
import appError from "../../utils/appError.js";

interface CreateQuestionData {
  interviewId: string;
  questionText: string;
  questionType?: string | undefined;
  order: number;
}

export const createQuestion = async (
  userId: string,
  data: CreateQuestionData
) => {
  const interview = await prisma.interview.findFirst({
    where: {
      id: data.interviewId,
      userId,
    },
  });

  if (!interview) {
    throw new appError("Interview not found", 404);
  }

  const question = await prisma.question.create({
    data: {
      interviewId: data.interviewId,
      questionText: data.questionText,
      order: data.order,

      ...(data.questionType !== undefined && {
        questionType: data.questionType,
      }),
    },
  });

  return question;
};

export const getQuestionsByInterview = async (
  userId: string,
  interviewId: string
) => {
  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
      userId,
    },
  });

  if (!interview) {
    throw new appError("Interview not found", 404);
  }

  const questions = await prisma.question.findMany({
    where: {
      interviewId,
    },
    orderBy: {
      order: "asc",
    },
  });

  return questions;
};

export const getQuestionById = async (
  userId: string,
  questionId: string
) => {
  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      interview: {
        userId,
      },
    },
  });

  if (!question) {
    throw new appError("Question not found", 404);
  }

  return question;
};