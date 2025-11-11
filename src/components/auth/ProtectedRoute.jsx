import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function ProtectedRoute() {
  const { user, profile, loading, profileLoading } = useAuth()
  
  // Afficher le loader pendant le chargement initial ou du profil
  if (loading || (user && profileLoading)) {
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
  
  // Si utilisateur mais profil pas encore chargé, attendre un peu
  // (le profil peut être null si en cours de création)
  if (user && profile === null && !profileLoading) {
    // Attendre encore un peu pour la création du profil
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Initialisation du profil...</p>
        </div>
      </div>
    )
  }
  
  return <Outlet />
}

