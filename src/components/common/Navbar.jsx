import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, profile, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Déconnexion réussie')
      navigate('/')
      setMobileMenuOpen(false)
    } catch (error) {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  const isAdmin = profile?.is_admin

  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 z-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold text-primary-700">Coupons</Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className="text-primary-900 hover:text-primary-600">Accueil</NavLink>
            <NavLink to="/subscription" className="text-primary-900 hover:text-primary-600">Tarifs</NavLink>
            {user && (
              <NavLink to="/dashboard" className="text-primary-900 hover:text-primary-600">Dashboard</NavLink>
            )}
            <NavLink to="/contact" className="text-primary-900 hover:text-primary-600">Contact</NavLink>
            
            {/* Admin Dropdown */}
            {isAdmin && (
              <div 
                className="relative"
                onMouseEnter={() => setAdminMenuOpen(true)}
                onMouseLeave={() => setAdminMenuOpen(false)}
              >
                <NavLink 
                  to="/admin" 
                  className="text-primary-900 hover:text-primary-600 flex items-center gap-1"
                >
                  Admin
                  <span className="text-xs">▼</span>
                </NavLink>
                {adminMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <NavLink 
                      to="/admin" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Dashboard Admin
                    </NavLink>
                    <NavLink 
                      to="/admin/matches" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Gestion Matchs
                    </NavLink>
                    <NavLink 
                      to="/admin/predictions" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Gestion Pronostics
                    </NavLink>
                    <NavLink 
                      to="/admin/users" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Gestion Utilisateurs
                    </NavLink>
                    <NavLink 
                      to="/admin/payments" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Validation Paiements
                    </NavLink>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-primary-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-primary-100">
            <nav className="flex flex-col gap-2 mt-4">
              <NavLink 
                to="/" 
                className="px-4 py-2 text-primary-900 hover:bg-primary-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </NavLink>
              <NavLink 
                to="/subscription" 
                className="px-4 py-2 text-primary-900 hover:bg-primary-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tarifs
              </NavLink>
              {user && (
                <NavLink 
                  to="/dashboard" 
                  className="px-4 py-2 text-primary-900 hover:bg-primary-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
              )}
              <NavLink 
                to="/contact" 
                className="px-4 py-2 text-primary-900 hover:bg-primary-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </NavLink>

              {/* Mobile Admin Menu */}
              {isAdmin && (
                <div className="mt-2">
                  <div className="px-4 py-2 text-primary-900 font-semibold">Admin</div>
                  <NavLink 
                    to="/admin" 
                    className="block px-6 py-2 text-sm text-gray-700 hover:bg-primary-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard Admin
                  </NavLink>
                  <NavLink 
                    to="/admin/matches" 
                    className="block px-6 py-2 text-sm text-gray-700 hover:bg-primary-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Gestion Matchs
                  </NavLink>
                  <NavLink 
                    to="/admin/predictions" 
                    className="block px-6 py-2 text-sm text-gray-700 hover:bg-primary-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Gestion Pronostics
                  </NavLink>
                  <NavLink 
                    to="/admin/users" 
                    className="block px-6 py-2 text-sm text-gray-700 hover:bg-primary-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Gestion Utilisateurs
                  </NavLink>
                  <NavLink 
                    to="/admin/payments" 
                    className="block px-6 py-2 text-sm text-gray-700 hover:bg-primary-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Validation Paiements
                  </NavLink>
                </div>
              )}

              {/* Mobile Auth Buttons */}
              <div className="mt-4 pt-4 border-t border-primary-100 flex flex-col gap-2">
                {loading ? (
                  <>
                    <NavLink 
                      to="/login" 
                      className="px-4 py-2 rounded-lg text-primary-700 hover:bg-primary-50 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Se connecter
                    </NavLink>
                    <NavLink 
                      to="/register" 
                      className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      S'inscrire
                    </NavLink>
                  </>
                ) : user ? (
                  <>
                    <NavLink 
                      to="/profile" 
                      className="px-4 py-2 rounded-lg text-primary-700 hover:bg-primary-50 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profil
                    </NavLink>
                    <button 
                      onClick={handleSignOut}
                      className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink 
                      to="/login" 
                      className="px-4 py-2 rounded-lg text-primary-700 hover:bg-primary-50 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Se connecter
                    </NavLink>
                    <NavLink 
                      to="/register" 
                      className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      S'inscrire
                    </NavLink>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

