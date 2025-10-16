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
            {/* Introduction */}
            <section className="mb-8">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 mb-6">
                <p className="text-gray-700 mb-4">
                  Les présentes Conditions Générales de Vente et d'Utilisation (ci-après « CGV & CGU ») régissent les relations contractuelles entre <strong>TRIUM TRADE</strong>, société par actions simplifiée immatriculée au RCS de Paris sous le numéro <strong>990 320 590</strong>, dont le siège social est situé au <strong>231 rue Saint-Honoré, 75001 Paris</strong>, agissant pour la distribution de ses produits sous la marque <strong>EVO ECOM</strong> (ci-après « EVO ECOM »), et toute personne physique ou morale procédant à un achat ou utilisant le site internet <a href="https://evoecom.com" className="text-primary hover:underline">https://evoecom.com</a> (ci-après « le Site »).
                </p>
                <p className="text-gray-700 font-semibold">
                  En utilisant le Site ou en procédant à un achat, l'utilisateur (ci-après « le Client ») accepte sans réserve les présentes CGV & CGU.
                </p>
              </div>
            </section>

            {/* Article 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 1 - Objet</h2>
              <p className="text-gray-700">
                Les présentes CGV & CGU définissent les conditions dans lesquelles EVO ECOM commercialise et met à disposition des contenus numériques, guides, ressources et autres produits en ligne, ainsi que les conditions d'utilisation du Site.
              </p>
            </section>

            {/* Article 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 2 - Produits et Services</h2>
              <p className="text-gray-700 mb-4">
                EVO ECOM propose à la vente des <strong>fichiers numériques</strong> et <strong>packs de ressources</strong> destinés aux entrepreneurs et utilisateurs souhaitant développer leur activité. Ces contenus peuvent comprendre notamment :
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Des fichiers PDF (guides, check-lists, modèles),</li>
                <li>Des archives compressées (ZIP) contenant plusieurs ressources,</li>
                <li>Des accès en ligne via une plateforme sécurisée,</li>
                <li>Des bonus (contacts, templates, guides additionnels).</li>
              </ul>
              <p className="text-gray-700">
                Les produits proposés sont décrits le plus précisément possible sur le Site. Toutefois, des différences minimes peuvent exister, ce que le Client reconnaît et accepte.
              </p>
            </section>

            {/* Article 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 3 - Prix</h2>
              <p className="text-gray-700 mb-2">
                Les prix sont indiqués en euros, toutes taxes comprises (TTC).
              </p>
              <p className="text-gray-700">
                EVO ECOM se réserve le droit de modifier ses prix à tout moment, étant précisé que le prix appliqué est celui en vigueur au moment de la validation de la commande.
              </p>
            </section>

            {/* Article 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 4 - Commande et Paiement</h2>
              <p className="text-gray-700 mb-4">
                Les commandes sont passées exclusivement en ligne sur le Site.
              </p>
              <p className="text-gray-700 mb-4">
                Le Client sélectionne le produit souhaité, procède au paiement via les moyens sécurisés proposés et reçoit après confirmation de la transaction :
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Soit un <strong>lien de téléchargement direct</strong> (fichiers numériques),</li>
                <li>Soit un <strong>courriel avec identifiants d'accès</strong> pour la plateforme en ligne, selon le produit acheté.</li>
              </ul>
              <p className="text-gray-700">
                Le paiement est exigible immédiatement lors de la commande.
              </p>
            </section>

            {/* Article 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 5 - Livraison des Produits</h2>
              <p className="text-gray-700 mb-4">
                La livraison des produits est exclusivement numérique :
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Par téléchargement immédiat depuis le Site,</li>
                <li>Ou par l'envoi d'un email contenant les identifiants d'accès.</li>
              </ul>
              <p className="text-gray-700">
                Le Client est responsable de fournir une adresse email valide lors de l'achat.
              </p>
            </section>

            {/* Article 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 6 - Droits d'Utilisation</h2>
              <p className="text-gray-700 mb-4">
                Les fichiers et contenus achetés sont destinés à un usage <strong>strictement personnel et non transférable</strong>.
              </p>
              <p className="text-gray-700">
                Toute reproduction, diffusion, partage ou revente non autorisée est strictement interdite et pourra donner lieu à des poursuites judiciaires.
              </p>
            </section>

            {/* Article 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-primary" />
                Article 7 - Propriété Intellectuelle
              </h2>
              <p className="text-gray-700 mb-4">
                La marque <strong>EVO ECOM</strong>, ainsi que l'ensemble des contenus (textes, images, vidéos, guides, bases de données, logos, etc.), sont protégés par le droit de la propriété intellectuelle et restent la propriété exclusive de TRIUM TRADE ou de ses partenaires.
              </p>
              <p className="text-gray-700">
                Toute reproduction totale ou partielle, modification ou exploitation non autorisée est interdite.
              </p>
            </section>

            {/* Article 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 8 - Rétractation, Retours et Remboursements</h2>
              <p className="text-gray-700 mb-4">
                Conformément à la législation applicable sur les produits numériques :
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Aucun remboursement ne sera effectué après téléchargement des fichiers.</li>
                <li>Aucun remboursement ne sera accordé si le Client s'est connecté à la plateforme, l'accès constituant une consommation du service numérique.</li>
                <li>Toute réclamation doit être transmise à <strong>support@evoecom.com</strong> dans un délai de 14 jours suivant l'achat en cas de défaut manifeste du produit.</li>
              </ul>
            </section>

            {/* Article 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 9 - Responsabilité</h2>
              <p className="text-gray-700 mb-4">
                EVO ECOM ne saurait être tenu responsable de l'usage fait par le Client des informations et ressources fournies.
              </p>
              <p className="text-gray-700">
                Le Client est seul responsable de la mise en œuvre et de l'exploitation des conseils ou guides achetés.
              </p>
            </section>

            {/* Article 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaLock className="text-primary" />
                Article 10 - Données Personnelles
              </h2>
              <p className="text-gray-700 mb-4">
                Les données collectées lors des commandes sont nécessaires au traitement des achats.
              </p>
              <p className="text-gray-700 mb-4">
                EVO ECOM s'engage à respecter la réglementation en vigueur (RGPD).
              </p>
              <p className="text-gray-700">
                Le Client dispose d'un droit d'accès, de rectification, d'opposition et de suppression de ses données en écrivant à : <strong>support@evoecom.com</strong>.
              </p>
            </section>

            {/* Article 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 11 - Utilisation du Site</h2>
              <p className="text-gray-700 mb-4">
                En accédant au Site, le Client s'engage à :
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Ne pas porter atteinte à son bon fonctionnement,</li>
                <li>Ne pas extraire ou réutiliser massivement les données,</li>
                <li>Ne pas utiliser le Site à des fins frauduleuses ou illicites.</li>
              </ul>
            </section>

            {/* Article 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 12 - Cookies et Liens Hypertextes</h2>
              <p className="text-gray-700 mb-4">
                Le Site peut utiliser des cookies pour améliorer l'expérience utilisateur. L'utilisateur peut les désactiver dans les paramètres de son navigateur.
              </p>
              <p className="text-gray-700">
                Le Site peut contenir des liens vers des sites tiers ; EVO ECOM décline toute responsabilité quant à leur contenu.
              </p>
            </section>

            {/* Article 13 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 13 - Loi Applicable et Juridiction Compétente</h2>
              <p className="text-gray-700 mb-4">
                Les présentes CGV & CGU sont régies par le droit français.
              </p>
              <p className="text-gray-700">
                En cas de litige, les parties rechercheront une solution amiable. À défaut, compétence expresse est attribuée aux tribunaux compétents du ressort du siège social de TRIUM TRADE à Paris.
              </p>
            </section>

            {/* Mentions légales */}
            <section className="bg-primary/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mentions légales</h2>
              <ul className="text-gray-700 space-y-2">
                <li><strong>Éditeur du site :</strong> TRIUM TRADE, SAS, 231 rue Saint-Honoré, 75001 Paris, RCS Paris 990 320 590</li>
                <li><strong>Directeur de la publication :</strong> Thomas Duarte</li>
                <li><strong>Email :</strong> support@evoecom.com</li>
                <li><strong>Site web :</strong> <a href="https://evoecom.com" className="text-primary hover:underline">https://evoecom.com</a></li>
                <li><strong>Hébergement :</strong> Kajabi LLC, 17100 Laguna Canyon Rd Suite 100, Irvine, CA 92603, États-Unis</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LegalNotice


