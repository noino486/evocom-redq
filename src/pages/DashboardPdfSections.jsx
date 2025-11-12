import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner,
  FaFileAlt, FaDownload, FaEye
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'

// Sections PDF disponibles
const PDF_SECTIONS = [
  { id: 'EXPATRIATION', name: 'EXPATRIATION', allowedPacks: ['GLBNS'] },
  { id: 'REVENUE_ACTIF', name: 'Revenue Actif', allowedPacks: ['STFOUR', 'GLBNS'] },
  { id: 'REVENUE_PASSIF', name: 'Revenue Passif', allowedPacks: ['STFOUR', 'GLBNS'] }
]

const DashboardPdfSections = () => {
  const { isAdmin, isSupportOrAdmin, user } = useAuth()
  const [pdfs, setPdfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState('EXPATRIATION')
  const [editingPdf, setEditingPdf] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pdf_url: '',
    section_type: 'EXPATRIATION',
    display_order: 0,
    is_active: true
  })
  const [message, setMessage] = useState({ type: '', text: '' })

useEffect(() => {
  if (isSupportOrAdmin()) {
    loadPdfs()
  }
}, [selectedSection, isSupportOrAdmin])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadPdfs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pdf_sections')
        .select('*')
        .eq('section_type', selectedSection)
        .order('display_order', { ascending: true })

      if (error) throw error
      setPdfs(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des PDFs:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des PDFs' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.pdf_url) {
      setMessage({ type: 'error', text: 'Le titre et l\'URL PDF sont requis' })
      return
    }

    try {
      const pdfData = {
        ...formData,
        updated_by: user?.id
      }

      if (editingPdf) {
        // Mise à jour
        const { error } = await supabase
          .from('pdf_sections')
          .update(pdfData)
          .eq('id', editingPdf.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'PDF mis à jour avec succès' })
      } else {
        // Création
        const { error } = await supabase
          .from('pdf_sections')
          .insert([{ ...pdfData, created_by: user?.id }])

        if (error) throw error
        setMessage({ type: 'success', text: 'PDF créé avec succès' })
      }

      resetForm()
      loadPdfs()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la sauvegarde' })
    }
  }

  const handleEdit = (pdf) => {
    setEditingPdf(pdf)
    setFormData({
      title: pdf.title,
      description: pdf.description || '',
      pdf_url: pdf.pdf_url || '',
      section_type: pdf.section_type || selectedSection,
      display_order: pdf.display_order || 0,
      is_active: pdf.is_active !== false
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce PDF ?')) return

    try {
      const { error } = await supabase
        .from('pdf_sections')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'PDF supprimé avec succès' })
      loadPdfs()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  const resetForm = () => {
    setEditingPdf(null)
    setFormData({
      title: '',
      description: '',
      pdf_url: '',
      section_type: selectedSection,
      display_order: pdfs.length,
      is_active: true
    })
    setShowForm(false)
  }

  if (!isSupportOrAdmin()) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès non autorisé
          </h2>
          <p className="text-gray-600">
            Seuls les membres du support ou les administrateurs peuvent gérer ces PDFs.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestion des PDFs par Section
            </h1>
            <p className="text-gray-600">
              Gérez les PDFs pour chaque section (EXPATRIATION, Revenue Actif, Revenue Passif)
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <FaPlus />
            Ajouter un PDF
          </button>
        </div>

        {/* Sélecteur de section */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section à gérer
          </label>
          <div className="flex gap-4 flex-wrap">
            {PDF_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setSelectedSection(section.id)
                  setFormData(prev => ({ ...prev, section_type: section.id }))
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                  selectedSection === section.id
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'border-primary text-primary hover:bg-primary/10'
                }`}
              >
                {section.name}
                <span className="ml-2 text-xs opacity-75">
                  ({section.allowedPacks.join(', ')})
                </span>
              </button>
            ))}
          </div>
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

        {/* Formulaire */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingPdf ? 'Modifier le PDF' : 'Nouveau PDF'}
              </h2>
              <button
                onClick={resetForm}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  value={formData.section_type}
                  onChange={(e) => {
                    setFormData({ ...formData, section_type: e.target.value })
                    setSelectedSection(e.target.value)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  {PDF_SECTIONS.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name} ({section.allowedPacks.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du PDF * (Gamma ou autre)
                </label>
                <input
                  type="url"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://gamma.app/... ou https://example.com/document.pdf"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                  />
                </div>

                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">PDF actif</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
                >
                  <FaSave />
                  {editingPdf ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium flex items-center gap-2"
                >
                  <FaTimes />
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Liste des PDFs */}
        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
            <p className="text-gray-600">Chargement des PDFs...</p>
          </div>
        ) : pdfs.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-600">Aucun PDF pour cette section. Ajoutez-en un !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pdfs.map((pdf) => (
              <motion.div
                key={pdf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-lg p-4 border ${
                  pdf.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      pdf.is_active ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <FaFileAlt />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pdf.title}</h3>
                      {!pdf.is_active && (
                        <span className="text-xs text-gray-500">Inactif</span>
                      )}
                    </div>
                  </div>
                </div>

                {pdf.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {pdf.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Ordre: {pdf.display_order}</span>
                  <a
                    href={pdf.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <FaEye />
                    Voir PDF
                  </a>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pdf)}
                    className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FaEdit />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(pdf.id)}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardPdfSections)

