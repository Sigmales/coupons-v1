import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // Récupérer tous les profils avec les emails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Note: Les emails ne sont pas directement accessibles depuis profiles
      // On utilise les profils avec un placeholder pour l'email
      // L'admin peut voir l'email via l'ID utilisateur si nécessaire
      setUsers((profiles || []).map(p => ({ ...p, email: `ID: ${p.id.slice(0, 8)}...` })))
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Erreur de chargement des utilisateurs')
      // Fallback: charger juste les profils
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setUsers((data || []).map(p => ({ ...p, email: 'N/A' })))
    } finally {
      setLoading(false)
    }
  }

  const updateSubscription = async (userId, subscriptionType, duration = 'monthly') => {
    try {
      const start = new Date()
      const end = new Date()
      
      if (subscriptionType === 'free') {
        end.setDate(end.getDate() - 1) // Expiré
      } else if (duration === 'annual') {
        end.setFullYear(end.getFullYear() + 1)
      } else {
        end.setMonth(end.getMonth() + 1)
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_type: subscriptionType,
          subscription_start: subscriptionType === 'free' ? null : start.toISOString().split('T')[0],
          subscription_end: subscriptionType === 'free' ? null : end.toISOString().split('T')[0],
          is_annual: duration === 'annual',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      toast.success(`Abonnement ${subscriptionType} attribué avec succès`)
      setEditingUser(null)
      loadUsers()
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const toggleAdmin = async (userId, currentStatus) => {
    if (!confirm(`Êtes-vous sûr de vouloir ${currentStatus ? 'retirer' : 'donner'} les droits admin ?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_admin: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      toast.success(`Droits admin ${!currentStatus ? 'attribués' : 'retirés'}`)
      loadUsers()
    } catch (error) {
      console.error('Error toggling admin:', error)
      toast.error('Erreur lors de la modification')
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Gestion des utilisateurs</h2>
        <p className="text-primary-200">Gérer les utilisateurs et leurs abonnements</p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Abonnement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Expire le</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-white ${
                        user.subscription_type === 'vip' ? 'bg-purple-600' :
                        user.subscription_type === 'standard' ? 'bg-blue-600' :
                        'bg-gray-400'
                      }`}>
                        {user.subscription_type === 'vip' ? 'VIP' :
                         user.subscription_type === 'standard' ? 'Standard' : 'Gratuit'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.subscription_end ? new Date(user.subscription_end).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.is_admin ? (
                        <span className="px-2 py-1 rounded bg-red-600 text-white">Admin</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700 text-xs"
                        >
                          Modifier
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => toggleAdmin(user.id, user.is_admin)}
                            className={`px-3 py-1 rounded text-white text-xs ${
                              user.is_admin 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {user.is_admin ? 'Retirer Admin' : 'Promouvoir Admin'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-primary-900 mb-4">
              Modifier l'abonnement de {editingUser.full_name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'abonnement</label>
                <select
                  id="subscription-type"
                  className="w-full px-4 py-2 border rounded-lg"
                  defaultValue={editingUser.subscription_type}
                >
                  <option value="free">Gratuit</option>
                  <option value="standard">Standard</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durée (si payant)</label>
                <select
                  id="duration"
                  className="w-full px-4 py-2 border rounded-lg"
                  defaultValue="monthly"
                >
                  <option value="monthly">Mensuel</option>
                  <option value="annual">Annuel</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    const type = document.getElementById('subscription-type').value
                    const duration = document.getElementById('duration').value
                    updateSubscription(editingUser.id, type, duration)
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

