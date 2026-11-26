import { prisma } from "../config/prisma.js";

export const getDashboard = async (userId: string) => {
  const [statusCounts, scoreAgg, answeredQuestions, recentInterviews, recentEvaluations] =
    await Promise.all([
      prisma.interview.groupBy({
        by: ["status"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.evaluation.aggregate({
        where: {
          interview: { userId },
        },
        _avg: { overallScore: true },
        _max: { overallScore: true },
      }),
      prisma.answer.count({
        where: {
          question: {
            interview: { userId },
          },
        },
      }),
      prisma.interview.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.evaluation.findMany({
        where: {
          interview: { userId },
        },
        orderBy: { createdAt: "desc" },
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
      }),
    ]);

  const countByStatus = new Map(statusCounts.map((row) => [row.status, row._count._all]));
  const completedInterviews = countByStatus.get("COMPLETED") ?? 0;
  const inProgressInterviews = countByStatus.get("IN_PROGRESS") ?? 0;
  const totalInterviews = statusCounts.reduce((sum, row) => sum + row._count._all, 0);

  return {
    stats: {
      totalInterviews,
      completedInterviews,
      inProgressInterviews,
      answeredQuestions,
      averageScore: scoreAgg._avg.overallScore,
      bestScore: scoreAgg._max.overallScore,
    },
    recentInterviews,
    recentEvaluations,
  };
};
