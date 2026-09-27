import { z } from "zod";

export const createEvaluationSchema = z.object({
  interviewId: z
    .string()
    .uuid("Invalid interview ID"),

  overallScore: z
    .number()
    .min(0, "Score cannot be less than 0")
    .max(100, "Score cannot be greater than 100")
    .optional(),

  technicalScore: z
    .number()
    .min(0, "Score cannot be less than 0")
    .max(100, "Score cannot be greater than 100")
    .optional(),

  communicationScore: z
    .number()
    .min(0, "Score cannot be less than 0")
    .max(100, "Score cannot be greater than 100")
    .optional(),

  confidenceScore: z
    .number()
    .min(0, "Score cannot be less than 0")
    .max(100, "Score cannot be greater than 100")
    .optional(),

  feedback: z
    .string()
    .max(5000, "Feedback cannot exceed 5000 characters")
    .optional(),

  strengths: z
    .string()
    .max(3000, "Strengths cannot exceed 3000 characters")
    .optional(),

  weaknesses: z
    .string()
    .max(3000, "Weaknesses cannot exceed 3000 characters")
    .optional(),
});