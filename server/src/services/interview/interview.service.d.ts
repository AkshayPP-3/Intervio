interface CreateInterviewData {
    title: string;
    role: string;
    difficulty?: string;
    language?: string;
}
export declare const createInterview: (userId: string, data: CreateInterviewData) => Promise<{
    interview: {
        id: string;
        userId: string;
        title: string;
        role: string;
        difficulty: string | null;
        language: string | null;
        status: import("../../../generated/prisma/enums").InterviewStatus;
        createdAt: Date;
        updatedAt: Date;
    };
    questionsCreated: number;
}>;
export declare const getInterviewById: (userId: string, interviewId: string) => Promise<{
    evaluation: {
        id: string;
        interviewId: string;
        overallScore: number | null;
        technicalScore: number | null;
        communicationScore: number | null;
        confidenceScore: number | null;
        feedback: string | null;
        strengths: string | null;
        weaknesses: string | null;
        createdAt: Date;
    } | null;
    questions: {
        id: string;
        interviewId: string;
        questionText: string;
        questionType: string | null;
        order: number;
        createdAt: Date;
    }[];
} & {
    id: string;
    userId: string;
    title: string;
    role: string;
    difficulty: string | null;
    language: string | null;
    status: import("../../../generated/prisma/enums").InterviewStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getUserInterviews: (userId: string) => Promise<{
    id: string;
    userId: string;
    title: string;
    role: string;
    difficulty: string | null;
    language: string | null;
    status: import("../../../generated/prisma/enums").InterviewStatus;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const updateInterviewStatus: (userId: string, interviewId: string, status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") => Promise<{
    id: string;
    userId: string;
    title: string;
    role: string;
    difficulty: string | null;
    language: string | null;
    status: import("../../../generated/prisma/enums").InterviewStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deleteInterview: (userId: string, interviewId: string) => Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=interview.service.d.ts.map