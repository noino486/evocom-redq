import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

const LegalContext = createContext()

export const useLegal = () => {
  const context = useContext(LegalContext)
  if (!context) {
    throw new Error('useLegal must be used within a LegalProvider')
  }
  return context
}

export const LegalProvider = ({ children }) => {
  const [legalContent, setLegalContent] = useState({
    introduction: '',
    articles: [],
    legalInfo: {
      companyName: '',
      rcsNumber: '',
      address: '',
      director: '',
      email: '',
      website: '',
      hosting: ''
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les mentions légales depuis Supabase
  useEffect(() => {
    loadLegalContent()
  }, [])

  const loadLegalContent = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('legal_content')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setLegalContent(data.content)
      } else {
        // Contenu par défaut
        setLegalContent({
          introduction: 'Les présentes Conditions Générales de Vente et d\'Utilisation (ci-après « CGV & CGU ») régissent les relations contractuelles entre TRIUM TRADE, société par actions simplifiée immatriculée au RCS de Paris sous le numéro 990 320 590, dont le siège social est situé au 231 rue Saint-Honoré, 75001 Paris, agissant pour la distribution de ses produits sous la marque EVO ECOM (ci-après « EVO ECOM »), et toute personne physique ou morale procédant à un achat ou utilisant le site internet https://evoecom.com (ci-après « le Site »).',
          articles: [
            {
              id: 1,
              title: 'Objet',
              content: 'Les présentes CGV & CGU définissent les conditions dans lesquelles EVO ECOM commercialise et met à disposition des contenus numériques, guides, ressources et autres produits en ligne, ainsi que les conditions d\'utilisation du Site.'
            },
            {
              id: 2,
              title: 'Produits et Services',
              content: 'EVO ECOM propose à la vente des fichiers numériques et packs de ressources destinés aux entrepreneurs et utilisateurs souhaitant développer leur activité. Ces contenus peuvent comprendre notamment :\n\n• Des fichiers PDF (guides, check-lists, modèles)\n• Des archives compressées (ZIP) contenant plusieurs ressources\n• Des accès en ligne via une plateforme sécurisée\n• Des bonus (contacts, templates, guides additionnels)\n\nLes produits proposés sont décrits le plus précisément possible sur le Site. Toutefois, des différences minimes peuvent exister, ce que le Client reconnaît et accepte.'
            },
            {
              id: 3,
              title: 'Prix',
              content: 'Les prix sont indiqués en euros, toutes taxes comprises (TTC).\n\nEVO ECOM se réserve le droit de modifier ses prix à tout moment, étant précisé que le prix appliqué est celui en vigueur au moment de la validation de la commande.'
            },
            {
              id: 4,
              title: 'Commande et Paiement',
              content: 'Les commandes sont passées exclusivement en ligne sur le Site.\n\nLe Client sélectionne le produit souhaité, procède au paiement via les moyens sécurisés proposés et reçoit après confirmation de la transaction :\n\n• Soit un lien de téléchargement direct (fichiers numériques)\n• Soit un courriel avec identifiants d\'accès pour la plateforme en ligne, selon le produit acheté.\n\nLe paiement est exigible immédiatement lors de la commande.'
            },
            {
              id: 5,
              title: 'Livraison des Produits',
              content: 'La livraison des produits est exclusivement numérique :\n\n• Par téléchargement immédiat depuis le Site\n• Ou par l\'envoi d\'un email contenant les identifiants d\'accès\n\nLe Client est responsable de fournir une adresse email valide lors de l\'achat.'
            },
            {
              id: 6,
              title: 'Droits d\'Utilisation',
              content: 'Les fichiers et contenus achetés sont destinés à un usage strictement personnel et non transférable.\n\nToute reproduction, diffusion, partage ou revente non autorisée est strictement interdite et pourra donner lieu à des poursuites judiciaires.'
            },
            {
              id: 7,
              title: 'Propriété Intellectuelle',
              content: 'La marque EVO ECOM, ainsi que l\'ensemble des contenus (textes, images, vidéos, guides, bases de données, logos, etc.), sont protégés par le droit de la propriété intellectuelle et restent la propriété exclusive de TRIUM TRADE ou de ses partenaires.\n\nToute reproduction totale ou partielle, modification ou exploitation non autorisée est interdite.'
            },
            {
              id: 8,
              title: 'Rétractation, Retours et Remboursements',
              content: 'Conformément à la législation applicable sur les produits numériques :\n\n• Aucun remboursement ne sera effectué après téléchargement des fichiers\n• Aucun remboursement ne sera accordé si le Client s\'est connecté à la plateforme, l\'accès constituant une consommation du service numérique\n• Toute réclamation doit être transmise à support@evoecom.com dans un délai de 14 jours suivant l\'achat en cas de défaut manifeste du produit'
            },
            {
              id: 9,
              title: 'Responsabilité',
              content: 'EVO ECOM ne saurait être tenu responsable de l\'usage fait par le Client des informations et ressources fournies.\n\nLe Client est seul responsable de la mise en œuvre et de l\'exploitation des conseils ou guides achetés.'
            },
            {
              id: 10,
              title: 'Données Personnelles',
              content: 'Les données collectées lors des commandes sont nécessaires au traitement des achats.\n\nEVO ECOM s\'engage à respecter la réglementation en vigueur (RGPD).\n\nLe Client dispose d\'un droit d\'accès, de rectification, d\'opposition et de suppression de ses données en écrivant à : support@evoecom.com.'
            },
            {
              id: 11,
              title: 'Utilisation du Site',
              content: 'En accédant au Site, le Client s\'engage à :\n\n• Ne pas porter atteinte à son bon fonctionnement\n• Ne pas extraire ou réutiliser massivement les données\n• Ne pas utiliser le Site à des fins frauduleuses ou illicites'
            },
            {
              id: 12,
              title: 'Cookies et Liens Hypertextes',
              content: 'Le Site peut utiliser des cookies pour améliorer l\'expérience utilisateur. L\'utilisateur peut les désactiver dans les paramètres de son navigateur.\n\nLe Site peut contenir des liens vers des sites tiers ; EVO ECOM décline toute responsabilité quant à leur contenu.'
            },
            {
              id: 13,
              title: 'Loi Applicable et Juridiction Compétente',
              content: 'Les présentes CGV & CGU sont régies par le droit français.\n\nEn cas de litige, les parties rechercheront une solution amiable. À défaut, compétence expresse est attribuée aux tribunaux compétents du ressort du siège social de TRIUM TRADE à Paris.'
            }
          ],
          legalInfo: {
            companyName: 'TRIUM TRADE, SAS',
            rcsNumber: 'RCS Paris 990 320 590',
            address: '231 rue Saint-Honoré, 75001 Paris',
            director: 'Thomas Duarte',
            email: 'support@evoecom.com',
            website: 'https://evoecom.com',
            hosting: 'Kajabi LLC, 17100 Laguna Canyon Rd Suite 100, Irvine, CA 92603, États-Unis'
          }
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mentions légales:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateLegalContent = async (newContent) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('legal_content')
        .upsert({
          id: 1,
          content: newContent,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setLegalContent(newContent)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des mentions légales:', error)
      setError(error.message)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const addArticle = () => {
    const newId = Math.max(...legalContent.articles.map(a => a.id), 0) + 1
    const newArticle = {
      id: newId,
      title: 'Nouvel Article',
      content: 'Contenu de l\'article...'
    }
    
    setLegalContent(prev => ({
      ...prev,
      articles: [...prev.articles, newArticle]
    }))
  }

  const updateArticle = (id, updates) => {
    setLegalContent(prev => ({
      ...prev,
      articles: prev.articles.map(article => 
        article.id === id ? { ...article, ...updates } : article
      )
    }))
  }

  const deleteArticle = (id) => {
    setLegalContent(prev => ({
      ...prev,
      articles: prev.articles.filter(article => article.id !== id)
    }))
  }

  const value = {
    legalContent,
    loading,
    error,
    updateLegalContent,
    addArticle,
    updateArticle,
    deleteArticle,
    setLegalContent
  }

  return (
    <LegalContext.Provider value={value}>
      {children}
    </LegalContext.Provider>
  )
}
