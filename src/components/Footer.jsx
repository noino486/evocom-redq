import React from 'react'
import { FaEnvelope, FaDiscord } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer id="footer" className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <img 
              src="/logo.-evo-banniere.svg" 
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
              <li className="hover:text-white transition-colors cursor-pointer">Global Sourcing Pack - 29,99€</li>
              <li className="hover:text-white transition-colors cursor-pointer">Visionnaire Pack - 39,99€</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <a href="mailto:contact@example.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <FaEnvelope />
                <span>contact@example.com</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <FaDiscord />
                <span>Rejoindre le Discord</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 mb-2">
            © {new Date().getFullYear()} Global Sourcing & Visionnaire. Tous droits réservés.
          </p>
          <div className="flex items-center justify-center gap-4 mb-2">
            <Link to="/mentions-legales" className="text-sm text-gray-500 hover:text-primary transition-colors">
              Mentions légales
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Paiements sécurisés par <span className="text-primary font-semibold">Stripe</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

