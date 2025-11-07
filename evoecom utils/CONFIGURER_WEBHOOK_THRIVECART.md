# 🎯 Guide : Configurer le Webhook dans ThriveCart

Ce guide vous explique étape par étape comment configurer le webhook dans ThriveCart pour créer automatiquement les comptes utilisateurs après chaque paiement.

---

## 📋 Prérequis

Avant de commencer, vous devez avoir :

1. ✅ La fonction Edge Function `provision-user` déployée sur Supabase
2. ✅ L'URL de votre fonction Edge Function (ex: `https://[project-ref].supabase.co/functions/v1/provision-user`)
3. ✅ Un compte ThriveCart actif avec vos produits configurés

---

## 🔍 Étape 1 : Récupérer l'URL de votre Edge Function

### 1.1 Déterminer l'URL de votre fonction

Si vous avez déjà déployé la fonction, l'URL est :
```
https://[votre-project-ref].supabase.co/functions/v1/provision-user
```

**Récupérer votre `project-ref` :**
- Allez dans votre **Supabase Dashboard**
- L'URL de votre projet est : `https://app.supabase.com/project/[project-ref]`
- Ou regardez l'URL de votre base : `https://[project-ref].supabase.co`

**Exemple :**
Si votre project-ref est `abcdefghijklmnop`, votre URL sera :
```
https://abcdefghijklmnop.supabase.co/functions/v1/provision-user
```

### 1.2 Vérifier que la fonction est déployée

1. **Supabase Dashboard** > **Edge Functions** > **provision-user**
2. Vérifiez que la fonction est **active** et **déployée**

Si la fonction n'est pas déployée, exécutez :
```bash
supabase functions deploy provision-user
# ou
npx supabase functions deploy provision-user
```

---

## 🛒 Étape 2 : Configurer le Webhook dans ThriveCart

### 2.1 Accéder aux paramètres de webhook

1. **Connectez-vous à votre compte ThriveCart**
2. Allez dans **"Settings"** (Paramètres) dans le menu principal
3. Cliquez sur **"Integrations"** (Intégrations)
4. Trouvez la section **"Webhooks"** et cliquez dessus
5. Cliquez sur **"Add Webhook"** ou **"Create Webhook"** (Ajouter un webhook)

### 2.2 Configuration de base du webhook

**Nom du webhook :**
```
Création compte STFOUR
```
(ou un nom qui vous convient)

**URL du webhook :**
```
https://[votre-project-ref].supabase.co/functions/v1/provision-user
```
⚠️ **Remplacez `[votre-project-ref]` par votre vrai project-ref !**

**Méthode HTTP :**
```
POST
```

**Format de données :**
```
application/x-www-form-urlencoded
```
(ou `application/json` si ThriveCart le supporte)

---

## 📦 Étape 3 : Configurer pour le Pack Global Sourcing (STFOUR)

### 3.1 Créer le premier webhook pour STFOUR

**Configuration du webhook :**

| Champ | Valeur |
|-------|--------|
| **Nom** | Création compte STFOUR |
| **URL** | `https://[project-ref].supabase.co/functions/v1/provision-user` |
| **Méthode** | `POST` |
| **Format** | `application/x-www-form-urlencoded` |

**Quand déclencher :**
- Sélectionnez **"Order Completed"** (Commande terminée)
- Ou **"Order Purchased"** (Commande achetée)

**Condition (optionnelle mais recommandée) :**
- **Product** : Sélectionnez votre produit **Pack Global Sourcing**
- Cela garantit que le webhook ne se déclenche que pour ce produit

### 3.2 Configurer les paramètres à envoyer

Dans ThriveCart, vous devez mapper les variables. Voici comment :

**Format `application/x-www-form-urlencoded` :**

ThriveCart a généralement une interface pour mapper les champs. Configurez :

| Nom du champ | Variable ThriveCart | Valeur |
|--------------|---------------------|--------|
| `email` | `{{customer.email}}` | Email du client |
| `product` | (valeur fixe) | `STFOUR` |

**Format `application/json` :**

Si ThriveCart supporte JSON, configurez le **Content-Type** comme `application/json` et le **Body** comme :

```json
{
  "email": "{{customer.email}}",
  "product": "STFOUR"
}
```

**⚠️ Important :**
- Le champ `product` doit être **exactement** `STFOUR` (en majuscules)
- Le champ `email` doit utiliser la variable ThriveCart `{{customer.email}}`
- Le champ `name` est optionnel et peut être omis

### 3.3 Sauvegarder le webhook

Cliquez sur **"Save"** ou **"Create Webhook"** pour sauvegarder.

---

## 📦 Étape 4 : Configurer pour le Pack Global Business (GLBNS)

### 4.1 Créer le deuxième webhook pour GLBNS

**Créez un nouveau webhook** (même processus que pour STFOUR) :

**Configuration :**

| Champ | Valeur |
|-------|--------|
| **Nom** | Création compte GLBNS |
| **URL** | `https://[project-ref].supabase.co/functions/v1/provision-user` |
| **Méthode** | `POST` |
| **Format** | `application/x-www-form-urlencoded` |

**Quand déclencher :**
- **"Order Completed"** ou **"Order Purchased"**

**Condition :**
- **Product** : Sélectionnez votre produit **Pack Global Business**

### 4.2 Configurer les paramètres

| Nom du champ | Variable ThriveCart | Valeur |
|--------------|---------------------|--------|
| `email` | `{{customer.email}}` | Email du client |
| `product` | (valeur fixe) | `GLBNS` |

**⚠️ Important :**
- Le champ `product` doit être **exactement** `GLBNS` (en majuscules)

---

## 🎯 Option Alternative : Un seul webhook avec condition dynamique

Si ThriveCart permet d'utiliser des variables dynamiques basées sur le produit, vous pouvez créer **un seul webhook** :

### Configuration unique :

| Champ | Valeur |
|-------|--------|
| **Nom** | Création compte automatique |
| **URL** | `https://[project-ref].supabase.co/functions/v1/provision-user` |
| **Méthode** | `POST` |
| **Format** | `application/json` (recommandé) ou `application/x-www-form-urlencoded` |

**Body JSON :**
```json
{
  "email": "{{customer.email}}",
  "product": "{{product.sku}}"
}
```

**OU si vous utilisez form-urlencoded :**
- `email` = `{{customer.email}}`
- `product` = `{{product.sku}}`

**⚠️ Important :**
Pour que cela fonctionne, vous devez configurer les **SKU** de vos produits dans ThriveCart :
- **Pack Global Sourcing** → SKU = `STFOUR`
- **Pack Global Business** → SKU = `GLBNS`

---

## 🧪 Étape 5 : Tester le webhook

### 5.1 Test manuel avec cURL

Avant de tester avec un vrai achat, testez manuellement :

```bash
# Test pour STFOUR
curl -X POST "https://[project-ref].supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&product=STFOUR"

# Test pour GLBNS
curl -X POST "https://[project-ref].supabase.co/functions/v1/provision-user" \
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

### 5.2 Test avec un achat réel (Mode Test/Sandbox)

1. **Configurez ThriveCart en mode test/sandbox**
2. **Effectuez un paiement test** avec une carte de test (ex: `4242 4242 4242 4242`)
3. **Vérifiez dans Supabase** :
   - **Authentication** > **Users** : L'utilisateur doit être créé
   - **Table Editor** > **user_profiles** : Le profil doit avoir le bon `access_level` et `products`

### 5.3 Vérifier les logs

**Dans Supabase :**
- **Dashboard** > **Edge Functions** > **provision-user** > **Logs**
- Vous verrez les requêtes reçues et les erreurs éventuelles

**Dans ThriveCart :**
- **Settings** > **Integrations** > **Webhooks**
- Cliquez sur votre webhook pour voir l'historique des envois
- Vous verrez les statuts (succès/échec) et les réponses

---

## 🔍 Dépannage

### ❌ Le webhook ne se déclenche pas

**Vérifications :**
1. ✅ Vérifiez que ThriveCart n'est pas en mode test (certains webhooks sont désactivés en test)
2. ✅ Vérifiez l'URL du webhook dans ThriveCart (doit correspondre exactement)
3. ✅ Vérifiez les logs ThriveCart pour voir si le webhook a été envoyé
4. ✅ Vérifiez que le produit est bien configuré dans ThriveCart

### ❌ Erreur 401 Unauthorized

**Causes possibles :**
- La fonction Edge Function nécessite une authentification
- **Solution** : Vérifiez que la fonction n'exige pas de token d'authentification pour les webhooks

**Pour permettre les webhooks sans authentification**, vous pouvez modifier la fonction ou ajouter un secret partagé dans les headers.

### ❌ Erreur "Produit invalide"

**Causes possibles :**
- Le paramètre `product` n'est pas exactement `STFOUR` ou `GLBNS` (en majuscules)
- La variable ThriveCart ne retourne pas la bonne valeur

**Solutions :**
1. Vérifiez que vous utilisez une valeur fixe `STFOUR` ou `GLBNS` (pas de variables)
2. Si vous utilisez des variables, vérifiez que le SKU du produit est bien configuré
3. Testez avec cURL pour vérifier que le produit est bien reçu

### ❌ L'utilisateur est créé mais le profil ne l'est pas

**Causes possibles :**
- Problème de permissions RLS (Row Level Security)
- Erreur dans la création du profil

**Solutions :**
1. Vérifiez les logs de la fonction Edge Function
2. Vérifiez les politiques RLS sur la table `user_profiles`
3. Vérifiez que la fonction utilise la **Service Role Key** (pas l'Anon Key)

### ❌ L'utilisateur existe déjà

**C'est normal !** Le système :
- Détecte que l'utilisateur existe
- Met à jour son profil avec le nouveau produit
- Upgrade automatiquement si nécessaire (ex: niveau 1 → niveau 2)

**Vérification :**
- Allez dans `user_profiles` dans Supabase
- Vérifiez que `access_level` et `products` ont été mis à jour

---

## 📝 Variables ThriveCart disponibles

ThriveCart offre plusieurs variables que vous pouvez utiliser :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `{{customer.email}}` | Email du client | `user@example.com` |
| `{{customer.name}}` | Nom du client | `John Doe` |
| `{{product.name}}` | Nom du produit | `Pack Global Sourcing` |
| `{{product.sku}}` | SKU du produit | `STFOUR` ou `GLBNS` |
| `{{order.id}}` | ID de la commande | `12345` |

**⚠️ Pour notre cas :**
- Utilisez `{{customer.email}}` pour l'email
- Utilisez une valeur fixe `STFOUR` ou `GLBNS` pour le produit (ou `{{product.sku}}` si les SKU sont configurés)

---

## ✅ Checklist finale

Avant de passer en production, vérifiez :

- [ ] Edge Function `provision-user` déployée
- [ ] URL de la fonction notée et testée
- [ ] Webhook créé dans ThriveCart pour STFOUR
- [ ] Webhook créé dans ThriveCart pour GLBNS (ou un seul avec condition)
- [ ] Paramètres correctement mappés (`email` et `product`)
- [ ] Test manuel avec cURL réussi
- [ ] Test avec achat test réussi
- [ ] Vérification dans Supabase que le compte est créé
- [ ] Vérification que le profil a le bon `access_level` et `products`
- [ ] Logs vérifiés (pas d'erreurs)

---

## 🎯 Exemple de configuration complète

### Configuration ThriveCart (format form-urlencoded)

**URL :**
```
https://abcdefghijklmnop.supabase.co/functions/v1/provision-user
```

**Méthode :**
```
POST
```

**Content-Type :**
```
application/x-www-form-urlencoded
```

**Body (champs à mapper) :**
```
email={{customer.email}}
product=STFOUR
```

**Quand déclencher :**
- Order Completed
- Product = Pack Global Sourcing

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** dans Supabase Edge Functions
2. **Vérifiez l'historique** des webhooks dans ThriveCart
3. **Testez manuellement** avec cURL pour isoler le problème
4. **Vérifiez la documentation ThriveCart** sur les webhooks

---

**🎉 Une fois configuré, chaque achat créera automatiquement un compte utilisateur !**

