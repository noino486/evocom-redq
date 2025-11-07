/**
 * Script de test automatique pour le webhook ThriveCart
 * 
 * Ce script teste l'endpoint provision-user avec les différents produits
 * 
 * Usage:
 *   node test-webhook.js
 *   node test-webhook.js --product STFOUR
 *   node test-webhook.js --product GLBNS
 *   node test-webhook.js --email test@example.com
 */

const WEBHOOK_URL = 'https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user'
const WEBHOOK_SECRET = 'bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4='

// Clé API Supabase (Anon Key) - nécessaire pour appeler les Edge Functions
// Vous pouvez la trouver dans Supabase Dashboard > Project Settings > API
// OU la passer en variable d'environnement : SUPABASE_ANON_KEY
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

// Fonction pour parser les arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const config = {
    product: null,
    email: null,
    useBearer: false
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--product' && args[i + 1]) {
      config.product = args[i + 1].toUpperCase()
      i++
    } else if (args[i] === '--email' && args[i + 1]) {
      config.email = args[i + 1]
      i++
    } else if (args[i] === '--bearer') {
      config.useBearer = true
    }
  }

  return config
}

// Fonction pour tester le webhook
async function testWebhook(product, email = null) {
  const testEmail = email || `test-${Date.now()}@example.com`
  
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  // Ajouter la clé API Supabase (obligatoire pour appeler les Edge Functions)
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
  } else {
    console.log(`${colors.yellow}⚠️  Avertissement: SUPABASE_ANON_KEY non définie. Les requêtes peuvent échouer.${colors.reset}`)
    console.log(`${colors.yellow}   Définissez-la avec: export SUPABASE_ANON_KEY=votre_cle${colors.reset}\n`)
  }

  // Ajouter le secret webhook (header personnalisé ou Bearer)
  if (process.argv.includes('--bearer')) {
    // Si bearer est utilisé, on utilise le secret comme Bearer au lieu de la clé Supabase
    headers['Authorization'] = `Bearer ${WEBHOOK_SECRET}`
    // Mais on garde quand même apikey avec la clé Supabase
    if (SUPABASE_ANON_KEY) {
      headers['apikey'] = SUPABASE_ANON_KEY
    }
  } else {
    headers['x-webhook-secret'] = WEBHOOK_SECRET
  }

  const body = new URLSearchParams({
    email: testEmail,
    product: product
  })

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.blue}Test du webhook pour le produit: ${colors.yellow}${product}${colors.reset}`)
  console.log(`${colors.blue}Email utilisé: ${colors.yellow}${testEmail}${colors.reset}`)
  console.log(`${colors.blue}URL: ${colors.reset}${WEBHOOK_URL}`)
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)

  try {
    const startTime = Date.now()
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: headers,
      body: body.toString()
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    const responseText = await response.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = { raw: responseText }
    }

    // Afficher les résultats
    if (response.ok) {
      console.log(`${colors.green}✅ Succès (${response.status})${colors.reset}`)
      console.log(`${colors.green}⏱️  Temps de réponse: ${duration}ms${colors.reset}\n`)
      console.log(`${colors.cyan}Réponse:${colors.reset}`)
      console.log(JSON.stringify(responseData, null, 2))
      
      return {
        success: true,
        status: response.status,
        duration,
        data: responseData
      }
    } else {
      console.log(`${colors.red}❌ Erreur (${response.status})${colors.reset}`)
      console.log(`${colors.red}⏱️  Temps de réponse: ${duration}ms${colors.reset}\n`)
      console.log(`${colors.red}Réponse:${colors.reset}`)
      console.log(JSON.stringify(responseData, null, 2))
      
      return {
        success: false,
        status: response.status,
        duration,
        error: responseData
      }
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur de connexion${colors.reset}`)
    console.log(`${colors.red}Erreur: ${error.message}${colors.reset}\n`)
    
    return {
      success: false,
      error: error.message
    }
  }
}

// Fonction principale
async function main() {
  const config = parseArgs()

  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║         Test Automatique du Webhook ThriveCart              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`)

  // Vérifier que la clé API Supabase est définie
  if (!SUPABASE_ANON_KEY) {
    console.log(`${colors.yellow}⚠️  IMPORTANT: La clé API Supabase n'est pas définie.${colors.reset}`)
    console.log(`${colors.yellow}   Les Edge Functions Supabase nécessitent un header d'autorisation.${colors.reset}`)
    console.log(`${colors.yellow}   Définissez SUPABASE_ANON_KEY avant d'exécuter le script:${colors.reset}`)
    console.log(`${colors.cyan}   export SUPABASE_ANON_KEY=votre_anon_key${colors.reset}`)
    console.log(`${colors.cyan}   OU${colors.reset}`)
    console.log(`${colors.cyan}   SUPABASE_ANON_KEY=votre_anon_key node test-webhook.js${colors.reset}\n`)
    console.log(`${colors.yellow}   Vous pouvez trouver votre clé dans:${colors.reset}`)
    console.log(`${colors.cyan}   Supabase Dashboard > Project Settings > API > anon public${colors.reset}\n`)
  }

  const results = []

  // Tester les produits spécifiés ou tous les produits
  if (config.product) {
    // Tester un seul produit
    if (config.product !== 'STFOUR' && config.product !== 'GLBNS') {
      console.log(`${colors.red}❌ Produit invalide: ${config.product}${colors.reset}`)
      console.log(`${colors.yellow}Produits valides: STFOUR, GLBNS${colors.reset}`)
      process.exit(1)
    }
    const result = await testWebhook(config.product, config.email)
    results.push({ product: config.product, ...result })
  } else {
    // Tester tous les produits
    console.log(`${colors.yellow}Test de tous les produits...${colors.reset}\n`)
    
    const result1 = await testWebhook('STFOUR', config.email)
    results.push({ product: 'STFOUR', ...result1 })
    
    console.log('\n')
    
    // Attendre 1 seconde entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const result2 = await testWebhook('GLBNS', config.email)
    results.push({ product: 'GLBNS', ...result2 })
  }

  // Résumé
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.blue}📊 Résumé des tests${colors.reset}`)
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)

  results.forEach(result => {
    const status = result.success ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`
    const product = result.product
    const statusCode = result.status || 'N/A'
    const duration = result.duration ? `${result.duration}ms` : 'N/A'
    
    console.log(`${status} ${product}: ${statusCode} (${duration})`)
  })

  const successCount = results.filter(r => r.success).length
  const totalCount = results.length

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  if (successCount === totalCount) {
    console.log(`${colors.green}✅ Tous les tests ont réussi (${successCount}/${totalCount})${colors.reset}`)
    process.exit(0)
  } else {
    console.log(`${colors.red}❌ Certains tests ont échoué (${successCount}/${totalCount} réussis)${colors.reset}`)
    process.exit(1)
  }
}

// Exécuter le script
main().catch(error => {
  console.error(`${colors.red}Erreur fatale: ${error.message}${colors.reset}`)
  process.exit(1)
})

