import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase envoie un access_token dans l'URL et crée une session temporaire
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) toast.error('Erreur, réessayez.')
    else {
      toast.success('Mot de passe mis à jour.')
      navigate('/login')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 my-10">
      <h2 className="text-2xl font-bold text-primary-900 mb-4">Nouveau mot de passe</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input 
            id="reset-password"
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="w-full px-4 py-2 border rounded-lg"
            aria-label="Nouveau mot de passe"
          />
        </div>
        <button 
          type="submit"
          disabled={loading} 
          className={`w-full py-3 rounded-lg text-white ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
          aria-label={loading ? 'Mise à jour en cours...' : 'Mettre à jour le mot de passe'}
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  )
}

