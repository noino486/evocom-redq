# Guide : Configuration de l'email d'invitation (Création de compte)

Ce guide vous explique comment configurer le template d'email d'invitation pour la création de compte dans Supabase.

## 📧 Template HTML

Le fichier `email-invite-user.html` contient le template HTML/CSS complet pour l'email d'invitation.

## 🚀 Étapes de configuration dans Supabase

### 1. Accéder aux templates d'email

1. Connectez-vous à votre [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Email Templates**
4. Cliquez sur **"Invite user"**

### 2. Copier le template HTML

1. Ouvrez le fichier `email-invite-user.html`
2. Copiez tout le contenu HTML (Ctrl+A puis Ctrl+C)

### 3. Coller dans Supabase

1. Dans Supabase, sélectionnez **"Rich Text"** (pour le meilleur rendu HTML)
2. Collez le contenu HTML dans l'éditeur
3. Cliquez sur **"Save"**

### 4. Variables Supabase disponibles

Le template utilise ces variables Supabase (disponibles automatiquement) :

- `{{ .ConfirmationURL }}` - Le lien d'invitation avec token
- `{{ .Email }}` - L'email de l'utilisateur invité
- `{{ .SiteURL }}` - L'URL de votre site (si configurée)
- `{{ .Token }}` - Le token d'invitation (rarement utilisé directement)

### 5. Personnaliser le template (optionnel)

#### Modifier le message de remerciement

Le message "Merci pour votre achat et votre confiance" est dans une div avec fond coloré :
```html
<div style="background: linear-gradient(...);">
    <p style="...">
        🎉 Merci pour votre achat et votre confiance !
    </p>
</div>
```

Vous pouvez le personnaliser selon vos besoins.

#### Ajouter un logo

Pour ajouter un logo dans le header, remplacez le titre par :
```html
<img src="https://votre-domaine.com/logo.png" 
     alt="EvoEcom" 
     style="max-width: 200px; height: auto; margin-bottom: 20px;">
<h1 style="...">
    Vous avez été invité !
</h1>
```

#### Modifier la liste des avantages

La section "Une fois votre compte créé, vous pourrez :" peut être personnalisée :
```html
<ul style="...">
    <li>Accéder à vos produits achetés</li>
    <li>Gérer votre profil et vos paramètres</li>
    <li>Bénéficier d'un support dédié</li>
    <li>Suivre vos formations et contenus</li>
</ul>
```

### 6. Tester l'email

1. Depuis votre dashboard admin :
   - Allez dans **Utilisateurs**
   - Cliquez sur **"Créer un utilisateur"**
   - Entrez un email
   - Cliquez sur **"Envoyer l'invitation"**

2. Vérifiez votre boîte mail et testez que :
   - ✅ L'email est bien reçu
   - ✅ Le lien d'invitation fonctionne
   - ✅ Le design s'affiche correctement
   - ✅ Les couleurs sont cohérentes

## 📝 Exemple de template simplifié (texte brut)

Si vous préférez une version texte simple :

```
Vous avez été invité !

Bonjour,

Merci pour votre achat et votre confiance !

Vous avez été invité à rejoindre notre plateforme EvoEcom. Cliquez sur le lien ci-dessous pour créer votre compte et définir votre mot de passe :

{{ .ConfirmationURL }}

Ce lien est valide pendant 24 heures.

Une fois votre compte créé, vous pourrez :
- Accéder à vos produits achetés
- Gérer votre profil et vos paramètres
- Bénéficier d'un support dédié

Si vous avez des questions, contactez-nous à support@evoecom.com

Cordialement,
L'équipe EvoEcom

---
Cet email a été envoyé à {{ .Email }}
© 2025 EvoEcom. Tous droits réservés.
```

## 🔒 Sécurité

- ⏰ Le lien expire automatiquement après **24 heures** (configurable dans Supabase)
- 🔐 Le lien ne peut être utilisé **qu'une seule fois**
- ✅ L'email est envoyé uniquement aux adresses invitées par les administrateurs

## 🎨 Éléments du template

### Message de remerciement
- Fond dégradé avec les couleurs du thème
- Message "Merci pour votre achat et votre confiance"
- Style visuel attractif

### Bouton CTA principal
- Gradient bleu → violet → rose
- Texte "Créer mon compte"
- Effet d'ombre pour la profondeur

### Informations pratiques
- Liste des avantages après création du compte
- Avertissement sur la validité du lien (24h)
- Lien alternatif en cas de problème

### Footer
- Email du destinataire
- Lien support
- Copyright

## 📱 Responsive

Le template est optimisé pour mobile :
- Largeur maximale de 600px
- Padding adaptatif
- Texte et boutons redimensionnables
- Compatible avec tous les clients email

## ⚠️ Notes importantes

1. **CSS inline** : Les emails nécessitent du CSS inline (déjà dans le template)
2. **Images externes** : Utilisez des URLs absolutes pour les images
3. **Testez** : Toujours tester dans plusieurs clients email (Gmail, Outlook, Apple Mail)
4. **Spam** : Vérifiez que l'email n'est pas dans les spams
5. **Durée de validité** : Le lien expire après 24h (configurable dans Supabase)

## 🐛 Dépannage

### L'email n'est pas reçu
- Vérifiez les spams
- Vérifiez la configuration SMTP dans Supabase
- Vérifiez les logs Supabase Dashboard > Logs > Edge Functions
- Vérifiez que l'email n'existe pas déjà dans Supabase Auth

### Le lien ne fonctionne pas
- Vérifiez que `{{ .ConfirmationURL }}` est bien utilisé
- Vérifiez que l'URL de redirection dans le code correspond à votre domaine
- Le lien expire après 24 heures
- Le lien ne peut être utilisé qu'une seule fois

### Le design ne s'affiche pas
- Certains clients email bloquent le CSS externe (déjà géré avec CSS inline)
- Testez dans différents clients email
- Vérifiez que vous avez collé tout le HTML
- Vérifiez que vous utilisez "Rich Text" et non "Plain Text"

### Le message de remerciement ne s'affiche pas
- Vérifiez la syntaxe HTML dans la div
- Certains clients email peuvent ne pas supporter les emojis (le 🎉 peut ne pas s'afficher)

## 🔄 Workflow complet

1. **Client achète** → Webhook appelé → Utilisateur créé avec `is_active = false`
2. **Admin invite** → Edge Function `create-user` appelée → Email envoyé via Supabase
3. **Utilisateur reçoit l'email** → Clique sur "Créer mon compte"
4. **Redirection vers `/login?invited=true`** → Formulaire de création de mot de passe
5. **Utilisateur définit son mot de passe** → `is_active = true` → Accès au dashboard

## 📧 Personnalisation supplémentaire

### Ajouter des images produit

Si vous voulez montrer les produits dans l'email :
```html
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
    <tr>
        <td align="center">
            <img src="https://votre-domaine.com/products/hero.jpg" 
                 alt="Produits EvoEcom" 
                 style="max-width: 100%; height: auto; border-radius: 8px;">
        </td>
    </tr>
</table>
```

### Ajouter un calendrier de formation

Pour mentionner les dates importantes :
```html
<div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0 0 10px; color: #0c4a6e; font-weight: 600;">
        📅 Prochaines étapes
    </p>
    <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
        Vos formations commenceront dès que vous aurez créé votre compte.
    </p>
</div>
```

