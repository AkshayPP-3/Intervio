import { z } from "zod";

export const createResumeSchema = z.object({
    fileName: z.string().min(1, "File name is required"),
    fileUrl: z.string().url().optional(),
});

export const updateResumeSchema = z.object({
    fileName: z.string().min(1).optional(),
    fileUrl: z.string().url().optional(),
});