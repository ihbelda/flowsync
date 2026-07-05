export interface User {
  id: number
  fullName: string | null
  email: string
  lastSeenAt: string | null
  createdAt: string | null
}

export interface AuthResponse {
  user: User
  token: string
}

export interface SignupPayload {
  fullName?: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}
