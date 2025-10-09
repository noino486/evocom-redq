import React from 'react'
import { motion } from 'framer-motion'
import { FaGlobe, FaClock, FaLightbulb, FaArrowRight, FaRocket, FaCheckCircle } from 'react-icons/fa'
import { useAffiliate } from '../context/AffiliateContext'

const Hero = () => {
  const { getCurrentAffiliateCode } = useAffiliate()
  
  const scrollToProducts = () => {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' })
  }

  const affiliateCode = getCurrentAffiliateCode()

  return (
    <section id="hero" className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Développez Votre Business{' '}
              <span className="text-primary">à l'International</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Gagnez du temps, explorez des opportunités mondiales et démarrez votre business 
              avec des outils concrets et immédiatement disponibles.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={scrollToProducts}
                className="bg-gradient-to-r from-primary via-secondary to-accent text-white px-8 py-4 rounded-full font-semibold hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 card-shadow-lg shine-effect group"
              >
                Découvrir les Packs
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-gray-200 card-shadow"
              >
                Voir les Témoignages
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Accès Immédiat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Paiement Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Support 7j/7</span>
              </div>
            </div>
          </motion.div>

          {/* Right side - Feature cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid gap-4"
          >
            {[
              { 
                icon: FaGlobe, 
                title: 'Portée Internationale', 
                description: 'Accédez à des fournisseurs dans 50+ secteurs',
                color: 'bg-gradient-to-br from-primary to-secondary'
              },
              { 
                icon: FaClock, 
                title: 'Gain de Temps', 
                description: 'Plus besoin de chercher pendant des heures',
                color: 'bg-gradient-to-br from-secondary to-accent'
              },
              { 
                icon: FaLightbulb, 
                title: 'Ressources Exclusives', 
                description: 'PDF, guides et accès à notre communauté',
                color: 'bg-gradient-to-br from-accent to-primary'
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero

