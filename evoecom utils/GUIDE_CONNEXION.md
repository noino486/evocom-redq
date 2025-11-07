# 📝 Guide de Connexion au Dashboard

## 🚀 Accès rapide

1. **Aller sur la page de connexion** : `http://localhost:5173/login` (ou votre URL de production)
2. **Ou cliquer sur "Connexion"** dans le menu du Header

## 👤 Créer votre premier compte (Admin)

### Option 1 : Création manuelle via Supabase Dashboard

1. Allez dans votre projet Supabase → **Authentication** → **Users**
2. Cliquez sur **"Add user"** → **"Create new user"**
3. Entrez :
   - **Email** : votre email
   - **Password** : votre mot de passe
   - Cochez **"Auto Confirm User"**
4. Cliquez sur **"Create user"**
5. **Important** : Copiez l'ID de l'utilisateur créé
6. Allez dans **SQL Editor** et exécutez :

```sql
-- Remplacez 'EMAIL@example.com' par votre email
-- Remplacez 'USER_ID_UUID' par l'ID copié
INSERT INTO user_profiles (id, email, access_level, products, is_active)
VALUES (
  'USER_ID_UUID',
  'EMAIL@example.com',
  4,  -- Niveau Admin
  '["STFOUR", "GLBNS"]'::jsonb,
  true
);
```

### Option 2 : Création via SQL direct

Exécutez ces requêtes SQL dans Supabase SQL Editor :

```sql
-- 1. Créer l'utilisateur dans auth.users (via Supabase Dashboard UI recommandé)
-- OU utilisez l'API Supabase Auth Admin

-- 2. Récupérer l'ID de l'utilisateur
-- Dans Supabase Dashboard → Authentication → Users, copiez l'UUID

-- 3. Créer le profil (remplacez les valeurs)
INSERT INTO user_profiles (id, email, access_level, products, is_active)
SELECT 
  id,
  email,
  4,  -- Admin
  '["STFOUR", "GLBNS"]'::jsonb,
  true
FROM auth.users
WHERE email = 'votre-email@example.com';
```

### Option 3 : Utiliser l'API Supabase Admin (recommandé pour scripts)

Si vous avez accès à l'API Supabase Admin, vous pouvez utiliser ce script Node.js :

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'VOTRE_SUPABASE_URL',
  'VOTRE_SERVICE_ROLE_KEY' // ⚠️ Jamais côté client !
)

// Créer l'utilisateur
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'VotreMotDePasse',
  email_confirm: true
})

// Créer le profil
await supabaseAdmin
  .from('user_profiles')
  .insert({
    id: data.user.id,
    email: 'admin@example.com',
    access_level: 4, // Admin
    products: ['STFOUR', 'GLBNS'],
    is_active: true
  })
```

## 🔐 Connexion au dashboard

1. Allez sur `/login` (ou cliquez sur "Connexion" dans le menu)
2. Entrez votre **email** et **mot de passe**
3. Cliquez sur **"Se connecter"**
4. Vous serez redirigé vers `/dashboard`

## 📊 Niveaux d'accès

### Level 1 : Produit 1 seulement
- Accès au produit STFOUR uniquement
- Voir `/dashboard/products`

### Level 2 : Produits 1 + 2
- Accès aux produits STFOUR et GLBNS
- Voir `/dashboard/products`

### Level 3 : Support
- Accès à tous les produits
- Support des utilisateurs (à implémenter si nécessaire)

### Level 4 : Admin
- Accès à tout
- **Gestion des utilisateurs** : `/dashboard/users`
- **Statistiques** : `/dashboard/stats`
- Peut révoquer/restaurer les accès
- Peut réinitialiser les mots de passe

## 🔧 Passer un utilisateur existant en Admin

Si vous avez déjà créé un compte et voulez le passer en Admin :

```sql
-- Remplacez par votre email
UPDATE user_profiles
SET access_level = 4,
    products = '["STFOUR", "GLBNS"]'::jsonb
WHERE email = 'votre-email@example.com';
```

## ⚙️ Créer d'autres utilisateurs

### Via le webhook (automatique après paiement)
Le webhook `webhook-provisioning.js` crée automatiquement les utilisateurs quand un paiement est effectué.

### Via SQL (manuel)
```sql
-- 1. Créer l'utilisateur dans Supabase Dashboard → Authentication → Users
-- 2. Créer le profil :
INSERT INTO user_profiles (id, email, access_level, products, is_active)
SELECT 
  id,
  email,
  1,  -- Niveau 1 par défaut
  '["STFOUR"]'::jsonb,
  true
FROM auth.users
WHERE email = 'nouvel-utilisateur@example.com';
```

## 🛠️ Dépannage

### "Accès refusé" ou redirection vers login
- Vérifiez que le profil existe dans `user_profiles`
- Vérifiez que `is_active = true`
- Vérifiez que vous avez le bon niveau d'accès

### L'utilisateur existe dans auth.users mais pas dans user_profiles
Créez le profil manuellement :

```sql
INSERT INTO user_profiles (id, email, access_level, products, is_active)
SELECT 
  id,
  email,
  1,  -- Niveau par défaut
  '["STFOUR"]'::jsonb,
  true
FROM auth.users
WHERE email = 'utilisateur@example.com'
AND id NOT IN (SELECT id FROM user_profiles);
```

### Réinitialiser un mot de passe (Admin uniquement)
1. Allez sur `/dashboard/users`
2. Cliquez sur l'icône 🔑 à côté de l'utilisateur
3. Un email de réinitialisation sera envoyé

## 📍 URLs du Dashboard

- **Page de connexion** : `/login`
- **Dashboard principal** : `/dashboard`
- **Mes produits** : `/dashboard/products`
- **Gestion utilisateurs** (Admin) : `/dashboard/users`
- **Statistiques** (Admin) : `/dashboard/stats`

---

**Note** : Assurez-vous d'avoir exécuté le fichier `database_dashboard_schema.sql` dans Supabase avant de créer des utilisateurs !

