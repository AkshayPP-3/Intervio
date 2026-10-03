import { prisma } from "../config/prisma.js";

export const getDashboard = async (userId: string) => {
  // Total interviews
  const totalInterviews = await prisma.interview.count({
    where: {
      userId,
    },
  });

  // Completed interviews
  const completedInterviews = await prisma.interview.count({
    where: {
      userId,
      status: "COMPLETED",
    },
  });

  // In-progress interviews
  const inProgressInterviews = await prisma.interview.count({
    where: {
      userId,
      status: "IN_PROGRESS",
    },
  });

  // Average evaluation score
  const averageScore = await prisma.evaluation.aggregate({
    where: {
      interview: {
        userId,
      },
    },
    _avg: {
      overallScore: true,
    },
  });

  // Best evaluation score
  const bestScore = await prisma.evaluation.aggregate({
    where: {
      interview: {
        userId,
      },
    },
    _max: {
      overallScore: true,
    },
  });

  // Recent interviews
  const recentInterviews = await prisma.interview.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    select: {
      id: true,
      title: true,
      role: true,
      difficulty: true,
      language: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Recent evaluations
  const recentEvaluations = await prisma.evaluation.findMany({
    where: {
      interview: {
        userId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    select: {
      id: true,
      interviewId: true,
      overallScore: true,
      technicalScore: true,
      communicationScore: true,
      confidenceScore: true,
      feedback: true,
      strengths: true,
      weaknesses: true,
      createdAt: true,
    },
  });

  return {
    stats: {
      totalInterviews,
      completedInterviews,
      inProgressInterviews,
      averageScore: averageScore._avg.overallScore,
      bestScore: bestScore._max.overallScore,
    },
    recentInterviews,
    recentEvaluations,
  };
};