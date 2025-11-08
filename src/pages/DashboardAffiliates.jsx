import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaTrash, FaEdit, FaPlus, FaSave, FaTimes, FaSpinner, FaCreditCard, FaUserTag } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useAffiliate } from '../context/AffiliateContext'
import { supabase } from '../config/supabase'
import DashboardLayout from '../components/DashboardLayout'

const DashboardAffiliates = () => {
  const { isAdmin } = useAuth()
  const { affiliates, paymentPages, updateAffiliateConfig } = useAffiliate()
  const [localAffiliates, setLocalAffiliates] = useState({})
  const [localPaymentPages, setLocalPaymentPages] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPaymentPages, setShowPaymentPages] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [editForm, setEditForm] = useState({
    code: '',
    stfour: '',
    glbns: ''
  })
  const [paymentForm, setPaymentForm] = useState({
    product: '',
    url: ''
  })

  useEffect(() => {
    if (isAdmin()) {
      // Charger en parallèle pour plus de rapidité
      Promise.all([loadAffiliates(), loadPaymentPages()])
    }
  }, [isAdmin]) // Supprimer les dépendances affiliates et paymentPages pour éviter les rechargements

  const loadAffiliates = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('affiliate_config')
        .select('config_value')
        .eq('config_key', 'affiliates')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur:', error)
        setLocalAffiliates(affiliates || {})
        return
      }

      if (data?.config_value) {
        setLocalAffiliates(data.config_value)
      } else {
        setLocalAffiliates(affiliates || {})
      }
    } catch (error) {
      console.error('Erreur:', error)
      setLocalAffiliates(affiliates || {})
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentPages = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_config')
        .select('config_value')
        .eq('config_key', 'defaultPages')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur:', error)
        setLocalPaymentPages(paymentPages || {})
        return
      }

      if (data?.config_value) {
        setLocalPaymentPages(data.config_value)
      } else {
        setLocalPaymentPages(paymentPages || {})
      }
    } catch (error) {
      console.error('Erreur:', error)
      setLocalPaymentPages(paymentPages || {})
    }
  }

  const handleSave = async (affiliatesToSave = null, paymentPagesToSave = null) => {
    try {
      setSaving(true)
      
      const affiliatesData = affiliatesToSave !== null ? affiliatesToSave : localAffiliates
      const paymentPagesData = paymentPagesToSave !== null ? paymentPagesToSave : localPaymentPages

      // Mettre à jour le state local immédiatement
      if (affiliatesToSave !== null) {
        setLocalAffiliates(affiliatesToSave)
      }
      if (paymentPagesToSave !== null) {
        setLocalPaymentPages(paymentPagesToSave)
      }

      const result = await updateAffiliateConfig(
        affiliatesData,
        paymentPagesData
      )

      if (result.success) {
        // Recharger depuis la base pour confirmer
        await loadAffiliates()
        await loadPaymentPages()
        return true
      } else {
        // En cas d'erreur, recharger depuis la base
        await loadAffiliates()
        await loadPaymentPages()
        alert('Erreur lors de la sauvegarde: ' + (result.error?.message || 'Erreur inconnue'))
        return false
      }
    } catch (error) {
      console.error('Erreur:', error)
      // En cas d'erreur, recharger depuis la base
      await loadAffiliates()
      await loadPaymentPages()
      alert('Erreur: ' + error.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (code) => {
    const affiliate = localAffiliates[code]
    setEditing(code)
    setEditForm({
      code: code,
      stfour: affiliate?.STFOUR || '',
      glbns: affiliate?.GLBNS || ''
    })
    setShowAddForm(false)
  }

  const handleDelete = async (code) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'influenceur "${code}" ?`)) {
      return
    }

    const newAffiliates = { ...localAffiliates }
    delete newAffiliates[code]
    setLocalAffiliates(newAffiliates)
    const success = await handleSave(newAffiliates, null)
    if (success) {
      alert('Influenceur supprimé avec succès')
    }
  }

  const handleAdd = () => {
    setShowAddForm(true)
    setEditing(null)
    setShowPaymentPages(false)
    setEditForm({ code: '', stfour: '', glbns: '' })
  }

  const handleSaveEdit = async () => {
    const newAffiliates = { ...localAffiliates }
    
    if (editing) {
      // Modification
      if (editForm.code !== editing) {
        // Le code a changé, supprimer l'ancien et créer le nouveau
        delete newAffiliates[editing]
      }
      newAffiliates[editForm.code] = {
        STFOUR: editForm.stfour,
        GLBNS: editForm.glbns
      }
    } else {
      // Ajout
      newAffiliates[editForm.code] = {
        STFOUR: editForm.stfour,
        GLBNS: editForm.glbns
      }
    }

    const success = await handleSave(newAffiliates, null)
    if (success) {
      setEditing(null)
      setShowAddForm(false)
      setEditForm({ code: '', stfour: '', glbns: '' })
      alert(editing ? 'Influenceur modifié avec succès' : 'Influenceur ajouté avec succès')
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setShowAddForm(false)
    setEditingPayment(null)
    setShowPaymentPages(false)
    setEditForm({ code: '', stfour: '', glbns: '' })
    setPaymentForm({ product: '', url: '' })
    loadAffiliates()
    loadPaymentPages()
  }

  // Gestion des pages de paiement
  const handleEditPayment = (product) => {
    setEditingPayment(product)
    setPaymentForm({
      product: product,
      url: localPaymentPages[product] || ''
    })
    setShowPaymentPages(true)
    setShowAddForm(false)
    setEditing(null)
  }

  const handleAddPayment = () => {
    setShowPaymentPages(true)
    setEditingPayment(null)
    setPaymentForm({ product: '', url: '' })
    setShowAddForm(false)
    setEditing(null)
  }

  const handleSavePayment = async () => {
    const newPaymentPages = { ...localPaymentPages }
    newPaymentPages[paymentForm.product] = paymentForm.url
    
    const success = await handleSave(null, newPaymentPages)
    if (success) {
      setEditingPayment(null)
      setShowPaymentPages(false)
      setPaymentForm({ product: '', url: '' })
      alert('Page de paiement sauvegardée avec succès')
    }
  }

  const handleDeletePayment = async (product) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la page de paiement pour "${product}" ?`)) {
      return
    }

    const newPaymentPages = { ...localPaymentPages }
    delete newPaymentPages[product]
    setLocalPaymentPages(newPaymentPages)
    const success = await handleSave(null, newPaymentPages)
    if (success) {
      alert('Page de paiement supprimée avec succès')
    }
  }

  if (!isAdmin()) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Accès refusé. Administrateur requis.</p>
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
              Gestion des Influenceurs & Pages de Paiement
            </h1>
            <p className="text-gray-600">
              Gérez les influenceurs ({Object.keys(localAffiliates).length}) et les pages de paiement ({Object.keys(localPaymentPages).length})
            </p>
          </div>
          {!showAddForm && !editing && !showPaymentPages && (
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
              >
                <FaPlus />
                Ajouter un influenceur
              </button>
              <button
                onClick={handleAddPayment}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
              >
                <FaCreditCard />
                Ajouter une page de paiement
              </button>
            </div>
          )}
        </div>

        {/* Formulaire de pages de paiement */}
        {showPaymentPages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCreditCard className="text-primary" />
              {editingPayment ? 'Modifier la page de paiement' : 'Ajouter une page de paiement'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produit (STFOUR ou GLBNS)
                </label>
                <select
                  value={paymentForm.product}
                  onChange={(e) => setPaymentForm({ ...paymentForm, product: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={!!editingPayment}
                >
                  <option value="">Sélectionner un produit</option>
                  <option value="STFOUR">STFOUR - Pack Global Sourcing</option>
                  <option value="GLBNS">GLBNS - Pack Global Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la page de paiement
                </label>
                <input
                  type="url"
                  value={paymentForm.url}
                  onChange={(e) => setPaymentForm({ ...paymentForm, url: e.target.value })}
                  placeholder="https://example.com/payment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSavePayment}
                  disabled={!paymentForm.product || !paymentForm.url || saving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Sauvegarder
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <FaTimes />
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Formulaire d'ajout/modification influenceurs */}
        {(showAddForm || editing) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? 'Modifier l\'influenceur' : 'Ajouter un influenceur'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de l'influenceur (ex: APPLE, MIC)
                </label>
                <input
                  type="text"
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                  placeholder="APPLE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={!!editing} // Ne pas modifier le code en édition
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien STFOUR (Pack Global Sourcing)
                </label>
                <input
                  type="url"
                  value={editForm.stfour}
                  onChange={(e) => setEditForm({ ...editForm, stfour: e.target.value })}
                  placeholder="https://example.com/stfour"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien GLBNS (Pack Global Business)
                </label>
                <input
                  type="url"
                  value={editForm.glbns}
                  onChange={(e) => setEditForm({ ...editForm, glbns: e.target.value })}
                  placeholder="https://example.com/glbns"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editForm.code || !editForm.stfour || !editForm.glbns || saving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Sauvegarder
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <FaTimes />
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Liste des influenceurs */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-primary" />
          </div>
        ) : (
          <>
            {/* Section Influenceurs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaUserTag className="text-primary" />
                  Influenceurs ({Object.keys(localAffiliates).length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lien STFOUR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lien GLBNS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.keys(localAffiliates).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          Aucun influenceur configuré
                        </td>
                      </tr>
                    ) : (
                      Object.entries(localAffiliates).map(([code, links]) => (
                        <tr key={code}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">{code}</span>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={links.STFOUR}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline truncate block max-w-md"
                            >
                              {links.STFOUR}
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={links.GLBNS}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline truncate block max-w-md"
                            >
                              {links.GLBNS}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(code)}
                              disabled={editing || showAddForm || showPaymentPages}
                              className="text-primary hover:text-secondary disabled:opacity-50"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(code)}
                              disabled={editing || showAddForm || showPaymentPages || saving}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Supprimer"
                            >
                              {saving ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section Pages de paiement */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaCreditCard className="text-primary" />
                  Pages de paiement par défaut ({Object.keys(localPaymentPages).length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL de la page de paiement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.keys(localPaymentPages).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          Aucune page de paiement configurée
                        </td>
                      </tr>
                    ) : (
                      Object.entries(localPaymentPages).map(([product, url]) => (
                        <tr key={product}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                              {product === 'STFOUR' ? 'Pack Global Sourcing' : 'Pack Global Business'}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">({product})</span>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline truncate block max-w-md"
                            >
                              {url}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditPayment(product)}
                              disabled={editing || showAddForm || showPaymentPages}
                              className="text-primary hover:text-secondary disabled:opacity-50"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeletePayment(product)}
                              disabled={editing || showAddForm || showPaymentPages || saving}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Supprimer"
                            >
                              {saving ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardAffiliates)

