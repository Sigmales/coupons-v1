import { useState } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_SITE_URL}/reset-password`
    })
    setLoading(false)
    if (error) toast.error('Erreur, réessayez.')
    else toast.success('Email de réinitialisation envoyé.')
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 my-10">
      <h2 className="text-2xl font-bold text-primary-900 mb-4">Mot de passe oublié</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <button disabled={loading} className={`w-full py-3 rounded-lg text-white ${loading ? 'bg-gray-300' : 'bg-primary-600 hover:bg-primary-700'}`}>
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>
    </div>
  )
}

