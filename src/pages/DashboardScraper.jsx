import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaPlay, FaStop, FaSpinner, FaTrash, FaEdit, FaSave, FaTimes,
  FaGlobe, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCheckCircle,
  FaUpload, FaCheck, FaSquare, FaStar, FaExternalLinkAlt
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'

// Structure hiérarchique des fournisseurs : Catégories principales et sous-catégories
// Grosses catégories + mini-catégories reclassées
const SUPPLIER_CATEGORIES = {
  "Transport & Logistique": [
    "Société d'import-export",
    "Exportateur",
    "Importateur",
    "Établissement vinicole",
    "Service de transport",
    "Société de transport international de marchandises",
    "Société de transport routier",
    "Transporteur de véhicules",
    "Service de taxi",
    "Service de taxi minibus",
    "Service de chauffeur privé",
    "Service de chauffeur particulier",
    "Service de transport et d'accompagnement",
    "Station de taxis",
    "Service ambulancier",
    "Service de navette aéroport",
    "Coursier",
    "Courtier en douane",
    "Consultant en commerce international",
    "Déménageur",
    "Industrie d'équipements de livraison",
    "Installation de stockage",
    "Service de conteneurs",
    "Service logistique",
    "Services d'expédition et de livraison",
    "Service de livraison",
    "Société de livraison",
    "Service d'e-commerce",
    "Casier à colis",
    "Service de gestion des déchets",
    "Service establishment",
    "Administration",
    "Administration gouvernementale",
    "Agence de voyages",
    "Autorité portuaire",
    "Société d'administration portuaire"
  ],

  "Mode, Textile & Accessoires": [
    "Magasin d'articles en cuir",
    "Boutique d'articles en cuir",
    "Maroquinerie",
    "Fabricant de maroquinerie",
    "Sac à main (boutique / grossiste)",
    "Magasin de bagagerie",
    "Vente d'articles pour femmes",
    "Magasin de cadeaux",
    "Boutique indépendante",
    "Boutique de luxe",
    "Magasin de lingerie",
    "Magasin de robes",
    "Magasin de vêtements",
    "Magasin de vêtements de sport",
    "Magasin de vêtements grandes tailles",
    "Magasin de vêtements pour enfants",
    "Magasin de vêtements pour femmes",
    "Magasin de vêtements professionnels",
    "Magasin de tissus",
    "Grossiste en textiles",
    "Fabricant de textiles",
    "Maison de couture",
    "Atelier de couture",
    "Couturier",
    "Tailleur sur mesure",
    "Service de retouche de vêtements",
    "Entreprise de couture",
    "Styliste",
    "Cours de couture",
    "Mercerie",
    "Magasin de couture",
    "Magasin de broderie",
    "Service de broderie",
    "Boutique de t-shirts personnalisés",
    "Atelier de sérigraphie",
    "Magasin de chaussures",
    "Magasin de chaussures pour enfants",
    "Grossiste en chaussures",
    "Magasin d'articles de mode",
    "Magasin d'outdoor",
    "Magasin d'articles de danse",
    "Magasin de sport"
  ],

  "Beauté, Cosmétique & Bien-être": [
    "Institut de beauté",
    "Spa",
    "Boutique de maquillage",
    "Magasin de soins de la peau",
    "Magasin de produits capillaires",
    "Magasin bio",
    "Pharmacie",
    "Grossiste en cosmétiques",
    "Magasin de beauté",
    "Magasin de soins personnels",
    "Fabricant de produits cosmétiques",
    "Fournisseur de produits de beauté",
    "Industrie cosmétique",
    "Laboratoire pharmaceutique",
    "Grossiste de produits de beauté",
    "Parfumerie",
    "Magasin de cosmétiques",
    "Exportateur de parfums",
    "Fournisseur d'arômes et de parfums",
    "Boutique de santé et beauté",
    "Magasin de bougies",
    "Magasin d'aromathérapie",
    "Grossiste en articles d'hygiène",
    "Grossiste en parfums",
    "Salon de coiffure",
    "Salon de coiffure afro",
    "Barbershop",
    "Grossiste coiffure",
    "Magasin professionnel coiffure",
    "Magasin de perruques"
  ],

  "Bijouterie, Horlogerie & Gemmologie": [
    "Joaillier",
    "Diamantaire",
    "Bijoutier",
    "Bijouterie",
    "Vendeur de bijoux en gros",
    "Grossiste en bijoux",
    "Acheteur de diamants",
    "Expert en bijoux",
    "Fournisseur de pierres",
    "Gemmologie",
    "Exploitation minière",
    "Mine",
    "Fabrication de bijoux",
    "Exportateur de bijoux",
    "Service de réparation de bijoux",
    "Service de rachat de bijoux",
    "Bijoux fantaisie",
    "Créateur de bijoux",
    "Orfèvre",
    "Horlogerie",
    "Horloger",
    "Société d'horlogerie",
    "Service de réparation de montres",
    "Service de réparation de montres et d'horloges",
    "Magasin de montres",
    "Grossiste en montres",
    "Réparation de montres",
    "Magasin de bracelets",
    "Rachat d'or",
    "Graveur sur bijoux",
    "Fournisseur d'équipement de bijouterie",
    "Service de polissage des métaux",
    "Service de perçage d'oreilles"
  ],

  "Audiovisuel, Photo & Cinéma": [
    "Société de production vidéo",
    "Société de production cinématographique",
    "Studio cinématographique",
    "Studio d'animation",
    "Vidéaste",
    "Studio photo",
    "Photographe",
    "Service de photographie",
    "Magasin de matériel photographique",
    "Location de matériel photo",
    "Magasin d'impression photo",
    "Vente de matériel vidéo",
    "Boutique high-tech (photo/vidéo)",
    "Location de drones",
    "Fournisseur de drones professionnels",
    "Service de prise de vue aérienne",
    "Photographe aérien",
    "Fournisseur de matériel audiovisuel",
    "Service de location de matériel audiovisuel",
    "Fournisseur de matériel d'éclairage scénique",
    "Magasin de matériel pour DJ",
    "Magasin de location de chaînes hi-fi",
    "Service de location de matériel de soirée",
    "Disc-jockey"
  ],

  "Digital, Web & Logiciels": [
    "Concepteur de sites Web",
    "Service d'hébergement de site Web",
    "Agence e-commerce",
    "Service d'e-commerce",
    "Entreprise de logiciels",
    "Service informatique",
    "Fournisseur de matériel informatique",
    "Magasin d'informatique",
    "Magasin d'électronique",
    "Magasin de téléphonie",
    "Réparateur d'ordinateurs",
    "Magasin de gadgets",
    "Magasin de consoles",
    "Magasin de drones",
    "Magasin de modélisme",
    "Boutique high-tech"
  ],

  "Marketing & Communication": [
    "Agence de marketing",
    "Agence de publicité",
    "Service de marketing Internet",
    "Agence de branding",
    "Régie publicitaire",
    "Consultant média",
    "Agence de relations publiques",
    "Service de rédaction",
    "Média",
    "Fournisseur de produits promotionnels"
  ],

  "Conseil & Services Professionnels": [
    "Consultant",
    "Conseiller",
    "Consultant en marketing",
    "Consultant en ingénierie",
    "Coaching professionnel",
    "Prestataire spécialisé en études de marché",
    "Conseil",
    "Entreprise",
    "Siège social"
  ],

  "Automobile & Mobilité": [
    "Agence de location de voitures",
    "Location de voitures",
    "Vente de voitures d'occasion",
    "Vendeur de voitures d'occasion",
    "Concession automobile",
    "Concessionnaire automobile",
    "Concessionnaire de motos",
    "Concessionnaire de quads",
    "Concessionnaire de véhicules à moteur",
    "Concessionnaire de voitures de course",
    "Concessionnaire Dodge",
    "Concessionnaire Ford",
    "Concessionnaire Ram",
    "Atelier de carrosserie automobile",
    "Atelier de mécanique automobile",
    "Atelier de réparation automobile",
    "Garage automobile",
    "Mécanicien",
    "Mécanicien automobile",
    "Mécanicien.ne de précision",
    "Carrosserie",
    "Casse automobile",
    "Service de tuning",
    "Prestataire de tuning automobile",
    "Service de dépannage auto",
    "Centre de contrôle technique",
    "Service d'esthétique automobile",
    "Service de débosselage automobile",
    "Service de réparation de pare-brise",
    "Peinture automobile",
    "Magasin d'accessoires auto",
    "Magasin d'accessoires automobiles",
    "Magasin d'accessoires pour poids lourds",
    "Magasin de pièces automobiles",
    "Magasin de pièces de rechange automobiles",
    "Grossiste pièces auto",
    "Fabricant de pièces automobiles",
    "Fournisseur de pièces de carrosserie",
    "Magasin d'amortisseurs pour automobiles",
    "Magasin de silencieux d'échappement",
    "Magasin de pneus",
    "Magasin de batteries pour voitures",
    "Magasin de pièces pour voitures de course",
    "Magasin d'outillage",
    "Fournisseur d'outils pneumatiques",
    "Courtier automobile",
    "Club automobile",
    "Marché automobile",
    "Service de conduite / chauffeur (auto)",
    "Entrepôt",
    "Dépôt-vente"
  ],

  "Optique & Santé visuelle": [
    "Opticien",
    "Lunetterie",
    "Ophtalmologiste",
    "Magasin d'optique",
    "Clinique de la vision",
    "Optométriste",
    "Magasin de sport (lunettes sport)",
    "Magasin de lunettes de soleil",
    "Lunettes & lunettes de soleil (boutique / grossiste)"
  ],

  "Enfance, Bébé & Jeux": [
    "Magasin d'articles bébé",
    "Magasin de jouets",
    "Grossiste en vêtements pour enfants",
    "Fabricant de jouets",
    "Magasin de jeux vidéo",
    "Magasin de jeux d'occasion",
    "Borne de location de jeux vidéo"
  ],

  "Impression, Packaging & Personnalisation": [
    "Imprimerie",
    "Imprimerie spécialisée en sérigraphie",
    "Imprimerie commerciale",
    "Imprimeur",
    "Imprimeur numérique",
    "Service d'impression numérique",
    "Service d'impression 3D",
    "Impression 3D",
    "Magasin de reprographie",
    "Imprimeur d'étiquettes personnalisées",
    "Service d'impression de cartons d'invitation",
    "Magasin d'enseignes",
    "Entreprise de packaging",
    "Magasin d'articles d'emballage"
  ],

  "Maison, Ameublement & Décoration": [
    "Magasin d'ameublement et de décoration",
    "Magasin de décoration intérieure",
    "Décoration intérieure",
    "Tapissier décorateur",
    "Magasin de meubles",
    "Fabricant de meubles",
    "Vendeur de meubles en gros",
    "Magasin de meubles de chambre à coucher",
    "Magasin de canapés",
    "Magasin de meubles de bureau",
    "Magasin de literie",
    "Magasin de meubles de cuisine",
    "Magasin de mobilier de jardin",
    "Boutique de mobilier en pin",
    "Magasin de tapis",
    "Magasin de moquettes",
    "Magasin de revêtements de sol",
    "Fournisseur d'accessoires de meubles",
    "Fournisseur de meubles encastrables",
    "Bar stool supplier",
    "Magasin de luminaires",
    "Magasin d'usine",
    "Magasin de bricolage",
    "Centre de marques",
    "Fournisseur de plantes artificielles"
  ],

  "Construction, Matériaux & Travaux publics": [
    "Fournisseur de matériaux de construction",
    "Magasin de materiaux de construction",
    "Fournisseur de granulats",
    "Carrière",
    "Carrière de gravier",
    "Sablerie",
    "Fournisseur de sable et de gravier",
    "Société de travaux publics",
    "Entreprise de terrassement",
    "Fournisseur de terre végétale",
    "Constructeur de terrasses"
  ],

  "Aménagement extérieur, Paysage & Piscines": [
    "Paysagiste",
    "Arboriste",
    "Entrepreneur spécialisé en aménagement aquatique",
    "Société de construction de piscine"
  ],

  "Événementiel, Spectacle & Mariage": [
    "Agence artistique",
    "Agence événementielle",
    "Prestataire de mariage",
    "Service de location de tentes",
    "Animateur de soirées et d'événements",
    "Service technologique pour l'organisation d'événements",
    "Karaoké vidéo",
    "Service de location de karaoké",
    "Fournisseur de manèges",
    "Manège",
    "Montagnes russes",
    "Location d'installations et de machines",
    "Fournisseur de machines de divertissement",
    "Fournisseur d'appareils pour centres d'amusement",
    "Agence de location de matériel"
  ],

  "Arts, Culture & Patrimoine": [
    "Arts & culture (boutiques / galeries)",
    "Galerie d'art",
    "Atelier d'artiste",
    "Centre culturel",
    "Service de restauration d'œuvres d'art",
    "Maquettiste"
  ],

  "Animaux & Produits animaliers": [
    "Animalerie",
    "Boutique pour animaux",
    "Toilettage pour animaux",
    "Clinique vétérinaire",
    "Pension pour animaux",
    "Dresseur d'animaux",
    "Service de promenade de chiens",
    "Grossiste en produits pour animaux",
    "Magasin d'alimentation animale",
    "Magasin d'articles pour animaux"
  ],

  "Alimentation, Terroir & Boissons": [
    "Producteur local",
    "Vente directe producteur",
    "Marché fermier",
    "Magasin alimentaire",
    "Épicerie fine",
    "Miellerie",
    "Apiculteur",
    "Grossiste en produits naturels",
    "Magasin de produits naturels",
    "Distributeur de boissons",
    "Grossiste en vins",
    "Grossiste en boissons alcoolisées",
    "Fournisseur de bières",
    "Fournisseur de boissons gazeuses",
    "Distillerie",
    "Service de distribution"
  ],

  "Loisirs & Divertissement": [
    "Magasin d'objets à collectionner",
    "Centre de loisirs",
    "Karaoké vidéo (loisirs)",
    "Fournisseur de flippers",
    "Magasin d'articles de billard",
    "Magasin de fléchettes"
  ],

  "Divers / Inclassables": [
    "Boutique artisanale",
    "Artisanat",
    "Boutique de mariage",
    "Boutique de stylos",
    "Magasin",
    "Fabricant",
    "Association ou organisation",
    "Centre de formation (selon contexte)",
    "Centre de formation",
    "Installation de stockage (divers)"
  ]
};

// Liste des catégories principales pour le sélecteur
const MAIN_CATEGORIES = Object.keys(SUPPLIER_CATEGORIES)

// Pays disponibles
const COUNTRIES = [
  'Afrique du Sud',
  'Albanie',
  'Algérie',
  'Allemagne',
  'Andorre',
  'Angola',
  'Antigua-et-Barbuda',
  'Arabie saoudite',
  'Argentine',
  'Arménie',
  'Australie',
  'Autriche',
  'Azerbaïdjan',
  'Bahamas',
  'Bahreïn',
  'Bangladesh',
  'Barbade',
  'Bélarus (Biélorussie)',
  'Belgique',
  'Belize',
  'Bénin',
  'Bhoutan',
  'Birmanie (Myanmar)',
  'Bolivie',
  'Bosnie-Herzégovine',
  'Botswana',
  'Brésil',
  'Brunei',
  'Bulgarie',
  'Burkina Faso',
  'Burundi',
  'Cambodge',
  'Cameroun',
  'Canada',
  'Cap-Vert',
  'Chili',
  'Chine',
  'Chypre',
  'Colombie',
  'Comores',
  'Congo',
  'Corée du Nord',
  'Corée du Sud',
  'Costa Rica',
  'Côte d\'Ivoire',
  'Croatie',
  'Cuba',
  'Danemark',
  'Djibouti',
  'Dominique',
  'Égypte',
  'Émirats arabes unis',
  'Équateur',
  'Érythrée',
  'Espagne',
  'Estonie',
  'États-Unis',
  'Éthiopie',
  'Eswatini (ex-Swaziland)',
  'Fidji',
  'Finlande',
  'France',
  'Gabon',
  'Gambie',
  'Géorgie',
  'Ghana',
  'Grèce',
  'Grenade',
  'Guatemala',
  'Guinée',
  'Guinée équatoriale',
  'Guinée-Bissau',
  'Guyana',
  'Haïti',
  'Honduras',
  'Hongrie',
  'Îles Salomon',
  'Inde',
  'Indonésie',
  'Irak',
  'Iran',
  'Irlande',
  'Islande',
  'Israël',
  'Italie',
  'Jamaïque',
  'Japon',
  'Jordanie',
  'Kazakhstan',
  'Kenya',
  'Kirghizistan',
  'Kiribati',
  'Koweït',
  'Laos',
  'Lesotho',
  'Lettonie',
  'Liban',
  'Liberia',
  'Libye',
  'Liechtenstein',
  'Lituanie',
  'Luxembourg',
  'Macédoine du Nord',
  'Madagascar',
  'Malaisie',
  'Malawi',
  'Maldives',
  'Mali',
  'Malte',
  'Maroc',
  'Marshall (République des Îles Marshall)',
  'Maurice',
  'Mauritanie',
  'Mexique',
  'Micronésie (États fédérés de Micronésie)',
  'Moldavie',
  'Monaco',
  'Mongolie',
  'Monténégro',
  'Mozambique',
  'Namibie',
  'Nauru',
  'Népal',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Norvège',
  'Nouvelle-Zélande',
  'Oman',
  'Ouganda',
  'Ouzbékistan',
  'Pakistan',
  'Palaos',
  'Palestine',
  'Panama',
  'Papouasie-Nouvelle-Guinée',
  'Paraguay',
  'Pays-Bas',
  'Pérou',
  'Philippines',
  'Pologne',
  'Portugal',
  'Qatar',
  'République centrafricaine',
  'République démocratique du Congo',
  'République dominicaine',
  'Roumanie',
  'Royaume-Uni',
  'Russie',
  'Rwanda',
  'Saint-Christophe-et-Niévès',
  'Saint-Marin',
  'Saint-Vincent-et-les-Grenadines',
  'Sainte-Lucie',
  'Salvador',
  'Samoa',
  'Sao Tomé-et-Principe',
  'Sénégal',
  'Serbie',
  'Seychelles',
  'Sierra Leone',
  'Singapour',
  'Slovaquie',
  'Slovénie',
  'Somalie',
  'Soudan',
  'Soudan du Sud',
  'Sri Lanka',
  'Suède',
  'Suisse',
  'Suriname',
  'Syrie',
  'Tadjikistan',
  'Taïwan',
  'Tanzanie',
  'Tchad',
  'Tchéquie (République tchèque)',
  'Thaïlande',
  'Timor oriental',
  'Togo',
  'Tonga',
  'Trinité-et-Tobago',
  'Tunisie',
  'Turkménistan',
  'Turquie',
  'Tuvalu',
  'Ukraine',
  'Uruguay',
  'Vanuatu',
  'Vatican',
  'Venezuela',
  'Viêt Nam',
  'Yémen',
  'Zambie',
  'Zimbabwe',
  'Autre'
]

const DashboardScraper = () => {
  const { isAdmin, isSupportOrAdmin, user } = useAuth()
  const [isScraping, setIsScraping] = useState(false)
  const [currentJob, setCurrentJob] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    country: 'Chine',
    main_categories: [], // Tableau pour plusieurs catégories principales
    sub_categories: [] // Tableau pour plusieurs sous-catégories
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    country: '',
    main_category: '',
    sub_category: '',
    status: 'active',
    is_featured: false
  })
  const [selectedSuppliers, setSelectedSuppliers] = useState([])
  const [isPushing, setIsPushing] = useState(false)
  const [isDeletingSelected, setIsDeletingSelected] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [manualSupplierForm, setManualSupplierForm] = useState({
    name: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    country: 'Chine',
    main_category: '',
    sub_category: '',
    is_featured: false
  })

useEffect(() => {
  if (isSupportOrAdmin()) {
    loadSuppliers()
    checkActiveJob()
  }
}, [isSupportOrAdmin])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Vérifier s'il y a un job actif
  const checkActiveJob = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select('*')
        .eq('status', 'running')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        // Vérifier si le job n'est pas bloqué (plus de 10 minutes sans mise à jour)
        const now = new Date()
        const lastUpdate = data.updated_at ? new Date(data.updated_at) : new Date(data.started_at || data.created_at)
        const minutesSinceUpdate = (now - lastUpdate) / (1000 * 60)
        
        // Si le job n'a pas été mis à jour depuis plus de 10 minutes, le considérer comme bloqué
        if (minutesSinceUpdate > 10) {
          console.warn('⚠️ Job bloqué détecté, marquage comme arrêté:', data.id)
          // Marquer le job comme arrêté
          await supabase
            .from('scraping_jobs')
            .update({ 
              status: 'stopped',
              completed_at: new Date().toISOString(),
              error_message: 'Job bloqué détecté lors du rechargement de la page'
            })
            .eq('id', data.id)
          
          setMessage({ 
            type: 'warning', 
            text: 'Un job de scraping bloqué a été détecté et arrêté automatiquement.' 
          })
          return
        }
        
        setCurrentJob(data)
        setIsScraping(true)
        // Poller pour mettre à jour le statut
        startPolling(data.id)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du job:', error)
    }
  }

  // Poller le statut du job
  const startPolling = (jobId) => {
    let lastUpdateTime = null
    let consecutiveNoUpdateCount = 0
    
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('scraping_jobs')
          .select('*')
          .eq('id', jobId)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') throw error

        if (!data) {
          // Job n'existe plus
          console.log('Job n\'existe plus, arrêt du polling')
          setIsScraping(false)
          setCurrentJob(null)
          clearInterval(interval)
          return
        }

        // Vérifier si le job est bloqué (pas de mise à jour depuis plus de 2 minutes)
        const now = new Date()
        const updatedAt = data.updated_at ? new Date(data.updated_at) : new Date(data.started_at || data.created_at)
        const minutesSinceUpdate = (now - updatedAt) / (1000 * 60)
        
        // Si le job est en "running" mais n'a pas été mis à jour depuis plus de 2 minutes, le considérer comme bloqué
        if (data.status === 'running' && minutesSinceUpdate > 2) {
          consecutiveNoUpdateCount++
          
          // Si ça fait 3 vérifications consécutives (3 secondes) sans mise à jour, marquer comme arrêté
          if (consecutiveNoUpdateCount >= 3) {
            console.warn('⚠️ Job bloqué détecté pendant le polling, marquage comme arrêté:', data.id)
            await supabase
              .from('scraping_jobs')
              .update({ 
                status: 'stopped',
                completed_at: new Date().toISOString(),
                error_message: 'Job bloqué détecté - aucune mise à jour depuis plus de 2 minutes'
              })
              .eq('id', jobId)
            
            setIsScraping(false)
            setCurrentJob(null)
            clearInterval(interval)
            setMessage({ 
              type: 'warning', 
              text: 'Le scraping a été arrêté automatiquement car il était bloqué.' 
            })
            loadSuppliers()
            return
          }
        } else {
          // Réinitialiser le compteur si le job est actif
          consecutiveNoUpdateCount = 0
        }
        
        setCurrentJob(data)
        
        if (data.status === 'completed' || data.status === 'stopped' || data.status === 'error') {
          setIsScraping(false)
          clearInterval(interval)
          loadSuppliers()
          const statusText = data.status === 'completed' ? 'terminé' : data.status === 'stopped' ? 'arrêté' : 'en erreur'
          setMessage({ type: 'success', text: `Scraping ${statusText} - ${data.total_saved || 0} fournisseurs trouvés` })
        }
      } catch (error) {
        console.error('Erreur lors du polling:', error)
        clearInterval(interval)
        setIsScraping(false)
      }
    }, 1000) // Poll toutes les 1 seconde pour détecter l'arrêt plus rapidement

    return () => clearInterval(interval)
  }

  // Fonction pour normaliser une URL
  const normalizeUrl = (url) => {
    if (!url) return ''
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase()
      .trim()
  }

  // Fonction pour vérifier si un fournisseur est un doublon
  const checkDuplicate = async (website, name, excludeId = null) => {
    if (!website && !name) return { isDuplicate: false, existing: null }

    try {
      const normalizedUrl = normalizeUrl(website)
      
      // Vérifier par URL normalisée et website_normalized
      if (normalizedUrl) {
        const { data: urlMatches, error: urlError } = await supabase
          .from('suppliers')
          .select('id, name, website, website_normalized')
          .or(`website.ilike.%${normalizedUrl}%,website.ilike.%www.${normalizedUrl}%,website_normalized.eq.${normalizedUrl}`)
          .neq('status', 'deleted')

        if (urlError && urlError.code !== 'PGRST116') {
          console.error('Erreur vérification doublon URL:', urlError)
        }

        if (urlMatches && urlMatches.length > 0) {
          // Filtrer pour exclure l'ID en cours d'édition
          const filtered = excludeId 
            ? urlMatches.filter(s => s.id !== excludeId)
            : urlMatches
          
          if (filtered.length > 0) {
            // Vérification plus stricte de l'URL normalisée
            const duplicate = filtered.find(s => {
              if (!s.website) return false
              
              // Vérifier avec website_normalized si disponible
              if (s.website_normalized && s.website_normalized === normalizedUrl) {
                return true
              }
              
              const existingUrl = normalizeUrl(s.website)
              
              // Vérification exacte
              if (existingUrl === normalizedUrl) {
                return true
              }
              
              // Vérification par domaine (les 2 dernières parties)
              const existingParts = existingUrl.split('.')
              const normalizedParts = normalizedUrl.split('.')
              
              if (existingParts.length >= 2 && normalizedParts.length >= 2) {
                const existingDomain = existingParts.slice(-2).join('.')
                const normalizedDomain = normalizedParts.slice(-2).join('.')
                if (existingDomain === normalizedDomain) {
                  return true
                }
              }
              
              return false
            })
            
            if (duplicate) {
              return { isDuplicate: true, existing: duplicate }
            }
          }
        }
      }

      // Vérifier par nom similaire (si le nom est fourni)
      if (name && name.trim().length > 3) {
        const normalizedName = name.trim().toLowerCase()
        const { data: nameMatches, error: nameError } = await supabase
          .from('suppliers')
          .select('id, name, website')
          .ilike('name', `%${normalizedName}%`)
          .neq('status', 'deleted')

        if (nameError && nameError.code !== 'PGRST116') {
          console.error('Erreur vérification doublon nom:', nameError)
        }

        if (nameMatches && nameMatches.length > 0) {
          // Vérifier si c'est vraiment un doublon (nom très similaire)
          const duplicate = nameMatches.find(s => {
            if (excludeId && s.id === excludeId) return false
            const existingName = s.name?.toLowerCase().trim()
            // Vérifier si les noms sont très similaires (au moins 80% de similarité)
            if (existingName) {
              const similarity = calculateSimilarity(normalizedName, existingName)
              if (similarity > 0.8) {
                return true
              }
            }
            return false
          })
          
          if (duplicate) {
            return { isDuplicate: true, existing: duplicate }
          }
        }
      }

      return { isDuplicate: false, existing: null }
    } catch (error) {
      console.error('Erreur lors de la vérification des doublons:', error)
      return { isDuplicate: false, existing: null }
    }
  }

  // Fonction pour calculer la similarité entre deux chaînes (algorithme simple)
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    if (longer.length === 0) return 1.0
    
    const distance = levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  // Algorithme de distance de Levenshtein
  const levenshteinDistance = (str1, str2) => {
    const matrix = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .neq('status', 'published')
        .order('scraped_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setSuppliers(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des fournisseurs' })
    } finally {
      setLoading(false)
    }
  }

  const startScraping = async () => {
    if (!formData.country || formData.main_categories.length === 0 || formData.sub_categories.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un pays, au moins une catégorie principale et au moins une sous-catégorie' })
      return
    }

    try {
      setIsScraping(true)
      
      // Créer un job de scraping pour chaque combinaison catégorie principale + sous-catégorie
      const { data: { session } } = await supabase.auth.getSession()
      let firstJob = null
      let totalJobs = 0
      
      // Pour chaque catégorie principale sélectionnée
      for (const mainCategory of formData.main_categories) {
        // Pour chaque sous-catégorie sélectionnée qui appartient à cette catégorie principale
        const validSubCategories = formData.sub_categories.filter(subCat => 
          SUPPLIER_CATEGORIES[mainCategory]?.includes(subCat)
        )
        
        for (const subCategory of validSubCategories) {
          // Créer un job de scraping pour chaque combinaison
          const { data: job, error: jobError } = await supabase
            .from('scraping_jobs')
            .insert([{
              country: formData.country,
              supplier_type: subCategory,
              main_category: mainCategory,
              status: 'pending',
              created_by: user?.id
            }])
            .select()
            .single()

          if (jobError) {
            console.error('Erreur création job:', jobError)
            continue
          }

          if (!firstJob) {
            firstJob = job
            setCurrentJob(job)
          }

          // Appeler l'edge function pour chaque catégorie
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-suppliers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
              job_id: job.id,
              country: formData.country,
              supplier_type: subCategory,
              main_category: mainCategory
            })
          })

          if (!response.ok) {
            console.error(`Erreur pour ${mainCategory} - ${subCategory}:`, response.statusText)
            continue
          }

          // Mettre à jour le job
          await supabase
            .from('scraping_jobs')
            .update({ status: 'running', started_at: new Date().toISOString() })
            .eq('id', job.id)
          
          totalJobs++
        }
      }

      if (firstJob) {
        setCurrentJob({ ...firstJob, status: 'running', started_at: new Date().toISOString() })
        startPolling(firstJob.id)
        setMessage({ type: 'success', text: `Scraping démarré pour ${totalJobs} combinaison(s) catégorie/sous-catégorie` })
      } else {
        throw new Error('Aucun job n\'a pu être créé')
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du scraping:', error)
      setMessage({ type: 'error', text: error.message || 'Erreur lors du démarrage du scraping' })
      setIsScraping(false)
    }
  }

  const stopScraping = async () => {
    if (!currentJob) return

    try {
      console.log('🛑 Arrêt du scraping demandé pour le job:', currentJob.id)
      
      // Mettre à jour le job avec force
      const { data, error } = await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'stopped',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentJob.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du statut:', error)
        throw error
      }

      console.log('✅ Statut mis à jour:', data)

      // Mettre à jour l'état local immédiatement
      setIsScraping(false)
      if (data) {
        setCurrentJob(data)
      } else {
        setCurrentJob(null)
      }
      setMessage({ type: 'success', text: 'Scraping arrêté. L\'arrêt peut prendre quelques secondes...' })
      
      // Recharger les fournisseurs après un court délai
      setTimeout(() => {
        loadSuppliers()
      }, 2000)
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du scraping:', error)
      setMessage({ type: 'error', text: `Erreur lors de l'arrêt du scraping: ${error.message || 'Erreur inconnue'}` })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Fournisseur supprimé avec succès' })
      loadSuppliers()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setEditForm({
      name: supplier.name || '',
      website: supplier.website || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      country: supplier.country || '',
      main_category: supplier.main_category || '',
      sub_category: supplier.supplier_type || '',
      status: supplier.status || 'active',
      is_featured: supplier.is_featured || false
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingSupplier) return

    if (!editForm.name.trim()) {
      setMessage({ type: 'error', text: 'Le nom du fournisseur est requis' })
      return
    }

    // Vérifier les doublons avant de sauvegarder
    const website = editForm.website.trim() || null
    const name = editForm.name.trim()
    
    // Vérifier si le site web ou le nom a changé
    const websiteChanged = website !== (editingSupplier.website || '')
    const nameChanged = name !== (editingSupplier.name || '')
    
    if (websiteChanged || nameChanged) {
      const duplicateCheck = await checkDuplicate(website, name, editingSupplier.id)
      
      if (duplicateCheck.isDuplicate) {
        const existing = duplicateCheck.existing
        const duplicateInfo = existing.website 
          ? `Un fournisseur avec le site web "${existing.website}" existe déjà`
          : `Un fournisseur avec un nom similaire "${existing.name}" existe déjà`
        setMessage({ 
          type: 'error', 
          text: `Doublon détecté ! ${duplicateInfo}. Veuillez vérifier avant de continuer.` 
        })
        return
      }
    }

    try {
      // Normaliser l'URL pour website_normalized
      const normalizedUrl = normalizeUrl(editForm.website)
      
      const { error } = await supabase
        .from('suppliers')
        .update({
          name: editForm.name.trim(),
          website: editForm.website.trim() || null,
          website_normalized: normalizedUrl,
          phone: editForm.phone.trim() || null,
          email: editForm.email.trim() || null,
          address: editForm.address.trim() || null,
          country: editForm.country || null,
          main_category: editForm.main_category || null,
          supplier_type: editForm.sub_category || null,
          status: editForm.status,
          is_featured: editForm.is_featured
        })
        .eq('id', editingSupplier.id)

      if (error) throw error
      
      setMessage({ type: 'success', text: 'Fournisseur mis à jour avec succès' })
      setEditingSupplier(null)
      setShowEditModal(false)
      loadSuppliers()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour' })
    }
  }

  const toggleFeatured = async (supplier) => {
    try {
      const newFeaturedValue = !supplier.is_featured
      const { error } = await supabase
        .from('suppliers')
        .update({ is_featured: newFeaturedValue })
        .eq('id', supplier.id)

      if (error) throw error
      
      // Mettre à jour aussi dans pack_sections si le fournisseur est publié
      const { data: packSections } = await supabase
        .from('pack_sections')
        .select('id')
        .eq('pack_id', 'GLBNS')
        .or(`title.ilike.%${supplier.name}%,description.ilike.%${supplier.name}%`)
        .limit(1)

      if (packSections && packSections.length > 0) {
        // Mettre à jour la section correspondante avec un champ is_featured
        // On peut utiliser la description pour stocker cette info ou créer une colonne
        await supabase
          .from('pack_sections')
          .update({ 
            // Ajouter un indicateur dans la description ou utiliser un champ dédié
            description: packSections[0].description?.includes('⭐') 
              ? packSections[0].description.replace('⭐ ', '')
              : newFeaturedValue 
                ? `⭐ ${packSections[0].description || ''}`
                : packSections[0].description
          })
          .eq('id', packSections[0].id)
      }
      
      setMessage({ 
        type: 'success', 
        text: newFeaturedValue 
          ? 'Fournisseur mis en vedette' 
          : 'Fournisseur retiré des vedettes' 
      })
      loadSuppliers()
    } catch (error) {
      console.error('Erreur lors de la mise à jour vedette:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    }
  }

  const toggleSupplierSelection = (supplierId) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([])
    } else {
      setSelectedSuppliers(suppliers.map(s => s.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedSuppliers.length === 0) return
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedSuppliers.length} fournisseur(s) ?`)) return

    try {
      setIsDeletingSelected(true)
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .in('id', selectedSuppliers)

      if (error) throw error

      setMessage({ type: 'success', text: `${selectedSuppliers.length} fournisseur(s) supprimé(s)` })
      setSelectedSuppliers([])
      loadSuppliers()
    } catch (error) {
      console.error('Erreur lors de la suppression groupée:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression des fournisseurs sélectionnés' })
    } finally {
      setIsDeletingSelected(false)
    }
  }

  const pushToPackBusiness = async () => {
    if (selectedSuppliers.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins un fournisseur' })
      return
    }

    try {
      setIsPushing(true)
      
      // Récupérer les fournisseurs sélectionnés
      const suppliersToPush = suppliers.filter(s => selectedSuppliers.includes(s.id))
      
      // Récupérer le dernier display_order pour le pack Global Business
      const { data: lastSection } = await supabase
        .from('pack_sections')
        .select('display_order')
        .eq('pack_id', 'GLBNS')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()

      let displayOrder = lastSection?.display_order || 0

      // Créer les sections pour chaque fournisseur
      const sectionsToInsert = suppliersToPush.map((supplier, index) => {
        displayOrder++
        
        // Créer le titre avec le nom et la catégorie
        const title = `${supplier.name} - ${supplier.supplier_type || 'Fournisseur'}`
        
        // Créer la description avec les infos du fournisseur
        const descriptionParts = []
        // Ajouter l'emoji vedette si le fournisseur est en vedette
        if (supplier.is_featured) descriptionParts.push('⭐')
        if (supplier.country) descriptionParts.push(`📍 ${supplier.country}`)
        if (supplier.phone) descriptionParts.push(`📞 ${supplier.phone}`)
        if (supplier.email) descriptionParts.push(`✉️ ${supplier.email}`)
        if (supplier.address) descriptionParts.push(`🏢 ${supplier.address}`)
        
        const description = descriptionParts.join('\n') || `Fournisseur ${supplier.supplier_type || ''} basé en ${supplier.country || ''}`

        // Utiliser le site web comme URL (le viewer pourra l'afficher)
        // Si pas de site web, créer une page avec les infos
        const pdfUrl = supplier.website || `https://evoecom.com/supplier/${supplier.id}`

        return {
          pack_id: 'GLBNS',
          title,
          description,
          icon_name: 'FaGlobe',
          pdf_url: pdfUrl,
          display_order: displayOrder,
          is_active: true,
          created_by: user?.id,
          updated_by: user?.id
        }
      })

      // Insérer toutes les sections
      const { error: insertError } = await supabase
        .from('pack_sections')
        .insert(sectionsToInsert)

      if (insertError) throw insertError

      setMessage({ 
        type: 'success', 
        text: `${selectedSuppliers.length} fournisseur(s) publié(s) vers le Pack Global Business avec succès` 
      })
      
      await supabase
        .from('suppliers')
        .update({ status: 'published' })
        .in('id', selectedSuppliers)

      // Réinitialiser la sélection
      setSelectedSuppliers([])
      loadSuppliers()
      
    } catch (error) {
      console.error('Erreur lors de la publication:', error)
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la publication vers le pack' })
    } finally {
      setIsPushing(false)
    }
  }

  if (!isSupportOrAdmin()) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès non autorisé
          </h2>
          <p className="text-gray-600">
            Seuls les membres du support ou les administrateurs peuvent accéder à cette page.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Scraper de Fournisseurs
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Recherche et collecte automatique d'informations sur les fournisseurs
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Modal d'édition de fournisseur */}
        {showEditModal && editingSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Modifier le fournisseur
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingSupplier(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du fournisseur *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nom du fournisseur"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <select
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sélectionner un pays</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="verified">Vérifié</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie principale
                  </label>
                  <select
                    value={editForm.main_category}
                    onChange={(e) => setEditForm({ ...editForm, main_category: e.target.value, sub_category: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {MAIN_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-catégorie
                  </label>
                  <select
                    value={editForm.sub_category}
                    onChange={(e) => setEditForm({ ...editForm, sub_category: e.target.value })}
                    disabled={!editForm.main_category}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Sélectionner une sous-catégorie</option>
                    {editForm.main_category && SUPPLIER_CATEGORIES[editForm.main_category]?.map(subCategory => (
                      <option key={subCategory} value={subCategory}>{subCategory}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="3"
                    placeholder="Adresse complète"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.is_featured}
                      onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Mettre en vedette
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
                >
                  <FaSave />
                  Enregistrer les modifications
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingSupplier(null)
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire d'ajout manuel */}
        {showAddForm && (
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Ajouter un fournisseur manuellement
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setManualSupplierForm({
                    name: '',
                    website: '',
                    phone: '',
                    email: '',
                    address: '',
                    country: 'Chine',
                    main_category: '',
                    sub_category: '',
                    is_featured: false
                  })
                }}
                className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du fournisseur *
                </label>
                <input
                  type="text"
                  value={manualSupplierForm.name}
                  onChange={(e) => setManualSupplierForm({ ...manualSupplierForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nom du fournisseur"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  value={manualSupplierForm.website}
                  onChange={(e) => setManualSupplierForm({ ...manualSupplierForm, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={manualSupplierForm.phone}
                  onChange={(e) => setManualSupplierForm({ ...manualSupplierForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={manualSupplierForm.email}
                  onChange={(e) => setManualSupplierForm({ ...manualSupplierForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  value={manualSupplierForm.country}
                  onChange={(e) => setManualSupplierForm({ ...manualSupplierForm, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie principale
                </label>
                <select
                  value={manualSupplierForm.main_category}
                  onChange={(e) => setManualSupplierForm({ ...manualSupplierForm, main_category: e.target.value, sub_category: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {MAIN_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-catégorie
                </label>
                <select
                  value={manualSupplierForm.sub_category}
                  onChange={(e) => setManualSupplierForm({ ...manualSupplierForm, sub_category: e.target.value })}
                  disabled={!manualSupplierForm.main_category}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Sélectionner une sous-catégorie</option>
                  {manualSupplierForm.main_category && SUPPLIER_CATEGORIES[manualSupplierForm.main_category]?.map(subCategory => (
                    <option key={subCategory} value={subCategory}>{subCategory}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <textarea
                  value={manualSupplierForm.address}
                  onChange={(e) => setManualSupplierForm({ ...manualSupplierForm, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="2"
                  placeholder="Adresse complète"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualSupplierForm.is_featured}
                    onChange={(e) => setManualSupplierForm({ ...manualSupplierForm, is_featured: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mettre en vedette
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (!manualSupplierForm.name.trim()) {
                    setMessage({ type: 'error', text: 'Le nom du fournisseur est requis' })
                    return
                  }

                  // Vérifier les doublons avant d'ajouter
                  const website = manualSupplierForm.website.trim() || null
                  const name = manualSupplierForm.name.trim()
                  
                  const duplicateCheck = await checkDuplicate(website, name)
                  
                  if (duplicateCheck.isDuplicate) {
                    const existing = duplicateCheck.existing
                    const duplicateInfo = existing.website 
                      ? `Un fournisseur avec le site web "${existing.website}" existe déjà`
                      : `Un fournisseur avec un nom similaire "${existing.name}" existe déjà`
                    setMessage({ 
                      type: 'error', 
                      text: `Doublon détecté ! ${duplicateInfo}. Veuillez vérifier avant d'ajouter.` 
                    })
                    return
                  }

                  try {
                    // Normaliser l'URL pour website_normalized
                    const normalizedUrl = normalizeUrl(manualSupplierForm.website)
                    
                    const { error } = await supabase
                      .from('suppliers')
                      .insert({
                        name: manualSupplierForm.name.trim(),
                        website: manualSupplierForm.website.trim() || null,
                        website_normalized: normalizedUrl,
                        phone: manualSupplierForm.phone.trim() || null,
                        email: manualSupplierForm.email.trim() || null,
                        address: manualSupplierForm.address.trim() || null,
                        country: manualSupplierForm.country,
                        supplier_type: manualSupplierForm.sub_category,
                        main_category: manualSupplierForm.main_category,
                        is_featured: manualSupplierForm.is_featured,
                        status: 'active',
                        created_by: user?.id
                      })

                    if (error) throw error

                    setMessage({ type: 'success', text: 'Fournisseur ajouté avec succès' })
                    setShowAddForm(false)
                    setManualSupplierForm({
                      name: '',
                      website: '',
                      phone: '',
                      email: '',
                      address: '',
                      country: 'Chine',
                      main_category: '',
                      sub_category: '',
                      is_featured: false
                    })
                    loadSuppliers()
                  } catch (error) {
                    console.error('Erreur lors de l\'ajout:', error)
                    setMessage({ type: 'error', text: error.message || 'Erreur lors de l\'ajout du fournisseur' })
                  }
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
              >
                <FaCheck />
                Ajouter le fournisseur
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setManualSupplierForm({
                    name: '',
                    website: '',
                    phone: '',
                    email: '',
                    address: '',
                    country: 'Chine',
                    main_category: '',
                    sub_category: '',
                    is_featured: false
                  })
                }}
                className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Bouton pour afficher le formulaire */}
        {!showAddForm && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
            >
              <FaBuilding />
              Ajouter un fournisseur manuellement
            </button>
          </div>
        )}

        {/* Contrôles du scraper */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Configuration du Scraping
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value, main_categories: [], sub_categories: [] })}
                disabled={isScraping}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories principales (plusieurs sélections possibles)
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2">
                {MAIN_CATEGORIES.map(category => (
                  <label key={category} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.main_categories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Ajouter la catégorie principale
                          const newMainCategories = [...formData.main_categories, category]
                          // Filtrer les sous-catégories pour ne garder que celles qui appartiennent aux catégories principales sélectionnées
                          const validSubCategories = formData.sub_categories.filter(subCat => {
                            return newMainCategories.some(mainCat => 
                              SUPPLIER_CATEGORIES[mainCat]?.includes(subCat)
                            )
                          })
                          setFormData({ 
                            ...formData, 
                            main_categories: newMainCategories,
                            sub_categories: validSubCategories
                          })
                        } else {
                          // Retirer la catégorie principale
                          const newMainCategories = formData.main_categories.filter(cat => cat !== category)
                          // Filtrer les sous-catégories pour ne garder que celles qui appartiennent aux catégories principales restantes
                          const validSubCategories = formData.sub_categories.filter(subCat => {
                            return newMainCategories.some(mainCat => 
                              SUPPLIER_CATEGORIES[mainCat]?.includes(subCat)
                            )
                          })
                          setFormData({ 
                            ...formData, 
                            main_categories: newMainCategories,
                            sub_categories: validSubCategories
                          })
                        }
                      }}
                      disabled={isScraping}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
              {formData.main_categories.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {formData.main_categories.length} catégorie(s) principale(s) sélectionnée(s)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-catégories (plusieurs sélections possibles)
              </label>
              <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-4">
                {formData.main_categories.length > 0 ? (
                  formData.main_categories.map(mainCategory => {
                    const subCategories = SUPPLIER_CATEGORIES[mainCategory] || []
                    if (subCategories.length === 0) return null
                    
                    return (
                      <div key={mainCategory} className="space-y-2">
                        <div className="sticky top-0 bg-gray-100 px-3 py-2 rounded-md -mx-2 -mt-2 mb-2 z-10">
                          <h4 className="text-sm font-semibold text-gray-800">{mainCategory}</h4>
                        </div>
                        <div className="space-y-1 pl-2">
                          {subCategories.map(subCategory => (
                            <label key={subCategory} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.sub_categories.includes(subCategory)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({ ...formData, sub_categories: [...formData.sub_categories, subCategory] })
                                  } else {
                                    setFormData({ ...formData, sub_categories: formData.sub_categories.filter(cat => cat !== subCategory) })
                                  }
                                }}
                                disabled={isScraping}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-gray-700">{subCategory}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500 p-2">Sélectionnez d'abord au moins une catégorie principale</p>
                )}
              </div>
              {formData.sub_categories.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {formData.sub_categories.length} sous-catégorie(s) sélectionnée(s)
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {!isScraping ? (
              <button
                onClick={startScraping}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
              >
                <FaPlay />
                Lancer le scraping
              </button>
            ) : (
              <>
                <button
                  onClick={stopScraping}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
                >
                  <FaStop />
                  Arrêter le scraping
                </button>
                {currentJob && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg">
                    <FaSpinner className="animate-spin text-primary" />
                    <span className="text-sm text-gray-700">
                      {currentJob.total_saved} fournisseurs trouvés
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Liste des fournisseurs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Fournisseurs ({suppliers.length})
            </h2>
            {selectedSuppliers.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedSuppliers.length} sélectionné(s)
                </span>
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeletingSelected || isPushing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeletingSelected ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Supprimer
                    </>
                  )}
                </button>
                <button
                  onClick={pushToPackBusiness}
                  disabled={isPushing}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {isPushing ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      Publier
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
              <p className="text-gray-600">Chargement des fournisseurs...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-gray-600 text-sm sm:text-base">Aucun fournisseur pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 hover:text-primary"
                        title="Sélectionner tout"
                      >
                        {selectedSuppliers.length === suppliers.length ? (
                          <FaCheck className="text-primary" />
                        ) : (
                          <FaSquare className="text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Site web</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Téléphone</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Pays</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suppliers.map((supplier) => (
                    <tr 
                      key={supplier.id} 
                      className={`hover:bg-gray-50 ${
                        selectedSuppliers.includes(supplier.id) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleSupplierSelection(supplier.id)}
                          className="flex items-center justify-center"
                          title={selectedSuppliers.includes(supplier.id) ? 'Désélectionner' : 'Sélectionner'}
                        >
                          {selectedSuppliers.includes(supplier.id) ? (
                            <FaCheck className="text-primary" />
                          ) : (
                            <FaSquare className="text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                        {supplier.website ? (
                          <a
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs font-medium"
                            title={supplier.website}
                          >
                            <FaExternalLinkAlt className="text-xs" />
                            Visiter le site
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-xs sm:text-sm text-gray-900">{supplier.phone || '-'}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-xs sm:text-sm text-gray-900">{supplier.email || '-'}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {supplier.country || '-'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                        <div>
                          {supplier.main_category && (
                            <div className="text-xs text-gray-400">{supplier.main_category}</div>
                          )}
                          <div className="text-sm">{supplier.supplier_type || '-'}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleFeatured(supplier)}
                              className={`${supplier.is_featured ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}
                              title={supplier.is_featured ? 'Retirer des vedettes' : 'Mettre en vedette'}
                            >
                              <FaStar />
                            </button>
                            <button
                              onClick={() => handleEdit(supplier)}
                              className="text-primary hover:text-primary/80"
                            title="Modifier le fournisseur"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
                              className="text-red-600 hover:text-red-900"
                            title="Supprimer le fournisseur"
                            >
                              <FaTrash />
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardScraper)

