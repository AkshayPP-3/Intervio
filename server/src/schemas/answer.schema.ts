import { z } from "zod";

export const createAnswerSchema = z.object({
  questionId: z
    .string()
    .uuid("Invalid question ID"),

  answerText: z
    .string()
    .max(5000, "Answer cannot exceed 5000 characters")
    .optional(),

  audioUrl: z
    .string()
    .url("Invalid audio URL")
    .optional(),
});