import type { User } from './user.types'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type AuthState = {
  status: AuthStatus
  user: User | null
  isAuthenticated: boolean
}

export type LoginInput = { email: string; password: string }
export type RegisterInput = { name: string; email: string; password: string }
export type AuthResponse = { user: User; token: string }
