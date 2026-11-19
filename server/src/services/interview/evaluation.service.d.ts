interface CreateEvaluationData {
    interviewId: string;
    overallScore?: number | undefined;
    technicalScore?: number | undefined;
    communicationScore?: number | undefined;
    confidenceScore?: number | undefined;
    feedback?: string | undefined;
    strengths?: string | undefined;
    weaknesses?: string | undefined;
}
export declare const createEvaluation: (userId: string, data: CreateEvaluationData) => Promise<{
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
}>;
export declare const getEvaluationByInterview: (userId: string, interviewId: string) => Promise<{
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
}>;
export declare const getEvaluationById: (userId: string, evaluationId: string) => Promise<{
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
}>;
export declare const createAIEvaluation: (userId: string, interviewId: string) => Promise<{
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
}>;
export {};
//# sourceMappingURL=evaluation.service.d.ts.map