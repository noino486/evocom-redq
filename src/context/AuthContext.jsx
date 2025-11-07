import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Niveaux d'accès
export const ACCESS_LEVELS = {
  PRODUCT_1: 1,      // Produit 1 seulement
  PRODUCT_1_2: 2,    // Produits 1 + 2
  SUPPORT: 3,        // Support
  ADMIN: 4           // Admin (accès complet)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let subscription = null
    
    // Vérifier la session au chargement
    checkSession().then(() => {
      if (!mounted) return
      
      // Écouter les changements d'authentification après la vérification initiale
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return
          if (session?.user) {
            setUser(session.user)
            await loadUserProfile(session.user.id)
          } else {
            setUser(null)
            setProfile(null)
          }
          setLoading(false)
        }
      )
      subscription = sub
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setLoading(false)
        return
      }
      
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('[checkSession] Exception:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId) => {
    try {
      if (!supabase) {
        return
      }
      
      // Requête directe avec timeout réduit pour plus de rapidité
      const startTime = Date.now()
      const { data, error } = await Promise.race([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 3000)
        )
      ]).catch((err) => {
        if (err.message === 'TIMEOUT') {
          console.error('[loadUserProfile] TIMEOUT - Problème RLS probable')
          return { data: null, error: { message: 'TIMEOUT - Problème RLS' } }
        }
        return { data: null, error: { message: err.message || 'Erreur inconnue' } }
      })

      if (error) {
        // Si le profil n'existe pas, c'est normal pour un nouvel utilisateur
        if (error.code === 'PGRST116') {
          return
        }
        
        // Si erreur de permission RLS
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('row-level')) {
          console.error('[loadUserProfile] Erreur RLS')
        }
        
        return
      }

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('[loadUserProfile] Exception lors du chargement du profil:', error)
      console.error('[loadUserProfile] Stack:', error.stack)
    }
  }

  const signIn = async (email, password) => {
    try {
      // Vérifier la connexion réseau
      if (!navigator.onLine) {
        return { success: false, error: 'Pas de connexion internet. Vérifiez votre connexion réseau.' }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Améliorer les messages d'erreur
        let errorMessage = error.message
        if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
          errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet et que les variables Supabase sont correctement configurées.'
        } else if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email ou mot de passe incorrect'
        }
        
        throw new Error(errorMessage)
      }

      setUser(data.user)
      // Charger le profil en arrière-plan (ne pas bloquer)
      loadUserProfile(data.user.id).catch(err => console.error('Erreur chargement profil:', err))
      
      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message || 'Erreur de connexion' }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      return { success: true }
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
      return { success: false, error: error.message }
    }
  }

  // Vérifier si l'utilisateur a accès à un produit spécifique
  const hasProductAccess = (productId) => {
    if (!profile || !profile.is_active) return false
    
    // Admins ont accès à tout
    if (profile.access_level === ACCESS_LEVELS.ADMIN) return true
    
    // Support a accès à tout
    if (profile.access_level === ACCESS_LEVELS.SUPPORT) return true
    
    // Niveau 2: Accès aux produits 1 et 2
    if (profile.access_level === ACCESS_LEVELS.PRODUCT_1_2) {
      return productId === 'STFOUR' || productId === 'GLBNS'
    }
    
    // Niveau 1: Accès au produit 1 seulement (STFOUR)
    if (profile.access_level === ACCESS_LEVELS.PRODUCT_1) {
      return productId === 'STFOUR'
    }
    
    return false
  }

  // Vérifier si l'utilisateur a un niveau d'accès minimum
  const hasAccessLevel = (minLevel) => {
    if (!profile || !profile.is_active) return false
    return profile.access_level >= minLevel
  }

  // Vérifier si l'utilisateur est admin
  const isAdmin = () => {
    return profile?.access_level === ACCESS_LEVELS.ADMIN && profile?.is_active
  }

  // Vérifier si l'utilisateur est support ou admin
  const isSupportOrAdmin = () => {
    return profile?.access_level >= ACCESS_LEVELS.SUPPORT && profile?.is_active
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    hasProductAccess,
    hasAccessLevel,
    isAdmin,
    isSupportOrAdmin,
    loadUserProfile,
    ACCESS_LEVELS
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

