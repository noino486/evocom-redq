import React from 'react'
import { motion } from 'framer-motion'
import { FaFire, FaClock, FaRocket } from 'react-icons/fa'

const FOMO = () => {
  return (
    <section className="py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl p-10 text-center relative overflow-hidden text-white card-shadow-lg"
        >
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <FaFire className="text-6xl text-orange-400 mx-auto" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Offre Limitée
            </h2>

            <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto opacity-95">
              « Nos packs sont disponibles en quantité restreinte pour assurer un suivi optimal. 
              Ne perdez pas de temps : profitez-en dès maintenant et démarrez votre projet. »
            </p>

            <div className="flex items-center justify-center gap-3 mb-8">
              <FaClock className="text-2xl animate-pulse" />
              <span className="text-lg font-semibold">Le temps presse ! Agissez maintenant</span>
            </div>

            <motion.button
              onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="px-10 py-4 bg-white text-primary text-lg font-bold rounded-full hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 card-shadow-lg flex items-center justify-center gap-2 mx-auto shine-effect group"
            >
              Je veux mon pack maintenant ! 
              <FaRocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FOMO

