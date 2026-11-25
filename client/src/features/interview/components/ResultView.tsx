import { Button } from '../../../components/ui/Button'
import { FeedbackSection } from '../../evaluation/components/FeedbackSection'
import { ScoreCard } from '../../evaluation/components/ScoreCard'
import { weakestTip } from '../../evaluation/evaluation.service'
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

function tipFor(e: Evaluation): string | null {
  const tip = weakestTip(e)
  return tip ? `${tip} You can retake this interview as many times as you like. Each attempt gets fresh questions.` : null
}

export function ResultView({ interview, questions, answers, evaluation, busy, error, onRetake, onDashboard }: Props) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-300">Interview complete</p>
          <h1 className="mt-1 text-xl font-bold text-white">{interview.title}</h1>
          <p className="mt-1 text-xs text-slate-400">
            {[interview.role, interview.difficulty, interview.language].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onDashboard}>
            Back to dashboard
          </Button>
          <Button onClick={onRetake} loading={busy}>
            {busy ? 'Preparing…' : 'Retake with new questions'}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {!evaluation ? (
        <div className="rounded-lg border border-slate-800/90 bg-slate-800/95 p-5 text-xs text-slate-300">
          No evaluation is available for this interview.
        </div>
      ) : (
        <>
          <ScoreCard
            overall={evaluation.overallScore}
            technical={evaluation.technicalScore}
            communication={evaluation.communicationScore}
            confidence={evaluation.confidenceScore}
          />
          <FeedbackSection
            feedback={evaluation.feedback}
            strengths={evaluation.strengths}
            weaknesses={evaluation.weaknesses}
            tip={tipFor(evaluation)}
          />
        </>
      )}

      <section className="rounded-lg border border-slate-800/90 bg-slate-800/95 p-5">
        <h2 className="text-xs font-bold text-white">Question review</h2>
        <ol className="mt-3 space-y-3">
          {questions.map((q, i) => (
            <li key={q.id} className="rounded-md bg-slate-900 p-4">
              <p className="text-[11px] font-semibold text-blue-300">Question {i + 1}</p>
              <p className="mt-1 text-xs font-medium text-white">{q.questionText}</p>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-400">
                {answers[q.id] ?? 'No answer recorded.'}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
