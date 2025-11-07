# Comment vérifier les logs pour diagnostiquer l'erreur 500

## Méthode rapide : Via Supabase Dashboard

1. Allez dans **Supabase Dashboard**
2. Cliquez sur **Edge Functions** dans le menu
3. Sélectionnez `create-user`
4. Allez dans l'onglet **Logs**
5. Cherchez les logs les plus récents (en rouge pour les erreurs)

## Méthode CLI : Logs en temps réel

```bash
supabase functions logs create-user --follow
```

## Ce qu'il faut chercher dans les logs

### Logs attendus (normal)

```
[create-user] Parser les données...
[create-user] URL de redirection finale: http://localhost:5173
[create-user] Début création utilisateur avec invitation pour: test@example.com
[create-user] Utilisateur créé avec succès: abc123...
[create-user] Lien d'invitation généré avec succès
[create-user] Création nouveau profil...
[create-user] Profil créé avec succès
```

### Erreurs possibles

1. **"Variables d'environnement Supabase manquantes"**
   - Cause : `SUPABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY` non définies
   - Solution : Ces variables sont normalement définies automatiquement. Si problème, contactez le support Supabase.

2. **"Non authentifié"**
   - Cause : Token JWT manquant ou invalide
   - Solution : Reconnectez-vous au dashboard

3. **"Accès refusé. Administrateur requis."**
   - Cause : Votre `access_level` n'est pas 4
   - Solution : Exécutez ce SQL :
   ```sql
   UPDATE user_profiles SET access_level = 4 WHERE email = 'votre@email.com';
   ```

4. **"already registered"**
   - Cause : L'utilisateur existe déjà
   - Solution : Normal, le code devrait gérer cela. Si erreur persiste, vérifiez les logs complets.

5. **"PGRST116" ou "relation does not exist"**
   - Cause : Table `user_profiles` n'existe pas ou RLS problème
   - Solution : Vérifiez que le schéma est bien déployé (`database_dashboard_schema.sql`)

6. **Erreur lors de `generateLink`**
   - Cause : Problème avec l'API Supabase Auth
   - Solution : L'utilisateur est créé mais l'invitation échoue. Vous pouvez renvoyer l'invitation depuis Supabase Dashboard.

## Commandes de débogage

### 1. Voir tous les logs récents
```bash
supabase functions logs create-user --limit 50
```

### 2. Filtrer les erreurs uniquement
```bash
supabase functions logs create-user | grep -i error
```

### 3. Voir les logs d'une période spécifique
```bash
supabase functions logs create-user --since 1h
```

## Partagez les logs

Pour qu'on puisse diagnostiquer, copiez-collez :
- Les 10-20 dernières lignes des logs
- Spécifiquement les lignes qui contiennent `[create-user]` et les erreurs (en rouge)

## Test rapide

Pour tester si la fonction est accessible :

1. **Vérifier que la fonction existe** :
   ```bash
   supabase functions list
   ```

2. **Tester avec un cURL simple** (remplacez par vos vraies valeurs) :
   ```bash
   curl -X POST https://VOTRE_PROJECT_REF.supabase.co/functions/v1/create-user \
     -H "Authorization: Bearer VOTRE_SUPABASE_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"test": "hello"}'
   ```

   **Note** : Cela devrait retourner une erreur 401 (auth requise), mais au moins on sait que la fonction répond.

