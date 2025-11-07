# 📚 Guide Complet : Configuration du Webhook de Création de Compte

Ce guide explique comment configurer automatiquement la création de compte utilisateur après chaque paiement.

---

## 🎯 Vue d'ensemble

Le système fonctionne ainsi :
1. ✅ Le client paie sur votre page de paiement (ThriveCart)
2. ✅ Après le paiement réussi, ThriveCart envoie un webhook à Supabase
3. ✅ Supabase crée automatiquement le compte utilisateur avec le bon niveau d'accès
4. ✅ L'utilisateur reçoit un email avec ses identifiants

---

## 📋 Étape 1 : Préparer le Script pour Supabase Edge Function

### 1.1 Créer la structure de dossiers

Dans votre projet Supabase local ou via le CLI, créez :

```bash
supabase/
  └── functions/
      └── provision-user/
          └── index.ts
```

### 1.2 Convertir le script JavaScript en TypeScript pour Supabase

Le fichier `webhook-provisioning.js` doit être adapté pour Supabase Edge Functions. Voici la version TypeScript :

```typescript
// supabase/functions/provision-user/index.ts
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
const PRODUCT_TO_LEVEL: Record<string, { accessLevel: number; products: string[] }> = {
  'STFOUR': {
    accessLevel: 1, // Niveau 1: Produit 1 seulement
    products: ['STFOUR']
  },
  'GLBNS': {
    accessLevel: 2, // Niveau 2: Produits 1 + 2
    products: ['STFOUR', 'GLBNS']
  }
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer les variables d'environnement Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        // Récupérer l'ID de l'utilisateur existant
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(body.email)
        
        if (existingUser?.user) {
          // Mettre à jour le profil existant
          await updateUserProfile(supabaseAdmin, existingUser.user.id, productConfig)
          
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Utilisateur mis à jour',
              user_id: existingUser.user.id,
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
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        email: body.email,
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
    // Note: Vous pouvez utiliser Supabase Auth email templates ou un service externe
    const emailSent = await sendWelcomeEmail(body.email, tempPassword)

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
 * Envoyer un email de bienvenue
 * TODO: Configurer avec votre service d'email (Resend, SendGrid, etc.)
 */
async function sendWelcomeEmail(email: string, tempPassword: string): Promise<boolean> {
  // Exemple avec Resend:
  // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  // const response = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${RESEND_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     from: 'EVO ECOM <noreply@evoecom.com>',
  //     to: email,
  //     subject: 'Bienvenue sur EVO ECOM - Vos identifiants de connexion',
  //     html: `
  //       <h1>Bienvenue sur EVO ECOM !</h1>
  //       <p>Votre compte a été créé avec succès.</p>
  //       <p><strong>Email:</strong> ${email}</p>
  //       <p><strong>Mot de passe temporaire:</strong> ${tempPassword}</p>
  //       <p><a href="https://evoecom.com/login">Se connecter</a></p>
  //       <p>⚠️ Nous vous recommandons de changer ce mot de passe lors de votre première connexion.</p>
  //     `
  //   })
  // })
  // return response.ok

  console.log(`📧 Email à envoyer à ${email}: Mot de passe temporaire: ${tempPassword}`)
  return false // À activer quand l'email sera configuré
}
```

---

## 📋 Étape 2 : Déployer la Fonction Supabase

### 2.1 Installer Supabase CLI (si pas déjà fait)

```bash
# Sur Windows (PowerShell)
irm https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip -OutFile supabase.zip
Expand-Archive supabase.zip -DestinationPath .

# Ou via npm
npm install -g supabase
```

### 2.2 Initialiser Supabase (si pas déjà fait)

```bash
supabase login
supabase link --project-ref votre-project-ref
```

Récupérez votre `project-ref` dans l'URL de votre projet Supabase : `https://[project-ref].supabase.co`

### 2.3 Déployer la fonction

```bash
supabase functions deploy provision-user
```

**✅ Après le déploiement, vous obtiendrez une URL comme :**
```
https://[votre-project-ref].supabase.co/functions/v1/provision-user
```

**⚠️ IMPORTANT : Notez cette URL, vous en aurez besoin pour ThriveCart !**

---

## 📋 Étape 3 : Configurer le Webhook dans ThriveCart

ThriveCart permet d'envoyer des webhooks après un paiement réussi. Voici comment configurer :

### 3.1 Accéder aux paramètres de webhook dans ThriveCart

1. **Connectez-vous à votre compte ThriveCart**
2. Allez dans **"Settings"** > **"Integrations"** > **"Webhooks"**
3. Cliquez sur **"Add Webhook"** ou **"Create Webhook"**

### 3.2 Configurer le webhook pour STFOUR (Pack Global Sourcing)

**URL du webhook :**
```
https://[votre-project-ref].supabase.co/functions/v1/provision-user
```

**Méthode HTTP :** `POST`

**Format :** `application/x-www-form-urlencoded`

**Quand déclencher :** Sélectionnez **"Order Completed"** (Commande terminée)

**Paramètres à envoyer :**

Dans ThriveCart, vous devez mapper les variables disponibles au format requis. ThriveCart utilise des variables dynamiques. Configurez-les ainsi :

| Nom du champ | Valeur ThriveCart Variable |
|-------------|----------------------------|
| `email` | `{{customer.email}}` |
| `product` | `STFOUR` (valeur fixe pour ce produit) |

**Configuration alternative avec JSON :**

Si ThriveCart supporte JSON, configurez le Content-Type comme `application/json` et le body comme :

```json
{
  "email": "{{customer.email}}",
  "product": "STFOUR"
}
```

**⚠️ Note importante :** 
- Pour le produit **STFOUR**, mettez toujours `product` = `STFOUR`
- Pour le produit **GLBNS**, mettez toujours `product` = `GLBNS`
- Le champ `name` est optionnel et peut être omis

### 3.3 Configurer le webhook pour GLBNS (Pack Global Business)

**Créez un deuxième webhook** avec les mêmes paramètres, mais :

| Nom du champ | Valeur |
|-------------|--------|
| `email` | `{{customer.email}}` |
| `product` | `GLBNS` |

**Condition de déclenchement :** Sélectionnez **"Order Completed"** et configurez une **condition** pour ne se déclencher que pour le produit GLBNS.

**Exemple de condition dans ThriveCart :**
- **When:** `Order Completed`
- **Product:** Sélectionnez votre produit GLBNS
- **Then:** Send Webhook

### 3.4 Configuration alternative : Un seul webhook avec condition

Si ThriveCart permet d'envoyer des variables dynamiques basées sur le produit, vous pouvez créer **un seul webhook** :

| Nom du champ | Valeur |
|-------------|--------|
| `email` | `{{customer.email}}` |
| `product` | `{{product.sku}}` ou `{{product.name}}` |

Dans ce cas, vous devrez **configurer les SKU de vos produits** dans ThriveCart :
- **Produit STFOUR** → SKU = `STFOUR`
- **Produit GLBNS** → SKU = `GLBNS`

---

## 📋 Étape 4 : Tester le Webhook

### 4.1 Test manuel avec cURL

Testez votre fonction directement depuis votre terminal :

```bash
# Test pour STFOUR
curl -X POST "https://[votre-project-ref].supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&product=STFOUR"

# Test pour GLBNS
curl -X POST "https://[votre-project-ref].supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test2@example.com&product=GLBNS"
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "user_id": "...",
  "email": "test@example.com",
  "access_level": 1,
  "products": ["STFOUR"],
  "email_sent": false
}
```

### 4.2 Test avec un achat réel (Mode Test)

1. Configurez ThriveCart en **mode test/sandbox**
2. Effectuez un **paiement test** avec une carte de test
3. Vérifiez dans **Supabase Dashboard** > **Authentication** > **Users** que l'utilisateur a été créé
4. Vérifiez dans **Table Editor** > **user_profiles** que le profil a bien le bon `access_level` et `products`

### 4.3 Vérifier les logs

Dans **Supabase Dashboard** > **Edge Functions** > **provision-user** > **Logs**, vous verrez :
- Les requêtes reçues
- Les erreurs éventuelles
- Les créations de comptes réussies

---

## 📋 Étape 5 : Configurer l'Email de Bienvenue (Optionnel mais Recommandé)

Par défaut, le webhook crée le compte mais n'envoie pas d'email. Voici comment activer l'envoi d'emails :

### 5.1 Option A : Utiliser Supabase Auth Email Templates

1. Dans **Supabase Dashboard** > **Authentication** > **Email Templates**
2. Créez un template personnalisé pour l'email de bienvenue
3. Modifiez la fonction pour utiliser Supabase Auth API

### 5.2 Option B : Utiliser un service externe (Resend, SendGrid, etc.)

**Avec Resend (recommandé) :**

1. **Créez un compte sur [resend.com](https://resend.com)**
2. **Ajoutez la clé API** dans Supabase :
   - **Dashboard** > **Edge Functions** > **provision-user** > **Settings** > **Secrets**
   - Ajoutez `RESEND_API_KEY` avec votre clé Resend

3. **Modifiez la fonction** pour activer l'envoi d'email :

Dans `sendWelcomeEmail`, décommentez et modifiez :

```typescript
async function sendWelcomeEmail(email: string, tempPassword: string): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY non configuré, email non envoyé')
    return false
  }

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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Bienvenue sur EVO ECOM !</h1>
            <p>Votre compte a été créé avec succès suite à votre achat.</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email de connexion:</strong> ${email}</p>
              <p><strong>Mot de passe temporaire:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
            </div>
            <a href="https://evoecom.com/login" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Se connecter maintenant
            </a>
            <p style="color: #DC2626; font-size: 14px;">⚠️ <strong>Important:</strong> Nous vous recommandons fortement de changer ce mot de passe lors de votre première connexion dans les paramètres de votre compte.</p>
          </div>
        `
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return false
  }
}
```

4. **Redéployez la fonction :**
```bash
supabase functions deploy provision-user
```

---

## 🔍 Dépannage

### ❌ Le webhook ne se déclenche pas

- ✅ Vérifiez que ThriveCart est en mode **production** (pas en mode test si le webhook est désactivé en test)
- ✅ Vérifiez l'URL du webhook dans ThriveCart
- ✅ Vérifiez les logs ThriveCart pour voir si le webhook a été envoyé

### ❌ Erreur 401 Unauthorized

- ✅ Vérifiez que votre **Service Role Key** est bien configuré dans Supabase (pas l'Anon Key)
- ✅ Vérifiez les **Secrets** de la fonction Edge Function

### ❌ Erreur "Produit invalide"

- ✅ Vérifiez que le paramètre `product` est bien `STFOUR` ou `GLBNS` (en majuscules)
- ✅ Si vous utilisez des variables ThriveCart, vérifiez qu'elles renvoient bien la bonne valeur

### ❌ L'utilisateur est créé mais le profil ne l'est pas

- ✅ Vérifiez les **RLS policies** sur la table `user_profiles`
- ✅ Vérifiez que la fonction utilise bien la **Service Role Key** (privilèges admin)

### ❌ L'utilisateur existe déjà

- ✅ C'est normal ! Le système met à jour automatiquement le profil existant avec le nouveau produit
- ✅ Vérifiez dans `user_profiles` que `access_level` et `products` ont été mis à jour

---

## 📝 Résumé des URLs importantes

- **URL de la fonction :** `https://[project-ref].supabase.co/functions/v1/provision-user`
- **Dashboard Supabase :** `https://app.supabase.com/project/[project-ref]`
- **Documentation Supabase Edge Functions :** https://supabase.com/docs/guides/functions
- **Documentation ThriveCart Webhooks :** https://help.thrivecart.com/en/articles/2868277-webhooks

---

## ✅ Checklist finale

- [ ] Fonction Edge Function créée et déployée
- [ ] URL de la fonction notée
- [ ] Webhook configuré dans ThriveCart pour STFOUR
- [ ] Webhook configuré dans ThriveCart pour GLBNS
- [ ] Test manuel avec cURL réussi
- [ ] Test avec achat réel réussi
- [ ] Vérification dans Supabase que le compte est créé
- [ ] Vérification que le profil a le bon `access_level`
- [ ] (Optionnel) Email de bienvenue configuré et testé

---

**🎉 Félicitations ! Votre système de création automatique de compte est maintenant configuré !**

