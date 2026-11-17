import { api } from './client'
import type { LoginPayload, LoginResponse, RegisterPayload } from '../types/auth'

export async function login({ email, password }: LoginPayload): Promise<LoginResponse> {
  // SimpleJWT espera el campo "username"; en este proyecto es el correo.
  const { data } = await api.post<LoginResponse>('/auth/login/', {
    username: email,
    password,
  })
  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post('/auth/register/', payload)
  return data
}
