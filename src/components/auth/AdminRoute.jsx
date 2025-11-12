import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'

export default function AdminRoute() {
  const { user, profile, loading, profileLoading, reloadProfile } = useAuth()
  const [profileCheckTimeout, setProfileCheckTimeout] = useState(false)
  
  // Timeout pour éviter d'attendre indéfiniment le profil
  useEffect(() => {
    if (user && !profile && !profileLoading) {
      const timeout = setTimeout(() => {
        setProfileCheckTimeout(true)
        // Essayer de recharger le profil une dernière fois
        reloadProfile()
      }, 3000)
      return () => clearTimeout(timeout)
    } else {
      setProfileCheckTimeout(false)
    }
  }, [user, profile, profileLoading, reloadProfile])
  
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
  
  // Afficher le loader pendant le chargement du profil
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
  
  // Si le profil n'existe toujours pas après le timeout, rediriger
  // (probablement pas un admin si le profil n'existe pas)
  if (!profile && profileCheckTimeout) {
    console.warn('Profile not found after timeout, redirecting to home')
    return <Navigate to="/" replace />
  }
  
  // Si le profil existe mais l'utilisateur n'est pas admin, rediriger
  if (profile && !profile.is_admin) {
    return <Navigate to="/" replace />
  }
  
  // Si pas de profil mais pas encore de timeout, attendre encore un peu
  if (!profile && !profileCheckTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Vérification des droits d'accès...</p>
        </div>
      </div>
    )
  }
  
  return <Outlet />
}

