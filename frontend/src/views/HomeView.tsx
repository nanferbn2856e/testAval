import { Navigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { getSession } from '../lib/session'
import { isAdmin, isCustomer } from '../lib/user'
import CustomersView from './CustomersView'
import ProfileView from './ProfileView'

function NoRole() {
  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6">
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-600 shadow-xl shadow-black/20">
          Tu usuario no tiene un rol asignado. Contacta a un administrador.
        </p>
      </main>
      <Footer />
    </div>
  )
}

// Punto de entrada tras iniciar sesión: muestra la vista según el rol.
export default function HomeView() {
  const user = getSession()?.user

  if (!user) return <Navigate to="/auth" replace />
  if (isAdmin(user)) return <CustomersView />
  if (isCustomer(user)) return <ProfileView />
  return <NoRole />
}
