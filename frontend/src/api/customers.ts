import { api } from './client'
import type { Customer, CustomerForm } from '../types/customer'

export async function getCustomers(): Promise<Customer[]> {
  const { data } = await api.get<Customer[] | { results: Customer[] }>('/customers/')
  return Array.isArray(data) ? data : data.results
}

export async function getCustomer(id: number): Promise<Customer> {
  const { data } = await api.get<Customer>(`/customers/${id}/`)
  return data
}

export async function createCustomer(form: CustomerForm): Promise<Customer> {
  const { password, ...rest } = form
  const payload = {
    ...rest,
    email: form.email.trim().toLowerCase(),
    ...(password ? { password } : {}), // el backend exige mínimo 8 si se envía
  }
  const { data } = await api.post<Customer>('/customers/', payload)
  return data
}

export async function updateCustomer(id: number, form: CustomerForm): Promise<Customer> {
  // El correo (usuario) y la contraseña no se pueden modificar, por eso no se envían.
  const payload = {
    first_name: form.first_name,
    last_name: form.last_name,
    document_number: form.document_number,
    phone: form.phone,
    city: form.city,
    address: form.address,
  }
  const { data } = await api.patch<Customer>(`/customers/${id}/`, payload)
  return data
}

export async function deleteCustomer(id: number): Promise<void> {
  await api.delete(`/customers/${id}/`)
}