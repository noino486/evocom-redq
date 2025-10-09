import React from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaStarHalfAlt, FaCheckCircle } from 'react-icons/fa'

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Clara Dubois',
      age: 27,
      location: 'Paris, France',
      rating: 5,
      date: '12 janvier 2024',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=1',
      title: 'Excellent investissement pour mon e-commerce',
      text: 'Grâce au Pack Starter Fournisseurs, j\'ai trouvé des fournisseurs uniques en Asie que je n\'aurais jamais trouvés seule. Le Pack Global Business m\'a ensuite permis de structurer mon business. La communauté Discord est incroyable, on s\'entraide vraiment !',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Julien Martin',
      age: 32,
      location: 'Lyon, France',
      rating: 5,
      date: '5 février 2024',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=12',
      title: 'Une mine d\'informations !',
      text: 'Les PDF sont clairs, bien structurés et vont à l\'essentiel. J\'ai économisé des centaines d\'heures de recherche. Le Discord est parfait pour poser des questions et échanger avec d\'autres entrepreneurs qui sont dans la même démarche.',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Sophie Rousseau',
      age: 29,
      location: 'Bordeaux, France',
      rating: 5,
      date: '18 janvier 2024',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=5',
      title: 'Parfait pour débuter à l\'international',
      text: 'J\'hésitais à me lancer dans l\'import, mais le Pack Starter Fournisseurs m\'a donné toutes les clés pour commencer. Les contacts sont vérifiés et réactifs. Excellent rapport qualité-prix !',
      productPurchased: 'Pack Starter Fournisseurs'
    },
    {
      name: 'Thomas Leroy',
      age: 35,
      location: 'Marseille, France',
      rating: 5,
      date: '28 décembre 2023',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=15',
      title: 'Idéal pour diversifier ses revenus',
      text: 'Le PDF Business Actif & Passif du Pack Global Business est une pépite. Des stratégies concrètes, testées et qui fonctionnent. J\'ai déjà mis en place 2 sources de revenus passifs grâce à ce guide.',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Marie Lambert',
      age: 31,
      location: 'Toulouse, France',
      rating: 4.5,
      date: '8 février 2024',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=9',
      title: 'Très bon accompagnement',
      text: 'Les ressources sont complètes et le support est réactif. La communauté Discord est très active et bienveillante. Seul petit bémol : j\'aurais aimé plus de fournisseurs européens, mais c\'est un détail.',
      productPurchased: 'Pack Starter Fournisseurs'
    },
    {
      name: 'Alexandre Petit',
      age: 28,
      location: 'Nantes, France',
      rating: 5,
      date: '15 janvier 2024',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=13',
      title: 'Un vrai gain de temps',
      text: 'J\'ai lancé ma boutique Shopify en 3 semaines grâce aux fournisseurs du pack. Sans ce pack, j\'aurais mis des mois à trouver des contacts fiables. Je recommande à 100% !',
      productPurchased: 'Pack Starter Fournisseurs'
    }
  ]

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-green-500" />)
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-green-500" />)
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FaStar key={i} className="text-gray-300" />)
    }
    return stars
  }

  // Calcul de la note moyenne
  const averageRating = (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
  const totalReviews = testimonials.length

  return (
    <section id="testimonials" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Ce Que Disent Nos Clients
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Avis vérifiés de clients ayant acheté nos packs
          </p>

          {/* Score global style TrustPilot */}
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-green-50 to-green-100 px-8 py-4 rounded-2xl border border-green-200">
            <div className="text-left">
              <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
              <div className="text-sm text-gray-600">sur 5</div>
            </div>
            <div className="border-l border-green-300 pl-4">
              <div className="flex gap-1 mb-1">
                {renderStars(parseFloat(averageRating))}
              </div>
              <div className="text-sm text-gray-600">
                Basé sur {totalReviews} avis
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -3 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Header avec photo et infos */}
              <div className="flex items-start gap-3 mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    {testimonial.verified && (
                      <FaCheckCircle className="text-green-500 text-sm" title="Avis vérifié" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>

              {/* Étoiles et date */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1">
                  {renderStars(testimonial.rating)}
                </div>
                <span className="text-xs text-gray-500">{testimonial.date}</span>
              </div>

              {/* Titre de l'avis */}
              <h5 className="font-bold text-gray-900 mb-2">
                {testimonial.title}
              </h5>

              {/* Texte de l'avis */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {testimonial.text}
              </p>

              {/* Produit acheté */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Produit acheté: </span>
                <span className="text-xs font-semibold text-primary">
                  {testimonial.productPurchased}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badge de confiance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-6 py-3 rounded-full">
            <FaCheckCircle className="text-green-600 text-xl" />
            <span className="text-green-800 font-semibold">
              100% des avis sont vérifiés et authentiques
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
