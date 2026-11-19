import { z } from "zod";
export declare const createProfileSchema: z.ZodObject<{
    bio: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    education: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateProfileSchema: z.ZodObject<{
    bio: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    education: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=profile.schema.d.ts.map