# Configuration du Webhook ThriveCart pour la Création Automatique de Comptes

Ce document explique comment configurer le webhook dans ThriveCart pour créer automatiquement les comptes utilisateurs après chaque paiement.

## Vue d'ensemble

Le système fonctionne de manière simple : lorsqu'un client paie sur ThriveCart, un webhook est automatiquement envoyé à notre fonction Supabase qui crée le compte utilisateur avec les bonnes permissions selon le produit acheté.

## URL du Webhook

Voici l'URL de la fonction Edge Function que vous devez utiliser dans ThriveCart :

```
https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user
```

**⚠️ IMPORTANT :** 
- Cette URL doit être configurée **exactement** comme indiqué ci-dessus
- Assurez-vous de ne pas avoir d'espaces ou de caractères supplémentaires
- L'endpoint est `provision-user` (pas `create-user`)
- Cette fonction est spécialement conçue pour recevoir les webhooks automatiques de ThriveCart

## Authentification (Requis)

Le webhook utilise un secret partagé pour sécuriser les requêtes. Vous devez ajouter ce secret dans les headers de ThriveCart.

### Secret Webhook

**Secret à utiliser :**
```
bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=
```

### Format des Headers

**Option 1 : Header personnalisé (recommandé)**
```
x-webhook-secret: bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=
```

**Option 2 : Bearer token**
```
Authorization: Bearer bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=
```

**⚠️ IMPORTANT :** Le webhook refusera toutes les requêtes qui n'ont pas le bon secret. Assurez-vous de bien configurer le header dans ThriveCart.

## Configuration dans ThriveCart

### Étape 1 : Accéder aux paramètres webhook

1. Connectez-vous à votre compte ThriveCart
2. Allez dans Settings (Paramètres)
3. Sélectionnez Integrations (Intégrations)
4. Cliquez sur Webhooks
5. Cliquez sur Add Webhook ou Create Webhook

### Étape 2 : Configurer le webhook pour le Pack Global Sourcing (STFOUR)

**Nom du webhook :**
```
Création compte Pack Global Sourcing
```

**URL du webhook :**
```
https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user
```

**Méthode HTTP :**
```
POST
```

**Content-Type :**
```
application/x-www-form-urlencoded
```

**Headers (OBLIGATOIRE) :**
Ajoutez le header suivant avec le secret webhook :
```
x-webhook-secret: bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=
```

Ou en utilisant Bearer token :
```
Authorization: Bearer bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=
```

**Quand déclencher le webhook :**
- Sélectionnez "Order Completed" (Commande terminée)
- Optionnel : Ajoutez une condition pour ne déclencher que pour le produit Pack Global Sourcing

**Paramètres à envoyer :**

Dans ThriveCart, vous devez mapper les champs suivants :

| Nom du champ | Valeur |
|--------------|--------|
| `email` | `{{customer.email}}` |
| `product` | `STFOUR` |

**Important :**
- Le champ `email` doit utiliser la variable ThriveCart `{{customer.email}}`
- Le champ `product` doit être la valeur fixe `STFOUR` (en majuscules, sans espaces)
- Le champ `product` est crucial : il détermine le niveau d'accès de l'utilisateur

### Étape 3 : Configurer le webhook pour le Pack Global Business (GLBNS)

Créez un deuxième webhook avec les mêmes paramètres, mais avec ces différences :

**Nom du webhook :**
```
Création compte Pack Global Business
```

**Condition de déclenchement :**
- Sélectionnez votre produit Pack Global Business

**Paramètres à envoyer :**

| Nom du champ | Valeur |
|--------------|--------|
| `email` | `{{customer.email}}` |
| `product` | `GLBNS` |

**Important :**
- Le champ `product` doit être exactement `GLBNS` (en majuscules)
- Ce webhook donnera accès aux deux packs (STFOUR et GLBNS)

## Option Alternative : Un seul webhook avec condition dynamique

Si ThriveCart vous permet d'utiliser des variables dynamiques basées sur le produit, vous pouvez créer un seul webhook au lieu de deux.

**Configuration :**

**URL :** (identique)
```
https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user
```

**Paramètres :**

| Nom du champ | Valeur |
|--------------|--------|
| `email` | `{{customer.email}}` |
| `product` | `{{product.sku}}` |

**Prérequis pour cette option :**
- Vous devez configurer les SKU de vos produits dans ThriveCart :
  - Pack Global Sourcing → SKU = `STFOUR`
  - Pack Global Business → SKU = `GLBNS`

Cette approche est plus élégante mais nécessite de configurer les SKU correctement.

## Format JSON (Alternative)

Si ThriveCart supporte le format JSON, vous pouvez utiliser cette configuration :

**Content-Type :**
```
application/json
```

**Body (JSON) :**
```json
{
  "email": "{{customer.email}}",
  "product": "STFOUR"
}
```

Ou pour le webhook dynamique :
```json
{
  "email": "{{customer.email}}",
  "product": "{{product.sku}}"
}
```


## Test du webhook

### Test manuel avec cURL

Avant de tester avec un vrai achat, vous pouvez tester manuellement depuis votre terminal :

**Test pour STFOUR :**
```bash
curl -X POST "https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "x-webhook-secret: bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=" \
  -d "email=test@example.com&product=STFOUR"
```

**Test pour GLBNS :**
```bash
curl -X POST "https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "x-webhook-secret: bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=" \
  -d "email=test2@example.com&product=GLBNS"
```

**Test avec Bearer token :**
```bash
curl -X POST "https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Bearer bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=" \
  -d "email=test@example.com&product=STFOUR"
```

**Réponse attendue en cas de succès :**
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

### Test avec un achat réel

1. Configurez ThriveCart en mode test/sandbox si disponible
2. Effectuez un paiement test avec une carte de test
3. Vérifiez dans l'historique des webhooks de ThriveCart que le webhook a été envoyé avec succès

## Vérification et logs

### Vérifier l'historique dans ThriveCart

1. Allez dans Settings > Integrations > Webhooks
2. Cliquez sur votre webhook
3. Vous verrez l'historique des envois avec les statuts (succès/échec)
4. Consultez les détails de chaque envoi pour voir la réponse du serveur

## Dépannage

### Le webhook ne se déclenche pas

- Vérifiez que ThriveCart n'est pas en mode test (certains webhooks peuvent être désactivés en test)
- Vérifiez que l'URL est exactement correcte (copiez-collez pour éviter les erreurs)
- Vérifiez les conditions de déclenchement dans ThriveCart
- Consultez l'historique des webhooks dans ThriveCart pour voir si le webhook a été envoyé

### Erreur 401 "Secret webhook invalide"

- Vérifiez que le header `x-webhook-secret` est bien présent dans la configuration du webhook dans ThriveCart
- Vérifiez que la valeur du secret correspond exactement : `bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=` (pas d'espaces, même casse)
- Si vous utilisez Bearer token, vérifiez que le header est `Authorization` avec la valeur `Bearer bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=`

### Erreur "Produit invalide"

- Vérifiez que le paramètre `product` est exactement `STFOUR` ou `GLBNS` (en majuscules, sans espaces)
- Si vous utilisez des variables ThriveCart, vérifiez que le SKU du produit est bien configuré
- Testez avec cURL pour vérifier que le produit est bien reçu par la fonction

### L'utilisateur existe déjà

C'est normal. Le système détecte automatiquement si l'utilisateur existe déjà et met à jour son profil au lieu de créer un doublon. Si l'utilisateur avait le Pack Global Sourcing et achète le Pack Global Business, son niveau d'accès sera automatiquement mis à jour.

## Mapping des produits

Voici comment les produits sont mappés vers les niveaux d'accès :

**Pack Global Sourcing (STFOUR) :**
- `access_level` : 1
- `products` : `['STFOUR']`
- Accès : Pack Global Sourcing uniquement

**Pack Global Business (GLBNS) :**
- `access_level` : 2
- `products` : `['STFOUR', 'GLBNS']`
- Accès : Pack Global Sourcing + Pack Global Business

## Checklist de configuration

Avant de passer en production, vérifiez que :

- [ ] Le webhook est créé dans ThriveCart pour STFOUR
- [ ] Le webhook est créé dans ThriveCart pour GLBNS (ou un seul avec condition dynamique)
- [ ] L'URL est correctement configurée : `https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user`
- [ ] Le header `x-webhook-secret` est bien ajouté dans ThriveCart avec la valeur : `bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=`
- [ ] Les paramètres sont correctement mappés (`email` et `product`)
- [ ] Le test manuel avec cURL fonctionne (avec le secret)
- [ ] Le test avec un achat test fonctionne
- [ ] L'historique des webhooks dans ThriveCart montre des envois réussis

## Support

Si vous rencontrez des problèmes lors de la configuration :

1. Vérifiez l'historique des webhooks dans ThriveCart pour voir les erreurs
2. Testez manuellement avec cURL pour isoler le problème
3. Vérifiez que tous les paramètres sont correctement configurés (URL, headers, paramètres)
4. Consultez la documentation ThriveCart sur les webhooks si nécessaire

Une fois configuré correctement, chaque achat créera automatiquement un compte utilisateur avec les bonnes permissions. Plus besoin de créer manuellement les comptes après chaque vente.

