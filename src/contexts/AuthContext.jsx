import { createContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'

export const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fonction simple pour charger le profil
  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Si le profil n'existe pas, le créer
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
          console.log('Profile not found, creating...')
          
          // Récupérer les métadonnées utilisateur
          const { data: userData } = await supabase.auth.getUser()
          const fullName = userData?.user?.user_metadata?.full_name || 
                          userData?.user?.email?.split('@')[0] || 
                          'Utilisateur'

          // Créer le profil
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              id: userId, 
              full_name: fullName, 
              subscription_type: 'free',
              is_admin: false
            })
            .select()
            .single()

          if (!insertError && newProfile) {
            setProfile(newProfile)
            return
          }
        }
        
        console.error('Error loading profile:', error)
        setProfile(null)
        return
      }

      setProfile(data)
    } catch (err) {
      console.error('Error in loadProfile:', err)
      setProfile(null)
    }
  }, [])

  // Initialisation
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // Récupérer la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await loadProfile(session.user.id)
          } else {
            setProfile(null)
          }
          
          setLoading(false)
        }
      } catch (err) {
        console.error('Error in initAuth:', err)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    initAuth()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (mounted) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await loadProfile(session.user.id)
          } else {
            setProfile(null)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  // Fonctions d'authentification
  const signIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        return { error, data: null }
      }

      return { error: null, data }
    } catch (err) {
      console.error('Sign in error:', err)
      return { error: err, data: null }
    }
  }, [])

  const signUp = useCallback(async (email, password, full_name) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: full_name || 'Utilisateur'
          }
        }
      })
      
      if (error) {
        return { error, data: null }
      }

      return { error: null, data }
    } catch (err) {
      console.error('Sign up error:', err)
      return { error: err, data: null }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
    } catch (err) {
      console.error('Sign out exception:', err)
      throw err
    }
  }, [])

  const reloadProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id)
    }
  }, [user, loadProfile])

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    reloadProfile
  }), [user, profile, loading, signIn, signUp, signOut, reloadProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
