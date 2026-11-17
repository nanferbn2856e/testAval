import { Trash2, X } from 'lucide-react'
import type { Customer } from '../types/customer'
import { useDeleteCustomerModal } from './Hooks/DeleteCustomerModalHook'

interface DeleteCustomerModalProps {
  customer: Customer
  onClose: () => void
  onDeleted: () => void
}

export default function DeleteCustomerModal({
  customer,
  onClose,
  onDeleted,
}: DeleteCustomerModalProps) {
  const { fullName, deleting, error, confirm } = useDeleteCustomerModal({
    customer,
    onClose,
    onDeleted,
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between bg-primary px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <Trash2 size={22} />
            </div>
            <h2 id="delete-modal-title" className="text-lg font-semibold text-secondary">
              Eliminar cliente
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p id="delete-modal-description" className="text-slate-700">
            ¿Está seguro de eliminar el cliente{' '}
            <span className="font-bold text-primary">
              #{customer.id}: {fullName || customer.email}
            </span>
            ?
          </p>
          <p className="text-sm text-slate-500">Esta acción no se puede deshacer.</p>

          {error && (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="rounded-xl border border-primary/30 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-secondary/20 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/30 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}