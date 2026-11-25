import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader } from '../components/ui/Loader'
import { useAuth } from '../hooks/useAuth'

/** Use as a layout route (renders <Outlet />) or wrap children directly. */
export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <Loader fullScreen label="Checking your session…" />
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return children ?? <Outlet />
}
