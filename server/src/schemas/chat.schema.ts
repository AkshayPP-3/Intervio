import { z } from "zod";

export const createChatSchema = z.object({
  title: z
    .string()
    .min(1, "Chat title cannot be empty")
    .max(100, "Chat title cannot exceed 100 characters")
    .optional(),
});

export const createChatMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),
});