# Configuration de l'envoi automatique des emails d'invitation

## Problème

Le lien d'invitation est généré avec succès, mais l'email n'est pas envoyé automatiquement. C'est parce que `generateLink()` crée seulement le lien sans l'envoyer par email.

## Solution : Configurer le template d'email dans Supabase

### 1. Aller dans Supabase Dashboard

1. Connectez-vous à votre **Supabase Dashboard**
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Email Templates**
4. Cliquez sur **Invite user** (ou **Invitation**)

### 2. Configurer le template

Le template doit contenir le lien d'invitation. Voici un exemple :

```html
<h2>Vous avez été invité !</h2>

<p>Bonjour,</p>

<p>Vous avez été invité à rejoindre notre plateforme. Cliquez sur le lien ci-dessous pour créer votre compte et définir votre mot de passe :</p>

<p><a href="{{ .ConfirmationURL }}">Créer mon compte</a></p>

<p>Ou copiez-collez ce lien dans votre navigateur :</p>
<p>{{ .ConfirmationURL }}</p>

<p>Ce lien est valide pendant 24 heures.</p>

<p>Cordialement,<br>L'équipe</p>
```

**Points importants :**
- Utilisez `{{ .ConfirmationURL }}` pour le lien d'invitation
- Ce lien sera automatiquement remplacé par Supabase avec le lien généré
- Le lien pointe vers : `http://localhost:5173/login?invited=true` (en local) ou votre domaine de production

### 3. Activer l'envoi automatique

Assurez-vous que :
- Le template est **actif**
- Les **email settings** sont configurés dans Supabase Dashboard > Settings > Auth
- Un service d'email est configuré (SMTP ou service tiers comme SendGrid, Resend, etc.)

## Alternative : Envoyer l'email manuellement (optionnel)

Si vous voulez envoyer l'email directement depuis l'Edge Function, vous pouvez utiliser un service comme Resend ou SendGrid. Voici un exemple avec Resend :

```typescript
// Dans l'Edge Function après generateLink
if (linkResult.data?.properties?.action_link) {
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
  
  await resend.emails.send({
    from: 'noreply@votre-domaine.com',
    to: body.email,
    subject: 'Invitation à rejoindre la plateforme',
    html: `
      <h2>Vous avez été invité !</h2>
      <p>Cliquez sur ce lien pour créer votre compte :</p>
      <p><a href="${linkResult.data.properties.action_link}">Créer mon compte</a></p>
    `
  })
}
```

## Vérification

1. **Vérifier que l'utilisateur est créé** :
   - Supabase Dashboard > Authentication > Users
   - Vous devriez voir l'utilisateur avec l'email `ofmn360@gmail.com`
   - Statut : "Unconfirmed" (normal, il doit confirmer via l'invitation)

2. **Vérifier les logs** :
   - Les logs montrent que le lien est généré
   - Si le template est configuré, l'email devrait être envoyé automatiquement

3. **Tester l'invitation** :
   - Vérifiez la boîte de réception de `ofmn360@gmail.com` (et les spams)
   - L'email devrait contenir le lien d'invitation

## Si l'email n'est toujours pas envoyé

1. **Vérifier la configuration SMTP** :
   - Supabase Dashboard > Settings > Auth > SMTP Settings
   - Ou configurez un service tiers (SendGrid, Mailgun, Resend, etc.)

2. **Vérifier les logs d'email** :
   - Supabase Dashboard > Logs > Auth logs
   - Cherchez les tentatives d'envoi d'email

3. **Test manuel** :
   - Depuis Supabase Dashboard > Authentication > Users
   - Cliquez sur l'utilisateur
   - Utilisez "Resend invitation" pour tester

## Note pour le développement local

En développement local avec `localhost`, les emails peuvent ne pas être envoyés correctement. Pour tester complètement :
1. Utilisez un domaine de test ou staging
2. Ou testez en production avec un vrai domaine

