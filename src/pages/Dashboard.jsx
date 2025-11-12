import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const subscriptionDisplay = profile?.is_admin 
    ? { text: 'Admin (Accès VIP)', color: 'text-red-600' }
    : profile?.subscription_type === 'vip' 
    ? { text: 'VIP', color: 'text-purple-600' }
    : profile?.subscription_type === 'standard'
    ? { text: 'Standard', color: 'text-blue-600' }
    : { text: 'Gratuit', color: 'text-gray-600' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
        {user && (
          <p className="text-primary-200">
            Bienvenue, {profile?.full_name || user.email} !
          </p>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Type d'abonnement</h3>
          <p className={`text-2xl font-bold ${subscriptionDisplay.color}`}>
            {subscriptionDisplay.text}
          </p>
          {profile?.subscription_end && !profile?.is_admin && (
            <p className="text-xs text-gray-500 mt-1">
              Expire le: {new Date(profile.subscription_end).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Email</h3>
          <p className="text-gray-700">{user.email}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Statut</h3>
          <p className="text-2xl font-bold text-green-600">
            {profile?.subscription_end && new Date(profile.subscription_end) >= new Date() 
              ? 'Actif' 
              : profile?.is_admin 
              ? 'Admin' 
              : 'Gratuit'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-xl font-bold text-primary-900 mb-4">Informations du compte</h3>
        <div className="space-y-2">
          <p><strong>Nom:</strong> {profile?.full_name || 'Non défini'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Type d'abonnement:</strong> {subscriptionDisplay.text}</p>
          {profile?.created_at && (
            <p><strong>Membre depuis:</strong> {new Date(profile.created_at).toLocaleDateString('fr-FR')}</p>
          )}
        </div>
        <button
          onClick={async () => {
            try {
              await signOut()
              navigate('/login')
            } catch (error) {
              console.error('Error signing out:', error)
            }
          }}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Déconnexion
        </button>
      </div>
    </div>
  )
}

