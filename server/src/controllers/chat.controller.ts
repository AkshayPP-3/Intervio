import type { Request, Response } from "express";
import {
  createChat,
  getUserChats,
  getChatById,
  createMessage,
  getChatMessages,
} from "../services/chat.service.js";
import {
  createChatSchema,
  createChatMessageSchema,
} from "../schemas/chat.schema.js";
import AppError from "../utils/appError.js";

export const createChatController = async (
  req: Request,
  res: Response
) => {
  const validatedData = createChatSchema.parse(req.body);

  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const chat = await createChat({
    userId,
    title: validatedData.title,
  });

  res.status(201).json({
    success: true,
    message: "Chat created successfully",
    data: chat,
  });
};

export const getUserChatsController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const chats = await getUserChats(userId);

  res.status(200).json({
    success: true,
    message: "Chats fetched successfully",
    data: chats,
  });
};

export const getChatByIdController = async (
  req: Request,
  res: Response
) => {
  const chatId = req.params.chatId;

  if (typeof chatId !== "string") {
    throw new AppError("Invalid chat ID", 400);
  }

  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const chat = await getChatById(chatId, userId);

  res.status(200).json({
    success: true,
    message: "Chat fetched successfully",
    data: chat,
  });
};

export const createMessageController = async (
  req: Request,
  res: Response
) => {
  const chatId = req.params.chatId;

  if (typeof chatId !== "string") {
    throw new AppError("Invalid chat ID", 400);
  }

  const validatedData = createChatMessageSchema.parse(req.body);

  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const message = await createMessage(
    {
      chatId,
      content: validatedData.content,
    },
    userId
  );

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: message,
  });
};

export const getChatMessagesController = async (
  req: Request,
  res: Response
) => {
  const chatId = req.params.chatId;

  if (typeof chatId !== "string") {
    throw new AppError("Invalid chat ID", 400);
  }

  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const messages = await getChatMessages(chatId, userId);

  res.status(200).json({
    success: true,
    message: "Chat messages fetched successfully",
    data: messages,
  });
};