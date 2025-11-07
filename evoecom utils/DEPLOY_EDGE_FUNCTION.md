# Guide de déploiement de l'Edge Function `create-user`

## Prérequis

1. Installer Supabase CLI :

   **⚠️ L'installation globale via npm n'est plus supportée !**
   
   **Option A : Via Scoop (Recommandé pour Windows)**
   ```powershell
   # Installer Scoop d'abord (si pas déjà fait)
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
   
   # Installer Supabase CLI
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```
   
   **Option B : Via npm local (dans votre projet)**
   ```bash
   npm install supabase --save-dev
   ```
   Puis utilisez `npx supabase` au lieu de `supabase` dans toutes les commandes suivantes.

   **Voir `INSTALL_SUPABASE_CLI.md` pour plus de détails.**

2. Se connecter à Supabase :
   
   Si installé via Scoop ou binaire :
   ```bash
   supabase login
   ```
   
   Si installé localement :
   ```bash
   npx supabase login
   ```

3. Lier votre projet (optionnel si déjà fait) :
   
   Si installé via Scoop ou binaire :
   ```bash
   supabase link --project-ref votre-project-ref
   ```
   
   Si installé localement :
   ```bash
   npx supabase link --project-ref votre-project-ref
   ```

## Déploiement de la fonction

1. **Déployer la fonction `create-user`** :
   
   Si installé via Scoop ou binaire :
   ```bash
   supabase functions deploy create-user
   ```
   
   Si installé localement via npm :
   ```bash
   npx supabase functions deploy create-user
   ```

2. **Vérifier les variables d'environnement** :
   
   La fonction nécessite ces variables d'environnement définies dans Supabase Dashboard :
   - `SUPABASE_URL` : Définie automatiquement par Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` : Définie automatiquement par Supabase
   - `SITE_URL` (optionnel) : URL de votre site pour les redirections (défaut: `https://evoecom.com`)
   
   Pour définir `SITE_URL` :
   ```bash
   supabase secrets set SITE_URL=https://votre-domaine.com
   ```

## Vérification après déploiement

1. **Vérifier dans Supabase Dashboard** :
   - Allez dans **Edge Functions** > **create-user**
   - Vérifiez que la fonction est active et déployée

2. **Tester la fonction** :
   
   Depuis le dashboard admin, essayez de créer un utilisateur avec juste son email.
   L'invitation devrait être envoyée automatiquement.

## Configuration des emails d'invitation

Pour que les emails d'invitation soient envoyés correctement :

1. **Dans Supabase Dashboard** :
   - Allez dans **Authentication** > **Email Templates**
   - Vérifiez que le template "Invite user" est configuré
   - Le lien d'invitation sera automatiquement inclus dans l'email

2. **Personnaliser le template** (optionnel) :
   ```html
   <h2>Bienvenue !</h2>
   <p>Vous avez été invité à rejoindre notre plateforme.</p>
   <p><a href="{{ .ConfirmationURL }}">Cliquez ici pour créer votre compte</a></p>
   ```

## Commandes utiles

- **Voir les logs** :
  ```bash
  supabase functions logs create-user
  # ou
  npx supabase functions logs create-user
  ```

- **Tester localement** (si Supabase CLI configuré) :
  ```bash
  supabase functions serve create-user
  # ou
  npx supabase functions serve create-user
  ```

- **Redéployer** :
  ```bash
  supabase functions deploy create-user --no-verify-jwt
  # ou
  npx supabase functions deploy create-user --no-verify-jwt
  ```

## Notes importantes

- La fonction utilise `inviteUserByEmail` qui crée automatiquement l'utilisateur et envoie l'email
- Les utilisateurs créés via invitation auront `is_active: false` jusqu'à ce qu'ils définissent leur mot de passe
- Le profil est activé automatiquement lors de la première connexion après l'invitation

