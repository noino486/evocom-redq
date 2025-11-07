# Guide de Test du Webhook ThriveCart

Ce guide explique comment tester automatiquement le webhook de paiement ThriveCart avec le script Node.js.

## Script disponible

**test-webhook.js** - Script Node.js pour tester le webhook `provision-user`

## Prérequis

### Clé API Supabase (OBLIGATOIRE)

**⚠️ IMPORTANT :** Les Edge Functions Supabase nécessitent une clé API pour être appelées. Vous devez définir `SUPABASE_ANON_KEY` avant d'exécuter le script.

**Pour obtenir votre clé :**
1. Allez dans [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Project Settings** > **API**
4. Copiez la clé **"anon public"** (pas la service_role key)

**Pour définir la clé :**

**Windows (PowerShell) :**
```powershell
$env:SUPABASE_ANON_KEY="votre_anon_key_ici"
```

**Windows (CMD) :**
```cmd
set SUPABASE_ANON_KEY=votre_anon_key_ici
```

**Linux/Mac :**
```bash
export SUPABASE_ANON_KEY=votre_anon_key_ici
```

### Node.js
- Node.js installé (version 18 ou supérieure pour le fetch natif)
- Variable d'environnement `SUPABASE_ANON_KEY` définie

## Utilisation

### Tester tous les produits

**Définir la clé API d'abord :**
```bash
export SUPABASE_ANON_KEY=votre_anon_key
node test-webhook.js
```

**Ou en une ligne :**
```bash
SUPABASE_ANON_KEY=votre_anon_key node test-webhook.js
```

**Windows PowerShell :**
```powershell
$env:SUPABASE_ANON_KEY="votre_anon_key"; node test-webhook.js
```

### Tester un produit spécifique

```bash
node test-webhook.js --product STFOUR
node test-webhook.js --product GLBNS
```

### Avec un email personnalisé

```bash
node test-webhook.js --product STFOUR --email mon-email@example.com
```

### Utiliser Bearer token au lieu du header personnalisé

```bash
node test-webhook.js --bearer
```

## Résultats attendus

### Succès (200-299)

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

### Erreurs possibles

**401 - Missing authorization header**
- Vérifiez que `SUPABASE_ANON_KEY` est bien définie
- Assurez-vous d'utiliser la clé **"anon public"** (pas la service_role key)

**401 - Secret webhook invalide**
```json
{
  "success": false,
  "error": "Secret webhook invalide ou manquant"
}
```

**400 - Produit invalide**
```json
{
  "success": false,
  "error": "Produit invalide: XXX. Valeurs acceptées: STFOUR, GLBNS"
}
```

**400 - Paramètres manquants**
```json
{
  "success": false,
  "error": "Paramètres manquants: email et product sont requis"
}
```

## Vérification

Après avoir exécuté les tests, vérifiez :

1. **Dans Supabase Dashboard** (si vous y avez accès) :
   - Allez dans Authentication > Users
   - Vérifiez que les utilisateurs de test ont été créés
   - Allez dans Table Editor > user_profiles
   - Vérifiez que les profils ont le bon `access_level` et `products`

2. **Dans les résultats du script** :
   - Tous les tests doivent afficher "✅ Succès"
   - Les temps de réponse doivent être raisonnables (< 2 secondes)

## Dépannage

### Erreur de connexion
- Vérifiez votre connexion internet
- Vérifiez que l'URL est correcte
- Vérifiez que le serveur Supabase est accessible

### Erreur 401 "Missing authorization header"
- **C'est l'erreur la plus courante !** Les Edge Functions Supabase nécessitent la clé API
- Vérifiez que `SUPABASE_ANON_KEY` est bien définie : `echo $SUPABASE_ANON_KEY` (Linux/Mac) ou `echo $env:SUPABASE_ANON_KEY` (PowerShell)
- Assurez-vous d'utiliser la clé **"anon public"** (pas la service_role key)
- Vérifiez que la clé est correcte dans Supabase Dashboard > Project Settings > API

### Erreur 401 "Secret webhook invalide"
- Vérifiez que le secret webhook dans le script correspond à celui configuré dans Supabase
- Vérifiez que le header `x-webhook-secret` est bien envoyé (regardez les logs)

### Erreur "Produit invalide"
- Assurez-vous d'utiliser exactement `STFOUR` ou `GLBNS` (en majuscules)
- Vérifiez qu'il n'y a pas d'espaces avant ou après

### Erreur de timeout
- Le serveur peut être lent, augmentez le timeout dans le script si nécessaire
- Réessayez après quelques secondes

## Notes

- Les emails générés automatiquement utilisent un timestamp pour être uniques
- Les tests sont séparés par 1 seconde pour éviter la surcharge
- Vous pouvez modifier les constantes en haut du script pour changer l'URL ou le secret
- Le script affiche les résultats en couleur pour une meilleure lisibilité
