import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-6 text-center text-white">Chargement...</div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

