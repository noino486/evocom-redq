import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaSave, FaPlus, FaTrash, FaEye, FaEyeSlash, FaSignOutAlt, FaSpinner, FaFileContract, FaChartLine } from 'react-icons/fa'
import { useAffiliate } from '../context/AffiliateContext'
import { supabase } from '../config/supabase'
import LegalEditor from '../components/LegalEditor'
import ClickStats from '../components/ClickStats'

const Admin = () => {
  const { affiliates, paymentPages, updateAffiliateConfig } = useAffiliate()
  const [localAffiliates, setLocalAffiliates] = useState(affiliates)
  const [localPaymentPages, setLocalPaymentPages] = useState(paymentPages)
  const [newAffiliate, setNewAffiliate] = useState({ name: '', STFOUR: '', GLBNS: '' })
  
  // États pour l'authentification Supabase
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('affiliates') // 'affiliates', 'legal' ou 'stats'

  // Vérifier la session au chargement
  useEffect(() => {
    checkUser()
    
    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  // Vérifier si l'utilisateur est connecté
  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Erreur de vérification:', error)
    } finally {
      setLoading(false)
    }
  }

  // Connexion
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setUser(data.user)
      setEmail('')
      setPassword('')
    } catch (error) {
      setError(error.message || 'Erreur de connexion')
      console.error('Erreur de connexion:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  // Déconnexion
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
    }
  }

  useEffect(() => {
    setLocalAffiliates(affiliates)
    setLocalPaymentPages(paymentPages)
  }, [affiliates, paymentPages])

  const handleSave = async () => {
    try {
      console.log('💾 Tentative de sauvegarde...')
      console.log('Affiliés:', localAffiliates)
      console.log('Pages:', localPaymentPages)
      
      const result = await updateAffiliateConfig(localAffiliates, localPaymentPages)
      
      if (result.success) {
        alert('✅ Configuration sauvegardée avec succès dans Supabase!')
        console.log('✅ Sauvegarde réussie!')
      } else {
        const errorMsg = result.error?.message || result.error?.hint || result.error?.details || 'Erreur inconnue'
        console.error('❌ Échec de la sauvegarde:', result.error)
        alert('❌ Erreur lors de la sauvegarde: ' + errorMsg + '\n\nVérifiez la console pour plus de détails.')
      }
    } catch (error) {
      console.error('❌ Exception lors de la sauvegarde:', error)
      alert('❌ Erreur lors de la sauvegarde: ' + error.message + '\n\nVérifiez la console pour plus de détails.')
    }
  }

  const handleAddAffiliate = () => {
    if (newAffiliate.name && newAffiliate.STFOUR && newAffiliate.GLBNS) {
      const affiliateName = newAffiliate.name.toUpperCase()
      setLocalAffiliates(prev => ({
        ...prev,
        [affiliateName]: {
          STFOUR: newAffiliate.STFOUR,
          GLBNS: newAffiliate.GLBNS
        }
      }))
      setNewAffiliate({ name: '', STFOUR: '', GLBNS: '' })
    } else {
      alert('Veuillez remplir tous les champs')
    }
  }

  const handleDeleteAffiliate = (affiliateName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'influenceur ${affiliateName}?`)) {
      const newAffiliates = { ...localAffiliates }
      delete newAffiliates[affiliateName]
      setLocalAffiliates(newAffiliates)
    }
  }

  const handleUpdatePaymentPage = (productId, newUrl) => {
    setLocalPaymentPages(prev => ({
      ...prev,
      [productId]: newUrl
    }))
  }

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="text-5xl text-primary animate-spin" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Formulaire de connexion
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 max-w-md w-full mx-4"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 gradient-text">
              Administration
            </h1>
            <p className="text-gray-600">Connexion sécurisée via Supabase</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="admin@example.com"
                required
                disabled={authLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  placeholder="••••••••"
                  required
                  disabled={authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={authLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-primary via-secondary to-accent text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Authentification sécurisée par Supabase
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Interface d'administration (utilisateur connecté)
  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard Admin
              </h1>
              <p className="text-gray-600 text-lg">
                Connecté en tant que <span className="font-semibold text-blue-600">{user.email}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
            >
              <FaSignOutAlt />
              Déconnexion
            </button>
          </div>
        </motion.div>

        {/* Onglets de navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20">
            <button
              onClick={() => setActiveTab('affiliates')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                activeTab === 'affiliates'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaPlus className="text-lg" />
              <span className="font-semibold">Influenceurs</span>
            </button>
            <button
              onClick={() => setActiveTab('legal')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                activeTab === 'legal'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaFileContract className="text-lg" />
              <span className="font-semibold">Mentions Légales</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaChartLine className="text-lg" />
              <span className="font-semibold">Statistiques</span>
            </button>
          </div>
        </motion.div>

        {/* Contenu conditionnel selon l'onglet actif */}
        {activeTab === 'affiliates' ? (
          <>
            {/* Pages de paiement par défaut */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl mb-8"
            >
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pages de paiement par défaut</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pack Global Sourcing (STFOUR)
              </label>
              <input
                type="url"
                value={localPaymentPages.STFOUR}
                onChange={(e) => handleUpdatePaymentPage('STFOUR', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pack Global Business (GLBNS)
              </label>
              <input
                type="url"
                value={localPaymentPages.GLBNS}
                onChange={(e) => handleUpdatePaymentPage('GLBNS', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all"
                placeholder="https://..."
              />
            </div>
          </div>
        </motion.div>

        {/* Ajouter un nouvel influenceur */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Ajouter un influenceur</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'influenceur
              </label>
              <input
                type="text"
                value={newAffiliate.name}
                onChange={(e) => setNewAffiliate(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: BENJAMIN"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien Pack Global Sourcing
              </label>
              <input
                type="url"
                value={newAffiliate.STFOUR}
                onChange={(e) => setNewAffiliate(prev => ({ ...prev, STFOUR: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien Pack Global Business
              </label>
              <input
                type="url"
                value={newAffiliate.GLBNS}
                onChange={(e) => setNewAffiliate(prev => ({ ...prev, GLBNS: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>
          <button
            onClick={handleAddAffiliate}
            className="mt-4 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FaPlus />
            Ajouter l'influenceur
          </button>
        </motion.div>

        {/* Liste des influenceurs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Influenceurs configurés</h2>
          <div className="space-y-4">
            {Object.entries(localAffiliates).map(([name, links]) => (
              <div key={name} className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                  <button
                    onClick={() => handleDeleteAffiliate(name)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pack Global Sourcing
                    </label>
                    <input
                      type="url"
                      value={links.STFOUR}
                      onChange={(e) => {
                        setLocalAffiliates(prev => ({
                          ...prev,
                          [name]: { ...prev[name], STFOUR: e.target.value }
                        }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pack Global Business
                    </label>
                    <input
                      type="url"
                      value={links.GLBNS}
                      onChange={(e) => {
                        setLocalAffiliates(prev => ({
                          ...prev,
                          [name]: { ...prev[name], GLBNS: e.target.value }
                        }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
            </motion.div>

            {/* Bouton de sauvegarde */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-primary via-secondary to-accent text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto shine-effect glow-effect-hover"
              >
                <FaSave />
                Sauvegarder la configuration
              </button>
            </motion.div>
          </>
        ) : activeTab === 'legal' ? (
          /* Section Mentions Légales */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
          >
            <LegalEditor />
          </motion.div>
        ) : (
          /* Section Statistiques */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ClickStats />
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">Instructions d'utilisation</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Les liens par défaut sont utilisés quand aucun paramètre AF n'est présent dans l'URL</li>
            <li>• Les influenceurs sont identifiés par le paramètre ?AF=NOM dans l'URL</li>
            <li>• Exemple: https://www.evoecom.com/?AF=BENJAMIN utilisera les liens de BENJAMIN</li>
            <li>• Les liens sont automatiquement appliqués sur toutes les pages du site</li>
            <li>• Pensez à sauvegarder après chaque modification</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

export default Admin
