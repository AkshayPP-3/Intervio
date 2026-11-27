import type { ChatMessage } from '../../../types/chat.types'
import { formatDateTime } from '../../../utils/helpers'

type MessageBubbleProps = {
  message: ChatMessage
  pending?: boolean
  speaking?: boolean
  canSpeak?: boolean
  onSpeak?: () => void
}

export function MessageBubble({ message, pending = false, speaking = false, canSpeak = false, onSpeak }: MessageBubbleProps) {
  const mine = message.role === 'USER'
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-5 ${
          mine ? 'bg-blue-500 text-white' : 'border border-slate-700 bg-slate-800 text-slate-100'
        } ${pending ? 'opacity-70' : ''}`}
      >
        <p className={`mb-1 text-[10px] font-semibold ${mine ? 'text-blue-100' : 'text-blue-300'}`}>
          {mine ? 'You' : 'Intervio'}
        </p>
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        <div className={`mt-1.5 flex items-center gap-3 text-[10px] ${mine ? 'text-blue-100/80' : 'text-slate-500'}`}>
          <span>{pending ? 'Sending…' : formatDateTime(message.createdAt)}</span>
          {!mine && canSpeak && (
            <button onClick={onSpeak} className="font-medium text-blue-300 hover:text-blue-200">
              {speaking ? 'Stop' : 'Read aloud'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
