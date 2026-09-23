import { z } from "zod";

export const createProfileSchema = z.object({
    bio: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    education: z.string().optional(),
    skills: z.string().optional(),
})

export const updateProfileSchema = z.object({
    bio: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    education: z.string().optional(),
    skills: z.string().optional(),
})
