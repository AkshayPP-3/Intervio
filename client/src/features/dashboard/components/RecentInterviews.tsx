import { STATUS_LABEL, STATUS_STYLE } from '../../../utils/constants'
import { formatDate, pct } from '../../../utils/helpers'
import type { Evaluation, Interview } from '../../../types/interview.types'

type RecentInterviewsProps = {
  interviews: Interview[]
  evaluations: Evaluation[]
  onOpen: (id: string) => void
}

export function RecentInterviews({ interviews, evaluations, onOpen }: RecentInterviewsProps) {
  if (interviews.length === 0) {
    return <p className="text-xs text-slate-400">No interviews yet. Your history will appear here.</p>
  }
  const byInterview = new Map(evaluations.map((e) => [e.interviewId, e]))
  return (
    <ul className="divide-y divide-slate-700">
      {interviews.map((i) => {
        const ev = byInterview.get(i.id)
        return (
          <li key={i.id}>
            <button
              onClick={() => onOpen(i.id)}
              className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-3 text-left transition hover:bg-slate-700/50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">{i.title}</span>
                <span className="block truncate text-xs text-slate-400">
                  {[i.role, i.difficulty, i.language].filter(Boolean).join(' · ')} · {formatDate(i.createdAt)}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {ev?.overallScore != null && <span className="text-sm font-semibold text-white">{pct(ev.overallScore)}</span>}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[i.status]}`}>
                  {STATUS_LABEL[i.status]}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
