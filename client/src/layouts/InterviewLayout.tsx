import { Outlet } from 'react-router-dom'

/** Full-screen shell for the interview room: no sidebar, nothing to distract. */
export function InterviewLayout() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Outlet />
    </main>
  )
}
