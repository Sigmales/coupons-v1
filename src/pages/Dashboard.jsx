import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { fetchTodayMatches } from '../services/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [predictionsLoading, setPredictionsLoading] = useState(true)

  // Vérifier si l'utilisateur a accès VIP (admin ou abonnement valide)
  const hasVipAccess = profile?.is_admin || (
    profile?.subscription_type === 'vip' && 
    profile?.subscription_end && 
    new Date(profile.subscription_end) >= new Date()
  )

  const hasStandardAccess = profile?.is_admin || hasVipAccess || (
    profile?.subscription_type === 'standard' && 
    profile?.subscription_end && 
    new Date(profile.subscription_end) >= new Date()
  )

  useEffect(() => {
    loadMatches()
    loadPredictions()
  }, [hasVipAccess, hasStandardAccess])

  const loadMatches = async () => {
    setLoading(true)
    try {
      // Charger les matchs depuis la base de données
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: dbMatches, error: dbError } = await supabase
        .from('matches')
        .select('*')
        .gte('match_date', today.toISOString())
        .lt('match_date', tomorrow.toISOString())
        .order('match_date', { ascending: true })

      if (!dbError && dbMatches && dbMatches.length > 0) {
        setMatches(dbMatches)
      } else {
        // Fallback sur l'API externe
        const apiData = await fetchTodayMatches()
        setMatches(Array.isArray(apiData) ? apiData : [])
      }
    } catch (error) {
      console.error('Error loading matches:', error)
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  const loadPredictions = async () => {
    setPredictionsLoading(true)
    try {
      // Charger les pronostics selon l'abonnement
      // Les admins voient tout grâce à la politique RLS corrigée
      let query = supabase
        .from('predictions')
        .select(`
          *,
          matches (
            id,
            home_team,
            away_team,
            match_date,
            league,
            status,
            home_score,
            away_score
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      // Filtrer selon l'abonnement (la politique RLS gère déjà cela, mais on peut aussi filtrer côté client)
      if (!hasVipAccess) {
        // Si pas VIP, seulement standard
        query = query.eq('confidence_level', 'standard')
      }
      // Sinon, on récupère tout (standard + VIP)

      const { data, error } = await query

      if (error) throw error
      setPredictions(data || [])
    } catch (error) {
      console.error('Error loading predictions:', error)
      toast.error('Erreur de chargement des pronostics')
    } finally {
      setPredictionsLoading(false)
    }
  }

  const getSubscriptionDisplay = () => {
    if (profile?.is_admin) return { text: 'Admin (Accès VIP)', color: 'text-red-600' }
    if (profile?.subscription_type === 'vip' && profile?.subscription_end && new Date(profile.subscription_end) >= new Date()) {
      return { text: 'VIP', color: 'text-purple-600' }
    }
    if (profile?.subscription_type === 'standard' && profile?.subscription_end && new Date(profile.subscription_end) >= new Date()) {
      return { text: 'Standard', color: 'text-blue-600' }
    }
    return { text: 'Gratuit', color: 'text-gray-600' }
  }

  const subscriptionDisplay = getSubscriptionDisplay()

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
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Pronostics disponibles</h3>
          <p className="text-2xl font-bold text-primary-600">{predictions.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {hasVipAccess ? 'Standard + VIP' : hasStandardAccess ? 'Standard uniquement' : 'Aucun accès'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Statut</h3>
          <p className="text-2xl font-bold text-green-600">
            {profile?.subscription_end && new Date(profile.subscription_end) >= new Date() ? 'Actif' : 
             profile?.is_admin ? 'Admin' : 'Gratuit'}
          </p>
        </div>
      </div>

      {/* Pronostics disponibles */}
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h3 className="text-xl font-bold text-primary-900 mb-4">Pronostics disponibles</h3>
        {predictionsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : predictions.length > 0 ? (
          <div className="space-y-4">
            {predictions.map((prediction) => {
              const match = prediction.matches
              if (!match) return null
              
              return (
                <div key={prediction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {match.home_team} vs {match.away_team}
                        </span>
                        <span className={`px-2 py-1 rounded text-white text-xs ${
                          prediction.confidence_level === 'vip' ? 'bg-purple-600' : 'bg-blue-600'
                        }`}>
                          {prediction.confidence_level === 'vip' ? 'VIP' : 'Standard'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {match.league} • {new Date(match.match_date).toLocaleString('fr-FR')}
                      </p>
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-xs text-gray-500">Type: </span>
                          <span className="text-sm font-medium text-gray-900">{prediction.prediction_type}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Pronostic: </span>
                          <span className="text-sm font-bold text-primary-600">{prediction.prediction_value}</span>
                        </div>
                        {prediction.odds && (
                          <div>
                            <span className="text-xs text-gray-500">Cotes: </span>
                            <span className="text-sm font-medium text-gray-900">{prediction.odds.toFixed(2)}</span>
                          </div>
                        )}
                        <div>
                          <span className={`px-2 py-1 rounded text-white text-xs ${
                            prediction.result === 'won' ? 'bg-green-600' :
                            prediction.result === 'lost' ? 'bg-red-600' :
                            'bg-yellow-500'
                          }`}>
                            {prediction.result === 'won' ? '✓ Gagné' :
                             prediction.result === 'lost' ? '✗ Perdu' : '⏳ En attente'}
                          </span>
                        </div>
                      </div>
                      {prediction.description && (
                        <p className="text-sm text-gray-600 mt-2 italic">{prediction.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Aucun pronostic disponible pour le moment.</p>
            {!hasStandardAccess && (
              <p className="text-sm text-gray-500">
                Abonnez-vous pour accéder aux pronostics premium.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Matchs du jour */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-xl font-bold text-primary-900 mb-4">Matchs du jour</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            {matches.slice(0, 10).map((match, index) => (
              <div key={match.id || index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-700 font-medium">
                      {match.home_team || match.homeTeam?.name || match.strHomeTeam || 'Équipe à domicile'} vs {match.away_team || match.awayTeam?.name || match.strAwayTeam || 'Équipe à l\'extérieur'}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      {match.league && (
                        <p className="text-sm text-gray-500">{match.league}</p>
                      )}
                      {match.match_date && (
                        <p className="text-sm text-gray-500">
                          {new Date(match.match_date).toLocaleString('fr-FR')}
                        </p>
                      )}
                      {match.status && (
                        <span className={`px-2 py-1 rounded text-white text-xs ${
                          match.status === 'live' ? 'bg-green-500' :
                          match.status === 'finished' ? 'bg-gray-500' :
                          'bg-blue-500'
                        }`}>
                          {match.status === 'live' ? 'En direct' :
                           match.status === 'finished' ? 'Terminé' : 'Programmé'}
                        </span>
                      )}
                    </div>
                    {match.home_score !== null && match.away_score !== null && (
                      <p className="text-lg font-bold text-primary-600 mt-2">
                        {match.home_score} - {match.away_score}
                      </p>
                    )}
                  </div>
                </div>
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

