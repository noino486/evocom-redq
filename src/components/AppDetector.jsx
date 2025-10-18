import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaExternalLinkAlt, FaTimes, FaGlobe, FaMobile } from 'react-icons/fa'

const AppDetector = () => {
  const [showSnapchatModal, setShowSnapchatModal] = useState(false)
  const [isSnapchat, setIsSnapchat] = useState(false)

  useEffect(() => {
    const detectAndHandle = () => {
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

      // Si on est dans une app tierce
      if (isInAppBrowser && !isNativeBrowser) {
        const isSnapchatDetected = ua.includes('Snapchat')
        setIsSnapchat(isSnapchatDetected)
        
        if (isSnapchatDetected) {
          // Pour Snapchat, afficher le modal au lieu de rediriger automatiquement
          setTimeout(() => {
            setShowSnapchatModal(true)
          }, 1000) // Délai de 1 seconde pour laisser la page se charger
        } else {
          // Pour les autres apps, redirection automatique
          const currentUrl = window.location.href
          
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
    }

    detectAndHandle()
  }, [])

  const handleOpenInBrowser = () => {
    const currentUrl = window.location.href
    
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      // iOS - Essayer d'ouvrir dans Safari
      const safariUrl = `x-safari-${currentUrl}`
      window.location.href = safariUrl
      
      // Fallback
      setTimeout(() => {
        window.open(currentUrl, '_blank')
      }, 1000)
    } else if (navigator.userAgent.includes('Android')) {
      // Android - Essayer d'ouvrir dans le navigateur par défaut
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`
      window.location.href = intentUrl
      
      // Fallback
      setTimeout(() => {
        window.open(currentUrl, '_blank')
      }, 1000)
    } else {
      // Desktop - Ouvrir dans un nouvel onglet
      window.open(currentUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleCloseModal = () => {
    setShowSnapchatModal(false)
  }

  return (
    <AnimatePresence>
      {showSnapchatModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                  <FaGlobe className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Ouvrir dans le navigateur
                  </h3>
                  <p className="text-sm text-gray-600">Pour une meilleure expérience</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-4 border border-yellow-200">
                <div className="flex items-center gap-3 mb-2">
                  <FaMobile className="text-yellow-600" />
                  <span className="font-semibold text-gray-900">Détecté : Snapchat</span>
                </div>
                <p className="text-sm text-gray-700">
                  Pour profiter pleinement de notre site, nous vous recommandons de l'ouvrir dans votre navigateur par défaut.
                </p>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Navigation plus fluide</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Fonctionnalités complètes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Meilleure performance</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleOpenInBrowser}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-3"
              >
                <FaExternalLinkAlt />
                Ouvrir dans le navigateur
              </button>
              
              <button
                onClick={handleCloseModal}
                className="px-6 py-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Continuer ici
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AppDetector

