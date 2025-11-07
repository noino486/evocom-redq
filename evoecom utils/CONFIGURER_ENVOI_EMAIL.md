# Configuration de l'Envoi d'Email pour le Webhook

Le webhook `provision-user` envoie automatiquement un email de bienvenue aux nouveaux utilisateurs. Ce document explique comment configurer l'envoi d'email.

## Options disponibles

Le système supporte trois méthodes pour envoyer des emails (par ordre de priorité) :

### Option 1 : SendGrid (Recommandé)

SendGrid est un service d'email professionnel et fiable, largement utilisé en production.

**Avantages :**
- Email HTML personnalisé avec le mot de passe temporaire
- Très fiable et performant
- 100 emails/jour gratuit
- Excellent pour la production
- Bonne délivrabilité

**Configuration :** Voir [CONFIGURER_SENDGRID.md](./CONFIGURER_SENDGRID.md)

### Option 2 : Resend

Resend est un service d'email moderne et fiable. Il permet d'envoyer des emails HTML avec le mot de passe temporaire directement dans l'email.

**Avantages :**
- Email HTML personnalisé avec le mot de passe temporaire
- Facile à configurer
- Interface moderne
- Prix abordable (100 emails/jour gratuit)

**Configuration :**

1. **Créer un compte Resend :**
   - Allez sur [resend.com](https://resend.com)
   - Créez un compte gratuit
   - Vérifiez votre domaine (ou utilisez le domaine de test)

2. **Obtenir la clé API :**
   - Allez dans **API Keys**
   - Cliquez sur **Create API Key**
   - Copiez la clé API

3. **Configurer dans Supabase :**
   ```bash
   supabase secrets set RESEND_API_KEY=votre_cle_resend_ici
   ```

4. **Redéployer l'Edge Function :**
   ```bash
   supabase functions deploy provision-user
   ```

### Option 3 : Supabase Auth Email Templates

Supabase Auth peut envoyer des emails automatiquement via ses templates configurés.

**Configuration :**

1. **Configurer SMTP dans Supabase :**
   - Allez dans **Supabase Dashboard** > **Project Settings** > **Auth**
   - Section **SMTP Settings**
   - Configurez votre service SMTP (Gmail, SendGrid, etc.)

2. **Personnaliser les templates :**
   - Allez dans **Authentication** > **Email Templates**
   - Modifiez le template "Change Email" ou "Reset Password"
   - Le système utilisera automatiquement ces templates

**Note :** Avec cette méthode, l'utilisateur recevra un lien de réinitialisation de mot de passe au lieu du mot de passe en clair. C'est plus sécurisé mais moins pratique pour l'utilisateur.

## Vérification

Pour vérifier que l'envoi d'email fonctionne :

1. **Testez le webhook :**
   ```bash
   SUPABASE_ANON_KEY=votre_cle node test-webhook.js --product STFOUR --email votre-email@example.com
   ```

2. **Vérifiez les logs :**
   - Allez dans **Supabase Dashboard** > **Edge Functions** > **provision-user** > **Logs**
   - Vous devriez voir : `✅ Email envoyé avec succès à email@example.com via Resend`

3. **Vérifiez votre boîte mail :**
   - L'email devrait arriver dans quelques secondes
   - Vérifiez aussi les spams si nécessaire

## Dépannage

### L'email n'est pas envoyé

**Vérifiez les logs :**
- Les logs Supabase indiqueront l'erreur exacte
- Cherchez les messages avec `❌` dans les logs

**Pour SendGrid :**
- Vérifiez que `SENDGRID_API_KEY` est bien configuré : `supabase secrets list`
- Vérifiez que votre domaine est vérifié dans SendGrid
- Vérifiez que vous n'avez pas dépassé votre quota (100 emails/jour en gratuit)
- Vérifiez les logs Supabase pour les erreurs détaillées

**Pour Resend :**
- Vérifiez que `RESEND_API_KEY` est bien configuré : `supabase secrets list`
- Vérifiez que votre domaine est vérifié dans Resend
- Vérifiez que vous n'avez pas dépassé votre quota

**Pour Supabase Auth :**
- Vérifiez que SMTP est configuré dans Project Settings > Auth
- Vérifiez que les templates d'email sont activés
- Vérifiez les logs SMTP dans Supabase Dashboard

### L'email arrive en spam

- Vérifiez que votre domaine est bien vérifié dans Resend
- Ajoutez les enregistrements SPF, DKIM et DMARC pour votre domaine
- Utilisez un domaine personnalisé plutôt qu'un domaine de test

## Personnalisation de l'email

Le template d'email HTML peut être personnalisé dans le fichier `supabase/functions/provision-user/index.ts` à la ligne 296 (pour SendGrid) ou ligne 358 (pour Resend).

Vous pouvez modifier :
- Le contenu HTML
- Les couleurs et styles
- Le texte du message
- L'URL de redirection

N'oubliez pas de redéployer après modification :
```bash
supabase functions deploy provision-user
```

## Sécurité

**⚠️ IMPORTANT :**
- Ne jamais commiter la clé API Resend dans Git
- Utilisez toujours les secrets Supabase pour stocker les clés API
- Le mot de passe temporaire doit être changé à la première connexion
- Considérez l'utilisation d'un lien magique au lieu du mot de passe en clair pour plus de sécurité

