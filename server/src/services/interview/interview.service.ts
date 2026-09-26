import { prisma } from "../../config/prisma";
import appError from "../../utils/appError.js";

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

  return interview;
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
      questions: true,
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