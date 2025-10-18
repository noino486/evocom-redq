import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaMousePointer, FaMobile, FaDesktop, FaExternalLinkAlt, FaCalendarAlt, FaUser, FaLink, FaHome, FaShoppingCart, FaGlobe, FaArrowRight, FaUsers, FaEye, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { getClickStats, getAggregatedStats } from '../utils/clickTracker'
import { getAggregatedVisitorStats } from '../utils/visitorTracker'
import { SimpleBarChart, SimplePieChart, SimpleLineChart } from './SimpleChart'

const ClickStats = () => {
  const [stats, setStats] = useState(null)
  const [visitorStats, setVisitorStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState('7d')
  const [selectedAffiliate, setSelectedAffiliate] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedLinkType, setSelectedLinkType] = useState('all')

  useEffect(() => {
    loadStats()
  }, [dateRange, selectedAffiliate, selectedSource, selectedLinkType])

  const loadStats = async () => {
    setLoading(true)
    setError(null)

    try {
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
      const [clicksResult, visitorsResult] = await Promise.all([
        getAggregatedStats(filters),
        getAggregatedVisitorStats(filters)
      ])
      
      if (clicksResult.success) {
        setStats(clicksResult.data)
      } else {
        setError(clicksResult.error?.message || 'Erreur lors du chargement des statistiques de clics')
      }

      if (visitorsResult.success) {
        setVisitorStats(visitorsResult.data)
      }
    } catch (err) {
      setError('Erreur lors du chargement des statistiques')
      console.error('Erreur stats:', err)
    } finally {
      setLoading(false)
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
          <div className="text-red-500 text-lg mb-2">⚠️ Erreur</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadStats}
            className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
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
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaChartLine className="text-primary" />
              Statistiques des clics
            </h2>
            <p className="text-gray-600">{getDateRangeLabel()}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Tous les affiliés</option>
              {Object.keys(stats.clicksByAffiliate || {}).map(affiliate => (
                <option key={affiliate} value={affiliate}>{affiliate}</option>
              ))}
            </select>

            <select
              value={selectedLinkType}
              onChange={(e) => setSelectedLinkType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <FaMousePointer className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {formatNumber(stats?.totalClicks || 0)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Total des clics</h3>
          <p className="text-sm text-gray-600">Tous les liens trackés</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <FaUsers className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {formatNumber(visitorStats?.totalVisitors || 0)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Visiteurs totaux</h3>
          <p className="text-sm text-gray-600">Toutes les sessions</p>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <FaMobile className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {formatNumber(stats?.mobileClicks || 0)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Clics mobiles</h3>
          <p className="text-sm text-gray-600">
            {stats?.totalClicks > 0 ? Math.round(((stats.mobileClicks || 0) / stats.totalClicks) * 100) : 0}% du total
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <FaExternalLinkAlt className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {formatNumber(stats?.inAppClicks || 0)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Clics depuis apps</h3>
          <p className="text-sm text-gray-600">
            Snapchat, Instagram, etc.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <FaDesktop className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {formatNumber((stats?.totalClicks || 0) - (stats?.mobileClicks || 0))}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Clics desktop</h3>
          <p className="text-sm text-gray-600">
            {stats?.totalClicks > 0 ? Math.round((((stats.totalClicks - (stats.mobileClicks || 0)) / stats.totalClicks) * 100)) : 0}% du total
          </p>
        </motion.div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique d'évolution des clics */}
        {stats?.clicksByDay && Object.keys(stats.clicksByDay).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
          >
            <SimpleLineChart 
              data={stats.clicksByDay}
              title="Évolution des clics"
              color="#3b82f6"
            />
          </motion.div>
        )}

        {/* Graphique des types de clics */}
        {stats?.clicksByType && Object.keys(stats.clicksByType).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
          >
            <SimplePieChart 
              data={Object.entries(stats.clicksByType).reduce((acc, [type, count]) => {
                const name = type === 'affiliate' ? 'Liens d\'achat' :
                           type === 'product' ? 'Pages produits' :
                           type === 'internal' ? 'Liens internes' :
                           type === 'external' ? 'Liens externes' : type
                acc[name] = count
                return acc
              }, {})}
              title="Répartition des clics"
            />
          </motion.div>
        )}
      </div>

      {/* Graphiques des visiteurs */}
      {visitorStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique des appareils */}
          {visitorStats.visitorsByDevice && Object.keys(visitorStats.visitorsByDevice).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
            >
              <SimpleBarChart 
                data={visitorStats.visitorsByDevice}
                title="Visiteurs par appareil"
                color="#10b981"
              />
            </motion.div>
          )}

          {/* Graphique des navigateurs */}
          {visitorStats.visitorsByBrowser && Object.keys(visitorStats.visitorsByBrowser).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
            >
              <SimpleBarChart 
                data={visitorStats.visitorsByBrowser}
                title="Visiteurs par navigateur"
                color="#8b5cf6"
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Répartition par type de lien */}
      {stats.clicksByType && Object.keys(stats.clicksByType).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaLink className="text-primary" />
            Répartition par type de lien
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.clicksByType).map(([type, count]) => (
              <div key={type} className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary mb-1">
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
