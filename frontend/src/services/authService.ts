import type { AuthResponse, LoginPayload, SignupPayload, User } from '@/types/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api/v1'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? body.errors?.[0]?.message ?? `Error ${res.status}`)
  }

  return res.json() as Promise<T>
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as User) : null
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

function persist({ user, token }: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/account/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  persist(data)
  return data
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/account/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  persist(data)
  return data
}

export async function logout(): Promise<void> {
  try {
    await request('/account/logout', { method: 'POST' })
  } finally {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export async function fetchProfile(): Promise<User> {
  const data = await request<{ user: User }>('/account/profile')
  return data.user
}
