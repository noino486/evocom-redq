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
const SUPPLIER_CATEGORIES = {
  'Transport et logistique': [
    'Société d\'import-export',
    'Exportateur',
    'Établissement vinicole',
    'Service de transport',
    'Importateur',
    'Administration',
    'Administration gouvernementale',
    'Agence de voyages',
    'Autorité portuaire',
    'Casier à colis',
    'Consultant en commerce international',
    'Coursier',
    'Courtier en douane',
    'Déménageur',
    'Industrie d\'équipements de livraison',
    'Installation de stockage',
    'Service d\'e-commerce',
    'Service de conteneurs',
    'Service de gestion des déchets',
    'Service de livraison',
    'Service establishment',
    'Service logistique',
    'Services d\'expédition et de livraison',
    'Société d\'administration portuaire',
    'Société de livraison',
    'Société de transport international de marchandises',
    'Société de transport routier',
    'Transporteur de véhicules',
    'Service de taxi',
    'Service de taxi minibus',
    'Service de chauffeur privé',
    'Service de transport et d\'accompagnement',
    'Station de taxis',
    'Service ambulancier',
    'Service de navette aéroport',
    'Service de chauffeur particulier'
  ],
  'Textile pour Homme': [
    'Producteur local',
    'Marché fermier',
    'Magasin alimentaire',
    'Grossiste en produits naturels',
    'Vente directe producteur',
    'Boutique artisanale',
    'Mécanicien automobile',
    'Concession automobile',
    'Magasin d\'accessoires auto',
    'Grossiste pièces auto'
  ],
  'Textile pour Femme': [
    'Magasin de produits naturels',
    'Grossiste en parfums',
    'Salon de coiffure',
    'Barbershop',
    'Salon de coiffure afro',
    'Grossiste coiffure',
    'Magasin professionnel coiffure',
    'Magasin de perruques',
    'Apiculteur',
    'Épicerie fine'
  ],
  'Textile': [
    'Magasin d\'articles en cuir',
    'Magasin de bagagerie',
    'Vente d\'articles pour femmes',
    'Magasin de cadeaux',
    'Boutique indépendante',
    'Magasin de lingerie',
    'Magasin de robes',
    'Magasin de vêtements de sport',
    'Magasin de vêtements grandes tailles',
    'Magasin de chaussures pour enfants'
  ],
  'Sac à Main': [
    'Institut de beauté',
    'Spa',
    'Boutique de maquillage',
    'Magasin de soins de la peau',
    'Magasin de produits capillaires',
    'Magasin bio',
    'Pharmacie',
    'Grossiste en cosmétiques',
    'Magasin de beauté',
    'Magasin de soins personnels'
  ],
  'Production audiovisuelle & cinéma': [
    'Société de production vidéo',
    'Société de production cinématographique',
    'Studio cinématographique',
    'Studio d\'animation'
  ],
  'Parfum': [
    'Location de drones',
    'Vente de matériel vidéo',
    'Boutique high-tech',
    'Fournisseur de drones professionnels',
    'Magasin de matériel photographique',
    'Studio photo',
    'Location de matériel photo',
    'Magasin d\'impression photo',
    'Vidéaste',
    'Service de vidéosurveillance'
  ],
  'Montre': [
    'Magasin d\'articles bébé',
    'Magasin de jouets',
    'Grossiste en vêtements pour enfants',
    'Opticien',
    'Lunetterie',
    'Ophtalmologiste',
    'Magasin d\'optique',
    'Clinique de la vision',
    'Optométriste',
    'Magasin de sport (lunettes sport)'
  ],
  'Marketing & Communication': [
    'Agence de marketing',
    'Agence de publicité',
    'Service de marketing Internet',
    'Agence de branding',
    'Régie publicitaire',
    'Consultant média',
    'Agence de relations publiques',
    'Service de rédaction',
    'Média'
  ],
  'Lunettes & Lunettes de soleil': [
    'Carrosserie',
    'Casse automobile',
    'Service de tuning',
    'Location de voitures',
    'Vente de voitures d\'occasion',
    'Service de dépannage auto',
    'Magasin d\'électronique',
    'Magasin d\'informatique',
    'Réparateur d\'ordinateurs',
    'Magasin de téléphonie'
  ],
  'Impression': [
    'Impression 3D'
  ],
  'Gem': [
    'Joaillier',
    'Diamantaire',
    'Bijoutier',
    'Expert en bijoux',
    'Acheteur de diamants',
    'Bijouterie',
    'Service de réparation de bijoux',
    'Service de rachat de bijoux',
    'Fournisseur de pierres',
    'Exportateur de bijoux',
    'Vendeur de bijoux en gros',
    'Exploitation minière',
    'Gemmologie',
    'Fabrication de bijoux',
    'Mine'
  ],
  'Événementiel': [
    'Agence artistique',
    'Agence événementielle',
    'Centre de formation (selon contexte)'
  ],
  'Digital & Web': [
    'Concepteur de sites Web',
    'Service d\'hébergement de site Web',
    'Agence e-commerce',
    'Service d\'e-commerce',
    'Entreprise de logiciels'
  ],
  'Création & Design': [
    'Agence de design',
    'Graphiste',
    'Designer d\'intérieur',
    'Design graphique',
    'Ingénieur design',
    'Entreprise de design industriel',
    'Société de production vidéo (créatif)'
  ],
  'Cosmétique': [
    'Fabricant de produits cosmétiques',
    'Fournisseur de produits de beauté',
    'Industrie cosmétique',
    'Laboratoire pharmaceutique',
    'Grossiste de produits de beauté'
  ],
  'Cosmetique': [
    'Service informatique',
    'Fournisseur de matériel informatique',
    'Magasin high-tech',
    'Boutique de gadgets',
    'Magasin de consoles',
    'Magasin de drones',
    'Magasin de modélisme',
    'Service de prise de vue aérienne',
    'Photographe aérien',
    'Magasin d\'informatique'
  ],
  'Conseil & Services Professionnels': [
    'Consultant',
    'Conseiller',
    'Consultant en marketing',
    'Coaching professionnel',
    'Consultant en ingénierie',
    'Prestataire spécialisé en études de marché'
  ],
  'Chaussure': [
    'Magasin d\'articles de mode',
    'Boutique d\'articles en cuir',
    'Magasin d\'outdoor',
    'Magasin d\'articles de danse',
    'Magasin de vêtements pour enfants',
    'Magasin de vêtements pour femmes',
    'Grossiste en chaussures',
    'Animalerie',
    'Magasin d\'alimentation animale',
    'Magasin d\'articles pour animaux'
  ],
  'Bijoux': [
    'Boutique de luxe',
    'Magasin de montres',
    'Grossiste en bijoux',
    'Rachat d\'or',
    'Magasin d\'accessoires de mode',
    'Réparation de montres',
    'Grossiste en montres',
    'Magasin d\'articles cadeaux',
    'Magasin de seconde main',
    'Maroquinerie'
  ],
  'Auto': [
    'Agence de location de voitures',
    'Association ou organisation',
    'Atelier de carrosserie automobile',
    'Atelier de mécanique automobile',
    'Atelier de réparation automobile',
    'Boutique d\'objets à collectionner',
    'Centre de contrôle technique',
    'Centre de formation',
    'Centre de loisirs',
    'Club automobile',
    'Concessionnaire automobile',
    'Concessionnaire de motos',
    'Concessionnaire de quads',
    'Concessionnaire de véhicules à moteur',
    'Concessionnaire de voitures de course',
    'Concessionnaire Dodge',
    'Concessionnaire Ford',
    'Concessionnaire Ram',
    'Consultant en douane',
    'Courtier automobile',
    'Dépôt-vente',
    'Entrepôt',
    'Fabricant de pièces automobiles',
    'Garage automobile',
    'Magasin de batteries pour voitures',
    'Magasin de pièces pour voitures de course',
    'Marché automobile',
    'Mécanicien',
    'Mécanicien.ne de précision',
    'Prestataire de tuning automobile',
    'Service d\'esthétique automobile',
    'Vendeur de voitures d\'occasion',
    'Magasin de pièces de rechange automobiles',
    'Magasin de pièces automobiles',
    'Magasin d\'outillage',
    'Fournisseur de pièces de carrosserie',
    'Magasin d\'amortisseurs pour automobiles',
    'Magasin d\'accessoires automobiles',
    'Magasin de silencieux d\'échappement',
    'Fournisseur d\'outils pneumatiques',
    'Magasin d\'accessoires pour poids lourds',
    'Service de débosselage automobile',
    'Service de réparation de pare-brise',
    'Peinture automobile',
    'Magasin de pneus',
    'Centre culturel',
    'Atelier d\'artiste'
  ],
  'Arts & culture': [
    'Boutique d\'articles de mariage',
    'Fournisseur de manèges',
    'Fabricant'
  ],
  'Animaux Produit': [
    'Boutique pour animaux',
    'Toilettage pour animaux',
    'Clinique vétérinaire',
    'Pension pour animaux',
    'Dresseur d\'animaux',
    'Service de promenade de chiens',
    'Grossiste en produits pour animaux',
    'Bijoux fantaisie',
    'Créateur de bijoux',
    'Orfèvre'
  ],
  'Autre': [
    'Magasin',
    'Fournisseur de produits promotionnels',
    'Boutique de t-shirts personnalisés',
    'Service de broderie',
    'Service d\'impression de cartons d\'invitation',
    'Montagnes russes',
    'Magasin de jeux vidéo',
    'Fournisseur de machines de divertissement',
    'Fournisseur de plantes artificielles',
    'Distributeur de boissons',
    'Grossiste en vins',
    'Grossiste',
    'Siège social',
    'Grossiste en boissons alcoolisées',
    'Fournisseur de bières',
    'Service de distribution',
    'Fournisseur de boissons gazeuses',
    'Carrière',
    'Fournisseur de matériaux de construction',
    'Magasin de materiaux de construction',
    'Fournisseur de granulats',
    'Société de travaux publics',
    'Entreprise de terrassement',
    'Fournisseur de terre végétale',
    'Sablerie',
    'Carrière de gravier',
    'Fournisseur de sable et de gravier',
    'Arboriste',
    'Constructeur de terrasses',
    'Agence de location de matériel',
    'Paysagiste',
    'Entrepreneur spécialisé en aménagement aquatique',
    'Société de construction de piscine',
    'Karaoké vidéo',
    'Fournisseur de matériel audiovisuel',
    'Disc-jockey',
    'Prestataire de mariage',
    'Service de location de karaoké',
    'Fournisseur de matériel d\'éclairage scénique',
    'Service de location de tentes',
    'Fournisseur d\'appareils pour centres d\'amusement',
    'Fournisseur d\'équipements industriels',
    'Magasin de matériel pour DJ',
    'Animateur de soirées et d\'événements',
    'Photographe',
    'Magasin de location de chaînes hi-fi',
    'Service de location de matériel de soirée',
    'Service de photographie',
    'Service de location de matériel audiovisuel',
    'Service technologique pour l\'organisation d\'événements',
    'Bijouterie fantaisie',
    'Graveur sur bijoux',
    'Fournisseur d\'équipement de bijouterie',
    'Service de réparation de montres',
    'Manège',
    'Fournisseur de flippers',
    'Magasin de jeux d\'occasion',
    'Service de réparation',
    'Fabricant de jouets',
    'Magasin d\'articles de billard',
    'Magasin de fléchettes',
    'Location d\'installations et de machines',
    'Borne de location de jeux vidéo',
    'Atelier de machines et outils',
    'Service de réparation de matériel électronique',
    'Atelier de couture',
    'Couturier',
    'Service de retouche de vêtements',
    'Entreprise de couture',
    'Tailleur sur mesure',
    'Maison de couture',
    'Magasin de couture',
    'Artisanat',
    'Magasin de broderie',
    'Magasin d\'ameublement et de décoration',
    'Tapissier décorateur',
    'Cours de couture',
    'Fabricant de maroquinerie',
    'Styliste',
    'Boutique de cadeaux',
    'Boutique de lingerie',
    'Atelier de réparation de meubles',
    'Boutique de mariage',
    'Mercerie',
    'Conseil',
    'Maquettiste',
    'Fabricant de vêtements de sport',
    'Maison de haute couture',
    'Atelier de sérigraphie',
    'Magasin de meubles',
    'Fabricant de meubles',
    'Magasin de meubles de chambre à coucher',
    'Magasin de canapés',
    'Magasin de meubles de bureau',
    'Magasin de literie',
    'Magasin de meubles de cuisine',
    'Magasin de mobilier de jardin',
    'Boutique de mobilier en pin',
    'Magasin de tapis',
    'Accessoires mobiliers',
    'Vendeur de meubles en gros',
    'Galerie d\'art',
    'Fournisseur de meubles encastrables',
    'Magasin de meubles pour enfants',
    'Centre de marques',
    'Magasin de moquettes',
    'Magasin de revêtements de sol',
    'Fournisseur d\'accessoires de meubles',
    'Bar stool supplier',
    'Magasin de bricolage',
    'Magasin de luminaires',
    'Magasin d\'usine',
    'Décoration intérieure',
    'Designer d\'intérieur',
    'Prestataire de réaménagement de cuisine',
    'Parfumerie',
    'Magasin de cosmétiques',
    'Exportateur de parfums',
    'Magasin de produits de beauté',
    'Fournisseur d\'arômes et de parfums',
    'Boutique de santé et beauté',
    'Entreprise',
    'Magasin de bougies',
    'Magasin d\'aromathérapie',
    'Grossiste en articles d\'hygiène',
    'Distillerie',
    'Entreprise de packaging',
    'Imprimerie',
    'Imprimerie spécialisée en sérigraphie',
    'Magasin d\'enseignes',
    'Service d\'impression 3D',
    'Service d\'impression numérique',
    'Imprimeur',
    'Imprimeur numérique',
    'Magasin de reprographie',
    'Imprimeur d\'étiquettes personnalisées',
    'Imprimerie commerciale',
    'Magasin d\'articles d\'emballage',
    'Miellerie',
    'Horlogerie',
    'Service de réparation de montres et d\'horloges',
    'Horloger',
    'Boutique d\'accessoires de mode',
    'Magasin de maroquinerie',
    'Magasin de stylos',
    'Service de polissage des métaux',
    'Société d\'horlogerie',
    'Service de restauration d\'œuvres d\'art',
    'Magasin de bracelets',
    'Service de perçage d\'oreilles',
    'Magasin de lunettes de soleil',
    'Magasin de vêtements',
    'Magasin de tissus',
    'Grossiste en textiles',
    'Fabricant de textiles',
    'Magasin de décoration intérieure',
    'Magasin de vêtements professionnels',
    'Magasin de linge de maison',
    'Magasin de mode',
    'Magasin de chaussures',
    'Magasin de sport'
]
}

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
    main_category: '',
    sub_category: ''
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
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
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
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('scraping_jobs')
          .select('*')
          .eq('id', jobId)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          setCurrentJob(data)
          
          if (data.status === 'completed' || data.status === 'stopped' || data.status === 'error') {
            setIsScraping(false)
            clearInterval(interval)
            loadSuppliers()
            const statusText = data.status === 'completed' ? 'terminé' : data.status === 'stopped' ? 'arrêté' : 'en erreur'
            setMessage({ type: 'success', text: `Scraping ${statusText} - ${data.total_saved} fournisseurs trouvés` })
          }
        }
      } catch (error) {
        console.error('Erreur lors du polling:', error)
        clearInterval(interval)
        setIsScraping(false)
      }
    }, 3000) // Poll toutes les 3 secondes

    return () => clearInterval(interval)
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
    if (!formData.country || !formData.main_category || !formData.sub_category) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un pays, une catégorie principale et une sous-catégorie' })
      return
    }

    try {
      setIsScraping(true)
      
      // Créer un job de scraping
      const { data: job, error: jobError } = await supabase
        .from('scraping_jobs')
        .insert([{
          country: formData.country,
          supplier_type: formData.sub_category,
          main_category: formData.main_category,
          status: 'pending',
          created_by: user?.id
        }])
        .select()
        .single()

      if (jobError) throw jobError

      setCurrentJob(job)

      // Appeler l'edge function
      const { data: { session } } = await supabase.auth.getSession()
      
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
          supplier_type: formData.sub_category,
          main_category: formData.main_category
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors du démarrage du scraping')
      }

      const result = await response.json()
      
      // Mettre à jour le job
      await supabase
        .from('scraping_jobs')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', job.id)

      setCurrentJob({ ...job, status: 'running', started_at: new Date().toISOString() })
      startPolling(job.id)
      
      setMessage({ type: 'success', text: 'Scraping démarré avec succès' })
    } catch (error) {
      console.error('Erreur lors du démarrage du scraping:', error)
      setMessage({ type: 'error', text: error.message || 'Erreur lors du démarrage du scraping' })
      setIsScraping(false)
    }
  }

  const stopScraping = async () => {
    if (!currentJob) return

    try {
      // Mettre à jour le job
      const { error } = await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'stopped',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentJob.id)

      if (error) throw error

      setIsScraping(false)
      setCurrentJob(null)
      setMessage({ type: 'success', text: 'Scraping arrêté' })
      loadSuppliers()
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du scraping:', error)
      setMessage({ type: 'error', text: 'Erreur lors de l\'arrêt du scraping' })
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

    try {
      const { error } = await supabase
        .from('suppliers')
        .update({
          name: editForm.name.trim(),
          website: editForm.website.trim() || null,
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

                  try {
                    const { error } = await supabase
                      .from('suppliers')
                      .insert({
                        name: manualSupplierForm.name.trim(),
                        website: manualSupplierForm.website.trim() || null,
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
                onChange={(e) => setFormData({ ...formData, country: e.target.value, sub_category: '' })}
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
                Catégorie principale
              </label>
              <select
                value={formData.main_category}
                onChange={(e) => setFormData({ ...formData, main_category: e.target.value, sub_category: '' })}
                disabled={isScraping}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
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
                value={formData.sub_category}
                onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                disabled={isScraping || !formData.main_category}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Sélectionner une sous-catégorie</option>
                {formData.main_category && SUPPLIER_CATEGORIES[formData.main_category]?.map(subCategory => (
                  <option key={subCategory} value={subCategory}>{subCategory}</option>
                ))}
              </select>
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

