import React from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Sparkles } from 'lucide-react'
import { FaDiscord } from 'react-icons/fa'

const DiscordCommunity = () => {
  return (
    <section className="py-10 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Lancement de notre communauté
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mt-2">
              Discord Exclusive
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Avec le <span className="font-bold text-purple-600">Pack Global Business</span>, accédez à notre serveur Discord privé
          </p>
        </motion.div>

        {/* Carte principale Discord */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-100">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Partie gauche - Avantages */}
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-10 text-white">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                    <FaDiscord className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">
                    Communauté Active
                  </h3>
                  <p className="text-indigo-100 text-lg">
                    Échangez avec des entrepreneurs passionnés
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg mb-1">Réseau d'entrepreneurs</p>
                      <p className="text-indigo-100 text-sm">
                        Connectez-vous avec d'autres membres qui partagent vos ambitions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg mb-1">Conseils & Stratégies</p>
                      <p className="text-indigo-100 text-sm">
                        Partagez vos expériences et apprenez des succès des autres
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg mb-1">Opportunités exclusives</p>
                      <p className="text-indigo-100 text-sm">
                        Accès prioritaire aux nouvelles ressources et offres spéciales
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partie droite - CTA */}
              <div className="p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-white to-purple-50">
                <div className="text-center">
                  {/* Logo Discord stylisé */}
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-100 rounded-3xl mb-6 relative">
                    <FaDiscord className="w-12 h-12 text-indigo-600" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">
                    Serveur Discord Privé
                  </h4>
                  <p className="text-gray-600 mb-2">
                    Réservé aux membres du Pack Global Business
                  </p>

                  {/* Note */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xl text-gray-700 text-center font-medium">
                      ✨ <span className="font-bold text-purple-600">Accès inclus</span> avec le Pack Global Business
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default DiscordCommunity

