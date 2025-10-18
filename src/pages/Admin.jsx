import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaSave, FaPlus, FaTrash, FaEye, FaEyeSlash, FaSignOutAlt, FaSpinner, FaFileContract, FaChartLine, FaBug, FaMobile } from 'react-icons/fa'
import { useAffiliate } from '../context/AffiliateContext'
import { supabase } from '../config/supabase'
import LegalEditor from '../components/LegalEditor'
import ClickStats from '../components/ClickStats'
import { getClickStats, trackClick, LINK_TYPES } from '../utils/clickTracker'

const Admin = () => {
  const { affiliates, paymentPages, updateAffiliateConfig, testLocalStorage, testAffiliateLinks } = useAffiliate()
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
  const [debugResults, setDebugResults] = useState(null)
  const [affiliateTestResults, setAffiliateTestResults] = useState(null)
  const [rawDataResults, setRawDataResults] = useState(null)

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

  // Fonction pour tester le localStorage
  const handleTestLocalStorage = () => {
    const results = testLocalStorage()
    setDebugResults(results)
    console.log('🔍 Test localStorage:', results)
  }

  // Fonction pour tester les liens AF
  const handleTestAffiliateLinks = () => {
    const results = testAffiliateLinks()
    setAffiliateTestResults(results)
    console.log('🔍 Test liens AF:', results)
  }

  // Fonction pour tester le tracking mobile
  const handleTestMobileTracking = () => {
    const testResults = {
      userAgent: navigator.userAgent,
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      localStorage: {
        available: typeof localStorage !== 'undefined',
        test: null
      },
      sessionStorage: {
        available: typeof sessionStorage !== 'undefined',
        test: null
      },
      cookies: {
        available: typeof document !== 'undefined' && typeof document.cookie !== 'undefined',
        test: null
      }
    }

    // Test localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mobile-test', 'test-value')
        testResults.localStorage.test = localStorage.getItem('mobile-test') === 'test-value'
        localStorage.removeItem('mobile-test')
      }
    } catch (error) {
      testResults.localStorage.error = error.message
    }

    // Test sessionStorage
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('mobile-test', 'test-value')
        testResults.sessionStorage.test = sessionStorage.getItem('mobile-test') === 'test-value'
        sessionStorage.removeItem('mobile-test')
      }
    } catch (error) {
      testResults.sessionStorage.error = error.message
    }

    // Test cookies
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'mobile-test=test-value; path=/'
        testResults.cookies.test = document.cookie.includes('mobile-test=test-value')
        document.cookie = 'mobile-test=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    } catch (error) {
      testResults.cookies.error = error.message
    }

    setDebugResults(testResults)
    console.log('📱 Test tracking mobile:', testResults)
  }

  // Fonction pour vérifier les données brutes
  const handleCheckRawData = async () => {
    try {
      const result = await getClickStats({})
      if (result.success) {
        const rawData = result.data
        const analysis = {
          totalClicks: rawData.length,
          mobileClicks: rawData.filter(c => c.is_mobile).length,
          inAppClicks: rawData.filter(c => c.is_in_app).length,
          affiliateClicks: rawData.filter(c => c.affiliate_name).length,
          recentClicks: rawData.slice(0, 5),
          byType: rawData.reduce((acc, click) => {
            acc[click.link_type] = (acc[click.link_type] || 0) + 1
            return acc
          }, {}),
          byAffiliate: rawData.reduce((acc, click) => {
            if (click.affiliate_name) {
              acc[click.affiliate_name] = (acc[click.affiliate_name] || 0) + 1
            }
            return acc
          }, {})
        }
        setRawDataResults(analysis)
        console.log('📊 Données brutes analysées:', analysis)
      } else {
        console.error('Erreur lors de la récupération des données:', result.error)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des données:', error)
    }
  }

  // Fonction pour tester le tracking en temps réel
  const handleTestTracking = async () => {
    try {
      const testData = {
        url: 'https://test.example.com',
        text: 'Test de tracking',
        type: LINK_TYPES.AFFILIATE,
        affiliateName: 'TEST_ADMIN',
        productId: 'TEST_PRODUCT',
        source: 'admin_test'
      }

      console.log('🧪 Test de tracking en cours...', testData)
      const result = await trackClick(testData)
      console.log('📊 Résultat du test:', result)

      if (result.success) {
        alert('✅ Test de tracking réussi ! Vérifiez les données brutes.')
        // Recharger les données brutes
        setTimeout(() => {
          handleCheckRawData()
        }, 1000)
      } else {
        alert('❌ Test de tracking échoué : ' + (result.error?.message || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('Erreur lors du test de tracking:', error)
      alert('❌ Erreur lors du test de tracking : ' + error.message)
    }
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
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                Administration
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt />
              Déconnexion
            </button>
          </div>
        </motion.div>

        {/* Onglets de navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('affiliates')}
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'affiliates'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaPlus className="text-sm" />
              <span className="hidden sm:inline">Influenceurs</span>
            </button>
            <button
              onClick={() => setActiveTab('legal')}
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-l border-gray-200 ${
                activeTab === 'legal'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaFileContract className="text-sm" />
              <span className="hidden sm:inline">Mentions Légales</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-l border-gray-200 ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaChartLine className="text-sm" />
              <span className="hidden sm:inline">Statistiques</span>
            </button>
            <button
              onClick={() => setActiveTab('debug')}
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-l border-gray-200 ${
                activeTab === 'debug'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaBug className="text-sm" />
              <span className="hidden sm:inline">Debug</span>
            </button>
          </div>
        </motion.div>

        {/* Contenu conditionnel selon l'onglet actif */}
        {activeTab === 'debug' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaBug className="text-blue-600" />
              Debug localStorage Mobile
            </h2>
            
            <div className="mb-6 flex flex-wrap gap-4">
              <button
                onClick={handleTestLocalStorage}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaMobile />
                Test localStorage
              </button>
              <button
                onClick={handleTestAffiliateLinks}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaBug />
                Test liens AF
              </button>
              <button
                onClick={handleTestMobileTracking}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaMobile />
                Test tracking mobile
              </button>
              <button
                onClick={handleCheckRawData}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <FaBug />
                Vérifier données brutes
              </button>
              <button
                onClick={handleTestTracking}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaBug />
                Test tracking
              </button>
            </div>

            {debugResults && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">localStorage</h3>
                  <div className="text-sm text-gray-600">
                    <p>Disponible: {debugResults.localStorage.available ? '✅ Oui' : '❌ Non'}</p>
                    <p>Test: {debugResults.localStorage.test === null ? '⏳ Non testé' : debugResults.localStorage.test ? '✅ Réussi' : '❌ Échec'}</p>
                    {debugResults.localStorage.error && (
                      <p className="text-red-600">Erreur: {debugResults.localStorage.error}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">sessionStorage</h3>
                  <div className="text-sm text-gray-600">
                    <p>Disponible: {debugResults.sessionStorage.available ? '✅ Oui' : '❌ Non'}</p>
                    <p>Test: {debugResults.sessionStorage.test === null ? '⏳ Non testé' : debugResults.sessionStorage.test ? '✅ Réussi' : '❌ Échec'}</p>
                    {debugResults.sessionStorage.error && (
                      <p className="text-red-600">Erreur: {debugResults.sessionStorage.error}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Cookies</h3>
                  <div className="text-sm text-gray-600">
                    <p>Disponible: {debugResults.cookies.available ? '✅ Oui' : '❌ Non'}</p>
                    <p>Test: {debugResults.cookies.test === null ? '⏳ Non testé' : debugResults.cookies.test ? '✅ Réussi' : '❌ Échec'}</p>
                    {debugResults.cookies.error && (
                      <p className="text-red-600">Erreur: {debugResults.cookies.error}</p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Informations système</h3>
                  <div className="text-sm text-blue-800">
                    <p>User Agent: {navigator.userAgent}</p>
                    <p>Écran: {window.innerWidth}x{window.innerHeight}</p>
                    <p>Mobile: {/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '✅ Oui' : '❌ Non'}</p>
                    <p>Dans une app: {/FBAN|FBAV|Instagram|Snapchat|WhatsApp|TikTok|wv\)/i.test(navigator.userAgent) ? '✅ Oui' : '❌ Non'}</p>
                  </div>
                </div>
              </div>
            )}

            {affiliateTestResults && (
              <div className="mt-8 space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Test des liens AF</h3>
                  <div className="text-sm text-green-800">
                    <p><strong>Code actuel:</strong> {affiliateTestResults.currentCode || 'Aucun'}</p>
                    <p><strong>Affiliés disponibles:</strong> {affiliateTestResults.availableAffiliates.join(', ')}</p>
                    <p><strong>Pages de paiement:</strong> {affiliateTestResults.paymentPages.join(', ')}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Liens de test</h3>
                  <div className="space-y-2">
                    {Object.entries(affiliateTestResults.testLinks).map(([affiliateName, links]) => (
                      <div key={affiliateName} className="bg-white rounded p-3">
                        <h4 className="font-medium text-gray-900 mb-2">{affiliateName}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>STFOUR:</strong> <a href={links.STFOUR} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{links.STFOUR}</a></p>
                          <p><strong>GLBNS:</strong> <a href={links.GLBNS} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{links.GLBNS}</a></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rawDataResults && (
              <div className="mt-8 space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">Analyse des données brutes</h3>
                  <div className="text-sm text-orange-800 space-y-2">
                    <p><strong>Total clics:</strong> {rawDataResults.totalClicks}</p>
                    <p><strong>Clics mobiles:</strong> {rawDataResults.mobileClicks}</p>
                    <p><strong>Clics depuis apps:</strong> {rawDataResults.inAppClicks}</p>
                    <p><strong>Clics avec affilié:</strong> {rawDataResults.affiliateClicks}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Répartition par type</h3>
                  <div className="text-sm text-gray-600">
                    {Object.entries(rawDataResults.byType).map(([type, count]) => (
                      <p key={type}><strong>{type}:</strong> {count} clics</p>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Répartition par affilié</h3>
                  <div className="text-sm text-gray-600">
                    {Object.entries(rawDataResults.byAffiliate).map(([affiliate, count]) => (
                      <p key={affiliate}><strong>{affiliate}:</strong> {count} clics</p>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Clics récents (5 derniers)</h3>
                  <div className="space-y-2">
                    {rawDataResults.recentClicks.map((click, index) => (
                      <div key={index} className="bg-white rounded p-2 text-xs">
                        <p><strong>URL:</strong> {click.link_url}</p>
                        <p><strong>Type:</strong> {click.link_type}</p>
                        <p><strong>Affilié:</strong> {click.affiliate_name || 'Aucun'}</p>
                        <p><strong>Mobile:</strong> {click.is_mobile ? 'Oui' : 'Non'}</p>
                        <p><strong>App:</strong> {click.is_in_app ? 'Oui' : 'Non'}</p>
                        <p><strong>Date:</strong> {new Date(click.timestamp).toLocaleString('fr-FR')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : activeTab === 'affiliates' ? (
          <>
            {/* Pages de paiement par défaut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-6 border border-gray-200 mb-6"
            >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pages de paiement par défaut</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pack Global Sourcing (STFOUR)
              </label>
              <input
                type="url"
                value={localPaymentPages.STFOUR}
                onChange={(e) => handleUpdatePaymentPage('STFOUR', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
