import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

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
      // Récupérer la configuration depuis Supabase
      const { data, error } = await supabase
        .from('affiliate_config')
        .select('config_key, config_value')
        .in('config_key', ['affiliates', 'defaultPages'])

      if (error) {
        console.error('Erreur Supabase:', error)
        console.log('Utilisation de la configuration par défaut')
        return
      }

      if (data && data.length > 0) {
        // Transformer les données en objet utilisable
        data.forEach(item => {
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

  // Détecter le paramètre AF dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const afParam = urlParams.get('AF')
    
    if (afParam) {
      const upperAfParam = afParam.toUpperCase()
      
      // Vérifier si le code existe dans la configuration
      if (affiliates[upperAfParam]) {
        setAffiliateCode(upperAfParam)
        // Sauvegarder dans le localStorage pour persister la session
        localStorage.setItem('evocom-affiliate', upperAfParam)
        console.log(`Code partenaire valide activé: ${upperAfParam}`)
      } else {
        console.warn(`Code partenaire invalide: ${upperAfParam}`)
        // Supprimer le code invalide du localStorage s'il existe
        localStorage.removeItem('evocom-affiliate')
      }
    } else {
      // Vérifier s'il y a un code sauvegardé
      const savedAffiliate = localStorage.getItem('evocom-affiliate')
      if (savedAffiliate && affiliates[savedAffiliate]) {
        setAffiliateCode(savedAffiliate)
      } else if (savedAffiliate) {
        // Le code sauvegardé n'existe plus dans la config, le supprimer
        localStorage.removeItem('evocom-affiliate')
      }
    }
  }, [affiliates])

  // Obtenir le lien de paiement pour un produit donné
  const getPaymentLink = (productId) => {
    const currentAffiliate = affiliates[affiliateCode]
    
    if (currentAffiliate && currentAffiliate[productId]) {
      return currentAffiliate[productId]
    }
    
    // Retourner la page par défaut
    return paymentPages[productId] || '#'
  }

  // Obtenir le code d'affiliation actuel
  const getCurrentAffiliateCode = () => {
    return affiliateCode
  }

  // Vérifier si un code d'affiliation est actif
  const hasAffiliateCode = () => {
    return affiliateCode && affiliateCode.length > 0
  }

  // Mettre à jour la configuration (pour l'interface d'admin)
  const updateAffiliateConfig = async (newAffiliates, newPaymentPages) => {
    try {
      // Mettre à jour les affiliés dans Supabase
      const { error: affiliatesError } = await supabase
        .from('affiliate_config')
        .upsert({
          config_key: 'affiliates',
          config_value: newAffiliates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'config_key'
        })

      if (affiliatesError) {
        console.error('Erreur lors de la sauvegarde des affiliés:', affiliatesError)
        throw affiliatesError
      }

      // Mettre à jour les pages de paiement dans Supabase
      const { error: pagesError } = await supabase
        .from('affiliate_config')
        .upsert({
          config_key: 'defaultPages',
          config_value: newPaymentPages,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'config_key'
        })

      if (pagesError) {
        console.error('Erreur lors de la sauvegarde des pages:', pagesError)
        throw pagesError
      }

      // Mettre à jour le state local après sauvegarde réussie
      setAffiliates(newAffiliates)
      setPaymentPages(newPaymentPages)
      
      console.log('Configuration sauvegardée avec succès dans Supabase')
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      return { success: false, error }
    }
  }

  const value = {
    affiliateCode,
    getPaymentLink,
    getCurrentAffiliateCode,
    hasAffiliateCode,
    updateAffiliateConfig,
    affiliates,
    paymentPages
  }

  return (
    <AffiliateContext.Provider value={value}>
      {children}
    </AffiliateContext.Provider>
  )
}
