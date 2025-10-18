import React, { useEffect } from 'react'

const AppDetector = () => {
  useEffect(() => {
    const detectAndRedirect = () => {
      const ua = navigator.userAgent || navigator.vendor || window.opera

      // Détecter les applications tierces connues
      const inAppBrowsers = [
        'FBAN', // Facebook
        'FBAV', // Facebook
        'Instagram', // Instagram
        'Snapchat', // Snapchat
        'TwitterAndroid', // Twitter
        'TwitteriPhone', // Twitter
        'LinkedInApp', // LinkedIn
        'WhatsApp', // WhatsApp
        'Telegram', // Telegram
        'TikTok', // TikTok
        'Pinterest', // Pinterest
        'Line', // Line
        'KAKAOTALK', // KakaoTalk
        'MicroMessenger', // WeChat
        'QQ/', // QQ
        'Viber', // Viber
        'SkypeUriPreview', // Skype
        'Slack', // Slack
        'Discord', // Discord
        'Reddit', // Reddit
        'YouTube', // YouTube
        'Twitch', // Twitch
        'Spotify', // Spotify
      ]

      // Détecter les WebViews spécifiques
      const webViewPatterns = [
        /wv\)/i, // Android WebView
        /Version\/.*Chrome\/.*Mobile/i, // Chrome mobile dans app
        /CriOS/i, // Chrome iOS dans app
        /FxiOS/i, // Firefox iOS dans app
        /OPiOS/i, // Opera iOS dans app
        /EdgiOS/i, // Edge iOS dans app
      ]

      // Vérifier si on est dans une app tierce
      const isInAppBrowser = inAppBrowsers.some(pattern => ua.includes(pattern)) ||
                           webViewPatterns.some(pattern => pattern.test(ua))

      // Détecter les navigateurs natifs (pas dans une app)
      const isNativeBrowser = ua.includes('Chrome') && !ua.includes('wv') && !ua.includes('FBAN') ||
                             ua.includes('Safari') && !ua.includes('CriOS') && !ua.includes('FxiOS') ||
                             ua.includes('Firefox') && !ua.includes('FxiOS') ||
                             ua.includes('Edge') && !ua.includes('EdgiOS')

      // Si on est dans une app tierce, rediriger automatiquement
      if (isInAppBrowser && !isNativeBrowser) {
        const currentUrl = window.location.href
        
        // Redirection automatique pour forcer l'ouverture dans le navigateur par défaut
        setTimeout(() => {
          if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
            // iOS - Utiliser le scheme Safari pour forcer l'ouverture
            const safariUrl = `x-safari-${currentUrl}`
            window.location.href = safariUrl
            
            // Alternative avec window.open
            setTimeout(() => {
              const newWindow = window.open('', '_blank')
              if (newWindow) {
                newWindow.location.href = currentUrl
              }
            }, 100)
          } else if (navigator.userAgent.includes('Android')) {
            // Android - Utiliser l'intent Android pour forcer l'ouverture dans le navigateur
            const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`
            window.location.href = intentUrl
            
            // Alternative avec window.open
            setTimeout(() => {
              const newWindow = window.open('', '_blank')
              if (newWindow) {
                newWindow.location.href = currentUrl
              }
            }, 100)
          } else {
            // Desktop - Ouvrir dans un nouvel onglet
            window.open(currentUrl, '_blank', 'noopener,noreferrer')
          }
        }, 300)
      }
    }

    detectAndRedirect()
  }, [])

  // Ce composant ne rend rien visuellement
  return null
}

export default AppDetector

