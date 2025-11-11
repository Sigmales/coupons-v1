import LoginForm from '../components/auth/LoginForm.jsx'
import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 my-10">
      <h2 className="text-2xl font-bold text-primary-900 mb-4">Connexion</h2>
      <LoginForm />
      <div className="mt-4 text-sm">
        <Link to="/forgot-password" className="text-primary-600 hover:underline">Mot de passe oublié ?</Link>
      </div>
    </div>
  )
}

