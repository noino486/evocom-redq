import React from 'react'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaFileContract, FaLock, FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const LegalNotice = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Bouton retour */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
        >
          <FaArrowLeft />
          <span>Retour à l'accueil</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
        >
          {/* En-tête */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl mb-4">
              <FaFileContract className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Mentions Légales
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Contenu */}
          <div className="prose prose-lg max-w-none">
            {/* Éditeur du site */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-primary" />
                Éditeur du site
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="mb-2"><strong>Nom de l'entreprise :</strong> [Votre nom d'entreprise]</p>
                <p className="mb-2"><strong>Forme juridique :</strong> [Auto-entrepreneur / SARL / SAS / etc.]</p>
                <p className="mb-2"><strong>Adresse :</strong> [Votre adresse complète]</p>
                <p className="mb-2"><strong>SIRET :</strong> [Votre numéro SIRET]</p>
                <p className="mb-2"><strong>Email :</strong> contact@evoecom.com</p>
                <p className="mb-2"><strong>Téléphone :</strong> [Votre numéro de téléphone]</p>
              </div>
            </section>

            {/* Directeur de publication */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Directeur de publication</h2>
              <p className="text-gray-700">
                <strong>[Votre nom et prénom]</strong>, en qualité de [gérant / directeur / fondateur].
              </p>
            </section>

            {/* Hébergement */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hébergement</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="mb-2"><strong>Hébergeur :</strong> [Netlify / Vercel / autre]</p>
                <p className="mb-2"><strong>Adresse :</strong> [Adresse de l'hébergeur]</p>
                <p className="mb-2"><strong>Site web :</strong> [URL de l'hébergeur]</p>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Propriété intellectuelle</h2>
              <p className="text-gray-700 mb-4">
                L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes, etc.) est la propriété exclusive 
                de [Votre nom d'entreprise], sauf mention contraire.
              </p>
              <p className="text-gray-700">
                Toute reproduction, distribution, modification ou utilisation de tout ou partie du contenu du site sans 
                autorisation écrite préalable est strictement interdite et peut faire l'objet de poursuites judiciaires.
              </p>
            </section>

            {/* Protection des données */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaLock className="text-primary" />
                Protection des données personnelles
              </h2>
              <p className="text-gray-700 mb-4">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
                vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles 
                vous concernant.
              </p>
              <p className="text-gray-700 mb-4">
                Les données collectées sur ce site sont uniquement destinées à :
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>La gestion des commandes et la livraison des produits digitaux</li>
                <li>Le traitement des paiements via notre prestataire sécurisé</li>
                <li>L'envoi d'informations relatives à vos achats</li>
                <li>L'amélioration de nos services</li>
              </ul>
              <p className="text-gray-700">
                Pour exercer vos droits, vous pouvez nous contacter à l'adresse : 
                <strong> contact@evoecom.com</strong>
              </p>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
              <p className="text-gray-700 mb-4">
                Ce site peut utiliser des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques de visites.
              </p>
              <p className="text-gray-700">
                Vous pouvez à tout moment configurer votre navigateur pour refuser les cookies. Notez cependant que certaines 
                fonctionnalités du site pourraient ne pas fonctionner correctement.
              </p>
            </section>

            {/* Responsabilité */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation de responsabilité</h2>
              <p className="text-gray-700 mb-4">
                [Votre nom d'entreprise] s'efforce de fournir des informations aussi précises que possible. Toutefois, nous ne 
                pouvons garantir l'exactitude, l'exhaustivité ou la pertinence des informations diffusées sur le site.
              </p>
              <p className="text-gray-700">
                En conséquence, [Votre nom d'entreprise] décline toute responsabilité pour toute imprécision, inexactitude ou 
                omission portant sur des informations disponibles sur le site.
              </p>
            </section>

            {/* Droit applicable */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Droit applicable</h2>
              <p className="text-gray-700">
                Les présentes mentions légales sont soumises au droit français. En cas de litige, et après l'échec de toute 
                tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-primary/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-700 mb-2">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
              </p>
              <ul className="text-gray-700 space-y-2">
                <li><strong>Par email :</strong> contact@evoecom.com</li>
                <li><strong>Par courrier :</strong> [Votre adresse postale]</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LegalNotice

