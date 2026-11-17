import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../../api/auth'
import { getErrorMessage } from '../../lib/errors'
import { saveSession } from '../../lib/session'

export type AuthMode = 'login' | 'register'

export interface AuthForm {
  first_name: string
  last_name: string
  email: string
  password: string
}

const EMPTY_FORM: AuthForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
}

// Los correos se guardan en minúscula. Si el valor no es un correo
// (por ejemplo el superusuario "nanfer") se envía tal cual.
function normalizeIdentity(value: string): string {
  const trimmed = value.trim()
  return trimmed.includes('@') ? trimmed.toLowerCase() : trimmed
}

function parseErrors(err: unknown) {
  const fields: Record<string, string> = {}

  if (
    isAxiosError(err) &&
    err.response?.status === 400 &&
    err.response.data &&
    typeof err.response.data === 'object'
  ) {
    const data = err.response.data as Record<string, unknown>
    for (const [key, value] of Object.entries(data)) {
      if (key === 'detail' || key === 'non_field_errors') continue
      fields[key] = Array.isArray(value) ? String(value[0]) : String(value)
    }
  }

  if (Object.keys(fields).length > 0) return { fields, general: '' }
  return { fields, general: getErrorMessage(err) }
}

export function useAuthView() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [form, setForm] = useState<AuthForm>(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  function setField(name: keyof AuthForm, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const rest = { ...prev }
      delete rest[name]
      return rest
    })
  }

  function switchMode(next: AuthMode) {
    if (next === mode) return
    setMode(next)
    setForm(EMPTY_FORM)
    setFieldErrors({})
    setGeneralError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})
    setGeneralError('')

    try {
      const email = normalizeIdentity(form.email)

      if (!isLogin) {
        await register({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email,
          password: form.password,
        })
      }

      // Tras registrarse se inicia sesión automáticamente
      const session = await login({ email, password: form.password })
      saveSession(session)
      navigate('/', { replace: true })
    } catch (err) {
      const { fields, general } = parseErrors(err)
      setFieldErrors(fields)
      setGeneralError(general)
    } finally {
      setLoading(false)
    }
  }

  return {
    mode,
    isLogin,
    switchMode,
    form,
    setField,
    fieldErrors,
    generalError,
    loading,
    submit,
  }
}
