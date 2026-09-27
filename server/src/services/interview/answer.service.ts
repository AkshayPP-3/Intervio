import {prisma} from "../../config/prisma.js";
import appError from "../../utils/appError.js";

interface CreateAnswerData {
  questionId: string;
  answerText?: string | undefined;
  audioUrl?: string | undefined;
}

export const createAnswer = async (data: CreateAnswerData) => {
  const question = await prisma.question.findUnique({
    where: {
      id: data.questionId,
    },
  });

  if (!question) {
    throw new appError("Question not found", 404);
  }

  const existingAnswer = await prisma.answer.findUnique({
    where: {
      questionId: data.questionId,
    },
  });

  if (existingAnswer) {
    throw new appError("Answer already exists for this question", 409);
  }

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
export const getAnswerByQuestion = async (questionId: string) => {
  const answer = await prisma.answer.findUnique({
    where: {
      questionId,
    },
  });

  if (!answer) {
    throw new appError("Answer not found", 404);
  }

  return answer;
};

export const getAnswerById = async (answerId: string) => {
  const answer = await prisma.answer.findUnique({
    where: {
      id: answerId,
    },
  });

  if (!answer) {
    throw new appError("Answer not found", 404);
  }

  return answer;
};