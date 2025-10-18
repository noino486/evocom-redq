import { supabase } from '../config/supabase'

// Types de liens trackés
export const LINK_TYPES = {
  PRODUCT: 'product',
  AFFILIATE: 'affiliate',
  EXTERNAL: 'external',
  INTERNAL: 'internal'
}

// Fonction pour tracker un clic
export const trackClick = async (linkData) => {
  try {
    // Détection mobile robuste
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (typeof window !== 'undefined' && window.innerWidth <= 768) ||
                     (typeof window !== 'undefined' && window.screen.width <= 768)
    
    // Détection d'app tierce robuste
    const isInApp = isInAppBrowser()
    
    console.log('📱 Debug tracking mobile:', {
      userAgent: navigator.userAgent,
      isMobile,
      isInApp,
      screenWidth: typeof window !== 'undefined' ? window.screen.width : 'N/A',
      screenHeight: typeof window !== 'undefined' ? window.screen.height : 'N/A',
      innerWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A',
      innerHeight: typeof window !== 'undefined' ? window.innerHeight : 'N/A'
    })
    
    const clickData = {
      link_url: linkData.url,
      link_type: linkData.type || LINK_TYPES.EXTERNAL,
      link_text: linkData.text || '',
      affiliate_name: linkData.affiliateName || null,
      product_id: linkData.productId || null,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      is_mobile: isMobile,
      is_in_app: isInApp,
      click_source: linkData.source || 'unknown',
      affiliate_link_id: linkData.affiliateLinkId || null
    }

    // Envoyer les données à Supabase
    const { data, error } = await supabase
      .from('link_clicks')
      .insert([clickData])

    if (error) {
      console.error('Erreur lors du tracking:', error)
      return { success: false, error }
    }

    console.log('✅ Clic tracké avec succès:', clickData)
    return { success: true, data }
  } catch (error) {
    console.error('Erreur lors du tracking:', error)
    return { success: false, error }
  }
}

// Fonction pour détecter si on est dans une app tierce
export const isInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera
  
  const inAppBrowsers = [
    'FBAN', 'FBAV', 'Instagram', 'Snapchat', 'TwitterAndroid', 'TwitteriPhone',
    'LinkedInApp', 'WhatsApp', 'Telegram', 'TikTok', 'Pinterest', 'Line',
    'KAKAOTALK', 'MicroMessenger', 'QQ/', 'Viber', 'SkypeUriPreview', 'Slack',
    'Discord', 'Reddit', 'YouTube', 'Twitch', 'Spotify'
  ]

  const webViewPatterns = [
    /wv\)/i, // Android WebView
    /Version\/.*Chrome\/.*Mobile/i, // Chrome mobile dans app
    /CriOS/i, // Chrome iOS dans app
    /FxiOS/i, // Firefox iOS dans app
    /OPiOS/i, // Opera iOS dans app
    /EdgiOS/i // Edge iOS dans app
  ]

  const isInApp = inAppBrowsers.some(pattern => ua.includes(pattern)) ||
                  webViewPatterns.some(pattern => pattern.test(ua))

  console.log('🔍 Debug isInAppBrowser:', {
    userAgent: ua,
    isInApp,
    detectedPatterns: inAppBrowsers.filter(pattern => ua.includes(pattern)),
    detectedWebViews: webViewPatterns.filter(pattern => pattern.test(ua))
  })

  return isInApp
}

// Fonction pour créer un lien tracké
export const createTrackedLink = (url, options = {}) => {
  const {
    text = '',
    type = LINK_TYPES.EXTERNAL,
    affiliateName = null,
    productId = null,
    source = 'unknown',
    className = '',
    target = '_blank',
    onClick = null
  } = options

  const handleClick = async (e) => {
    // Appeler la fonction onClick personnalisée si fournie
    if (onClick) {
      onClick(e)
    }

    // Tracker le clic
    await trackClick({
      url,
      text,
      type,
      affiliateName,
      productId,
      source
    })

    // Si c'est un lien externe, ouvrir dans un nouvel onglet
    if (target === '_blank') {
      e.preventDefault()
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return {
    href: url,
    onClick: handleClick,
    className,
    target,
    'data-tracked': 'true'
  }
}

// Fonction pour obtenir les statistiques de clics
export const getClickStats = async (filters = {}) => {
  try {
    let query = supabase
      .from('link_clicks')
      .select('*')

    // Appliquer les filtres
    if (filters.dateFrom) {
      query = query.gte('timestamp', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('timestamp', filters.dateTo)
    }
    if (filters.linkType) {
      query = query.eq('link_type', filters.linkType)
    }
    if (filters.affiliateName) {
      query = query.eq('affiliate_name', filters.affiliateName)
    }
    if (filters.source) {
      query = query.eq('click_source', filters.source)
    }

    const { data, error } = await query.order('timestamp', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des stats:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error)
    return { success: false, error }
  }
}

// Fonction pour obtenir les statistiques agrégées
export const getAggregatedStats = async (filters = {}) => {
  try {
    const { data: clicks, error } = await getClickStats(filters)
    
    if (error) {
      return { success: false, error }
    }

    // Calculer les statistiques agrégées
    const stats = {
      totalClicks: clicks.length,
      clicksByType: {},
      clicksByAffiliate: {},
      clicksBySource: {},
      clicksByDay: {},
      mobileClicks: 0,
      inAppClicks: 0,
      topLinks: [],
      affiliateLinkStats: {} // Nouveau: stats par lien affilié
    }

    clicks.forEach(click => {
      // Par type
      stats.clicksByType[click.link_type] = (stats.clicksByType[click.link_type] || 0) + 1
      
      // Par affilié
      if (click.affiliate_name) {
        stats.clicksByAffiliate[click.affiliate_name] = (stats.clicksByAffiliate[click.affiliate_name] || 0) + 1
      }
      
      // Par source
      if (click.click_source) {
        stats.clicksBySource[click.click_source] = (stats.clicksBySource[click.click_source] || 0) + 1
      }
      
      // Par jour
      const day = click.timestamp.split('T')[0]
      stats.clicksByDay[day] = (stats.clicksByDay[day] || 0) + 1
      
      // Mobile/App
      if (click.is_mobile) stats.mobileClicks++
      if (click.is_in_app) stats.inAppClicks++

      // Stats par influenceur
      if (click.affiliate_name) {
        if (!stats.affiliateLinkStats[click.affiliate_name]) {
          stats.affiliateLinkStats[click.affiliate_name] = {
            influenceur: click.affiliate_name,
            total_clicks: 0,
            mobile_clicks: 0,
            in_app_clicks: 0,
            unique_links: new Set(),
            first_click: click.timestamp,
            last_click: click.timestamp
          }
        }
        
        stats.affiliateLinkStats[click.affiliate_name].total_clicks++
        if (click.is_mobile) stats.affiliateLinkStats[click.affiliate_name].mobile_clicks++
        if (click.is_in_app) stats.affiliateLinkStats[click.affiliate_name].in_app_clicks++
        stats.affiliateLinkStats[click.affiliate_name].unique_links.add(click.link_url)
        
        // Mettre à jour les dates
        if (click.timestamp < stats.affiliateLinkStats[click.affiliate_name].first_click) {
          stats.affiliateLinkStats[click.affiliate_name].first_click = click.timestamp
        }
        if (click.timestamp > stats.affiliateLinkStats[click.affiliate_name].last_click) {
          stats.affiliateLinkStats[click.affiliate_name].last_click = click.timestamp
        }
      }
    })

    // Top liens
    const linkCounts = {}
    clicks.forEach(click => {
      linkCounts[click.link_url] = (linkCounts[click.link_url] || 0) + 1
    })
    
    stats.topLinks = Object.entries(linkCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }))

    return { success: true, data: stats }
  } catch (error) {
    console.error('Erreur lors du calcul des stats:', error)
    return { success: false, error }
  }
}
