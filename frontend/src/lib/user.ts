import type { AuthUser } from '../types/auth'

// Deben coincidir con los grupos definidos en backend/users/roles.py
export const ROLE_ADMIN = 'Administrador'
export const ROLE_CUSTOMER = 'Cliente'

export function getFullName(user: AuthUser): string {
  const name = `${user.first_name} ${user.last_name}`.trim()
  return name || user.username
}

export function isAdmin(user: AuthUser): boolean {
  return user.is_superuser === true || user.roles.includes(ROLE_ADMIN)
}

export function isCustomer(user: AuthUser): boolean {
  return !isAdmin(user) && user.roles.includes(ROLE_CUSTOMER)
}

export function getRoleLabel(user: AuthUser): string {
  if (user.is_superuser) return 'Super Administrador'
  return user.roles.join(', ') || 'Sin rol'
}
