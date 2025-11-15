# Intégration Edge Function `create-user` avec Thrimcards

Ce document explique comment intégrer l'Edge Function Supabase `create-user` avec votre gestionnaire de paiements Thrimcards (ThriveCart) pour créer automatiquement des comptes utilisateurs après chaque transaction.

## URL de l'Endpoint

```
https://sokdytywaipifrjcitcg.supabase.co/functions/v1/create-user
```

## Authentification

**Header requis :**
```
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
```

Le token doit provenir d'un compte administrateur Supabase (`access_level = 4`).

## Intégration avec Thrimcards (ThriveCart)

### Option 1 : Webhook Direct ThriveCart

**Configuration dans ThriveCart :**

1. **Accéder aux paramètres webhook :**
   - ThriveCart → Settings → Integrations → Webhooks
   - Cliquez sur "Add Webhook" ou "Create Webhook"

2. **Configurer le webhook :**
   - **Nom :** `Création compte utilisateur`
   - **URL :** `https://sokdytywaipifrjcitcg.supabase.co/functions/v1/create-user`
   - **Méthode :** `POST`
   - **Content-Type :** `application/json`

3. **Headers personnalisés :**
   ```
   Authorization: Bearer <VOTRE_SUPABASE_ACCESS_TOKEN>
   ```

   ⚠️ **Important :** Le token doit être celui d'un compte administrateur.

4. **Body JSON avec variables ThriveCart :**

   **Pour STFOUR (Pack Global Sourcing) :**
   ```json
   {
     "email": "{{customer.email}}",
     "access_level": 1,
     "products": ["STFOUR"],
     "site_url": "https://evoecom.com",
     "sale": {
       "pack_id": "STFOUR-{{order.id}}",
       "price": {{purchase.amount}}
     }
   }
   ```

   **Pour GLBNS (Pack Global Business) :**
   ```json
   {
     "email": "{{customer.email}}",
     "access_level": 2,
     "products": ["STFOUR", "GLBNS"],
     "site_url": "https://evoecom.com",
     "sale": {
       "pack_id": "GLBNS-{{order.id}}",
       "price": {{purchase.amount}}
     }
   }
   ```

5. **Condition de déclenchement :**
   - Sélectionnez "Order Completed" ou "Purchase Completed"
   - Optionnel : Ajoutez une condition pour ne déclencher que pour certains produits

### Option 2 : Script Intermédiaire (Recommandé pour la Sécurité)

Pour éviter d'exposer directement votre token administrateur dans ThriveCart, créez un script intermédiaire :

```javascript
// server.js - Script intermédiaire
const express = require('express');
const app = express();

const THRIVECART_WEBHOOK_SECRET = 'votre-secret-webhook';
const SUPABASE_ACCESS_TOKEN = 'votre-token-admin-supabase';
const CREATE_USER_URL = 'https://sokdytywaipifrjcitcg.supabase.co/functions/v1/create-user';

app.use(express.json());

app.post('/webhook/thrivecart', async (req, res) => {
  // 1. Vérifier le secret webhook
  const webhookSecret = req.headers['x-webhook-secret'];
  if (webhookSecret !== THRIVECART_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Extraire les données de ThriveCart
  const { customer, product, purchase } = req.body;

  // 3. Déterminer le niveau d'accès et les produits selon le produit acheté
  let accessLevel, products;
  if (product.sku === 'STFOUR' || product.name.includes('Sourcing')) {
    accessLevel = 1;
    products = ['STFOUR'];
  } else if (product.sku === 'GLBNS' || product.name.includes('Business')) {
    accessLevel = 2;
    products = ['STFOUR', 'GLBNS'];
  } else {
    return res.status(400).json({ error: 'Produit non reconnu' });
  }

  // 4. Appeler l'Edge Function create-user
  try {
    const response = await fetch(CREATE_USER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        email: customer.email,
        access_level: accessLevel,
        products: products,
        site_url: 'https://evoecom.com',
        sale: {
          pack_id: `${product.sku}-${purchase.order_id}`,
          price: parseFloat(purchase.amount)
        }
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(response.status).json({ error: data.error });
    }
  } catch (error) {
    console.error('Erreur appel create-user:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

**Configuration ThriveCart pour utiliser le script intermédiaire :**
- **URL :** `https://votre-domaine.com/webhook/thrivecart`
- **Header :** `x-webhook-secret: votre-secret-webhook`
- **Body :** Données complètes de ThriveCart (JSON)

## Mapping Produits Thrimcards → Supabase

| Produit Thrimcards | `access_level` | `products` | `pack_id` suggéré |
|-------------------|----------------|------------|-------------------|
| Pack Global Sourcing (STFOUR) | 1 | `["STFOUR"]` | `STFOUR-{order_id}` |
| Pack Global Business (GLBNS) | 2 | `["STFOUR", "GLBNS"]` | `GLBNS-{order_id}` |

## Format de la Réponse

### Succès (201 Created)

```json
{
  "success": true,
  "message": "Invitation envoyée avec succès par email",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "client@example.com",
  "access_level": 1,
  "products": ["STFOUR"],
  "sale_id": "sale-123-456",
  "invitation_sent": true
}
```

### Erreur

```json
{
  "success": false,
  "error": "Message d'erreur détaillé"
}
```

## Checklist d'Intégration

- [ ] Le token Supabase administrateur est valide et sécurisé
- [ ] Le webhook ThriveCart est configuré avec la bonne URL
- [ ] Les headers d'authentification sont correctement configurés
- [ ] Le mapping produits Thrimcards → Supabase est correct
- [ ] Les tests avec des transactions test sont réussis
