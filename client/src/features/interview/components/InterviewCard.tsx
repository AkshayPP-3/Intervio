import { Button } from '../../../components/ui/Button'
import { STATUS_LABEL, STATUS_STYLE } from '../../../utils/constants'
import { formatDate, pct } from '../../../utils/helpers'
import type { Evaluation, Interview } from '../../../types/interview.types'

type InterviewCardProps = {
  interview: Interview
  evaluation?: Evaluation | undefined
  onOpen: () => void
  onReport: () => void
  onDelete: () => void
}

export function InterviewCard({ interview, evaluation, onOpen, onReport, onDelete }: InterviewCardProps) {
  const meta = [interview.role, interview.difficulty, interview.language].filter(Boolean).join(' · ')
  return (
    <article className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2.5">
      <div className="min-w-0">
        <h3 className="truncate text-xs font-semibold text-white">{interview.title}</h3>
        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {meta} · {formatDate(interview.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {evaluation?.overallScore != null && (
          <span className="text-xs font-semibold text-white">{pct(evaluation.overallScore)}</span>
        )}
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[interview.status]}`}>
          {STATUS_LABEL[interview.status]}
        </span>
        {interview.status === 'IN_PROGRESS' && (
          <Button size="sm" onClick={onOpen}>
            Continue
          </Button>
        )}
        {interview.status === 'COMPLETED' && (
          <Button size="sm" variant="secondary" onClick={onReport}>
            View report
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDelete} aria-label={`Delete ${interview.title}`}>
          Delete
        </Button>
      </div>
    </article>
  )
}
