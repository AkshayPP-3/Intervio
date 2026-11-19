import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { UNAUTHORIZED_EVENT, hasSession } from '../features/interview/interview.service'

type InterviewLayoutProps = {
  children: ReactNode
}

/**
 * Full-screen shell for the interview room (no sidebar, so nothing distracts
 * the candidate). Sends signed-out users to /dashboard, which shows the sign-in card.
 */
export function InterviewLayout({ children }: InterviewLayoutProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const onUnauthorized = () => navigate('/dashboard', { replace: true })
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [navigate])

  if (!hasSession()) return <Navigate to="/dashboard" replace />

  return <main className="min-h-screen bg-slate-950 text-slate-100">{children}</main>
}
