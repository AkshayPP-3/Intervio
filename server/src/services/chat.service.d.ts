interface CreateChatData {
    userId: string;
    title?: string | undefined;
}
interface CreateMessageData {
    chatId: string;
    content: string;
}
export declare const createChat: (data: CreateChatData) => Promise<{
    id: string;
    userId: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getUserChats: (userId: string) => Promise<({
    messages: {
        id: string;
        chatId: string;
        role: import("../../generated/prisma/enums.js").ChatRole;
        content: string;
        createdAt: Date;
    }[];
} & {
    id: string;
    userId: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare const getChatById: (chatId: string, userId: string) => Promise<{
    messages: {
        id: string;
        chatId: string;
        role: import("../../generated/prisma/enums.js").ChatRole;
        content: string;
        createdAt: Date;
    }[];
} & {
    id: string;
    userId: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const createMessage: (data: CreateMessageData, userId: string) => Promise<{
    userMessage: {
        id: string;
        chatId: string;
        role: import("../../generated/prisma/enums.js").ChatRole;
        content: string;
        createdAt: Date;
    };
    assistantMessage: {
        id: string;
        chatId: string;
        role: import("../../generated/prisma/enums.js").ChatRole;
        content: string;
        createdAt: Date;
    };
}>;
export declare const getChatMessages: (chatId: string, userId: string) => Promise<{
    id: string;
    chatId: string;
    role: import("../../generated/prisma/enums.js").ChatRole;
    content: string;
    createdAt: Date;
}[]>;
export {};
//# sourceMappingURL=chat.service.d.ts.map