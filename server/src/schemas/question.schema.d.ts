import { z } from "zod";
export declare const createQuestionSchema: z.ZodObject<{
    interviewId: z.ZodString;
    questionText: z.ZodString;
    questionType: z.ZodOptional<z.ZodString>;
    order: z.ZodNumber;
}, z.core.$strip>;
//# sourceMappingURL=question.schema.d.ts.map