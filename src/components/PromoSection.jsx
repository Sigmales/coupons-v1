import { useState } from 'react'
import { BOOKMAKERS } from '../utils/constants'
import { Check, Clipboard } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function PromoSection() {
  const [copied, setCopied] = useState(false)
  const copyPromoCode = () => {
    navigator.clipboard.writeText('Le226')
    setCopied(true)
    toast.success('Code promo copié !')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Nos Codes Promo Exclusifs</h2>
          <p className="text-primary-100 text-lg md:text-xl mb-6">Utilisez notre code promo sur les meilleurs bookmakers</p>
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-accent-500 to-accent-400 px-8 py-4 rounded-full shadow-2xl">
            <span className="text-3xl font-black text-primary-900">Le226</span>
            <button onClick={copyPromoCode} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2">
              {copied ? (<><Check className="w-5 h-5 text-white" /><span className="text-white font-semibold">Copié !</span></>) : (<><Clipboard className="w-5 h-5 text-white" /><span className="text-white font-semibold">Copier</span></>)}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {BOOKMAKERS.map((bk) => (
            <div key={bk.name} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className={`absolute top-4 right-4 bg-gradient-to-r ${bk.color} text-white px-3 py-1 rounded-full text-xs font-bold z-10`}>
                {bk.bonus}
              </div>
              <div className="p-6 flex justify-center items-center h-32 bg-gray-50">
                <img src={bk.logo} alt={bk.name} className="max-h-20 max-w-full object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-6 border-t border-gray-100">
                <h3 className="text-xl font-bold text-primary-900 mb-2 text-center">{bk.name}</h3>
                <p className="text-sm text-gray-600 text-center mb-4">Code : <span className="font-bold text-accent-600">Le226</span></p>
                <a href={bk.link} target="_blank" rel="noopener noreferrer" className={`block w-full bg-gradient-to-r ${bk.color} text-white text-center py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-300 shadow-md hover:shadow-lg`}>
                  S'inscrire →
                </a>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-r ${bk.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
            </div>
          ))}
        </div>
        <p className="text-center text-primary-200 mt-8 text-sm">⚠️ Jouez de manière responsable. +18 ans uniquement.</p>
      </div>
    </section>
  )
}

