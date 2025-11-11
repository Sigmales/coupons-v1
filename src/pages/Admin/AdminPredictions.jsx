import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'

export default function AdminPredictions() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPrediction, setEditingPrediction] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadMatches()
    loadPredictions()
  }, [])

  const loadMatches = async () => {
    try {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false })
        .limit(100)

      setMatches(data || [])
    } catch (error) {
      console.error('Error loading matches:', error)
    }
  }

  const loadPredictions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          matches (
            id,
            home_team,
            away_team,
            match_date,
            league
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setPredictions(data || [])
    } catch (error) {
      console.error('Error loading predictions:', error)
      toast.error('Erreur de chargement des pronostics')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const predictionData = {
      match_id: formData.get('match_id'),
      prediction_type: formData.get('prediction_type'),
      prediction_value: formData.get('prediction_value'),
      odds: formData.get('odds') ? parseFloat(formData.get('odds')) : null,
      confidence_level: formData.get('confidence_level'),
      description: formData.get('description') || null,
      result: formData.get('result') || 'pending',
      admin_id: user?.id,
      updated_at: new Date().toISOString()
    }

    try {
      if (editingPrediction) {
        const { error } = await supabase
          .from('predictions')
          .update(predictionData)
          .eq('id', editingPrediction.id)

        if (error) throw error
        toast.success('Pronostic mis à jour avec succès')
      } else {
        const { error } = await supabase
          .from('predictions')
          .insert(predictionData)

        if (error) throw error
        toast.success('Pronostic créé avec succès')
      }

      setEditingPrediction(null)
      setShowForm(false)
      loadPredictions()
    } catch (error) {
      console.error('Error saving prediction:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const deletePrediction = async (predictionId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pronostic ?')) return

    try {
      const { error } = await supabase
        .from('predictions')
        .delete()
        .eq('id', predictionId)

      if (error) throw error
      toast.success('Pronostic supprimé')
      loadPredictions()
    } catch (error) {
      console.error('Error deleting prediction:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestion des pronostics</h2>
          <p className="text-primary-200">Créer et gérer les pronostics (coupons) pour les utilisateurs</p>
        </div>
        <button
          onClick={() => {
            setEditingPrediction(null)
            setShowForm(true)
          }}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          + Nouveau pronostic
        </button>
      </div>

      {/* Formulaire */}
      {(showForm || editingPrediction) && (
        <div className="bg-white rounded-xl p-6 shadow mb-6">
          <h3 className="text-xl font-bold text-primary-900 mb-4">
            {editingPrediction ? 'Modifier le pronostic' : 'Nouveau pronostic'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Match *</label>
                <select
                  name="match_id"
                  required
                  defaultValue={editingPrediction?.match_id || ''}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Sélectionner un match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.home_team} vs {match.away_team} - {new Date(match.match_date).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de confiance *</label>
                <select
                  name="confidence_level"
                  required
                  defaultValue={editingPrediction?.confidence_level || 'standard'}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="standard">Standard (tous les abonnés)</option>
                  <option value="vip">VIP (abonnés VIP uniquement)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de pronostic *</label>
                <select
                  name="prediction_type"
                  required
                  defaultValue={editingPrediction?.prediction_type || ''}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="1X2">1X2 (Résultat)</option>
                  <option value="Over/Under">Over/Under (Plus/Moins)</option>
                  <option value="BTTS">BTTS (Buts des deux équipes)</option>
                  <option value="Double Chance">Double Chance</option>
                  <option value="Handicap">Handicap</option>
                  <option value="Score Exact">Score Exact</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valeur du pronostic *</label>
                <input
                  type="text"
                  name="prediction_value"
                  required
                  placeholder="Ex: 1, Over 2.5, Oui, 1X..."
                  defaultValue={editingPrediction?.prediction_value || ''}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cotes (optionnel)</label>
                <input
                  type="number"
                  name="odds"
                  step="0.01"
                  min="1"
                  placeholder="Ex: 1.85"
                  defaultValue={editingPrediction?.odds || ''}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Résultat</label>
                <select
                  name="result"
                  defaultValue={editingPrediction?.result || 'pending'}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="pending">En attente</option>
                  <option value="won">Gagné</option>
                  <option value="lost">Perdu</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Détails supplémentaires sur le pronostic..."
                  defaultValue={editingPrediction?.description || ''}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
              >
                {editingPrediction ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingPrediction(null)
                }}
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des pronostics */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Chargement...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Match</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Pronostic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Cotes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Niveau</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Résultat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {predictions.map((prediction) => {
                  const match = prediction.matches
                  return (
                    <tr key={prediction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        {match ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {match.home_team} vs {match.away_team}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {match.league} - {new Date(match.match_date).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Match supprimé</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {prediction.prediction_type}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {prediction.prediction_value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {prediction.odds ? prediction.odds.toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-white text-xs ${
                          prediction.confidence_level === 'vip' ? 'bg-purple-600' : 'bg-blue-600'
                        }`}>
                          {prediction.confidence_level === 'vip' ? 'VIP' : 'Standard'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-white text-xs ${
                          prediction.result === 'won' ? 'bg-green-600' :
                          prediction.result === 'lost' ? 'bg-red-600' :
                          'bg-yellow-500'
                        }`}>
                          {prediction.result === 'won' ? 'Gagné' :
                           prediction.result === 'lost' ? 'Perdu' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingPrediction(prediction)
                              setShowForm(true)
                            }}
                            className="px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700 text-xs"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => deletePrediction(prediction.id)}
                            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {predictions.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              Aucun pronostic créé. Cliquez sur "Nouveau pronostic" pour commencer.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

