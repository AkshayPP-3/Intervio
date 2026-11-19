import { z } from "zod";
export declare const createAnswerSchema: z.ZodObject<{
    questionId: z.ZodString;
    answerText: z.ZodOptional<z.ZodString>;
    audioUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=answer.schema.d.ts.map