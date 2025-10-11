import React from 'react'
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer id="footer" className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <img 
              src="/logo.-evo-banniere-footer.svg" 
              alt="Logo" 
              className="h-10 w-auto mb-4"
            />
            <p className="text-gray-400 max-w-md">
              Vos ressources digitales pour démarrer et développer votre business international.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Produits</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/product/pack-starter-fournisseurs" className="hover:text-white transition-colors">
                  Pack Global Sourcing - 29,90€
                </Link>
              </li>
              <li>
                <Link to="/product/pack-global-business" className="hover:text-white transition-colors">
                  Pack Global Business - 39,90€
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-gray-400">
                <FaMapMarkerAlt className="mt-1" />
                <span>200 RUE DE LA CROIX NIVERT<br />75015 PARIS</span>
              </div>
              <a href="tel:+33756968108" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <FaPhone />
                <span>+33 7 56 96 81 08</span>
              </a>
              <a href="mailto:contact@evoecom.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <FaEnvelope />
                <span>contact@evoecom.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 mb-2">
            © 2025 EVO E-com. Tous droits réservés.
          </p>
          <div className="flex items-center justify-center gap-4 mb-2">
            <a 
              href="https://duthdigital.notion.site/Conditions-g-n-rales-de-vente-d-utilisation-du-service-2618528bf9b080b1b9a1e264de3e3c6b?source=copy_link" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              Mentions légales
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Paiements sécurisés par <span className="text-secondary font-semibold">ThriveCart</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

