interface CreateAnswerData {
    questionId: string;
    answerText?: string | undefined;
    audioUrl?: string | undefined;
}
export declare const createAnswer: (data: CreateAnswerData) => Promise<{
    id: string;
    questionId: string;
    answerText: string | null;
    audioUrl: string | null;
    createdAt: Date;
}>;
export declare const getAnswerByQuestion: (questionId: string) => Promise<{
    id: string;
    questionId: string;
    answerText: string | null;
    audioUrl: string | null;
    createdAt: Date;
}>;
export declare const getAnswerById: (answerId: string) => Promise<{
    id: string;
    questionId: string;
    answerText: string | null;
    audioUrl: string | null;
    createdAt: Date;
}>;
export {};
//# sourceMappingURL=answer.service.d.ts.map