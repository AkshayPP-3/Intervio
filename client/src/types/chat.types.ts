export type ChatRole = 'USER' | 'ASSISTANT'

export type ChatMessage = {
  id: string
  chatId: string
  role: ChatRole
  content: string
  createdAt: string
}

export type Chat = {
  id: string
  title: string | null
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}
