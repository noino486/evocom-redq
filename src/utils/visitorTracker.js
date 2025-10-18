import { supabase } from '../config/supabase'
import { getVisitorsWithRetry, getCurrentVisitorsWithRetry, trackVisitorWithRetry } from './networkUtils'

// Fonction pour tracker un visiteur
export const trackVisitor = async (visitorData) => {
  try {
    const visitorInfo = {
      session_id: visitorData.sessionId || generateSessionId(),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      is_mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      is_in_app: isInAppBrowser(),
      ip_address: visitorData.ipAddress || null,
      country: visitorData.country || null,
      city: visitorData.city || null,
      device_type: getDeviceType(),
      browser: getBrowserInfo(),
      os: getOSInfo(),
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      affiliate_code: visitorData.affiliateCode || null,
      utm_source: visitorData.utmSource || null,
      utm_medium: visitorData.utmMedium || null,
      utm_campaign: visitorData.utmCampaign || null,
      utm_term: visitorData.utmTerm || null,
      utm_content: visitorData.utmContent || null
    }

    // Utiliser la fonction avec retry
    const result = await trackVisitorWithRetry(visitorInfo)

    if (result.success) {
      console.log('✅ Visiteur tracké avec succès:', visitorInfo)
      return { success: true, data: result.data }
    } else {
      console.error('Erreur lors du tracking visiteur:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Erreur lors du tracking visiteur:', error)
    return { success: false, error }
  }
}

// Fonction pour générer un ID de session unique
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Fonction pour détecter si on est dans une app tierce
const isInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera
  
  const inAppBrowsers = [
    'FBAN', 'FBAV', 'Instagram', 'Snapchat', 'TwitterAndroid', 'TwitteriPhone',
    'LinkedInApp', 'WhatsApp', 'Telegram', 'TikTok', 'Pinterest', 'Line',
    'KAKAOTALK', 'MicroMessenger', 'QQ/', 'Viber', 'SkypeUriPreview', 'Slack',
    'Discord', 'Reddit', 'YouTube', 'Twitch', 'Spotify'
  ]

  return inAppBrowsers.some(pattern => ua.includes(pattern)) ||
         /wv\)/i.test(ua) || // Android WebView
         /Version\/.*Chrome\/.*Mobile/i.test(ua) // Chrome mobile dans app
}

// Fonction pour déterminer le type d'appareil
const getDeviceType = () => {
  const ua = navigator.userAgent
  
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Mac/i.test(ua)) return 'Mac'
  if (/Linux/i.test(ua)) return 'Linux'
  
  return 'Unknown'
}

// Fonction pour obtenir les informations du navigateur
const getBrowserInfo = () => {
  const ua = navigator.userAgent
  
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Opera')) return 'Opera'
  
  return 'Unknown'
}

// Fonction pour obtenir les informations de l'OS
const getOSInfo = () => {
  const ua = navigator.userAgent
  
  if (/Windows NT 10/i.test(ua)) return 'Windows 10'
  if (/Windows NT 6.3/i.test(ua)) return 'Windows 8.1'
  if (/Windows NT 6.2/i.test(ua)) return 'Windows 8'
  if (/Windows NT 6.1/i.test(ua)) return 'Windows 7'
  if (/Mac OS X/i.test(ua)) return 'macOS'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Linux/i.test(ua)) return 'Linux'
  
  return 'Unknown'
}

// Fonction pour obtenir les statistiques des visiteurs
export const getVisitorStats = async (filters = {}) => {
  try {
    const result = await getVisitorsWithRetry(filters)
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      console.error('Erreur lors de la récupération des stats visiteurs:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des stats visiteurs:', error)
    return { success: false, error }
  }
}

// Fonction pour obtenir les statistiques agrégées des visiteurs
export const getAggregatedVisitorStats = async (filters = {}) => {
  try {
    const { data: visitors, error } = await getVisitorStats(filters)
    
    if (error) {
      return { success: false, error }
    }

    // Calculer les statistiques agrégées
    const stats = {
      totalVisitors: visitors.length,
      uniqueVisitors: new Set(visitors.map(v => v.session_id)).size,
      visitorsByDevice: {},
      visitorsByBrowser: {},
      visitorsByOS: {},
      visitorsByCountry: {},
      visitorsByDay: {},
      mobileVisitors: 0,
      inAppVisitors: 0,
      visitorsByAffiliate: {},
      topPages: [],
      bounceRate: 0,
      averageSessionDuration: 0
    }

    visitors.forEach(visitor => {
      // Par type d'appareil
      stats.visitorsByDevice[visitor.device_type] = (stats.visitorsByDevice[visitor.device_type] || 0) + 1
      
      // Par navigateur
      stats.visitorsByBrowser[visitor.browser] = (stats.visitorsByBrowser[visitor.browser] || 0) + 1
      
      // Par OS
      stats.visitorsByOS[visitor.os] = (stats.visitorsByOS[visitor.os] || 0) + 1
      
      // Par pays
      if (visitor.country) {
        stats.visitorsByCountry[visitor.country] = (stats.visitorsByCountry[visitor.country] || 0) + 1
      }
      
      // Par jour
      const day = visitor.timestamp.split('T')[0]
      stats.visitorsByDay[day] = (stats.visitorsByDay[day] || 0) + 1
      
      // Mobile/App
      if (visitor.is_mobile) stats.mobileVisitors++
      if (visitor.is_in_app) stats.inAppVisitors++
      
      // Par affilié
      if (visitor.affiliate_code) {
        stats.visitorsByAffiliate[visitor.affiliate_code] = (stats.visitorsByAffiliate[visitor.affiliate_code] || 0) + 1
      }
    })

    // Top pages
    const pageCounts = {}
    visitors.forEach(visitor => {
      pageCounts[visitor.page_url] = (pageCounts[visitor.page_url] || 0) + 1
    })
    
    stats.topPages = Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }))

    return { success: true, data: stats }
  } catch (error) {
    console.error('Erreur lors du calcul des stats visiteurs:', error)
    return { success: false, error }
  }
}

// Fonction pour obtenir les visiteurs en temps réel
export const getCurrentVisitors = async () => {
  try {
    const result = await getCurrentVisitorsWithRetry()
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      console.error('Erreur lors de la récupération des visiteurs actuels:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des visiteurs actuels:', error)
    return { success: false, error }
  }
}
