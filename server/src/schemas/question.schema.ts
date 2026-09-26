import { z } from "zod";

export const createQuestionSchema = z.object({
  interviewId: z
    .string()
    .uuid("Invalid interview ID"),

  questionText: z
    .string()
    .min(1, "Question text is required")
    .max(1000, "Question text cannot exceed 1000 characters"),

  questionType: z
    .string()
    .min(1, "Question type cannot be empty")
    .optional(),

  order: z
    .number()
    .int("Order must be an integer")
    .positive("Order must be greater than 0"),
});