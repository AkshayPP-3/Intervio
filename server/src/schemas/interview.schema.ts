import { z } from "zod";

export const createInterviewSchema = z.object({
  title: z
    .string()
    .min(1, "Interview title is required")
    .max(100, "Interview title must be at most 100 characters"),

  role: z
    .string()
    .min(1, "Role is required")
    .max(100, "Role must be at most 100 characters"),

  difficulty: z
    .string()
    .min(1, "Difficulty cannot be empty")
    .optional(),

  language: z
    .string()
    .min(1, "Language cannot be empty")
    .optional(),
});