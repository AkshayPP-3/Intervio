import { z } from "zod";
export declare const createInterviewSchema: z.ZodObject<{
    title: z.ZodString;
    role: z.ZodString;
    difficulty: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateInterviewStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        CANCELLED: "CANCELLED";
        COMPLETED: "COMPLETED";
        IN_PROGRESS: "IN_PROGRESS";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=interview.schema.d.ts.map