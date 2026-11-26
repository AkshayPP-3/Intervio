import {prisma} from "../../config/prisma.js";
import appError from "../../utils/appError.js";
import { reactToInterviewAnswer } from "../ai/gemini.service.js";

interface CreateAnswerData {
  questionId: string;
  answerText?: string | undefined;
  audioUrl?: string | undefined;
  userId?: string | undefined;
}

const SKIP_ANSWER_TEXT = "I would like to skip this question.";

export const createAnswer = async (data: CreateAnswerData) => {
  const question = await prisma.question.findUnique({
    where: {
      id: data.questionId,
    },
    include: {
      interview: {
        include: {
          questions: {
            select: {
              id: true,
              answer: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!question || (data.userId && question.interview.userId !== data.userId)) {
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

  const remainingUnanswered = question.interview.questions.filter(
    (q) => q.id !== question.id && q.answer === null
  ).length;
  const isLastQuestion = remainingUnanswered === 0;

  let reaction: string | null = null;
  const text = data.answerText?.trim();
  if (text) {
    if (text === SKIP_ANSWER_TEXT) {
      reaction = isLastQuestion
        ? "No problem at all. Let's wrap up and review your evaluation."
        : "No problem at all. Let's move on to the next question.";
    } else {
      reaction = await reactToInterviewAnswer({
        role: question.interview.role,
        difficulty: question.interview.difficulty,
        candidateLanguage: question.interview.language,
        questionText: question.questionText,
        answerText: text,
        isLastQuestion,
      });
    }
  }

  return {
    ...answer,
    reaction,
  };
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