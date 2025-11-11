import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

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
      
      if (result.data?.user) {
        toast.success('Connexion réussie')
        // Attendre un peu pour que le profil soit chargé par AuthContext
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 500)
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

