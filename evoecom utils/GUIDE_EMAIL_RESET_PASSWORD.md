# Guide : Configuration de l'email de réinitialisation de mot de passe

Ce guide vous explique comment configurer le template d'email de réinitialisation de mot de passe dans Supabase.

## 📧 Template HTML

Le fichier `email-reset-password.html` contient le template HTML/CSS complet pour l'email de réinitialisation.

## 🚀 Étapes de configuration dans Supabase

### 1. Accéder aux templates d'email

1. Connectez-vous à votre [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Email Templates**
4. Cliquez sur **"Reset Password"**

### 2. Copier le template HTML

1. Ouvrez le fichier `email-reset-password.html`
2. Copiez tout le contenu HTML (Ctrl+A puis Ctrl+C)

### 3. Coller dans Supabase

1. Dans Supabase, sélectionnez **"Plain Text"** ou **"Rich Text"**
   - Pour le meilleur rendu, utilisez **"Rich Text"** qui supporte le HTML
2. Collez le contenu HTML dans l'éditeur

### 4. Variables Supabase disponibles

Le template utilise ces variables Supabase (disponibles automatiquement) :

- `{{ .ConfirmationURL }}` - Le lien de réinitialisation avec token
- `{{ .Email }}` - L'email de l'utilisateur
- `{{ .SiteURL }}` - L'URL de votre site (si configurée)
- `{{ .Token }}` - Le token de réinitialisation (rarement utilisé directement)
- `{{ .TokenHash }}` - Hash du token (rarement utilisé)

### 5. Personnaliser le template (optionnel)

#### Changer les couleurs

Le template utilise actuellement un gradient violet/rose :
```html
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
```

Pour utiliser vos couleurs du thème :
- Remplacez `#667eea` par votre couleur `primary`
- Remplacez `#764ba2` par votre couleur `secondary`
- Remplacez `#f093fb` par votre couleur `accent`

#### Changer le logo

Pour ajouter un logo, remplacez le titre dans le header par :
```html
<img src="https://votre-domaine.com/logo.png" alt="EvoEcom" style="max-width: 200px; height: auto;">
```

#### Modifier le texte

Vous pouvez personnaliser tous les textes dans le template selon vos besoins.

### 6. Tester l'email

1. Après avoir sauvegardé le template, testez l'envoi :
   - Allez sur votre site > `/login`
   - Cliquez sur "Mot de passe oublié ?"
   - Entrez votre email
   - Vérifiez votre boîte mail

2. Vérifiez que :
   - ✅ Le lien de réinitialisation fonctionne
   - ✅ Le design s'affiche correctement
   - ✅ Les couleurs sont cohérentes avec votre marque

## 📝 Exemple de template simplifié (texte brut)

Si vous préférez une version texte simple :

```
Réinitialisation de mot de passe

Bonjour,

Vous avez demandé à réinitialiser votre mot de passe pour votre compte EvoEcom.

Cliquez sur ce lien pour créer un nouveau mot de passe :
{{ .ConfirmationURL }}

Important : Ce lien est valide pendant 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe EvoEcom

---
Cet email a été envoyé à {{ .Email }}
© 2025 EvoEcom. Tous droits réservés.
```

## 🔒 Sécurité

- ⏰ Le lien expire automatiquement après **1 heure** (configurable dans Supabase)
- 🔐 Le lien ne peut être utilisé **qu'une seule fois**
- ✅ L'email est envoyé uniquement si l'adresse existe dans votre base de données

## 🎨 Personnalisation avancée

### Ajouter des images

Pour ajouter des images à votre email :
```html
<img src="https://votre-domaine.com/image.jpg" 
     alt="Description" 
     style="max-width: 100%; height: auto; border-radius: 8px;">
```

### Ajouter des boutons supplémentaires

Ajoutez d'autres boutons CTA si nécessaire :
```html
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
        <td align="center" style="padding: 10px 0;">
            <a href="https://votre-site.com/help" 
               style="display: inline-block; padding: 12px 24px; background-color: #f3f4f6; color: #374151; text-decoration: none; border-radius: 6px; font-size: 14px;">
                Besoin d'aide ?
            </a>
        </td>
    </tr>
</table>
```

## 📱 Responsive

Le template est déjà optimisé pour mobile :
- Largeur maximale de 600px
- Padding adaptatif
- Texte et boutons redimensionnables

## ⚠️ Notes importantes

1. **CSS inline** : Les emails nécessitent du CSS inline (déjà dans le template)
2. **Images externes** : Utilisez des URLs absolutes pour les images
3. **Testez** : Toujours tester dans plusieurs clients email (Gmail, Outlook, Apple Mail)
4. **Spam** : Vérifiez que l'email n'est pas dans les spams

## 🐛 Dépannage

### L'email n'est pas reçu
- Vérifiez les spams
- Vérifiez la configuration SMTP dans Supabase
- Vérifiez les logs Supabase Dashboard > Logs > Edge Functions

### Le lien ne fonctionne pas
- Vérifiez que `{{ .ConfirmationURL }}` est bien utilisé
- Vérifiez que l'URL de redirection dans le code correspond à votre domaine
- Le lien expire après 1 heure

### Le design ne s'affiche pas
- Certains clients email bloquent le CSS externe (déjà géré avec CSS inline)
- Testez dans différents clients email
- Vérifiez que vous avez collé tout le HTML

