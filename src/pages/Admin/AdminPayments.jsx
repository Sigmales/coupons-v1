import { useState } from 'react'
import PaymentVerification from '../../components/admin/PaymentVerification.jsx'
import PromoCodeManagement from '../../components/admin/PromoCodeManagement.jsx'

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState('payments')

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Gestion financière</h2>
        <p className="text-primary-200">Valider les paiements et gérer les codes promo</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-primary-200">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'payments'
              ? 'text-white border-b-2 border-white'
              : 'text-primary-200 hover:text-white'
          }`}
        >
          Validation des paiements
        </button>
        <button
          onClick={() => setActiveTab('promos')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'promos'
              ? 'text-white border-b-2 border-white'
              : 'text-primary-200 hover:text-white'
          }`}
        >
          Codes promo personnalisés
        </button>
      </div>

      {/* Content */}
      {activeTab === 'payments' ? (
        <PaymentVerification />
      ) : (
        <PromoCodeManagement />
      )}
    </div>
  )
}

