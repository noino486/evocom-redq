import { FaGlobe, FaStar, FaClock, FaLightbulb, FaSync, FaGlobeAmericas, FaBullseye, FaHandshake, FaFileAlt, FaUsers, FaChartLine, FaBook, FaDiscord, FaDownload } from 'react-icons/fa'

export const products = [
  {
        id: 'STFOUR',
    slug: 'global-sourcing-pack',
    name: 'Global Sourcing Pack',
    price: 29.99,
    popular: false,
    shortDescription: 'La base idéale pour commencer vos recherches.',
    longDescription: `Le Global Sourcing Pack est votre passerelle vers le commerce international. Nous avons compilé pour vous une base de données exhaustive de fournisseurs internationaux couvrant plus de 50 secteurs d'activité différents.

Que vous cherchiez à lancer votre boutique en ligne, à diversifier vos sources d'approvisionnement ou simplement à explorer de nouvelles opportunités commerciales, ce pack vous fait gagner des centaines d'heures de recherche.

Chaque fournisseur a été présélectionné pour sa fiabilité, ses prix compétitifs et sa capacité à travailler avec des entreprises internationales. Vous recevez instantanément un fichier PDF complet avec toutes les coordonnées, les spécialités et les conditions de chaque fournisseur.`,
    images: [
      'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
    ],
    features: [
      'Liste de fournisseurs internationaux dans 50+ secteurs',
      'Accès immédiat par mail après achat',
      'Simple, clair et exploitable tout de suite',
      'Coordonnées complètes et vérifiées',
      'Fichier PDF téléchargeable',
      'Mises à jour gratuites pendant 6 mois'
    ],
    benefits: [
      { icon: FaClock, text: 'Gain de temps (plus besoin de chercher des contacts)' },
      { icon: FaLightbulb, text: 'Inspiration (trouvez des idées rapidement)' },
      { icon: FaSync, text: 'Polyvalence (adapté e-commerce, import, business local)' }
    ],
    includes: [
      { icon: FaFileAlt, text: 'PDF de 150+ pages' },
      { icon: FaGlobeAmericas, text: 'Fournisseurs de 30+ pays' },
      { icon: FaDownload, text: 'Téléchargement instantané' }
    ],
      icon: FaGlobe,
      color: 'bg-primary',
      category: 'Sourcing',
    tags: ['Fournisseurs', 'International', 'E-commerce', 'Import']
  },
  {
        id: 'GLBNS',
    slug: 'visionnaire-pack',
    name: 'Visionnaire Pack',
    price: 39.99,
    popular: true,
    shortDescription: 'La solution complète pour aller plus loin.',
    longDescription: `Le Visionnaire Pack est notre offre premium qui combine tout ce dont vous avez besoin pour réussir à l'international. En plus de tous les avantages du Global Sourcing Pack, vous obtenez un accès exclusif à nos guides pratiques et à notre communauté d'entrepreneurs.

Le PDF Expatriation vous guide pas à pas dans votre projet de vie à l'étranger, avec des conseils pratiques sur les visas, la fiscalité, le logement et l'intégration dans plus de 20 pays populaires.

Le PDF Business Actif & Passif révèle des stratégies éprouvées pour créer des sources de revenus multiples, que ce soit par le e-commerce, l'investissement, ou d'autres business models scalables.

Enfin, notre Discord privé vous connecte à une communauté active d'entrepreneurs et d'expatriés qui partagent leurs expériences, leurs contacts et leurs opportunités.`,
    images: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80'
    ],
    features: [
      'Inclut tout le Global Sourcing Pack',
      'PDF Expatriation (guides pratiques pour partir à l\'étranger)',
      'PDF Business Actif & Passif (stratégies de diversification)',
      'Accès à notre Discord privé (entraide & réseau international)',
      'Support prioritaire par email',
      'Webinaires mensuels exclusifs'
    ],
    benefits: [
      { icon: FaGlobeAmericas, text: 'Développement global (sourcing + stratégie + communauté)' },
      { icon: FaBullseye, text: 'Accompagnement concret (de l\'idée à la mise en pratique)' },
      { icon: FaHandshake, text: 'Networking (échanger avec d\'autres entrepreneurs et expatriés)' }
    ],
    includes: [
      { icon: FaFileAlt, text: '3 PDF premium (400+ pages)' },
      { icon: FaDiscord, text: 'Accès Discord VIP à vie' },
      { icon: FaUsers, text: 'Communauté de 500+ membres' },
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

