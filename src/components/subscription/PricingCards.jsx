import { SUBSCRIPTION_PLANS } from '../../utils/constants.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function PricingCards() {
  const [isAnnual, setIsAnnual] = useState(false)
  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-white">Mensuel</span>
        <button
          onClick={() => setIsAnnual(v => !v)}
          className="relative inline-flex h-6 w-12 items-center rounded-full bg-primary-600"
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-white">Annuel</span>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {['free', 'standard', 'vip'].map((key) => {
          const p = SUBSCRIPTION_PLANS[key]
          const price = key === 'free' ? 0 : (isAnnual ? p.annualPrice : p.monthlyPrice)
          return (
            <div key={key} className="bg-white rounded-2xl shadow p-6 border border-primary-100">
              {p.popular && (
                <div className="mb-2 text-xs font-bold text-white inline-block px-3 py-1 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500">
                  POPULAIRE
                </div>
              )}
              <h3 className="text-xl font-bold text-primary-900">{p.name}</h3>
              <div className="text-3xl font-extrabold text-primary-800 my-3">
                {price === 0 ? 'Gratuit' : `${price} CFA`}
              </div>
              <ul className="text-sm text-gray-700 space-y-2 mb-6">
                {p.features.map(f => <li key={f}>• {f}</li>)}
              </ul>
              {key === 'free' ? (
                <Link to="/dashboard" className="block text-center py-3 rounded-lg text-white bg-primary-600 hover:bg-primary-700">Essayer</Link>
              ) : (
                <Link
                  to={`/payment?plan=${key}&duration=${isAnnual ? 'annual' : 'monthly'}`}
                  className="block text-center py-3 rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                >
                  Choisir ce plan
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

