import { createContext } from 'react'
import type { AuthStatus, LoginInput, RegisterInput } from '../types/auth.types'
import type { User } from '../types/user.types'

export type AuthContextValue = {
  status: AuthStatus
  user: User | null
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  /** Use after the user edits their name or email. */
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
