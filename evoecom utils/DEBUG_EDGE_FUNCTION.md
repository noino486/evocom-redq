# Guide de débogage de l'Edge Function `create-user`

## Vérifier les logs de l'Edge Function

### Méthode 1 : Via Supabase Dashboard

1. Allez dans **Supabase Dashboard**
2. Cliquez sur **Edge Functions** dans le menu de gauche
3. Sélectionnez `create-user`
4. Cliquez sur l'onglet **Logs**
5. Vérifiez les erreurs récentes

### Méthode 2 : Via CLI

```bash
supabase functions logs create-user
# ou si installé localement
npx supabase functions logs create-user
```

### Méthode 3 : En temps réel

```bash
supabase functions logs create-user --follow
```

## Codes d'erreur courants

### 401 Unauthorized
**Cause** : Token d'authentification manquant ou invalide

**Solutions** :
1. Vérifiez que vous êtes bien connecté au dashboard
2. Vérifiez que votre session n'a pas expiré
3. Essayez de vous reconnecter au dashboard

### 403 Forbidden
**Cause** : Vous n'êtes pas administrateur (access_level !== 4)

**Solutions** :
1. Vérifiez votre profil dans la base de données :
   ```sql
   SELECT id, email, access_level FROM user_profiles WHERE email = 'votre@email.com';
   ```
2. Si `access_level` n'est pas 4, mettez-le à jour :
   ```sql
   UPDATE user_profiles SET access_level = 4 WHERE email = 'votre@email.com';
   ```

### 400 Bad Request
**Cause** : Paramètres manquants ou invalides

**Solutions** :
1. Vérifiez que tous les champs sont remplis dans le formulaire
2. Vérifiez le format de l'email
3. Vérifiez que `access_level` est entre 1 et 4
4. Vérifiez que `products` est un tableau valide

### 500 Internal Server Error
**Cause** : Erreur dans le code de l'Edge Function

**Solutions** :
1. Consultez les logs détaillés (voir ci-dessus)
2. Vérifiez que les variables d'environnement sont définies :
   - `SUPABASE_URL` (définie automatiquement)
   - `SUPABASE_SERVICE_ROLE_KEY` (définie automatiquement)
   - `SITE_URL` (optionnel, défaut: `https://evoecom.com`)
3. Vérifiez que la fonction est bien déployée :
   ```bash
   supabase functions list
   ```

### 409 Conflict
**Cause** : Un utilisateur avec cet email existe déjà et a déjà un profil

**Solutions** :
- C'est normal, l'utilisateur existe déjà
- Utilisez un autre email ou mettez à jour l'utilisateur existant depuis la page "Utilisateurs"

## Erreurs spécifiques

### "inviteUserByEmail is not a function"
**Cause** : L'API `inviteUserByEmail` n'existe peut-être pas dans votre version

**Solution** : La fonction a été modifiée pour utiliser `createUser` + `generateLink` à la place

### "Variables d'environnement Supabase manquantes"
**Cause** : Les variables d'environnement ne sont pas définies dans Supabase

**Solutions** :
1. Ces variables sont normalement définies automatiquement par Supabase
2. Si problème, vérifiez dans Supabase Dashboard > Settings > Edge Functions > Environment Variables

### "Impossible de créer ou récupérer l'utilisateur"
**Cause** : Problème lors de la création de l'utilisateur dans Supabase Auth

**Solutions** :
1. Vérifiez les logs pour plus de détails
2. Vérifiez que l'email n'est pas déjà utilisé
3. Vérifiez les limites de votre plan Supabase

## Tester la fonction localement

1. **Servir la fonction localement** :
   ```bash
   supabase functions serve create-user
   ```

2. **Tester avec cURL** :
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/create-user' \
     --header 'Authorization: Bearer VOTRE_TOKEN_JWT' \
     --header 'Content-Type: application/json' \
     --data '{
       "email": "test@example.com",
       "access_level": 1,
       "products": ["STFOUR"]
     }'
   ```

## Vérifier les email templates

Si l'invitation n'est pas envoyée :

1. Allez dans **Supabase Dashboard** > **Authentication** > **Email Templates**
2. Vérifiez que le template **"Invite user"** est configuré
3. Le template doit inclure `{{ .ConfirmationURL }}` pour le lien d'invitation

## Console du navigateur

Ouvrez la console du navigateur (F12) et regardez les erreurs dans l'onglet **Console**. Les erreurs détaillées devraient apparaître là.

