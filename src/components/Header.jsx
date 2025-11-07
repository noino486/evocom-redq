import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useAffiliate } from '../context/AffiliateContext'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { getCurrentAffiliateCode, hasAffiliateCode } = useAffiliate()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigation = (id) => {
    setIsMobileMenuOpen(false)
    
    // Si on est déjà sur la page d'accueil
    if (location.pathname === '/') {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Sinon, on navigue vers la page d'accueil puis on scroll
      navigate('/')
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  const navLinks = [
    { name: 'Accueil', id: 'hero' },
    { name: 'Produits', id: 'products' },
    { name: 'Témoignages', id: 'testimonials' },
    { name: 'Connexion', path: '/login' },
    { name: 'Contact', id: 'footer' }
  ]

  const affiliateCode = getCurrentAffiliateCode()

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/logo.-evo-banniere.svg" 
              alt="Logo" 
              className="h-12 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
                >
                  {link.name}
                </a>
              ) : link.path ? (
                <button
                  key={link.name}
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    navigate(link.path)
                  }}
                  className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
                >
                  {link.name}
                </button>
              ) : (
                <button
                  key={link.id}
                  onClick={() => handleNavigation(link.id)}
                  className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
                >
                  {link.name}
                </button>
              )
            ))}

            <button
              onClick={() => handleNavigation('products')}
              className="bg-gradient-to-r from-primary via-secondary to-accent text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity duration-200"
            >
              Voir les Packs
            </button>
          </div>

          {/* Mobile - Menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary p-2"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-primary font-medium text-left py-2 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ) : link.path ? (
                  <button
                    key={link.name}
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      navigate(link.path)
                    }}
                    className="text-gray-700 hover:text-primary font-medium text-left py-2 transition-colors duration-200"
                  >
                    {link.name}
                  </button>
                ) : (
                  <button
                    key={link.id}
                    onClick={() => handleNavigation(link.id)}
                    className="text-gray-700 hover:text-primary font-medium text-left py-2 transition-colors duration-200"
                  >
                    {link.name}
                  </button>
                )
              ))}
              <button
                onClick={() => handleNavigation('products')}
                className="bg-gradient-to-r from-primary via-secondary to-accent text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2 mt-2"
              >
                Voir les Packs
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header