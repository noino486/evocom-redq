# 📚 Guide Complet : Fonctionnement de l'Automatisation de Création de Compte

Ce guide explique en détail comment fonctionne le système automatique de création de compte utilisateur dans votre application.

---

## 🎯 Vue d'ensemble du système

Votre système possède **DEUX méthodes** pour créer des comptes utilisateurs :

1. **Création manuelle par un admin** → Via `create-user` Edge Function
2. **Création automatique après paiement** → Via `provision-user` Edge Function (webhook)

---

## 🔄 Méthode 1 : Création Automatique après Paiement (Webhook)

### 📊 Flux complet

```
┌─────────────────┐
│   Client paie   │
│   sur ThriveCart│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Paiement réussi │
│  (Order Completed)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ThriveCart     │
│  envoie webhook │
│  POST à Supabase│
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│  provision-user Edge Function     │
│  (supabase/functions/provision-user)│
└────────┬─────────────────────────┘
         │
         ├─► Vérifie le produit (STFOUR ou GLBNS)
         ├─► Détermine le niveau d'accès :
         │   • STFOUR → access_level: 1
         │   • GLBNS  → access_level: 2
         │
         ▼
┌──────────────────────────────────┐
│  Création utilisateur             │
│  • Génère mot de passe temporaire │
│  • Crée compte dans Supabase Auth │
│  • Email confirmé automatiquement │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Création profil utilisateur     │
│  • Insert dans user_profiles     │
│  • access_level: 1 ou 2          │
│  • products: ['STFOUR'] ou       │
│    ['STFOUR', 'GLBNS']          │
│  • is_active: true              │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Envoi email de bienvenue        │
│  (optionnel)                      │
│  • Contient mot de passe temporaire│
│  • Lien de connexion              │
└──────────────────────────────────┘
```

### 🔍 Détails techniques de `provision-user`

**Fichier :** `supabase/functions/provision-user/index.ts`

**Paramètres reçus :**
- `email` : Email du client (obligatoire)
- `product` : Produit acheté = `STFOUR` ou `GLBNS` (obligatoire)
- `name` : Nom du client (optionnel, non utilisé actuellement)

**Mapping des produits :**
```javascript
STFOUR → {
  access_level: 1,        // Client avec produit 1 uniquement
  products: ['STFOUR']
}

GLBNS → {
  access_level: 2,        // Client avec produits 1 + 2
  products: ['STFOUR', 'GLBNS']
}
```

**Sécurité importante :**
- ⚠️ **JAMAIS de niveau 4 (Admin)** assigné automatiquement
- ⚠️ Seuls les niveaux 1 et 2 peuvent être créés via webhook
- ⚠️ Si l'utilisateur existe déjà, le profil est mis à jour (upgrade possible)

**Ce que fait la fonction :**

1. **Validation** : Vérifie que `email` et `product` sont présents
2. **Vérification produit** : S'assure que le produit est `STFOUR` ou `GLBNS`
3. **Génération mot de passe** : Crée un mot de passe temporaire aléatoire (12 caractères)
4. **Création Auth** : 
   - Utilise `supabaseAdmin.auth.admin.createUser()`
   - Email confirmé automatiquement (`email_confirm: true`)
5. **Création profil** :
   - Insert dans `user_profiles` avec le bon `access_level` et `products`
   - `is_active: true` (actif immédiatement)
6. **Gestion utilisateur existant** :
   - Si l'utilisateur existe déjà, récupère son ID
   - Met à jour son profil (upgrade si nouveau produit)
   - Pas d'email envoyé si utilisateur existant
7. **Envoi email** (optionnel) :
   - Appelle `sendWelcomeEmail()` qui peut utiliser Resend, SendGrid, etc.
   - Contient le mot de passe temporaire

**URL de la fonction :**
```
https://[votre-project-ref].supabase.co/functions/v1/provision-user
```

**Configuration dans ThriveCart :**
- Déclenchement : `Order Completed`
- URL : L'URL ci-dessus
- Méthode : `POST`
- Format : `application/x-www-form-urlencoded` ou `application/json`
- Variables :
  - `email` = `{{customer.email}}`
  - `product` = `STFOUR` ou `GLBNS` (selon le produit)

---

## 👤 Méthode 2 : Création Manuelle par Admin

### 📊 Flux complet

```
┌─────────────────┐
│  Admin ouvre    │
│  Dashboard Users│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Admin remplit  │
│  formulaire :   │
│  • Email        │
│  • Niveau accès  │
│  • Produits     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│  create-user Edge Function        │
│  (supabase/functions/create-user) │
└────────┬─────────────────────────┘
         │
         ├─► Vérifie que l'admin est authentifié
         ├─► Vérifie que l'admin est niveau 4
         │
         ▼
┌──────────────────────────────────┐
│  Vérification utilisateur existant│
│  • Cherche dans Supabase Auth     │
│  • Si existe, récupère l'ID       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Envoi invitation par email      │
│  • Utilise inviteUserByEmail()    │
│  • Crée l'utilisateur si nouveau │
│  • Envoie email d'invitation      │
│  • Lien redirection: /login?invited=true│
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Création/Mise à jour profil       │
│  • Insert ou Update user_profiles│
│  • access_level: défini par admin│
│  • products: défini par admin    │
│  • is_active: false (jusqu'à    │
│    acceptation invitation)       │
└──────────────────────────────────┘
```

### 🔍 Détails techniques de `create-user`

**Fichier :** `supabase/functions/create-user/index.ts`

**Paramètres reçus :**
- `email` : Email de l'utilisateur (obligatoire)
- `access_level` : Niveau d'accès de 1 à 4 (obligatoire)
- `products` : Tableau de produits (ex: `['STFOUR', 'GLBNS']`) (obligatoire)
- `site_url` : URL optionnelle pour la redirection (optionnel)

**Sécurité :**
- ✅ Vérifie que l'utilisateur est authentifié
- ✅ Vérifie que l'utilisateur est admin (niveau 4)
- ✅ Peut créer n'importe quel niveau (1, 2, 3, ou 4)

**Ce que fait la fonction :**

1. **Authentification** : Vérifie le token JWT de l'admin
2. **Vérification admin** : Vérifie que `access_level === 4`
3. **Recherche utilisateur** : 
   - Utilise `listUsers()` pour trouver l'utilisateur par email
   - Si existe, récupère l'ID
4. **Envoi invitation** :
   - Si nouvel utilisateur : Utilise `inviteUserByEmail()`
   - Cette fonction crée l'utilisateur ET envoie l'email automatiquement
   - Email utilise le template "Invite user" de Supabase
   - Redirection vers `${siteUrl}/login?invited=true`
5. **Gestion utilisateur existant** :
   - Si l'utilisateur existe déjà, ne renvoie PAS d'email
   - Met juste à jour le profil
6. **Création/Mise à jour profil** :
   - Si nouveau : Insert avec `is_active: false`
   - Si existant : Update avec nouveaux paramètres
   - L'utilisateur sera activé après acceptation de l'invitation

**Différence avec `provision-user` :**
- `create-user` : Envoie une invitation (l'utilisateur doit définir son mot de passe)
- `provision-user` : Crée avec un mot de passe temporaire (l'utilisateur peut se connecter directement)

**URL de la fonction :**
```
https://[votre-project-ref].supabase.co/functions/v1/create-user
```

**Appel depuis le frontend :**
```javascript
const response = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    access_level: 1,
    products: ['STFOUR'],
    site_url: window.location.origin // Optionnel
  })
})
```

---

## 📋 Niveaux d'accès

| Niveau | Nom | Description | Création |
|--------|-----|-------------|----------|
| **1** | Client STFOUR | Accès au Pack Global Sourcing uniquement | ✅ Automatique (webhook) ou manuelle |
| **2** | Client GLBNS | Accès au Pack Global Sourcing + Pack Global Business | ✅ Automatique (webhook) ou manuelle |
| **3** | Support | Accès aux statistiques et support | ❌ Manuelle uniquement |
| **4** | Admin | Accès complet + gestion utilisateurs | ❌ Manuelle uniquement |

**⚠️ Important :**
- Les niveaux 3 et 4 ne peuvent **JAMAIS** être créés automatiquement via webhook
- Seuls les niveaux 1 et 2 sont créés automatiquement après paiement
- Les admins doivent créer manuellement les comptes niveau 3 et 4

---

## 🔐 Sécurité et permissions

### Vérifications effectuées

**Dans `provision-user` :**
- ✅ Validation des paramètres (email, product)
- ✅ Vérification que le produit est valide
- ✅ **Protection contre création admin** : Vérifie que `accessLevel < 4`
- ✅ Gestion des utilisateurs existants (mise à jour au lieu de création)

**Dans `create-user` :**
- ✅ Vérification authentification (token JWT)
- ✅ Vérification que l'utilisateur est admin (niveau 4)
- ✅ Validation des paramètres
- ✅ Gestion des utilisateurs existants

### RLS (Row Level Security)

Les tables suivantes sont protégées par RLS :
- `user_profiles` : Les utilisateurs ne voient que leur propre profil
- `user_favorites` : Les utilisateurs ne voient que leurs propres favoris

---

## 📧 Gestion des emails

### Email d'invitation (create-user)

- **Template** : Utilise le template "Invite user" de Supabase
- **Configuration** : Supabase Dashboard > Authentication > Email Templates
- **Contenu** : Lien d'invitation avec token temporaire
- **Action** : L'utilisateur clique sur le lien, définit son mot de passe, puis se connecte

### Email de bienvenue (provision-user)

- **Service** : Doit être configuré (Resend, SendGrid, etc.)
- **Contenu** : 
  - Email de connexion
  - Mot de passe temporaire
  - Lien de connexion
- **Action** : L'utilisateur peut se connecter directement avec le mot de passe temporaire

**⚠️ Actuellement désactivé** : La fonction `sendWelcomeEmail()` retourne `false` par défaut. Pour l'activer, décommentez le code dans `provision-user/index.ts` et configurez votre service d'email.

---

## 🔄 Gestion des utilisateurs existants

### Cas 1 : Utilisateur existe dans Auth mais pas de profil

- **Action** : Crée le profil dans `user_profiles`
- **Résultat** : L'utilisateur peut maintenant accéder à l'application

### Cas 2 : Utilisateur existe avec profil

- **Action** : Met à jour le profil existant
- **Upgrade** : Si l'utilisateur a le niveau 1 et achète GLBNS, il passe au niveau 2
- **Protection** : Ne downgrade pas un niveau supérieur (ex: si déjà niveau 3, reste niveau 3)

---

## 🧪 Test et débogage

### Tester `provision-user` manuellement

```bash
# Test pour STFOUR
curl -X POST "https://[project-ref].supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&product=STFOUR"

# Test pour GLBNS
curl -X POST "https://[project-ref].supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&product=GLBNS"
```

### Vérifier les logs

- **Supabase Dashboard** > **Edge Functions** > **provision-user** > **Logs**
- **Supabase Dashboard** > **Edge Functions** > **create-user** > **Logs**

### Vérifier la création

- **Supabase Dashboard** > **Authentication** > **Users** : Vérifier que l'utilisateur est créé
- **Supabase Dashboard** > **Table Editor** > **user_profiles** : Vérifier le profil avec le bon `access_level` et `products`

---

## 📝 Résumé des fichiers

| Fichier | Rôle | Utilisation |
|---------|------|-------------|
| `supabase/functions/provision-user/index.ts` | Création automatique après paiement | Webhook ThriveCart |
| `supabase/functions/create-user/index.ts` | Création manuelle par admin | Dashboard admin |
| `webhook-provisioning.js` | Script de référence (alternatif) | Documentation |
| `GUIDE_WEBHOOK.md` | Guide de configuration | Documentation |

---

## ✅ Checklist de fonctionnement

Pour que l'automatisation fonctionne :

- [ ] Edge Function `provision-user` déployée
- [ ] Edge Function `create-user` déployée
- [ ] Webhook configuré dans ThriveCart
- [ ] URL du webhook correcte dans ThriveCart
- [ ] Variables ThriveCart correctes (`{{customer.email}}`, `product`)
- [ ] Test manuel réussi avec cURL
- [ ] Test avec achat réel réussi
- [ ] Vérification dans Supabase que les comptes sont créés
- [ ] Vérification que les profils ont le bon `access_level` et `products`

---

**🎉 Votre système d'automatisation est maintenant expliqué en détail !**

Si vous avez des questions sur une partie spécifique, n'hésitez pas à demander.

