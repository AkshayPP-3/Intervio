import { prisma } from "../config/prisma.js";
import appError from "../utils/appError.js";
import { generateChatResponse } from "../services/ai/gemini.service.js";
export const createChat = async (data) => {
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
export const getUserChats = async (userId) => {
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
export const getChatById = async (chatId, userId) => {
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
export const createMessage = async (data, userId) => {
    // 1. Check whether the chat belongs to the logged-in user
    const chat = await prisma.chat.findFirst({
        where: {
            id: data.chatId,
            userId,
        },
    });
    if (!chat) {
        throw new appError("Chat not found", 404);
    }
    // 2. Save the user's message
    const userMessage = await prisma.chatMessage.create({
        data: {
            chatId: data.chatId,
            role: "USER",
            content: data.content,
        },
    });
    // 3. Get previous conversation history
    const previousMessages = await prisma.chatMessage.findMany({
        where: {
            chatId: data.chatId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    // 4. Send conversation history to Gemini
    const aiResponse = await generateChatResponse(previousMessages.map((message) => ({
        role: message.role,
        content: message.content,
    })));
    // 5. Save Gemini's response
    const assistantMessage = await prisma.chatMessage.create({
        data: {
            chatId: data.chatId,
            role: "ASSISTANT",
            content: aiResponse,
        },
    });
    // 6. Return both messages
    return {
        userMessage,
        assistantMessage,
    };
};
export const getChatMessages = async (chatId, userId) => {
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
//# sourceMappingURL=chat.service.js.map