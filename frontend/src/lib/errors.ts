import axios from 'axios'

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Ocurrió un error inesperado.'
  if (!error.response) return 'No se pudo conectar con el servidor.'

  const data = error.response.data as unknown
  if (error.response.status === 401) return 'Correo o contraseña incorrectos.'

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (typeof obj.detail === 'string') return obj.detail
    const messages = Object.values(obj).flatMap((v) =>
      Array.isArray(v) ? v.map(String) : [String(v)],
    )
    if (messages.length) return messages.join(' ')
  }
  return 'No se pudo completar la solicitud.'
}