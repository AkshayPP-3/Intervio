import { useMemo } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  readOnly: boolean
  listening: boolean
  transcribing?: boolean
  interim: string
  sttSupported: boolean
  sttError: string | null
  language: string
  speakSeconds: number
  maxLength: number
  onMicToggle: () => void
  onClear: () => void
  onShortcutSubmit: () => void
}

const FILLERS = /\b(um+|uh+|erm|like|basically|actually|you know|kind of|sort of)\b/gi

export function AnswerInput({
  value,
  onChange,
  readOnly,
  listening,
  transcribing = false,
  interim,
  sttSupported,
  sttError,
  language,
  speakSeconds,
  maxLength,
  onMicToggle,
  onClear,
  onShortcutSubmit,
}: Props) {
  const stats = useMemo(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0
    const fillers = (value.match(FILLERS) ?? []).length
    const wpm = speakSeconds >= 8 ? Math.round(words / (speakSeconds / 60)) : null
    return { words, fillers, wpm }
  }, [value, speakSeconds])

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">{readOnly ? 'Your saved answer' : 'Your answer'}</h3>
        {!readOnly && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onMicToggle}
              disabled={!sttSupported}
              aria-pressed={listening}
              className={`h-8 rounded-md px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                listening ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              {listening ? 'Stop speaking' : 'Start speaking'}
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={!value}
              className="h-8 rounded-md bg-slate-700 px-3 text-xs text-slate-200 hover:bg-slate-600 disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {!sttSupported && !readOnly && (
        <p className="mt-3 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Voice input is not supported in this browser. Use Chrome or Edge, or type your answer below.
        </p>
      )}
      {sttError && (
        <p role="alert" className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {sttError}
        </p>
      )}

      <textarea
        aria-label="Answer"
        value={value}
        readOnly={readOnly}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            onShortcutSubmit()
          }
        }}
        placeholder={
          readOnly
            ? ''
            : sttSupported
              ? `Press “Start speaking” and answer in ${language} (or English), or type here. Gemini understands Indian languages and replies in English.`
              : `Type your answer here in ${language} or English.`
        }
        className="mt-3 h-44 w-full resize-y rounded-lg border border-slate-600 bg-slate-900 p-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 read-only:opacity-80 focus:border-blue-400"
      />

      {listening && (
        <p className="mt-2 flex items-center gap-2 text-xs text-red-300">
          <span className="size-2 animate-pulse rounded-full bg-red-400" />
          Listening ({language})… {interim && <span className="italic text-slate-300">{interim}</span>}
        </p>
      )}
      {!listening && transcribing && (
        <p className="mt-2 flex items-center gap-2 text-xs text-blue-300">
          <span className="size-2 animate-pulse rounded-full bg-blue-400" />
          Refining {language} speech transcript with Sarvam AI…
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400">
        <span>
          <b className="text-slate-200">{stats.words}</b> words
        </span>
        <span>
          <b className={stats.fillers > 3 ? 'text-amber-300' : 'text-slate-200'}>{stats.fillers}</b> filler words
        </span>
        <span>
          <b className="text-slate-200">{stats.wpm ?? '–'}</b> words/min
        </span>
        <span className="ml-auto">
          {value.length}/{maxLength}
        </span>
      </div>
      {!readOnly && stats.words > 0 && stats.words < 15 && (
        <p className="mt-2 text-xs text-amber-300">Short answers usually score lower. Add an example or a result.</p>
      )}
    </section>
  )
}
