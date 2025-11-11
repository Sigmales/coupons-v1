export const PAYMENT_NUMBERS = {
  orangeMoney: {
    number: '75185671',
    displayNumber: '75 18 56 71',
    provider: 'Orange Money',
    icon: '🟠',
    color: 'orange'
  },
  moovMoney: {
    number: '53591517',
    displayNumber: '53 59 15 17',
    provider: 'Moov Money',
    icon: '🔵',
    color: 'blue'
  }
}

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Gratuit',
    price: 0,
    features: [
      'Aperçu des matchs du jour',
      'Accès limité aux pronostics',
      'Publicité présente'
    ],
    color: 'gray'
  },
  standard: {
    name: 'Standard',
    monthlyPrice: 750,
    annualPrice: 7650,
    discount: 15,
    features: [
      'Tous les matchs du jour',
      'Pronostics standard',
      'Statistiques de base',
      'Historique 7 jours',
      'Support standard'
    ],
    color: 'primary',
    popular: false
  },
  vip: {
    name: 'VIP',
    monthlyPrice: 1500,
    annualPrice: 12600,
    discount: 30,
    features: [
      'Accès complet illimité',
      '🔥 Pronostics VIP premium',
      'Statistiques avancées',
      'Support prioritaire',
      'Historique illimité',
      'Notifications prioritaires',
      'Badge VIP exclusif'
    ],
    color: 'secondary',
    popular: true
  }
}

export const BOOKMAKERS = [
  {
    name: '1xbet',
    code: 'Le226',
    logo: '/logos/1xbet.png',
    link: 'https://1xbet.com',
    bonus: 'Bonus de 130€',
    color: 'from-blue-600 to-blue-800'
  },
  {
    name: 'Betwinner',
    code: 'Le226',
    logo: '/logos/betwinner.png',
    link: 'https://betwinner.com',
    bonus: 'Bonus de 100€',
    color: 'from-green-600 to-green-800'
  },
  {
    name: 'Melbet',
    code: 'Le226',
    logo: '/logos/melbet.png',
    link: 'https://melbet.com',
    bonus: 'Bonus de 100€',
    color: 'from-red-600 to-red-800'
  },
  {
    name: '1win',
    code: 'Le226',
    logo: '/logos/1win.png',
    link: 'https://1win.com',
    bonus: 'Bonus de 500€',
    color: 'from-purple-600 to-purple-800'
  },
  {
    name: '1xbit',
    code: 'Le226',
    logo: '/logos/1xbit.png',
    link: 'https://1xbit.com',
    bonus: 'Bonus de 7 BTC',
    color: 'from-orange-600 to-orange-800'
  }
]

export const PREDICTION_TYPES = [
  { value: '1X2', label: '1X2 (Résultat)' },
  { value: 'BTTS', label: 'BTTS (Les deux marquent)' },
  { value: 'Over/Under', label: 'Plus/Moins de buts' },
  { value: 'Double Chance', label: 'Double Chance' },
  { value: 'Handicap', label: 'Handicap' }
]

