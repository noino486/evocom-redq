import React from 'react'
import { motion } from 'framer-motion'
import { FaGlobe, FaClock, FaLightbulb, FaChartLine } from 'react-icons/fa'

const WhyChoose = () => {
  const reasons = [
    {
      icon: FaGlobe,
      title: 'Portée internationale',
      description: 'Accès à des fournisseurs du monde entier',
      color: 'bg-gradient-to-br from-primary to-secondary'
    },
    {
      icon: FaClock,
      title: 'Gain de temps',
      description: 'Évitez des heures de recherches fastidieuses',
      color: 'bg-gradient-to-br from-secondary to-accent'
    },
    {
      icon: FaLightbulb,
      title: 'Ressources exclusives',
      description: 'Guides, stratégies, communauté (Visionnaire Pack)',
      color: 'bg-gradient-to-br from-accent to-primary'
    },
    {
      icon: FaChartLine,
      title: 'Avantages concrets',
      description: 'Inspiration, opportunités, apprentissage rapide',
      color: 'bg-gradient-to-br from-primary to-accent'
    }
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Pourquoi Choisir Nos Packs ?
          </h2>
          <p className="text-xl text-gray-600">
            Des avantages concrets pour votre réussite
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:border-primary/50 transition-all duration-300 group"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${reason.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{reason.title}</h3>
                <p className="text-gray-600">{reason.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhyChoose

