// Supabase Edge Function pour scraper les fournisseurs
// Déploiement: supabase functions deploy scrape-suppliers

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  job_id: string
  country: string
  supplier_type: string
  main_category?: string
}

// Fonction pour extraire les informations d'un site web
async function scrapeWebsite(url: string): Promise<{
  name?: string
  phone?: string
  email?: string
  address?: string
}> {
  try {
    const SCRAPER_API_KEY = Deno.env.get('SCRAPER_API_KEY')
    
    let html: string
    let response: Response
    
    // Utiliser ScraperAPI si disponible (recommandé pour éviter les blocages)
    if (SCRAPER_API_KEY) {
      const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`
      response = await fetch(scraperUrl)
    } else {
      // Sinon, fetch direct (peut être bloqué)
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        }
      })
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    html = await response.text()
    
    // Extraire le nom du site depuis l'URL
    const urlObj = new URL(url)
    const name = urlObj.hostname.replace('www.', '').replace('.com', '').replace('.net', '').replace('.org', '')
    
    // Extraire l'email (plusieurs patterns)
    const emailPatterns = [
      /[\w\.-]+@[\w\.-]+\.\w+/g,
      /mailto:([\w\.-]+@[\w\.-]+\.\w+)/g,
      /contact[@\s]+([\w\.-]+@[\w\.-]+\.\w+)/gi
    ]
    
    let email: string | undefined
    for (const pattern of emailPatterns) {
      const matches = html.match(pattern)
      if (matches && matches.length > 0) {
        email = matches[0].replace('mailto:', '').trim()
        break
      }
    }
    
    // Extraire le téléphone (plusieurs formats internationaux)
    const phonePatterns = [
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
      /tel:([+\d\s\-()]+)/g,
      /phone[:\s]+([+\d\s\-()]+)/gi,
      /téléphone[:\s]+([+\d\s\-()]+)/gi
    ]
    
    let phone: string | undefined
    for (const pattern of phonePatterns) {
      const matches = html.match(pattern)
      if (matches && matches.length > 0) {
        phone = matches[0].replace('tel:', '').replace(/phone[:\s]+/gi, '').replace(/téléphone[:\s]+/gi, '').trim()
        // Limiter à 20 caractères
        if (phone.length > 20) {
          phone = phone.substring(0, 20)
        }
        break
      }
    }
    
    // Extraire l'adresse (basique)
    const addressPatterns = [
      /address[:\s]+([^<\n]+)/gi,
      /adresse[:\s]+([^<\n]+)/gi,
      /location[:\s]+([^<\n]+)/gi
    ]
    
    let address: string | undefined
    for (const pattern of addressPatterns) {
      const matches = html.match(pattern)
      if (matches && matches.length > 0) {
        address = matches[0].replace(/address[:\s]+/gi, '').replace(/adresse[:\s]+/gi, '').replace(/location[:\s]+/gi, '').trim()
        // Limiter à 200 caractères
        if (address.length > 200) {
          address = address.substring(0, 200)
        }
        break
      }
    }
    
    return {
      name,
      email,
      phone,
      address
    }
  } catch (error) {
    console.error('Erreur lors du scraping:', error)
    // Retourner au moins le nom depuis l'URL
    try {
      const urlObj = new URL(url)
      const name = urlObj.hostname.replace('www.', '').replace('.com', '').replace('.net', '').replace('.org', '')
      return { name }
    } catch {
      return {}
    }
  }
}

// Domaines à exclure (pas des fournisseurs)
const EXCLUDED_DOMAINS = [
  'google.com',
  'googleadservices.com',
  'youtube.com',
  'w3.org',
  'schema.org',
  'wikipedia.org',
  'facebook.com',
  'twitter.com',
  'linkedin.com',
  'instagram.com',
  'pinterest.com',
  'reddit.com',
  'amazon.com',
  'alibaba.com',
  'made-in-china.com',
  'globalsources.com',
  'duckduckgo.com',
  'bing.com',
  'yahoo.com',
  'adobe.com',
  'microsoft.com',
  'apple.com',
  'github.com',
  'stackoverflow.com',
  'wordpress.com',
  'blogspot.com',
  'tumblr.com',
  'medium.com'
]

// Fonction pour valider si une URL est un vrai site de fournisseur
function isValidSupplierUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Vérifier si le domaine est exclu
    if (EXCLUDED_DOMAINS.some(domain => hostname.includes(domain))) {
      return false
    }
    
    // Exclure les URLs de tracking, publicité, etc.
    if (url.includes('/aclk') || 
        url.includes('/conversion/') || 
        url.includes('/pagead/') ||
        url.includes('/ads/') ||
        url.includes('/advertising/') ||
        hostname.includes('adservice') ||
        hostname.includes('tracking') ||
        hostname.includes('analytics')) {
      return false
    }
    
    // Vérifier que c'est un domaine valide (pas juste un chemin)
    if (!hostname.includes('.') || hostname.split('.').length < 2) {
      return false
    }
    
    // Exclure les IPs directes
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return false
    }
    
    // Vérifier que c'est HTTP ou HTTPS
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

// Fonction pour construire une requête de recherche optimisée
function buildSearchQuery(mainCategory: string | undefined, subCategory: string, country: string): string {
  // Si on a une catégorie principale, l'utiliser en priorité
  if (mainCategory) {
    // Construire une requête plus précise avec la catégorie principale
    const categoryTerms = mainCategory.toLowerCase()
    
    // Traductions et termes de recherche optimisés
    const searchTerms: string[] = []
    
    // Mapper les catégories principales vers des termes de recherche optimisés
    if (categoryTerms.includes('textile pour femme')) {
      searchTerms.push('women clothing', 'vêtement femme', 'ladies wear', 'women fashion')
    } else if (categoryTerms.includes('textile pour homme')) {
      searchTerms.push('men clothing', 'vêtement homme', 'mens wear', 'men fashion')
    } else if (categoryTerms.includes('textile')) {
      searchTerms.push('clothing', 'vêtement', 'textile', 'apparel')
    } else if (categoryTerms.includes('chaussure')) {
      searchTerms.push('shoes', 'chaussures', 'footwear')
    } else if (categoryTerms.includes('bijoux')) {
      searchTerms.push('jewelry', 'bijoux', 'jewellery')
    } else if (categoryTerms.includes('cosmétique') || categoryTerms.includes('cosmetique')) {
      searchTerms.push('cosmetics', 'cosmétiques', 'beauty products')
    } else if (categoryTerms.includes('parfum')) {
      searchTerms.push('perfume', 'parfum', 'fragrance')
    } else if (categoryTerms.includes('auto')) {
      searchTerms.push('automotive', 'auto parts', 'pièces auto')
    } else if (categoryTerms.includes('transport et logistique')) {
      searchTerms.push('logistics', 'transport', 'shipping', 'freight')
    } else {
      // Utiliser la catégorie principale telle quelle
      searchTerms.push(mainCategory)
    }
    
    // Ajouter la sous-catégorie seulement si elle apporte de la valeur
    // Ignorer les sous-catégories trop génériques comme "Magasin", "Boutique", etc.
    const subCategoryLower = subCategory.toLowerCase()
    const genericTerms = ['magasin', 'boutique', 'service', 'fournisseur', 'grossiste']
    const isGeneric = genericTerms.some(term => subCategoryLower.includes(term))
    
    if (!isGeneric && subCategory && subCategory.length > 3) {
      // Utiliser la sous-catégorie mais de manière secondaire
      searchTerms.push(subCategory)
    }
    
    // Construire la requête finale avec les termes les plus pertinents en premier
    const primaryTerms = searchTerms.slice(0, 2).join(' ')
    const query = `${primaryTerms} supplier ${country} manufacturer B2B wholesale`
    return query
  }
  
  // Fallback : utiliser seulement la sous-catégorie
  if (subCategory === '3D' || subCategory === 'Impression 3D') {
    return `3D printing supplier ${country} manufacturer B2B`
  }
  
  return `${subCategory} supplier ${country} manufacturer B2B`
}

// Fonction pour rechercher des fournisseurs
async function searchSuppliers(country: string, supplierType: string, mainCategory?: string): Promise<string[]> {
  try {
    const searchQuery = buildSearchQuery(mainCategory, supplierType, country)
    console.log(`Recherche avec la requête: "${searchQuery}"`)
    
    // Option 1: Utiliser Google Custom Search API (recommandé)
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')
    const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID')
    
    if (GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&num=10`
      
      const response = await fetch(searchUrl)
      if (response.ok) {
        const data = await response.json()
        const urls = (data.items?.map((item: any) => item.link) || [])
          .filter((url: string) => isValidSupplierUrl(url))
        return urls
      }
    }
    
    // Option 2: Utiliser ScraperAPI avec Google Search
    const SCRAPER_API_KEY = Deno.env.get('SCRAPER_API_KEY')
    if (SCRAPER_API_KEY) {
      const searchUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=10`
      
      const response = await fetch(searchUrl)
      if (response.ok) {
        const html = await response.text()
        // Extraire les URLs des résultats Google
        const urlRegex = /<a href="\/url\?q=([^&"]+)/g
        const urls: string[] = []
        let match
        while ((match = urlRegex.exec(html)) !== null && urls.length < 15) {
          const url = decodeURIComponent(match[1])
          if (isValidSupplierUrl(url)) {
            urls.push(url)
          }
        }
        // Si pas assez trouvé, essayer un autre pattern
        if (urls.length < 5) {
          const altRegex = /https?:\/\/[^\s"<>]+/g
          const altMatches = html.match(altRegex) || []
          for (const url of altMatches) {
            if (isValidSupplierUrl(url) && !urls.includes(url)) {
              urls.push(url)
              if (urls.length >= 10) break
            }
          }
        }
        return urls.slice(0, 10)
      }
    }
    
    // Option 3: Recherche avec DuckDuckGo
    const duckDuckGoUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`
    
    try {
      const response = await fetch(duckDuckGoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (response.ok) {
        const html = await response.text()
        const urlRegex = /<a class="result__url" href="([^"]+)"/g
        const urls: string[] = []
        let match
        while ((match = urlRegex.exec(html)) !== null && urls.length < 10) {
          const url = match[1]
          if (isValidSupplierUrl(url)) {
            urls.push(url)
          }
        }
        if (urls.length > 0) {
          return urls
        }
      }
    } catch (error) {
      console.error('Erreur DuckDuckGo:', error)
    }
    
    console.warn('Aucune méthode de recherche configurée ou aucun résultat valide')
    return []
    
  } catch (error) {
    console.error('Erreur lors de la recherche de fournisseurs:', error)
    return []
  }
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Pas d\'autorisation')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Vérifier que l'utilisateur est admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('access_level, is_active')
      .eq('id', user.id)
      .single()

    if (!profile || profile.access_level !== 4 || !profile.is_active) {
      throw new Error('Accès non autorisé - Admin seulement')
    }

    const body: RequestBody = await req.json()
    const { job_id, country, supplier_type, main_category } = body

    if (!job_id || !country || !supplier_type) {
      throw new Error('Paramètres manquants')
    }

    // Mettre à jour le job en cours
    await supabase
      .from('scraping_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', job_id)

    // Rechercher les fournisseurs avec la catégorie principale
    const supplierUrls = await searchSuppliers(country, supplier_type, main_category)
    let totalSaved = 0

    // Scraper chaque site
    const seenUrls = new Set<string>() // Pour éviter les doublons dans la même session
    
    for (const url of supplierUrls) {
      try {
        // Fonction de normalisation améliorée
        const normalizeUrl = (urlToNormalize: string): string => {
          try {
            let normalized = urlToNormalize.trim()
            // Enlever le protocole
            normalized = normalized.replace(/^https?:\/\//i, '')
            // Enlever www.
            normalized = normalized.replace(/^www\./i, '')
            // Enlever le trailing slash et les chemins
            normalized = normalized.split('/')[0]
            // Enlever le port si présent
            normalized = normalized.split(':')[0]
            // Enlever les fragments et query strings
            normalized = normalized.split('#')[0].split('?')[0]
            // Convertir en minuscules
            normalized = normalized.toLowerCase()
            // Enlever les espaces
            normalized = normalized.trim()
            return normalized
          } catch {
            return urlToNormalize.toLowerCase().trim()
          }
        }
        
        // Normaliser l'URL
        const normalizedUrl = normalizeUrl(url)
        
        // Vérifier si déjà vu dans cette session
        if (seenUrls.has(normalizedUrl)) {
          console.log(`Doublon session détecté: ${url} -> ${normalizedUrl}`)
          continue
        }
        seenUrls.add(normalizedUrl)
        
        // Vérifier si le fournisseur existe déjà dans la base
        // D'abord par website_normalized (le plus fiable)
        const { data: existingByNormalized, error: checkNormalizedError } = await supabase
          .from('suppliers')
          .select('id, website, name, website_normalized')
          .eq('website_normalized', normalizedUrl)
          .neq('status', 'deleted')

        if (checkNormalizedError && checkNormalizedError.code !== 'PGRST116') {
          console.error('Erreur vérification doublon (normalized):', checkNormalizedError)
        }

        // Si trouvé par website_normalized, c'est un doublon
        if (existingByNormalized && existingByNormalized.length > 0) {
          console.log(`Doublon détecté (website_normalized): ${url} -> ${normalizedUrl} (existant: ${existingByNormalized[0].website})`)
          continue
        }

        // Vérifier aussi par domaine (les 2 dernières parties) - recherche plus ciblée
        const urlParts = normalizedUrl.split('.')
        if (urlParts.length >= 2) {
          const domain = urlParts.slice(-2).join('.')
          
          // Rechercher par website_normalized se terminant par le domaine
          const { data: existingByDomain, error: checkDomainError } = await supabase
            .from('suppliers')
            .select('id, website, name, website_normalized')
            .or(`website_normalized.ilike.%${domain},website.ilike.%${domain}`)
            .neq('status', 'deleted')
            .limit(20) // Limiter pour éviter de charger trop de données

          if (checkDomainError && checkDomainError.code !== 'PGRST116') {
            console.error('Erreur vérification doublon (domain):', checkDomainError)
          }

          // Vérifier si un fournisseur avec le même domaine exact existe
          if (existingByDomain && existingByDomain.length > 0) {
            const isDuplicate = existingByDomain.some(existing => {
              if (!existing.website && !existing.website_normalized) return false
              
              const existingNormalized = existing.website_normalized || normalizeUrl(existing.website || '')
              const existingDomain = existingNormalized.split('.').slice(-2).join('.')
              
              // Vérifier que c'est exactement le même domaine
              if (existingDomain === domain) {
                // Vérifier aussi que ce n'est pas juste un sous-domaine différent
                // Ex: shop.example.com vs example.com ne sont pas des doublons
                // Mais example.com vs www.example.com sont des doublons
                const existingHost = existingNormalized.split('.')[0]
                const currentHost = normalizedUrl.split('.')[0]
                
                // Si les deux ont le même domaine de base, c'est un doublon
                // Sauf si l'un est un sous-domaine spécifique (shop, blog, etc.)
                const commonSubdomains = ['www', 'shop', 'store', 'blog', 'mail', 'ftp', 'admin', 'api', 'cdn']
                if (existingHost === currentHost || 
                    (commonSubdomains.includes(existingHost) && commonSubdomains.includes(currentHost))) {
                  return true
                }
              }
              
              return false
            })

            if (isDuplicate) {
              console.log(`Doublon détecté (domaine): ${url} -> ${normalizedUrl} (domaine: ${domain})`)
              continue
            }
          }
        }

        // Vérification supplémentaire par website (fallback)
        const { data: existingByWebsite, error: checkWebsiteError } = await supabase
          .from('suppliers')
          .select('id, website, name, website_normalized')
          .or(`website.ilike.%${normalizedUrl}%,website.ilike.%www.${normalizedUrl}%`)
          .neq('status', 'deleted')

        if (checkWebsiteError && checkWebsiteError.code !== 'PGRST116') {
          console.error('Erreur vérification doublon (website):', checkWebsiteError)
        }

        if (existingByWebsite && existingByWebsite.length > 0) {
          // Vérifier si c'est vraiment le même domaine
          const isDuplicate = existingByWebsite.some(existing => {
            if (!existing.website) return false
            
            const existingNormalized = existing.website_normalized || normalizeUrl(existing.website)
            return existingNormalized === normalizedUrl
          })

          if (isDuplicate) {
            console.log(`Doublon détecté (website): ${url} -> ${normalizedUrl}`)
            continue
          }
        }

        // Scraper les informations
        const scrapedData = await scrapeWebsite(url)

        // Extraire le nom du domaine si pas de nom trouvé
        const name = scrapedData.name || url.replace(/^https?:\/\//, '').replace(/\/$/, '')

        // Utiliser la même fonction de normalisation pour website_normalized
        const normalizeUrlForDb = (urlToNormalize: string): string => {
          try {
            let normalized = urlToNormalize.trim()
            normalized = normalized.replace(/^https?:\/\//i, '')
            normalized = normalized.replace(/^www\./i, '')
            normalized = normalized.split('/')[0]
            normalized = normalized.split(':')[0]
            normalized = normalized.split('#')[0].split('?')[0]
            normalized = normalized.toLowerCase().trim()
            return normalized
          } catch {
            return urlToNormalize.toLowerCase().trim()
          }
        }
        
        const normalizedUrlForDb = normalizeUrlForDb(url)
        
        // Insérer le fournisseur avec la catégorie principale et website_normalized
        const { error: insertError } = await supabase
          .from('suppliers')
          .insert([{
            name,
            website: url,
            website_normalized: normalizedUrlForDb,
            phone: scrapedData.phone,
            email: scrapedData.email,
            address: scrapedData.address,
            country,
            supplier_type: supplier_type,
            main_category: main_category || null,
            created_by: user.id,
            status: 'pending'
          }])

        if (insertError) {
          // Si erreur de contrainte unique ou de doublon, c'est normal
          if (insertError.code === '23505' || 
              insertError.code === 'PGRST116' ||
              insertError.message?.toLowerCase().includes('duplicate') || 
              insertError.message?.toLowerCase().includes('unique') ||
              insertError.message?.toLowerCase().includes('existe déjà')) {
            console.log(`Doublon détecté (contrainte DB): ${url} -> ${normalizedUrlForDb}`)
            continue
          }
          console.error(`Erreur insertion ${url}:`, insertError)
        } else {
          totalSaved++
        }

        // Mettre à jour le job
        await supabase
          .from('scraping_jobs')
          .update({ 
            total_found: supplierUrls.length,
            total_saved: totalSaved
          })
          .eq('id', job_id)

        // Petite pause pour éviter de surcharger
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Erreur pour ${url}:`, error)
        // Continuer avec le suivant
      }
    }

    // Marquer le job comme terminé
    await supabase
      .from('scraping_jobs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_found: supplierUrls.length,
        total_saved: totalSaved
      })
      .eq('id', job_id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${totalSaved} fournisseurs ajoutés`,
        total_saved: totalSaved
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur inconnue' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

