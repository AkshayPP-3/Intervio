import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Loader } from '../../components/ui/Loader'
import { errorMessage } from '../../services/api'
import { average, formatDate, pct } from '../../utils/helpers'
import { listReports } from '../evaluation/evaluation.service'
import type { Report } from '../evaluation/evaluation.service'

/** Days in a row, ending today or yesterday, with at least one finished interview. */
function currentStreak(reports: Report[]): number {
  const days = new Set(reports.map((r) => new Date(r.interview.createdAt).toDateString()))
  let streak = 0
  const d = new Date()
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1)
  while (days.has(d.toDateString())) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/**
 * Personal leaderboard: your best attempts ranked by score.
 * A ranking against other users needs a server endpoint that does not exist yet.
 */
export function Leaderboard() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<Report[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listReports()
      .then((r) => {
        if (!cancelled) setReports(r)
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e, 'Could not load your results.'))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const list = reports ?? []
    const ranked = list
      .filter((r) => r.evaluation.overallScore != null)
      .sort((a, b) => (b.evaluation.overallScore ?? 0) - (a.evaluation.overallScore ?? 0))
    const best = ranked[0]?.evaluation.overallScore ?? null
    const byRole = new Map<string, number[]>()
    ranked.forEach((r) => byRole.set(r.interview.role, [...(byRole.get(r.interview.role) ?? []), r.evaluation.overallScore ?? 0]))
    const roles = [...byRole.entries()]
      .map(([role, scores]) => ({ role, avg: average(scores) ?? 0, count: scores.length }))
      .sort((a, b) => b.avg - a.avg)
    return {
      ranked,
      best,
      avg: average(ranked.map((r) => r.evaluation.overallScore)),
      streak: currentStreak(list),
      roles,
      badges: [
        { name: 'First interview', earned: list.length >= 1 },
        { name: '5 interviews', earned: list.length >= 5 },
        { name: 'Score 75+', earned: (best ?? 0) >= 75 },
        { name: 'Score 90+', earned: (best ?? 0) >= 90 },
        { name: '3-day streak', earned: currentStreak(list) >= 3 },
      ],
    }
  }, [reports])

  const page = 'min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5'
  if (error) {
    return (
      <div className={page}>
        <PageHeader title="Leaderboard" />
        <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      </div>
    )
  }
  if (!reports) {
    return (
      <div className={page}>
        <PageHeader title="Leaderboard" />
        <Loader label="Ranking your results…" />
      </div>
    )
  }

  return (
    <div className={page}>
      <PageHeader title="Leaderboard" description="Your personal bests, ranked by score. Rankings against other users are not available yet." />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ['Best score', pct(stats.best)],
          ['Average score', pct(stats.avg)],
          ['Finished interviews', String(reports.length)],
          ['Day streak', String(stats.streak)],
        ].map(([title, value]) => (
          <div key={title} className="min-h-86px rounded-lg border border-slate-800/90 bg-slate-800/95 px-3 py-3">
            <p className="text-[11px] text-slate-300">{title}</p>
            <p className="mt-2 text-[21px] leading-none font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Card title="Your top attempts" className="xl:col-span-2">
          {stats.ranked.length === 0 ? (
            <div>
              <p className="text-xs text-slate-400">Finish an interview to get ranked.</p>
              <Button className="mt-3" size="sm" onClick={() => navigate('/interviews')}>
                Start an interview
              </Button>
            </div>
          ) : (
            <ol>
              {stats.ranked.slice(0, 10).map((r, i) => (
                <li key={r.interview.id} className="border-b border-slate-700 last:border-0">
                  <button
                    onClick={() => navigate(`/reports/${r.interview.id}`)}
                    className="flex w-full items-center gap-3 rounded-md px-1 py-2.5 text-left hover:bg-slate-700/40"
                  >
                    <span className="w-6 text-sm font-bold text-slate-400">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-white">{r.interview.title}</span>
                      <span className="block truncate text-[11px] text-slate-400">
                        {r.interview.role} · {formatDate(r.interview.createdAt)}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-blue-300">{pct(r.evaluation.overallScore)}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <div className="grid content-start gap-3">
          <Card title="Badges">
            <div className="flex flex-wrap gap-1.5">
              {stats.badges.map((b) => (
                <span
                  key={b.name}
                  title={b.earned ? 'Earned' : 'Not earned yet'}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    b.earned ? 'bg-blue-500/20 text-blue-200' : 'bg-slate-700/50 text-slate-500'
                  }`}
                >
                  {b.name}
                </span>
              ))}
            </div>
          </Card>
          <Card title="Best by topic">
            {stats.roles.length === 0 ? (
              <p className="text-xs text-slate-400">Nothing to compare yet.</p>
            ) : (
              stats.roles.slice(0, 6).map((r) => (
                <div key={r.role} className="mb-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="truncate text-slate-200">{r.role}</span>
                    <span className="text-slate-300">
                      {pct(r.avg)} · {r.count}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.min(100, r.avg)}%` }} />
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
