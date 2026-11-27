import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/ui/Button'
import { errorMessage } from '../../services/api'
import type { Chat as ChatType, ChatMessage } from '../../types/chat.types'
import { LANGUAGES, LANGUAGE_LOCALES } from '../../utils/constants'
import { timeAgo } from '../../utils/helpers'
import { useSpeech } from '../interview/hooks/useSpeech'
import { ChatWindow } from './components/ChatWindow'
import { createChat, listChats, sendMessage } from './chat.service'

/** AI Assistant: chat with Intervio about interview preparation. Voice in and out. */
export function Chat() {
  const [chats, setChats] = useState<ChatType[] | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [language, setLanguage] = useState('English')
  const [readAloud, setReadAloud] = useState(false)
  const [speakingText, setSpeakingText] = useState<string | null>(null)

  const appendSpoken = useCallback((chunk: string) => {
    if (chunk) setDraft((d) => (d ? `${d} ${chunk}` : chunk))
  }, [])
  const speech = useSpeech(LANGUAGE_LOCALES[language] ?? 'en-IN', appendSpoken)
  const { speak, stopSpeaking, startListening, stopListening, listening } = speech

  useEffect(() => {
    let cancelled = false
    listChats()
      .then((list) => {
        if (cancelled) return
        setChats(list)
        setActiveId(list[0]?.id ?? null)
      })
      .catch((e) => {
        if (!cancelled) {
          setChats([])
          setError(errorMessage(e, 'Could not load your chats.'))
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const active = useMemo(() => chats?.find((c) => c.id === activeId) ?? null, [chats, activeId])
  const messages = active?.messages ?? []

  const patchChat = useCallback((id: string, fn: (c: ChatType) => ChatType) => {
    setChats((list) => (list ?? []).map((c) => (c.id === id ? fn(c) : c)))
  }, [])

  function speakText(text: string) {
    if (speech.speaking && speakingText === text) {
      stopSpeaking()
      return
    }
    setSpeakingText(text)
    speak(text)
  }

  async function send(text: string) {
    const content = text.trim()
    if (!content || sending) return
    stopListening()
    setSending(true)
    setError(null)
    setDraft('')

    let chatId = activeId
    const tempId = `tmp-${Date.now()}`
    try {
      if (!chatId) {
        const chat = await createChat(content.slice(0, 60))
        chatId = chat.id
        setChats((list) => [chat, ...(list ?? [])])
        setActiveId(chat.id)
      }
      const id = chatId
      const temp: ChatMessage = { id: tempId, chatId: id, role: 'USER', content, createdAt: new Date().toISOString() }
      patchChat(id, (c) => ({ ...c, messages: [...c.messages, temp] }))
      setPendingIds([tempId])

      const { userMessage, assistantMessage } = await sendMessage(id, content)
      patchChat(id, (c) => ({
        ...c,
        updatedAt: assistantMessage.createdAt,
        messages: [...c.messages.filter((m) => m.id !== tempId), userMessage, assistantMessage],
      }))
      if (readAloud) {
        setSpeakingText(assistantMessage.content)
        speak(assistantMessage.content)
      }
    } catch (e) {
      // Take the unsent message back out of the thread and into the box so nothing is lost.
      if (chatId) patchChat(chatId, (c) => ({ ...c, messages: c.messages.filter((m) => m.id !== tempId) }))
      setDraft(content)
      setError(errorMessage(e, 'Could not send your message.'))
    } finally {
      setPendingIds([])
      setSending(false)
    }
  }

  function newChat() {
    stopListening()
    stopSpeaking()
    setActiveId(null)
    setError(null)
    setDraft('')
  }

  function preview(c: ChatType) {
    return c.title?.trim() || c.messages[0]?.content.slice(0, 40) || 'New chat'
  }

  return (
    <div className="flex h-[calc(100vh-56px)] min-h-480px flex-col bg-[#071020] px-4 py-4 md:px-5">
      <PageHeader
        title="AI Assistant"
        description="Ask Intervio about resumes, interview questions and preparation. Voice input and spoken replies supported."
        actions={
          <>
            <label className="flex items-center gap-2 text-[11px] text-slate-300">
              Speech language
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100"
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            {speech.ttsSupported && (
              <label className="flex items-center gap-2 text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={readAloud}
                  onChange={(e) => {
                    setReadAloud(e.target.checked)
                    if (!e.target.checked) stopSpeaking()
                  }}
                  className="size-3.5 accent-blue-500"
                />
                Read replies aloud
              </label>
            )}
          </>
        }
      />

      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-lg border border-slate-800/90 bg-slate-800/95 p-2">
          <Button size="sm" onClick={newChat} className="mb-2 w-full">
            New chat
          </Button>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {chats === null && <p className="px-2 text-[11px] text-slate-400">Loading chats…</p>}
            {chats?.length === 0 && <p className="px-2 text-[11px] text-slate-500">No chats yet.</p>}
            {chats?.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  stopListening()
                  stopSpeaking()
                  setActiveId(c.id)
                  setError(null)
                }}
                aria-current={c.id === activeId ? 'true' : undefined}
                className={`block w-full rounded-md px-2 py-2 text-left transition ${
                  c.id === activeId ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <span className="block truncate text-xs font-medium">{preview(c)}</span>
                <span className="block text-[10px] text-slate-500">{timeAgo(c.updatedAt)}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col rounded-lg border border-slate-800/90 bg-slate-900/60">
          <ChatWindow
            messages={messages}
            pendingIds={pendingIds}
            sending={sending}
            loading={chats === null}
            error={error}
            draft={draft}
            onDraftChange={setDraft}
            onSend={(t) => void send(t)}
            sttSupported={speech.sttSupported}
            listening={listening}
            interim={speech.interim}
            onMicToggle={() => (listening ? stopListening() : startListening())}
            ttsSupported={speech.ttsSupported}
            speaking={speech.speaking}
            speakingText={speakingText}
            onSpeak={speakText}
          />
        </section>
      </div>
    </div>
  )
}
