export type User = {
  id: string
  name: string
  email: string
  createdAt?: string
  updatedAt?: string
}

export type Profile = {
  id: string
  userId: string
  bio: string | null
  phone: string | null
  location: string | null
  education: string | null
  skills: string | null
}

export type ProfileInput = {
  bio?: string
  phone?: string
  location?: string
  education?: string
  skills?: string
}
