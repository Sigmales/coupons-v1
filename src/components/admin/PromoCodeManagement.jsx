import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'

export default function PromoCodeManagement() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingRequest, setEditingRequest] = useState(null)
  const [actionType, setActionType] = useState('approve')

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('custom_promo_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading promo requests:', error)
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const approveRequest = async (requestId, approvedCode) => {
    try {
      const { error } = await supabase
        .from('custom_promo_codes')
        .update({
          status: 'approved',
          approved_code: approvedCode,
          admin_id: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error
      toast.success('Code promo approuvé')
      setEditingRequest(null)
      loadRequests()
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Erreur lors de l\'approbation')
    }
  }

  const rejectRequest = async (requestId, adminNote) => {
    try {
      const { error } = await supabase
        .from('custom_promo_codes')
        .update({
          status: 'rejected',
          admin_note: adminNote,
          admin_id: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error
      toast.success('Demande rejetée')
      setEditingRequest(null)
      loadRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Erreur lors du rejet')
    }
  }

  const handleAction = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const action = formData.get('action')
    const approvedCode = formData.get('approved_code')
    const adminNote = formData.get('admin_note')

    if (action === 'approve') {
      if (!approvedCode) {
        toast.error('Veuillez entrer un code approuvé')
        return
      }
      await approveRequest(editingRequest.id, approvedCode)
    } else {
      await rejectRequest(editingRequest.id, adminNote || null)
    }
  }

  const [filterStatus, setFilterStatus] = useState('all')
  
  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus)

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary-900">Demandes de codes promo personnalisés</h3>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvés</option>
          <option value="rejected">Rejetés</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Utilisateur</th>
                <th className="py-2 pr-4">Bookmaker</th>
                <th className="py-2 pr-4">Code demandé</th>
                <th className="py-2 pr-4">Raison</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id} className="border-b">
                  <td className="py-2 pr-4">{req.user_id?.slice(0, 8)}…</td>
                  <td className="py-2 pr-4 capitalize">{req.bookmaker}</td>
                  <td className="py-2 pr-4 font-mono">{req.requested_code}</td>
                  <td className="py-2 pr-4">{req.reason || '-'}</td>
                  <td className="py-2 pr-4">{new Date(req.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-white text-xs ${
                      req.status === 'pending' ? 'bg-yellow-500' :
                      req.status === 'approved' ? 'bg-green-600' :
                      'bg-red-500'
                    }`}>
                      {req.status === 'pending' ? 'En attente' :
                       req.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {req.status === 'pending' ? (
                      <button
                        onClick={() => setEditingRequest(req)}
                        className="px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700 text-xs"
                      >
                        Traiter
                      </button>
                    ) : (
                      <div className="text-xs text-gray-600">
                        {req.approved_code && <div>Code: {req.approved_code}</div>}
                        {req.admin_note && <div className="mt-1">Note: {req.admin_note}</div>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8">Aucune demande de code promo</p>
      )}

      {/* Modal de traitement */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-primary-900 mb-4">
              Traiter la demande de code promo
            </h3>
            <form onSubmit={handleAction} className="space-y-4" onReset={() => setActionType('approve')}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code demandé</label>
                <input
                  type="text"
                  value={editingRequest.requested_code}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bookmaker</label>
                <input
                  type="text"
                  value={editingRequest.bookmaker}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              {editingRequest.reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
                  <p className="text-sm text-gray-600">{editingRequest.reason}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="action" 
                      value="approve" 
                      checked={actionType === 'approve'}
                      onChange={(e) => setActionType(e.target.value)}
                      className="mr-2" 
                    />
                    <span>Approuver</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="action" 
                      value="reject"
                      checked={actionType === 'reject'}
                      onChange={(e) => setActionType(e.target.value)}
                      className="mr-2" 
                    />
                    <span>Rejeter</span>
                  </label>
                </div>
              </div>

              {actionType === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code approuvé *</label>
                  <input
                    type="text"
                    name="approved_code"
                    required
                    placeholder="Entrez le code approuvé"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              )}

              {actionType === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note admin (optionnel)</label>
                  <textarea
                    name="admin_note"
                    rows="3"
                    placeholder="Raison du rejet..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRequest(null)
                    setActionType('approve')
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

