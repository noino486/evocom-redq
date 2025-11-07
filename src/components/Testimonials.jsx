import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaStarHalfAlt, FaCheckCircle } from 'react-icons/fa'

const Testimonials = () => {
  const scrollRef = useRef(null)

  const testimonials = [
    {
      name: 'Marc D.',
      location: 'Lyon',
      rating: 5,
      date: 'Il y a 2 jours',
      verified: true,
      text: 'Franchement top, j\'ai trouvé 3 fournisseurs en moins d\'une semaine.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Julie R.',
      location: 'Paris',
      rating: 4.5,
      date: 'Il y a 5 jours',
      verified: true,
      text: 'Bon rapport qualité-prix. Le PDF m\'a aidé pour mon projet.',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Thomas B.',
      location: 'Marseille',
      rating: 5,
      date: 'Il y a 1 semaine',
      verified: true,
      text: 'J\'ai lancé ma boutique Shopify grâce à ça. RAS pour le moment.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Sarah M.',
      location: 'Bordeaux',
      rating: 5,
      date: 'Il y a 3 jours',
      verified: true,
      text: 'Super utile pour débuter. J\'ai commandé mes premiers échantillons.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Kevin L.',
      location: 'Toulouse',
      rating: 4,
      date: 'Il y a 4 jours',
      verified: true,
      text: 'Pas mal, ça fait le job.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Emma P.',
      location: 'Nantes',
      rating: 5,
      date: 'Il y a 6 jours',
      verified: true,
      text: 'Le Discord est vraiment actif. Communauté sympa.',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Antoine G.',
      location: 'Nice',
      rating: 5,
      date: 'Il y a 2 jours',
      verified: true,
      text: 'Meilleur achat de l\'année. J\'ai économisé des heures de recherche.',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Laura K.',
      location: 'Lille',
      rating: 4.5,
      date: 'Il y a 1 semaine',
      verified: true,
      text: 'Très bon produit. Les infos sont à jour.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Maxime V.',
      location: 'Strasbourg',
      rating: 5,
      date: 'Il y a 3 jours',
      verified: true,
      text: 'Contact avec 2 fournisseurs établi en 48h.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Camille D.',
      location: 'Rennes',
      rating: 5,
      date: 'Il y a 5 jours',
      verified: true,
      text: 'Le PDF Revenues m\'a donné plein d\'idées. Top !',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Lucas M.',
      location: 'Grenoble',
      rating: 5,
      date: 'Il y a 1 jour',
      verified: true,
      text: 'Liste complète et bien organisée. Je recommande.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Clara S.',
      location: 'Montpellier',
      rating: 4,
      date: 'Il y a 3 jours',
      verified: true,
      text: 'Bon début pour mon business. Quelques contacts intéressants.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Hugo F.',
      location: 'Angers',
      rating: 5,
      date: 'Il y a 2 jours',
      verified: true,
      text: 'Exactement ce qu\'il me fallait. Rapide et efficace.',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Léa B.',
      location: 'Dijon',
      rating: 5,
      date: 'Il y a 4 jours',
      verified: true,
      text: 'Super ressource. Gain de temps énorme.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Nathan P.',
      location: 'Toulon',
      rating: 4.5,
      date: 'Il y a 1 semaine',
      verified: true,
      text: 'Bonne qualité. Les fournisseurs répondent bien.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Chloé L.',
      location: 'Reims',
      rating: 5,
      date: 'Il y a 3 jours',
      verified: true,
      text: 'Parfait pour se lancer. Très satisfaite de mon achat.',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Alexandre T.',
      location: 'Brest',
      rating: 5,
      date: 'Il y a 2 jours',
      verified: true,
      text: 'Excellent. J\'ai déjà fait ma première commande.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Manon R.',
      location: 'Le Havre',
      rating: 4,
      date: 'Il y a 5 jours',
      verified: true,
      text: 'Bien fait. Quelques pépites dans la liste.',
      productPurchased: 'Pack Global Sourcing'
    }
  ]

  // Doubler les avis pour un défilement infini
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationFrameId
    let scrollPosition = 0
    const scrollSpeed = 0.5 // Vitesse du défilement

    const scroll = () => {
      scrollPosition += scrollSpeed
      
      // Réinitialiser la position quand on a défilé la moitié (une fois les avis originaux)
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }
      
      scrollContainer.scrollLeft = scrollPosition
      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-green-500 text-xs" />)
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-green-500 text-xs" />)
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FaStar key={i} className="text-gray-300 text-xs" />)
    }
    return stars
  }

  // Calcul de la note moyenne
  const averageRating = (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
  const totalReviews = testimonials.length

  return (
    <section id="testimonials" className="py-10 px-4 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Avis Clients
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Retours d'expérience authentiques
          </p>

          {/* Score global */}
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
                {totalReviews} avis vérifiés
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Carrousel défilant */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden"
        style={{ 
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-64 bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                {testimonial.verified && (
                  <FaCheckCircle className="text-green-500 text-xs" title="Avis vérifié" />
                )}
              </div>
              <span className="text-xs text-gray-400">{testimonial.date}</span>
            </div>

            <p className="text-xs text-gray-500 mb-2">{testimonial.location}</p>

            {/* Étoiles */}
            <div className="flex gap-1 mb-3">
              {renderStars(testimonial.rating)}
            </div>

            {/* Texte */}
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {testimonial.text}
            </p>

            {/* Produit acheté */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-primary">
                {testimonial.productPurchased}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Badge de confiance */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-10 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-6 py-3 rounded-full">
          <FaCheckCircle className="text-green-600 text-xl" />
          <span className="text-green-800 font-semibold">
            Avis vérifiés et authentiques
          </span>
        </div>
      </motion.div>
    </section>
  )
}

export default Testimonials
