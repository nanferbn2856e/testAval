import type { LoginResponse } from '../types/auth'

const KEY = 'session'

export function saveSession(data: LoginResponse) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getSession(): LoginResponse | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as LoginResponse) : null
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(KEY)
}

// Reemplaza solo el access token (tras renovarlo con el refresh token)
export function updateAccessToken(access: string) {
  const session = getSession()
  if (session) saveSession({ ...session, access })
}