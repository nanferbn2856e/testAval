import { useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../../lib/session'
import { getFullName, getRoleLabel } from '../../lib/user'

export function useHeader() {
  const navigate = useNavigate()
  const user = getSession()?.user

  function logout() {
    clearSession()
    navigate('/auth', { replace: true })
  }

  return {
    isLoggedIn: Boolean(user),
    fullName: user ? getFullName(user) : '',
    roleLabel: user ? getRoleLabel(user) : '',
    logout,
  }
}