import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'

export default function AdminMatches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingMatch, setEditingMatch] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false })
        .limit(50)

      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error('Error loading matches:', error)
      toast.error('Erreur de chargement des matchs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const matchData = {
      match_date: formData.get('match_date'),
      home_team: formData.get('home_team'),
      away_team: formData.get('away_team'),
      league: formData.get('league') || null,
      country: formData.get('country') || null,
      stadium: formData.get('stadium') || null,
      status: formData.get('status') || 'scheduled',
      home_score: formData.get('home_score') ? parseInt(formData.get('home_score')) : null,
      away_score: formData.get('away_score') ? parseInt(formData.get('away_score')) : null,
      created_by: user?.id,
      updated_at: new Date().toISOString()
    }

    try {
      if (editingMatch) {
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', editingMatch.id)

        if (error) throw error
        toast.success('Match mis à jour avec succès')
      } else {
        const { error } = await supabase
          .from('matches')
          .insert(matchData)

        if (error) throw error
        toast.success('Match créé avec succès')
      }

      setEditingMatch(null)
      setShowForm(false)
      loadMatches()
    } catch (error) {
      console.error('Error saving match:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const deleteMatch = async (matchId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) return

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)

      if (error) throw error
      toast.success('Match supprimé')
      loadMatches()
    } catch (error) {
      console.error('Error deleting match:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestion des matchs</h2>
          <p className="text-primary-200">Créer et gérer les matchs de football</p>
        </div>
        <button
          onClick={() => {
            setEditingMatch(null)
            setShowForm(true)
          }}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          + Nouveau match
        </button>
      </div>

      {/* Formulaire */}
      {(showForm || editingMatch) && (
        <div className="bg-white rounded-xl p-6 shadow mb-6">
          <h3 className="text-xl font-bold text-primary-900 mb-4">
            {editingMatch ? 'Modifier le match' : 'Nouveau match'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure</label>
                <input
                  type="datetime-local"
                  name="match_date"
                  required
                  defaultValue={editingMatch ? new Date(editingMatch.match_date).toISOString().slice(0, 16) : ''}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select name="status" defaultValue={editingMatch?.status || 'scheduled'} className="w-full px-4 py-2 border rounded-lg">
                  <option value="scheduled">Programmé</option>
                  <option value="live">En direct</option>
                  <option value="finished">Terminé</option>
                  <option value="postponed">Reporté</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Équipe à domicile *</label>
                <input
                  type="text"
                  name="home_team"
                  required
                  defaultValue={editingMatch?.home_team || ''}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Équipe à l'extérieur *</label>
                <input
                  type="text"
                  name="away_team"
                  required
                  defaultValue={editingMatch?.away_team || ''}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Championnat</label>
                <input
                  type="text"
                  name="league"
                  defaultValue={editingMatch?.league || ''}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <input
                  type="text"
                  name="country"
                  defaultValue={editingMatch?.country || ''}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stade</label>
                <input
                  type="text"
                  name="stadium"
                  defaultValue={editingMatch?.stadium || ''}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              {(editingMatch?.status === 'finished' || editingMatch?.status === 'live') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score domicile</label>
                    <input
                      type="number"
                      name="home_score"
                      min="0"
                      defaultValue={editingMatch?.home_score || ''}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score extérieur</label>
                    <input
                      type="number"
                      name="away_score"
                      min="0"
                      defaultValue={editingMatch?.away_score || ''}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
              >
                {editingMatch ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingMatch(null)
                }}
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des matchs */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Match</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Championnat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {matches.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(match.match_date).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {match.home_team} vs {match.away_team}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {match.league || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {match.home_score !== null && match.away_score !== null
                        ? `${match.home_score} - ${match.away_score}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-white text-xs ${
                        match.status === 'scheduled' ? 'bg-blue-500' :
                        match.status === 'live' ? 'bg-green-500' :
                        match.status === 'finished' ? 'bg-gray-500' :
                        'bg-yellow-500'
                      }`}>
                        {match.status === 'scheduled' ? 'Programmé' :
                         match.status === 'live' ? 'En direct' :
                         match.status === 'finished' ? 'Terminé' :
                         match.status === 'postponed' ? 'Reporté' : 'Annulé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingMatch(match)
                            setShowForm(true)
                          }}
                          className="px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700 text-xs"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteMatch(match.id)}
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {matches.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              Aucun match créé. Cliquez sur "Nouveau match" pour commencer.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

