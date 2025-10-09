# 🔐 Configuration Supabase pour l'Administration

Guide complet pour configurer l'authentification Supabase sur votre page admin.

## 📋 Table des Matières

1. [Créer un projet Supabase](#1-créer-un-projet-supabase)
2. [Configuration locale](#2-configuration-locale)
3. [Créer un utilisateur admin](#3-créer-un-utilisateur-admin)
4. [Configuration en production](#4-configuration-en-production)
5. [Sécurité avancée](#5-sécurité-avancée)
6. [Dépannage](#6-dépannage)

---

## 1. Créer un Projet Supabase

### Étape 1 : Inscription

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"**
3. Inscrivez-vous avec votre email ou GitHub

### Étape 2 : Créer un nouveau projet

1. Cliquez sur **"New Project"**
2. Remplissez les informations :
   - **Name** : `evocom-admin` (ou votre choix)
   - **Database Password** : Générez un mot de passe fort
   - **Region** : Choisissez le plus proche de vous
   - **Pricing Plan** : Free (suffisant pour commencer)
3. Cliquez sur **"Create new project"**
4. Attendez 2-3 minutes que le projet se crée

### Étape 3 : Récupérer les clés API

1. Dans le dashboard, allez dans **Settings** (icône engrenage) → **API**
2. Vous verrez deux informations importantes :
   - **Project URL** : `https://xxx.supabase.co`
   - **anon/public key** : `eyJhbGci...` (longue chaîne)

⚠️ **IMPORTANT** : Ne partagez JAMAIS ces clés publiquement !

---

## 2. Configuration Locale

### Créer le fichier `.env`

À la racine de votre projet, créez un fichier `.env` :

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vérifier le `.gitignore`

Assurez-vous que `.env` est bien ignoré par git :

```gitignore
# Variables d'environnement
.env
.env.local
.env.production
```

### Tester en local

1. Redémarrez votre serveur de développement :
```bash
npm run dev
```

2. Allez sur `http://localhost:5173/admin`
3. Vous devriez voir le formulaire de connexion Supabase

---

## 3. Créer un Utilisateur Admin

### Option A : Via l'interface Supabase (Recommandé)

1. Dans le dashboard Supabase, allez dans **Authentication** → **Users**
2. Cliquez sur **"Add user"** → **"Create new user"**
3. Remplissez :
   - **Email** : `admin@votredomaine.com`
   - **Password** : Générez un mot de passe fort
   - **Auto Confirm User** : ✅ Activé
4. Cliquez sur **"Create user"**

### Option B : Via le code (programmatique)

Si vous voulez créer un utilisateur via le code, créez un fichier temporaire `create-admin.js` :

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://votre-projet.supabase.co',
  'votre-service-role-key' // ⚠️ Ne jamais commiter cette clé
)

async function createAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@example.com',
    password: 'votre-mot-de-passe-securise',
    email_confirm: true
  })

  if (error) {
    console.error('Erreur:', error)
  } else {
    console.log('Admin créé:', data)
  }
}

createAdmin()
```

Puis lancez :
```bash
node create-admin.js
```

**⚠️ Supprimez ce fichier après utilisation !**

---

## 4. Configuration en Production

### Sur Netlify

1. Allez dans **Site settings** → **Environment variables**
2. Ajoutez les variables :

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://votre-projet.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |

3. Redéployez votre site

### Sur Vercel

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez les mêmes variables que ci-dessus
3. Redéployez

### Sur d'autres plateformes

Consultez la documentation de votre hébergeur pour ajouter des variables d'environnement.

---

## 5. Sécurité Avancée

### Activer l'email de confirmation

1. Dans Supabase, allez dans **Authentication** → **Settings**
2. **Enable email confirmations** : ✅ Activé
3. Les nouveaux utilisateurs devront confirmer leur email

### Désactiver les inscriptions publiques

1. Dans **Authentication** → **Settings**
2. **Enable signup** : ❌ Désactivé
3. Seuls les admins pourront créer des comptes

### Activer le Rate Limiting

1. Dans **Authentication** → **Settings** → **Rate Limits**
2. Configurez :
   - **Email sends per hour** : 3
   - **SMS sends per hour** : 3
3. Protège contre les attaques par force brute

### Configurer les Row Level Security (RLS)

Si vous voulez stocker la configuration des influenceurs dans Supabase :

```sql
-- Créer une table pour les influenceurs
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  stfour_link TEXT NOT NULL,
  glbns_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique
CREATE POLICY "Tout le monde peut lire"
ON affiliates FOR SELECT
TO public
USING (true);

-- Politique : Seuls les utilisateurs authentifiés peuvent modifier
CREATE POLICY "Seuls les admins peuvent modifier"
ON affiliates FOR ALL
TO authenticated
USING (true);
```

### Configurer les emails personnalisés

1. Dans **Authentication** → **Email Templates**
2. Personnalisez les emails :
   - Confirmation email
   - Magic link
   - Password reset

---

## 6. Dépannage

### Erreur : "Invalid API key"

✅ **Solution** : 
- Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont bien définis
- Redémarrez le serveur après avoir créé `.env`

### Erreur : "Email not confirmed"

✅ **Solution** :
- Dans Supabase, allez dans **Authentication** → **Users**
- Trouvez l'utilisateur et cliquez sur **"Confirm email"**

### L'utilisateur ne peut pas se connecter

✅ **Solution** :
1. Vérifiez que le mot de passe est correct
2. Vérifiez que l'email est confirmé
3. Vérifiez les logs dans **Authentication** → **Logs**

### Variables d'environnement non chargées en production

✅ **Solution** :
- Sur Netlify/Vercel : Vérifiez que les variables sont bien ajoutées
- Redéployez après avoir ajouté les variables
- Les variables avec le préfixe `VITE_` sont accessibles côté client

### "User not found" en production mais ça marche en local

✅ **Solution** :
- Vous utilisez peut-être deux projets Supabase différents
- Vérifiez que les URLs correspondent
- Créez l'utilisateur admin dans le bon projet

---

## 🎯 Checklist de Déploiement

Avant de déployer en production :

- [ ] Projet Supabase créé
- [ ] Utilisateur admin créé et email confirmé
- [ ] Variables d'environnement configurées localement (`.env`)
- [ ] Variables d'environnement configurées sur l'hébergeur
- [ ] `.env` ajouté au `.gitignore`
- [ ] Inscriptions publiques désactivées
- [ ] Rate limiting activé
- [ ] Test de connexion en local réussi
- [ ] Test de connexion en production réussi

---

## 🔒 Bonnes Pratiques

### ✅ À FAIRE
- Utiliser un email professionnel pour l'admin
- Activer 2FA sur votre compte Supabase
- Changer régulièrement le mot de passe admin
- Surveiller les logs d'authentification
- Faire des backups de la configuration

### ❌ À ÉVITER
- Ne jamais commiter `.env`
- Ne jamais partager l'`anon key` publiquement (même si elle est "publique")
- Ne jamais utiliser la `service_role_key` côté client
- Ne pas réutiliser le mot de passe admin ailleurs

---

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Dashboard](https://app.supabase.com)
- [Guide de sécurité Supabase](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-policies)

---

## 🆘 Besoin d'Aide ?

1. Consultez les [logs Supabase](https://app.supabase.com) (Authentication → Logs)
2. Vérifiez la [console du navigateur](F12) pour les erreurs
3. Consultez la [communauté Supabase](https://github.com/supabase/supabase/discussions)

---

**Dernière mise à jour** : Octobre 2024  
**Version** : 1.0

