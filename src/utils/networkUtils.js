import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

// Configuration pour les tentatives de reconnexion
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 seconde
  maxDelay: 10000, // 10 secondes
  backoffMultiplier: 2
}

// Types d'erreurs réseau
export const NETWORK_ERROR_TYPES = {
  DISCONNECTED: 'ERR_INTERNET_DISCONNECTED',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN'
}

// Fonction pour détecter le type d'erreur
const detectErrorType = (error) => {
  const message = error.message || error.toString()
  
  if (message.includes('ERR_INTERNET_DISCONNECTED') || 
      message.includes('Failed to fetch') ||
      message.includes('NetworkError')) {
    return NETWORK_ERROR_TYPES.DISCONNECTED
  }
  
  if (message.includes('timeout') || message.includes('TIMEOUT')) {
    return NETWORK_ERROR_TYPES.TIMEOUT
  }
  
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return NETWORK_ERROR_TYPES.SERVER_ERROR
  }
  
  return NETWORK_ERROR_TYPES.UNKNOWN
}

// Fonction pour vérifier la connectivité réseau
export const checkNetworkConnectivity = async () => {
  try {
    // Test simple de connectivité
    const response = await fetch('https://httpbin.org/get', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    })
    return true
  } catch (error) {
    console.warn('Vérification de connectivité échouée:', error)
    return false
  }
}

// Fonction pour attendre avec un délai exponentiel
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Fonction pour calculer le délai de retry
const calculateRetryDelay = (attempt, baseDelay = RETRY_CONFIG.baseDelay) => {
  const delay = baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt)
  return Math.min(delay, RETRY_CONFIG.maxDelay)
}

// Fonction pour exécuter une requête Supabase avec retry
export const executeSupabaseQuery = async (queryFunction, options = {}) => {
  const { 
    maxRetries = RETRY_CONFIG.maxRetries,
    onRetry = null,
    onError = null,
    fallbackData = null 
  } = options

  let lastError = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentative ${attempt + 1}/${maxRetries + 1}`)
      
      // Vérifier la connectivité avant la première tentative
      if (attempt === 0) {
        const isOnline = await checkNetworkConnectivity()
        if (!isOnline) {
          throw new Error('Pas de connexion internet')
        }
      }
      
      const result = await queryFunction()
      
      // Si on a réussi, retourner le résultat
      if (result.data !== undefined && !result.error) {
        console.log('✅ Requête réussie')
        return result
      }
      
      // Si on a une erreur Supabase, la traiter
      if (result.error) {
        const errorType = detectErrorType(result.error)
        lastError = result.error
        
        console.warn(`⚠️ Erreur Supabase (${errorType}):`, result.error)
        
        // Si c'est une erreur de connexion et qu'on peut retry
        if (errorType === NETWORK_ERROR_TYPES.DISCONNECTED && attempt < maxRetries) {
          const delay = calculateRetryDelay(attempt)
          console.log(`⏳ Attente de ${delay}ms avant retry...`)
          
          if (onRetry) {
            onRetry(attempt + 1, maxRetries + 1, errorType)
          }
          
          await sleep(delay)
          continue
        }
        
        // Si on ne peut plus retry ou que c'est une autre erreur
        break
      }
      
      return result
      
    } catch (error) {
      lastError = error
      const errorType = detectErrorType(error)
      
      console.error(`❌ Erreur lors de la requête (${errorType}):`, error)
      
      // Si c'est une erreur de connexion et qu'on peut retry
      if (errorType === NETWORK_ERROR_TYPES.DISCONNECTED && attempt < maxRetries) {
        const delay = calculateRetryDelay(attempt)
        console.log(`⏳ Attente de ${delay}ms avant retry...`)
        
        if (onRetry) {
          onRetry(attempt + 1, maxRetries + 1, errorType)
        }
        
        await sleep(delay)
        continue
      }
      
      // Si on ne peut plus retry
      break
    }
  }
  
  // Toutes les tentatives ont échoué
  const finalError = {
    message: lastError?.message || 'Erreur de connexion',
    type: detectErrorType(lastError),
    attempts: maxRetries + 1,
    originalError: lastError
  }
  
  console.error('❌ Toutes les tentatives ont échoué:', finalError)
  
  if (onError) {
    onError(finalError)
  }
  
  // Retourner les données de fallback si disponibles
  if (fallbackData !== null) {
    console.log('🔄 Utilisation des données de fallback')
    return { success: false, error: finalError, fallbackData }
  }
  
  return { success: false, error: finalError }
}

// Fonction pour créer un wrapper avec retry pour les fonctions de tracking
export const createRetryWrapper = (originalFunction, options = {}) => {
  return async (...args) => {
    return executeSupabaseQuery(
      () => originalFunction(...args),
      options
    )
  }
}

// Fonction pour obtenir les statistiques avec retry
export const getClickStatsWithRetry = async (filters = {}) => {
  return executeSupabaseQuery(async () => {
    let query = supabase
      .from('link_clicks')
      .select('*')

    // Appliquer les filtres
    if (filters.dateFrom) {
      query = query.gte('timestamp', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('timestamp', filters.dateTo)
    }
    if (filters.linkType) {
      query = query.eq('link_type', filters.linkType)
    }
    if (filters.affiliateName) {
      query = query.eq('affiliate_name', filters.affiliateName)
    }
    if (filters.source) {
      query = query.eq('click_source', filters.source)
    }

    return await query.order('timestamp', { ascending: false })
  }, {
    fallbackData: [],
    onRetry: (attempt, maxAttempts, errorType) => {
      console.log(`🔄 Retry ${attempt}/${maxAttempts} pour getClickStats (${errorType})`)
    },
    onError: (error) => {
      console.error('❌ Échec définitif pour getClickStats:', error)
    }
  })
}

// Fonction pour obtenir les visiteurs avec retry
export const getVisitorsWithRetry = async (filters = {}) => {
  return executeSupabaseQuery(async () => {
    let query = supabase
      .from('visitors')
      .select('*')

    // Appliquer les filtres
    if (filters.dateFrom) {
      query = query.gte('timestamp', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('timestamp', filters.dateTo)
    }
    if (filters.deviceType) {
      query = query.eq('device_type', filters.deviceType)
    }
    if (filters.browser) {
      query = query.eq('browser', filters.browser)
    }
    if (filters.affiliateCode) {
      query = query.eq('affiliate_code', filters.affiliateCode)
    }

    return await query.order('timestamp', { ascending: false })
  }, {
    fallbackData: [],
    onRetry: (attempt, maxAttempts, errorType) => {
      console.log(`🔄 Retry ${attempt}/${maxAttempts} pour getVisitors (${errorType})`)
    },
    onError: (error) => {
      console.error('❌ Échec définitif pour getVisitors:', error)
    }
  })
}

// Fonction pour obtenir les visiteurs actuels avec retry
export const getCurrentVisitorsWithRetry = async () => {
  return executeSupabaseQuery(async () => {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    
    return await supabase
      .from('visitors')
      .select('*')
      .gte('timestamp', fiveMinutesAgo.toISOString())
      .order('timestamp', { ascending: false })
  }, {
    fallbackData: [],
    onRetry: (attempt, maxAttempts, errorType) => {
      console.log(`🔄 Retry ${attempt}/${maxAttempts} pour getCurrentVisitors (${errorType})`)
    },
    onError: (error) => {
      console.error('❌ Échec définitif pour getCurrentVisitors:', error)
    }
  })
}

// Fonction pour tracker un clic avec retry
export const trackClickWithRetry = async (clickData) => {
  return executeSupabaseQuery(async () => {
    return await supabase
      .from('link_clicks')
      .insert([clickData])
  }, {
    onRetry: (attempt, maxAttempts, errorType) => {
      console.log(`🔄 Retry ${attempt}/${maxAttempts} pour trackClick (${errorType})`)
    },
    onError: (error) => {
      console.error('❌ Échec définitif pour trackClick:', error)
    }
  })
}

// Fonction pour tracker un visiteur avec retry
export const trackVisitorWithRetry = async (visitorData) => {
  return executeSupabaseQuery(async () => {
    return await supabase
      .from('visitors')
      .insert([visitorData])
  }, {
    onRetry: (attempt, maxAttempts, errorType) => {
      console.log(`🔄 Retry ${attempt}/${maxAttempts} pour trackVisitor (${errorType})`)
    },
    onError: (error) => {
      console.error('❌ Échec définitif pour trackVisitor:', error)
    }
  })
}

// Hook pour détecter l'état de la connexion
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setIsConnecting(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsConnecting(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const testConnection = async () => {
    setIsConnecting(true)
    const result = await checkNetworkConnectivity()
    setIsOnline(result)
    setIsConnecting(false)
    return result
  }

  return {
    isOnline,
    isConnecting,
    testConnection
  }
}

// Fonction utilitaire pour formater les erreurs pour l'affichage
export const formatNetworkError = (error) => {
  if (!error) return 'Erreur inconnue'
  
  switch (error.type) {
    case NETWORK_ERROR_TYPES.DISCONNECTED:
      return 'Connexion internet perdue. Vérifiez votre connexion réseau.'
    case NETWORK_ERROR_TYPES.TIMEOUT:
      return 'La requête a expiré. Le serveur met trop de temps à répondre.'
    case NETWORK_ERROR_TYPES.SERVER_ERROR:
      return 'Erreur du serveur. Veuillez réessayer plus tard.'
    default:
      return error.message || 'Erreur de connexion inattendue.'
  }
}
