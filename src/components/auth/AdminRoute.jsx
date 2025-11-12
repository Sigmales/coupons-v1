import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminRoute() {
  const { user, profile, loading } = useAuth()
  
  // Afficher le loader pendant le chargement initial
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
  
  // Si le profil n'est pas encore chargé, attendre un peu
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Vérification des droits d'accès...</p>
        </div>
      </div>
    )
  }
  
  // Si l'utilisateur n'est pas admin, rediriger vers la page d'accueil
  if (!profile.is_admin) {
    return <Navigate to="/" replace />
  }
  
  // Utilisateur admin, autoriser l'accès
  return <Outlet />
}

