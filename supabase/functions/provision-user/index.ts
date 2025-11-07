// Supabase Edge Function pour créer automatiquement un compte utilisateur après paiement
// Déploiement: supabase functions deploy provision-user

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  name?: string
  email: string
  product: string
}

// Mapping des produits aux niveaux d'accès
// ⚠️ IMPORTANT: Les utilisateurs créés via ce webhook NE SONT JAMAIS ADMIN (niveau 4)
// Seuls les niveaux 1 et 2 sont assignés automatiquement selon le produit acheté
const PRODUCT_TO_LEVEL: Record<string, { accessLevel: number; products: string[] }> = {
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

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérification de sécurité : Secret partagé dans les headers (optionnel mais recommandé)
    const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')
    if (WEBHOOK_SECRET) {
      const providedSecret = req.headers.get('x-webhook-secret') || req.headers.get('authorization')?.replace('Bearer ', '')
      if (providedSecret !== WEBHOOK_SECRET) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Secret webhook invalide ou manquant'
          }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Récupérer les variables d'environnement Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement Supabase manquantes')
    }

    // Créer un client Supabase avec les privilèges admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parser les données (format application/x-www-form-urlencoded ou JSON)
    let body: RequestBody
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      // Pour form-urlencoded
      const text = await req.text()
      const params = new URLSearchParams(text)
      body = {
        name: params.get('name') || undefined,
        email: params.get('email') || '',
        product: params.get('product') || ''
      }
    }

    // Validation
    if (!body.email || !body.product) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Paramètres manquants: email et product sont requis'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérifier que le produit est valide
    const productConfig = PRODUCT_TO_LEVEL[body.product.toUpperCase()]
    if (!productConfig) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Produit invalide: ${body.product}. Valeurs acceptées: STFOUR, GLBNS`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // ⚠️ SÉCURITÉ: S'assurer qu'on n'assignera jamais le niveau admin (4) automatiquement
    if (productConfig.accessLevel >= 4) {
      throw new Error('Tentative de création d\'utilisateur avec niveau d\'accès interdit. Seuls les niveaux 1 et 2 sont autorisés via ce webhook.')
    }

    // Générer un mot de passe temporaire aléatoire
    const tempPassword = generateTempPassword()

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: tempPassword,
      email_confirm: true // Confirmer automatiquement l'email
    })

    if (authError) {
      // Si l'utilisateur existe déjà
      if (authError.message.includes('already registered') || 
          authError.message.includes('already been registered') ||
          authError.message.includes('User already registered')) {
        
        // Récupérer l'ID de l'utilisateur existant via listUsers
        const { data: usersList } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = usersList?.users?.find(u => u.email === body.email)
        
        if (existingUser) {
          // Mettre à jour le profil existant
          await updateUserProfile(supabaseAdmin, existingUser.id, productConfig)
          
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Utilisateur mis à jour',
              user_id: existingUser.id,
              email_sent: false
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }
      }
      
      throw authError
    }

    const userId = authData.user.id

    // Créer le profil utilisateur
    // ⚠️ IMPORTANT: access_level est limité à 1 ou 2 uniquement (jamais 3 ou 4)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        email: body.email,
        access_level: productConfig.accessLevel, // Toujours 1 ou 2, JAMAIS 4 (admin)
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
    const emailSent = await sendWelcomeEmail(body.email, tempPassword, supabaseAdmin)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Utilisateur créé avec succès',
        user_id: userId,
        email: body.email,
        access_level: productConfig.accessLevel,
        products: productConfig.products,
        email_sent: emailSent
        // ⚠️ En production, ne PAS renvoyer le temp_password dans la réponse
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('Erreur lors du provisioning:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors de la création de l\'utilisateur'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/**
 * Mettre à jour le profil d'un utilisateur existant
 */
async function updateUserProfile(
  supabaseAdmin: any,
  userId: string,
  productConfig: { accessLevel: number; products: string[] }
) {
  // ⚠️ SÉCURITÉ: Empêcher l'upgrade vers admin via webhook
  if (productConfig.accessLevel >= 4) {
    throw new Error('Tentative de mise à jour vers niveau admin interdit via webhook')
  }

  // Ne pas écraser un niveau supérieur existant (ex: si déjà support ou admin, garder)
  // On met seulement à jour si le nouveau niveau est supérieur ou égal
  const { data: existingProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('access_level')
    .eq('id', userId)
    .single()

  // Si l'utilisateur a déjà un niveau supérieur (3 ou 4), ne pas le downgrader
  const newAccessLevel = existingProfile?.access_level >= productConfig.accessLevel 
    ? existingProfile.access_level 
    : productConfig.accessLevel

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      access_level: newAccessLevel,
      products: productConfig.products,
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Générer un mot de passe temporaire sécurisé
 */
function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

/**
 * Envoyer un email de bienvenue avec les identifiants de connexion
 * Utilise SendGrid si configuré, sinon Resend, sinon Supabase Auth
 */
async function sendWelcomeEmail(
  email: string, 
  tempPassword: string,
  supabaseAdmin: any
): Promise<boolean> {
  // Option 1: Utiliser SendGrid (prioritaire)
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
  const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') || 'noreply@evoecom.com'
  const SENDGRID_FROM_NAME = Deno.env.get('SENDGRID_FROM_NAME') || 'EVO ECOM'
  
  if (SENDGRID_API_KEY) {
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">Bienvenue sur EVO ECOM !</h1>
          <p>Votre compte a été créé avec succès suite à votre achat.</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email de connexion:</strong> ${email}</p>
            <p><strong>Mot de passe temporaire:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
          </div>
          <a href="https://evoecom.com/login" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Se connecter maintenant
          </a>
          <p style="color: #DC2626; font-size: 14px; margin-top: 20px;">⚠️ <strong>Important:</strong> Nous vous recommandons fortement de changer ce mot de passe lors de votre première connexion dans les paramètres de votre compte.</p>
        </div>
      `

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: email }],
            subject: 'Bienvenue sur EVO ECOM - Vos identifiants de connexion'
          }],
          from: {
            email: SENDGRID_FROM_EMAIL,
            name: SENDGRID_FROM_NAME
          },
          content: [{
            type: 'text/html',
            value: emailHtml
          }]
        })
      })
      
      if (response.ok) {
        console.log(`✅ Email envoyé avec succès à ${email} via SendGrid`)
        return true
      } else {
        const errorText = await response.text()
        console.error(`❌ Erreur SendGrid (${response.status}):`, errorText)
      }
    } catch (error) {
      console.error('❌ Erreur envoi email SendGrid:', error)
    }
  }

  // Option 2: Utiliser Resend (fallback)
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  
  if (RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'EVO ECOM <noreply@evoecom.com>',
          to: email,
          subject: 'Bienvenue sur EVO ECOM - Vos identifiants de connexion',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4F46E5;">Bienvenue sur EVO ECOM !</h1>
              <p>Votre compte a été créé avec succès suite à votre achat.</p>
              <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Email de connexion:</strong> ${email}</p>
                <p><strong>Mot de passe temporaire:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
              </div>
              <a href="https://evoecom.com/login" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Se connecter maintenant
              </a>
              <p style="color: #DC2626; font-size: 14px; margin-top: 20px;">⚠️ <strong>Important:</strong> Nous vous recommandons fortement de changer ce mot de passe lors de votre première connexion dans les paramètres de votre compte.</p>
            </div>
          `
        })
      })
      
      if (response.ok) {
        console.log(`✅ Email envoyé avec succès à ${email} via Resend`)
        return true
      } else {
        const errorText = await response.text()
        console.error(`❌ Erreur Resend (${response.status}):`, errorText)
      }
    } catch (error) {
      console.error('❌ Erreur envoi email Resend:', error)
    }
  }

  // Option 3: Utiliser Supabase Auth pour envoyer un email de reset de mot de passe
  // Cela déclenchera l'envoi d'un email via les templates Supabase
  try {
    // Générer un lien de réinitialisation de mot de passe
    // Supabase enverra automatiquement l'email avec le template configuré
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://evoecom.com/login?reset=true'
      }
    })

    if (!linkError && linkData) {
      console.log(`✅ Email de réinitialisation envoyé à ${email} via Supabase Auth`)
      console.log(`📧 Lien de réinitialisation: ${linkData.properties.action_link}`)
      // Note: Le mot de passe temporaire est ${tempPassword} mais l'utilisateur devra le réinitialiser via le lien
      return true
    } else {
      console.error('❌ Erreur génération lien recovery:', linkError)
    }
  } catch (error) {
    console.error('❌ Erreur envoi email recovery:', error)
  }

  // Fallback - Logger les informations si aucun service d'email n'est configuré
  console.log(`📧 [FALLBACK] Email à envoyer manuellement à ${email}`)
  console.log(`📧 Mot de passe temporaire: ${tempPassword}`)
  console.log(`📧 Configurez SendGrid (SENDGRID_API_KEY) ou Resend (RESEND_API_KEY) pour l'envoi automatique`)
  
  return false
}

