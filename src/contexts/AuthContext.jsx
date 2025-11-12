import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fonction pour charger le profil utilisateur depuis la table profiles
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
            console.log('✅ Profile created:', newProfile)
            setProfile(newProfile)
            return
          } else {
            console.error('Error creating profile:', insertError)
          }
        }
        
        console.error('Error loading profile:', error)
        setProfile(null)
        return
      }

      console.log('✅ Profile loaded:', data)
      setProfile(data)
    } catch (err) {
      console.error('Error in loadProfile:', err)
      setProfile(null)
    }
  }, [])

  // Initialisation : vérifier la session au chargement
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

  // Fonction d'inscription
  const signUp = useCallback(async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName || 'Utilisateur'
          }
        }
      })
      
      if (error) {
        console.error('Sign up error:', error)
        return { error, data: null }
      }

      console.log('✅ Sign up successful:', data)
      return { error: null, data }
    } catch (err) {
      console.error('Sign up exception:', err)
      return { error: err, data: null }
    }
  }, [])

  // Fonction de connexion
  const signIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('Sign in error:', error)
        return { error, data: null }
      }

      console.log('✅ Sign in successful:', data)
      // Le profil sera chargé automatiquement par onAuthStateChange
      return { error: null, data }
    } catch (err) {
      console.error('Sign in exception:', err)
      return { error: err, data: null }
    }
  }, [])

  // Fonction de déconnexion
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      console.log('✅ Sign out successful')
    } catch (err) {
      console.error('Sign out exception:', err)
      throw err
    }
  }, [])

  // Fonction pour recharger le profil
  const reloadProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id)
    }
  }, [user, loadProfile])

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    reloadProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

