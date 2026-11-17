import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { deleteCustomer } from '../../api/customers'
import type { Customer } from '../../types/customer'

interface UseDeleteCustomerModalParams {
  customer: Customer
  onClose: () => void
  onDeleted: () => void
}

export function useDeleteCustomerModal({
  customer,
  onClose,
  onDeleted,
}: UseDeleteCustomerModalParams) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const fullName = `${customer.first_name} ${customer.last_name}`.trim()

  // Cierra con Escape, salvo mientras se está eliminando
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deleting) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, deleting])

  async function confirm() {
    setDeleting(true)
    setError('')

    try {
      await deleteCustomer(customer.id)
      onDeleted()
    } catch (err) {
      if (isAxiosError(err) && !err.response) {
        setError('No hay conexión con el servidor.')
      } else {
        setError('No se pudo eliminar el cliente.')
      }
      setDeleting(false)
    }
  }

  return { fullName, deleting, error, confirm }
}