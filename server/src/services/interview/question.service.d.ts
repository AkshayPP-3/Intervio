interface CreateQuestionData {
    interviewId: string;
    questionText: string;
    questionType?: string | undefined;
    order: number;
}
export declare const createQuestion: (userId: string, data: CreateQuestionData) => Promise<{
    id: string;
    interviewId: string;
    questionText: string;
    questionType: string | null;
    order: number;
    createdAt: Date;
}>;
export declare const getQuestionsByInterview: (userId: string, interviewId: string) => Promise<{
    id: string;
    interviewId: string;
    questionText: string;
    questionType: string | null;
    order: number;
    createdAt: Date;
}[]>;
export declare const getQuestionById: (userId: string, questionId: string) => Promise<{
    id: string;
    interviewId: string;
    questionText: string;
    questionType: string | null;
    order: number;
    createdAt: Date;
}>;
export {};
//# sourceMappingURL=question.service.d.ts.map