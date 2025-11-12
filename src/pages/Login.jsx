import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn, user, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Rediriger après connexion réussie
  useEffect(() => {
    if (user && profile) {
      console.log('✅ User connected, redirecting...', { 
        email: user.email, 
        isAdmin: profile.is_admin,
        subscriptionType: profile.subscription_type 
      })
      
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    
    setLoading(true)
    console.log('🔐 Attempting login...', { email })
    
    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        console.error('❌ Login error:', result.error)
        toast.error(result.error.message || 'Identifiants invalides')
        setLoading(false)
        return
      }
      
      if (result.data?.user || result.data?.session?.user) {
        console.log('✅ Login successful, waiting for profile...')
        toast.success('Connexion réussie')
        // La redirection sera gérée par le useEffect
      } else {
        console.error('❌ No user data in response:', result)
        toast.error('Erreur lors de la connexion. Veuillez réessayer.')
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Login exception:', err)
      toast.error('Erreur de connexion. Veuillez vérifier votre connexion internet.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 my-10">
      <h2 className="text-2xl font-bold text-primary-900 mb-4">Connexion</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input 
            id="login-email"
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="votre@email.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input 
            id="login-password"
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit"
          disabled={loading} 
          className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
            loading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <div className="mt-4 text-sm text-center">
        <a href="/register" className="text-primary-600 hover:underline">
          Pas encore de compte ? S'inscrire
        </a>
      </div>
    </div>
  )
}

