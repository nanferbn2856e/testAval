import { Inbox, Pencil, Trash2 } from 'lucide-react'
import type { Customer } from '../types/customer'

interface CustomersTableProps {
  customers: Customer[]
  loading: boolean
  error: string
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

const HEADERS = [
  'ID',
  'Nombres',
  'Apellidos',
  'Email',
  'Identificación',
  'Teléfono',
  'Ciudad',
  'Creado',
  'Opciones',
]

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-CO')
}

function getInitials(c: Customer): string {
  const first = c.first_name?.[0] ?? c.email[0]
  const last = c.last_name?.[0] ?? ''
  return (first + last).toUpperCase()
}

function MessageRow({ text, tone = 'muted' }: { text: string; tone?: 'muted' | 'error' }) {
  return (
    <tr>
      <td colSpan={HEADERS.length} className="px-4 py-12">
        <div
          className={`flex flex-col items-center gap-2 text-sm ${
            tone === 'error' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <Inbox size={32} className="opacity-60" />
          {text}
        </div>
      </td>
    </tr>
  )
}

export default function CustomersTable({
  customers,
  loading,
  error,
  onEdit,
  onDelete,
}: CustomersTableProps) {
  const hasRows = !loading && !error && customers.length > 0

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-primary-dark text-xs uppercase tracking-wider text-secondary">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className={`whitespace-nowrap px-4 py-3.5 font-semibold ${
                    h === 'Opciones' ? 'text-center' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading && <MessageRow text="Cargando clientes..." />}
            {!loading && error && <MessageRow text={error} tone="error" />}
            {!loading && !error && customers.length === 0 && (
              <MessageRow text="No hay clientes para mostrar." />
            )}

            {hasRows &&
              customers.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/15">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">#{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-secondary shadow-sm">
                        {getInitials(c)}
                      </div>
                      <span className="font-semibold text-primary">{c.first_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.last_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{c.email}</td>
                  <td className="px-4 py-3">
                    {c.document_number ? (
                      <span className="rounded-md bg-secondary/30 px-2 py-0.5 font-mono text-xs font-medium text-primary">
                        {c.document_number}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">{c.phone || '—'}</td>
                  <td className="px-4 py-3">{c.city || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        title="Editar"
                        aria-label={`Editar ${c.first_name} ${c.last_name}`}
                        className="rounded-lg bg-secondary/40 p-2 text-primary transition hover:bg-primary hover:text-secondary"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c)}
                        title="Eliminar"
                        aria-label={`Eliminar ${c.first_name} ${c.last_name}`}
                        className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {hasRows && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          Mostrando <span className="font-semibold text-primary">{customers.length}</span>{' '}
          {customers.length === 1 ? 'cliente' : 'clientes'}
        </div>
      )}
    </div>
  )
}