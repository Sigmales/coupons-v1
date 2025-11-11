import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function PaymentVerification() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) toast.error('Erreur de chargement')
    else setItems(data ?? [])
  }

  useEffect(() => { load() }, [])

  const approve = async (req) => {
    const { error } = await supabase.from('payment_requests').update({
      status: 'approved',
      validated_at: new Date().toISOString()
    }).eq('id', req.id)
    if (error) return toast.error('Erreur validation')
    // Update profile subscription
    const start = new Date()
    const end = new Date()
    if (req.duration === 'annual') end.setFullYear(end.getFullYear() + 1)
    else end.setMonth(end.getMonth() + 1)
    const { error: upErr } = await supabase.from('profiles').update({
      subscription_type: req.plan,
      subscription_start: start.toISOString().slice(0,10),
      subscription_end: end.toISOString().slice(0,10),
      is_annual: req.duration === 'annual'
    }).eq('id', req.user_id)
    if (upErr) toast.error('Profil non mis à jour')
    toast.success('Paiement approuvé')
    load()
  }

  const reject = async (req) => {
    const { error } = await supabase.from('payment_requests').update({ status: 'rejected' }).eq('id', req.id)
    if (error) toast.error('Erreur rejet')
    else {
      toast('Demande rejetée', { icon: '❌' })
      load()
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="text-xl font-bold text-primary-900 mb-4">Demandes de paiement</h3>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Utilisateur</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Montant</th>
                <th className="py-2 pr-4">Méthode</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 pr-4">{r.user_id.slice(0,8)}…</td>
                  <td className="py-2 pr-4 capitalize">{r.plan} / {r.duration}</td>
                  <td className="py-2 pr-4">{r.amount} CFA</td>
                  <td className="py-2 pr-4">{r.payment_method.replace('_',' ')}</td>
                  <td className="py-2 pr-4">{r.created_at ? format(new Date(r.created_at), 'yyyy-MM-dd HH:mm') : '-'}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-white ${r.status === 'pending' ? 'bg-yellow-500' : r.status === 'approved' ? 'bg-green-600' : 'bg-red-500'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      {r.screenshot_url && (
                        <a href={r.screenshot_url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-primary-100 text-primary-700 hover:bg-primary-200">Voir</a>
                      )}
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => approve(r)} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Approuver</button>
                          <button onClick={() => reject(r)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Rejeter</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

