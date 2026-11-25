
import type { User } from '../types/user.types'

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:5000/api'

export const TOKEN_KEY = 'intervio_token'
export const USER_KEY = 'intervio_user'
/** Fired when the server says the token is invalid, so the app can sign out. */
export const UNAUTHORIZED_EVENT = 'intervio:unauthorized'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function saveSession(token: string, user: User) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    /* storage unavailable: the session lasts until the page reloads */
  }
}

export function saveUser(user: User) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    /* ignore */
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

type RequestOptions = {
  method?: string
  /** A plain object is sent as JSON, a FormData is sent as multipart. */
  body?: unknown
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  const init: RequestInit = { method: options.method ?? 'GET', headers }

  if (options.body instanceof FormData) {
    init.body = options.body // the browser sets the multipart boundary itself
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(options.body)
  }
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and that the backend is running.', 0)
  }

  const json = (await res.json().catch(() => null)) as { message?: string; data?: T } | null

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearSession()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(json?.message ?? `Request failed (${res.status})`, res.status)
  }
  return json?.data as T
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'POST', body: body ?? {} }),
  patch: <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PATCH', body }),
  del: <T = unknown>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, form: FormData) => apiRequest<T>(path, { method: 'POST', body: form }),
}

/** 404 means "nothing there yet" for several endpoints. */
export async function getOrNull<T>(path: string): Promise<T | null> {
  try {
    return await api.get<T>(path)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export const errorMessage = (e: unknown, fallback = 'Something went wrong. Please try again.') =>
  e instanceof Error && e.message ? e.message : fallback
