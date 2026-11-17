import { useEffect, useState } from 'react'
import { getCustomer } from '../../api/customers'
import { getMissingFields } from '../../lib/profile'
import { getSession, saveSession } from '../../lib/session'
import { getFullName } from '../../lib/user'
import type { Customer } from '../../types/customer'

export function useProfileView() {
  const session = getSession()
  const userId = session?.user.id

  const [profile, setProfile] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (userId === undefined) return
    const id: number = userId
    let cancelled = false

    async function load() {
      try {
        const data = await getCustomer(id)
        if (cancelled) return

        // Mantiene el nombre del header al día si el cliente lo editó
        const current = getSession()
        if (
          current &&
          (current.user.first_name !== data.first_name || current.user.last_name !== data.last_name)
        ) {
          saveSession({
            ...current,
            user: { ...current.user, first_name: data.first_name, last_name: data.last_name },
          })
        }

        setProfile(data)
        setError('')
      } catch {
        if (!cancelled) setError('No se pudo cargar tu perfil.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId, reloadKey])

  const missingFields = profile ? getMissingFields(profile) : []

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : session
      ? getFullName(session.user)
      : ''

  function reload() {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }

  function openModal() {
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
  }

  function handleSaved() {
    setIsModalOpen(false)
    setReloadKey((k) => k + 1)
  }

  return {
    profile,
    loading,
    error,
    fullName,
    missingFields,
    isComplete: profile !== null && missingFields.length === 0,
    isModalOpen,
    openModal,
    closeModal,
    handleSaved,
    reload,
  }
}
