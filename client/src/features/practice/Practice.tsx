import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../dashboard/Dashboard'
import { useSpeech } from '../interview/hooks/useSpeech'
import { LANGUAGE_LOCALES, createInterview } from '../interview/interview.service'
import {
  CATEGORIES,
  DIFFICULTIES,
  SENTENCES,
  TECH_ROLES,
  analyzeSpeech,
  practiceTitle,
  summarise,
} from './practice.service'
import type { InterviewLite, PracticeCategory } from './practice.service'

const PREFS_KEY = 'intervio_practice_prefs'
type Prefs = { difficulty: string; language: string; techRole: string }
const DEFAULT_PREFS: Prefs = { difficulty: 'Intermediate', language: 'English', techRole: 'Frontend Developer' }

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) } : DEFAULT_PREFS
  } catch {
    return DEFAULT_PREFS
  }
}

const primaryBtn =
  'h-8 rounded-md bg-blue-500 px-3 text-xs font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50'
const ghostBtn =
  'h-8 rounded-md bg-slate-700 px-3 text-xs font-medium text-blue-300 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50'
const field =
  'h-8 rounded-md border border-slate-600 bg-slate-900 px-2 text-xs text-slate-100 outline-none focus:border-blue-400'

export function Practice() {
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)
  const [list, setList] = useState<InterviewLite[] | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sample, setSample] = useState<{ key: string; index: number } | null>(null)

  const [sentenceIdx, setSentenceIdx] = useState(0)
  const [heard, setHeard] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      /* ignore */
    }
  }, [prefs])

  useEffect(() => {
    let cancelled = false
    apiRequest<InterviewLite[]>('/interviews')
      .then((d) => {
        if (!cancelled) setList(d)
      })
      .catch(() => {
        /* counts are optional; the page still works without them */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const appendHeard = useCallback((chunk: string) => {
    if (chunk) setHeard((h) => (h ? `${h} ${chunk}` : chunk))
  }, [])
  // The drill sentences and sample questions are English, so speech is always en-IN.
  const speech = useSpeech('en-IN', appendHeard)
  const { speak, stopSpeaking, startListening, stopListening, listening } = speech

  const sentence = SENTENCES[sentenceIdx % SENTENCES.length] as string
  const result = useMemo(() => (heard.trim() ? analyzeSpeech(sentence, heard) : null), [heard, sentence])

  async function startSet(c: PracticeCategory) {
    if (busyKey) return
    const role = c.role ?? prefs.techRole.trim()
    if (!role) {
      setError('Enter a role for the Technical set.')
      return
    }
    setBusyKey(c.key)
    setError(null)
    try {
      const id = await createInterview({
        title: practiceTitle(c),
        role,
        difficulty: prefs.difficulty,
        language: prefs.language,
      })
      navigate(`/interviews/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start this set. Please try again.')
      setBusyKey(null)
    }
  }

  function showSample(c: PracticeCategory) {
    stopSpeaking()
    // Same category pressed again shows the next question; another category starts at a random one.
    setSample((s) =>
      s?.key === c.key
        ? { key: c.key, index: (s.index + 1) % c.samples.length }
        : { key: c.key, index: Math.floor(Math.random() * c.samples.length) },
    )
  }

  function newSentence() {
    stopListening()
    stopSpeaking()
    setHeard('')
    setSentenceIdx((i) => (i + 1) % SENTENCES.length)
  }

  function toggleRecord() {
    if (listening) {
      stopListening()
      return
    }
    stopSpeaking()
    setHeard('')
    startListening()
  }

  const sampleCategory = sample ? CATEGORIES.find((c) => c.key === sample.key) : undefined
  const sampleText = sampleCategory && sample ? sampleCategory.samples[sample.index] : undefined

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-4">
      <h1 className="text-xl font-bold text-white">Practice</h1>
      <p className="mt-1 text-sm text-slate-400">Short focused sets. Pick a skill, then answer by voice or text.</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
        <label className="flex items-center gap-2 text-xs text-slate-300">
          Difficulty
          <select
            className={field}
            value={prefs.difficulty}
            onChange={(e) => setPrefs({ ...prefs, difficulty: e.target.value })}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-300">
          Language
          <select
            className={field}
            value={prefs.language}
            onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
          >
            {Object.keys(LANGUAGE_LOCALES).map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-300">
          Role for Technical set
          <input
            className={`${field} w-48`}
            list="practice-roles"
            value={prefs.techRole}
            maxLength={100}
            onChange={(e) => setPrefs({ ...prefs, techRole: e.target.value })}
          />
          <datalist id="practice-roles">
            {TECH_ROLES.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}
      {busyKey && (
        <p role="status" className="mt-4 rounded-md bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
          Gemini is writing your questions. This takes a few seconds.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORIES.map((c) => {
          const { completed, unfinished } = summarise(list ?? [], c)
          const tag = list === null ? null : completed === 0 ? 'New' : `${completed} completed`
          return (
            <section key={c.key} className="flex flex-col rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-bold text-white">{c.title}</h2>
                {tag && (
                  <span className="shrink-0 rounded-full bg-slate-700 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                    {tag}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">{c.description}</p>

              {unfinished && (
                <button
                  onClick={() => navigate(`/interviews/${unfinished.id}`)}
                  className="mt-2 text-left text-xs font-medium text-amber-300 underline-offset-2 hover:underline"
                >
                  You have an unfinished set. Continue
                </button>
              )}

              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <button className={primaryBtn} disabled={busyKey !== null} onClick={() => void startSet(c)}>
                  {busyKey === c.key ? 'Preparing…' : 'Start set'}
                </button>
                <button
                  className={ghostBtn}
                  aria-pressed={sample?.key === c.key}
                  onClick={() => showSample(c)}
                >
                  Sample question
                </button>
              </div>
            </section>
          )
        })}
      </div>

      {sampleCategory && sampleText && (
        <section
          aria-live="polite"
          className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
            Sample · {sampleCategory.title}
          </p>
          <p className="mt-2 text-base font-medium leading-7 text-white">{sampleText}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {speech.ttsSupported && (
              <button
                className={ghostBtn}
                onClick={() => (speech.speaking ? stopSpeaking() : speak(sampleText))}
              >
                {speech.speaking ? 'Stop reading' : 'Read aloud'}
              </button>
            )}
            <button className={ghostBtn} onClick={() => showSample(sampleCategory)}>
              Another question
            </button>
            <button className={primaryBtn} disabled={busyKey !== null} onClick={() => void startSet(sampleCategory)}>
              Practise this set
            </button>
            <button
              className={ghostBtn}
              onClick={() => {
                stopSpeaking()
                setSample(null)
              }}
            >
              Close
            </button>
          </div>
        </section>
      )}

      <section className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <h2 className="text-sm font-bold text-white">Pronunciation and speaking drill</h2>
        <p className="mt-1 text-xs text-slate-400">Read the sentence aloud. We transcribe it and show what we heard.</p>

        <p className="mt-4 text-lg leading-8 text-white" aria-label="Sentence to read">
          {result
            ? result.words.map((w, k) => (
                <span key={k} className={w.ok ? 'text-emerald-300' : 'text-red-300 underline decoration-red-400/60'}>
                  {w.text}{' '}
                </span>
              ))
            : `“${sentence}”`}
        </p>

        {!speech.sttSupported && (
          <p className="mt-3 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Voice input is not supported in this browser. Use Chrome or Edge to record.
          </p>
        )}
        {speech.sttError && (
          <p role="alert" className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {speech.sttError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            className={listening ? 'h-8 rounded-md bg-red-500 px-3 text-xs font-semibold text-white hover:bg-red-400' : primaryBtn}
            disabled={!speech.sttSupported}
            aria-pressed={listening}
            onClick={toggleRecord}
          >
            {listening ? 'Stop' : 'Record'}
          </button>
          {speech.ttsSupported && (
            <button className={ghostBtn} onClick={() => (speech.speaking ? stopSpeaking() : speak(sentence))}>
              {speech.speaking ? 'Stop' : 'Listen to sentence'}
            </button>
          )}
          <button className={ghostBtn} onClick={newSentence}>
            New sentence
          </button>
        </div>

        {listening && (
          <p className="mt-3 flex items-center gap-2 text-xs text-red-300">
            <span className="size-2 animate-pulse rounded-full bg-red-400" />
            Listening… <span className="italic text-slate-300">{[heard, speech.interim].filter(Boolean).join(' ')}</span>
          </p>
        )}

        {!listening && result && (
          <div aria-live="polite" className="mt-4 rounded-lg bg-slate-900 p-4">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="text-2xl font-bold text-white">{result.accuracy}%</p>
              <p className="text-sm text-slate-300">
                {result.accuracy >= 90
                  ? 'Excellent. Clear and accurate.'
                  : result.accuracy >= 70
                    ? 'Good. Slow down on the words in red.'
                    : 'Try again more slowly and clearly.'}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">We heard:</span> {heard}
            </p>
            {result.extra.length > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Extra words:</span> {result.extra.join(', ')}
              </p>
            )}
            <button className={`${ghostBtn} mt-3`} onClick={toggleRecord} disabled={!speech.sttSupported}>
              Try again
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
