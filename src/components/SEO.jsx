import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useAffiliate } from '../context/AffiliateContext'

const SEO = ({ 
  title = 'Evo E-com | Liste fournisseurs internationaux',
  description = 'Liste fournisseurs internationaux, pack business expatriation, business actif passif - Démarrez votre business avec des outils concrets et immédiatement disponibles.',
  keywords = 'liste fournisseurs internationaux, pack business expatriation, business actif passif, sourcing e-commerce, idées de business 2025, fournisseurs du monde entier, guide business PDF, sourcing import export, communauté entrepreneur',
  ogImage = '/og-image.jpg',
  ogUrl = 'https://www.evoecom.com/'
}) => {
  const { getCurrentAffiliateCode } = useAffiliate()
  const affiliateCode = getCurrentAffiliateCode()
  
  // Construire l'URL avec le code d'affiliation si présent
  const buildUrl = (baseUrl) => {
    if (affiliateCode) {
      const url = new URL(baseUrl)
      url.searchParams.set('AF', affiliateCode)
      return url.toString()
    }
    return baseUrl
  }

  const finalUrl = buildUrl(ogUrl)
  return (
    <Helmet>
      {/* Meta tags de base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Evo E-com" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={finalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Meta tags pour forcer l'ouverture dans le navigateur mobile */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Meta tags pour éviter l'ouverture dans les apps sociales */}
      <meta name="twitter:app:name:iphone" content="Safari" />
      <meta name="twitter:app:name:ipad" content="Safari" />
      <meta name="twitter:app:name:googleplay" content="Chrome" />
      
      {/* Meta tags pour Instagram et autres réseaux */}
      <meta property="al:web:url" content={finalUrl} />
      <meta property="al:web:should_fallback" content="true" />
      
      {/* Autres meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="French" />
      <meta name="author" content="Pack Global Sourcing & Pack Global Business" />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      
      {/* Structured Data / Schema.org pour le SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Pack Global Sourcing & Pack Global Business",
          "description": description,
          "offers": [
            {
              "@type": "Offer",
              "name": "Pack Global Sourcing",
              "price": "29.90",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock"
            },
            {
              "@type": "Offer",
              "name": "Pack Global Business",
              "price": "39.90",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock"
            }
          ]
        })}
      </script>
    </Helmet>
  )
}

export default SEO

