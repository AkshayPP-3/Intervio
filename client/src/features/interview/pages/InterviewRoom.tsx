import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnswerInput } from '../components/AnswerInput'
import { CameraPanel } from '../components/CameraPanel'
import { QuestionDisplay } from '../components/QuestionDisplay'
import { ResultView } from '../components/ResultView'
import { useSpeech } from '../hooks/useSpeech'
import {
  SKIP_TEXT,
  cancelInterview,
  createInterview,
  evaluateInterview,
  getAnswer,
  getEvaluation,
  getInterview,
  loadDraft,
  localeFor,
  saveAnswer,
  saveDraft,
} from '../interview.service'
import type { Evaluation, InterviewDetail, Question } from '../interview.service'

type Phase = 'loading' | 'error' | 'room' | 'evaluating' | 'results' | 'cancelled'

const MAX_ANSWER = 5000
const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback)

const primaryBtn =
  'h-10 rounded-md bg-blue-500 px-5 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60'
const ghostBtn =
  'h-10 rounded-md bg-slate-700 px-4 text-sm font-medium text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60'

export function InterviewRoom() {
  const { interviewId } = useParams<{ interviewId: string }>()
  const navigate = useNavigate()

  const [phase, setPhase] = useState<Phase>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [interview, setInterview] = useState<InterviewDetail | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)

  const [idx, setIdx] = useState(0)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyRetake, setBusyRetake] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [needsEvaluation, setNeedsEvaluation] = useState(false)

  const [elapsed, setElapsed] = useState(0)
  const [speakSeconds, setSpeakSeconds] = useState(0)
  const [autoRead, setAutoRead] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reaction, setReaction] = useState<{ questionId: string; text: string; nextIdx: number | null } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const micStartDraftRef = useRef('')
  const micQuestionIdRef = useRef<string | undefined>(undefined)

  const language = interview?.language ?? 'English'
  const locale = localeFor(interview?.language)
  const question = questions[idx]
  const answered = question ? answers[question.id] : undefined
  const isAnswered = answered !== undefined
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  const savingRef = useRef(saving)
  const isAnsweredRef = useRef(isAnswered)
  const questionIdRef = useRef(question?.id)
  useEffect(() => {
    savingRef.current = saving
    isAnsweredRef.current = isAnswered
    questionIdRef.current = question?.id
  })

  const appendSpoken = useCallback((chunk: string) => {
    if (!chunk) return
    setDraft((d) => (d && !d.endsWith(' ') ? `${d} ${chunk}` : `${d}${chunk}`).slice(0, MAX_ANSWER))
  }, [])

  const applySarvamTranscript = useCallback((transcript: string) => {
    if (savingRef.current || isAnsweredRef.current) return
    if (!micQuestionIdRef.current || micQuestionIdRef.current !== questionIdRef.current) return
    const base = micStartDraftRef.current.trim()
    const combined = base ? `${base} ${transcript}` : transcript
    setDraft(combined.slice(0, MAX_ANSWER))
  }, [])

  const speech = useSpeech(locale, appendSpoken, {
    ttsLocale: 'en-IN',
    useSarvam: true,
    onSarvamTranscript: applySarvamTranscript,
  })
  const { speak, stopSpeaking, stopListening, startListening, listening } = speech

  //loading
  useEffect(() => {
    if (!interviewId) return
    let cancelled = false

    async function load(id: string) {
      setPhase('loading')
      setLoadError(null)
      setActionError(null)
      setNeedsEvaluation(false)
      try {
        const iv = await getInterview(id)
        if (cancelled) return
        const qs = [...iv.questions].sort((a, b) => a.order - b.order)
        if (qs.length === 0) throw new Error('This interview has no questions. Please start a new interview.')

        const map: Record<string, string> = {}
        const hasEmbeddedAnswers = qs.some((q) => q.answer !== undefined)
        if (hasEmbeddedAnswers) {
          qs.forEach((q) => {
            if (q.answer?.answerText != null) map[q.id] = q.answer.answerText
          })
        } else {
          const saved = await Promise.all(qs.map((q) => getAnswer(q.id)))
          if (cancelled) return
          saved.forEach((a, i) => {
            const q = qs[i]
            if (q && a?.answerText != null) map[q.id] = a.answerText
          })
        }

        setInterview(iv)
        setQuestions(qs)
        setAnswers(map)
        setElapsed(0)

        if (iv.status === 'COMPLETED') {
          const ev = iv.evaluation ?? (await getEvaluation(iv.id).catch(() => null))
          if (cancelled) return
          setEvaluation(ev)
          setPhase('results')
          return
        }
        if (iv.status === 'CANCELLED') {
          setPhase('cancelled')
          return
        }

        const firstOpen = qs.findIndex((q) => map[q.id] === undefined)
        const start = firstOpen === -1 ? qs.length - 1 : firstOpen
        setIdx(start)
        setDraft(loadDraft(qs[start]?.id))
        setNeedsEvaluation(firstOpen === -1)
        setPhase('room')
      } catch (e) {
        if (cancelled) return
        setLoadError(errMsg(e, 'Could not load this interview.'))
        setPhase('error')
      }
    }

    void load(interviewId)
    return () => {
      cancelled = true
    }
  }, [interviewId, reloadKey])

  // timers
  useEffect(() => {
    if (phase !== 'room') return
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (!listening) return
    const t = setInterval(() => setSpeakSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [listening])

  //draft persistence
  const questionId = question?.id
  useEffect(() => {
    if (phase === 'room' && questionId && !isAnswered) saveDraft(questionId, draft)
  }, [phase, questionId, isAnswered, draft])

  // warn before closing the tab with unsaved text
  useEffect(() => {
    if (phase !== 'room' || !draft.trim() || isAnswered) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [phase, draft, isAnswered])

  // read the question aloud
  useEffect(() => {
    if (phase !== 'room' || !questionId || !autoRead || isAnswered) return
    const q = questions.find((x) => x.id === questionId)
    if (!q) return
    const t = setTimeout(() => speak(q.questionText), 400)
    return () => clearTimeout(t)
    // Only re-read when the question changes, not when the user edits text or toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionId])

  // close the exit menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  //actions
  function goTo(i: number) {
    const target = questions[i]
    if (!target || i === idx) return
    stopListening()
    stopSpeaking()
    setReaction(null)
    setActionError(null)
    setSpeakSeconds(0)
    setIdx(i)
    setDraft(answers[target.id] === undefined ? loadDraft(target.id) : '')
  }

  async function continueAfterReaction() {
    if (!reaction) return
    stopSpeaking()
    const nextIdx = reaction.nextIdx
    setReaction(null)
    if (nextIdx === null) {
      await runEvaluation()
      return
    }
    setSpeakSeconds(0)
    setIdx(nextIdx)
    setDraft(loadDraft(questions[nextIdx]?.id))
  }

  async function runEvaluation() {
    if (!interview) return
    stopListening()
    stopSpeaking()
    setPhase('evaluating')
    setActionError(null)
    try {
      const ev = await evaluateInterview(interview.id)
      setEvaluation(ev)
      setInterview({ ...interview, status: 'COMPLETED' })
      setNeedsEvaluation(false)
      setPhase('results')
    } catch (e) {
      setActionError(errMsg(e, 'Evaluation failed.'))
      setNeedsEvaluation(true)
      setPhase('room')
    }
  }

  async function submit(textOverride?: string) {
    if (!question || saving || isAnswered) return
    const text = (textOverride ?? draft).trim()
    if (!text) {
      setActionError('Please say or type an answer first.')
      return
    }
    stopListening()
    stopSpeaking()
    setSaving(true)
    setActionError(null)
    try {
      const saved = await saveAnswer(question.id, text)
      const next = { ...answers, [question.id]: saved.answerText }
      setAnswers(next)
      saveDraft(question.id, '')

      const open = questions.findIndex((q, i) => i > idx && next[q.id] === undefined)
      const anyOpen = open !== -1 ? open : questions.findIndex((q) => next[q.id] === undefined)

      if (saved.reaction) {
        setReaction({
          questionId: question.id,
          text: saved.reaction,
          nextIdx: anyOpen === -1 ? null : anyOpen,
        })
        if (autoRead) speak(saved.reaction)
        return
      }

      if (anyOpen === -1) {
        setSaving(false)
        await runEvaluation()
        return
      }
      setSpeakSeconds(0)
      setIdx(anyOpen)
      setDraft(loadDraft(questions[anyOpen]?.id))
    } catch (e) {
      setActionError(errMsg(e, 'Could not save your answer. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  function skip() {
    if (window.confirm('Skip this question? It will be scored as unanswered and cannot be changed later.')) {
      void submit(SKIP_TEXT)
    }
  }

  async function cancelAndExit() {
    if (!interview) return
    if (!window.confirm('Cancel this interview? You will not get a score for it.')) return
    try {
      await cancelInterview(interview.id)
      navigate('/dashboard')
    } catch (e) {
      setActionError(errMsg(e, 'Could not cancel the interview.'))
      setMenuOpen(false)
    }
  }

  async function retake() {
    if (!interview) return
    setBusyRetake(true)
    setActionError(null)
    try {
      const id = await createInterview({
        title: interview.title,
        role: interview.role,
        difficulty: interview.difficulty,
        language: interview.language,
      })
      setBusyRetake(false)
      navigate(`/interviews/${id}`)
    } catch (e) {
      setActionError(errMsg(e, 'Could not create a new interview.'))
      setBusyRetake(false)
    }
  }

  //views
  if (phase === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-busy="true">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
          <p className="mt-3 text-sm text-slate-400">Loading your interview…</p>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div role="alert" className="max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-sm font-semibold text-red-200">Could not open this interview</p>
          <p className="mt-2 text-xs text-red-300">{loadError}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button className={ghostBtn} onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className={primaryBtn} onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'evaluating') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" aria-busy="true">
        <div className="max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
          <h1 className="mt-4 text-lg font-bold text-white">Evaluating your answers</h1>
          <p className="mt-2 text-sm text-slate-400">
            Gemini is reviewing your technical depth, communication and confidence. This usually takes 10 to 20
            seconds.
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'cancelled' && interview) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
          <h1 className="text-lg font-bold text-white">This interview was cancelled</h1>
          <p className="mt-2 text-sm text-slate-400">{interview.title}</p>
          {actionError && <p className="mt-3 text-xs text-red-300">{actionError}</p>}
          <div className="mt-5 flex justify-center gap-2">
            <button className={ghostBtn} onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className={primaryBtn} onClick={retake} disabled={busyRetake}>
              {busyRetake ? 'Preparing…' : 'Start again'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'results' && interview) {
    return (
      <ResultView
        interview={interview}
        questions={questions}
        answers={answers}
        evaluation={evaluation}
        busy={busyRetake}
        error={actionError}
        onRetake={retake}
        onDashboard={() => navigate('/dashboard')}
      />
    )
  }

  if (!interview || !question) return null

  const status = speech.speaking ? 'speaking' : speech.listening ? 'listening' : 'idle'
  const isLast = questions.findIndex((q, i) => i !== idx && answers[q.id] === undefined) === -1 && !isAnswered

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
        <span className="text-base font-bold text-white">Intervio</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{interview.title}</p>
          <p className="truncate text-xs text-slate-400">
            {[interview.role, interview.difficulty, `Questions: English`, `Voice: ${language}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden w-40 sm:block" title={`${answeredCount} of ${questions.length} answered`}>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-blue-400 transition-all"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {answeredCount} of {questions.length} answered
            </p>
          </div>
          <span className="font-mono text-sm text-slate-200" aria-label="Elapsed time">
            {fmtTime(elapsed)}
          </span>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              className="h-8 rounded-md bg-slate-700 px-3 text-xs font-medium text-slate-100 hover:bg-slate-600"
            >
              Exit
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 z-30 w-60 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  Save and exit
                  <span className="block text-xs text-slate-500">Answers are saved. Continue later.</span>
                </button>
                <button
                  onClick={cancelAndExit}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-300 hover:bg-slate-800"
                >
                  Cancel interview
                  <span className="block text-xs text-slate-500">Marks it as cancelled with no score.</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 p-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          <CameraPanel
            status={status}
            subtitle={reaction ? reaction.text : question.questionText}
            subtitleLabel={reaction ? 'Gemini reaction · English' : `Question ${idx + 1} · English`}
          />

          <nav aria-label="Questions" className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs font-semibold text-slate-300">Questions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {questions.map((q, i) => {
                const done = answers[q.id] !== undefined
                const current = i === idx
                return (
                  <button
                    key={q.id}
                    onClick={() => goTo(i)}
                    aria-current={current ? 'step' : undefined}
                    aria-label={`Question ${i + 1}${done ? ', answered' : ''}`}
                    className={`flex size-9 items-center justify-center rounded-md text-sm font-semibold transition ${
                      current
                        ? 'bg-blue-500 text-white'
                        : done
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    {done && !current ? '✓' : i + 1}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Tip: answer out loud, as in a real interview. Each question can be answered once.
            </p>
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <QuestionDisplay
            index={idx}
            total={questions.length}
            question={question}
            speaking={speech.speaking}
            ttsSupported={speech.ttsSupported}
            voiceMissing={speech.voiceMissing}
            language={language}
            autoRead={autoRead}
            onAutoReadChange={(v) => {
              setAutoRead(v)
              if (!v) stopSpeaking()
            }}
            onListen={() => speak(question.questionText)}
            onStop={stopSpeaking}
          />

          <AnswerInput
            value={isAnswered ? (answered ?? '') : draft}
            onChange={setDraft}
            readOnly={isAnswered}
            listening={speech.listening}
            transcribing={speech.transcribing}
            interim={speech.interim}
            sttSupported={speech.sttSupported}
            sttError={speech.sttError}
            language={language}
            speakSeconds={speakSeconds}
            maxLength={MAX_ANSWER}
            onMicToggle={() => {
              if (speech.listening) {
                stopListening()
              } else {
                micStartDraftRef.current = draft
                micQuestionIdRef.current = question.id
                startListening()
              }
            }}
            onClear={() => setDraft('')}
            onShortcutSubmit={() => void submit()}
          />

          {reaction && reaction.questionId === question.id && (
            <section
              aria-live="polite"
              className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                  Gemini Interviewer Reaction · English
                </p>
                {speech.ttsSupported && (
                  <button
                    type="button"
                    onClick={() => (speech.speaking ? stopSpeaking() : speak(reaction.text))}
                    className="h-7 rounded-md bg-slate-800 px-2.5 text-xs font-medium text-blue-300 hover:bg-slate-700"
                  >
                    {speech.speaking ? 'Stop' : 'Replay reaction'}
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-white">{reaction.text}</p>
              <div className="mt-3 flex justify-end">
                <button type="button" className={primaryBtn} onClick={() => void continueAfterReaction()}>
                  {reaction.nextIdx === null ? 'Finish & get evaluation' : 'Continue to next question'}
                </button>
              </div>
            </section>
          )}

          {actionError && (
            <div role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {actionError}
              {needsEvaluation && (
                <button className="ml-3 font-semibold underline" onClick={() => void runEvaluation()}>
                  Retry evaluation
                </button>
              )}
            </div>
          )}

          {allAnswered && needsEvaluation && !actionError && !reaction && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
              <p className="text-sm text-slate-200">All questions are answered. Get your score and feedback.</p>
              <button className={`${primaryBtn} mt-3`} onClick={() => void runEvaluation()}>
                Get my evaluation
              </button>
            </div>
          )}

          {!reaction && (
            <div className="flex flex-wrap justify-between gap-2">
              <button className={ghostBtn} onClick={() => goTo(Math.max(0, idx - 1))} disabled={idx === 0 || saving}>
                Previous
              </button>
              <div className="flex gap-2">
                {isAnswered ? (
                  <button
                    className={primaryBtn}
                    onClick={() => goTo(Math.min(questions.length - 1, idx + 1))}
                    disabled={idx === questions.length - 1}
                  >
                    Next question
                  </button>
                ) : (
                  <>
                    <button className={ghostBtn} onClick={skip} disabled={saving}>
                      Skip
                    </button>
                    <button className={primaryBtn} onClick={() => void submit()} disabled={saving || !draft.trim()}>
                      {saving ? 'Reviewing…' : isLast ? 'Submit and finish' : 'Submit answer'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          <p className="text-right text-xs text-slate-500">Tip: Ctrl + Enter submits your answer.</p>
        </div>
      </div>
    </div>
  )
}
