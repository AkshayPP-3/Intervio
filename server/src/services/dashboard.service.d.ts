export declare const getDashboard: (userId: string) => Promise<{
    stats: {
        totalInterviews: number;
        completedInterviews: number;
        inProgressInterviews: number;
        averageScore: number | null;
        bestScore: number | null;
    };
    recentInterviews: {
        createdAt: Date;
        difficulty: string | null;
        id: string;
        language: string | null;
        role: string;
        status: import("../../generated/prisma/enums.js").InterviewStatus;
        title: string;
        updatedAt: Date;
    }[];
    recentEvaluations: {
        communicationScore: number | null;
        confidenceScore: number | null;
        createdAt: Date;
        feedback: string | null;
        id: string;
        interviewId: string;
        overallScore: number | null;
        strengths: string | null;
        technicalScore: number | null;
        weaknesses: string | null;
    }[];
}>;
//# sourceMappingURL=dashboard.service.d.ts.map