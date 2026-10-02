import { prisma } from "../config/prisma.js";
import appError from "../utils/appError.js";

interface CreateAnswerData {
  questionId: string;
  answerText?: string | undefined;
  audioUrl?: string | undefined;
}

export const createAnswer = async (
  userId: string,
  data: CreateAnswerData
) => {
  // Check that the question belongs to an interview
  // owned by the logged-in user
  const question = await prisma.question.findFirst({
    where: {
      id: data.questionId,
      interview: {
        userId,
      },
    },
  });

  if (!question) {
    throw new appError("Question not found", 404);
  }

  // Check whether an answer already exists
  const existingAnswer = await prisma.answer.findUnique({
    where: {
      questionId: data.questionId,
    },
  });

  if (existingAnswer) {
    throw new appError(
      "Answer already exists for this question",
      409
    );
  }

  // Create answer
  const answer = await prisma.answer.create({
    data: {
      questionId: data.questionId,

      ...(data.answerText !== undefined && {
        answerText: data.answerText,
      }),

      ...(data.audioUrl !== undefined && {
        audioUrl: data.audioUrl,
      }),
    },
  });

  return answer;
};

export const getAnswerByQuestion = async (
  userId: string,
  questionId: string
) => {
  const answer = await prisma.answer.findFirst({
    where: {
      questionId,
      question: {
        interview: {
          userId,
        },
      },
    },
  });

  if (!answer) {
    throw new appError("Answer not found", 404);
  }

  return answer;
};

export const getAnswerById = async (
  userId: string,
  answerId: string
) => {
  const answer = await prisma.answer.findFirst({
    where: {
      id: answerId,
      question: {
        interview: {
          userId,
        },
      },
    },
  });

  if (!answer) {
    throw new appError("Answer not found", 404);
  }

  return answer;
};