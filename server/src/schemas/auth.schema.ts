import {email, z} from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2,"Name must be at least 2 character")
        .max(50,"Name must not exceed 50 characters"),
    email: z
        .string()
        .trim()
        .email("please provide a valid email address")
        .toLowerCase(),
    password: z
        .string()
        .min(8,"Password must be at least 8 characters")
        .max(100,"Password must not exceed 100 characters"),
});
