import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminHome() {
  const [stats, setStats] = useState({
    pendingPayments: 0,
    totalUsers: 0,
    totalMatches: 0,
    totalPredictions: 0,
    vipUsers: 0,
    standardUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentPayments, setRecentPayments] = useState([])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Paiements en attente
      const { count: pendingCount } = await supabase
        .from('payment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Total utilisateurs
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Total matchs
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })

      // Total pronostics
      const { count: predictionsCount } = await supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true })

      // Utilisateurs VIP
      const { count: vipCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_type', 'vip')
        .gte('subscription_end', new Date().toISOString().split('T')[0])

      // Utilisateurs Standard
      const { count: standardCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_type', 'standard')
        .gte('subscription_end', new Date().toISOString().split('T')[0])

      // Paiements récents
      const { data: payments } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        pendingPayments: pendingCount || 0,
        totalUsers: usersCount || 0,
        totalMatches: matchesCount || 0,
        totalPredictions: predictionsCount || 0,
        vipUsers: vipCount || 0,
        standardUsers: standardCount || 0
      })
      setRecentPayments(payments || [])
    } catch (error) {
      console.error('Error loading stats:', error)
      toast.error('Erreur de chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard Admin</h2>
        <p className="text-primary-200">Vue d'ensemble de la plateforme</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Chargement...</p>
        </div>
      ) : (
        <>
          {/* Statistiques principales */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Paiements en attente</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingPayments}</p>
              <Link to="/admin/payments" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
                Voir tous →
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Total utilisateurs</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.totalUsers}</p>
              <Link to="/admin/users" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
                Gérer →
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Matchs créés</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalMatches}</p>
              <Link to="/admin/matches" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
                Gérer →
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Pronostics créés</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalPredictions}</p>
              <Link to="/admin/predictions" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
                Gérer →
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Abonnés VIP</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.vipUsers}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Abonnés Standard</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.standardUsers}</p>
            </div>
          </div>

          {/* Paiements récents */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-primary-900">Paiements récents</h3>
              <Link to="/admin/payments" className="text-sm text-primary-600 hover:underline">
                Voir tous →
              </Link>
            </div>
            {recentPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Plan</th>
                      <th className="py-2 pr-4">Montant</th>
                      <th className="py-2 pr-4">Méthode</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr key={payment.id} className="border-b">
                        <td className="py-2 pr-4 capitalize">{payment.plan} / {payment.duration}</td>
                        <td className="py-2 pr-4">{payment.amount} CFA</td>
                        <td className="py-2 pr-4">{payment.payment_method.replace('_', ' ')}</td>
                        <td className="py-2 pr-4">{new Date(payment.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-1 rounded text-white text-xs ${
                            payment.status === 'pending' ? 'bg-yellow-500' : 
                            payment.status === 'approved' ? 'bg-green-600' : 
                            'bg-red-500'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">Aucun paiement récent</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

