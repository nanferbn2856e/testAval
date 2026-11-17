export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-primary-dark">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-xs text-white/70">
        <span>
          <span className="font-semibold text-secondary">Test Aval</span> ·{' '}
          {new Date().getFullYear()}
        </span>
        <span>Gestión de clientes</span>
      </div>
    </footer>
  )
}