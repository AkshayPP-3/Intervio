import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { api, errorMessage } from '../../services/api'
import type { Interview } from '../../types/interview.types'

const PAGES = [
  { name: 'Dashboard', path: '/dashboard', words: 'home overview stats' },
  { name: 'Interviews', path: '/interviews', words: 'interview mock history start new' },
  { name: 'Practice', path: '/practice', words: 'aptitude coding dsa hr communication drill' },
  { name: 'AI Assistant', path: '/ai-assistant', words: 'chat gemini help bot' },
  { name: 'Reports', path: '/reports', words: 'report score feedback evaluation' },
  { name: 'Resume', path: '/resume', words: 'cv upload' },
  { name: 'Leaderboard', path: '/leaderboard', words: 'rank top best' },
  { name: 'Settings', path: '/settings', words: 'profile account language' },
]

function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside])
}

function SearchBox() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close)

  const q = query.trim().toLowerCase()
  const results = q ? PAGES.filter((p) => `${p.name} ${p.words}`.toLowerCase().includes(q)) : PAGES

  function go(path: string) {
    navigate(path)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <input
        aria-label="Search pages"
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
          } else if (e.key === 'Enter' && results[active]) go(results[active].path)
          else if (e.key === 'Escape') setOpen(false)
        }}
        className="h-8 w-full rounded-md border border-slate-800 bg-slate-800/70 px-3 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-400"
      />
      {open && (
        <ul className="absolute left-0 right-0 top-10 z-30 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
          {results.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">No pages match “{query}”</li>}
          {results.map((p, i) => (
            <li key={p.path}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(p.path)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs ${
                  i === active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p.name}
                <span className="text-[10px] text-slate-500">{p.path}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Notifications() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Interview[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close)

  async function toggle() {
    const next = !open
    setOpen(next)
    if (!next) return
    setError(null)
    try {
      const all = await api.get<Interview[]>('/interviews')
      setItems(all.filter((i) => i.status === 'IN_PROGRESS'))
    } catch (e) {
      setError(errorMessage(e, 'Could not load notifications'))
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => void toggle()}
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
          {!error && items && items.length === 0 && <p className="mt-2 text-xs text-slate-400">You are all caught up.</p>}
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

function ProfileMenu() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close)

  return (
    <div ref={ref} className="relative">
      <button aria-label="Profile menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="rounded-full">
        <Avatar name={user?.name} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 w-56 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl">
          <div className="px-2 py-2">
            <p className="truncate text-xs font-semibold text-white">{user?.name ?? 'Signed in'}</p>
            <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false)
              navigate('/settings')
            }}
            className="block w-full rounded-md px-2 py-2 text-left text-xs text-slate-200 hover:bg-slate-800"
          >
            Settings
          </button>
          <button
            onClick={() => {
              setOpen(false)
              logout()
            }}
            className="block w-full rounded-md px-2 py-2 text-left text-xs text-red-300 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-800 bg-slate-900 px-4">
      <SearchBox />
      <div className="ml-auto flex items-center gap-2">
        <Notifications />
        <ProfileMenu />
      </div>
    </header>
  )
}
