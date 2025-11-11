import { createContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabase'

export const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
      setLoading(false)
      if (data.session?.user) {
        await loadProfile(data.session.user.id)
      }
    }
    init()
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (error) {
        console.error('Error loading profile:', error)
        // Le profil devrait être créé automatiquement par le trigger
        // Si ce n'est pas le cas, attendre un peu et réessayer
        if (error.code === 'PGRST116') {
          // Attendre que le trigger crée le profil
          await new Promise(resolve => setTimeout(resolve, 1500))
          const { data: retryData, error: retryError } = await supabase.from('profiles').select('*').eq('id', userId).single()
          if (retryData) {
            setProfile(retryData)
          } else if (retryError && retryError.code === 'PGRST116') {
            // Si le profil n'existe toujours pas, essayer de le créer
            const { data: userData } = await supabase.auth.getUser()
            if (userData?.user) {
              const fullName = userData.user.user_metadata?.full_name || 'Utilisateur'
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({ id: userId, full_name: fullName, subscription_type: 'free' })
                .select()
                .single()
              if (!insertError && newProfile) {
                setProfile(newProfile)
              }
            }
          }
        }
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error in loadProfile:', err)
    }
  }

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, full_name) => supabase.auth.signUp({ email, password, options: { data: { full_name } } }),
    signOut: () => supabase.auth.signOut(),
    reloadProfile: () => user ? loadProfile(user.id) : Promise.resolve()
  }), [user, profile, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

