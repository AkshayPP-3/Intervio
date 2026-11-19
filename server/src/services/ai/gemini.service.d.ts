interface ChatHistoryMessage {
    role: "USER" | "ASSISTANT";
    content: string;
}
export declare const generateChatResponse: (messages: ChatHistoryMessage[]) => Promise<string>;
interface InterviewQuestion {
    questionText: string;
    questionType: string;
    order: number;
}
interface GenerateInterviewQuestionsData {
    role: string;
    difficulty?: string;
    language?: string;
}
export declare const generateInterviewQuestions: (data: GenerateInterviewQuestionsData) => Promise<InterviewQuestion[]>;
interface InterviewEvaluationQuestion {
    question: string;
    answer: string;
}
interface EvaluateInterviewData {
    role: string;
    difficulty?: string | null;
    language?: string | null;
    questions: InterviewEvaluationQuestion[];
}
interface InterviewEvaluationResult {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
}
export declare const evaluateInterview: (data: EvaluateInterviewData) => Promise<InterviewEvaluationResult>;
export {};
//# sourceMappingURL=gemini.service.d.ts.map