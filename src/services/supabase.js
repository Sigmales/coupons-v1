import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. Please check your .env file or Vercel environment variables.'
  console.error(errorMsg)
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  throw new Error(errorMsg)
}

// Configuration optimisée pour Vercel et Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce' // Utiliser PKCE pour une meilleure sécurité
  },
  global: {
    headers: {
      'x-client-info': 'coupons-app@1.0.0'
    }
  }
})

// Log de debug en développement
if (import.meta.env.DEV) {
  console.log('Supabase client initialized:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey
  })
}

