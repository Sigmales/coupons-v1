import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { fetchTodayMatches } from '../services/api'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await fetchTodayMatches()
        setMatches(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error loading matches:', error)
        setMatches([])
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [])

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
          <p className="text-2xl font-bold text-primary-600">
            {profile?.subscription_type === 'vip' ? 'VIP' : profile?.subscription_type === 'standard' ? 'Standard' : 'Gratuit'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Pronostics consultés</h3>
          <p className="text-2xl font-bold text-primary-600">0</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Statut</h3>
          <p className="text-2xl font-bold text-green-600">
            {profile?.subscription_end && new Date(profile.subscription_end) >= new Date() ? 'Actif' : 'Gratuit'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-xl font-bold text-primary-900 mb-4">Matchs du jour</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            {matches.slice(0, 5).map((match, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <p className="text-gray-700">
                  {match.homeTeam?.name || match.strHomeTeam || 'Équipe à domicile'} vs {match.awayTeam?.name || match.strAwayTeam || 'Équipe à l\'extérieur'}
                </p>
                {match.date && (
                  <p className="text-sm text-gray-500">
                    {new Date(match.date).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Aucun match prévu aujourd'hui.</p>
        )}
      </div>
    </div>
  )
}

