export default function AdminHome() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-white mb-4">Admin - Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl p-6 shadow">Statuts (à venir)</div>
        <div className="bg-white rounded-xl p-6 shadow">Paiements en attente (à venir)</div>
      </div>
    </div>
  )
}

