import RegisterForm from '../components/auth/RegisterForm.jsx'

export default function Register() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 my-10">
      <h2 className="text-2xl font-bold text-primary-900 mb-4">Créer un compte</h2>
      <RegisterForm />
    </div>
  )
}

