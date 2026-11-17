import type { Customer } from '../types/customer'

// Datos que el cliente debe tener para considerar su perfil completo.
// "Apellidos" es opcional (igual que en el formulario).
const REQUIRED_FIELDS: { key: keyof Customer; label: string }[] = [
  { key: 'first_name', label: 'Nombres' },
  { key: 'document_number', label: 'Identificación' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'city', label: 'Ciudad' },
  { key: 'address', label: 'Dirección' },
]

export function getMissingFields(customer: Customer): string[] {
  return REQUIRED_FIELDS.filter(({ key }) => !String(customer[key] ?? '').trim()).map(
    ({ label }) => label,
  )
}

export function isProfileComplete(customer: Customer): boolean {
  return getMissingFields(customer).length === 0
}
