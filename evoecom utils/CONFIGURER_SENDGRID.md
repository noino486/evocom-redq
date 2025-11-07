# Configuration de SendGrid pour l'Envoi d'Email

Ce guide explique comment configurer SendGrid pour que le webhook envoie automatiquement des emails de bienvenue aux nouveaux utilisateurs.

## Étapes de configuration

### 1. Créer un compte SendGrid

1. Allez sur [sendgrid.com](https://sendgrid.com)
2. Créez un compte gratuit (100 emails/jour gratuit)
3. Vérifiez votre email et complétez la vérification

### 2. Créer une clé API SendGrid

1. Connectez-vous à votre compte SendGrid
2. Allez dans **Settings** > **API Keys**
3. Cliquez sur **Create API Key**
4. Donnez un nom à votre clé (ex: "EVO ECOM Webhook")
5. Sélectionnez les permissions **Full Access** (ou au minimum **Mail Send**)
6. Cliquez sur **Create & View**
7. **⚠️ IMPORTANT :** Copiez la clé API immédiatement, elle ne sera plus visible après

### 3. Vérifier votre domaine (Recommandé)

Pour éviter que les emails arrivent en spam, vous devez vérifier votre domaine :

1. Allez dans **Settings** > **Sender Authentication**
2. Cliquez sur **Authenticate Your Domain**
3. Suivez les instructions pour ajouter les enregistrements DNS
4. Attendez la vérification (peut prendre quelques minutes à quelques heures)

**Alternative :** Vous pouvez utiliser l'email de vérification unique SendGrid pour les tests, mais il est limité à 100 emails/jour.

### 4. Configurer dans Supabase

Une fois que vous avez votre clé API SendGrid, configurez-la dans Supabase :

```bash
supabase secrets set SENDGRID_API_KEY=votre_cle_sendgrid_ici
```

**Optionnel :** Configurez l'email et le nom de l'expéditeur :

```bash
supabase secrets set SENDGRID_FROM_EMAIL=noreply@votre-domaine.com
supabase secrets set SENDGRID_FROM_NAME="EVO ECOM"
```

Si vous ne configurez pas ces variables, les valeurs par défaut seront utilisées :
- `SENDGRID_FROM_EMAIL`: `noreply@evoecom.com`
- `SENDGRID_FROM_NAME`: `EVO ECOM`

### 5. Redéployer l'Edge Function

Après avoir configuré les secrets, redéployez la fonction :

```bash
supabase functions deploy provision-user
```

## Vérification

### Test manuel

Testez le webhook pour vérifier que l'email est bien envoyé :

```bash
SUPABASE_ANON_KEY=votre_anon_key node test-webhook.js --product STFOUR --email votre-email@example.com
```

### Vérifier les logs

1. Allez dans **Supabase Dashboard** > **Edge Functions** > **provision-user** > **Logs**
2. Vous devriez voir : `✅ Email envoyé avec succès à email@example.com via SendGrid`

### Vérifier votre boîte mail

- L'email devrait arriver dans quelques secondes
- Vérifiez aussi le dossier spam si nécessaire

## Structure de l'email envoyé

L'email envoyé contient :

- **Sujet** : "Bienvenue sur EVO ECOM - Vos identifiants de connexion"
- **Contenu** :
  - Message de bienvenue
  - Email de connexion
  - Mot de passe temporaire (affiché dans un encadré)
  - Lien "Se connecter maintenant"
  - Avertissement pour changer le mot de passe

## Dépannage

### L'email n'est pas envoyé

**Vérifiez les logs Supabase :**
- Les logs indiqueront l'erreur exacte
- Cherchez les messages avec `❌` dans les logs

**Vérifiez la clé API :**
```bash
supabase secrets list
```
Vous devriez voir `SENDGRID_API_KEY` dans la liste.

**Vérifiez les permissions de la clé API :**
- La clé doit avoir la permission "Mail Send"
- Si vous utilisez "Full Access", c'est OK

**Vérifiez votre quota SendGrid :**
- Le plan gratuit permet 100 emails/jour
- Vérifiez dans SendGrid Dashboard > Activity

### Erreur 403 Forbidden

- Vérifiez que la clé API est correcte
- Vérifiez que la clé API a les bonnes permissions
- Vérifiez que votre compte SendGrid est actif

### Erreur 400 Bad Request

- Vérifiez que l'email de l'expéditeur (`SENDGRID_FROM_EMAIL`) est vérifié dans SendGrid
- Si vous utilisez un domaine personnalisé, vérifiez qu'il est bien authentifié

### Les emails arrivent en spam

1. **Vérifiez votre domaine :**
   - Le domaine doit être authentifié dans SendGrid
   - Les enregistrements SPF, DKIM et DMARC doivent être configurés

2. **Vérifiez le contenu :**
   - Évitez les mots déclencheurs de spam
   - Utilisez un domaine professionnel plutôt qu'un domaine gratuit

3. **Testez avec un service d'analyse :**
   - Utilisez [Mail-Tester](https://www.mail-tester.com/) pour tester votre email

## Coûts

### Plan gratuit
- 100 emails/jour gratuitement
- Parfait pour démarrer et tester

### Plans payants
- À partir de 19$/mois pour 40,000 emails/mois
- Voir les prix sur [sendgrid.com/pricing](https://sendgrid.com/pricing)

## Sécurité

**⚠️ IMPORTANT :**
- Ne jamais commiter la clé API SendGrid dans Git
- Utilisez toujours les secrets Supabase pour stocker les clés API
- Limitez les permissions de la clé API au strict nécessaire (Mail Send)
- Ne partagez jamais votre clé API publiquement

## Personnalisation

Le template d'email HTML peut être personnalisé dans le fichier `supabase/functions/provision-user/index.ts` à la ligne 296.

Vous pouvez modifier :
- Le contenu HTML
- Les couleurs et styles
- Le texte du message
- L'URL de redirection

N'oubliez pas de redéployer après modification :
```bash
supabase functions deploy provision-user
```

## Support

- **Documentation SendGrid** : [docs.sendgrid.com](https://docs.sendgrid.com)
- **Support SendGrid** : [support.sendgrid.com](https://support.sendgrid.com)
- **Status SendGrid** : [status.sendgrid.com](https://status.sendgrid.com)

