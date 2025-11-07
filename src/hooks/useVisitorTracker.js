import { useEffect } from 'react'
import { trackVisitor } from '../utils/visitorTracker'

const useVisitorTracker = () => {
  useEffect(() => {
    const trackPageVisit = async () => {
      // Attendre un petit délai pour que la page se charge complètement
      setTimeout(async () => {
        try {
          // Extraire les paramètres UTM de l'URL
          const urlParams = new URLSearchParams(window.location.search)
          const utmSource = urlParams.get('utm_source')
          const utmMedium = urlParams.get('utm_medium')
          const utmCampaign = urlParams.get('utm_campaign')
          const utmTerm = urlParams.get('utm_term')
          const utmContent = urlParams.get('utm_content')
          
          // Extraire le code d'affilié (même logique que dans AffiliateContext)
          const afParam = urlParams.get('AF')
          let affiliateCode = null
          
          if (afParam) {
            affiliateCode = afParam.toUpperCase()
          } else {
            // Vérifier le localStorage pour un code sauvegardé
            affiliateCode = localStorage.getItem('evocom-affiliate')
          }
          
          // Données du visiteur
          const visitorData = {
            utmSource,
            utmMedium,
            utmCampaign,
            utmTerm,
            utmContent,
            affiliateCode
          }
          
          // Tracker le visiteur
          await trackVisitor(visitorData)
          
        } catch (error) {
          console.error('Erreur lors du tracking du visiteur:', error)
        }
      }, 1000) // Délai de 1 seconde pour laisser la page se charger
    }

    trackPageVisit()
  }, [])
}

export default useVisitorTracker
