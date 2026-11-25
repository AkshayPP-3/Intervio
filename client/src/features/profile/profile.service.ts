import { api, getOrNull } from '../../services/api'
import type { Profile, ProfileInput, User } from '../../types/user.types'

/*  GET|POST|PATCH /profile   (404 on GET = no profile yet)   PATCH /users/me  */

export const getProfile = () => getOrNull<Profile>('/profile')

export const saveProfile = (input: ProfileInput, exists: boolean) =>
  exists ? api.patch<Profile>('/profile', input) : api.post<Profile>('/profile', input)

export async function updateAccount(input: { name?: string; email?: string }): Promise<User> {
  const data = await api.patch<{ user: User }>('/users/me', input)
  return data.user
}

export function validateAccount(name: string, email: string): { name?: string; email?: string } {
  const errors: { name?: string; email?: string } = {}
  const n = name.trim()
  if (n.length < 2) errors.name = 'Name must be at least 2 characters.'
  else if (n.length > 50) errors.name = 'Name must not exceed 50 characters.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.'
  return errors
}
