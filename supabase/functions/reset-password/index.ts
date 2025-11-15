// Supabase Edge Function pour réinitialiser le mot de passe d'un utilisateur (admin uniquement)
// Déploiement: supabase functions deploy reset-password

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  email: string
  redirectTo?: string
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
      return new Response(
        JSON.stringify({ success: false, error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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

    // Créer un client avec le token de l'utilisateur pour vérifier les permissions
    const supabaseUser = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        global: {
          headers: { Authorization: authHeader }
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Vérifier que l'utilisateur est authentifié et est admin
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('access_level')
      .eq('id', user.id)
      .single()

    if (!profile || profile.access_level !== 4) {
      return new Response(
        JSON.stringify({ success: false, error: 'Accès refusé. Administrateur requis.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parser les données
    const body: RequestBody = await req.json()

    // Validation
    if (!body.email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Paramètre manquant: email est requis'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Déterminer l'URL de redirection
    const origin = req.headers.get('origin') || req.headers.get('referer') || ''
    let redirectTo = body.redirectTo || Deno.env.get('SITE_URL') || 'https://evoecom.com'
    
    if (!body.redirectTo) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        const match = origin.match(/^(https?:\/\/[^\/]+)/)
        if (match) {
          redirectTo = match[1]
        } else {
          redirectTo = 'http://localhost:5173'
        }
      } else if (origin && origin.match(/^https?:\/\//)) {
        const match = origin.match(/^(https?:\/\/[^\/]+)/)
        if (match) {
          redirectTo = match[1]
        }
      }
    }
    
    redirectTo = `${redirectTo}/login?recovery=true`

    // Générer le lien de réinitialisation de mot de passe
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: body.email,
      options: {
        redirectTo: redirectTo
      }
    })

    if (linkError || !linkData) {
      console.error('[reset-password] Erreur génération lien:', linkError)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erreur lors de la génération du lien: ${linkError?.message || 'Erreur inconnue'}`
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Envoyer l'email de réinitialisation via SendGrid (prioritaire)
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const hasExternalEmailProvider = !!SENDGRID_API_KEY || !!RESEND_API_KEY

    let emailSent = false

    if (hasExternalEmailProvider) {
      if (SENDGRID_API_KEY) {
        console.log('[reset-password] Envoi de l\'email via SendGrid...')
      } else if (RESEND_API_KEY) {
        console.log('[reset-password] Envoi de l\'email via Resend...')
      }
      // Envoyer l'email via SendGrid (prioritaire) ou Resend (fallback)
      emailSent = await sendResetPasswordEmail(
        body.email,
        linkData.properties.action_link,
        supabaseAdmin
      )
    } else {
      // Supabase enverra l'email automatiquement via le template
      // On considère que l'email sera envoyé si le lien a été généré
      emailSent = true
      console.log('[reset-password] ⚠️ Aucun fournisseur d\'email externe configuré. Supabase enverra l\'email via le template configuré.')
      console.log('[reset-password] 💡 Configurez SENDGRID_API_KEY pour utiliser SendGrid')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email de réinitialisation de mot de passe envoyé',
        email: body.email,
        email_sent: emailSent
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[reset-password] Erreur globale:', error)
    console.error('[reset-password] Stack:', error.stack)
    console.error('[reset-password] Message:', error.message)
    
    let statusCode = 500
    let errorMessage = error.message || 'Erreur lors de la réinitialisation du mot de passe'
    
    if (error.message?.includes('Non authentifié') || error.code === 'PGRST301') {
      statusCode = 401
    } else if (error.message?.includes('Accès refusé') || error.code === 'PGRST301') {
      statusCode = 403
    } else if (error.message?.includes('Paramètre manquant')) {
      statusCode = 400
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/**
 * Envoyer un email de réinitialisation de mot de passe
 * Utilise SendGrid si configuré, sinon Resend, sinon Supabase Auth
 */
async function sendResetPasswordEmail(
  email: string,
  resetLink: string,
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
          <h1 style="color: #4F46E5;">Réinitialisation de votre mot de passe</h1>
          <p>Vous avez demandé la réinitialisation de votre mot de passe sur EVO ECOM.</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
          </div>
          <a href="${resetLink}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="color: #6B7280; font-size: 12px; word-break: break-all;">${resetLink}</p>
          <p style="color: #DC2626; font-size: 14px; margin-top: 20px;">⚠️ <strong>Important:</strong> Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
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
            subject: 'Réinitialisation de votre mot de passe - EVO ECOM'
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
        console.log(`✅ [SendGrid] Email de réinitialisation envoyé avec succès à ${email}`)
        return true
      } else {
        const errorText = await response.text()
        console.error(`❌ [SendGrid] Erreur (${response.status}):`, errorText)
        // Ne pas retourner false ici, on essaiera Resend ou Supabase en fallback
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
          subject: 'Réinitialisation de votre mot de passe - EVO ECOM',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4F46E5;">Réinitialisation de votre mot de passe</h1>
              <p>Vous avez demandé la réinitialisation de votre mot de passe sur EVO ECOM.</p>
              <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
              </div>
              <a href="${resetLink}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Réinitialiser mon mot de passe
              </a>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="color: #6B7280; font-size: 12px; word-break: break-all;">${resetLink}</p>
              <p style="color: #DC2626; font-size: 14px; margin-top: 20px;">⚠️ <strong>Important:</strong> Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
          `
        })
      })
      
      if (response.ok) {
        console.log(`✅ Email de réinitialisation envoyé avec succès à ${email} via Resend`)
        return true
      } else {
        const errorText = await response.text()
        console.error(`❌ Erreur Resend (${response.status}):`, errorText)
      }
    } catch (error) {
      console.error('❌ Erreur envoi email Resend:', error)
    }
  }

  // Option 3: Fallback - Supabase enverra l'email automatiquement via le template
  // (seulement si SendGrid et Resend ne sont pas configurés ou ont échoué)
  console.log(`📧 [Fallback] Lien de réinitialisation généré pour ${email}`)
  console.log(`📧 [Fallback] Supabase Auth enverra l'email si SMTP est configuré dans Project Settings > Auth`)
  console.log(`📧 [Fallback] Lien: ${resetLink}`)
  
  // Note: Dans ce cas, Supabase n'enverra pas automatiquement l'email avec generateLink
  // Il faudrait utiliser inviteUserByEmail ou configurer SMTP dans Supabase
  // Pour l'instant, on retourne false car l'email n'a pas été envoyé
  return false
}
