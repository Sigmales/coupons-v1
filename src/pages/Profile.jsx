import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, profile, reloadProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name)
    }
  }, [profile])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (error) throw error

      await reloadProfile()
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-primary-900 mb-6">Profil</h2>
        
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'abonnement
            </label>
            <input
              type="text"
              value={profile?.subscription_type === 'vip' ? 'VIP' : profile?.subscription_type === 'standard' ? 'Standard' : 'Gratuit'}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut de l'abonnement
            </label>
            <input
              type="text"
              value={profile?.subscription_end && new Date(profile.subscription_end) >= new Date() ? 'Actif' : 'Expiré/Gratuit'}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
            />
            {profile?.subscription_end && (
              <p className="text-xs text-gray-500 mt-1">
                Expire le: {new Date(profile.subscription_end).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700'
            }`}
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
          </button>
        </form>
      </div>
    </div>
  )
}

