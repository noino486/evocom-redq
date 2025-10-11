# Guide de Déploiement - Serveur Linux avec Nginx

Ce guide explique comment déployer l'application Evocom sur un serveur Linux de production avec Nginx.

## Prérequis

- Un serveur Linux (Ubuntu 20.04+ ou Debian 10+ recommandé)
- Accès root ou sudo
- Un nom de domaine pointant vers votre serveur
- Accès SSH au serveur

## 1. Connexion au Serveur

```bash
ssh votre_utilisateur@votre_serveur_ip
```

## 2. Installation des Dépendances

### Mise à jour du système
```bash
sudo apt update
sudo apt upgrade -y
```

### Installation de Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Installation de Node.js (version 18+)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
node --version
npm --version
```

### Installation de Git
```bash
sudo apt install git -y
```

## 3. Configuration du Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## 4. Clonage et Build du Projet

### Créer un répertoire pour l'application
```bash
sudo mkdir -p /var/www/evocom
sudo chown -R $USER:$USER /var/www/evocom
cd /var/www/evocom
```

### Cloner le repository
```bash
git clone https://github.com/votre-username/evocom-redq.git .
```

### Créer le fichier .env
```bash
nano .env
```

Ajouter vos variables d'environnement :
```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_supabase
```

Sauvegarder avec `Ctrl + X`, puis `Y`, puis `Enter`.

### Installer les dépendances et build
```bash
npm install
npm run build
```

Le build sera créé dans le dossier `dist/`.

## 5. Configuration de Nginx

### Créer le fichier de configuration
```bash
sudo nano /etc/nginx/sites-available/evocom
```

Ajouter la configuration suivante :

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name votre-domaine.com www.votre-domaine.com;
    
    root /var/www/evocom/dist;
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
    
    # Route principale - SPA configuration
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

**Remplacez** `votre-domaine.com` par votre nom de domaine réel.

Sauvegarder avec `Ctrl + X`, puis `Y`, puis `Enter`.

### Activer le site
```bash
sudo ln -s /etc/nginx/sites-available/evocom /etc/nginx/sites-enabled/
```

### Tester la configuration
```bash
sudo nginx -t
```

Si tout est OK, vous verrez :
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Redémarrer Nginx
```bash
sudo systemctl restart nginx
```

## 6. Installation de SSL avec Let's Encrypt (HTTPS)

### Installer Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtenir le certificat SSL
```bash
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

Suivez les instructions :
- Entrez votre email
- Acceptez les conditions
- Choisissez de rediriger HTTP vers HTTPS (option 2)

Le certificat sera automatiquement renouvelé. Pour tester le renouvellement :
```bash
sudo certbot renew --dry-run
```

## 7. Vérification

Visitez votre site : `https://votre-domaine.com`

L'application devrait être accessible et fonctionnelle !

## 8. Mises à Jour de l'Application

Pour déployer une nouvelle version :

```bash
cd /var/www/evocom
git pull origin main
npm install
npm run build
sudo systemctl restart nginx
```

### Script de déploiement automatique (optionnel)

Créer un script de déploiement :
```bash
nano ~/deploy-evocom.sh
```

Contenu du script :
```bash
#!/bin/bash
set -e

echo "🚀 Déploiement d'Evocom..."

cd /var/www/evocom

echo "📥 Récupération des dernières modifications..."
git pull origin main

echo "📦 Installation des dépendances..."
npm install

echo "🏗️  Build de l'application..."
npm run build

echo "🔄 Redémarrage de Nginx..."
sudo systemctl restart nginx

echo "✅ Déploiement terminé avec succès !"
```

Rendre le script exécutable :
```bash
chmod +x ~/deploy-evocom.sh
```

Pour déployer, exécutez simplement :
```bash
~/deploy-evocom.sh
```

## 9. Surveillance et Logs

### Voir les logs Nginx
```bash
# Logs d'accès
sudo tail -f /var/log/nginx/access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/error.log
```

### Vérifier le statut de Nginx
```bash
sudo systemctl status nginx
```

## 10. Optimisations Supplémentaires (Optionnel)

### Augmenter les limites de connexion
```bash
sudo nano /etc/nginx/nginx.conf
```

Dans la section `http`, ajouter :
```nginx
worker_processes auto;
worker_connections 2048;
```

### Configuration de la mémoire cache
Dans `/etc/nginx/nginx.conf`, dans la section `http` :
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;
```

Redémarrer Nginx après les modifications :
```bash
sudo systemctl restart nginx
```

## 11. Sauvegardes (Recommandé)

### Script de sauvegarde
```bash
nano ~/backup-evocom.sh
```

Contenu :
```bash
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "💾 Sauvegarde d'Evocom..."

tar -czf $BACKUP_DIR/evocom_$DATE.tar.gz /var/www/evocom

echo "✅ Sauvegarde créée : evocom_$DATE.tar.gz"

# Supprimer les sauvegardes de plus de 30 jours
find $BACKUP_DIR -name "evocom_*.tar.gz" -mtime +30 -delete
```

Rendre exécutable :
```bash
chmod +x ~/backup-evocom.sh
```

### Automatiser les sauvegardes avec cron
```bash
crontab -e
```

Ajouter pour une sauvegarde quotidienne à 2h du matin :
```
0 2 * * * /home/votre_utilisateur/backup-evocom.sh
```

## Alternative : Déploiement avec PM2 et Serve

Si vous préférez utiliser PM2 pour servir votre application (au lieu de Nginx uniquement), voici comment faire :

### Installation de PM2 et Serve
```bash
sudo npm install -g pm2 serve
```

### Créer un fichier ecosystem pour PM2
```bash
cd /var/www/evocom
nano ecosystem.config.js
```

Contenu :
```javascript
module.exports = {
  apps: [{
    name: 'evocom',
    script: 'serve',
    args: 'dist -l 3000',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Démarrer l'application avec PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Copiez et exécutez la commande que PM2 vous donne pour le démarrage automatique.

### Configuration Nginx comme reverse proxy
Modifier `/etc/nginx/sites-available/evocom` :

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name votre-domaine.com www.votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Redémarrer Nginx :
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Commandes PM2 utiles
```bash
# Voir les applications en cours
pm2 list

# Voir les logs
pm2 logs evocom

# Redémarrer l'application
pm2 restart evocom

# Arrêter l'application
pm2 stop evocom

# Monitoring en temps réel
pm2 monit
```

### Mise à jour avec PM2
```bash
cd /var/www/evocom
git pull origin main
npm install
npm run build
pm2 restart evocom
```

### Script de déploiement avec PM2
```bash
nano ~/deploy-evocom-pm2.sh
```

Contenu :
```bash
#!/bin/bash
set -e

echo "🚀 Déploiement d'Evocom (PM2)..."

cd /var/www/evocom

echo "📥 Récupération des dernières modifications..."
git pull origin main

echo "📦 Installation des dépendances..."
npm install

echo "🏗️  Build de l'application..."
npm run build

echo "🔄 Redémarrage PM2..."
pm2 restart evocom

echo "✅ Déploiement terminé avec succès !"
pm2 logs evocom --lines 20
```

Rendre exécutable :
```bash
chmod +x ~/deploy-evocom-pm2.sh
```

### Avantages de PM2
- ✅ Monitoring intégré avec `pm2 monit`
- ✅ Logs centralisés
- ✅ Redémarrage automatique en cas de crash
- ✅ Gestion de plusieurs applications Node.js
- ✅ Zero-downtime reload

### Inconvénients de PM2 (pour une SPA statique)
- ❌ Couche supplémentaire (moins performant que Nginx seul)
- ❌ Consomme plus de ressources mémoire
- ❌ Moins optimisé pour servir des fichiers statiques

**Recommandation** : Pour une application React statique, **Nginx seul est préférable** (méthode du guide principal). Utilisez PM2 si vous avez également des APIs Node.js sur le même serveur.

---

## Dépannage

### Le site ne s'affiche pas
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Erreur 403 Forbidden
```bash
sudo chown -R www-data:www-data /var/www/evocom/dist
sudo chmod -R 755 /var/www/evocom/dist
```

### Les variables d'environnement ne fonctionnent pas
Vérifiez que le fichier `.env` existe et reconstruisez :
```bash
cd /var/www/evocom
cat .env
npm run build
```

### Problème de routing (404 sur les sous-pages)
Vérifiez que la directive `try_files` est présente dans la configuration Nginx :
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## Support

Pour toute question ou problème :
1. Vérifiez les logs Nginx
2. Vérifiez la console du navigateur
3. Vérifiez les logs de Supabase si problème de connexion

---

**Note de sécurité** : 
- Changez régulièrement vos clés Supabase
- Gardez votre système à jour : `sudo apt update && sudo apt upgrade`
- Surveillez les logs régulièrement
- Configurez un pare-feu approprié
- Utilisez toujours HTTPS en production

