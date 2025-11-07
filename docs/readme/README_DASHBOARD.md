# Dashboard Multi-Niveaux - Guide d'Installation

## 🎯 Vue d'ensemble

Système de dashboard avec 4 niveaux d'accès :
- **Level 1**: Produit 1 seulement (STFOUR)
- **Level 2**: Produits 1 + 2 (STFOUR + GLBNS)
- **Level 3**: Support
- **Level 4**: Admin (accès complet)

## 📋 Installation

### 1. Exécuter le schéma SQL

Exécutez le fichier `database_dashboard_schema.sql` dans votre console Supabase SQL Editor.

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

### 3. Configuration Supabase

#### Activer Row Level Security (RLS)
Le schéma SQL active automatiquement RLS sur `user_profiles`.

#### Service Role Key (pour le webhook)
Pour le webhook de provisioning, vous aurez besoin de la **Service Role Key** (pas l'Anon Key).
⚠️ **Important**: Ne jamais exposer cette clé côté client !

#### Créer un utilisateur admin manuellement

Après avoir créé votre compte dans l'application, exécutez cette requête SQL dans Supabase :

```sql
-- Remplacer 'votre-email@example.com' par votre email
UPDATE user_profiles
SET access_level = 4
WHERE email = 'votre-email@example.com';
```

### 4. Configurer le webhook de provisioning

Le fichier `webhook-provisioning.js` contient la logique pour créer automatiquement les utilisateurs quand un paiement est effectué.

#### Option A: Supabase Edge Functions (Recommandé)

1. Créez un dossier `supabase/functions/provision-user/`
2. Créez le fichier `index.ts` :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const formData = await req.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const product = formData.get('product') as string

    // ... (utiliser la logique de webhook-provisioning.js)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

3. Déployez la function :
```bash
supabase functions deploy provision-user
```

4. Configurez l'URL dans ThriveCart :
```
POST https://votre-projet.supabase.co/functions/v1/provision-user
```

#### Option B: API Route (Vercel/Netlify)

Créez `api/user.js` ou `api/user.ts` dans votre projet et utilisez le code de `webhook-provisioning.js`.

#### Option C: Serveur Node.js séparé

Créez un serveur Express/Fastify et utilisez `webhook-provisioning.js`.

## 🔐 Routes protégées

Les routes suivantes sont protégées :
- `/dashboard` - Dashboard principal (nécessite authentification)
- `/dashboard/products` - Liste des produits (nécessite authentification)
- `/dashboard/users` - Gestion utilisateurs (Admin seulement - Level 4)
- `/dashboard/stats` - Statistiques (Admin seulement - Level 4)

## 👥 Fonctionnalités Admin

Les administrateurs peuvent :
- ✅ Voir tous les utilisateurs
- ✅ Révoquer/Restaurer l'accès
- ✅ Réinitialiser les mots de passe (envoie un email)
- ✅ Voir les statistiques globales
- ✅ Filtrer et rechercher les utilisateurs

## 📧 Configuration Email

Pour envoyer les emails de bienvenue et de réinitialisation de mot de passe, configurez :

1. **Dans Supabase Dashboard** :
   - Allez dans Authentication > Email Templates
   - Configurez les templates d'email

2. **Ou utilisez un service externe** :
   - Resend (recommandé)
   - SendGrid
   - Mailgun
   
   Modifiez la fonction `sendWelcomeEmail` dans `webhook-provisioning.js`.

## 🚀 Utilisation

### Connexion
1. Créer un compte via le webhook lors d'un achat
2. L'utilisateur reçoit un email avec son mot de passe temporaire
3. Se connecter sur `/login`
4. Accéder au dashboard

### Créer un utilisateur manuellement (Admin)

Connectez-vous en tant qu'admin et utilisez l'interface ou exécutez cette requête SQL :

```sql
-- Créer un utilisateur
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('email@example.com', crypt('motdepasse', gen_salt('bf')), NOW());

-- Créer le profil
INSERT INTO user_profiles (id, email, full_name, access_level, products)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'email@example.com'),
  'email@example.com',
  'Nom Complet',
  1,  -- Niveau d'accès
  '["STFOUR"]'::jsonb
);
```

## 🔧 Dépannage

### L'utilisateur ne peut pas se connecter
- Vérifiez que le profil existe dans `user_profiles`
- Vérifiez que `is_active = true`
- Vérifiez le niveau d'accès

### Le webhook ne fonctionne pas
- Vérifiez la Service Role Key
- Vérifiez les logs dans Supabase Dashboard
- Vérifiez que les politiques RLS permettent l'insertion

### Les statistiques ne s'affichent pas
- Vérifiez que la fonction `get_user_stats()` existe
- Vérifiez que vous êtes connecté en tant qu'admin

## 📝 Notes importantes

- ⚠️ Les mots de passe temporaires générés par le webhook doivent être changés au premier login
- ⚠️ La Service Role Key doit rester secrète (jamais dans le code client)
- ⚠️ Configurez les CORS correctement pour le webhook
- ⚠️ Testez le webhook dans un environnement de staging avant la production

