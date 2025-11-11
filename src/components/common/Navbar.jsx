import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, profile, signOut, loading } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Déconnexion réussie')
      navigate('/')
    } catch (error) {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 z-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold text-primary-700">Coupons</Link>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className="text-primary-900 hover:text-primary-600">Accueil</NavLink>
          <NavLink to="/subscription" className="text-primary-900 hover:text-primary-600">Tarifs</NavLink>
          {user && (
            <NavLink to="/dashboard" className="text-primary-900 hover:text-primary-600">Dashboard</NavLink>
          )}
          <NavLink to="/contact" className="text-primary-900 hover:text-primary-600">Contact</NavLink>
          {profile?.is_admin && (
            <NavLink to="/admin" className="text-primary-900 hover:text-primary-600">Admin</NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
            <>
              <NavLink to="/login" className="px-4 py-2 rounded-lg text-primary-700 hover:bg-primary-50">Se connecter</NavLink>
              <NavLink to="/register" className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700">S'inscrire</NavLink>
            </>
          ) : user ? (
            <>
              <NavLink to="/profile" className="px-4 py-2 rounded-lg text-primary-700 hover:bg-primary-50">Profil</NavLink>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="px-4 py-2 rounded-lg text-primary-700 hover:bg-primary-50">Se connecter</NavLink>
              <NavLink to="/register" className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700">S'inscrire</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

