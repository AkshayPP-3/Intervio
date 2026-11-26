import { prisma } from "../../config/prisma.js";
import appError from "../../utils/appError.js";
import {generateInterviewQuestions} from "../ai/gemini.service.js";

interface CreateInterviewData {
  title: string;
  role: string;
  difficulty?: string;
  language?: string;
}

export const createInterview = async (
  userId: string,
  data: CreateInterviewData
) => {
  const interview = await prisma.interview.create({
    data: {
      userId,
      title: data.title,
      role: data.role,

      ...(data.difficulty !== undefined && {
        difficulty: data.difficulty,
      }),

      ...(data.language !== undefined && {
        language: data.language,
      }),
    },
  });

  let generatedQuestions;
  try {
    generatedQuestions = await generateInterviewQuestions({
      role: data.role,
      ...(data.difficulty !== undefined && {
        difficulty: data.difficulty,
      }),
      ...(data.language !== undefined && {
        language: data.language,
      }),
    });
  } catch (error) {
    await prisma.interview.delete({ where: { id: interview.id } }).catch(() => {});
    throw error;
  }

  const questions = await prisma.question.createMany({
    data: generatedQuestions.map((question) => ({
      interviewId: interview.id,
      questionText: question.questionText,
      questionType: question.questionType,
      order: question.order,
    })),
  });

  return {
    interview,
    questionsCreated: questions.count,
  };
};
export const getInterviewById = async (
  userId: string,
  interviewId: string
) => {
  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
      userId,
    },
    include: {
      questions: {
        orderBy: {
          order: "asc",
        },
        include: {
          answer: true,
        },
      },
      evaluation: true,
    },
  });

  if (!interview) {
    throw new appError("Interview not found", 404);
  }

  return interview;
};

export const getUserInterviews = async (userId: string) => {
  const interviews = await prisma.interview.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return interviews;
};

export const updateInterviewStatus = async (
  userId: string,
  interviewId: string,
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
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

  const updatedInterview = await prisma.interview.update({
    where: {
      id: interviewId,
    },
    data: {
      status,
    },
  });

  return updatedInterview;
};

export const deleteInterview = async (
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

  await prisma.interview.delete({
    where: {
      id: interviewId,
    },
  });

  return {
    message: "Interview deleted successfully",
  };
};