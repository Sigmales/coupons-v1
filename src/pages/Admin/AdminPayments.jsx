import PaymentVerification from '../../components/admin/PaymentVerification.jsx'

export default function AdminPayments() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-white mb-4">Validation des paiements</h2>
      <PaymentVerification />
    </div>
  )
}

