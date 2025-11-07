# Configuration du Secret Webhook

Ce document explique comment configurer le secret webhook dans Supabase pour sécuriser les webhooks ThriveCart.

## Secret Webhook

Le secret suivant est utilisé pour authentifier les webhooks :

```
bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=
```

## Configuration dans Supabase

### Méthode 1 : Via le Dashboard Supabase

1. Connectez-vous au [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Project Settings** (icône d'engrenage en bas à gauche)
4. Dans le menu de gauche, cliquez sur **Edge Functions**
5. Cliquez sur l'onglet **Secrets**
6. Cliquez sur **Add new secret**
7. Remplissez le formulaire :
   - **Name :** `WEBHOOK_SECRET`
   - **Value :** `bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=`
8. Cliquez sur **Save**

### Méthode 2 : Via la ligne de commande (recommandé)

**Prérequis :**
- Avoir installé [Supabase CLI](https://supabase.com/docs/guides/cli)
- Être authentifié : `supabase login`
- Avoir initialisé le projet : `supabase link --project-ref votre-project-ref`

**Commande :**

Ouvrez un terminal à la racine du projet et exécutez :

```bash
supabase secrets set WEBHOOK_SECRET=bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=
```

**Note :** Si vous n'êtes pas encore lié au projet, utilisez d'abord :

```bash
supabase link --project-ref sokdytywaipifrjcitcg
```

Puis configurez le secret.

## Vérification

Pour vérifier que le secret est bien configuré :

```bash
supabase secrets list
```

Vous devriez voir `WEBHOOK_SECRET` dans la liste des secrets.

## Redéploiement de l'Edge Function

Après avoir configuré le secret, redéployez l'Edge Function pour vous assurer qu'elle utilise bien le secret :

```bash
supabase functions deploy provision-user
```

## Test

Pour tester que le secret fonctionne, utilisez cURL :

```bash
curl -X POST "https://sokdytywaipifrjcitcg.supabase.co/functions/v1/provision-user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "x-webhook-secret: bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=" \
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

**Réponse en cas d'erreur (secret manquant ou incorrect) :**
```json
{
  "success": false,
  "error": "Secret webhook invalide ou manquant"
}
```

## Dépannage

### Le secret n'est pas reconnu

1. Vérifiez que le secret est bien configuré :
   ```bash
   supabase secrets list
   ```

2. Vérifiez que la valeur du secret correspond exactement (pas d'espaces, même casse)

3. Redéployez l'Edge Function :
   ```bash
   supabase functions deploy provision-user
   ```

4. Vérifiez les logs de l'Edge Function dans le Dashboard Supabase pour voir les erreurs

### Erreur 401 lors des tests

- Assurez-vous que le header `x-webhook-secret` est bien présent dans votre requête
- Vérifiez que la valeur du secret correspond exactement à : `bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=`
- Vérifiez que le secret est bien configuré dans Supabase

## Sécurité

**⚠️ IMPORTANT :**
- Ne partagez jamais ce secret publiquement
- Ne le commitez pas dans Git (il est déjà dans ce fichier de documentation, mais évitez de le mettre dans du code source)
- Si le secret est compromis, générez-en un nouveau et mettez à jour Supabase et ThriveCart

## Régénération du secret

Si vous devez régénérer le secret pour des raisons de sécurité :

1. Générez un nouveau secret (32 bytes en base64) :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. Configurez le nouveau secret dans Supabase :
   ```bash
   supabase secrets set WEBHOOK_SECRET=nouveau-secret-ici
   ```

3. Redéployez l'Edge Function :
   ```bash
   supabase functions deploy provision-user
   ```

4. Mettez à jour le secret dans ThriveCart (dans la configuration du webhook)

5. Mettez à jour ce document avec le nouveau secret

