import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaStar, FaCheck, FaCreditCard, FaEye } from 'react-icons/fa'
import { useAffiliate } from '../context/AffiliateContext'
import { products } from '../data/products'
import { trackClick, LINK_TYPES } from '../utils/clickTracker'

const Products = () => {
  const { getPaymentLink, getCurrentAffiliateCode } = useAffiliate()

  // Fonction pour tracker les clics sur les liens d'achat
  const handlePurchaseClick = async (product, event) => {
    const paymentUrl = getPaymentLink(product.id)
    const affiliateCode = getCurrentAffiliateCode()
    
    // Tracker le clic avec l'ID de l'influenceur
    await trackClick({
      url: paymentUrl,
      text: `Acheter ${product.name}`,
      type: LINK_TYPES.AFFILIATE,
      affiliateName: affiliateCode || 'default',
      productId: product.id,
      source: 'products_section',
      affiliateLinkId: affiliateCode || 'default' // ID unique pour l'influenceur
    })
  }

  return (
    <section id="products" data-section="products_section" className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Nos Packs Digitaux
          </h2>
          <p className="text-xl text-gray-600">
            Choisissez le pack qui correspond à vos ambitions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {products.map((product, index) => {
            const Icon = product.icon
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 ${
                  product.popular ? 'border-2 border-primary glow-effect-hover scale-105' : 'border border-gray-200/50 hover:border-primary/30'
                }`}
              >
                {product.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary via-secondary to-accent text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <FaStar className="text-yellow-300" /> LE PLUS POPULAIRE
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${product.color} mb-4`}>
                    <Icon className="text-2xl text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-gray-900">{product.name}</h3>
                  <p className="text-gray-600 text-lg">{product.shortDescription}</p>
                </div>

                <div className="mb-6">
                  <div className="text-center mb-8">
                    <span className="text-5xl font-bold text-primary">{product.price.toFixed(2).replace('.', ',')}€</span>
                    <span className="text-gray-500 text-lg ml-2">TTC</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    {product.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <FaCheck className="text-green-600 text-xs" />
                        </div>
                        <span className="text-gray-700">
                          {feature === 'Inclut tout le Pack Global Sourcing' ? (
                            <span className="font-bold text-accent">{feature}</span>
                          ) : (
                            feature
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6 p-5 bg-gradient-to-br from-blue-50/50 to-pink-50/50 rounded-xl border border-primary/20">
                  <h4 className="text-lg font-semibold mb-3 text-gray-900">Bénéfices :</h4>
                  <div className="space-y-3">
                    {product.benefits.map((benefit, i) => {
                      const BenefitIcon = benefit.icon
                      return (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <BenefitIcon className="text-lg text-primary mt-0.5" />
                          <span>{benefit.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/product/${product.slug}`}
                    className="flex-1 bg-white border-2 border-primary text-primary py-4 rounded-full font-bold text-lg hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shine-effect"
                  >
                    <FaEye />
                    Voir détails
                  </Link>
                  <a
                    href={getPaymentLink(product.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handlePurchaseClick(product, e)}
                    className="flex-1 bg-gradient-to-r from-primary via-secondary to-accent text-white py-4 rounded-full font-bold text-lg hover:scale-105 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shine-effect glow-effect-hover"
                  >
                    <FaCreditCard />
                    Acheter
                  </a>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Trust section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-8 bg-gradient-to-br from-blue-50/50 to-pink-50/50 rounded-2xl px-8 py-6 border border-primary/20">
            <div className="flex items-center gap-2">
              <FaCheck className="text-2xl text-green-600" />
              <span className="text-gray-700 font-medium">Paiement 100% Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheck className="text-2xl text-green-600" />
              <span className="text-gray-700 font-medium">Accès Instantané</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Products