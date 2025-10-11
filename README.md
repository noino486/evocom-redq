# 🚀 Déploiement Site E-Commerce avec Nginx

Guide complet pour déployer l'application sur une machine Linux avec Nginx.

## 📋 Prérequis

- **Serveur Linux** (Ubuntu 20.04+ / Debian 11+ recommandé)
- **Accès root** au serveur (SSH)
- **Compte Supabase** (pour l'authentification admin)
- **Nom de domaine** configuré (ex: evoecom.com)

> **Note** : Ce guide utilise l'utilisateur **root**. Les commandes `sudo` ne sont pas nécessaires.

## 🎯 Démarrage Rapide

Vous êtes connecté en SSH en tant que **root** ? Parfait ! 

```bash
root@website:~#
```

### 📝 Résumé des étapes

1. **Sur Windows** : Build l'application (`npm run build`)
2. **Sur Linux** : Installer Nginx + outils
3. **Sur Windows** : Upload des fichiers vers le serveur
4. **Sur Linux** : Configurer Nginx
5. **Sur Linux** : Installer le certificat SSL
6. **Tester** : Visiter votre site !

---

## 🔧 Étape 1 : Préparer l'application (sur votre PC Windows)

### 1.1 Ouvrir le projet

Ouvrez PowerShell ou le terminal dans VSCode :

```powershell
cd C:\Users\calyy\OneDrive\Documents\dsds\evocom-redq
```

### 1.2 Installer les dépendances (si pas déjà fait)

```powershell
npm install
```

### 1.3 Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet (s'il n'existe pas déjà) :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

> **Où trouver ces clés** : Dashboard Supabase → Settings → API → Project URL et anon/public key

### 1.4 Build de production

```powershell
npm run build
```

✅ Cela génère un dossier `dist/` avec tous les fichiers statiques optimisés pour la production.

## 🖥️ Étape 2 : Préparer le serveur Linux

### 2.1 Connexion SSH au serveur

Depuis votre machine Windows (PowerShell) :

```powershell
ssh root@votre-ip-serveur
```

Vous devriez voir : `root@website:~#`

### 2.2 Installer les outils nécessaires

```bash
apt update && apt upgrade -y
apt install nginx certbot python3-certbot-nginx git curl -y
```

### 2.3 Installer Node.js 18+ (pour builder si nécessaire)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y
node -v  # Vérifier: devrait afficher v18.x ou plus
npm -v   # Vérifier npm
```

### 2.4 Créer le répertoire de l'application

```bash
mkdir -p /var/www/evoecom
cd /var/www/evoecom
```

### 2.5 Transférer les fichiers (2 options)

**Option A : Build local + Upload depuis Windows**

Depuis votre **machine Windows** (PowerShell), dans le dossier du projet :

```powershell
# 1. Build l'application
npm run build

# 2. Upload vers le serveur
scp -r dist/* root@votre-ip-serveur:/var/www/evoecom/
```

**Option B : Clone + Build sur le serveur**

Sur le **serveur Linux** (si vous avez un repo Git) :

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/evocom-redq.git /tmp/evocom
cd /tmp/evocom

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env
cat > .env << EOF
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
EOF

# 4. Build
npm run build

# 5. Copier les fichiers
cp -r dist/* /var/www/evoecom/

# 6. Nettoyer
cd /
rm -rf /tmp/evocom
```

> **Recommandation** : Utilisez l'Option A (build local) pour éviter d'installer Node.js sur votre serveur de production.

## ⚙️ Étape 3 : Configurer Nginx

### 3.1 Créer le fichier de configuration

```bash
nano /etc/nginx/sites-available/evoecom
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
ln -s /etc/nginx/sites-available/evoecom /etc/nginx/sites-enabled/

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx

# Vérifier le statut
systemctl status nginx
```

## 🔒 Étape 4 : Installer le certificat SSL (HTTPS)

### 4.1 Installer Certbot (si pas déjà fait à l'étape 2.2)

```bash
apt install certbot python3-certbot-nginx -y
```

### 4.2 Obtenir le certificat SSL

```bash
certbot --nginx -d evoecom.com -d www.evoecom.com
```

Suivez les instructions à l'écran. Certbot configurera automatiquement Nginx pour HTTPS.

Quand demandé :
- **Email** : Votre email pour les notifications
- **Accepter les termes** : Yes (Y)
- **Rediriger HTTP vers HTTPS** : Yes (2)

### 4.3 Renouvellement automatique

Le certificat se renouvelle automatiquement. Testez le renouvellement :

```bash
certbot renew --dry-run
```

## 🎯 Étape 5 : Configuration des influenceurs

### Méthode 1 : Via l'interface admin (Recommandée)

1. Accédez à `https://www.evoecom.com/admin`
2. Connectez-vous avec votre compte Supabase
3. Ajoutez vos influenceurs et leurs liens de paiement
4. Sauvegardez

### Méthode 2 : Modifier directement le fichier JSON

```bash
nano /var/www/evoecom/config/affiliates.json
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

### 1. Build la nouvelle version localement (sur Windows)

```powershell
cd C:\Users\calyy\OneDrive\Documents\dsds\evocom-redq
npm run build
```

### 2. Uploader sur le serveur

```powershell
scp -r dist/* root@votre-ip-serveur:/var/www/evoecom/
```

### 3. Recharger Nginx sur le serveur

```bash
nginx -s reload
```

## 📊 Monitoring et Logs

### Voir les logs Nginx

```bash
# Logs d'accès en temps réel
tail -f /var/log/nginx/evoecom_access.log

# Logs d'erreur en temps réel
tail -f /var/log/nginx/evoecom_error.log

# Voir les 50 dernières lignes des erreurs
tail -n 50 /var/log/nginx/evoecom_error.log
```

### Vérifier le statut Nginx

```bash
systemctl status nginx
```

### Redémarrer Nginx si nécessaire

```bash
systemctl restart nginx
```

### Tester la configuration Nginx

```bash
nginx -t
```

## 🛠️ Résolution de problèmes

### Le site ne s'affiche pas
```bash
# Vérifier la config Nginx
nginx -t

# Vérifier que les fichiers existent
ls -la /var/www/evoecom/

# Vérifier que index.html existe
cat /var/www/evoecom/index.html | head -n 5

# Vérifier les logs
tail -n 50 /var/log/nginx/evoecom_error.log

# Redémarrer Nginx
systemctl restart nginx
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
