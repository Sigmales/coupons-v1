import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function ProtectedRoute() {
  const { user, profile, loading, profileLoading } = useAuth()
  
  // Afficher le loader pendant le chargement initial de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    )
  }
  
  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // Afficher le loader pendant le chargement du profil (mais avec timeout)
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement du profil...</p>
        </div>
      </div>
    )
  }
  
  // Si utilisateur connecté mais profil null, permettre l'accès quand même
  // Le profil sera créé automatiquement par le trigger ou par loadProfile
  // On ne bloque plus l'utilisateur ici
  return <Outlet />
}

