import { api } from '../../services/api'
import type { AuthResponse, LoginInput, RegisterInput } from '../../types/auth.types'
import type { User } from '../../types/user.types'

export const loginRequest = (input: LoginInput) =>
  api.post<AuthResponse>('/auth/login', { email: input.email.trim(), password: input.password })

export const registerRequest = (input: RegisterInput) =>
  api.post<AuthResponse>('/auth/register', {
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
  })

/** Also used to check that a saved token is still valid. */
export async function fetchMe(): Promise<User> {
  const data = await api.get<{ user: User }>('/users/me')
  return data.user
}

/** Client-side checks that mirror the server's zod rules. */
export function validateAuth(
  mode: 'login' | 'register',
  v: { name: string; email: string; password: string },
): Partial<Record<'name' | 'email' | 'password', string>> {
  const errors: Partial<Record<'name' | 'email' | 'password', string>> = {}
  if (mode === 'register') {
    const name = v.name.trim()
    if (name.length < 2) errors.name = 'Name must be at least 2 characters.'
    else if (name.length > 50) errors.name = 'Name must not exceed 50 characters.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errors.email = 'Enter a valid email address.'
  if (mode === 'register') {
    if (v.password.length < 8) errors.password = 'Password must be at least 8 characters.'
    else if (v.password.length > 100) errors.password = 'Password must not exceed 100 characters.'
  } else if (!v.password) errors.password = 'Password is required.'
  return errors
}
