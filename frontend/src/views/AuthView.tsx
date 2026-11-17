import { useState, type ReactNode } from 'react'
import { Eye, EyeOff, Lock, LogIn, Mail, UserPlus } from 'lucide-react'
import logo from '../assets/logo-aval.png'
import Footer from '../components/Footer'
import { useAuthView, type AuthForm, type AuthMode } from './Hooks/AuthViewHook'

interface FieldProps {
  label: string
  name: keyof AuthForm
  value: string
  onChange: (name: keyof AuthForm, value: string) => void
  error?: string
  type?: string
  required?: boolean
  placeholder?: string
  autoComplete?: string
  minLength?: number
  icon?: ReactNode
  className?: string
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  required = false,
  placeholder,
  autoComplete,
  minLength,
  icon,
  className = '',
}: FieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-primary">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/50">
            {icon}
          </span>
        )}

        <input
          id={name}
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          onChange={(e) => onChange(name, e.target.value)}
          className={`w-full rounded-xl border bg-slate-50 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
            icon ? 'pl-11' : 'pl-3.5'
          } ${isPassword ? 'pr-11' : 'pr-3.5'} ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-200 focus:border-primary focus:ring-secondary/50'
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-primary/60 transition hover:bg-secondary/30 hover:text-primary"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const TABS: { mode: AuthMode; label: string }[] = [
  { mode: 'login', label: 'Ingresar' },
  { mode: 'register', label: 'Registrarme' },
]

export default function AuthView() {
  const { mode, isLogin, switchMode, form, setField, fieldErrors, generalError, loading, submit } =
    useAuthView()

  const SubmitIcon = isLogin ? LogIn : UserPlus

  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/30">
          <div className="px-8 pt-8">
            <img
              src={logo}
              alt="Grupo Aval"
              className="mx-auto -my-3 h-32 w-auto object-contain"
            />

            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-primary">
              {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </h1>
            <p className="mt-1 text-center text-sm text-slate-500">
              {isLogin
                ? 'Ingresa con tu correo y tu contraseña'
                : 'Regístrate para administrar clientes'}
            </p>

            <div
              role="tablist"
              className="mt-6 grid grid-cols-2 rounded-xl bg-secondary/20 p-1 text-sm font-medium"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.mode}
                  type="button"
                  role="tab"
                  aria-selected={mode === tab.mode}
                  onClick={() => switchMode(tab.mode)}
                  className={`rounded-lg py-2 transition ${
                    mode === tab.mode
                      ? 'bg-primary text-secondary shadow-md'
                      : 'text-primary/70 hover:text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4 p-8 pt-6">
            {!isLogin && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Nombres"
                  name="first_name"
                  value={form.first_name}
                  error={fieldErrors.first_name}
                  onChange={setField}
                  autoComplete="given-name"
                  required
                />
                <Field
                  label="Apellidos"
                  name="last_name"
                  value={form.last_name}
                  error={fieldErrors.last_name}
                  onChange={setField}
                  autoComplete="family-name"
                />
              </div>
            )}

            <Field
              label="Correo electrónico"
              name="email"
              type={isLogin ? 'text' : 'email'}
              value={form.email}
              error={fieldErrors.email}
              onChange={setField}
              placeholder="correo@ejemplo.com"
              autoComplete="username"
              icon={<Mail size={18} />}
              required
            />

            <Field
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              error={fieldErrors.password}
              onChange={setField}
              placeholder={isLogin ? 'Tu contraseña' : 'Mínimo 8 caracteres'}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={isLogin ? undefined : 8}
              icon={<Lock size={18} />}
              required
            />

            {generalError && (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
                {generalError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-primary shadow-md shadow-secondary/40 transition hover:-translate-y-0.5 hover:bg-secondary-dark active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <SubmitIcon size={18} strokeWidth={2.5} />
              {loading ? 'Procesando...' : isLogin ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
