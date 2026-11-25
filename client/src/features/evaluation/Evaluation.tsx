import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Loader } from '../../components/ui/Loader'
import { errorMessage } from '../../services/api'
import { formatDateTime, formatShortDate, pct } from '../../utils/helpers'
import { PerformanceChart } from '../dashboard/components/PerformanceChart'
import { createInterview } from '../interview/interview.service'
import { FeedbackSection } from './components/FeedbackSection'
import { ScoreCard } from './components/ScoreCard'
import { getReportDetail, listReports, weakestTip } from './evaluation.service'
import type { Report, ReportDetail } from './evaluation.service'

/** Reports page: every finished interview with its score, feedback and answers. */
export function Evaluation() {
  const navigate = useNavigate()
  const { interviewId } = useParams<{ interviewId: string }>()

  const [reports, setReports] = useState<Report[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [detailState, setDetailState] = useState<{ id: string; data?: ReportDetail; error?: string } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [retaking, setRetaking] = useState(false)
  const [tick, setTick] = useState(0)

  const load = () => {
    setError(null)
    setTick((t) => t + 1)
  }

  useEffect(() => {
    let cancelled = false
    listReports()
      .then((list) => {
        if (!cancelled) setReports(list)
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e, 'Could not load your reports.'))
      })
    return () => {
      cancelled = true
    }
  }, [tick])

  const selected = reports?.find((r) => r.interview.id === interviewId) ?? reports?.[0] ?? null
  const selectedId = selected?.interview.id

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    getReportDetail(selectedId)
      .then((data) => {
        if (!cancelled) setDetailState({ id: selectedId, data })
      })
      .catch((e) => {
        if (!cancelled) setDetailState({ id: selectedId, error: errorMessage(e, 'Could not load this report.') })
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  // Only show details that belong to the report being viewed.
  const current = detailState?.id === selectedId ? detailState : null
  const detail = current?.data ?? null
  const detailError = actionError ?? current?.error ?? null

  async function retake() {
    if (!selected) return
    setRetaking(true)
    setActionError(null)
    try {
      const id = await createInterview({
        title: selected.interview.title,
        role: selected.interview.role,
        difficulty: selected.interview.difficulty,
        language: selected.interview.language,
      })
      navigate(`/interviews/${id}`)
    } catch (e) {
      setActionError(errorMessage(e, 'Could not start a new interview.'))
      setRetaking(false)
    }
  }

  const page = 'min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5'

  if (error) {
    return (
      <div className={page}>
        <PageHeader title="Reports" />
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-5">
          <p className="text-xs text-red-300">{error}</p>
          <Button className="mt-3" onClick={load}>
            Try again
          </Button>
        </div>
      </div>
    )
  }
  if (reports === null) {
    return (
      <div className={page}>
        <PageHeader title="Reports" />
        <Loader label="Loading your reports…" />
      </div>
    )
  }
  if (reports.length === 0) {
    return (
      <div className={page}>
        <PageHeader title="Reports" description="Detailed feedback for every finished interview." />
        <Card>
          <p className="text-xs text-slate-300">No reports yet. Finish an interview and its report appears here.</p>
          <Button className="mt-3" onClick={() => navigate('/interviews')}>
            Start an interview
          </Button>
        </Card>
      </div>
    )
  }

  const trend = reports
    .slice()
    .reverse()
    .filter((r) => r.evaluation.overallScore != null)
    .map((r) => ({ day: formatShortDate(r.interview.createdAt), score: Math.round(r.evaluation.overallScore as number) }))

  return (
    <div className={page}>
      <PageHeader
        title="Reports"
        description="Detailed feedback for every finished interview."
        actions={
          selected && (
            <>
              <Button size="sm" variant="secondary" onClick={() => window.print()}>
                Download / print
              </Button>
              <Button size="sm" loading={retaking} onClick={() => void retake()}>
                Retake with new questions
              </Button>
            </>
          )
        }
      />

      <Card title="Score history" className="mb-3">
        <PerformanceChart data={trend} />
      </Card>

      <div className="grid items-start gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="max-h-[70vh] space-y-2 overflow-y-auto print:hidden">
          {reports.map((r) => {
            const active = r.interview.id === selectedId
            return (
              <button
                key={r.interview.id}
                onClick={() => navigate(`/reports/${r.interview.id}`)}
                aria-current={active ? 'true' : undefined}
                className={`block w-full rounded-md border p-2.5 text-left transition ${
                  active ? 'border-blue-400/70 bg-slate-900' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-white">{r.interview.title}</span>
                  <span className="shrink-0 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                    {pct(r.evaluation.overallScore)}
                  </span>
                </span>
                <span className="mt-1 block truncate text-[11px] text-slate-400">
                  {r.interview.role} · {formatDateTime(r.interview.createdAt)}
                </span>
              </button>
            )
          })}
        </Card>

        <div className="min-w-0 space-y-3">
          {selected && (
            <div>
              <h2 className="text-sm font-bold text-white">{selected.interview.title}</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {[selected.interview.role, selected.interview.difficulty, selected.interview.language]
                  .filter(Boolean)
                  .join(' · ')}{' '}
                · {formatDateTime(selected.interview.createdAt)}
              </p>
            </div>
          )}
          {detailError && (
            <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {detailError}
            </p>
          )}
          {selected && (
            <>
              <ScoreCard
                overall={selected.evaluation.overallScore}
                technical={selected.evaluation.technicalScore}
                communication={selected.evaluation.communicationScore}
                confidence={selected.evaluation.confidenceScore}
              />
              <FeedbackSection
                feedback={selected.evaluation.feedback}
                strengths={selected.evaluation.strengths}
                weaknesses={selected.evaluation.weaknesses}
                tip={weakestTip(selected.evaluation)}
              />
            </>
          )}

          <Card title="Question review">
            {!detail && !detailError && <Loader label="Loading questions and answers…" />}
            {detail && (
              <ol className="space-y-3">
                {detail.questions.map((q, i) => (
                  <li key={q.id} className="rounded-md bg-slate-900 p-3">
                    <p className="text-[11px] font-semibold text-blue-300">Question {i + 1}</p>
                    <p className="mt-1 text-xs font-medium text-white">{q.questionText}</p>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-400">
                      {detail.answers[q.id] ?? 'No answer recorded.'}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
