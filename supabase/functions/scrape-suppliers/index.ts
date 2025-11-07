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

// Fonction pour rechercher des fournisseurs
async function searchSuppliers(country: string, supplierType: string): Promise<string[]> {
  try {
    // Option 1: Utiliser Google Custom Search API (recommandé)
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')
    const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID')
    
    if (GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
      // Adapter la requête pour le type 3D
      const searchTerm = supplierType === '3D' || supplierType === 'Impression 3D' 
        ? `3D printing supplier ${country} manufacturer B2B`
        : `${supplierType} supplier ${country} manufacturer B2B`
      const query = searchTerm
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=10`
      
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
      // Adapter la requête pour le type 3D
      const searchTerm = supplierType === '3D' || supplierType === 'Impression 3D' 
        ? `3D printing supplier ${country} manufacturer B2B`
        : `${supplierType} supplier ${country} manufacturer B2B`
      const query = searchTerm
      const searchUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`
      
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
    const searchTerm = supplierType === '3D' || supplierType === 'Impression 3D' 
      ? `3D printing supplier ${country} manufacturer B2B`
      : `${supplierType} supplier ${country} manufacturer B2B`
    const query = searchTerm
    const duckDuckGoUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    
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
    const { job_id, country, supplier_type } = body

    if (!job_id || !country || !supplier_type) {
      throw new Error('Paramètres manquants')
    }

    // Mettre à jour le job en cours
    await supabase
      .from('scraping_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', job_id)

    // Rechercher les fournisseurs
    const supplierUrls = await searchSuppliers(country, supplier_type)
    let totalSaved = 0

    // Scraper chaque site
    const seenUrls = new Set<string>() // Pour éviter les doublons dans la même session
    
    for (const url of supplierUrls) {
      try {
        // Normaliser l'URL (enlever www, trailing slash, etc.)
        const normalizedUrl = url
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .replace(/\/$/, '')
          .toLowerCase()
        
        // Vérifier si déjà vu dans cette session
        if (seenUrls.has(normalizedUrl)) {
          continue
        }
        seenUrls.add(normalizedUrl)
        
        // Vérifier si le fournisseur existe déjà dans la base (par URL normalisée)
        const { data: existingSuppliers, error: checkError } = await supabase
          .from('suppliers')
          .select('id, website')
          .or(`website.ilike.%${normalizedUrl}%,website.ilike.%www.${normalizedUrl}%`)

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Erreur vérification doublon:', checkError)
        }

        // Vérifier si un doublon existe (même domaine)
        const isDuplicate = existingSuppliers?.some(existing => {
          const existingUrl = existing.website
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '')
            .toLowerCase()
          return existingUrl === normalizedUrl || 
                 existingUrl.includes(normalizedUrl) || 
                 normalizedUrl.includes(existingUrl)
        })

        if (isDuplicate) {
          continue // Skip si déjà existant
        }

        // Scraper les informations
        const scrapedData = await scrapeWebsite(url)

        // Extraire le nom du domaine si pas de nom trouvé
        const name = scrapedData.name || url.replace(/^https?:\/\//, '').replace(/\/$/, '')

        // Insérer le fournisseur
        const { error: insertError } = await supabase
          .from('suppliers')
          .insert([{
            name,
            website: url,
            phone: scrapedData.phone,
            email: scrapedData.email,
            address: scrapedData.address,
            country,
            supplier_type,
            created_by: user.id,
            status: 'pending'
          }])

        if (!insertError) {
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

