import React from 'react'
import { motion } from 'framer-motion'
import { FaCheck, FaTimes } from 'react-icons/fa'

const Comparison = () => {
  const features = [
    { name: 'Liste de fournisseurs', global: true, visionnaire: true },
    { name: 'Pack PDF Expatriation', global: false, visionnaire: true },
    { name: 'Pack PDF Revenues actif passif', global: false, visionnaire: true },
    { name: 'Accès Discord privé', global: false, visionnaire: true },
  ]

  return (
    <section className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Comparatif des Packs
          </h2>
          <p className="text-xl text-gray-600">
            Trouvez le pack adapté à vos besoins
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200/50"
        >
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-primary via-secondary to-accent text-white">
            <div className="font-bold text-lg">Fonctionnalité</div>
            <div className="font-bold text-lg text-center">Pack Global Sourcing</div>
            <div className="font-bold text-lg text-center">Pack Global Business</div>
          </div>

          {/* Features rows */}
          <div className="divide-y divide-gray-200">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="grid grid-cols-3 gap-4 p-6 hover:bg-blue-50 transition-colors"
              >
                <div className="text-gray-700 font-medium">{feature.name}</div>
                <div className="flex justify-center">
                  {feature.global ? (
                    <FaCheck className="text-2xl text-green-500" />
                  ) : (
                    <FaTimes className="text-2xl text-red-500" />
                  )}
                </div>
                <div className="flex justify-center">
                  {feature.visionnaire ? (
                    <FaCheck className="text-2xl text-green-500" />
                  ) : (
                    <FaTimes className="text-2xl text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}

            {/* Price row */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: features.length * 0.1, duration: 0.4 }}
              className="grid grid-cols-3 gap-4 p-6 bg-blue-50"
            >
              <div className="font-bold text-lg text-gray-900">Prix</div>
              <div className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-semibold text-gray-400 line-through">39,99 €</span>
                  <span className="text-2xl font-bold text-primary">29,90 €</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-semibold text-gray-400 line-through">49,99 €</span>
                  <span className="text-2xl font-bold text-primary">39,90 €</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Comparison

