import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/common/Sidebar'
import {
  Dashboard,
  UNAUTHORIZED_EVENT,
  apiRequest,
  clearSession,
  getStoredUser,
  getToken,
  saveSession,
} from '../features/dashboard/Dashboard'
import type { SessionUser } from '../features/dashboard/Dashboard'
import { InterviewList } from '../features/interview/pages/InterviewList'
import { Practice } from '../features/practice/Practice'

//search targets

const PAGES = [
  { name: 'Dashboard', path: '/dashboard', words: 'home overview stats' },
  { name: 'Interviews', path: '/interviews', words: 'interview mock history start' },
  { name: 'Practice', path: '/practice', words: 'aptitude coding dsa hr communication' },
  { name: 'AI Assistant', path: '/ai-assistant', words: 'chat gemini help bot' },
  { name: 'Reports', path: '/reports', words: 'report score feedback evaluation' },
  { name: 'Resume', path: '/resume', words: 'cv upload ats' },
  { name: 'Leaderboard', path: '/leaderboard', words: 'rank top' },
  { name: 'Settings', path: '/settings', words: 'profile account theme language' },
]

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside])
}

//search
function SearchBox() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const q = query.trim().toLowerCase()
  const results = q
    ? PAGES.filter((p) => `${p.name} ${p.words}`.toLowerCase().includes(q))
    : PAGES

  function go(path: string) {
    navigate(path)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <input
        aria-label="Search"
        value={query}
        placeholder="Search pages, e.g. resume, coding, report"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => Math.min(a + 1, results.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => Math.max(a - 1, 0))
          } else if (e.key === 'Enter' && results[active]) {
            go(results[active].path)
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        className="h-9 w-full rounded-md border-0 bg-slate-800 px-3 text-sm text-slate-200 outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-blue-400"
      />
      {open && (
        <ul className="absolute left-0 right-0 top-11 z-30 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
          {results.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">No pages match “{query}”</li>}
          {results.map((p, i) => (
            <li key={p.path}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(p.path)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                  i === active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p.name}
                <span className="text-xs text-slate-500">{p.path}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// notifications

type PendingInterview = { id: string; title: string; status: string }

function Notifications() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<PendingInterview[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  async function toggle() {
    const next = !open
    setOpen(next)
    if (!next) return
    setError(null)
    try {
      const all = await apiRequest<PendingInterview[]>('/interviews')
      setItems(all.filter((i) => i.status === 'IN_PROGRESS'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load notifications')
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Notifications"
        aria-expanded={open}
        onClick={toggle}
        className="relative flex size-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {items && items.length > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-blue-400" />}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 w-72 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl">
          <p className="text-xs font-semibold text-white">Notifications</p>
          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
          {!error && items === null && <p className="mt-2 text-xs text-slate-400">Loading…</p>}
          {!error && items && items.length === 0 && (
            <p className="mt-2 text-xs text-slate-400">You are all caught up.</p>
          )}
          {!error &&
            items?.map((i) => (
              <button
                key={i.id}
                onClick={() => {
                  setOpen(false)
                  navigate(`/interviews/${i.id}`)
                }}
                className="mt-2 block w-full rounded-md bg-slate-800 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700"
              >
                <span className="font-medium text-white">{i.title}</span>
                <br />
                <span className="text-amber-300">Unfinished. Tap to continue.</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

//profile menu

function ProfileMenu({ user, onSignOut }: { user: SessionUser | null; onSignOut: () => void }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Profile"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white hover:bg-blue-400"
      >
        {(user?.name?.[0] ?? 'U').toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 w-56 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl">
          <div className="px-2 py-2">
            <p className="truncate text-sm font-semibold text-white">{user?.name ?? 'Signed in'}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false)
              navigate('/settings')
            }}
            className="block w-full rounded-md px-2 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
          >
            Settings
          </button>
          <button
            onClick={onSignOut}
            className="block w-full rounded-md px-2 py-2 text-left text-sm text-red-300 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

//sign in/up

type AuthResult = { user: SessionUser; token: string }

function AuthCard({ onDone }: { onDone: (user: SessionUser) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (mode === 'register' && name.trim().length < 2) return setError('Enter your name (2+ characters).')
    if (password.length < (mode === 'register' ? 8 : 1)) return setError('Password must be at least 8 characters.')
    setBusy(true)
    try {
      const body = mode === 'register' ? { name: name.trim(), email, password } : { email, password }
      const res = await apiRequest<AuthResult>(`/auth/${mode}`, { method: 'POST', body })
      saveSession(res.token, res.user)
      onDone(res.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setBusy(false)
    }
  }

  const field =
    'mt-1 h-10 w-full rounded-md border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-blue-400'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-6">
        <h1 className="text-xl font-bold">Intervio</h1>
        <p className="mt-1 text-sm text-slate-400">
          {mode === 'login' ? 'Sign in to continue your practice.' : 'Create an account to start practising.'}
        </p>

        <div className="mt-4 grid grid-cols-2 rounded-md bg-slate-900 p-1 text-sm">
          {(['login', 'register'] as const).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => {
                setMode(m)
                setError(null)
              }}
              className={`rounded py-1.5 ${mode === m ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {mode === 'register' && (
          <label className="mt-4 block text-xs font-medium text-slate-300">
            Name
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
        )}
        <label className="mt-3 block text-xs font-medium text-slate-300">
          Email
          <input
            className={field}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="mt-3 block text-xs font-medium text-slate-300">
          Password
          <input
            className={field}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 h-10 w-full rounded-md bg-blue-500 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60"
        >
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

//placeholder for pages

function ComingSoon() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = pathname.split('/').filter(Boolean).join(' / ') || 'This page'
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-lg font-bold capitalize text-white">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        This page is not built yet. The Dashboard links here, so it will work once you add the route.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-4 h-9 rounded-md bg-slate-700 px-4 text-sm text-blue-300 hover:bg-slate-600"
      >
        Back to dashboard
      </button>
    </div>
  )
}

//layout

export function MainLayout(): ReactNode {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState<boolean>(() => !!getToken())
  const [user, setUser] = useState<SessionUser | null>(() => getStoredUser())

  // validate the saved token and refresh the user's name
  useEffect(() => {
    if (!authed) return
    let cancelled = false
    apiRequest<{ user: SessionUser }>('/users/me')
      .then((d) => {
        if (cancelled) return
        setUser(d.user)
        const token = getToken()
        if (token) saveSession(token, d.user)
      })
      .catch(() => {
        /* 401 is handled by the unauthorized event; other errors are ignored here */
      })
    return () => {
      cancelled = true
    }
  }, [authed])

  // any API call that returns 401 signs the user out
  useEffect(() => {
    const onUnauthorized = () => {
      setAuthed(false)
      setUser(null)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  function signOut() {
    clearSession()
    setAuthed(false)
    setUser(null)
    navigate('/dashboard')
  }

  if (!authed) {
    return (
      <AuthCard
        onDone={(u) => {
          setUser(u)
          setAuthed(true)
        }}
      />
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-800 bg-slate-900 px-4">
          <SearchBox />
          <div className="ml-auto flex items-center gap-2">
            <Notifications />
            <ProfileMenu user={user} onSignOut={signOut} />
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interviews" element={<InterviewList />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
