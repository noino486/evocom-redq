# Configuration Supabase ✕ SendGrid

Ce guide explique comment connecter Supabase à SendGrid afin d'envoyer les e-mails d'invitation, de connexion magique et de reset de mot de passe.

---

## 1. Côté SendGrid

1. **Créer / valider votre compte** sur https://sendgrid.com.
2. **Authentifier un expéditeur** :
   - *Single Sender Verification* (rapide, parfait pour tests).
   - *Domain Authentication* (recommandé en production – implique des enregistrements DNS CNAME à ajouter et valider).
3. **Générer une clé API** :
   - Menu *Settings → API Keys → Create API Key*.
   - Choisir un nom (ex. `Supabase SMTP`), section **Mail Send**, niveau `Full Access`.
   - Copier la clé (elle ne sera plus visible ensuite).

Gardez les éléments suivants :
- `API Key` (mot de passe SMTP)
- Adresse d'expédition validée (`from`)

---

## 2. Paramétrer Supabase

### Dashboard Supabase (hébergé)
1. Ouvrir votre projet dans https://app.supabase.com.
2. Aller dans **Auth → Settings → Email templates → SMTP Settings**.
3. Renseigner :
   - **SMTP Host** : `smtp.sendgrid.net`
   - **SMTP Port** : `587` (ou `465` si vous forcez SSL)
   - **SMTP Username** : `apikey` *(valeur littérale imposée par SendGrid)*
   - **SMTP Password** : la clé API créée à l'étape 1
   - **Sender Email** : votre adresse expéditeur validée
   - **Sender Name** : nom d'expéditeur (ex. `EvoEcom`)

### Projet auto-hébergé / Supabase CLI
Définir les variables d'environnement (fichier `.env` ou configuration Docker) :

```env
SUPABASE_SMTP_HOST=smtp.sendgrid.net
SUPABASE_SMTP_PORT=587
SUPABASE_SMTP_USER=apikey
SUPABASE_SMTP_PASS=<votre_cle_api_sendgrid>
SUPABASE_SMTP_SENDER=noreply@votredomaine.com
SUPABASE_SMTP_ADMIN_EMAIL=admin@votredomaine.com
```

> ⚠️ L'adresse `SUPABASE_SMTP_SENDER` doit être exactement celle validée dans SendGrid (Single Sender ou domaine authentifié).

---

## 3. Tests & Dépannage

1. Dans **Auth → Users**, inviter un utilisateur ou utiliser "Send magic link" pour déclencher un e-mail.
2. Vérifier l’onglet *Activity* sur SendGrid pour confirmer la livraison.
3. En cas d’échec :
   - Vérifier que le domaine / single sender est **verified** dans SendGrid.
   - Régénérer la clé API et la recoller dans Supabase.
   - S’assurer que le port 587 est ouvert (ou passer en 465 avec SSL).
   - Regarder les logs Supabase (`Logs → Auth`) pour trouver le message d’erreur exact.

---

## 4. Ressources Complémentaires
- [Doc officielle Supabase – SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Doc SendGrid – SMTP Relay](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- Guides internes du dépôt : `CONFIGURER_SENDGRID.md`, `CONFIGURER_EMAIL_INVITATION.md`.

---

Votre projet Supabase enverra désormais les e-mails via SendGrid.🎉
