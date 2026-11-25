import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../../types/chat.types'
import { Button } from '../../../components/ui/Button'
import { MAX_MESSAGE_LENGTH, SUGGESTIONS } from '../chat.service'
import { MessageBubble } from './MessageBubble'

type ChatWindowProps = {
  messages: ChatMessage[]
  pendingIds: string[]
  sending: boolean
  loading: boolean
  error: string | null
  draft: string
  onDraftChange: (value: string) => void
  onSend: (text: string) => void
  sttSupported: boolean
  listening: boolean
  interim: string
  onMicToggle: () => void
  ttsSupported: boolean
  speaking: boolean
  speakingText: string | null
  onSpeak: (text: string) => void
}

export function ChatWindow(p: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [p.messages.length, p.sending])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {p.loading && <p className="text-xs text-slate-400">Loading messages…</p>}

        {!p.loading && p.messages.length === 0 && (
          <div className="mx-auto mt-6 max-w-md text-center">
            <h2 className="text-sm font-bold text-white">Ask anything about interview preparation</h2>
            <p className="mt-1 text-xs text-slate-400">
              Resumes, interview questions, salary talks or how to handle nerves.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => p.onSend(s)}
                  disabled={p.sending}
                  className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] text-slate-200 transition hover:border-blue-400 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {p.messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            pending={p.pendingIds.includes(m.id)}
            canSpeak={p.ttsSupported}
            speaking={p.speaking && p.speakingText === m.content}
            onSpeak={() => p.onSpeak(m.content)}
          />
        ))}

        {p.sending && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-400">
              Gemini is thinking…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-800 p-3">
        {p.error && (
          <p role="alert" className="mb-2 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {p.error}
          </p>
        )}
        {p.listening && (
          <p className="mb-2 flex items-center gap-2 text-[11px] text-red-300">
            <span className="size-2 animate-pulse rounded-full bg-red-400" />
            Listening… <span className="italic text-slate-300">{p.interim}</span>
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            aria-label="Message"
            value={p.draft}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={2}
            onChange={(e) => p.onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                p.onSend(p.draft)
              }
            }}
            placeholder="Message Gemini… (Enter to send, Shift+Enter for a new line)"
            className="min-h-[44px] flex-1 resize-none rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
          />
          <Button
            variant={p.listening ? 'danger' : 'secondary'}
            onClick={p.onMicToggle}
            disabled={!p.sttSupported}
            aria-pressed={p.listening}
            title={p.sttSupported ? 'Speak your message' : 'Voice input is not supported in this browser'}
          >
            {p.listening ? 'Stop' : 'Speak'}
          </Button>
          <Button onClick={() => p.onSend(p.draft)} disabled={!p.draft.trim() || p.sending} loading={p.sending}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
