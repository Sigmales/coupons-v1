import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function RegisterForm() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) {
      toast.error('Inscription échouée')
    } else {
      toast.success('Compte créé. Vérifiez votre email si requis.')
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

