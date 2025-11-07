/**
 * WEBHOOK ENDPOINT POUR LE PROVISIONING DES UTILISATEURS
 * 
 * Ce fichier peut être utilisé comme:
 * 1. Supabase Edge Function
 * 2. API Route dans un serveur Node.js
 * 3. Webhook endpoint dans Vercel/Netlify
 * 
 * URL: POST https://your-domain.com/api/user
 * Content-Type: application/x-www-form-urlencoded
 * 
 * Paramètres:
 * - name: Nom complet (ex: "Benjamin Velluet")
 * - email: Email utilisateur (ex: "bvelluet@outlook.com")
 * - product: Produit acheté (ex: "STFOUR" ou "GLBNS")
 */

// Pour Supabase Edge Function, utilisez cette structure:
// supabase/functions/provision-user/index.ts

import { createClient } from '@supabase/supabase-js'

// Configuration (à mettre dans les variables d'environnement)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY // Important: Service Role Key, pas Anon Key!

// Créer un client Supabase avec les privilèges admin
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Mapping des produits aux niveaux d'accès
// ⚠️ IMPORTANT: Les utilisateurs créés via ce webhook NE SONT JAMAIS ADMIN (niveau 4)
// Seuls les niveaux 1 et 2 sont assignés automatiquement selon le produit acheté
const PRODUCT_TO_LEVEL = {
  'STFOUR': {
    accessLevel: 1, // Niveau 1: Produit 1 seulement (CLIENT, pas admin)
    products: ['STFOUR']
  },
  'GLBNS': {
    accessLevel: 2, // Niveau 2: Produits 1 + 2 (CLIENT, pas admin)
    products: ['STFOUR', 'GLBNS']
  }
}
// Niveaux d'accès:
// 1 = Client avec produit STFOUR uniquement
// 2 = Client avec produits STFOUR + GLBNS
// 3 = Support (création manuelle uniquement)
// 4 = Admin (création manuelle uniquement, JAMAIS assigné automatiquement)

/**
 * Fonction principale pour créer un utilisateur
 */
export async function provisionUser(req) {
  try {
    // Parser les données (format application/x-www-form-urlencoded)
    const body = await parseFormData(req)
    const { name, email, product } = body

    // Validation (name est optionnel maintenant, seulement email et product requis)
    if (!email || !product) {
      return {
        status: 400,
        body: {
          success: false,
          error: 'Paramètres manquants: email et product sont requis'
        }
      }
    }

    // Vérifier que le produit est valide
    const productConfig = PRODUCT_TO_LEVEL[product.toUpperCase()]
    if (!productConfig) {
      return {
        status: 400,
        body: {
          success: false,
          error: `Produit invalide: ${product}. Valeurs acceptées: STFOUR, GLBNS`
        }
      }
    }

    // Générer un mot de passe temporaire aléatoire
    const tempPassword = generateTempPassword()

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true // Confirmer automatiquement l'email
    })

    if (authError) {
      // Si l'utilisateur existe déjà
      if (authError.message.includes('already registered')) {
        // Récupérer l'ID de l'utilisateur existant
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
        
        if (existingUser?.user) {
          // Mettre à jour le profil existant
          await updateUserProfile(existingUser.user.id, productConfig)
          
          return {
            status: 200,
            body: {
              success: true,
              message: 'Utilisateur mis à jour',
              user_id: existingUser.user.id,
              email_sent: false // Email de bienvenue non envoyé car utilisateur existant
            }
          }
        }
      }
      
      throw authError
    }

    const userId = authData.user.id

    // Créer le profil utilisateur
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        access_level: productConfig.accessLevel,
        products: productConfig.products,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      // Si erreur, supprimer l'utilisateur créé dans auth
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw profileError
    }

    // Envoyer un email avec le mot de passe temporaire
    // Note: Configurez un email template dans Supabase Auth
    // ou utilisez un service externe comme SendGrid, Resend, etc.
    const emailSent = await sendWelcomeEmail(email, tempPassword)

    return {
      status: 201,
      body: {
        success: true,
        message: 'Utilisateur créé avec succès',
        user_id: userId,
        email: email,
        access_level: productConfig.accessLevel,
        products: productConfig.products,
        temp_password: tempPassword, // En production, ne pas renvoyer le password
        email_sent: emailSent
      }
    }

  } catch (error) {
    console.error('Erreur lors du provisioning:', error)
    return {
      status: 500,
      body: {
        success: false,
        error: error.message || 'Erreur lors de la création de l\'utilisateur'
      }
    }
  }
}

/**
 * Mettre à jour le profil d'un utilisateur existant
 */
async function updateUserProfile(userId, productConfig) {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      access_level: productConfig.accessLevel,
      products: productConfig.products,
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Parser les données form-urlencoded
 */
async function parseFormData(req) {
  if (req.headers['content-type']?.includes('application/json')) {
    return await req.json()
  }

  // Pour form-urlencoded
  const text = await req.text()
  const params = new URLSearchParams(text)
  
  return {
    name: params.get('name'), // Optionnel, conservé pour compatibilité mais non utilisé
    email: params.get('email'),
    product: params.get('product')
  }
}

/**
 * Générer un mot de passe temporaire sécurisé
 */
function generateTempPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

/**
 * Envoyer un email de bienvenue
 * TODO: Implémenter avec votre service d'email préféré
 */
async function sendWelcomeEmail(email, tempPassword) {
  // Exemple avec Resend, SendGrid, ou autre service
  // Pour l'instant, retourner false - à implémenter selon votre préférence
  
  // Exemple avec Resend:
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // 
  // await resend.emails.send({
  //   from: 'EVO ECOM <noreply@evoecom.com>',
  //   to: email,
  //   subject: 'Bienvenue sur EVO ECOM',
  //   html: `Bonjour, votre compte a été créé. Mot de passe temporaire: ${tempPassword}`
  // })
  
  console.log(`📧 Email à envoyer à ${email}: Mot de passe temporaire: ${tempPassword}`)
  return false
}

// Export pour différents environnements
export default provisionUser

// Pour Supabase Edge Function:
/*
export async function handler(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const result = await provisionUser(req)
    return new Response(
      JSON.stringify(result.body),
      {
        status: result.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}
*/

// Pour Vercel/Netlify API Route:
/*
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const result = await provisionUser(req)
  res.status(result.status).json(result.body)
}
*/

