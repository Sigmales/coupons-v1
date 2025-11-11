import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const { signIn, user, profile, profileLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitingForProfile, setWaitingForProfile] = useState(false)

  // Rediriger une fois le profil chargé après connexion
  useEffect(() => {
    if (waitingForProfile && user && !profileLoading) {
      if (profile) {
        toast.success('Connexion réussie')
        navigate('/dashboard', { replace: true })
        setWaitingForProfile(false)
      } else {
        // Profil non chargé mais utilisateur connecté - attendre un peu plus
        const timeout = setTimeout(() => {
          if (user) {
            navigate('/dashboard', { replace: true })
            setWaitingForProfile(false)
          }
        }, 2000)
        return () => clearTimeout(timeout)
      }
    }
  }, [waitingForProfile, user, profile, profileLoading, navigate])

  // Timeout de sécurité si le profil ne se charge pas après 5 secondes
  useEffect(() => {
    if (waitingForProfile) {
      const timeoutId = setTimeout(() => {
        if (waitingForProfile && user) {
          console.warn('Profile loading timeout, redirecting anyway')
          navigate('/dashboard', { replace: true })
          setWaitingForProfile(false)
        }
      }, 5000)
      return () => clearTimeout(timeoutId)
    }
  }, [waitingForProfile, user, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading || waitingForProfile) return
    
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
        // Attendre que le profil soit chargé
        setLoading(false)
        setWaitingForProfile(true)
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
        disabled={loading || waitingForProfile} 
        className={`w-full py-3 rounded-lg text-white ${(loading || waitingForProfile) ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
        aria-label={(loading || waitingForProfile) ? 'Connexion en cours...' : 'Se connecter'}
      >
        {(loading || waitingForProfile) ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}

