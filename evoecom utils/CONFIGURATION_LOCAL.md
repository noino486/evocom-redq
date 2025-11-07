# Configuration pour le développement local

## Configuration de l'URL locale

Pour que les invitations fonctionnent correctement en local, l'Edge Function doit connaître l'URL de votre site local.

### Option 1 : Automatique (Recommandé)

L'URL est maintenant détectée automatiquement depuis :
1. Le paramètre `site_url` passé dans la requête (priorité)
2. L'header `origin` ou `referer` de la requête
3. La variable d'environnement `SITE_URL` dans Supabase
4. La valeur par défaut `https://evoecom.com`

Le code détecte automatiquement `localhost` ou `127.0.0.1` et utilise l'URL locale.

### Option 2 : Variable d'environnement Supabase

Vous pouvez définir une variable d'environnement dans Supabase pour le développement :

```bash
supabase secrets set SITE_URL=http://localhost:5173
```

**Note** : Cette variable sera utilisée pour tous les environnements, donc mieux vaut utiliser l'option 1 pour le local.

### Option 3 : Vérifier que le port correspond

Assurez-vous que le port dans l'URL correspond à celui de votre serveur de développement :
- Vite par défaut : `http://localhost:5173`
- React par défaut : `http://localhost:3000`

Pour vérifier votre port, regardez dans la console quand vous démarrez le serveur :
```bash
npm run dev
# ou
vite
```

## Test en local

1. **Démarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Vérifier l'URL dans la console** :
   Vous devriez voir quelque chose comme :
   ```
   VITE v4.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ```

3. **Tester l'invitation** :
   - Ouvrez `http://localhost:5173/dashboard/users`
   - Essayez d'inviter un utilisateur
   - Vérifiez les logs de l'Edge Function pour confirmer que l'URL locale est utilisée

## Vérifier les logs

Dans les logs de l'Edge Function (`supabase functions logs create-user`), vous devriez voir :
```
[create-user] URL locale détectée depuis origin: http://localhost:5173
[create-user] URL de redirection finale: http://localhost:5173
```

## Configuration pour la production

Quand vous déployez en production, assurez-vous que :
1. Le paramètre `site_url` du frontend pointe vers votre domaine de production
2. Ou définissez `SITE_URL` dans Supabase :
   ```bash
   supabase secrets set SITE_URL=https://votre-domaine.com
   ```

## Dépannage

### L'invitation ne fonctionne pas en local

1. **Vérifiez les logs de l'Edge Function** :
   ```bash
   supabase functions logs create-user --follow
   ```

2. **Vérifiez que l'URL est correcte** :
   - Les logs doivent montrer une URL avec `localhost`
   - Si vous voyez toujours `https://evoecom.com`, l'URL n'est pas détectée

3. **Vérifiez les email templates dans Supabase** :
   - Dashboard > Authentication > Email Templates
   - Le template "Invite user" doit être configuré
   - Le lien doit utiliser `{{ .ConfirmationURL }}`

### Les emails ne s'envoient pas en local

En développement local, les emails peuvent ne pas être envoyés automatiquement. Pour tester :
1. Utilisez un email de test
2. Vérifiez dans Supabase Dashboard > Authentication > Users que l'utilisateur est créé
3. Vous pouvez manuellement générer un lien d'invitation depuis le dashboard Supabase

