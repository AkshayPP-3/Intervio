import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth.context'
import type { AuthContextValue } from './auth.context'
import { UNAUTHORIZED_EVENT, clearSession, getStoredUser, getToken, saveSession, saveUser } from '../services/api'
import { fetchMe, loginRequest, registerRequest } from '../features/auth/auth.service'
import type { AuthStatus } from '../types/auth.types'
import type { User } from '../types/user.types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => (getToken() ? getStoredUser() : null))
  const [status, setStatus] = useState<AuthStatus>(() =>
    !getToken() ? 'unauthenticated' : getStoredUser() ? 'authenticated' : 'loading',
  )

  // Check the saved token with the server and refresh the user's details.
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    fetchMe()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        saveUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        // A 401 is handled by the unauthorized event below. For a network error
        // keep the saved user so the app still opens, or fall back to signed out.
        if (!cancelled && !getStoredUser()) setStatus('unauthenticated')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Any API call that comes back 401 signs the user out.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null)
      setStatus('unauthenticated')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const login = useCallback<AuthContextValue['login']>(async (input) => {
    const res = await loginRequest(input)
    saveSession(res.token, res.user)
    setUser(res.user)
    setStatus('authenticated')
  }, [])

  const register = useCallback<AuthContextValue['register']>(async (input) => {
    const res = await registerRequest(input)
    saveSession(res.token, res.user)
    setUser(res.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const updateUser = useCallback((next: User) => {
    setUser(next)
    saveUser(next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, isAuthenticated: status === 'authenticated', login, register, logout, updateUser }),
    [status, user, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
