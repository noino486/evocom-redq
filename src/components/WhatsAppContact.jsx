import React from 'react'
import { Phone, Mail, Clock } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

const WhatsAppContact = () => {
  // Numéro WhatsApp (format international sans + ni espaces)
  const whatsappNumber = '33123456789' // Remplacez par votre numéro
  const whatsappMessage = encodeURIComponent('Bonjour, je souhaite obtenir plus d\'informations sur vos packs digitaux.')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <section className="py-8 bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre principal */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Une Question ? 
            <span className="block text-green-600 mt-1">Contactez-Nous !</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans votre projet
          </p>
        </div>

        {/* Carte principale WhatsApp */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-100">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Partie gauche - Informations */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 md:p-8 text-white">
                <div className="mb-4">
                  <FaWhatsapp className="w-12 h-12 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">
                    Discutons de votre projet
                  </h3>
                  <p className="text-green-100">
                    Réponse instantanée
                  </p>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-green-200 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Disponibilité</p>
                      <p className="text-green-100 text-sm">Lun-Ven : 9h-19h</p>
                      <p className="text-green-100 text-sm">Sam : 10h-16h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-green-200 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Support dédié</p>
                      <p className="text-green-100 text-sm">Accompagnement personnalisé</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-200 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Réponse rapide</p>
                      <p className="text-green-100 text-sm">En moyenne sous 2h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partie droite - CTA WhatsApp */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <FaWhatsapp className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Parlons sur WhatsApp
                  </h4>
                  <p className="text-gray-600 text-sm">
                    La méthode la plus rapide pour nous joindre
                  </p>
                </div>

                {/* Bouton WhatsApp */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-center"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <FaWhatsapp className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Démarrer la conversation</span>
                  </div>
                  
                  {/* Animation de pulse */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </a>

                {/* Indicateurs de confiance */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>En ligne</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Note informative */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              💡 <span className="font-semibold">Astuce :</span> Préparez vos questions à l'avance pour un échange encore plus efficace !
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhatsAppContact

