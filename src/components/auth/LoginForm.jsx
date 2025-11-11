import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const { signIn, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error, data } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error('Identifiants invalides')
    } else if (data?.user) {
      toast.success('Connexion réussie')
      // Redirection gérée par l'useEffect ci-dessus
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
      </div>
      <button disabled={loading} className={`w-full py-3 rounded-lg text-white ${loading ? 'bg-gray-300' : 'bg-primary-600 hover:bg-primary-700'}`}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}

