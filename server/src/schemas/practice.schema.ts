import { z } from "zod";

const topicSchema = z
  .string()
  .trim()
  .min(1, "A practice topic is required")
  .max(200, "Practice topic cannot exceed 200 characters");

export const generatePracticeQuestionsSchema = z.object({
  topic: topicSchema,
  count: z
    .number()
    .int("Question count must be a whole number")
    .min(5, "A practice test must have at least 5 questions")
    .max(20, "A practice test cannot have more than 20 questions"),
});

export const evaluatePracticeAnswersSchema = z.object({
  topic: topicSchema,
  qa: z
    .array(
      z.object({
        question: z
          .string()
          .trim()
          .min(1, "Question cannot be empty")
          .max(1000, "Question cannot exceed 1000 characters"),
        userAnswer: z
          .string()
          .max(5000, "An answer cannot exceed 5000 characters"),
      }),
    )
    .min(5, "At least 5 answers are required")
    .max(20, "No more than 20 answers can be reviewed"),
});
