import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../hooks/useAuth'
import { errorMessage } from '../../services/api'
import { average, formatShortDate, parseList, pct } from '../../utils/helpers'
import type { DashboardData } from '../../types/interview.types'
import { createInterview } from '../interview/interview.service'
import { PerformanceChart } from './components/PerformanceChart'
import { RecentInterviews } from './components/RecentInterviews'
import { StatsCard } from './components/StatsCard'
import { countAnsweredQuestions, getDashboard } from './dashboard.service'

const QUICK_PRACTICE = [
  { label: 'Aptitude', role: 'Aptitude' },
  { label: 'Coding / DSA', role: 'Coding and DSA' },
  { label: 'HR and Behavioural', role: 'HR and Behavioural' },
  { label: 'Communication', role: 'Communication' },
]

const PRACTICE_FOR: Record<string, { label: string; role: string }> = {
  Technical: { label: 'Technical', role: 'Technical' },
  Communication: { label: 'Communication', role: 'Communication' },
  Confidence: { label: 'HR and Behavioural', role: 'HR and Behavioural' },
}

function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [answered, setAnswered] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const dashboard = await getDashboard()
        if (cancelled) return
        setData(dashboard)
        setLoading(false)

        if (typeof dashboard.stats.answeredQuestions === 'number') {
          setAnswered(dashboard.stats.answeredQuestions)
          return
        }

        setAnswered(null)
        if (dashboard.stats.completedInterviews === 0) {
          setAnswered(0)
          return
        }
        try {
          const count = await countAnsweredQuestions()
          if (!cancelled) setAnswered(count)
        } catch {
          /* leave as "—" */
        }
      } catch (e) {
        if (cancelled) return
        setError(errorMessage(e, 'Something went wrong'))
        setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, answered, error, loading, reload }
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-86px rounded-lg bg-slate-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="h-72 rounded-lg bg-slate-800 xl:col-span-2" />
        <div className="h-72 rounded-lg bg-slate-800" />
      </div>
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, answered, error, loading, reload } = useDashboard()
  const [practiceBusy, setPracticeBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const userName = user?.name?.split(' ')[0] ?? 'there'

  async function startPractice(label: string, role: string) {
    setPracticeBusy(label)
    setActionError(null)
    try {
      const id = await createInterview({
        title: `${label} practice`,
        role,
        difficulty: 'Intermediate',
        language: 'English',
      })
      navigate(`/interviews/${id}`)
    } catch (e) {
      setActionError(errorMessage(e, 'Could not start practice.'))
      setPracticeBusy(null)
    }
  }

  const header = (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[15px] font-bold text-white">Overview</h1>
        <p className="mt-1 text-xs text-blue-300">
          {data && data.stats.totalInterviews > 0
            ? `Welcome back, ${userName}. You have completed ${data.stats.completedInterviews} of ${data.stats.totalInterviews} interviews.`
            : `Welcome back, ${userName}. Take your first interview to see your stats.`}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={reload} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => navigate('/reports')}>
          View full report
        </Button>
      </div>
    </div>
  )

  const page = 'min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5'

  if (loading && !data) {
    return (
      <div className={page}>
        {header}
        <DashboardSkeleton />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className={page}>
        {header}
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-5">
          <p className="text-sm font-semibold text-red-200">Could not load your dashboard</p>
          <p className="mt-1 text-xs text-red-300">{error}</p>
          <Button className="mt-4" onClick={reload}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { stats, recentInterviews, recentEvaluations } = data

  const trend = recentEvaluations
    .filter((e) => e.overallScore != null)
    .slice()
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    .map((e) => ({ day: formatShortDate(e.createdAt), score: Math.round(e.overallScore as number) }))

  const dims = [
    { key: 'Technical', value: average(recentEvaluations.map((e) => e.technicalScore)) },
    { key: 'Communication', value: average(recentEvaluations.map((e) => e.communicationScore)) },
    { key: 'Confidence', value: average(recentEvaluations.map((e) => e.confidenceScore)) },
  ]
  const scored = dims.filter((d): d is { key: string; value: number } => d.value != null)
  const weakest = scored.length ? scored.reduce((a, b) => (b.value < a.value ? b : a)) : null
  const strongest = scored.length ? scored.reduce((a, b) => (b.value > a.value ? b : a)) : null

  const latest = recentEvaluations[0]
  const strengths = parseList(latest?.strengths).slice(0, 3)
  const weaknesses = parseList(latest?.weaknesses).slice(0, 3)
  const unfinished = recentInterviews.find((i) => i.status === 'IN_PROGRESS')

  let suggestion: ReactNode
  if (stats.totalInterviews === 0) {
    suggestion = (
      <>
        <p className="text-sm leading-6 text-slate-300">
          Save your resume for reference, then start a role-based interview. Intervio writes the questions for your role.
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Button size="sm" onClick={() => navigate('/interviews')}>
            Start an interview
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/resume')}>
            Upload resume
          </Button>
        </div>
      </>
    )
  } else if (unfinished) {
    suggestion = (
      <>
        <p className="text-sm leading-6 text-slate-300">
          You left “{unfinished.title}” unfinished. Complete it to get your evaluation and score.
        </p>
        <div className="mt-auto pt-3">
          <Button size="sm" onClick={() => navigate(`/interviews/${unfinished.id}`)}>
            Continue interview
          </Button>
        </div>
      </>
    )
  } else if (weakest) {
    const target = PRACTICE_FOR[weakest.key]
    suggestion = (
      <>
        <p className="text-sm leading-6 text-slate-300">
          Your {weakest.key.toLowerCase()} score ({pct(weakest.value)}) is your lowest. A short{' '}
          {target?.label.toLowerCase()} session is the quickest way to raise your average.
        </p>
        <div className="mt-auto pt-3">
          <Button
            size="sm"
            disabled={practiceBusy !== null}
            onClick={() => target && void startPractice(target.label, target.role)}
          >
            {practiceBusy === target?.label ? 'Preparing…' : `Practice ${target?.label}`}
          </Button>
        </div>
      </>
    )
  } else {
    suggestion = (
      <>
        <p className="text-sm leading-6 text-slate-300">
          Start another interview to keep improving. You can retake interviews as many times as you like.
        </p>
        <div className="mt-auto pt-3">
          <Button size="sm" onClick={() => navigate('/interviews')}>
            New interview
          </Button>
        </div>
      </>
    )
  }

  return (
    <div className={page}>
      {header}

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          Refresh failed: {error}. Showing the last loaded data.
        </p>
      )}
      {actionError && (
        <p role="alert" className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {actionError}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatsCard title="Total interviews" value={stats.totalInterviews} />
        <StatsCard title="Average score" value={pct(stats.averageScore)} />
        <StatsCard title="Questions answered" value={answered == null ? '—' : answered} />
        <StatsCard title="Best score" value={pct(stats.bestScore)} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Card
          title="Score trend"
          className="xl:col-span-2"
          action={<span className="text-[10px] text-slate-400">Latest {trend.length || 5} evaluated interviews</span>}
        >
          <PerformanceChart data={trend} />
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1">
          <Card title="Strengths and weaknesses">
            {scored.length === 0 ? (
              <p className="text-xs leading-5 text-slate-400">Skill analysis appears after your first interview.</p>
            ) : (
              <>
                {dims.map((d) => (
                  <div key={d.key} className="mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-200">{d.key}</span>
                      <span className="text-slate-300">{pct(d.value)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className={`h-full rounded-full ${d.key === weakest?.key ? 'bg-amber-400' : 'bg-blue-400'}`}
                        style={{ width: `${Math.min(100, Math.max(0, d.value ?? 0))}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-300">
                  Strongest: <b className="text-white">{strongest?.key}</b>. Work on:{' '}
                  <b className="text-white">{weakest?.key}</b>.
                </p>
                {(strengths.length > 0 || weaknesses.length > 0) && (
                  <div className="mt-3 border-t border-slate-700 pt-3 text-xs text-slate-300">
                    {strengths.length > 0 && (
                      <>
                        <p className="font-semibold text-emerald-300">From your latest interview</p>
                        <ul className="mt-1 list-disc space-y-1 pl-4">
                          {strengths.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {weaknesses.length > 0 && (
                      <>
                        <p className="mt-2 font-semibold text-amber-300">To improve</p>
                        <ul className="mt-1 list-disc space-y-1 pl-4">
                          {weaknesses.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>

          <Card title="AI suggestion" className="flex flex-col">
            {suggestion}
          </Card>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Card
          title="Interview history"
          className="xl:col-span-2"
          action={
            <div className="flex gap-2">
              {stats.totalInterviews > recentInterviews.length && (
                <Button size="sm" variant="secondary" onClick={() => navigate('/interviews')}>
                  View all
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => navigate('/interviews/new')}>
                New interview
              </Button>
            </div>
          }
        >
          <RecentInterviews
            interviews={recentInterviews}
            evaluations={recentEvaluations}
            onOpen={(id) => navigate(`/interviews/${id}`)}
          />
        </Card>

        <Card title="Quick practice">
          <p className="mb-3 text-[11px] text-slate-400">Starts a 5-question set written by Intervio.</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PRACTICE.map((p) => (
              <Button
                key={p.label}
                size="sm"
                variant="secondary"
                disabled={practiceBusy !== null}
                onClick={() => void startPractice(p.label, p.role)}
              >
                {practiceBusy === p.label ? 'Preparing…' : p.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
