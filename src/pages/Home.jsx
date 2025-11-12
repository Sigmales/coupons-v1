import { Link } from 'react-router-dom'

export default function Home() {
  console.log('🏠 Home page rendered')
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">Coupons</h1>
      <p className="text-primary-100 text-lg md:text-xl mb-8">
        Pronostics sportifs avec abonnements Standard et VIP.
      </p>
      <Link 
        to="/register" 
        className="inline-block px-6 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
      >
        Commencer gratuitement
      </Link>
      <div className="mt-4">
        <Link 
          to="/login" 
          className="text-primary-200 hover:text-white underline"
        >
          Déjà un compte ? Se connecter
        </Link>
      </div>
    </div>
  )
}

