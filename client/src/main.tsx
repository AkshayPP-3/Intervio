import { Component, StrictMode } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { APP_NAME } from './utils/constants'
import './index.css'
import App from './App.tsx'

type BoundaryState = { error: Error | null }

/** Shows a friendly screen instead of a blank page if something crashes. */
class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Intervio crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
        <div className="max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-6 text-center">
          <h1 className="text-lg font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-400">{this.state.error.message}</p>
          <button
            className="mt-4 h-9 rounded-md bg-blue-500 px-4 text-sm font-semibold text-white hover:bg-blue-400"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
}

document.title = APP_NAME

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
