import { Sidebar } from '../components/common/Sidebar'
import { Dashboard } from '../features/dashboard/Dashboard'

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="flex h-14 items-center border-b border-slate-800 bg-slate-900 px-4">
          <div className="relative w-full max-w-xl">
            <input
              aria-label="Search"
              placeholder="Search pages, e.g. resume, coding, report"
              className="h-8 w-full rounded border-0 bg-slate-800 px-3 text-xs text-slate-200 outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button aria-label="Notifications" className="flex size-7 items-center justify-center rounded-full bg-slate-800 text-slate-300">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </button>
            <button aria-label="Profile" className="flex size-7 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
              A
            </button>
          </div>
        </header>
        <main>
          <Dashboard />
        </main>
      </div>
    </div>
  )
}
