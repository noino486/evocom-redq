import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaSpinner, FaTrash, FaEdit, FaSave, FaTimes,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaBuilding,
  FaExternalLinkAlt
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'

const DashboardSuppliers = () => {
  const { isAdmin, profile, hasAccessLevel } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    country: '',
    supplier_type: '',
    status: 'active'
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filters, setFilters] = useState({
    country: '',
    supplier_type: ''
  })

  // Accessible si niveau >= 2 (Pack Global Business) ou admin
  const hasAccess = profile?.is_active && (profile?.access_level >= 2 || isAdmin())

  useEffect(() => {
    if (hasAccess) {
      loadSuppliers()
    }
  }, [hasAccess, filters])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      
      // Charger uniquement les fournisseurs qui ont été PUBLIÉS dans pack_sections
      // (ceux que les admins ont sélectionnés et publiés vers le Pack Global Business)
      const { data: supplierSections, error: sectionsError } = await supabase
        .from('pack_sections')
        .select('*')
        .eq('pack_id', 'GLBNS')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (sectionsError) throw sectionsError

      // Filtrer les sections qui sont des fournisseurs et extraire les infos
      const publishedSuppliers = []
      
      if (supplierSections) {
        for (const section of supplierSections) {
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
            
            const supplier = {
              id: section.id,
              name: supplierName,
              supplier_type: supplierType,
              country: countryMatch ? countryMatch[1].trim() : null,
              phone: phoneMatch ? phoneMatch[1].trim() : null,
              email: emailMatch ? emailMatch[1].trim() : null,
              address: addressMatch ? addressMatch[1].trim() : null,
              website: section.pdf_url,
              status: 'active',
              section: section
            }
            
            // Appliquer les filtres
            let matchesFilter = true
            if (filters.country && supplier.country !== filters.country) {
              matchesFilter = false
            }
            if (filters.supplier_type && supplier.supplier_type !== filters.supplier_type) {
              matchesFilter = false
            }
            
            if (matchesFilter) {
              publishedSuppliers.push(supplier)
            }
          }
        }
      }

      setSuppliers(publishedSuppliers)
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des fournisseurs' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur de la liste publiée ?')) return

    try {
      // Supprimer la section pack_sections (qui représente le fournisseur publié)
      const { error } = await supabase
        .from('pack_sections')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Fournisseur retiré de la liste publiée avec succès' })
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
      supplier_type: supplier.supplier_type || '',
      status: supplier.status || 'active'
    })
  }

  const handleSaveEdit = async () => {
    if (!editingSupplier) return

    try {
      // Reconstruire le titre et la description depuis les données éditées
      const title = `${editForm.name} - ${editForm.supplier_type || 'Fournisseur'}`
      const descriptionParts = []
      if (editForm.country) descriptionParts.push(`📍 ${editForm.country}`)
      if (editForm.phone) descriptionParts.push(`📞 ${editForm.phone}`)
      if (editForm.email) descriptionParts.push(`✉️ ${editForm.email}`)
      if (editForm.address) descriptionParts.push(`🏢 ${editForm.address}`)
      
      const description = descriptionParts.join('\n') || `Fournisseur ${editForm.supplier_type || ''} basé en ${editForm.country || ''}`

      // Mettre à jour la section pack_sections
      const { error } = await supabase
        .from('pack_sections')
        .update({
          title,
          description,
          pdf_url: editForm.website || editingSupplier.website,
          updated_at: new Date().toISOString()
        })
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

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès non autorisé
          </h2>
          <p className="text-gray-600">
            Cette page est réservée aux utilisateurs du Pack Global Business.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  // Obtenir les pays et types uniques pour les filtres
  const countries = [...new Set(suppliers.map(s => s.country).filter(Boolean))].sort()
  const types = [...new Set(suppliers.map(s => s.supplier_type).filter(Boolean))].sort()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Nos Fournisseurs
          </h1>
          <p className="text-gray-600">
            {isAdmin() 
              ? 'Gérez votre base de données de fournisseurs'
              : 'Consultez notre base de données de fournisseurs vérifiés'
            }
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

        {/* Filtres */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par pays
              </label>
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Tous les pays</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par type
              </label>
              <select
                value={filters.supplier_type}
                onChange={(e) => setFilters({ ...filters, supplier_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Tous les types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ country: '', supplier_type: '' })}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </div>

        {/* Liste des fournisseurs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Fournisseurs ({suppliers.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
              <p className="text-gray-600">Chargement des fournisseurs...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Aucun fournisseur trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site web</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingSupplier?.id === supplier.id ? (
                          <input
                            type="url"
                            value={editForm.website}
                            onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          supplier.website ? (
                            <a
                              href={supplier.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              {supplier.website}
                              <FaExternalLinkAlt className="text-xs" />
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingSupplier?.id === supplier.id ? (
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{supplier.phone || '-'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingSupplier?.id === supplier.id ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{supplier.email || '-'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.country || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.supplier_type || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {isAdmin() && (
                          editingSupplier?.id === supplier.id ? (
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
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardSuppliers)

