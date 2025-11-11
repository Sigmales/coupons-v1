import { createContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'

export const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Fonction pour charger le profil avec retry
  const loadProfile = useCallback(async (userId, retryCount = 0) => {
    if (!userId) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        
        // Si le profil n'existe pas (PGRST116 = no rows returned)
        if (error.code === 'PGRST116') {
          // Attendre un peu pour que le trigger crée le profil
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
            return loadProfile(userId, retryCount + 1)
          }
          
          // Si après 3 tentatives le profil n'existe toujours pas, le créer
          try {
            const { data: userData } = await supabase.auth.getUser()
            if (userData?.user) {
              const fullName = userData.user.user_metadata?.full_name || 'Utilisateur'
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
                setProfileLoading(false)
                return
              }
            }
          } catch (createErr) {
            console.error('Error creating profile:', createErr)
          }
        }
        
        // Pour les autres erreurs, on continue sans profil
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error in loadProfile:', err)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  // Initialisation et écoute des changements d'authentification
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // Récupérer la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
          
          if (session?.user) {
            await loadProfile(session.user.id)
          } else {
            setProfile(null)
            setProfileLoading(false)
          }
        }
      } catch (err) {
        console.error('Error in initAuth:', err)
        if (mounted) {
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
            // Nouvelle connexion ou rafraîchissement
            await loadProfile(session.user.id)
          } else {
            // Déconnexion
            setProfile(null)
            setProfileLoading(false)
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

      // Le profil sera chargé automatiquement par onAuthStateChange
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

      // Si l'email confirmation n'est pas requise, le profil sera chargé automatiquement
      if (data.user && !data.session) {
        // Email confirmation requise
        return { error: null, data }
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
      // Le state sera mis à jour par onAuthStateChange
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
    loading: loading || profileLoading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    reloadProfile
  }), [user, profile, loading, profileLoading, signIn, signUp, signOut, reloadProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

