import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { executeSupabaseQuery } from '../utils/networkUtils'

const AffiliateContext = createContext()

export const useAffiliate = () => {
  const context = useContext(AffiliateContext)
  if (!context) {
    throw new Error('useAffiliate must be used within an AffiliateProvider')
  }
  return context
}

// Configuration par défaut des influenceurs
const defaultAffiliates = {
  APPLE: { 
    STFOUR: "https://apple.com/gs", 
    GLBNS: "https://apple.com/gb" 
  },
  MIC: { 
    STFOUR: "https://mic.com/gs", 
    GLBNS: "https://mic.com/gb" 
  }
}

// Pages de paiement par défaut
const defaultPaymentPages = { 
  STFOUR: "https://triumtrade.thrivecart.com/starter-fournisseurs-og/", 
  GLBNS: "https://triumtrade.thrivecart.com/global-business-og/" 
}

export const AffiliateProvider = ({ children }) => {
  const [affiliateCode, setAffiliateCode] = useState('')
  const [affiliates, setAffiliates] = useState(defaultAffiliates)
  const [paymentPages, setPaymentPages] = useState(defaultPaymentPages)

  // Charger la configuration depuis un fichier externe (simulation)
  useEffect(() => {
    loadAffiliateConfig()
  }, [])

  // Charger la configuration depuis Supabase
  const loadAffiliateConfig = async () => {
    try {
      // Utiliser la fonction avec retry pour charger la configuration
      const result = await executeSupabaseQuery(async () => {
        return await supabase
          .from('affiliate_config')
          .select('config_key, config_value')
          .in('config_key', ['affiliates', 'defaultPages'])
      }, {
        fallbackData: [],
        onRetry: (attempt, maxAttempts, errorType) => {
          console.log(`🔄 Retry ${attempt}/${maxAttempts} pour loadAffiliateConfig (${errorType})`)
        },
        onError: (error) => {
          console.error('❌ Échec définitif pour loadAffiliateConfig:', error)
        }
      })

      if (result.success && result.data && result.data.length > 0) {
        // Transformer les données en objet utilisable
        result.data.forEach(item => {
          if (item.config_key === 'affiliates') {
            setAffiliates(item.config_value)
            console.log('Affiliés chargés depuis Supabase:', item.config_value)
          } else if (item.config_key === 'defaultPages') {
            setPaymentPages(item.config_value)
            console.log('Pages de paiement chargées depuis Supabase:', item.config_value)
          }
        })
      } else {
        console.log('Aucune configuration trouvée dans Supabase, utilisation des valeurs par défaut')
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error)
      console.log('Utilisation de la configuration par défaut')
    }
  }

  // Fonction pour sauvegarder de manière robuste
  const saveAffiliateCode = (code) => {
    try {
      // Essayer localStorage d'abord
      localStorage.setItem('evocom-affiliate', code)
      
      // Backup avec sessionStorage
      sessionStorage.setItem('evocom-affiliate', code)
      
      // Backup avec cookie (plus fiable sur mobile)
      document.cookie = `evocom-affiliate=${code}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 jours
      
      console.log(`Code partenaire sauvegardé: ${code}`)
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du code partenaire:', error)
    }
  }

  // Fonction pour récupérer le code de manière robuste
  const getSavedAffiliateCode = () => {
    try {
      // Debug localStorage sur mobile
      console.log('🔍 Debug localStorage mobile:', {
        localStorage_available: typeof localStorage !== 'undefined',
        sessionStorage_available: typeof sessionStorage !== 'undefined',
        cookies_available: typeof document !== 'undefined' && typeof document.cookie !== 'undefined',
        userAgent: navigator.userAgent,
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      })
      
      // Essayer localStorage d'abord
      let savedCode = localStorage.getItem('evocom-affiliate')
      console.log('📱 localStorage result:', savedCode)
      
      // Si pas trouvé, essayer sessionStorage
      if (!savedCode) {
        savedCode = sessionStorage.getItem('evocom-affiliate')
        console.log('📱 sessionStorage result:', savedCode)
      }
      
      // Si toujours pas trouvé, essayer les cookies
      if (!savedCode) {
        const cookies = document.cookie.split(';')
        const affiliateCookie = cookies.find(cookie => 
          cookie.trim().startsWith('evocom-affiliate=')
        )
        if (affiliateCookie) {
          savedCode = affiliateCookie.split('=')[1]
          console.log('📱 cookie result:', savedCode)
        }
      }
      
      return savedCode
    } catch (error) {
      console.warn('Erreur lors de la récupération du code partenaire:', error)
      return null
    }
  }

  // Détecter le paramètre AF dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const afParam = urlParams.get('AF')
    
    console.log('🔍 Détection AF:', {
      afParam,
      currentAffiliateCode: affiliateCode,
      affiliates: Object.keys(affiliates)
    })
    
    if (afParam) {
      const upperAfParam = afParam.toUpperCase()
      
      // Vérifier si le code existe dans la configuration
      if (affiliates[upperAfParam]) {
        setAffiliateCode(upperAfParam)
        // Sauvegarder de manière robuste
        saveAffiliateCode(upperAfParam)
        console.log(`✅ Code partenaire valide activé: ${upperAfParam}`)
      } else {
        console.warn(`❌ Code partenaire invalide: ${upperAfParam}`)
        // Supprimer les codes invalides
        try {
          localStorage.removeItem('evocom-affiliate')
          sessionStorage.removeItem('evocom-affiliate')
          document.cookie = 'evocom-affiliate=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        } catch (error) {
          console.warn('Erreur lors de la suppression du code invalide:', error)
        }
      }
    } else {
      // Vérifier s'il y a un code sauvegardé
      const savedAffiliate = getSavedAffiliateCode()
      console.log('🔍 Code sauvegardé trouvé:', savedAffiliate)
      
      if (savedAffiliate && affiliates[savedAffiliate]) {
        setAffiliateCode(savedAffiliate)
        console.log(`✅ Code partenaire restauré: ${savedAffiliate}`)
      } else if (savedAffiliate) {
        console.log(`❌ Code sauvegardé invalide: ${savedAffiliate}`)
        // Le code sauvegardé n'existe plus dans la config, le supprimer
        try {
          localStorage.removeItem('evocom-affiliate')
          sessionStorage.removeItem('evocom-affiliate')
          document.cookie = 'evocom-affiliate=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        } catch (error) {
          console.warn('Erreur lors de la suppression du code invalide:', error)
        }
      } else {
        console.log('ℹ️ Aucun code partenaire trouvé')
      }
    }
  }, [affiliates])

  // Obtenir le lien de paiement pour un produit donné
  const getPaymentLink = (productId) => {
    console.log('🔍 getPaymentLink appelé:', {
      productId,
      affiliateCode,
      hasAffiliate: !!affiliateCode,
      currentAffiliate: affiliates[affiliateCode],
      paymentPages: paymentPages[productId]
    })
    
    const currentAffiliate = affiliates[affiliateCode]
    
    if (currentAffiliate && currentAffiliate[productId]) {
      console.log('✅ Lien affilié trouvé:', currentAffiliate[productId])
      return currentAffiliate[productId]
    }
    
    // Retourner la page par défaut
    const defaultLink = paymentPages[productId] || '#'
    console.log('ℹ️ Utilisation du lien par défaut:', defaultLink)
    return defaultLink
  }

  // Obtenir le code d'affiliation actuel
  const getCurrentAffiliateCode = () => {
    console.log('🔍 getCurrentAffiliateCode appelé:', {
      affiliateCode,
      hasAffiliate: !!affiliateCode,
      affiliates: Object.keys(affiliates)
    })
    return affiliateCode
  }

  // Vérifier si un code d'affiliation est actif
  const hasAffiliateCode = () => {
    return affiliateCode && affiliateCode.length > 0
  }

  // Mettre à jour la configuration (pour l'interface d'admin)
  const updateAffiliateConfig = async (newAffiliates, newPaymentPages) => {
    try {
      console.log('🔄 Début de la sauvegarde...')
      
      // Sauvegarder les affiliés
      // Vérifier si l'enregistrement existe (sans .single() qui peut causer des erreurs)
      const { data: existingAffiliates, error: checkAffiliatesError } = await supabase
        .from('affiliate_config')
        .select('id')
        .eq('config_key', 'affiliates')
        .maybeSingle()

      if (checkAffiliatesError) {
        console.error('Erreur vérification affiliés:', checkAffiliatesError)
        throw checkAffiliatesError
      }

      if (existingAffiliates) {
        // UPDATE
        console.log('📝 Mise à jour des affiliés existants...')
        const { error: affiliatesError } = await supabase
          .from('affiliate_config')
          .update({
            config_value: newAffiliates,
            updated_at: new Date().toISOString()
          })
          .eq('config_key', 'affiliates')

        if (affiliatesError) {
          console.error('Erreur UPDATE affiliés:', affiliatesError)
          throw affiliatesError
        }
        console.log('✅ Affiliés mis à jour')
      } else {
        // INSERT
        console.log('➕ Insertion de nouveaux affiliés...')
        const { error: affiliatesError } = await supabase
          .from('affiliate_config')
          .insert({
            config_key: 'affiliates',
            config_value: newAffiliates,
            updated_at: new Date().toISOString()
          })

        if (affiliatesError) {
          console.error('Erreur INSERT affiliés:', affiliatesError)
          throw affiliatesError
        }
        console.log('✅ Affiliés insérés')
      }

      // Sauvegarder les pages de paiement
      const { data: existingPages, error: checkPagesError } = await supabase
        .from('affiliate_config')
        .select('id')
        .eq('config_key', 'defaultPages')
        .maybeSingle()

      if (checkPagesError) {
        console.error('Erreur vérification pages:', checkPagesError)
        throw checkPagesError
      }

      if (existingPages) {
        // UPDATE
        console.log('📝 Mise à jour des pages existantes...')
        const { error: pagesError } = await supabase
          .from('affiliate_config')
          .update({
            config_value: newPaymentPages,
            updated_at: new Date().toISOString()
          })
          .eq('config_key', 'defaultPages')

        if (pagesError) {
          console.error('Erreur UPDATE pages:', pagesError)
          throw pagesError
        }
        console.log('✅ Pages mises à jour')
      } else {
        // INSERT
        console.log('➕ Insertion de nouvelles pages...')
        const { error: pagesError } = await supabase
          .from('affiliate_config')
          .insert({
            config_key: 'defaultPages',
            config_value: newPaymentPages,
            updated_at: new Date().toISOString()
          })

        if (pagesError) {
          console.error('Erreur INSERT pages:', pagesError)
          throw pagesError
        }
        console.log('✅ Pages insérées')
      }

      // Mettre à jour le state local après sauvegarde réussie
      setAffiliates(newAffiliates)
      setPaymentPages(newPaymentPages)
      
      console.log('✅ Configuration sauvegardée avec succès dans Supabase')
      return { success: true }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error)
      console.error('Détails:', error.message, error.details, error.hint)
      return { success: false, error }
    }
  }

  // Fonction de test pour vérifier le localStorage
  const testLocalStorage = () => {
    const testResults = {
      localStorage: {
        available: typeof localStorage !== 'undefined',
        test: null,
        error: null
      },
      sessionStorage: {
        available: typeof sessionStorage !== 'undefined',
        test: null,
        error: null
      },
      cookies: {
        available: typeof document !== 'undefined' && typeof document.cookie !== 'undefined',
        test: null,
        error: null
      }
    }

    // Test localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('test-key', 'test-value')
        testResults.localStorage.test = localStorage.getItem('test-key') === 'test-value'
        localStorage.removeItem('test-key')
      }
    } catch (error) {
      testResults.localStorage.error = error.message
    }

    // Test sessionStorage
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('test-key', 'test-value')
        testResults.sessionStorage.test = sessionStorage.getItem('test-key') === 'test-value'
        sessionStorage.removeItem('test-key')
      }
    } catch (error) {
      testResults.sessionStorage.error = error.message
    }

    // Test cookies
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'test-key=test-value; path=/'
        testResults.cookies.test = document.cookie.includes('test-key=test-value')
        document.cookie = 'test-key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    } catch (error) {
      testResults.cookies.error = error.message
    }

    return testResults
  }

  // Fonction pour tester les liens AF
  const testAffiliateLinks = () => {
    const testResults = {
      currentCode: affiliateCode,
      availableAffiliates: Object.keys(affiliates),
      paymentPages: Object.keys(paymentPages),
      testLinks: {}
    }

    // Tester les liens pour chaque affilié
    Object.keys(affiliates).forEach(affiliateName => {
      testResults.testLinks[affiliateName] = {
        STFOUR: affiliates[affiliateName].STFOUR,
        GLBNS: affiliates[affiliateName].GLBNS
      }
    })

    return testResults
  }

  const value = {
    affiliateCode,
    getPaymentLink,
    getCurrentAffiliateCode,
    hasAffiliateCode,
    updateAffiliateConfig,
    affiliates,
    paymentPages,
    testLocalStorage,
    testAffiliateLinks
  }

  return (
    <AffiliateContext.Provider value={value}>
      {children}
    </AffiliateContext.Provider>
  )
}
