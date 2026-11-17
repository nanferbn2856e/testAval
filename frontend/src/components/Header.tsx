import { LogOut, ShieldCheck } from 'lucide-react'
import { useHeader } from './Hooks/HeaderHook'

function Logo() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary shadow-md shadow-black/20">
      <ShieldCheck size={22} strokeWidth={2.5} />
    </div>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export default function Header() {
  const { isLoggedIn, fullName, roleLabel, logout } = useHeader()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-primary-dark shadow-lg shadow-black/20">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xl font-extrabold tracking-tight text-secondary">Test Aval</span>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary ring-2 ring-white/20">
                {getInitials(fullName)}
              </div>
              <div className="hidden text-sm leading-tight sm:block">
                <p className="font-semibold text-white">{fullName}</p>
                <p className="text-xs text-white/70">({roleLabel})</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-white/25 px-3 py-1.5 text-sm text-white transition hover:border-secondary hover:bg-white/10 hover:text-secondary"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}