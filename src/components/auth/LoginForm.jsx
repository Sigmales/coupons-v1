import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const { signIn, user, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Rediriger après connexion réussie
  useEffect(() => {
    if (user && profile) {
      // Rediriger selon le rôle
      if (profile.is_admin) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } else if (user && !profile) {
      // Attendre un peu que le profil se charge
      const timeout = setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [user, profile, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    
    setLoading(true)
    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        console.error('Login error:', result.error)
        toast.error(result.error.message || 'Identifiants invalides')
        setLoading(false)
        return
      }
      
      if (result.data?.user || result.data?.session?.user) {
        toast.success('Connexion réussie')
        // La redirection sera gérée par le useEffect
      } else {
        console.error('No user data in response:', result)
        toast.error('Erreur lors de la connexion. Veuillez réessayer.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login exception:', err)
      toast.error('Erreur de connexion. Veuillez vérifier votre connexion internet.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          id="login-email"
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          className="w-full px-4 py-2 border rounded-lg"
          aria-label="Adresse email"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input 
          id="login-password"
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          className="w-full px-4 py-2 border rounded-lg"
          aria-label="Mot de passe"
        />
      </div>
      <button 
        type="submit"
        disabled={loading} 
        className={`w-full py-3 rounded-lg text-white ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
        aria-label={loading ? 'Connexion en cours...' : 'Se connecter'}
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}
