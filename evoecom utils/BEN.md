# Configuration du Webhook ThriveCart pour la Création Automatique de Comptes

Ce document explique comment configurer le webhook dans ThriveCart pour créer automatiquement les comptes utilisateurs après chaque paiement.

## Vue d'ensemble

Le système fonctionne de manière simple : lorsqu'un client paie sur ThriveCart, un webhook est automatiquement envoyé à notre fonction Supabase qui crée le compte utilisateur avec les bonnes permissions selon le produit acheté.

## URL du Webhook

Voici l'URL de la fonction Edge Function que vous devez utiliser dans ThriveCart :

```
https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user
```

**Note importante :** Cette URL doit être configurée exactement comme indiqué. Assurez-vous de ne pas avoir d'espaces ou de caractères supplémentaires. Cette fonction est spécialement conçue pour recevoir les webhooks de ThriveCart et créer automatiquement les comptes utilisateurs.

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
  -d "email=test@example.com&product=STFOUR"
```

**Test pour GLBNS :**
```bash
curl -X POST "https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test2@example.com&product=GLBNS"
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
3. Vérifiez dans Supabase Dashboard que :
   - L'utilisateur a été créé dans Authentication > Users
   - Le profil a été créé dans Table Editor > user_profiles
   - Le profil a le bon `access_level` et `products`

## Vérification et logs

### Vérifier les logs dans Supabase

1. Allez dans Supabase Dashboard
2. Edge Functions > provision-user
3. Cliquez sur Logs
4. Vous verrez toutes les requêtes reçues, les succès et les erreurs

### Vérifier l'historique dans ThriveCart

1. Allez dans Settings > Integrations > Webhooks
2. Cliquez sur votre webhook
3. Vous verrez l'historique des envois avec les statuts (succès/échec)

## Dépannage

### Le webhook ne se déclenche pas

- Vérifiez que ThriveCart n'est pas en mode test (certains webhooks peuvent être désactivés en test)
- Vérifiez que l'URL est exactement correcte (copiez-collez pour éviter les erreurs)
- Vérifiez les conditions de déclenchement dans ThriveCart
- Consultez l'historique des webhooks dans ThriveCart pour voir si le webhook a été envoyé

### Erreur "Produit invalide"

- Vérifiez que le paramètre `product` est exactement `STFOUR` ou `GLBNS` (en majuscules, sans espaces)
- Si vous utilisez des variables ThriveCart, vérifiez que le SKU du produit est bien configuré
- Testez avec cURL pour vérifier que le produit est bien reçu par la fonction

### L'utilisateur existe déjà

C'est normal. Le système détecte automatiquement si l'utilisateur existe déjà et met à jour son profil au lieu de créer un doublon. Si l'utilisateur avait le Pack Global Sourcing et achète le Pack Global Business, son niveau d'accès sera automatiquement mis à jour.

### Erreur 401 ou 403

- Vérifiez que la fonction Edge Function est bien déployée
- Vérifiez que vous utilisez la bonne URL (celle indiquée ci-dessus)
- Consultez les logs dans Supabase pour voir l'erreur exacte

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
- [ ] L'URL est correctement configurée (copiez-collez pour éviter les erreurs)
- [ ] Les paramètres sont correctement mappés (`email` et `product`)
- [ ] Le test manuel avec cURL fonctionne
- [ ] Le test avec un achat test fonctionne
- [ ] Les comptes sont créés dans Supabase après les tests
- [ ] Les profils ont le bon niveau d'accès et les bons produits

## Support

Si vous rencontrez des problèmes lors de la configuration :

1. Vérifiez d'abord les logs dans Supabase Edge Functions
2. Vérifiez l'historique des webhooks dans ThriveCart
3. Testez manuellement avec cURL pour isoler le problème
4. Consultez la documentation ThriveCart sur les webhooks si nécessaire

Une fois configuré correctement, chaque achat créera automatiquement un compte utilisateur avec les bonnes permissions. Plus besoin de créer manuellement les comptes après chaque vente.

