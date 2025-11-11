import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function AdminRoute() {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="p-6 text-center text-white">Chargement...</div>
  if (!user) return <Navigate to="/login" replace />
  return profile?.is_admin ? <Outlet /> : <Navigate to="/" replace />
}

