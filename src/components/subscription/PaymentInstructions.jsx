import { useState } from 'react'
import { supabase } from '../../services/supabase'
import { PAYMENT_NUMBERS } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function PaymentInstructions({ plan, duration, amount, onSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('orange_money')
  const [senderNumber, setSenderNumber] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La capture ne doit pas dépasser 5 MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image')
        return
      }
      setScreenshot(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const copyNumber = (number) => {
    navigator.clipboard.writeText(number)
    toast.success('Numéro copié !')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!screenshot) {
      toast.error('Veuillez télécharger une capture d\'écran')
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Veuillez vous connecter')
        return
      }
      const fileExt = screenshot.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('payment-screenshots').upload(fileName, screenshot)
      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage.from('payment-screenshots').getPublicUrl(fileName)
      const screenshot_url = publicData.publicUrl

      const { error: insertError } = await supabase.from('payment_requests').insert({
        user_id: user.id,
        plan,
        duration,
        amount,
        payment_method: selectedMethod,
        sender_number: senderNumber,
        screenshot_url,
        status: 'pending'
      })
      if (insertError) throw insertError
      toast.success('Demande de paiement soumise ! Validation sous 24h.')
      onSuccess?.()
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la soumission. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const currentMethod = PAYMENT_NUMBERS[selectedMethod === 'orange_money' ? 'orangeMoney' : 'moovMoney']

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4">
          <span className="text-3xl">💳</span>
        </div>
        <h2 className="text-3xl font-bold text-primary-900 mb-2">Instructions de Paiement</h2>
        <p className="text-gray-600">
          Plan <span className="font-bold text-primary-600">{plan === 'standard' ? 'Standard' : 'VIP'}</span> -
          <span className="font-bold text-accent-600"> {amount} CFA</span> /
          {duration === 'monthly' ? ' Mois' : ' An'}
        </p>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">1. Choisissez votre méthode de paiement</label>
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => setSelectedMethod('orange_money')} className={`p-4 border-2 rounded-xl transition-all duration-300 ${selectedMethod === 'orange_money' ? 'border-orange-500 bg-orange-50 shadow-lg' : 'border-gray-200 hover:border-orange-300'}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🟠</span>
              <div className="text-left">
                <div className="font-bold text-gray-800">Orange Money</div>
                <div className="text-sm text-gray-600">{PAYMENT_NUMBERS.orangeMoney.displayNumber}</div>
              </div>
            </div>
          </button>
          <button type="button" onClick={() => setSelectedMethod('moov_money')} className={`p-4 border-2 rounded-xl transition-all duration-300 ${selectedMethod === 'moov_money' ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔵</span>
              <div className="text-left">
                <div className="font-bold text-gray-800">Moov Money</div>
                <div className="text-sm text-gray-600">{PAYMENT_NUMBERS.moovMoney.displayNumber}</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="mb-8 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
        <h3 className="font-bold text-lg text-primary-900 mb-4 flex items-center gap-2"><span>📋</span> Étapes à suivre</h3>
        <div className="space-y-4">
          {[1,2,3,4,5].map((n, idx) => (
            <div key={n} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">{n}</div>
              <div className="flex-1">
                {idx === 0 && <p className="text-gray-700">Ouvrez votre application <span className="font-bold">{currentMethod.provider}</span></p>}
                {idx === 1 && (
                  <div>
                    <p className="text-gray-700 mb-2">Envoyez <span className="font-bold text-accent-600">{amount} CFA</span> au numéro :</p>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg border-2 border-primary-300">
                      <span className="text-2xl font-bold text-primary-900 flex-1">{currentMethod.displayNumber}</span>
                      <button type="button" onClick={() => copyNumber(currentMethod.number)} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200">📋 Copier</button>
                    </div>
                  </div>
                )}
                {idx === 2 && <p className="text-gray-700">Prenez une <span className="font-bold">capture d'écran</span> de la confirmation de paiement</p>}
                {idx === 3 && <p className="text-gray-700">Téléchargez la capture ci-dessous et soumettez votre demande</p>}
                {idx === 4 && <p className="text-gray-700">Attendez la validation par notre équipe <span className="font-bold text-green-600">(sous 24h)</span></p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="payment-phone" className="block text-sm font-semibold text-gray-700 mb-2">2. Votre numéro de téléphone (optionnel)</label>
          <input 
            id="payment-phone"
            type="tel" 
            value={senderNumber} 
            onChange={(e) => setSenderNumber(e.target.value)} 
            placeholder="Ex: 70 12 34 56" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            aria-label="Numéro de téléphone"
          />
          <p className="text-xs text-gray-500 mt-1">Pour faciliter la vérification de votre paiement</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">3. Téléchargez la capture d'écran *</label>
          {!preview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors duration-300">
              <input type="file" id="screenshot" accept="image/*" onChange={handleFileChange} className="hidden" />
              <label htmlFor="screenshot" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📸</span>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold mb-1">Cliquez pour sélectionner une image</p>
                  <p className="text-sm text-gray-500">PNG, JPG jusqu'à 5MB</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img src={preview} alt="Aperçu" className="w-full max-h-96 object-contain rounded-xl border-2 border-primary-300" />
              <button type="button" onClick={() => { setScreenshot(null); setPreview(null) }} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200">
                <span className="text-xl">×</span>
              </button>
            </div>
          )}
        </div>
        <button type="submit" disabled={loading || !screenshot} className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${loading || !screenshot ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl'}`}>
          {loading ? (<span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Envoi en cours...</span>) : ('Soumettre pour validation')}
        </button>
      </form>

      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-sm text-yellow-800">
          <span className="font-bold">⚠️ Important :</span> Assurez-vous que la capture d'écran montre clairement le montant, le numéro destinataire et la date de transaction.
        </p>
      </div>
    </div>
  )
}

