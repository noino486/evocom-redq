import React from 'react'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaFileContract, FaLock, FaArrowLeft, FaSpinner } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useLegal } from '../context/LegalContext'

const LegalNotice = () => {
  const navigate = useNavigate()
  const { legalContent, loading, error } = useLegal()

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement des mentions légales...</p>
        </div>
      </div>
    )
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
            <h2 className="text-lg font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Bouton retour */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
        >
          <FaArrowLeft />
          <span>Retour à l'accueil</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
        >
          {/* En-tête */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl mb-4">
              <FaFileContract className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Mentions Légales
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Contenu */}
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 mb-6">
                <p className="text-gray-700 mb-4">
                  {legalContent.introduction}
                </p>
                <p className="text-gray-700 font-semibold">
                  En utilisant le Site ou en procédant à un achat, l'utilisateur (ci-après « le Client ») accepte sans réserve les présentes CGV & CGU.
                </p>
              </div>
            </section>

            {/* Articles dynamiques */}
            {legalContent.articles.map((article, index) => (
              <section key={article.id} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Article {index + 1} - {article.title}
                </h2>
                <div className="text-gray-700 whitespace-pre-line">
                  {article.content}
                </div>
              </section>
            ))}

            {/* Mentions légales */}
            <section className="bg-primary/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mentions légales</h2>
              <ul className="text-gray-700 space-y-2">
                <li><strong>Éditeur du site :</strong> {legalContent.legalInfo.companyName}, {legalContent.legalInfo.rcsNumber}</li>
                <li><strong>Adresse :</strong> {legalContent.legalInfo.address}</li>
                <li><strong>Directeur de la publication :</strong> {legalContent.legalInfo.director}</li>
                <li><strong>Email :</strong> {legalContent.legalInfo.email}</li>
                <li><strong>Site web :</strong> <a href={legalContent.legalInfo.website} className="text-primary hover:underline">{legalContent.legalInfo.website}</a></li>
                <li><strong>Hébergement :</strong> {legalContent.legalInfo.hosting}</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LegalNotice


