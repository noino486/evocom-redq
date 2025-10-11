import { FaGlobe, FaStar, FaClock, FaLightbulb, FaSync, FaGlobeAmericas, FaBullseye, FaHandshake, FaFileAlt, FaUsers, FaChartLine, FaBook, FaDiscord, FaDownload } from 'react-icons/fa'

export const products = [
  {
        id: 'STFOUR',
    slug: 'pack-starter-fournisseurs',
    name: 'Pack Global Sourcing',
    price: 29.90,
    popular: false,
    shortDescription: 'La base idéale pour commencer vos recherches.',
    longDescription: `Le Pack Global Sourcing est votre passerelle vers le commerce international. Nous avons compilé pour vous une base de données exhaustive de fournisseurs internationaux couvrant plus de +20 secteurs d'activité différents.

Que vous cherchiez à lancer votre boutique en ligne, à diversifier vos sources d'approvisionnement ou simplement à explorer de nouvelles opportunités commerciales, ce pack vous fait gagner des centaines d'heures de recherche.

Chaque fournisseur a été présélectionné pour sa fiabilité, ses prix compétitifs et sa capacité à travailler avec des entreprises internationales. Vous recevez instantanément un fichier PDF complet avec toutes les coordonnées, les spécialités et les conditions de chaque fournisseur.`,
    images: [
      '/1.jpg',
      '/2.jpg',
      '/3.jpg'
    ],
    features: [
      'Liste de fournisseurs internationaux dans +20 secteurs',
      'Accès immédiat par mail après achat',
      'Simple, clair et exploitable tout de suite',
      'Coordonnées complètes et vérifiées',
      'Mises à jour gratuites pendant 6 mois'
    ],
    benefits: [
      { icon: FaClock, text: 'Gain de temps (plus besoin de chercher des contacts)' },
      { icon: FaLightbulb, text: 'Inspiration (trouvez des idées rapidement)' },
      { icon: FaSync, text: 'Polyvalence (Adapté E-Commerce, Import, Business Local)' }
    ],
    includes: [
      { icon: FaFileAlt, text: 'PDF de 1000+ pages' },
      { icon: FaGlobeAmericas, text: 'Fournisseurs à l\'International' }
    ],
      icon: FaGlobe,
      color: 'bg-primary',
      category: 'Sourcing',
    tags: ['Fournisseurs', 'International', 'E-commerce', 'Import']
  },
  {
        id: 'GLBNS',
    slug: 'pack-global-business',
    name: 'Pack Global Business',
    price: 39.90,
    popular: true,
    shortDescription: 'La solution complète pour aller plus loin.',
    longDescription: `Le Pack Global Business est notre offre premium qui combine tout ce dont vous avez besoin pour réussir à l'international. En plus de tous les avantages du Pack Global Sourcing, vous obtenez un accès exclusif à nos guides pratiques et à notre communauté d'entrepreneurs.

Le PDF Expatriation vous guide pas à pas dans votre projet de vie à l'étranger, avec des conseils pratiques sur les visas, la fiscalité, le logement et l'intégration dans plus de +20 pays populaires.

Le PDF Revenues Actif & Passif révèle des stratégies éprouvées pour créer des sources de revenus multiples, que ce soit par le e-commerce, l'investissement, ou d'autres business models scalables.

Enfin, notre Discord privé vous connecte à une communauté active d'entrepreneurs et d'expatriés qui partagent leurs expériences, leurs contacts et leurs opportunités.`,
    images: [
      '/4.jpg',
      '/5.jpg',
      '/6.jpg',
      '/7.jpg'
    ],
    features: [
      'Inclut tout le Pack Global Sourcing',
      'PDF Expatriation (Guides Pratiques pour Partir à l\'Étranger)',
      'PDF Revenues Actif & Passif (stratégies de diversification)',
      'Accès à Notre Discord Privé (Entraide & Réseau International)',
      'Support prioritaire par email',
      'Webinaires mensuels exclusifs'
    ],
    benefits: [
      { icon: FaGlobeAmericas, text: 'Développement Global (Sourcing + Stratégie + Communauté)' },
      { icon: FaBullseye, text: 'Outil clé en main pour lancer votre projet facilement' },
      { icon: FaHandshake, text: 'Networking (Échanger avec d\'Autres Entrepreneurs et Expatriés)' }
    ],
    includes: [
      { icon: FaFileAlt, text: '+50 PDF premium ( + 1000 pages)' },
      { icon: FaDiscord, text: 'Accès Discord VIP à vie' },
      { icon: FaUsers, text: 'Communauté Active' },
      { icon: FaBook, text: 'Ressources mises à jour mensuellement' }
    ],
      icon: FaStar,
      color: 'bg-secondary',
      category: 'Premium',
    tags: ['Expatriation', 'Business', 'Communauté', 'Formation', 'Premium']
  }
]

export const getProductBySlug = (slug) => {
  return products.find(product => product.slug === slug)
}

export const getProductById = (id) => {
  return products.find(product => product.id === id)
}

export const getRelatedProducts = (currentProductId) => {
  return products.filter(product => product.id !== currentProductId)
}

