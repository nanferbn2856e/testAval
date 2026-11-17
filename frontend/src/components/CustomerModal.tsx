import { Pencil, UserPlus, X } from 'lucide-react'
import type { Customer, CustomerForm } from '../types/customer'
import { useCustomerModal } from './Hooks/CustomerModalHook'

interface CustomerModalProps {
  customer: Customer | null // null = crear, con cliente = editar
  onClose: () => void
  onSaved: () => void
  title?: string // título opcional; por defecto "Nuevo cliente" o "Editar cliente"
}

interface FieldProps {
  label: string
  name: keyof CustomerForm
  value: string
  error?: string
  onChange: (name: keyof CustomerForm, value: string) => void
  type?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  placeholder?: string
  className?: string
}

function Field({
  label,
  name,
  value,
  error,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  hint,
  placeholder,
  className = '',
}: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-primary">
        {label}
        {required && !disabled && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 focus:border-primary focus:ring-secondary/50'
        }`}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function CustomerModal({ customer, onClose, onSaved, title }: CustomerModalProps) {
  const { form, setField, fieldErrors, generalError, saving, submit, isEditing } =
    useCustomerModal({ customer, onClose, onSaved })

  const HeaderIcon = isEditing ? Pencil : UserPlus

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between bg-primary px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <HeaderIcon size={22} />
            </div>
            <div>
              <h2
                id="customer-modal-title"
                className="text-lg font-semibold leading-tight text-secondary"
              >
                {title ?? (isEditing ? 'Editar cliente' : 'Nuevo cliente')}
              </h2>
              <p className="text-xs text-white/70">
                {isEditing
                  ? `Cliente #${customer?.id}`
                  : 'Los campos con * son obligatorios'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombres" name="first_name" value={form.first_name} error={fieldErrors.first_name} onChange={setField} required />
            <Field label="Apellidos" name="last_name" value={form.last_name} error={fieldErrors.last_name} onChange={setField} />
            <Field
              label={isEditing ? 'Email (usuario de acceso)' : 'Email (será el usuario de acceso)'}
              name="email"
              type="email"
              value={form.email}
              error={fieldErrors.email}
              onChange={setField}
              required
              disabled={isEditing}
              hint={isEditing ? 'El correo no se puede modificar.' : undefined}
              className="sm:col-span-2"
            />
            {!isEditing && (
              <Field label="Contraseña" name="password" type="password" value={form.password} error={fieldErrors.password} onChange={setField} placeholder="Mínimo 8 caracteres (opcional)" />
            )}
            <Field label="Identificación" name="document_number" value={form.document_number} error={fieldErrors.document_number} onChange={setField} />
            <Field label="Teléfono" name="phone" value={form.phone} error={fieldErrors.phone} onChange={setField} />
            <Field label="Ciudad" name="city" value={form.city} error={fieldErrors.city} onChange={setField} />
            <Field label="Dirección" name="address" value={form.address} error={fieldErrors.address} onChange={setField} className="sm:col-span-2" />
          </div>

          {generalError && (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
              {generalError}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-primary/30 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-secondary/20"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-primary shadow-md shadow-secondary/40 transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}