import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCreditCard, FaCheck, FaStar, FaChevronRight, FaHome } from 'react-icons/fa'
import { useAffiliate } from '../context/AffiliateContext'
import { getProductBySlug, getRelatedProducts } from '../data/products'

const ProductDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getPaymentLink, getCurrentAffiliateCode } = useAffiliate()
  
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const foundProduct = getProductBySlug(slug)
    if (foundProduct) {
      setProduct(foundProduct)
      setSelectedImage(0)
      setRelatedProducts(getRelatedProducts(foundProduct.id))
      window.scrollTo(0, 0)
    } else {
      navigate('/')
    }
  }, [slug, navigate])

  if (!product) {
    return null
  }

  const Icon = product.icon

  const handlePurchase = () => {
    const paymentLink = getPaymentLink(product.id)
    window.open(paymentLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <FaHome /> Accueil
          </Link>
          <FaChevronRight className="text-xs" />
          <Link 
            to="/#products" 
            className="hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault()
              navigate('/')
              setTimeout(() => {
                const element = document.getElementById('products')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }, 100)
            }}
          >
            Produits
          </Link>
          <FaChevronRight className="text-xs" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Galerie d'images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Image principale */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200/50 mb-4 glow-effect-hover">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-[500px] object-cover"
              />
            </div>

            {/* Miniatures */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden transition-all border ${
                    selectedImage === index 
                      ? 'ring-2 ring-primary border-primary scale-105' 
                      : 'border-gray-200/50 hover:border-primary/50'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Informations produit */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge populaire */}
            {product.popular && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-secondary to-accent text-white px-4 py-2 rounded-full text-sm font-bold mb-4 glow-effect"
              >
                <FaStar className="text-yellow-300 animate-pulse" /> LE PLUS POPULAIRE
              </motion.div>
            )}

            {/* Catégorie */}
            <div className="text-sm text-gray-500 mb-2">
              Catégorie: <span className="gradient-text font-semibold">{product.category}</span>
            </div>

            {/* Titre */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Prix */}
            <div className="mb-6">
              {product.originalPrice && (
                <div className="mb-2">
                  <span className="text-3xl font-semibold text-gray-400 line-through">
                    {product.originalPrice.toFixed(2).replace('.', ',')}€
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold gradient-text">{product.price.toFixed(2).replace('.', ',')}€</span>
                <span className="text-gray-500">TTC</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                TVA incluse (20%) • Livraison instantanée par email
              </p>
            </div>

            {/* Description courte */}
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Achat Parallèle */}
            <div className="bg-gradient-to-br from-blue-50/50 to-pink-50/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <motion.button
                  onClick={handlePurchase}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-primary via-secondary to-accent text-white py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 shadow-lg shine-effect glow-effect-hover"
                >
                  <FaCreditCard />
                  Acheter maintenant
                </motion.button>

                <motion.button
                  onClick={() => window.open('https://wa.me/33756968108?text=Bonjour, je suis intéressé par le produit ' + encodeURIComponent(product.name), '_blank')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 shadow-lg shine-effect glow-effect-hover"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Nous contacter
                </motion.button>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FaCheck className="text-green-600" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaCheck className="text-green-600" />
                  <span>Accès instantané</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaCheck className="text-green-600" />
                  <span>Support WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Ce qui est inclus */}
            <div className="bg-gradient-to-br from-blue-50/50 to-pink-50/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-primary/20">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Ce qui est inclus :</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.includes.map((item, index) => {
                  const IncludeIcon = item.icon
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <IncludeIcon className="text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        {item.text === '+50 PDF Premium (+ 1000 pages)' ? (
                          <>
                            <span className="block sm:inline">+50 PDF Premium</span>
                            <span className="block sm:inline sm:ml-1">(+ 1000 pages)</span>
                          </>
                        ) : (
                          item.text
                        )}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <motion.span 
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium hover:border-primary/50 transition-colors"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Onglets de description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50">
            <h2 className="text-3xl font-bold text-primary mb-6">Description détaillée</h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {product.longDescription}
            </div>

            <div className="mt-8 pt-8 border-t border-primary/10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Fonctionnalités principales</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mt-1">
                      <FaCheck className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700">
                      {feature === 'Inclut tout le Pack Global Sourcing' ? (
                        <span className="font-bold text-accent">{feature}</span>
                      ) : (
                        feature
                      )}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-primary/10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Bénéfices clés</h3>
              <div className="space-y-4">
                {product.benefits.map((benefit, index) => {
                  const BenefitIcon = benefit.icon
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50/50 to-pink-50/50 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors"
                    >
                      <BenefitIcon className="text-2xl text-primary mt-1" />
                      <span className="text-gray-700 text-lg">{benefit.text}</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Produits similaires */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20"
          >
            <h2 className="text-3xl font-bold gradient-text mb-8">Vous pourriez aussi aimer</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedProducts.map((relatedProduct, index) => {
                const RelatedIcon = relatedProduct.icon
                return (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                  >
                    <Link
                      to={`/product/${relatedProduct.slug}`}
                      className="block bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:border-primary/50 transition-all duration-300 group h-full"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-xl ${relatedProduct.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <RelatedIcon className="text-2xl text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-colors">
                            {relatedProduct.name}
                          </h3>
                          <p className="text-gray-600 mb-3">{relatedProduct.shortDescription}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              {relatedProduct.originalPrice && (
                                <span className="text-lg font-semibold text-gray-400 line-through">
                                  {relatedProduct.originalPrice.toFixed(2).replace('.', ',')}€
                                </span>
                              )}
                              <span className="text-2xl font-bold gradient-text">{relatedProduct.price.toFixed(2).replace('.', ',')}€</span>
                            </div>
                            <span className="text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                              Voir le produit <FaChevronRight className="text-sm" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail

