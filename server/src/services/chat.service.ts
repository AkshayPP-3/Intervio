import {prisma} from "../config/prisma.js";
import appError from "../utils/appError.js";

interface CreateChatData {
  userId: string;
  title?: string | undefined;
}

interface CreateMessageData {
  chatId: string;
  content: string;
}

export const createChat = async (data: CreateChatData) => {
  const chat = await prisma.chat.create({
    data: {
      userId: data.userId,

      ...(data.title !== undefined && {
        title: data.title,
      }),
    },
  });

  return chat;
};

export const getUserChats = async (userId: string) => {
  const chats = await prisma.chat.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return chats;
};

export const getChatById = async (
  chatId: string,
  userId: string
) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!chat) {
    throw new appError("Chat not found", 404);
  }

  return chat;
};

export const createMessage = async (
  data: CreateMessageData,
  userId: string
) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: data.chatId,
      userId,
    },
  });

  if (!chat) {
    throw new appError("Chat not found", 404);
  }

  const message = await prisma.chatMessage.create({
    data: {
      chatId: data.chatId,
      role: "USER",
      content: data.content,
    },
  });

  return message;
};

export const getChatMessages = async (
  chatId: string,
  userId: string
) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
  });

  if (!chat) {
    throw new appError("Chat not found", 404);
  }

  const messages = await prisma.chatMessage.findMany({
    where: {
      chatId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages;
};