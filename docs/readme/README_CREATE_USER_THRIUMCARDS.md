# Guide : Configuration du Webhook ThriumCards

Ce guide explique comment configurer le webhook dans ThriumCards (ThriveCart) pour créer automatiquement des comptes utilisateurs après chaque paiement.

## 📋 Vue d'ensemble

Lorsqu'un client paie sur ThriumCards, un webhook est automatiquement envoyé qui crée le compte utilisateur avec les bonnes permissions selon le produit acheté.

## 🔗 URL de l'Edge Function

```
https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user
```

## 🔐 Secret Webhook

Le secret webhook est déjà configuré. Utilisez-le dans les headers du webhook :
- Header : `x-webhook-secret: bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=`

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
x-webhook-secret: bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=
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
x-webhook-secret: bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=
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
  -H "x-webhook-secret: bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=" \
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
  -H "x-webhook-secret: bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=" \
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

- ✅ Vérifiez que le secret dans ThriumCards correspond exactement à : `bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=`
- ✅ Vérifiez que le header `x-webhook-secret` est bien envoyé
- ✅ Vérifiez l'orthographe du header (sensible à la casse)
- ✅ Vérifiez qu'il n'y a pas d'espaces avant ou après le secret

### Erreur 400 "Paramètres manquants"

- ✅ Vérifiez que `email` et `product` sont bien présents dans le body
- ✅ Vérifiez que `product` est exactement `STFOUR` ou `GLBNS` (en majuscules)

### Erreur 400 "Produit invalide"

- ✅ Vérifiez que le produit est exactement `STFOUR` ou `GLBNS`
- ✅ Vérifiez que le produit est en majuscules

### L'utilisateur existe déjà

- ✅ C'est normal ! Le webhook mettra à jour le profil existant
- ✅ L'utilisateur gardera son niveau d'accès actuel s'il est supérieur
- ✅ Les produits seront mis à jour selon le nouveau produit acheté

## ✅ Checklist de Configuration ThriumCards

- [ ] Le webhook est créé pour STFOUR
- [ ] Le webhook est créé pour GLBNS (ou un seul avec condition dynamique)
- [ ] L'URL du webhook est correcte
- [ ] Le header `x-webhook-secret` est configuré avec la valeur : `bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=`
- [ ] Le body JSON contient `email` et `product`
- [ ] Le webhook est configuré pour "Order Completed"

### Tests

- [ ] Test manuel avec cURL réussi
- [ ] Test avec une transaction réelle dans ThriumCards
- [ ] Vérification de la création utilisateur dans Supabase Dashboard

## 🔄 Processus Complet

```
1. Client paie sur ThriumCards
   ↓
2. ThriumCards envoie webhook à provision-user
   ↓
3. Edge Function crée le compte utilisateur automatiquement
   ↓
4. Client reçoit l'email avec ses identifiants
```

## 📞 Support

En cas de problème :

1. Consultez l'historique des webhooks dans ThriumCards (Settings → Integrations → Webhooks)
2. Consultez les logs Supabase (Edge Functions → provision-user → Logs)
3. Vérifiez la documentation ThriveCart : https://support.thrivecart.com/help/webhooks/

---

**Dernière mise à jour :** 2025-01-15

