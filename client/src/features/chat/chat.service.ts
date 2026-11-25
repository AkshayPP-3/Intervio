import { api } from '../../services/api'
import type { Chat, ChatMessage } from '../../types/chat.types'

/*  POST /chats  GET /chats  GET /chats/:id  POST|GET /chats/:id/messages  */

export const listChats = () => api.get<Chat[]>('/chats')

export async function createChat(title?: string): Promise<Chat> {
  const chat = await api.post<Omit<Chat, 'messages'> & { messages?: ChatMessage[] }>('/chats', title ? { title } : {})
  return { ...chat, messages: chat.messages ?? [] }
}

export const getChatMessages = (chatId: string) => api.get<ChatMessage[]>(`/chats/${chatId}/messages`)

/** Saves your message, asks Gemini, saves and returns the reply. Rate limited to 20 AI calls per 15 minutes. */
export const sendMessage = (chatId: string, content: string) =>
  api.post<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(`/chats/${chatId}/messages`, { content })

export const MAX_MESSAGE_LENGTH = 5000

export const SUGGESTIONS = [
  'Help me improve my self-introduction',
  'How do I handle interview nerves?',
  'Common coding questions for freshers',
  'How should I negotiate salary?',
]
