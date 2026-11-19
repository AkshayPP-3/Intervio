import { z } from "zod";
export declare const createResumeSchema: z.ZodObject<{
    fileName: z.ZodString;
    fileUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateResumeSchema: z.ZodObject<{
    fileName: z.ZodOptional<z.ZodString>;
    fileUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=resume.schema.d.ts.map