import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { signUp, user, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Rediriger après inscription réussie (si email confirmation non requise)
  useEffect(() => {
    if (user && profile) {
      console.log('✅ User registered, redirecting...', { 
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
    console.log('📝 Attempting registration...', { email, fullName })
    
    try {
      const { error, data } = await signUp(email, password, fullName)
      
      if (error) {
        console.error('❌ Registration error:', error)
        toast.error(error.message || 'Inscription échouée')
        setLoading(false)
        return
      }
      
      // Si l'email confirmation n'est pas requise, l'utilisateur est connecté automatiquement
      if (data?.session) {
        console.log('✅ Registration successful with session')
        toast.success('Compte créé avec succès !')
        // La redirection sera gérée par le useEffect
      } else {
        // Email confirmation requise
        console.log('✅ Registration successful, email confirmation required')
        toast.success('Compte créé. Veuillez vérifier votre email pour confirmer votre compte.')
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Registration exception:', err)
      toast.error('Erreur lors de l\'inscription. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 my-10">
      <h2 className="text-2xl font-bold text-primary-900 mb-4">Créer un compte</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-fullname" className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet
          </label>
          <input 
            id="register-fullname"
            type="text" 
            value={fullName} 
            onChange={e => setFullName(e.target.value)} 
            required 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Jean Dupont"
          />
        </div>
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input 
            id="register-email"
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="votre@email.com"
          />
        </div>
        <div>
          <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input 
            id="register-password"
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            minLength={6}
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
          {loading ? 'Création...' : 'Créer un compte'}
        </button>
      </form>
      <div className="mt-4 text-sm text-center">
        <a href="/login" className="text-primary-600 hover:underline">
          Déjà un compte ? Se connecter
        </a>
      </div>
    </div>
  )
}

