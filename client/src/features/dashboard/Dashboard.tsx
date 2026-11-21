import { useCallback, useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

//api and session helpers
const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:3000/api'

const TOKEN_KEY = 'intervio_token'
const USER_KEY = 'intervio_user'

export const UNAUTHORIZED_EVENT = 'intervio:unauthorized'

export type SessionUser = { id: string; name: string; email: string }

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

export function saveSession(token: string, user: SessionUser) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    /* storage unavailable: session lasts until reload */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    const init: RequestInit = { method: options.method ?? 'GET', headers }
    if (options.body !== undefined) init.body = JSON.stringify(options.body)
    res = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0)
  }

  const json = (await res.json().catch(() => null)) as {
    message?: string
    data?: T
  } | null

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearSession()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(json?.message ?? `Request failed (${res.status})`, res.status)
  }
  return json?.data as T
}

//types

type InterviewStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

type InterviewLite = {
  id: string
  title: string
  role: string
  difficulty: string | null
  language: string | null
  status: InterviewStatus
  createdAt: string
  updatedAt: string
}

type Evaluation = {
  id: string
  interviewId: string
  overallScore: number | null
  technicalScore: number | null
  communicationScore: number | null
  confidenceScore: number | null
  feedback: string | null
  strengths: string | null
  weaknesses: string | null
  createdAt: string
}

type DashboardData = {
  stats: {
    totalInterviews: number
    completedInterviews: number
    inProgressInterviews: number
    averageScore: number | null
    bestScore: number | null
  }
  recentInterviews: InterviewLite[]
  recentEvaluations: Evaluation[]
}
//small helpers
const pct = (n: number | null | undefined) =>
  n == null ? '—' : `${Math.round(n)}%`

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

/** strengths/weaknesses are stored as a JSON array string by the AI evaluator */
function parseList(text: string | null): string[] {
  if (!text) return []
  try {
    const parsed: unknown = JSON.parse(text)
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === 'string' && x.trim() !== '')
    }
  } catch {
    /* plain text */
  }
  return text
    .split(/\n|•|;/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function average(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => v != null)
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null
}

const LANGUAGES = [
  'English',
  'Hindi',
  'Kannada',
  'Tamil',
  'Telugu',
  'Marathi',
  'Bengali',
  'Malayalam',
  'Gujarati',
  'Punjabi',
]
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
const ROLE_SUGGESTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Mobile Developer',
  'QA Engineer',
]

const QUICK_PRACTICE = [
  { label: 'Aptitude', role: 'Aptitude' },
  { label: 'Coding / DSA', role: 'Coding and DSA' },
  { label: 'HR and Behavioural', role: 'HR and Behavioural' },
  { label: 'Communication', role: 'Communication' },
]

const STATUS_STYLE: Record<InterviewStatus, string> = {
  COMPLETED: 'bg-emerald-500/15 text-emerald-300',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-300',
  CANCELLED: 'bg-slate-600/40 text-slate-300',
}
const STATUS_LABEL: Record<InterviewStatus, string> = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In progress',
  CANCELLED: 'Cancelled',
}

//data hook
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
        const dashboard = await apiRequest<DashboardData>('/dashboard')
        if (cancelled) return
        setData(dashboard)
        setLoading(false)

        // "Questions answered": every completed interview has all questions
        // answered (the evaluator requires it), so count their questions.
        setAnswered(null)
        if (dashboard.stats.completedInterviews === 0) {
          setAnswered(0)
          return
        }
        try {
          const all = await apiRequest<InterviewLite[]>('/interviews')
          const done = all.filter((i) => i.status === 'COMPLETED').slice(0, 20)
          const results = await Promise.allSettled(
            done.map((i) => apiRequest<{ questions?: unknown[] }>(`/interviews/${i.id}`)),
          )
          if (cancelled) return
          setAnswered(
            results.reduce(
              (sum, r) => (r.status === 'fulfilled' ? sum + (r.value.questions?.length ?? 0) : sum),
              0,
            ),
          )
        } catch {
          /* leave as "—" */
        }
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Something went wrong')
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


// Pieces


function Card({
  title,
  action,
  children,
  className = '',
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-lg border border-slate-800/90 bg-slate-800/95 p-3 ${className}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

const ghostBtn =
  'h-8 rounded-md bg-slate-700 px-3 text-xs font-medium text-blue-300 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50'
const primaryBtn =
  'h-8 rounded-md bg-blue-500 px-3 text-xs font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50'

function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="h-86px rounded-lg border border-slate-800/90 bg-slate-800/95 px-3 py-3">
      <p className="text-[11px] text-slate-300">{title}</p>
      <p className="mt-2 text-[21px] leading-none font-bold text-white">{value}</p>
      {hint && <p className="mt-2 text-[10px] text-slate-400">{hint}</p>}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="h-72 rounded-xl bg-slate-800 xl:col-span-2" />
        <div className="h-72 rounded-xl bg-slate-800" />
      </div>
    </div>
  )
}

function CreateInterviewModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [role, setRole] = useState('Frontend Developer')
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [language, setLanguage] = useState('English')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!role.trim()) return setError('Please enter a role or stream.')
    setBusy(true)
    setError(null)
    try {
      const res = await apiRequest<{ interview: { id: string } }>('/interviews', {
        method: 'POST',
        body: {
          title: title.trim() || `${role.trim()} mock interview`,
          role: role.trim(),
          difficulty,
          language,
        },
      })
      onCreated(res.interview.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the interview.')
      setBusy(false)
    }
  }

  const field =
    'mt-1 h-9 w-full rounded-md border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-blue-400'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label="New interview"
        onSubmit={submit}
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-2xl"
      >
        <h2 className="text-base font-bold text-white">New interview</h2>
        <p className="mt-1 text-xs text-slate-400">
          Gemini will generate 5 questions for this role. This can take a few seconds.
        </p>

        <label className="mt-4 block text-xs font-medium text-slate-300">
          Role or stream
          <input
            className={field}
            list="role-suggestions"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            maxLength={100}
            autoFocus
          />
          <datalist id="role-suggestions">
            {ROLE_SUGGESTIONS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </label>

        <label className="mt-3 block text-xs font-medium text-slate-300">
          Title (optional)
          <input
            className={field}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder={`${role.trim() || 'Role'} mock interview`}
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-xs font-medium text-slate-300">
            Difficulty
            <select className={field} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-300">
            Language
            <select className={field} value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={ghostBtn} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className={primaryBtn} disabled={busy}>
            {busy ? 'Generating questions…' : 'Start interview'}
          </button>
        </div>
      </form>
    </div>
  )
}

//Page
export function Dashboard() {
  const navigate = useNavigate()
  const { data, answered, error, loading, reload } = useDashboard()
  const [modalOpen, setModalOpen] = useState(false)
  const [practiceBusy, setPracticeBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const userName = getStoredUser()?.name?.split(' ')[0] ?? 'there'

  async function startPractice(label: string, role: string) {
    setPracticeBusy(label)
    setActionError(null)
    try {
      const res = await apiRequest<{ interview: { id: string } }>('/interviews', {
        method: 'POST',
        body: {
          title: `${label} practice`,
          role,
          difficulty: 'Intermediate',
          language: 'English',
        },
      })
      navigate(`/interviews/${res.interview.id}`)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not start practice.')
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
        <button className={ghostBtn} onClick={() => navigate('/reports')}>
          View full report
        </button>
      </div>
    </div>
  )

  if (loading && !data) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5">
        {header}
        <DashboardSkeleton />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5">
        {header}
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="text-sm font-semibold text-red-200">Could not load your dashboard</p>
          <p className="mt-1 text-xs text-red-300">{error}</p>
          <button className={`${primaryBtn} mt-4`} onClick={reload}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { stats, recentInterviews, recentEvaluations } = data
  const evalByInterview = new Map(recentEvaluations.map((e) => [e.interviewId, e]))

  // chronological trend (oldest to newest)
  const trend = recentEvaluations
    .filter((e) => e.overallScore != null)
    .slice()
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    .map((e) => ({ day: shortDate(e.createdAt), score: Math.round(e.overallScore as number) }))

  const dims = [
    { key: 'Technical', value: average(recentEvaluations.map((e) => e.technicalScore)) },
    { key: 'Communication', value: average(recentEvaluations.map((e) => e.communicationScore)) },
    { key: 'Confidence', value: average(recentEvaluations.map((e) => e.confidenceScore)) },
  ]
  const scored = dims.filter((d): d is { key: string; value: number } => d.value != null)
  const weakest = scored.length ? scored.reduce((a, b) => (b.value < a.value ? b : a)) : null
  const strongest = scored.length ? scored.reduce((a, b) => (b.value > a.value ? b : a)) : null

  const latest = recentEvaluations[0]
  const strengths = parseList(latest?.strengths ?? null).slice(0, 3)
  const weaknesses = parseList(latest?.weaknesses ?? null).slice(0, 3)

  const unfinished = recentInterviews.find((i) => i.status === 'IN_PROGRESS')

  const practiceFor: Record<string, { label: string; role: string }> = {
    Technical: { label: 'Technical', role: 'Technical' },
    Communication: { label: 'Communication', role: 'Communication' },
    Confidence: { label: 'HR and Behavioural', role: 'HR and Behavioural' },
  }

  let suggestion: ReactNode
  if (stats.totalInterviews === 0) {
    suggestion = (
      <>
        <p className="text-sm leading-6 text-slate-300">
          Upload your resume first so Gemini can ask questions about your real projects, or start a
          role-based interview without one.
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <button className={primaryBtn} onClick={() => navigate('/resume')}>
            Upload resume
          </button>
          <button className={ghostBtn} onClick={() => setModalOpen(true)}>
            Start without resume
          </button>
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
          <button className={primaryBtn} onClick={() => navigate(`/interviews/${unfinished.id}`)}>
            Continue interview
          </button>
        </div>
      </>
    )
  } else if (weakest) {
    const target = practiceFor[weakest.key]
    suggestion = (
      <>
        <p className="text-sm leading-6 text-slate-300">
          Your {weakest.key.toLowerCase()} score ({pct(weakest.value)}) is your lowest. A short{' '}
          {target?.label.toLowerCase()} session is the quickest way to raise your average.
        </p>
        <div className="mt-auto pt-3">
          <button
            className={primaryBtn}
            disabled={practiceBusy !== null}
            onClick={() => target && startPractice(target.label, target.role)}
          >
            {practiceBusy === target?.label ? 'Preparing…' : `Practice ${target?.label}`}
          </button>
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
          <button className={primaryBtn} onClick={() => setModalOpen(true)}>
            New interview
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5">
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
        <StatCard
          title="Total interviews"
          value={String(stats.totalInterviews)}
        />
        <StatCard title="Average score" value={pct(stats.averageScore)} />
        <StatCard
          title="Questions answered"
          value={answered == null ? '—' : String(answered)}
        />
        <StatCard title="Practice time" value="0 min" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Card
          title="Score trend (last 7 days)"
          className="xl:col-span-2"
          action={<span className="rounded-md bg-slate-700/70 px-2 py-1 text-[9px] text-blue-300">Load demo data</span>}
        >
          {trend.length === 0 ? (
            <div className="relative h-56">
              <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-slate-700/30 pt-2 text-[10px] text-slate-400">
                {['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v: number) => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#cbd5e1' }}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Score']}
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#60a5fa"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#60a5fa' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1">
          <Card title="Strengths and weaknesses">
            {scored.length === 0 ? (
              <p className="text-xs leading-5 text-slate-400">
                Skill analysis appears after your first interview.
              </p>
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
            {stats.totalInterviews === 0 ? (
              <>
                <p className="text-[11px] leading-5 text-slate-400">
                  Upload your resume first so Gemini can ask questions about your real projects.
                </p>
                <button className={`${primaryBtn} mt-3 w-fit`} onClick={() => navigate('/resume')}>
                  Upload resume
                </button>
              </>
            ) : (
              suggestion
            )}
          </Card>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Card
          title="Interview history"
          className="xl:col-span-2"
          action={
            <button className="h-7 rounded-md bg-slate-700/70 px-2 text-[9px] text-blue-300" onClick={() => setModalOpen(true)}>
              New interview
            </button>
          }
        >
          {recentInterviews.length === 0 ? (
            <p className="text-xs text-slate-400">No interviews yet. Your history will appear here.</p>
          ) : (
            <ul className="divide-y divide-slate-700">
              {recentInterviews.map((i) => {
                const ev = evalByInterview.get(i.id)
                return (
                  <li key={i.id}>
                    <button
                      onClick={() => navigate(`/interviews/${i.id}`)}
                      className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-3 text-left transition hover:bg-slate-700/50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">{i.title}</span>
                        <span className="block truncate text-xs text-slate-400">
                          {[i.role, i.difficulty, i.language].filter(Boolean).join(' · ')} · {longDate(i.createdAt)}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        {ev?.overallScore != null && (
                          <span className="text-sm font-semibold text-white">{pct(ev.overallScore)}</span>
                        )}
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[i.status]}`}>
                          {STATUS_LABEL[i.status]}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card title="Quick practice">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PRACTICE.map((p) => (
              <button
                key={p.label}
                disabled={practiceBusy !== null}
                onClick={() => startPractice(p.label, p.role)}
                className="h-8 rounded-md bg-slate-700 px-3 text-xs text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {practiceBusy === p.label ? 'Preparing…' : p.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {modalOpen && (
        <CreateInterviewModal
          onClose={() => setModalOpen(false)}
          onCreated={(id) => navigate(`/interviews/${id}`)}
        />
      )}
    </div>
  )
}
