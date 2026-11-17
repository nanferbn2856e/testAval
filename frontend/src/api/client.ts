import axios, { type InternalAxiosRequestConfig } from 'axios'
import { clearSession, getSession, updateAccessToken } from '../lib/session'

const baseURL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Las rutas de autenticación nunca llevan token ni se reintentan
function isAuthRoute(url?: string): boolean {
  return Boolean(url?.includes('/auth/'))
}

// Adjunta el access token (si hay sesión) a cada petición
api.interceptors.request.use((config) => {
  const access = getSession()?.access
  if (access && !isAuthRoute(config.url)) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

// Una sola renovación a la vez: si varias peticiones fallan juntas, comparten la promesa
let refreshing: Promise<string> | null = null

function refreshAccessToken(): Promise<string> {
  if (!refreshing) {
    const refresh = getSession()?.refresh
    if (!refresh) return Promise.reject(new Error('Sin refresh token'))

    // axios "limpio" (sin interceptores) para no entrar en un bucle
    refreshing = axios
      .post<{ access: string }>(`${baseURL}/auth/refresh/`, { refresh })
      .then(({ data }) => {
        updateAccessToken(data.access)
        return data.access
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

function endSession() {
  clearSession()
  if (window.location.pathname !== '/auth') {
    window.location.replace('/auth')
  }
}

// Si el access token expiró (401), lo renueva y repite la petición una vez
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) throw error

    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const isExpired =
      error.response?.status === 401 &&
      !original._retry &&
      !isAuthRoute(original.url) &&
      Boolean(getSession())

    if (!isExpired) throw error

    original._retry = true
    try {
      const access = await refreshAccessToken()
      original.headers.Authorization = `Bearer ${access}`
      return api(original)
    } catch {
      endSession()
      throw error
    }
  },
)
