import { useEffect } from 'react'
import { trackClick, LINK_TYPES } from '../utils/clickTracker'

const useGlobalClickTracker = () => {
  useEffect(() => {
    // Fonction pour déterminer le type de lien
    const getLinkType = (element) => {
      // Liens d'achat (boutons avec href vers des pages de paiement)
      if (element.href && (
        element.href.includes('thrivecart.com') ||
        element.href.includes('stripe.com') ||
        element.href.includes('paypal.com') ||
        element.href.includes('checkout') ||
        element.href.includes('payment')
      )) {
        return LINK_TYPES.AFFILIATE
      }
      
      // Liens internes (même domaine)
      if (element.href && element.href.startsWith(window.location.origin)) {
        return LINK_TYPES.INTERNAL
      }
      
      // Liens externes
      if (element.href && element.href.startsWith('http')) {
        return LINK_TYPES.EXTERNAL
      }
      
      // Liens de produits (vers les pages de détail)
      if (element.href && element.href.includes('/product/')) {
        return LINK_TYPES.PRODUCT
      }
      
      return LINK_TYPES.INTERNAL
    }

    // Fonction pour extraire les informations du clic
    const extractClickInfo = (element) => {
      const linkType = getLinkType(element)
      const text = element.textContent?.trim() || element.title || element.alt || ''
      const url = element.href || window.location.href
      
      // Détecter l'affilié depuis l'URL ou le localStorage
      const urlParams = new URLSearchParams(window.location.search)
      const affiliateFromUrl = urlParams.get('AF')
      const affiliateFromStorage = localStorage.getItem('evocom-affiliate')
      const affiliateName = affiliateFromUrl || affiliateFromStorage || null
      
      // Détecter le produit depuis l'URL
      let productId = null
      if (url.includes('/product/')) {
        const match = url.match(/\/product\/([^\/\?]+)/)
        productId = match ? match[1] : null
      }
      
      // Détecter la source du clic
      let source = 'unknown'
      if (element.closest('[data-section]')) {
        source = element.closest('[data-section]').getAttribute('data-section')
      } else if (element.closest('header')) {
        source = 'header'
      } else if (element.closest('footer')) {
        source = 'footer'
      } else if (element.closest('#products')) {
        source = 'products_section'
      } else if (element.closest('#hero')) {
        source = 'hero_section'
      } else if (element.closest('#testimonials')) {
        source = 'testimonials_section'
      } else if (element.closest('#process')) {
        source = 'process_section'
      } else if (element.closest('#why-choose')) {
        source = 'why_choose_section'
      } else if (element.closest('#comparison')) {
        source = 'comparison_section'
      } else if (element.closest('#fomo')) {
        source = 'fomo_section'
      } else if (element.closest('#discord')) {
        source = 'discord_section'
      } else if (element.closest('#whatsapp')) {
        source = 'whatsapp_section'
      }
      
      return {
        url,
        text,
        type: linkType,
        affiliateName,
        productId,
        source
      }
    }

    // Fonction pour tracker un clic
    const handleClick = async (event) => {
      const element = event.target.closest('a, button, [role="button"], [onclick]')
      
      if (!element) return
      
      // Ignorer certains éléments
      if (element.matches('input, textarea, select') || 
          element.closest('input, textarea, select')) {
        return
      }
      
      // Ignorer les clics sur les éléments de navigation purement décoratifs
      if (element.matches('.no-track, [data-no-track]')) {
        return
      }
      
      try {
        const clickInfo = extractClickInfo(element)
        
        // Attendre un petit délai pour s'assurer que la navigation se fait
        setTimeout(async () => {
          await trackClick(clickInfo)
        }, 100)
        
      } catch (error) {
        console.error('Erreur lors du tracking du clic:', error)
      }
    }

    // Ajouter l'écouteur d'événements
    document.addEventListener('click', handleClick, true)
    
    // Nettoyer l'écouteur
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [])
}

export default useGlobalClickTracker
