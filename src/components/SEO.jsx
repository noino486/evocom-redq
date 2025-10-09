import React from 'react'
import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title = 'Pack Starter Fournisseurs & Pack Global Business - Packs Digitaux Business',
  description = 'Liste fournisseurs internationaux, pack business expatriation, business actif passif - Démarrez votre business avec des outils concrets et immédiatement disponibles.',
  keywords = 'liste fournisseurs internationaux, pack business expatriation, business actif passif, sourcing e-commerce, idées de business 2025, fournisseurs du monde entier, guide business PDF, sourcing import export, communauté entrepreneur',
  ogImage = '/og-image.jpg',
  ogUrl = 'https://votre-domaine.com'
}) => {
  return (
    <Helmet>
      {/* Meta tags de base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Autres meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="French" />
      <meta name="author" content="Pack Starter Fournisseurs & Pack Global Business" />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/logo.-evo-banniere.svg" />
      
      {/* Structured Data / Schema.org pour le SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Pack Starter Fournisseurs & Pack Global Business",
          "description": description,
          "offers": [
            {
              "@type": "Offer",
              "name": "Pack Starter Fournisseurs",
              "price": "28",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock"
            },
            {
              "@type": "Offer",
              "name": "Pack Global Business",
              "price": "38",
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

