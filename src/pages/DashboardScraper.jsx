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

// Types de fournisseurs disponibles
const SUPPLIER_TYPES = [
  'Textile',
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
  'Montre',
  'Sac à main',
  'Électronique',
  'Mobilier',
  'Alimentaire',
  'Médical',
  'BTP',
  'Informatique',
  'Sport',
  'Jouets',
  '3D',
  'Impression 3D',
  'Autre'
]

// Pays disponibles
const COUNTRIES = [
  'Chine',
  'Inde',
  'Vietnam',
  'Thaïlande',
  'Indonésie',
  'Turquie',
  'Pakistan',
  'Bangladesh',
  'Philippines',
  'Malaisie',
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
    supplier_type: 'Électronique'
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    status: 'active'
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
    supplier_type: 'Électronique',
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
    if (!formData.country || !formData.supplier_type) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un pays et un type de fournisseur' })
      return
    }

    try {
      setIsScraping(true)
      
      // Créer un job de scraping
      const { data: job, error: jobError } = await supabase
        .from('scraping_jobs')
        .insert([{
          country: formData.country,
          supplier_type: formData.supplier_type,
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
          supplier_type: formData.supplier_type
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
      status: supplier.status || 'active'
    })
  }

  const handleSaveEdit = async () => {
    if (!editingSupplier) return

    try {
      const { error } = await supabase
        .from('suppliers')
        .update(editForm)
        .eq('id', editingSupplier.id)

      if (error) throw error
      
      setMessage({ type: 'success', text: 'Fournisseur mis à jour avec succès' })
      setEditingSupplier(null)
      loadSuppliers()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
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
        .eq('status', 'pending')

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
                    supplier_type: 'Électronique',
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
                  Type de fournisseur
                </label>
                <select
                  value={manualSupplierForm.supplier_type}
                  onChange={(e) => setManualSupplierForm({ ...manualSupplierForm, supplier_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {SUPPLIER_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
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
                        supplier_type: manualSupplierForm.supplier_type,
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
                      supplier_type: 'Électronique',
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
                    supplier_type: 'Électronique',
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                Type de fournisseur
              </label>
              <select
                value={formData.supplier_type}
                onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })}
                disabled={isScraping}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              >
                {SUPPLIER_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                        {editingSupplier?.id === supplier.id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                        {editingSupplier?.id === supplier.id ? (
                          <input
                            type="url"
                            value={editForm.website}
                            onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : supplier.website ? (
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
                        {editingSupplier?.id === supplier.id ? (
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <div className="text-xs sm:text-sm text-gray-900">{supplier.phone || '-'}</div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        {editingSupplier?.id === supplier.id ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <div className="text-xs sm:text-sm text-gray-900">{supplier.email || '-'}</div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {supplier.country || '-'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                        {supplier.supplier_type || '-'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        {editingSupplier?.id === supplier.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={() => setEditingSupplier(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
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
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
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

