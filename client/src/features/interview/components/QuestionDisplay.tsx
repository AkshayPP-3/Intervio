import type { Question } from '../interview.service'

type Props = {
  index: number
  total: number
  question: Question
  speaking: boolean
  ttsSupported: boolean
  voiceMissing: boolean
  language: string
  autoRead: boolean
  onAutoReadChange: (value: boolean) => void
  onListen: () => void
  onStop: () => void
}

export function QuestionDisplay({
  index,
  total,
  question,
  speaking,
  ttsSupported,
  voiceMissing,
  language,
  autoRead,
  onAutoReadChange,
  onListen,
  onStop,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
          Question {index + 1} of {total}
        </p>
        {question.questionType && (
          <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs text-slate-200">
            {question.questionType}
          </span>
        )}
      </div>

      <h2 className="mt-3 text-lg font-semibold leading-7 text-white">{question.questionText}</h2>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {ttsSupported ? (
          <button
            type="button"
            onClick={speaking ? onStop : onListen}
            className="h-8 rounded-md bg-slate-700 px-3 text-xs font-medium text-blue-300 hover:bg-slate-600"
          >
            {speaking ? 'Stop reading' : 'Read aloud'}
          </button>
        ) : (
          <span className="text-xs text-slate-400">Read-aloud is not supported in this browser.</span>
        )}
        {ttsSupported && (
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={autoRead}
              onChange={(e) => onAutoReadChange(e.target.checked)}
              className="size-3.5 accent-blue-500"
            />
            Read each question automatically
          </label>
        )}
      </div>

      {voiceMissing && (
        <p className="mt-3 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Your device has no {language} voice installed, so the question is shown as text only. Install a
          {' '}
          {language} voice in your system settings to hear it.
        </p>
      )}
    </section>
  )
}
