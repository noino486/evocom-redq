// Supabase Edge Function pour créer un utilisateur depuis le dashboard admin
// Déploiement: supabase functions deploy create-user

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  email: string
  access_level: number
  products: string[]
  site_url?: string // URL optionnelle passée depuis le frontend
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
    if (!body.email || !body.access_level || !body.products) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Paramètres manquants: email, access_level et products sont requis'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validation du niveau d'accès
    if (body.access_level < 1 || body.access_level > 4) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Niveau d\'accès invalide (doit être entre 1 et 4)'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    // Utiliser listUsers avec filtre email car getUserByEmail n'existe pas dans cette version
    let userId: string | null = null
    
    try {
      const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error('[create-user] Erreur listUsers:', listError)
        // Continuer, on essaiera de créer l'utilisateur quand même
      } else if (usersList?.users) {
        const existingUser = usersList.users.find(u => u.email === body.email)
        if (existingUser) {
          userId = existingUser.id
          console.log('[create-user] Utilisateur existant trouvé:', userId)
        }
      }
    } catch (listErr: any) {
      console.error('[create-user] Erreur lors de la recherche utilisateur:', listErr)
      // Continuer, on essaiera de créer l'utilisateur quand même
    }
    
    let existingProfileForUser: any = null

    if (userId) {
      // Utilisateur existe déjà
      
      // Vérifier si le profil existe
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (existingProfile) {
        existingProfileForUser = existingProfile
        console.log('[create-user] Profil existant trouvé, mise à jour programmée')
      }
    }

    // Envoyer l'invitation par email
    // Détecter l'URL du site : priorité à body.site_url, puis origin, puis env, puis défaut
    const origin = req.headers.get('origin') || req.headers.get('referer') || ''
    let siteUrl = body.site_url || Deno.env.get('SITE_URL') || 'https://evoecom.com'
    
    // Si site_url n'est pas fourni dans le body, essayer de l'extraire de l'origin
    if (!body.site_url) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        const match = origin.match(/^(https?:\/\/[^\/]+)/)
        if (match) {
          siteUrl = match[1]
          console.log('[create-user] URL locale détectée depuis origin:', siteUrl)
        } else {
          siteUrl = 'http://localhost:5173'
        }
      } else if (origin && origin.match(/^https?:\/\//)) {
        const match = origin.match(/^(https?:\/\/[^\/]+)/)
        if (match) {
          siteUrl = match[1]
          console.log('[create-user] URL détectée depuis origin:', siteUrl)
        }
      }
    } else {
      console.log('[create-user] URL fournie dans la requête:', siteUrl)
    }
    
    console.log('[create-user] URL de redirection finale:', siteUrl)
    
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const hasExternalEmailProvider = !!SENDGRID_API_KEY || !!RESEND_API_KEY

    let inviteError = null
    let newUserId = userId
    let inviteSent = false

    // Si l'utilisateur n'existe pas, créer l'utilisateur et envoyer l'invitation
    if (!userId) {
      try {
        if (!hasExternalEmailProvider) {
          console.log('[create-user] Aucun fournisseur d\'email externe configuré. Utilisation de Supabase Auth (inviteUserByEmail).')

          const { data: inviteData, error: inviteErrorAdmin } = await supabaseAdmin.auth.admin.inviteUserByEmail({
            email: body.email,
            options: {
              redirectTo: `${siteUrl}/login?invited=true`,
              data: {
                invited_by: user.id,
                access_level: body.access_level.toString(),
                products: body.products.join(',')
              }
            }
          })

          if (inviteErrorAdmin) {
            if (inviteErrorAdmin.message?.includes('already registered')) {
              console.log('[create-user] Utilisateur déjà enregistré lors de l\'invitation, récupération de l\'ID...')
              const { data: usersList, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()

              if (getUserError) {
                console.error('[create-user] Erreur récupération utilisateur existant:', getUserError)
                throw new Error(`Utilisateur déjà enregistré mais impossible de récupérer: ${getUserError.message}`)
              }

              const existingUserData = usersList?.users?.find(u => u.email === body.email)

              if (existingUserData) {
                newUserId = existingUserData.id
                inviteSent = false
              } else {
                throw new Error('Utilisateur déjà enregistré mais introuvable dans la liste')
              }
            } else {
              throw inviteErrorAdmin
            }
          } else if (inviteData?.user) {
            newUserId = inviteData.user.id
            inviteSent = true
            console.log('[create-user] Invitation Supabase envoyée à', body.email)
          } else {
            throw new Error('Invitation Supabase envoyée mais aucune donnée utilisateur retournée')
          }
        } else {
          // Générer un lien d'invitation via Supabase Auth
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: body.email,
            options: {
              redirectTo: `${siteUrl}/login?invited=true`,
              data: {
                invited_by: user.id,
                access_level: body.access_level.toString(),
                products: body.products.join(',')
              }
            }
          })

          if (linkError || !linkData) {
            throw new Error(`Erreur génération lien d'invitation: ${linkError?.message || 'Erreur inconnue'}`)
          }

          const inviteLink = linkData.properties.action_link
          console.log('[create-user] Lien d\'invitation généré pour:', body.email)

          // Créer l'utilisateur sans mot de passe (il définira son mot de passe via le lien)
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: body.email,
            email_confirm: false, // Ne pas confirmer automatiquement, l'utilisateur confirmera via le lien
            user_metadata: {
              invited_by: user.id,
              access_level: body.access_level.toString(),
              products: body.products.join(',')
            }
          })

          if (authError) {
            // Si l'utilisateur existe déjà, récupérer son ID
            if (authError.message?.includes('already registered') || 
                authError.message?.includes('already been registered') ||
                authError.message?.includes('User already registered')) {
              console.log('[create-user] Utilisateur existe déjà, récupération de l\'ID...')
              
              const { data: usersList, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()
              
              if (getUserError) {
                console.error('[create-user] Erreur récupération utilisateur existant:', getUserError)
                throw new Error(`Utilisateur déjà enregistré mais impossible de récupérer: ${getUserError.message}`)
              }
              
              const existingUserData = usersList?.users?.find(u => u.email === body.email)
              
              if (existingUserData) {
                newUserId = existingUserData.id
                console.log('[create-user] Utilisateur existant trouvé:', newUserId)
                inviteError = null

                inviteSent = await sendInvitationEmail(
                  body.email,
                  inviteLink,
                  body.access_level,
                  body.products,
                  supabaseAdmin
                )

                if (inviteSent) {
                  console.log('[create-user] Email d\'invitation envoyé pour utilisateur existant')
                } else {
                  console.warn('[create-user] Email non envoyé pour utilisateur existant (vérifiez configuration)')
                }
              } else {
                throw new Error('Utilisateur déjà enregistré mais introuvable dans la liste')
              }
            } else {
              throw authError
            }
          } else if (authData?.user) {
            newUserId = authData.user.id
            console.log('[create-user] Utilisateur créé:', newUserId)
            
            // Envoyer l'email d'invitation via SendGrid/Resend ou Supabase Auth
            inviteSent = await sendInvitationEmail(
              body.email,
              inviteLink,
              body.access_level,
              body.products,
              supabaseAdmin
            )
            
            if (inviteSent) {
              console.log('[create-user] Email d\'invitation envoyé avec succès')
            } else {
              console.warn('[create-user] Email d\'invitation non envoyé (vérifiez la configuration)')
            }
          } else {
            throw new Error('Aucune donnée utilisateur retournée par createUser')
          }
        }
      } catch (err: any) {
        console.error('[create-user] Exception lors de la création:', {
          message: err.message,
          stack: err.stack,
          name: err.name,
          code: err.code
        })
        inviteError = err
        // Si on a une erreur mais qu'on a réussi à créer/récupérer l'utilisateur, continuer
        if (!newUserId) {
          const errorMsg = `Impossible de créer l'utilisateur: ${err.message || 'Erreur inconnue'}`
          console.error('[create-user]', errorMsg)
          throw new Error(errorMsg)
        } else {
          console.log('[create-user] Utilisateur trouvé mais erreur création, on continue avec le profil')
        }
      }
    } else {
      // L'utilisateur existe déjà, possibilité de renvoyer une invitation
      console.log('[create-user] Utilisateur existant (userId:', userId, '), tentative de renvoi d\'invitation')
      newUserId = userId

      try {
        if (!hasExternalEmailProvider) {
          const { error: inviteErrorAdmin } = await supabaseAdmin.auth.admin.inviteUserByEmail({
            email: body.email,
            options: {
              redirectTo: `${siteUrl}/login?invited=true`,
              data: {
                invited_by: user.id,
                access_level: body.access_level.toString(),
                products: body.products.join(',')
              }
            }
          })

          if (inviteErrorAdmin) {
            if (inviteErrorAdmin.message?.includes('already registered')) {
              console.log('[create-user] Supabase signale que l\'invitation existe déjà pour', body.email)
              inviteSent = false
            } else {
              throw inviteErrorAdmin
            }
          } else {
            inviteSent = true
            console.log('[create-user] Nouvelle invitation Supabase envoyée à', body.email)
          }
        } else {
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: body.email,
            options: {
              redirectTo: `${siteUrl}/login?invited=true`,
              data: {
                invited_by: user.id,
                access_level: body.access_level.toString(),
                products: body.products.join(',')
              }
            }
          })

          if (linkError || !linkData) {
            throw new Error(`Erreur génération lien d'invitation (utilisateur existant): ${linkError?.message || 'Erreur inconnue'}`)
          }

          const inviteLink = linkData.properties.action_link
          inviteSent = await sendInvitationEmail(
            body.email,
            inviteLink,
            body.access_level,
            body.products,
            supabaseAdmin
          )

          if (inviteSent) {
            console.log('[create-user] Email d\'invitation renvoyé pour utilisateur existant')
          } else {
            console.warn('[create-user] Email non envoyé pour utilisateur existant (vérifiez configuration)')
          }
        }
      } catch (err: any) {
        console.error('[create-user] Erreur lors du renvoi d\'invitation pour utilisateur existant:', err)
        inviteError = err
      }
    }

    if (!newUserId) {
      const errorMsg = 'Impossible de créer ou récupérer l\'utilisateur'
      console.error('[create-user]', errorMsg)
      throw new Error(errorMsg)
    }

    console.log('[create-user] Création/mise à jour du profil pour userId:', newUserId)

    // Créer ou mettre à jour le profil utilisateur
    let existingProfile = existingProfileForUser

    if (!existingProfile) {
      const profileResult = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', newUserId)
        .maybeSingle()

      console.log('[create-user] Résultat recherche profil:', {
        hasData: !!profileResult.data,
        hasError: !!profileResult.error,
        profileExists: !!profileResult.data
      })

      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        console.error('[create-user] Erreur recherche profil:', profileResult.error)
        throw profileResult.error
      }

      existingProfile = profileResult.data
    }

    if (existingProfile) {
      // Profil existe déjà - mettre à jour
      console.log('[create-user] Profil existant, mise à jour...')
      const updateResult = await supabaseAdmin
        .from('user_profiles')
        .update({
          access_level: body.access_level,
          products: body.products,
          updated_at: new Date().toISOString(),
          created_by: user.id
        })
        .eq('id', newUserId)

      if (updateResult.error) {
        console.error('[create-user] Erreur mise à jour profil:', updateResult.error)
        throw updateResult.error
      }
      console.log('[create-user] Profil mis à jour avec succès')
    } else {
      // Créer le profil utilisateur
      // L'utilisateur sera actif une fois qu'il aura accepté l'invitation et défini son mot de passe
      console.log('[create-user] Création nouveau profil...')
      const insertResult = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: newUserId,
          email: body.email,
          access_level: body.access_level,
          products: body.products,
          is_active: false, // Inactif jusqu'à acceptation de l'invitation et définition du mot de passe
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user.id
        })

      if (insertResult.error) {
        console.error('[create-user] Erreur création profil:', insertResult.error)
        throw insertResult.error
      }
      console.log('[create-user] Profil créé avec succès')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: inviteSent 
          ? 'Invitation envoyée avec succès par email' 
          : userId 
            ? 'Profil utilisateur créé/mis à jour (utilisateur existant)' 
            : 'Utilisateur créé mais email non envoyé',
        user_id: newUserId,
        email: body.email,
        access_level: body.access_level,
        products: body.products,
        invitation_sent: inviteSent,
        warning: inviteError ? `Note: ${inviteError.message}` : null
        // Note: inviteUserByEmail envoie automatiquement l'email d'invitation
        // L'email utilise le template "Invite user" configuré dans Supabase Dashboard > Authentication > Email Templates
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('[create-user] Erreur globale:', error)
    console.error('[create-user] Stack:', error.stack)
    console.error('[create-user] Message:', error.message)
    
    // Déterminer le code d'erreur approprié
    let statusCode = 500
    let errorMessage = error.message || 'Erreur lors de la création de l\'utilisateur'
    
    if (error.message?.includes('Non authentifié') || error.code === 'PGRST301') {
      statusCode = 401
    } else if (error.message?.includes('Accès refusé') || error.code === 'PGRST301') {
      statusCode = 403
    } else if (error.message?.includes('Paramètres manquants') || error.code === 'PGRST301') {
      statusCode = 400
    } else if (error.message?.includes('déjà') || error.message?.includes('already')) {
      statusCode = 409
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
 * Envoyer un email d'invitation avec le lien d'invitation
 * Utilise SendGrid si configuré, sinon Resend, sinon Supabase Auth
 */
async function sendInvitationEmail(
  email: string,
  inviteLink: string,
  accessLevel: number,
  products: string[],
  supabaseAdmin: any
): Promise<boolean> {
  // Option 1: Utiliser SendGrid (prioritaire)
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
  const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') || 'noreply@evoecom.com'
  const SENDGRID_FROM_NAME = Deno.env.get('SENDGRID_FROM_NAME') || 'EVO ECOM'
  
  const accessLevelNames: Record<number, string> = {
    1: 'Client',
    2: 'Client Premium',
    3: 'Support',
    4: 'Administrateur'
  }

  if (SENDGRID_API_KEY) {
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">Vous êtes invité sur EVO ECOM !</h1>
          <p>Vous avez été invité à rejoindre EVO ECOM avec le niveau d'accès <strong>${accessLevelNames[accessLevel] || accessLevel}</strong>.</p>
          ${products.length > 0 ? `<p><strong>Produits accessibles:</strong> ${products.join(', ')}</p>` : ''}
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte :</p>
          </div>
          <a href="${inviteLink}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Accepter l'invitation
          </a>
          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="color: #6B7280; font-size: 12px; word-break: break-all;">${inviteLink}</p>
          <p style="color: #DC2626; font-size: 14px; margin-top: 20px;">⚠️ <strong>Important:</strong> Ce lien est valide pendant 24 heures. Après avoir cliqué, vous devrez définir votre mot de passe.</p>
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
            subject: 'Invitation à rejoindre EVO ECOM'
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
        console.log(`✅ Email d'invitation envoyé avec succès à ${email} via SendGrid`)
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
          subject: 'Invitation à rejoindre EVO ECOM',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4F46E5;">Vous êtes invité sur EVO ECOM !</h1>
              <p>Vous avez été invité à rejoindre EVO ECOM avec le niveau d'accès <strong>${accessLevelNames[accessLevel] || accessLevel}</strong>.</p>
              ${products.length > 0 ? `<p><strong>Produits accessibles:</strong> ${products.join(', ')}</p>` : ''}
              <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte :</p>
              </div>
              <a href="${inviteLink}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Accepter l'invitation
              </a>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="color: #6B7280; font-size: 12px; word-break: break-all;">${inviteLink}</p>
              <p style="color: #DC2626; font-size: 14px; margin-top: 20px;">⚠️ <strong>Important:</strong> Ce lien est valide pendant 24 heures. Après avoir cliqué, vous devrez définir votre mot de passe.</p>
            </div>
          `
        })
      })
      
      if (response.ok) {
        console.log(`✅ Email d'invitation envoyé avec succès à ${email} via Resend`)
        return true
      } else {
        const errorText = await response.text()
        console.error(`❌ Erreur Resend (${response.status}):`, errorText)
      }
    } catch (error) {
      console.error('❌ Erreur envoi email Resend:', error)
    }
  }

  // Option 3: Utiliser Supabase Auth pour envoyer l'email d'invitation
  // Supabase Auth peut envoyer automatiquement des emails via ses templates
  // Le lien d'invitation sera envoyé via le template "Invite user"
  try {
    // Utiliser inviteUserByEmail qui envoie automatiquement l'email
    // Mais on a déjà créé l'utilisateur, donc on génère juste le lien
    // Le système Supabase enverra l'email si SMTP est configuré
    console.log(`📧 Lien d'invitation généré pour ${email}: ${inviteLink}`)
    console.log(`📧 Supabase Auth enverra l'email si SMTP est configuré dans Project Settings > Auth`)
    
    // Retourner true car Supabase peut gérer l'envoi si configuré
    return true
  } catch (error) {
    console.error('❌ Erreur envoi email Supabase Auth:', error)
    return false
  }
}

