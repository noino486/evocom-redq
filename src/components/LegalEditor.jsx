import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaSave, FaPlus, FaTrash, FaEdit, FaEye, FaSpinner } from 'react-icons/fa'
import { useLegal } from '../context/LegalContext'

const LegalEditor = () => {
  const { 
    legalContent, 
    loading, 
    error, 
    updateLegalContent, 
    addArticle, 
    updateArticle, 
    deleteArticle,
    setLegalContent 
  } = useLegal()
  
  const [localContent, setLocalContent] = useState(legalContent)
  const [saving, setSaving] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  // Synchroniser avec le contexte
  React.useEffect(() => {
    setLocalContent(legalContent)
  }, [legalContent])

  const handleSave = async () => {
    try {
      setSaving(true)
      const result = await updateLegalContent(localContent)
      
      if (result.success) {
        alert('✅ Mentions légales sauvegardées avec succès!')
      } else {
        alert('❌ Erreur lors de la sauvegarde: ' + (result.error?.message || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('❌ Erreur lors de la sauvegarde: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleIntroductionChange = (value) => {
    setLocalContent(prev => ({
      ...prev,
      introduction: value
    }))
  }

  const handleLegalInfoChange = (field, value) => {
    setLocalContent(prev => ({
      ...prev,
      legalInfo: {
        ...prev.legalInfo,
        [field]: value
      }
    }))
  }

  const handleArticleChange = (id, field, value) => {
    setLocalContent(prev => ({
      ...prev,
      articles: prev.articles.map(article => 
        article.id === id ? { ...article, [field]: value } : article
      )
    }))
  }

  const handleAddArticle = () => {
    // Protection contre les articles non définis
    const currentArticles = localContent.articles || []
    const newId = currentArticles.length > 0 ? Math.max(...currentArticles.map(a => a.id), 0) + 1 : 1
    const newArticle = {
      id: newId,
      title: 'Nouvel Article',
      content: 'Contenu de l\'article...'
    }
    
    setLocalContent(prev => ({
      ...prev,
      articles: [...(prev.articles || []), newArticle]
    }))
    setEditingArticle(newId)
  }

  const handleDeleteArticle = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      setLocalContent(prev => ({
        ...prev,
        articles: prev.articles.filter(article => article.id !== id)
      }))
      if (editingArticle === id) {
        setEditingArticle(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin text-2xl text-primary" />
        <span className="ml-2">Chargement des mentions légales...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Éditeur des Mentions Légales</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FaEye />
            {showPreview ? 'Masquer l\'aperçu' : 'Aperçu'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Aperçu */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-6 border"
        >
          <h3 className="text-lg font-semibold mb-4">Aperçu des mentions légales</h3>
          <div className="prose prose-sm max-w-none">
            <div className="bg-white p-4 rounded border">
              <p className="text-gray-700 mb-4">{localContent.introduction}</p>
              {(localContent.articles || []).map((article, index) => (
                <div key={article.id} className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Article {index + 1} - {article.title}</h4>
                  <p className="text-gray-700 whitespace-pre-line">{article.content}</p>
                </div>
              ))}
              <div className="bg-blue-50 p-4 rounded border mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Mentions légales</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>Éditeur du site :</strong> {localContent.legalInfo.companyName}, {localContent.legalInfo.rcsNumber}</li>
                  <li><strong>Adresse :</strong> {localContent.legalInfo.address}</li>
                  <li><strong>Directeur de la publication :</strong> {localContent.legalInfo.director}</li>
                  <li><strong>Email :</strong> {localContent.legalInfo.email}</li>
                  <li><strong>Site web :</strong> {localContent.legalInfo.website}</li>
                  <li><strong>Hébergement :</strong> {localContent.legalInfo.hosting}</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Formulaire d'édition */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Colonne gauche - Contenu principal */}
        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Introduction</h3>
            <textarea
              value={localContent.introduction}
              onChange={(e) => handleIntroductionChange(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Texte d'introduction des CGV & CGU..."
            />
          </div>

          {/* Articles */}
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Articles</h3>
              <button
                onClick={handleAddArticle}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <FaPlus />
                Ajouter un article
              </button>
            </div>

            <div className="space-y-4">
              {(localContent.articles || []).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Article {index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingArticle(editingArticle === article.id ? null : article.id)}
                        className="p-2 text-gray-500 hover:text-primary transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) => handleArticleChange(article.id, 'title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Titre de l'article"
                  />

                  <textarea
                    value={article.content}
                    onChange={(e) => handleArticleChange(article.id, 'content', e.target.value)}
                    className="w-full h-24 p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Contenu de l'article..."
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite - Informations légales */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Informations légales</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={localContent.legalInfo.companyName}
                  onChange={(e) => handleLegalInfoChange('companyName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro RCS
                </label>
                <input
                  type="text"
                  value={localContent.legalInfo.rcsNumber}
                  onChange={(e) => handleLegalInfoChange('rcsNumber', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  value={localContent.legalInfo.address}
                  onChange={(e) => handleLegalInfoChange('address', e.target.value)}
                  className="w-full h-20 p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Directeur de publication
                </label>
                <input
                  type="text"
                  value={localContent.legalInfo.director}
                  onChange={(e) => handleLegalInfoChange('director', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={localContent.legalInfo.email}
                  onChange={(e) => handleLegalInfoChange('email', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <input
                  type="url"
                  value={localContent.legalInfo.website}
                  onChange={(e) => handleLegalInfoChange('website', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hébergement
                </label>
                <textarea
                  value={localContent.legalInfo.hosting}
                  onChange={(e) => handleLegalInfoChange('hosting', e.target.value)}
                  className="w-full h-20 p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalEditor
