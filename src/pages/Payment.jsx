import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PaymentInstructions from '../components/subscription/PaymentInstructions.jsx'
import { SUBSCRIPTION_PLANS } from '../utils/constants.js'

export default function Payment() {
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan') === 'vip' ? 'vip' : 'standard'
  const duration = searchParams.get('duration') === 'annual' ? 'annual' : 'monthly'
  const [submitted, setSubmitted] = useState(false)

  const amount = useMemo(() => {
    const p = SUBSCRIPTION_PLANS[plan]
    return duration === 'annual' ? p.annualPrice : p.monthlyPrice
  }, [plan, duration])

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Demande envoyée ✅</h2>
          <p className="text-gray-700">Vous recevrez une confirmation sous 24h.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6 text-white">
        <h1 className="text-3xl font-extrabold">Paiement</h1>
        <p className="text-primary-100">Plan: {plan.toUpperCase()} • {duration === 'annual' ? 'Annuel' : 'Mensuel'} • {amount} CFA</p>
      </div>
      <PaymentInstructions
        plan={plan}
        duration={duration === 'annual' ? 'annual' : 'monthly'}
        amount={amount}
        onSuccess={() => setSubmitted(true)}
      />
    </div>
  )
}

