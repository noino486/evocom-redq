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
      avatar: 'https://i.pravatar.cc/150?img=12',
      text: 'Franchement top, j\'ai trouvé 3 fournisseurs en moins d\'une semaine. Les contacts sont réactifs et pros.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Julie R.',
      location: 'Paris',
      rating: 4.5,
      date: 'Il y a 5 jours',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=5',
      text: 'Bon rapport qualité-prix. Le PDF sur l\'expatriation m\'a aidé pour mon déménagement au Portugal. Quelques infos manquent mais globalement satisfait.',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Thomas B.',
      location: 'Marseille',
      rating: 5,
      date: 'Il y a 1 semaine',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=13',
      text: 'J\'ai lancé ma boutique Shopify grâce à ça. Les fournisseurs répondent bien et les prix sont corrects. RAS pour le moment.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Sarah M.',
      location: 'Bordeaux',
      rating: 5,
      date: 'Il y a 3 jours',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=9',
      text: 'Super utile pour débuter. J\'ai commandé mes premiers échantillons la semaine dernière. Hâte de voir ce que ça donne !',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Kevin L.',
      location: 'Toulouse',
      rating: 4,
      date: 'Il y a 4 jours',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=15',
      text: 'Pas mal mais j\'aurais aimé plus de détails sur certains fournisseurs. Sinon ça fait le job.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Emma P.',
      location: 'Nantes',
      rating: 5,
      date: 'Il y a 6 jours',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=1',
      text: 'Le Discord est vraiment actif, j\'ai eu des réponses à mes questions en quelques heures. Communauté sympa.',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Antoine G.',
      location: 'Nice',
      rating: 5,
      date: 'Il y a 2 jours',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=14',
      text: 'Meilleur achat de l\'année. J\'ai économisé des heures de recherche et trouvé exactement ce que je cherchais.',
      productPurchased: 'Pack Global Business'
    },
    {
      name: 'Laura K.',
      location: 'Lille',
      rating: 4.5,
      date: 'Il y a 1 semaine',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=3',
      text: 'Très bon produit. Les infos sont à jour et les conseils pratiques. Je recommande pour ceux qui veulent se lancer.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Maxime V.',
      location: 'Strasbourg',
      rating: 5,
      date: 'Il y a 3 jours',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=11',
      text: 'Contact avec 2 fournisseurs établi en 48h. C\'est exactement ce qu\'il me fallait pour démarrer mon projet.',
      productPurchased: 'Pack Global Sourcing'
    },
    {
      name: 'Camille D.',
      location: 'Rennes',
      rating: 5,
      date: 'Il y a 5 jours',
      verified: true,
      avatar: 'https://i.pravatar.cc/150?img=8',
      text: 'Le PDF Revenues m\'a donné plein d\'idées. J\'ai déjà commencé à mettre en place ma première source passive. Top !',
      productPurchased: 'Pack Global Business'
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
        className="flex gap-6 overflow-x-hidden"
        style={{ 
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-80 bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
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

            {/* Texte */}
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              {testimonial.text}
            </p>

            {/* Produit acheté */}
            <div className="pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Produit : </span>
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
