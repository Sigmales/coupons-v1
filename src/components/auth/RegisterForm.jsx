import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function RegisterForm() {
  const { signUp, user, profile, profileLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitingForProfile, setWaitingForProfile] = useState(false)

  // Rediriger après inscription si l'email confirmation n'est pas requise
  useEffect(() => {
    if (waitingForProfile && user && !profileLoading) {
      if (profile) {
        toast.success('Inscription réussie !')
        // Rediriger selon le rôle : admin vers /admin, sinon /dashboard
        if (profile.is_admin) {
          navigate('/admin', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
        setWaitingForProfile(false)
      } else if (user) {
        // Si pas de profil mais utilisateur connecté, rediriger vers dashboard
        // Le profil sera créé automatiquement
        const timeout = setTimeout(() => {
          navigate('/dashboard', { replace: true })
          setWaitingForProfile(false)
        }, 2000)
        return () => clearTimeout(timeout)
      }
    }
  }, [waitingForProfile, user, profile, profileLoading, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error, data } = await signUp(email, password, fullName)
    setLoading(false)
    
    if (error) {
      toast.error(error.message || 'Inscription échouée')
      return
    }
    
    // Si l'email confirmation n'est pas requise, l'utilisateur est connecté automatiquement
    if (data?.session) {
      toast.success('Compte créé avec succès !')
      // Attendre que le profil soit chargé
      setWaitingForProfile(true)
    } else {
      // Email confirmation requise
      toast.success('Compte créé. Veuillez vérifier votre email pour confirmer votre compte.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="register-fullname" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
        <input 
          id="register-fullname"
          type="text" 
          value={fullName} 
          onChange={e => setFullName(e.target.value)} 
          required 
          className="w-full px-4 py-2 border rounded-lg"
          aria-label="Nom complet"
        />
      </div>
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          id="register-email"
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          className="w-full px-4 py-2 border rounded-lg"
          aria-label="Adresse email"
        />
      </div>
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input 
          id="register-password"
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
        aria-label={loading ? 'Création du compte en cours...' : 'Créer un compte'}
      >
        {loading ? 'Création...' : 'Créer un compte'}
      </button>
    </form>
  )
}

