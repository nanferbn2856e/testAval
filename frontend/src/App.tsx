import { Navigate, Route, Routes } from 'react-router-dom'
import AuthView from './views/AuthView'
import HomeView from './views/HomeView'

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthView />} />
      <Route path="/" element={<HomeView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
