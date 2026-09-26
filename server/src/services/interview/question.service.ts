import {prisma} from "../../config/prisma.js";
import appError from "../../utils/appError.js";

interface CreateQuestionData {
  interviewId: string;
  questionText: string;
  questionType?: string | undefined;
  order: number;
}

export const createQuestion = async (data: CreateQuestionData) => {
  const interview = await prisma.interview.findUnique({
    where: {
      id: data.interviewId,
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
export const getQuestionsByInterview = async (interviewId: string) => {
  const interview = await prisma.interview.findUnique({
    where: {
      id: interviewId,
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

export const getQuestionById = async (questionId: string) => {
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });

  if (!question) {
    throw new appError("Question not found", 404);
  }

  return question;
};