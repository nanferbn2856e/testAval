import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { createCustomer, updateCustomer } from '../../api/customers'
import type { Customer, CustomerForm } from '../../types/customer'

const EMPTY_FORM: CustomerForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  document_number: '',
  phone: '',
  city: '',
  address: '',
}

function customerToForm(customer: Customer): CustomerForm {
  return {
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    password: '',
    document_number: customer.document_number ?? '',
    phone: customer.phone,
    city: customer.city,
    address: customer.address,
  }
}

function parseErrors(err: unknown, fallback: string) {
  const fields: Record<string, string> = {}
  let general = fallback

  if (isAxiosError(err)) {
    if (!err.response) {
      general = 'No hay conexión con el servidor.'
    } else if (err.response.data && typeof err.response.data === 'object') {
      const data = err.response.data as Record<string, unknown>
      for (const [key, value] of Object.entries(data)) {
        const message = Array.isArray(value) ? String(value[0]) : String(value)
        if (key === 'detail') general = message
        else fields[key] = message
      }
      if (Object.keys(fields).length > 0) general = ''
    }
  }

  return { fields, general }
}

interface UseCustomerModalParams {
  customer: Customer | null
  onClose: () => void
  onSaved: () => void
}

export function useCustomerModal({ customer, onClose, onSaved }: UseCustomerModalParams) {
  const isEditing = customer !== null
  const [form, setForm] = useState<CustomerForm>(customer ? customerToForm(customer) : EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [saving, setSaving] = useState(false)

  // Cierra con la tecla Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function setField(name: keyof CustomerForm, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const rest = { ...prev }
      delete rest[name]
      return rest
    })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    setGeneralError('')

    try {
      if (customer) await updateCustomer(customer.id, form)
      else await createCustomer(form)
      onSaved()
    } catch (err) {
      const fallback = customer
        ? 'No se pudo actualizar el cliente.'
        : 'No se pudo crear el cliente.'
      const { fields, general } = parseErrors(err, fallback)
      setFieldErrors(fields)
      setGeneralError(general)
    } finally {
      setSaving(false)
    }
  }

  return { form, setField, fieldErrors, generalError, saving, submit, isEditing }
}