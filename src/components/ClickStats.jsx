import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaMousePointer, FaMobile, FaDesktop, FaExternalLinkAlt, FaCalendarAlt, FaUser, FaLink, FaHome, FaShoppingCart, FaGlobe, FaArrowRight, FaUsers, FaEye, FaClock, FaMapMarkerAlt, FaWifi, FaExclamationTriangle, FaRefresh } from 'react-icons/fa'
import { getClickStats, getAggregatedStats } from '../utils/clickTracker'
import { getAggregatedVisitorStats, getCurrentVisitors } from '../utils/visitorTracker'
import { useNetworkStatus, formatNetworkError, NETWORK_ERROR_TYPES } from '../utils/networkUtils'

const ClickStats = () => {
  const [stats, setStats] = useState(null)
  const [visitorStats, setVisitorStats] = useState(null)
  const [currentVisitors, setCurrentVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState('7d')
  const [selectedAffiliate, setSelectedAffiliate] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedLinkType, setSelectedLinkType] = useState('all')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
  // Hook pour l'état de la connexion réseau
  const { isOnline, isConnecting, testConnection } = useNetworkStatus()

  useEffect(() => {
    loadStats()
    
    // Mise à jour automatique toutes les 30 secondes
    const interval = setInterval(() => {
      loadStats(true)
    }, 30000) // 30 secondes
    
    return () => clearInterval(interval)
  }, [dateRange, selectedAffiliate, selectedSource, selectedLinkType])

  const loadStats = async (isAutoUpdate = false) => {
    if (isAutoUpdate) {
      setIsUpdating(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // Vérifier la connectivité avant de charger
      if (!isOnline) {
        setError('Pas de connexion internet. Vérifiez votre connexion réseau.')
        return
      }

      // Calculer les dates selon la période sélectionnée
      const now = new Date()
      let dateFrom = null

      switch (dateRange) {
        case '1d':
          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          dateFrom = null
      }

      const filters = {
        dateFrom: dateFrom ? dateFrom.toISOString() : null,
        affiliateName: selectedAffiliate !== 'all' ? selectedAffiliate : null,
        linkType: selectedLinkType !== 'all' ? selectedLinkType : null,
        source: selectedSource !== 'all' ? selectedSource : null
      }

      // Charger les stats de clics et de visiteurs en parallèle
      const [clicksResult, visitorsResult, currentVisitorsResult] = await Promise.all([
        getAggregatedStats(filters),
        getAggregatedVisitorStats(filters),
        getCurrentVisitors()
      ])
      
      if (clicksResult.success) {
        setStats(clicksResult.data)
        setRetryCount(0) // Reset retry count on success
      } else {
        const errorMessage = formatNetworkError(clicksResult.error)
        setError(errorMessage)
        setRetryCount(prev => prev + 1)
      }

      if (visitorsResult.success) {
        setVisitorStats(visitorsResult.data)
      }

      if (currentVisitorsResult.success) {
        setCurrentVisitors(currentVisitorsResult.data)
      }
      
      setLastUpdate(new Date())
    } catch (err) {
      const errorMessage = formatNetworkError(err)
      setError(errorMessage)
      setRetryCount(prev => prev + 1)
      console.error('Erreur stats:', err)
    } finally {
      setLoading(false)
      setIsUpdating(false)
    }
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '1d': return 'Dernières 24h'
      case '7d': return '7 derniers jours'
      case '30d': return '30 derniers jours'
      case '90d': return '90 derniers jours'
      default: return 'Toutes les périodes'
    }
  }

  // Fonction pour tester la connexion et recharger
  const handleTestConnectionAndReload = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const connectionOk = await testConnection()
      if (connectionOk) {
        await loadStats()
      } else {
        setError('Connexion internet non disponible. Vérifiez votre réseau.')
      }
    } catch (error) {
      setError('Erreur lors du test de connexion.')
    }
  }

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Chargement des statistiques...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            {!isOnline ? (
              <FaWifi className="text-red-500 text-3xl mr-2" />
            ) : (
              <FaExclamationTriangle className="text-orange-500 text-3xl mr-2" />
            )}
            <div className="text-red-500 text-lg">Erreur de connexion</div>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleTestConnectionAndReload}
              disabled={isConnecting}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isConnecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaRefresh />
              )}
              {isConnecting ? 'Test en cours...' : 'Tester et recharger'}
            </button>
            
            <button
              onClick={loadStats}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaRefresh />
              Réessayer
            </button>
          </div>
          
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              Tentatives: {retryCount}
            </p>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>État de la connexion:</strong> {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
            </p>
            {!isOnline && (
              <p className="text-xs text-blue-600 mt-1">
                Vérifiez votre connexion internet et réessayez.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
        <div className="text-center py-8">
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FaChartLine className="text-blue-600" />
                Statistiques
              </h2>
              {isUpdating && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Mise à jour...</span>
                </div>
              )}
              
              {/* Indicateur de connexion */}
              <div className="flex items-center gap-2 text-sm">
                {isOnline ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>En ligne</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Hors ligne</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">{getDateRangeLabel()}</p>
            <p className="text-xs text-gray-500">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="1d">24h</option>
              <option value="7d">7 jours</option>
              <option value="30d">30 jours</option>
              <option value="90d">90 jours</option>
              <option value="all">Tout</option>
            </select>
            
            <select
              value={selectedAffiliate}
              onChange={(e) => setSelectedAffiliate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Tous les affiliés</option>
              {Object.keys(stats.clicksByAffiliate || {}).map(affiliate => (
                <option key={affiliate} value={affiliate}>{affiliate}</option>
              ))}
            </select>

            <select
              value={selectedLinkType}
              onChange={(e) => setSelectedLinkType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="affiliate">Liens d'achat</option>
              <option value="product">Pages produits</option>
              <option value="internal">Liens internes</option>
              <option value="external">Liens externes</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Toutes les sources</option>
              {Object.keys(stats.clicksBySource || {}).map(source => (
                <option key={source} value={source}>
                  {source === 'header' ? 'En-tête' :
                   source === 'footer' ? 'Pied de page' :
                   source === 'products_section' ? 'Section Produits' :
                   source === 'hero_section' ? 'Section Hero' :
                   source === 'testimonials_section' ? 'Témoignages' :
                   source === 'process_section' ? 'Processus' :
                   source === 'why_choose_section' ? 'Pourquoi nous' :
                   source === 'comparison_section' ? 'Comparaison' :
                   source === 'fomo_section' ? 'FOMO' :
                   source === 'discord_section' ? 'Discord' :
                   source === 'whatsapp_section' ? 'WhatsApp' :
                   source}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaMousePointer className="text-blue-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(stats?.totalClicks || 0)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Total des clics</h3>
          <p className="text-xs text-gray-500">Tous les liens trackés</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaUsers className="text-purple-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(visitorStats?.totalVisitors || 0)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Visiteurs totaux</h3>
          <p className="text-xs text-gray-500">Toutes les sessions</p>
        </motion.div>



        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaMobile className="text-green-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(stats?.mobileClicks || 0)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Clics mobiles</h3>
          <p className="text-xs text-gray-500">
            {stats?.totalClicks > 0 ? Math.round(((stats.mobileClicks || 0) / stats.totalClicks) * 100) : 0}% du total
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaExternalLinkAlt className="text-purple-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(stats?.inAppClicks || 0)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Clics depuis apps</h3>
          <p className="text-xs text-gray-500">
            Snapchat, Instagram, etc.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FaDesktop className="text-orange-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber((stats?.totalClicks || 0) - (stats?.mobileClicks || 0))}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Clics desktop</h3>
          <p className="text-xs text-gray-500">
            {stats?.totalClicks > 0 ? Math.round((((stats.totalClicks - (stats.mobileClicks || 0)) / stats.totalClicks) * 100)) : 0}% du total
          </p>
        </motion.div>
      </div>

      {/* Performance par influenceur */}
      {stats.affiliateLinkStats && Object.keys(stats.affiliateLinkStats).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Performance par influenceur
          </h3>
          <div className="space-y-4">
            {Object.values(stats.affiliateLinkStats)
              .sort((a, b) => b.total_clicks - a.total_clicks)
              .map((influenceurStats, index) => (
                <div key={influenceurStats.influenceur} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {influenceurStats.influenceur}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Total:</span> {influenceurStats.total_clicks} clics
                        </div>
                        <div>
                          <span className="font-medium">Mobile:</span> {influenceurStats.mobile_clicks}
                        </div>
                        <div>
                          <span className="font-medium">Apps:</span> {influenceurStats.in_app_clicks}
                        </div>
                        <div>
                          <span className="font-medium">Liens uniques:</span> {influenceurStats.unique_links.size}
                        </div>
                      </div>
                    </div>
                    <div className="text-center lg:text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {influenceurStats.total_clicks}
                      </div>
                      <div className="text-sm text-gray-500">clics</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(
                            (influenceurStats.total_clicks / Math.max(...Object.values(stats.affiliateLinkStats).map(s => s.total_clicks))) * 100, 
                            100
                          )}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Premier clic: {new Date(influenceurStats.first_click).toLocaleDateString('fr-FR')}</span>
                      <span>Dernier clic: {new Date(influenceurStats.last_click).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Répartition par type de lien */}
      {stats.clicksByType && Object.keys(stats.clicksByType).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaLink className="text-blue-600" />
            Répartition par type de lien
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.clicksByType).map(([type, count]) => (
              <div key={type} className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatNumber(count)}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {type === 'affiliate' ? 'Liens affiliés' :
                   type === 'product' ? 'Produits' :
                   type === 'external' ? 'Externes' :
                   type === 'internal' ? 'Internes' : type}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.totalClicks > 0 ? Math.round((count / stats.totalClicks) * 100) : 0}% du total
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Performance par source */}
      {stats.clicksBySource && Object.keys(stats.clicksBySource).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaHome className="text-primary" />
            Performance par section
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.clicksBySource)
              .sort(([,a], [,b]) => b - a)
              .map(([source, count]) => {
                const getSourceIcon = (source) => {
                  switch (source) {
                    case 'header': return <FaHome />
                    case 'footer': return <FaHome />
                    case 'products_section': return <FaShoppingCart />
                    case 'hero_section': return <FaHome />
                    case 'testimonials_section': return <FaUser />
                    case 'process_section': return <FaArrowRight />
                    case 'why_choose_section': return <FaArrowRight />
                    case 'comparison_section': return <FaArrowRight />
                    case 'fomo_section': return <FaArrowRight />
                    case 'discord_section': return <FaGlobe />
                    case 'whatsapp_section': return <FaGlobe />
                    default: return <FaMousePointer />
                  }
                }
                
                const getSourceLabel = (source) => {
                  switch (source) {
                    case 'header': return 'En-tête'
                    case 'footer': return 'Pied de page'
                    case 'products_section': return 'Section Produits'
                    case 'hero_section': return 'Section Hero'
                    case 'testimonials_section': return 'Témoignages'
                    case 'process_section': return 'Processus'
                    case 'why_choose_section': return 'Pourquoi nous'
                    case 'comparison_section': return 'Comparaison'
                    case 'fomo_section': return 'FOMO'
                    case 'discord_section': return 'Discord'
                    case 'whatsapp_section': return 'WhatsApp'
                    default: return source
                  }
                }
                
                return (
                  <div key={source} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                        {getSourceIcon(source)}
                      </div>
                      <span className="font-semibold text-gray-900">{getSourceLabel(source)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{formatNumber(count)}</div>
                      <div className="text-sm text-gray-600">clics</div>
                    </div>
                  </div>
                )
              })}
          </div>
        </motion.div>
      )}

      {/* Top affiliés */}
      {stats.clicksByAffiliate && Object.keys(stats.clicksByAffiliate).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaUser className="text-primary" />
            Performance par affilié
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.clicksByAffiliate)
              .sort(([,a], [,b]) => b - a)
              .map(([affiliate, count]) => (
                <div key={affiliate} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {affiliate.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900">{affiliate}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{formatNumber(count)}</div>
                    <div className="text-sm text-gray-600">clics</div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Top liens */}
      {stats.topLinks && stats.topLinks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaLink className="text-primary" />
            Top liens les plus cliqués
          </h3>
          <div className="space-y-3">
            {stats.topLinks.map((link, index) => (
              <div key={link.url} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {link.url.length > 60 ? `${link.url.substring(0, 60)}...` : link.url}
                    </div>
                    <div className="text-xs text-gray-500">{link.url}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">{formatNumber(link.count)}</div>
                  <div className="text-sm text-gray-600">clics</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Évolution dans le temps */}
      {stats.clicksByDay && Object.keys(stats.clicksByDay).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-primary" />
            Évolution des clics
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.clicksByDay)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .slice(0, 7)
              .map(([date, count]) => (
                <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(date).toLocaleDateString('fr-FR', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (count / Math.max(...Object.values(stats.clicksByDay))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-primary w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ClickStats
