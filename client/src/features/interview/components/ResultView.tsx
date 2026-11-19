import { parseList } from '../interview.service'
import type { Evaluation, InterviewDetail, Question } from '../interview.service'

type Props = {
  interview: InterviewDetail
  questions: Question[]
  answers: Record<string, string>
  evaluation: Evaluation | null
  busy: boolean
  error: string | null
  onRetake: () => void
  onDashboard: () => void
}

const TIPS: Record<string, string> = {
  Technical: 'Revise the core concepts for this role, then explain each one out loud as if teaching a friend.',
  Communication: 'Answer in a clear order: point first, then a short example, then the result.',
  Confidence: 'Slow down, pause before answering, and avoid filler words. Practise with timed mock answers.',
}

function ScoreRing({ score }: { score: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const value = Math.max(0, Math.min(100, score))
  return (
    <svg width="132" height="132" viewBox="0 0 132 132" role="img" aria-label={`Overall score ${Math.round(value)} percent`}>
      <circle cx="66" cy="66" r={r} fill="none" stroke="#334155" strokeWidth="10" />
      <circle
        cx="66"
        cy="66"
        r={r}
        fill="none"
        stroke="#60a5fa"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
        transform="rotate(-90 66 66)"
      />
      <text x="66" y="66" textAnchor="middle" dominantBaseline="central" fontSize="30" fontWeight="700" fill="#fff">
        {Math.round(value)}
      </text>
    </svg>
  )
}

export function ResultView({ interview, questions, answers, evaluation, busy, error, onRetake, onDashboard }: Props) {
  const dims = evaluation
    ? [
        { key: 'Technical', value: evaluation.technicalScore },
        { key: 'Communication', value: evaluation.communicationScore },
        { key: 'Confidence', value: evaluation.confidenceScore },
      ]
    : []
  const scored = dims.filter((d): d is { key: string; value: number } => d.value != null)
  const weakest = scored.length ? scored.reduce((a, b) => (b.value < a.value ? b : a)) : null
  const strengths = parseList(evaluation?.strengths ?? null)
  const weaknesses = parseList(evaluation?.weaknesses ?? null)
  const overall = evaluation?.overallScore ?? null

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Interview complete</p>
          <h1 className="mt-1 text-2xl font-bold text-white">{interview.title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {[interview.role, interview.difficulty, interview.language].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDashboard}
            className="h-9 rounded-md bg-slate-700 px-4 text-sm font-medium text-blue-300 hover:bg-slate-600"
          >
            Back to dashboard
          </button>
          <button
            onClick={onRetake}
            disabled={busy}
            className="h-9 rounded-md bg-blue-500 px-4 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60"
          >
            {busy ? 'Preparing…' : 'Retake with new questions'}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {!evaluation ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-sm text-slate-300">
          No evaluation is available for this interview.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-6">
              {overall != null ? <ScoreRing score={overall} /> : <p className="text-slate-400">No score</p>}
              <p className="mt-2 text-sm font-semibold text-white">Overall score</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
              <h2 className="text-sm font-bold text-white">Skill breakdown</h2>
              {dims.map((d) => (
                <div key={d.key} className="mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-200">{d.key}</span>
                    <span className="text-slate-300">{d.value == null ? '—' : `${Math.round(d.value)}%`}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={`h-full rounded-full ${d.key === weakest?.key ? 'bg-amber-400' : 'bg-blue-400'}`}
                      style={{ width: `${Math.max(0, Math.min(100, d.value ?? 0))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {evaluation.feedback && (
            <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
              <h2 className="text-sm font-bold text-white">Feedback</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{evaluation.feedback}</p>
            </section>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
              <h2 className="text-sm font-bold text-emerald-300">Strengths</h2>
              {strengths.length ? (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-300">
                  {strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-400">None listed.</p>
              )}
            </section>
            <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
              <h2 className="text-sm font-bold text-amber-300">What to improve</h2>
              {weaknesses.length ? (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-300">
                  {weaknesses.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-400">None listed.</p>
              )}
            </section>
          </div>

          {weakest && (
            <section className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
              <h2 className="text-sm font-bold text-blue-200">Prepare for your next interview</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Your lowest area was <b>{weakest.key.toLowerCase()}</b> ({Math.round(weakest.value)}%).{' '}
                {TIPS[weakest.key]} You can retake this interview as many times as you like. Each attempt gets
                fresh questions.
              </p>
            </section>
          )}
        </>
      )}

      <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <h2 className="text-sm font-bold text-white">Question review</h2>
        <ol className="mt-3 space-y-3">
          {questions.map((q, i) => (
            <li key={q.id} className="rounded-lg bg-slate-900 p-4">
              <p className="text-xs font-semibold text-blue-300">Question {i + 1}</p>
              <p className="mt-1 text-sm font-medium text-white">{q.questionText}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                {answers[q.id] ?? 'No answer recorded.'}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
