import { useEffect, useMemo, useState } from 'react'
import { getCustomers } from '../../api/customers'
import type { Customer } from '../../types/customer'

export function useCustomersView() {
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getCustomers()
        if (!cancelled) {
          setCustomers(data)
          setError('')
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el listado de clientes.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return customers
    return customers.filter((c) =>
      [
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.username,
        c.document_number,
        c.phone,
        c.city,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [customers, search])

  function clearSearch() {
    setSearch('')
  }

  function openNewCustomer() {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  function editCustomer(customer: Customer) {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingCustomer(null)
  }

  function handleSaved() {
    closeModal()
    setReloadKey((k) => k + 1)
  }

  // Abre la confirmación; la eliminación real la hace DeleteCustomerModal
  function deleteCustomer(customer: Customer) {
    setDeletingCustomer(customer)
  }

  function closeDeleteModal() {
    setDeletingCustomer(null)
  }

  function handleDeleted() {
    setDeletingCustomer(null)
    setReloadKey((k) => k + 1)
  }

  return {
    search,
    setSearch,
    clearSearch,
    openNewCustomer,
    customers: filteredCustomers,
    loading,
    error,
    editCustomer,
    deleteCustomer,
    isModalOpen,
    editingCustomer,
    closeModal,
    handleSaved,
    deletingCustomer,
    closeDeleteModal,
    handleDeleted,
  }
}