import React from 'react'
import { motion } from 'framer-motion'
import { FaShoppingCart, FaCreditCard, FaEnvelope, FaRocket } from 'react-icons/fa'

const Process = () => {
  const steps = [
    {
      icon: FaShoppingCart,
      title: 'Choisissez votre pack',
      description: 'Sélectionnez le pack qui correspond à vos besoins',
      color: 'bg-gradient-to-br from-primary to-secondary'
    },
    {
      icon: FaCreditCard,
      title: 'Payez en ligne',
      description: 'Paiement 100% sécurisé via Stripe',
      color: 'bg-gradient-to-br from-secondary to-accent'
    },
    {
      icon: FaEnvelope,
      title: 'Recevez vos accès',
      description: 'Email immédiat avec vos PDF téléchargeables',
      color: 'bg-gradient-to-br from-accent to-primary'
    },
    {
      icon: FaRocket,
      title: 'Commencez maintenant',
      description: 'Utilisez vos ressources dès l\'achat',
      color: 'bg-gradient-to-br from-primary to-accent'
    }
  ]

  return (
    <section className="pt-6 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Comment Ça Marche&nbsp;?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Un processus simple en 4 étapes
          </p>
          <div className="bg-blue-100 inline-block px-8 py-4 rounded-full">
            <p className="text-lg font-semibold text-primary">
              « Achetez maintenant, recevez vos accès instantanément dans votre boîte mail. »
            </p>
          </div>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="relative"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200/50 hover:border-primary/50 transition-all duration-300 h-full group">
                    <div className="relative inline-block mb-4">
                      <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="text-3xl text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Process

