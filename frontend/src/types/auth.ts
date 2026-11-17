export interface AuthUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_superuser: boolean
  roles: string[]
}

// El backend usa el correo como usuario de acceso (username = email).
export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: AuthUser
}

export interface RegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
}
