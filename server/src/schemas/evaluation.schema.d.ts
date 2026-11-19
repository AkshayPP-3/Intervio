import { z } from "zod";
export declare const createEvaluationSchema: z.ZodObject<{
    interviewId: z.ZodString;
    overallScore: z.ZodOptional<z.ZodNumber>;
    technicalScore: z.ZodOptional<z.ZodNumber>;
    communicationScore: z.ZodOptional<z.ZodNumber>;
    confidenceScore: z.ZodOptional<z.ZodNumber>;
    feedback: z.ZodOptional<z.ZodString>;
    strengths: z.ZodOptional<z.ZodString>;
    weaknesses: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=evaluation.schema.d.ts.map