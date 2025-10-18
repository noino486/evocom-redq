import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaExternalLinkAlt, FaTimes } from 'react-icons/fa'

const AppDetector = () => {
  const [showRedirectModal, setShowRedirectModal] = useState(false)
  const [isInApp, setIsInApp] = useState(false)
  const [userAgent, setUserAgent] = useState('')

  useEffect(() => {
    const detectInAppBrowser = () => {
      const ua = navigator.userAgent || navigator.vendor || window.opera
      setUserAgent(ua)

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
        'AppleWebKit/.*Mobile.*Safari', // Safari mobile (dans certaines apps)
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

      setIsInApp(isInAppBrowser && !isNativeBrowser)

      // Afficher le modal si on est dans une app tierce
      if (isInAppBrowser && !isNativeBrowser) {
        setShowRedirectModal(true)
      }
    }

    detectInAppBrowser()
  }, [])

  const handleOpenInBrowser = () => {
    const currentUrl = window.location.href
    
    // Essayer différentes méthodes selon l'appareil
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      // iOS - essayer d'ouvrir dans Safari
      const safariUrl = `x-web-search://?${currentUrl}`
      window.location.href = safariUrl
      
      // Fallback après 2 secondes
      setTimeout(() => {
        window.open(currentUrl, '_blank')
      }, 2000)
    } else if (navigator.userAgent.includes('Android')) {
      // Android - essayer d'ouvrir dans le navigateur par défaut
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
      window.location.href = intentUrl
      
      // Fallback
      setTimeout(() => {
        window.open(currentUrl, '_blank')
      }, 2000)
    } else {
      // Desktop ou autres - ouvrir dans un nouvel onglet
      window.open(currentUrl, '_blank')
    }
  }

  const handleCloseModal = () => {
    setShowRedirectModal(false)
  }

  return (
    <AnimatePresence>
      {showRedirectModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Ouvrir dans le navigateur
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Pour une meilleure expérience, nous vous recommandons d'ouvrir ce lien dans votre navigateur par défaut.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Détecté :</strong> Vous naviguez depuis une application tierce
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  App détectée : {userAgent.includes('FBAN') ? 'Facebook' : 
                                 userAgent.includes('Instagram') ? 'Instagram' :
                                 userAgent.includes('Snapchat') ? 'Snapchat' :
                                 userAgent.includes('Twitter') ? 'Twitter' :
                                 userAgent.includes('WhatsApp') ? 'WhatsApp' :
                                 userAgent.includes('Telegram') ? 'Telegram' :
                                 userAgent.includes('TikTok') ? 'TikTok' :
                                 'Application tierce'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleOpenInBrowser}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FaExternalLinkAlt />
                Ouvrir dans le navigateur
              </button>
              
              <button
                onClick={handleCloseModal}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
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
