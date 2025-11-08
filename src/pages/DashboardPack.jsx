import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, Navigate } from 'react-router-dom'
import { 
  FaDownload, FaExternalLinkAlt, FaFileAlt, FaSpinner,
  FaEye, FaTimes, FaChevronDown, FaChevronUp,
  FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaFilter, FaStar,
  FaTrash, FaExpand, FaCompress
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'
import * as Icons from 'react-icons/fa'

const SUPPLIERS_PER_PAGE = 25

const DashboardPack = () => {
  const location = useLocation()
  const { profile, hasProductAccess, isAdmin } = useAuth()
  const [sections, setSections] = useState([])
  const [pdfSections, setPdfSections] = useState({})
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPdfSections, setLoadingPdfSections] = useState(true)
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [expandedSection, setExpandedSection] = useState(null)
  const [expandedPdf, setExpandedPdf] = useState(null)
  const [fullscreenPdf, setFullscreenPdf] = useState(null)
  const [selectedPdfCategory, setSelectedPdfCategory] = useState(null)
  const [iframeErrors, setIframeErrors] = useState({})
  const [supplierFilters, setSupplierFilters] = useState({
    category: '',
    country: ''
  })
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [availableSupplierTypes, setAvailableSupplierTypes] = useState([])
  const [favorites, setFavorites] = useState([])
  const [supplierActionMessage, setSupplierActionMessage] = useState({ type: '', text: '' })
  const [supplierPage, setSupplierPage] = useState(1)

  const handleSelectCategory = (category) => {
    setSelectedCategory(category)
    setSupplierPage(1)
  }

  const handleSupplierCountryChange = (value) => {
    setSupplierFilters(prev => ({ ...prev, country: value }))
    setSupplierPage(1)
  }

  const handleResetSupplierFilters = () => {
    setSupplierFilters({ category: '', country: '' })
    setSupplierPage(1)
  }

  // Catégories de base (celles que l'utilisateur veut afficher)
  const baseSupplierCategories = [
    'Textiles pour Femme',
    'Textiles pour Garçon',
    'Lunettes Et Lunettes de soleil',
    'Cosmétique',
    'Parfum',
    'Soins Capillaires',
    'Miel',
    'Pièces auto',
    'Automobile',
    'Tech',
    'Drones',
    'Caméras',
    'Chaussures',
    'Animaux Produits',
    'Bijoux',
    'Textile',
    'Montre',
    'Sac à main'
  ]

  // Fonction pour obtenir l'image d'une catégorie
  const getCategoryImage = (category) => {
    if (!category) return null
    
    // Mapping exact des catégories vers les fichiers images (noms exacts des fichiers)
    const categoryImageMap = {
      'Textiles pour Femme': '/categories/TextilesF.png',
      'Textiles pour Garçon': '/categories/TextilesG.png',
      'Lunettes Et Lunettes de soleil': '/categories/Lunette.png',
      'Lunettes': '/categories/Lunette.png', // Variante
      'Cosmétique': '/categories/Cosmectic.png',
      'Parfum': '/categories/Parfum.png',
      'Soins Capillaires': '/categories/SoinsCapillaires.png',
      'Miel': '/categories/Miel.png',
      'Pièces auto': '/categories/piecesauto.png',
      'Automobile': '/categories/Automobile.png',
      'Tech': '/categories/Tech.png',
      'Drones': '/categories/Drone.png',
      'Drone': '/categories/Drone.png', // Variante
      'Caméras': '/categories/CameraDS.png',
      'Camera de surveillance': '/categories/CameraDS.png', // Variante
      'Chaussures': '/categories/Chaussure.png',
      'Chaussure': '/categories/Chaussure.png', // Variante
      'Animaux Produits': '/categories/AnimauxProduit.png',
      'Animaux Produit': '/categories/AnimauxProduit.png', // Variante
      'Bijoux': '/categories/Bijoux.png',
      'Montre': '/categories/watchs.png', // Note: espace avant .png dans le nom du fichier
      'Sac à main': '/categories/sacmain.png',
      'Textile': '/categories/Textile.png'
    }
    
    // Retourner l'image correspondante ou null
    return categoryImageMap[category] || null
  }

  const getPdfCategoryImage = (categoryId) => {
    if (!categoryId) return null

    const pdfImageMap = {
      EXPATRIATION: '/pdf/expat.jpg',
      REVENUE_ACTIF: '/pdf/actif.jpg',
      REVENUE_PASSIF: '/pdf/passif.jpg'
    }

    return pdfImageMap[categoryId] || null
  }

  const pdfTextStyle = useMemo(() => ({
    color: '#111827'
  }), [])

  const products = useMemo(() => [
    {
      id: 'STFOUR',
      name: 'Pack Global Sourcing',
      description: 'Fichiers et ressources pour trouver des fournisseurs',
      accessLevel: 1,
      downloadUrl: 'https://packs.evoecom.com/stfour'
    },
    {
      id: 'GLBNS',
      name: 'Pack Global Business',
      description: 'Ressources complètes pour développer votre business',
      accessLevel: 2,
      downloadUrl: 'https://packs.evoecom.com/glbns'
    }
  ], [])

  // Mapper les chemins de route vers les IDs de produits
  const packMapping = {
    '/dashboard/pack-global-sourcing': 'STFOUR',
    '/dashboard/pack-global-business': 'GLBNS'
  }

  const productId = packMapping[location.pathname]

  const renderPdfCategoryCard = (categoryId, label) => {
    const image = getPdfCategoryImage(categoryId)
    const count = pdfSections[categoryId]?.length || 0
    const displayLabel = categoryId === 'EXPATRIATION' ? 'Expatriation' : label

    return (
      <motion.div
        key={categoryId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setSelectedPdfCategory(categoryId)}
        className="relative rounded-lg border-2 border-gray-200 hover:border-primary shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group h-32 sm:h-40 flex items-end"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: image ? `url(${image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        {!image && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <FaFileAlt className="text-5xl text-primary opacity-50" />
          </div>
        )}

        <div className="relative w-full p-4 sm:p-5 text-white">
          <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-lg mb-3 backdrop-blur-sm">
            <FaFileAlt className="text-xl" />
          </div>
          <h3 className="text-base font-bold mb-1" style={pdfTextStyle}>
            {displayLabel}
          </h3>
          <span className="text-sm font-bold" style={pdfTextStyle}>
            {count} PDF{count !== 1 ? 's' : ''}
          </span>
        </div>
      </motion.div>
    )
  }

  useEffect(() => {
    if (productId && hasProductAccess(productId)) {
      loadSections()
      loadPdfSections()
      // Charger les fournisseurs pour les deux packs
      loadSuppliers()
      // Charger les favoris de l'utilisateur
      loadFavorites()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  useEffect(() => {
    if (supplierActionMessage.text) {
      const timer = setTimeout(() => setSupplierActionMessage({ type: '', text: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [supplierActionMessage])

  // Charger les favoris de l'utilisateur
  const loadFavorites = async () => {
    if (!profile?.id) return
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('supplier_id')
        .eq('user_id', profile.id)
      
      if (error) {
        console.error('Erreur lors du chargement des favoris:', error)
        return
      }
      
      if (data) {
        setFavorites(data.map(f => f.supplier_id))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error)
    }
  }

  // Toggle favoris
  const toggleFavorite = async (supplierId) => {
    if (!profile?.id) return
    
    const isFavorite = favorites.includes(supplierId)
    const newFavorites = isFavorite 
      ? favorites.filter(id => id !== supplierId)
      : [...favorites, supplierId]
    
    // Mise à jour optimiste de l'interface
    setFavorites(newFavorites)
    
    try {
      if (isFavorite) {
        // Retirer des favoris
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', profile.id)
          .eq('supplier_id', supplierId)
        
        if (error) throw error
      } else {
        // Ajouter aux favoris
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: profile.id,
            supplier_id: supplierId
          })
        
        if (error) throw error
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error)
      // Restaurer l'état précédent en cas d'erreur
      setFavorites(favorites)
    }
  }

  const loadSections = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pack_sections')
        .select('*')
        .eq('pack_id', productId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      
      // Filtrer les sections : exclure TOUS les fournisseurs
      // Un fournisseur est identifié par :
      // 1. Format titre: "Nom - Type" (avec au moins 2 parties) - CRITÈRE PRINCIPAL
      // 2. Icon_name: 'FaGlobe' (utilisé pour les fournisseurs)
      // 3. Description contient des emojis 📍 📞 ✉️ 🏢
      const pdfSections = (data || []).filter(section => {
        // CRITÈRE PRINCIPAL : Si le titre contient " - " et a au moins 2 parties, c'est un fournisseur
        const parts = section.title.split(' - ')
        const hasSupplierFormat = parts.length >= 2
        
        // Si le format est "Nom - Type", c'est définitivement un fournisseur → EXCLURE
        if (hasSupplierFormat) {
          return false // Exclure ce fournisseur
        }
        
        // Vérifications supplémentaires pour les cas où le format n'est pas "Nom - Type"
        const hasSupplierIcon = section.icon_name === 'FaGlobe'
        const hasSupplierDescription = section.description && (
          section.description.includes('📍') ||
          section.description.includes('📞') ||
          section.description.includes('✉️') ||
          section.description.includes('🏢')
        )
        
        // Si icône FaGlobe ET description contient des emojis → fournisseur → EXCLURE
        if (hasSupplierIcon && hasSupplierDescription) {
          return false // Exclure ce fournisseur
        }
        
        // Si SEULEMENT l'icône est FaGlobe OU SEULEMENT la description a des emojis,
        // mais pas les deux, on considère que c'est peut-être un fournisseur aussi
        // Pour être sûr, on exclut aussi ces cas
        if (hasSupplierIcon || hasSupplierDescription) {
          return false // Exclure par précaution
        }
        
        // Sinon, c'est une ressource PDF normale → GARDER
        return true
      })
      
      setSections(pdfSections)
    } catch (error) {
      console.error('Erreur lors du chargement des sections:', error)
      setSections([])
    } finally {
      setLoading(false)
    }
  }

  // Charger les PDFs par section avec contrôle d'accès
  const loadPdfSections = async () => {
    try {
      setLoadingPdfSections(true)
      
      // Définir les sections accessibles selon le pack
      const accessibleSections = []
      if (productId === 'STFOUR') {
        // Pack 1 : Aucun PDF (retiré)
        // accessibleSections.push('REVENUE_ACTIF', 'REVENUE_PASSIF')
      } else if (productId === 'GLBNS') {
        // Pack 2 : Toutes les sections
        accessibleSections.push('EXPATRIATION', 'REVENUE_ACTIF', 'REVENUE_PASSIF')
      }

      if (accessibleSections.length === 0) {
        setPdfSections({})
        return
      }

      // Charger tous les PDFs des sections accessibles
      const { data, error } = await supabase
        .from('pdf_sections')
        .select('*')
        .in('section_type', accessibleSections)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Erreur Supabase lors du chargement des PDFs:', error)
        // Si la table n'existe pas, on initialise avec un objet vide (pas d'erreur visible pour l'utilisateur)
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === 'PGRST116') {
          console.warn('⚠️ La table pdf_sections n\'existe pas encore. Veuillez exécuter le script SQL fourni dans sql/create_pdf_sections_table.sql')
          // Initialiser avec des tableaux vides pour chaque section
          const emptyGrouped = {}
          accessibleSections.forEach(sectionType => {
            emptyGrouped[sectionType] = []
          })
          setPdfSections(emptyGrouped)
          return
        }
        // Pour les autres erreurs, on initialise aussi avec un objet vide
        setPdfSections({})
        return
      }

      console.log('📄 PDFs chargés:', data)

      // Grouper par section_type
      const grouped = {}
      accessibleSections.forEach(sectionType => {
        grouped[sectionType] = (data || []).filter(pdf => pdf.section_type === sectionType)
      })

      console.log('📚 PDFs groupés par section:', grouped)
      setPdfSections(grouped)
    } catch (error) {
      console.error('Erreur lors du chargement des PDFs par section:', error)
      setPdfSections({})
    } finally {
      setLoadingPdfSections(false)
    }
  }

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true)
      
      // Charger les sections qui sont des fournisseurs
      // Pour STFOUR, on charge depuis STFOUR et GLBNS (si les fournisseurs sont dans GLBNS)
      // Pour GLBNS, on charge depuis GLBNS
      const packIdsToLoad = productId === 'STFOUR' ? ['STFOUR', 'GLBNS'] : ['GLBNS']
      
      let allSupplierSections = []
      for (const packId of packIdsToLoad) {
        const { data: supplierSections, error: sectionsError } = await supabase
          .from('pack_sections')
          .select('*')
          .eq('pack_id', packId)
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (sectionsError) throw sectionsError
        if (supplierSections) {
          allSupplierSections = [...allSupplierSections, ...supplierSections]
        }
      }
      
      // Supprimer les doublons basés sur l'ID
      const uniqueSupplierSections = allSupplierSections.filter((section, index, self) =>
        index === self.findIndex(s => s.id === section.id)
      )

      // Filtrer les sections qui sont des fournisseurs
      // Un fournisseur est identifié par :
      // 1. Format titre: "Nom - Type" (avec au moins 2 parties)
      // 2. Icon_name: 'FaGlobe' (utilisé pour les fournisseurs)
      // 3. Description contient des emojis 📍 📞 ✉️ 🏢
      const publishedSuppliers = []
      
      if (uniqueSupplierSections) {
        for (const section of uniqueSupplierSections) {
          const parts = section.title.split(' - ')
          const hasSupplierFormat = parts.length >= 2
          const hasSupplierIcon = section.icon_name === 'FaGlobe'
          const hasSupplierDescription = section.description && (
            section.description.includes('📍') ||
            section.description.includes('📞') ||
            section.description.includes('✉️') ||
            section.description.includes('🏢')
          )
          
          // Si c'est un fournisseur (au moins 2 critères remplis)
          const isSupplier = (hasSupplierFormat && hasSupplierIcon) || 
                            (hasSupplierFormat && hasSupplierDescription) ||
                            (hasSupplierIcon && hasSupplierDescription)
          
          if (isSupplier) {
            // Extraire le nom et le type
            const supplierName = parts.length >= 2 ? parts[0] : section.title
            const supplierType = parts.length >= 2 ? parts.slice(1).join(' - ') : null
            
            // Extraire les infos depuis la description
            const description = section.description || ''
            const countryMatch = description.match(/📍\s*([^\n]+)/)
            const phoneMatch = description.match(/📞\s*([^\n]+)/)
            const emailMatch = description.match(/✉️\s*([^\n]+)/)
            const addressMatch = description.match(/🏢\s*([^\n]+)/)
            
            // Vérifier si c'est un fournisseur vedette (⭐ dans la description)
            const isFeatured = description.includes('⭐')
            
            const supplier = {
              id: section.id,
              name: supplierName,
              supplier_type: supplierType,
              country: countryMatch ? countryMatch[1].trim() : null,
              phone: phoneMatch ? phoneMatch[1].trim() : null,
              email: emailMatch ? emailMatch[1].trim() : null,
              address: addressMatch ? addressMatch[1].trim() : null,
              website: section.pdf_url,
              is_featured: isFeatured,
              section: section
            }
            
            publishedSuppliers.push(supplier)
          }
        }
      }

      setSuppliers(publishedSuppliers)
      
      // Extraire les types de fournisseurs uniques de la base de données
      const uniqueTypes = [...new Set(publishedSuppliers.map(s => s.supplier_type).filter(Boolean))]
      setAvailableSupplierTypes(uniqueTypes)
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error)
      setSuppliers([])
      setAvailableSupplierTypes([])
    } finally {
      setLoadingSuppliers(false)
    }
  }

  const handleDeleteSupplier = async (supplierId, supplierName) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir supprimer${supplierName ? ` "${supplierName}"` : ''} de la liste des fournisseurs ?`
      )
      if (!confirmed) {
        return
      }
    }

    try {
      const { error } = await supabase
        .from('pack_sections')
        .delete()
        .eq('id', supplierId)

      if (error) throw error

      setSupplierActionMessage({
        type: 'success',
        text: `Fournisseur${supplierName ? ` "${supplierName}"` : ''} supprimé avec succès.`
      })
      setFavorites(prev => prev.filter(id => id !== supplierId))
      await loadSuppliers()
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur:', error)
      setSupplierActionMessage({
        type: 'error',
        text: 'Erreur lors de la suppression du fournisseur.'
      })
    }
  }
  
  // Fonction pour obtenir les catégories à afficher
  // Combine les catégories de base avec les types réels de la base de données
  const supplierCategories = useMemo(() => {
    // Toujours afficher les catégories de base (même si elles n'ont pas de fournisseurs pour l'instant)
    const categoriesToDisplay = [...baseSupplierCategories]
    
    // Ajouter les types de la DB qui ne sont pas déjà couverts par une catégorie de base
    availableSupplierTypes.forEach(dbType => {
      if (!dbType) return
      
      const normalized = dbType.toLowerCase().trim()
      // Vérifier si ce type n'est pas déjà couvert par une catégorie de base
      let isCovered = false
      for (const baseCat of baseSupplierCategories) {
        const baseNormalized = baseCat.toLowerCase().trim()
        // Vérifier si le type de la DB correspond exactement ou partiellement à une catégorie de base
        if (normalized === baseNormalized || 
            normalized.includes(baseNormalized) || 
            baseNormalized.includes(normalized)) {
          isCovered = true
          break
        }
      }
      // Si ce type n'est pas couvert, l'ajouter
      if (!isCovered && !categoriesToDisplay.includes(dbType)) {
        categoriesToDisplay.push(dbType)
      }
    })
    
    // Garder l'ordre : d'abord les catégories de base (dans l'ordre donné), puis les autres triées
    const baseCategories = baseSupplierCategories
    const otherCategories = categoriesToDisplay.filter(cat => !baseSupplierCategories.includes(cat)).sort()
    
    return [...baseCategories, ...otherCategories]
  }, [baseSupplierCategories, availableSupplierTypes])

  // Si le packId n'est pas valide, rediriger
  if (!productId) {
    return <Navigate to="/dashboard" replace />
  }

  const product = products.find(p => p.id === productId)

  // Si le produit n'existe pas, rediriger
  if (!product) {
    return <Navigate to="/dashboard" replace />
  }

  // Vérifier l'accès
  if (!hasProductAccess(productId)) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès non autorisé
          </h2>
          <p className="text-gray-600">
            Vous n'avez pas accès à ce pack. Veuillez contacter le support si vous pensez qu'il s'agit d'une erreur.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const getIcon = (iconName) => {
    return Icons[iconName] || FaFileAlt
  }

  // Fonction helper pour matcher une catégorie
  const matchesCategory = (supplierType, categoryName) => {
    if (!supplierType) return false
    const supplierTypeLower = supplierType.toLowerCase()
    const categoryLower = categoryName.toLowerCase()
    return supplierTypeLower === categoryLower || 
           supplierTypeLower.includes(categoryLower) ||
           categoryLower.includes(supplierTypeLower)
  }

  // Fonction helper pour obtenir les fournisseurs d'une catégorie
  const getSuppliersByCategory = (categoryName) => {
    return suppliers.filter(s => matchesCategory(s.supplier_type, categoryName))
  }

useEffect(() => {
  if (!selectedCategory) {
    return
  }

  const categorySuppliers = getSuppliersByCategory(selectedCategory).filter(supplier => {
    const matchesCountry = !supplierFilters.country || supplier.country === supplierFilters.country
    return matchesCountry
  })

  const maxPage = Math.max(1, Math.ceil(categorySuppliers.length / SUPPLIERS_PER_PAGE))
  if (supplierPage > maxPage) {
    setSupplierPage(maxPage)
  }
}, [selectedCategory, supplierFilters.country, suppliers, supplierPage])

  // Grouper les fournisseurs par catégorie
  const suppliersByCategory = useMemo(() => {
    const grouped = {}
    suppliers.forEach(supplier => {
      const category = supplier.supplier_type || 'Autres'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(supplier)
    })
    return grouped
  }, [suppliers])

  // Obtenir les catégories et pays uniques pour les filtres
  const availableCategories = useMemo(() => {
    const categories = [...new Set(suppliers.map(s => s.supplier_type).filter(Boolean))].sort()
    return categories
  }, [suppliers])

  const availableCountries = useMemo(() => {
    const countries = [...new Set(suppliers.map(s => s.country).filter(Boolean))].sort()
    return countries
  }, [suppliers])

  // Empêcher le copier-coller sur toute la section fournisseurs
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Empêcher Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X, Ctrl+S, F12, Ctrl+Shift+I
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'x' || e.key === 's' || e.key === 'i')
      ) {
        const target = e.target
        // Vérifier si on est dans une section fournisseur
        if (target.closest('[data-supplier-section]')) {
          e.preventDefault()
          return false
        }
      }
      // Empêcher F12 (DevTools)
      if (e.key === 'F12') {
        const target = e.target
        if (target.closest('[data-supplier-section]')) {
          e.preventDefault()
          return false
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {product.description}
          </p>
        </div>

        {/* Sections PDF par catégorie (EXPATRIATION, Revenue Actif, Revenue Passif) - Uniquement pour Pack 2 */}
        {productId === 'GLBNS' && (
        <div className="space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FaFileAlt className="text-lg sm:text-xl text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Ressources PDF</h2>
            </div>

          {loadingPdfSections ? (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
              <p className="text-gray-600">Chargement des PDFs...</p>
              </div>
          ) : !selectedPdfCategory ? (
            /* Affichage des cards de catégories */
            <div>
              <p className="text-gray-600 mb-6">
                Sélectionnez une catégorie pour voir les PDFs disponibles
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Card EXPATRIATION */}
                {productId === 'GLBNS' && renderPdfCategoryCard('EXPATRIATION', 'EXPATRIATION')}

                {/* Card Revenue Actif */}
                {(productId === 'STFOUR' || productId === 'GLBNS') && renderPdfCategoryCard('REVENUE_ACTIF', 'Revenue Actif')}

                {/* Card Revenue Passif */}
                {(productId === 'STFOUR' || productId === 'GLBNS') && renderPdfCategoryCard('REVENUE_PASSIF', 'Revenue Passif')}
              </div>
              </div>
            ) : (
            /* Affichage des PDFs de la catégorie sélectionnée */
            <div className="space-y-4">
              {/* Bouton retour */}
              <button
                onClick={() => setSelectedPdfCategory(null)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium mb-4"
              >
                <FaTimes className="text-sm" />
                Retour aux catégories
              </button>

              {/* Titre de la catégorie */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-8 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedPdfCategory === 'EXPATRIATION' && 'Expatriation'}
                  {selectedPdfCategory === 'REVENUE_ACTIF' && 'Revenue Actif'}
                  {selectedPdfCategory === 'REVENUE_PASSIF' && 'Revenue Passif'}
                </h3>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {(() => {
                    const pdfs = pdfSections[selectedPdfCategory] || []
                    return `${pdfs.length} PDF${pdfs.length !== 1 ? 's' : ''}`
                  })()}
                </span>
              </div>

              {/* Liste des PDFs de la catégorie */}
              {(() => {
                const categoryPdfs = pdfSections[selectedPdfCategory] || []
                
                return categoryPdfs.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                    <p className="text-gray-600">
                      Aucun PDF disponible pour cette catégorie.
                    </p>
                    {isAdmin() && (
                      <p className="text-sm text-gray-500 mt-2">
                        Accédez à la page <strong>"PDFs par Section"</strong> pour ajouter des PDFs.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {categoryPdfs.map((pdf, index) => {
                      const isExpanded = expandedPdf === pdf.id
                      const categoryImage = getPdfCategoryImage(selectedPdfCategory)
                      return (
                        <motion.div
                          key={pdf.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                          {categoryImage && (
                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundImage: `url(${categoryImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                              }}
                            ></div>
                          )}
                          {/* Pas d'overlay pour laisser l'image visible */}

                          <div className="relative p-4 sm:p-6">
                            <div className="flex items-start gap-3 sm:gap-4 mb-3">
                              <div className="p-2 sm:p-3 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                                <FaFileAlt className="text-lg sm:text-xl" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base sm:text-lg font-bold mb-1 break-words" style={pdfTextStyle}>
                                  {pdf.title}
                                </h4>
                                {pdf.description && (
                                  <p className="text-xs sm:text-sm line-clamp-2" style={pdfTextStyle}>
                                    {pdf.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => setExpandedPdf(expandedPdf === pdf.id ? null : pdf.id)}
                                className="w-full px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-xs sm:text-sm flex items-center justify-center gap-2"
                              >
                                {isExpanded ? (
                                  <>
                                    <FaTimes />
                                    Masquer
                                  </>
                                ) : (
                                  <>
                                    <FaEye />
                                    Voir le PDF
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-t border-gray-200 overflow-hidden"
                              >
                                <div className="p-4 bg-gray-50">
                                  <div className="relative w-full" style={{ minHeight: '600px', height: '80vh' }}>
                                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                                      <button
                                        onClick={() => setFullscreenPdf(pdf.id)}
                                        className="px-3 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                                        title="Plein écran"
                                      >
                                        <FaExpand />
                                      </button>
                                    </div>
                                    {pdf.pdf_url.includes('gamma.app') ? (
                                      <iframe
                                        src={pdf.pdf_url}
                                        className="w-full h-full border-0 rounded-lg"
                                        title={pdf.title}
                                        style={{ minHeight: '600px' }}
                                        allow="fullscreen"
                                      />
                                    ) : (
                                      <iframe
                                        src={pdf.pdf_url}
                                        className="w-full h-full border-0 rounded-lg"
                                        title={pdf.title}
                                        style={{ minHeight: '600px' }}
                                      />
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
              </div>
                )
              })()}
              </div>
            )}
          </div>
        )}

        {/* Section Fournisseurs - Pour les deux packs */}
        {(productId === 'GLBNS' || productId === 'STFOUR') && (
          <div className="space-y-4 mt-8" data-supplier-section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FaBuilding className="text-xl text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Nos Fournisseurs</h2>
            </div>

            {supplierActionMessage.text && (
              <div
                className={`p-4 rounded-lg border ${
                  supplierActionMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {supplierActionMessage.text}
              </div>
            )}

            {!selectedCategory ? (
              /* Affichage des cards de catégories */
              <div>
                <p className="text-gray-600 mb-6">
                  Sélectionnez une catégorie pour voir les fournisseurs disponibles
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {supplierCategories.map((category, index) => {
                    const categorySuppliers = getSuppliersByCategory(category)
                    const count = categorySuppliers.length
                    
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectCategory(category)}
                        className="relative rounded-lg border-2 border-gray-200 hover:border-primary shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group h-32 sm:h-40"
                        style={{
                          backgroundImage: getCategoryImage(category) 
                            ? `url(${getCategoryImage(category)})` 
                            : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        {/* Overlay pour améliorer la lisibilité du texte */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 group-hover:from-black/80 group-hover:via-black/50 group-hover:to-black/30 transition-all"></div>
                        
                        {/* Fallback si pas d'image */}
                        {!getCategoryImage(category) && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <FaBuilding className="text-4xl sm:text-5xl text-primary opacity-50" />
                          </div>
                        )}
                        
                        {/* Contenu texte */}
                        <div className="relative h-full flex flex-col justify-end p-4 sm:p-6 text-white">
                          <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 break-words drop-shadow-lg">
                            {category}
                          </h3>
                          <span className="text-xs sm:text-sm drop-shadow-md">
                            {count} fournisseur{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Affichage des fournisseurs de la catégorie sélectionnée */
              <div className="space-y-4">
                {/* Bouton retour */}
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    handleResetSupplierFilters()
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium mb-4"
                >
                  <FaTimes className="text-sm" />
                  Retour aux catégories
                </button>

                {/* Titre de la catégorie */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-8 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCategory}</h3>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {(() => {
                      const count = getSuppliersByCategory(selectedCategory).filter(supplier => {
                        const matchesCountry = !supplierFilters.country || supplier.country === supplierFilters.country
                        return matchesCountry
                      }).length
                      return `${count} fournisseur${count !== 1 ? 's' : ''}`
                    })()}
                  </span>
                </div>

                {/* Filtres */}
                {availableCountries.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FaFilter className="text-primary" />
                      <h3 className="text-sm font-semibold text-gray-900">Filtres</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pays
                        </label>
                        <select
                          value={supplierFilters.country}
                          onChange={(e) => handleSupplierCountryChange(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Tous les pays</option>
                          {availableCountries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleResetSupplierFilters}
                          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                          Réinitialiser
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Liste des fournisseurs de la catégorie */}
                {loadingSuppliers ? (
                  <div className="text-center py-12">
                    <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Chargement des fournisseurs...</p>
                  </div>
                ) : (() => {
                  let categorySuppliers = getSuppliersByCategory(selectedCategory).filter(supplier => {
                    const matchesCountry = !supplierFilters.country || supplier.country === supplierFilters.country
                    return matchesCountry
                  })
                  
                  // Trier : vedettes en premier, puis favoris, puis les autres
                  categorySuppliers.sort((a, b) => {
                    const aFeatured = a.is_featured ? 1 : 0
                    const bFeatured = b.is_featured ? 1 : 0
                    const aFavorite = favorites.includes(a.id) ? 1 : 0
                    const bFavorite = favorites.includes(b.id) ? 1 : 0
                    
                    // D'abord par vedette
                    if (aFeatured !== bFeatured) return bFeatured - aFeatured
                    // Puis par favoris
                    if (aFavorite !== bFavorite) return bFavorite - aFavorite
                    // Enfin par nom
                    return a.name.localeCompare(b.name)
                  })

                  const totalSuppliersInCategory = categorySuppliers.length
                  const totalPages = Math.max(1, Math.ceil(totalSuppliersInCategory / SUPPLIERS_PER_PAGE))
                  const safePage = Math.min(supplierPage, totalPages)
                  const startIndex = (safePage - 1) * SUPPLIERS_PER_PAGE
                  const paginatedSuppliers = categorySuppliers.slice(
                    startIndex,
                    startIndex + SUPPLIERS_PER_PAGE
                  )

                  return totalSuppliersInCategory === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                      <p className="text-gray-600">
                        {supplierFilters.country 
                          ? 'Aucun fournisseur ne correspond aux filtres sélectionnés.'
                          : 'Aucun fournisseur disponible pour cette catégorie.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {paginatedSuppliers.map((supplier, index) => (
                        <motion.div
                          key={supplier.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 select-none ${
                            supplier.is_featured 
                              ? 'border-yellow-400 bg-gradient-to-br from-yellow-50/50 to-white' 
                              : 'border-gray-200'
                          }`}
                          onContextMenu={(e) => e.preventDefault()}
                          onCopy={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3 rounded-lg ${supplier.is_featured ? 'bg-yellow-100' : 'bg-primary/10'} text-primary`}>
                              <FaBuilding className="text-xl" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 
                                  className="text-lg font-semibold text-gray-900 select-none"
                                  onContextMenu={(e) => e.preventDefault()}
                                  onCopy={(e) => e.preventDefault()}
                                >
                                  {supplier.name}
                                </h4>
                                {supplier.is_featured && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                    <FaStar className="text-xs" />
                                    Vedette
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleFavorite(supplier.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  favorites.includes(supplier.id)
                                    ? 'text-yellow-500 bg-yellow-50'
                                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50/50'
                                }`}
                                title={favorites.includes(supplier.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                              >
                                <FaStar className={favorites.includes(supplier.id) ? 'fill-current' : ''} />
                              </button>
                              {isAdmin() && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                                  className="p-2 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                                  title="Supprimer ce fournisseur"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          </div>

                          <div 
                            className="space-y-2 text-sm text-gray-600"
                            onContextMenu={(e) => e.preventDefault()}
                            onCopy={(e) => e.preventDefault()}
                            onCut={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                          >
                            {supplier.country && (
                              <div className="flex items-center gap-2 select-none">
                                <FaMapMarkerAlt className="text-primary flex-shrink-0" />
                                <span className="user-select-none">{supplier.country}</span>
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center gap-2 select-none">
                                <FaPhone className="text-primary flex-shrink-0" />
                                <span 
                                  className="hover:text-primary transition-colors break-all cursor-pointer"
                                  onClick={() => window.location.href = `tel:${supplier.phone}`}
                                  onContextMenu={(e) => e.preventDefault()}
                                >
                                  {supplier.phone}
                                </span>
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-2 select-none">
                                <FaEnvelope className="text-primary flex-shrink-0" />
                                <span 
                                  className="hover:text-primary transition-colors break-all cursor-pointer"
                                  onClick={() => window.location.href = `mailto:${supplier.email}`}
                                  onContextMenu={(e) => e.preventDefault()}
                                >
                                  {supplier.email}
                                </span>
                              </div>
                            )}
                            {supplier.website && (
                              <div className="flex items-center gap-2 select-none">
                                <FaGlobe className="text-primary flex-shrink-0" />
                                <span 
                                  className="hover:text-primary transition-colors break-all text-blue-600 cursor-pointer"
                                  onClick={() => window.open(supplier.website, '_blank', 'noopener,noreferrer')}
                                  onContextMenu={(e) => e.preventDefault()}
                                >
                                  Visiter le site
                                </span>
                              </div>
                            )}
                            {supplier.address && (
                              <div className="flex items-start gap-2 mt-2 select-none">
                                <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                                <span className="text-xs user-select-none">{supplier.address}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border border-gray-200 rounded-lg p-3 sm:p-4">
                        <p className="text-sm text-gray-600">
                          Affichage {startIndex + 1} - {Math.min(startIndex + SUPPLIERS_PER_PAGE, totalSuppliersInCategory)} sur {totalSuppliersInCategory}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSupplierPage(prev => Math.max(1, prev - 1))}
                            disabled={safePage === 1}
                            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Précédent
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {safePage} / {totalPages}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSupplierPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={safePage === totalPages}
                            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Suivant
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal plein écran pour le PDF */}
      <AnimatePresence>
        {fullscreenPdf && (() => {
          const pdf = Object.values(pdfSections)
            .flat()
            .find(p => p.id === fullscreenPdf)
          
          if (!pdf) return null
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black"
            >
              <div className="relative w-full h-full">
                <button
                  onClick={() => setFullscreenPdf(null)}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-colors text-sm sm:text-base font-medium flex items-center gap-1 sm:gap-2"
                >
                  <FaCompress className="text-sm sm:text-base" />
                  <span className="hidden sm:inline">Quitter le plein écran</span>
                  <span className="sm:hidden">Fermer</span>
                </button>
                <div className="w-full h-full">
                  {pdf.pdf_url.includes('gamma.app') ? (
                    <iframe
                      src={pdf.pdf_url}
                      className="w-full h-full border-0"
                      title={pdf.title}
                      allow="fullscreen"
                    />
                  ) : (
                    <iframe
                      src={pdf.pdf_url}
                      className="w-full h-full border-0"
                      title={pdf.title}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default React.memo(DashboardPack)

