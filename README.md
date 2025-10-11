# 🚀 Déploiement Site E-Commerce avec Nginx

Guide complet pour déployer l'application sur une machine Linux avec Nginx.

## 📋 Prérequis

- **Serveur Linux** (Ubuntu 20.04+ / Debian 11+ recommandé)
- **Node.js** 18+ et npm
- **Nginx** installé
- **Compte Supabase** (pour l'authentification admin)
- **Nom de domaine** configuré (ex: evoecom.com)

## 🔧 Étape 1 : Préparer l'application

### 1.1 Cloner le projet sur votre machine locale

```bash
git clone <votre-repo>
cd evocom-redq
```

### 1.2 Installer les dépendances

```bash
npm install
```

### 1.3 Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

> **Note** : Récupérez ces informations depuis votre dashboard Supabase → Settings → API

### 1.4 Build de production

```bash
npm run build
```

Cela génère un dossier `dist/` avec tous les fichiers statiques optimisés.

## 🖥️ Étape 2 : Préparer le serveur Linux

### 2.1 Installer Nginx (si pas déjà installé)

```bash
sudo apt update
sudo apt install nginx -y
```

### 2.2 Créer le répertoire de l'application

```bash
sudo mkdir -p /var/www/evoecom
sudo chown -R $USER:$USER /var/www/evoecom
```

### 2.3 Transférer les fichiers

Depuis votre machine locale, uploadez le dossier `dist/` :

```bash
# Avec rsync
rsync -avz dist/ user@votre-serveur:/var/www/evoecom/

# Ou avec SCP
scp -r dist/* user@votre-serveur:/var/www/evoecom/
```

## ⚙️ Étape 3 : Configurer Nginx

### 3.1 Créer le fichier de configuration

```bash
sudo nano /etc/nginx/sites-available/evoecom
```

### 3.2 Ajouter cette configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name evoecom.com www.evoecom.com;
    root /var/www/evoecom;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Cache des assets statiques
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Routing React - rediriger toutes les routes vers index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logs
    access_log /var/log/nginx/evoecom_access.log;
    error_log /var/log/nginx/evoecom_error.log;
}
```

### 3.3 Activer le site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/evoecom /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

## 🔒 Étape 4 : Installer le certificat SSL (HTTPS)

### 4.1 Installer Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 4.2 Obtenir le certificat SSL

```bash
sudo certbot --nginx -d evoecom.com -d www.evoecom.com
```

Suivez les instructions à l'écran. Certbot configurera automatiquement Nginx pour HTTPS.

### 4.3 Renouvellement automatique

Le certificat se renouvelle automatiquement. Testez le renouvellement :

```bash
sudo certbot renew --dry-run
```

## 🎯 Étape 5 : Configuration des influenceurs

### Méthode 1 : Via l'interface admin (Recommandée)

1. Accédez à `https://www.evoecom.com/admin`
2. Connectez-vous avec votre compte Supabase
3. Ajoutez vos influenceurs et leurs liens de paiement
4. Sauvegardez

### Méthode 2 : Modifier directement le fichier JSON

```bash
sudo nano /var/www/evoecom/config/affiliates.json
```

Structure du fichier :

```json
{
  "affiliates": {
    "BENJAMIN": {
      "STFOUR": "https://lien-paiement-benjamin-pack1.com",
      "GLBNS": "https://lien-paiement-benjamin-pack2.com"
    },
    "MARIE": {
      "STFOUR": "https://lien-paiement-marie-pack1.com",
      "GLBNS": "https://lien-paiement-marie-pack2.com"
    }
  },
  "defaultPages": {
    "STFOUR": "https://lien-paiement-defaut-pack1.com",
    "GLBNS": "https://lien-paiement-defaut-pack2.com"
  }
}
```

**Codes produits** :
- `STFOUR` = Pack Global Sourcing (29.90€)
- `GLBNS` = Pack Global Business (39.90€)

## 🔐 Étape 6 : Sécurité Supabase

### 6.1 Créer un utilisateur admin

Dans le dashboard Supabase :
1. **Authentication** → **Users** → **Add user**
2. Email : `admin@evoecom.com`
3. Password : [mot de passe fort]
4. ✅ Auto Confirm User

### 6.2 Désactiver les inscriptions publiques

1. **Authentication** → **Settings**
2. **Disable Sign-up** : ✅ ON
3. Sauvegarder

### 6.3 Configurer les URL autorisées

Dans **Authentication** → **URL Configuration** :
```
Site URL: https://www.evoecom.com
Redirect URLs: https://www.evoecom.com/*
```

## 🧪 Tester l'installation

### Tester le site principal
```
https://www.evoecom.com/
```

### Tester avec un code influenceur
```
https://www.evoecom.com/?AF=BENJAMIN
```
→ Vous devriez voir un badge vert "Code partenaire actif : BENJAMIN"

### Tester l'admin
```
https://www.evoecom.com/admin
```
→ Page de connexion sécurisée

## 🔄 Mettre à jour l'application

### 1. Build la nouvelle version localement

```bash
npm run build
```

### 2. Uploader sur le serveur

```bash
rsync -avz --delete dist/ user@votre-serveur:/var/www/evoecom/
```

### 3. Vider le cache Nginx (optionnel)

```bash
sudo nginx -s reload
```

## 📊 Monitoring et Logs

### Voir les logs Nginx

```bash
# Logs d'accès
sudo tail -f /var/log/nginx/evoecom_access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/evoecom_error.log
```

### Vérifier le statut Nginx

```bash
sudo systemctl status nginx
```

### Redémarrer Nginx si nécessaire

```bash
sudo systemctl restart nginx
```

## 🛠️ Résolution de problèmes

### Le site ne s'affiche pas
```bash
# Vérifier la config Nginx
sudo nginx -t

# Vérifier les permissions
ls -la /var/www/evoecom/

# Vérifier les logs
sudo tail -n 50 /var/log/nginx/evoecom_error.log
```

### Erreur 404 sur les routes React
→ Vérifiez que `try_files $uri $uri/ /index.html;` est bien dans la config Nginx

### L'admin ne fonctionne pas
→ Vérifiez que les variables d'environnement Supabase sont correctes dans le build

### Les redirections AF ne marchent pas
→ Vérifiez que le fichier `/var/www/evoecom/config/affiliates.json` existe et est valide

## 📁 Structure des fichiers sur le serveur

```
/var/www/evoecom/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── config/
│   └── affiliates.json
├── 1.jpg, 2.jpg, ... (images)
└── favicon.svg, logo.-evo-banniere.svg
```

## 🎯 Optimisations recommandées

### Activer le cache navigateur
Déjà configuré dans la config Nginx ci-dessus ✅

### Activer HTTP/2
```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
```

### Limiter le rate limiting (anti-DDoS)
```nginx
limit_req_zone $binary_remote_addr zone=limitzone:10m rate=10r/s;
limit_req zone=limitzone burst=20;
```

---

**Votre site est maintenant déployé et sécurisé ! 🎉**

Support : contact@evoecom.com
