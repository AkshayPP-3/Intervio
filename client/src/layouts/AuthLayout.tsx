import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Footer } from '../components/common/Footer'
import { Loader } from '../components/ui/Loader'
import { useAuth } from '../hooks/useAuth'
import { APP_NAME } from '../utils/constants'

/** Centered card for login, register and password pages. */
export function AuthLayout() {
  const { status } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  if (status === 'loading') return <Loader fullScreen />
  if (status === 'authenticated') return <Navigate to={from ?? '/dashboard'} replace />

  return (
    <main className="flex min-h-screen flex-col bg-[#071020] text-slate-100">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h1 className="mb-1 text-center text-xl font-bold text-white">{APP_NAME}</h1>
          <p className="mb-5 text-center text-xs text-slate-400">AI mock interviews in your own language</p>
          <div className="rounded-lg border border-slate-800 bg-slate-800/90 p-5">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
