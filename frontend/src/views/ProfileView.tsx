import { CircleAlert, CircleCheck, Pencil } from 'lucide-react'
import CustomerModal from '../components/CustomerModal'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { useProfileView } from './Hooks/ProfileViewHook'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-700">{value || '—'}</dd>
    </div>
  )
}

export default function ProfileView() {
  const {
    profile,
    loading,
    error,
    fullName,
    missingFields,
    isComplete,
    isModalOpen,
    openModal,
    closeModal,
    handleSaved,
    reload,
  } = useProfileView()

  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6 py-10">
        <section className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20">
          <div className="flex items-center gap-4 bg-primary-dark px-6 py-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold text-primary ring-4 ring-white/10">
              {getInitials(fullName)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/70">Bienvenido</p>
              <h1 className="text-xl font-bold leading-tight text-secondary">{fullName}</h1>
            </div>
          </div>

          <div className="space-y-5 p-6">
            {loading && <p className="py-6 text-center text-sm text-slate-500">Cargando tu perfil...</p>}

            {!loading && error && (
              <div className="space-y-3 py-4 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={reload}
                  className="rounded-xl border border-primary/30 px-5 py-2 text-sm font-medium text-primary transition hover:bg-secondary/20"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && profile && (
              <>
                {isComplete ? (
                  <div className="flex items-start gap-3 rounded-xl bg-secondary/25 p-4 text-primary">
                    <CircleCheck size={22} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Tu perfil está completo</p>
                      <p className="mt-0.5 text-sm text-primary/80">
                        Mantén tus datos al día: puedes modificarlos cuando lo necesites.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-amber-50 p-4 text-amber-900 ring-1 ring-amber-200">
                    <div className="flex items-start gap-3">
                      <CircleAlert size={22} className="mt-0.5 shrink-0 text-amber-600" />
                      <div>
                        <p className="font-semibold">Completa tu perfil</p>
                        <p className="mt-0.5 text-sm text-amber-800">
                          Aún faltan algunos datos para terminar tu registro.
                        </p>
                      </div>
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {missingFields.map((field) => (
                        <li
                          key={field}
                          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200"
                        >
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <Detail label="Correo" value={profile.email} />
                  <Detail label="Identificación" value={profile.document_number} />
                  <Detail label="Teléfono" value={profile.phone} />
                  <Detail label="Ciudad" value={profile.city} />
                  <div className="sm:col-span-2">
                    <Detail label="Dirección" value={profile.address} />
                  </div>
                </dl>

                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={openModal}
                    className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-primary shadow-md shadow-secondary/40 transition hover:-translate-y-0.5 hover:bg-secondary-dark active:translate-y-0"
                  >
                    <Pencil size={18} />
                    {isComplete ? 'Editar perfil' : 'Completar perfil'}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {isModalOpen && profile && (
        <CustomerModal
          key={profile.id}
          customer={profile}
          title={isComplete ? 'Mi perfil' : 'Completa tu perfil'}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
