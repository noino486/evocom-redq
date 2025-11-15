# Guide : Création Automatique d'Utilisateurs après Paiement ThriumCards

Ce guide explique comment configurer la création automatique de comptes utilisateurs lorsqu'un client effectue un paiement via ThriumCards (ThriveCart).

## 📋 Vue d'ensemble

Lorsqu'un client paie sur ThriumCards, un webhook est automatiquement envoyé à l'Edge Function Supabase `provision-user` qui :

1. ✅ Crée automatiquement un compte utilisateur dans Supabase Auth
2. ✅ Génère un mot de passe temporaire sécurisé
3. ✅ Crée le profil utilisateur avec le bon niveau d'accès selon le produit acheté
4. ✅ Envoie un email de bienvenue avec les identifiants de connexion (via SendGrid)
5. ✅ Active immédiatement le compte (pas besoin de confirmation email)

## 🔗 URL de l'Edge Function

```
https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user
```

## 🔐 Sécurité

### Secret Webhook (Recommandé)

Pour sécuriser le webhook, configurez un secret partagé :

1. **Générer un secret sécurisé :**
   ```bash
   # Générer un secret aléatoire (exemple)
   openssl rand -base64 32
   ```

2. **Configurer le secret dans Supabase :**
   ```bash
   supabase secrets set WEBHOOK_SECRET=votre-secret-securise
   ```

3. **Envoyer le secret dans le header du webhook :**
   - Header : `x-webhook-secret: votre-secret-securise`
   - Ou : `Authorization: Bearer votre-secret-securise`

⚠️ **Important :** Sans secret configuré, le webhook fonctionnera mais sera moins sécurisé.

## 📦 Mapping Produits → Niveaux d'Accès

| Produit ThriumCards | Code Produit | `access_level` | `products` | Description |
|---------------------|--------------|----------------|------------|-------------|
| Pack Global Sourcing | `STFOUR` | 1 | `["STFOUR"]` | Client avec accès au Pack Global Sourcing uniquement |
| Pack Global Business | `GLBNS` | 2 | `["STFOUR", "GLBNS"]` | Client avec accès aux deux packs |

### ⚠️ Restrictions de Sécurité

- **Les utilisateurs créés via ce webhook NE SONT JAMAIS ADMIN** (niveau 4)
- Seuls les niveaux 1 et 2 sont assignés automatiquement
- Les niveaux 3 (Support) et 4 (Admin) doivent être créés manuellement via le dashboard

## 🚀 Configuration dans ThriumCards (ThriveCart)

### Étape 1 : Accéder aux paramètres webhook

1. Connectez-vous à votre compte ThriveCart
2. Allez dans **Settings** → **Integrations** → **Webhooks**
3. Cliquez sur **Add Webhook** ou **Create Webhook**

### Étape 2 : Configurer le webhook pour STFOUR

**Nom du webhook :**
```
Création compte - Pack Global Sourcing
```

**URL du webhook :**
```
https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user
```

**Méthode :** `POST`

**Content-Type :** `application/json`

**Headers personnalisés (si secret configuré) :**
```
x-webhook-secret: votre-secret-securise
```

**Body JSON :**
```json
{
  "email": "{{customer.email}}",
  "product": "STFOUR",
  "sale": {
    "pack_id": "STFOUR-{{order.id}}",
    "price": {{purchase.amount}}
  }
}
```

**Note :** Le paramètre `sale` est optionnel mais recommandé pour enregistrer les ventes dans le dashboard. Si omis, l'utilisateur sera créé mais la vente ne sera pas enregistrée.

**Quand déclencher le webhook :**
- ✅ **Order Completed** (Recommandé)
- ✅ **Purchase Completed**
- ❌ Ne pas utiliser "Order Created" (le paiement peut échouer)

**Condition (optionnel) :**
Si vous voulez déclencher uniquement pour le produit STFOUR :
```
{{product.sku}} == "STFOUR"
```

### Étape 3 : Configurer le webhook pour GLBNS

Créez un deuxième webhook avec les mêmes paramètres, mais avec ces différences :

**Nom du webhook :**
```
Création compte - Pack Global Business
```

**Body JSON :**
```json
{
  "email": "{{customer.email}}",
  "product": "GLBNS",
  "sale": {
    "pack_id": "GLBNS-{{order.id}}",
    "price": {{purchase.amount}}
  }
}
```

**Note :** Le paramètre `sale` est optionnel mais recommandé pour enregistrer les ventes dans le dashboard.

**Condition (optionnel) :**
```
{{product.sku}} == "GLBNS"
```

- Ce webhook donnera accès aux deux packs (STFOUR et GLBNS)

## 📧 Configuration Email (SendGrid)

L'edge function envoie automatiquement un email de bienvenue avec les identifiants de connexion.

### Variables d'environnement requises

Configurez ces secrets dans Supabase :

```bash
supabase secrets set SENDGRID_API_KEY=votre-cle-api-sendgrid
supabase secrets set SENDGRID_FROM_EMAIL=noreply@evoecom.com
supabase secrets set SENDGRID_FROM_NAME="EVO ECOM"
```

### Contenu de l'email

L'email envoyé contient :
- ✅ Email de connexion
- ✅ Mot de passe temporaire (12 caractères, sécurisé)
- ✅ Lien de connexion direct
- ⚠️ Recommandation de changer le mot de passe à la première connexion

## 📝 Format de la Requête

### Requête JSON

**Minimum requis :**
```json
{
  "email": "client@example.com",
  "product": "STFOUR"
}
```

**Avec enregistrement de vente (recommandé) :**
```json
{
  "email": "client@example.com",
  "product": "STFOUR",
  "sale": {
    "pack_id": "STFOUR-12345",
    "price": 29.90
  }
}
```

### Requête Form-URLEncoded

```
email=client@example.com&product=STFOUR
```

### Headers

```
Content-Type: application/json
x-webhook-secret: votre-secret-securise (optionnel)
```

## ✅ Format de la Réponse

### Succès (201 Created)

```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "client@example.com",
  "access_level": 1,
  "products": ["STFOUR"],
  "sale_id": "sale-123-456",
  "email_sent": true
}
```

**Note :** `sale_id` sera `null` si le paramètre `sale` n'a pas été fourni dans la requête.

### Utilisateur existant (200 OK)

Si l'utilisateur existe déjà, son profil sera mis à jour :

```json
{
  "success": true,
  "message": "Utilisateur mis à jour",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "sale_id": "sale-123-456",
  "email_sent": false
}
```

**Note :** Si l'utilisateur existe déjà, la vente sera quand même enregistrée si le paramètre `sale` est fourni.

### Erreur (400/401/500)

```json
{
  "success": false,
  "error": "Message d'erreur détaillé"
}
```

## 🧪 Test du Webhook

### Test manuel avec cURL

**Test pour STFOUR :**
```bash
curl -X POST "https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: votre-secret-securise" \
  -d '{
    "email": "test@example.com",
    "product": "STFOUR",
    "sale": {
      "pack_id": "STFOUR-TEST-123",
      "price": 29.90
    }
  }'
```

**Test pour GLBNS :**
```bash
curl -X POST "https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: votre-secret-securise" \
  -d '{
    "email": "test@example.com",
    "product": "GLBNS",
    "sale": {
      "pack_id": "GLBNS-TEST-123",
      "price": 39.90
    }
  }'
```

### Test avec le script Node.js

Utilisez le script de test fourni :

```bash
# Test avec produit par défaut
node evoecom/utils/test-webhook.js

# Test avec produit spécifique
node evoecom/utils/test-webhook.js --product STFOUR
node evoecom/utils/test-webhook.js --product GLBNS

# Test avec email spécifique
node evoecom/utils/test-webhook.js --product STFOUR --email votre-email@example.com
```

## 🔍 Vérification et Monitoring

### Vérifier les logs Supabase

1. Allez dans **Supabase Dashboard** → **Edge Functions** → **provision-user**
2. Cliquez sur **Logs** pour voir les exécutions
3. Vérifiez les messages de succès/erreur

### Vérifier les webhooks ThriumCards

1. Allez dans **Settings** → **Integrations** → **Webhooks**
2. Cliquez sur votre webhook
3. Consultez l'historique des envois
4. Vérifiez les réponses (succès/erreur)

### Vérifier la création utilisateur

1. Allez dans **Supabase Dashboard** → **Authentication** → **Users**
2. Recherchez l'email du client
3. Vérifiez que le compte est créé et actif

4. Allez dans **Table Editor** → **user_profiles**
5. Vérifiez que le profil est créé avec le bon `access_level` et `products`

## 🐛 Dépannage

### Le webhook ne se déclenche pas

- ✅ Vérifiez que ThriumCards n'est pas en mode test (certains webhooks peuvent être désactivés)
- ✅ Vérifiez l'URL du webhook (doit être exactement celle indiquée)
- ✅ Vérifiez que le webhook est configuré pour "Order Completed"
- ✅ Consultez l'historique des webhooks dans ThriumCards

### Erreur 401 "Secret webhook invalide"

- ✅ Vérifiez que le secret dans ThriumCards correspond à celui configuré dans Supabase
- ✅ Vérifiez que le header `x-webhook-secret` est bien envoyé
- ✅ Vérifiez l'orthographe du header (sensible à la casse)

### Erreur 400 "Paramètres manquants"

- ✅ Vérifiez que `email` et `product` sont bien présents dans le body
- ✅ Vérifiez que `product` est exactement `STFOUR` ou `GLBNS` (en majuscules)

### Erreur 400 "Produit invalide"

- ✅ Vérifiez que le produit est exactement `STFOUR` ou `GLBNS`
- ✅ Vérifiez que le produit est en majuscules

### L'email n'est pas envoyé

- ✅ Vérifiez que `SENDGRID_API_KEY` est configuré dans Supabase
- ✅ Vérifiez que l'email expéditeur est vérifié dans SendGrid
- ✅ Consultez les logs Supabase pour voir les erreurs SendGrid
- ✅ Vérifiez les logs SendGrid dans votre compte SendGrid

### L'utilisateur existe déjà

- ✅ C'est normal ! Le webhook mettra à jour le profil existant
- ✅ L'utilisateur gardera son niveau d'accès actuel s'il est supérieur
- ✅ Les produits seront mis à jour selon le nouveau produit acheté

## 📚 Documentation Complémentaire

- [README_TEST_WEBHOOK.md](./README_TEST_WEBHOOK.md) - Guide de test du webhook
- [README_SENDGRID_SUPABASE.md](./README_SENDGRID_SUPABASE.md) - Configuration SendGrid
- [README_DEPLOY_PROD.md](./README_DEPLOY_PROD.md) - Déploiement en production

## ✅ Checklist de Configuration

### Configuration Supabase

- [ ] L'edge function `provision-user` est déployée
- [ ] Le secret `WEBHOOK_SECRET` est configuré (optionnel mais recommandé)
- [ ] Le secret `SENDGRID_API_KEY` est configuré
- [ ] Le secret `SENDGRID_FROM_EMAIL` est configuré
- [ ] Le secret `SENDGRID_FROM_NAME` est configuré

### Configuration ThriumCards

- [ ] Le webhook est créé pour STFOUR
- [ ] Le webhook est créé pour GLBNS (ou un seul avec condition dynamique)
- [ ] L'URL du webhook est correcte
- [ ] Le header `x-webhook-secret` est configuré (si secret utilisé)
- [ ] Le body JSON contient `email` et `product`
- [ ] Le webhook est configuré pour "Order Completed"

### Tests

- [ ] Test manuel avec cURL réussi
- [ ] Test avec le script Node.js réussi
- [ ] Test avec une transaction réelle dans ThriumCards
- [ ] Vérification de la création utilisateur dans Supabase
- [ ] Vérification de l'envoi de l'email de bienvenue

## 🔄 Processus Complet

```
1. Client paie sur ThriumCards
   ↓
2. ThriumCards envoie webhook à provision-user
   ↓
3. Edge Function vérifie le secret (si configuré)
   ↓
4. Edge Function crée/met à jour l'utilisateur dans Supabase Auth
   ↓
5. Edge Function crée/met à jour le profil dans user_profiles
   ↓
6. Edge Function génère un mot de passe temporaire
   ↓
7. Edge Function envoie email via SendGrid avec identifiants
   ↓
8. Client reçoit l'email et peut se connecter immédiatement
```

## 📞 Support

En cas de problème :

1. Consultez les logs Supabase (Edge Functions → provision-user → Logs)
2. Consultez l'historique des webhooks dans ThriumCards
3. Vérifiez la documentation Supabase : https://supabase.com/docs
4. Vérifiez la documentation ThriveCart : https://support.thrivecart.com/help/webhooks/

---

**Dernière mise à jour :** 2025-01-15  
**Version Edge Function :** provision-user v1.0

