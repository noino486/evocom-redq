## Gestion SSL pour evoecom.com

Ce guide resume la mise en place et la maintenance du certificat SSL Let’s Encrypt pour `evoecom.com`.

### Apercu
- Fournisseur : Let’s Encrypt (Certbot)
- Certificat : ECDSA couvrant `evoecom.com` et `www.evoecom.com`
- Chemins : `fullchain.pem` et `privkey.pem` sous `/etc/letsencrypt/live/evoecom.com/`
- Renouvellement : automatique via `certbot renew`

### Pre requis
- Acces SSH sudo au serveur qui heberge Nginx ou Apache.
- `certbot` installe depuis le depot officiel ou via snap.
- Ports 80 et 443 ouverts.

### Installation initiale
1. Installer Certbot :
   - Ubuntu (snap) : `sudo snap install --classic certbot`
   - Debian/Ubuntu (apt) : `sudo apt install certbot`
2. Executer la creation du certificat :
   - Nginx : `sudo certbot --nginx -d evoecom.com -d www.evoecom.com`
   - Apache : `sudo certbot --apache -d evoecom.com -d www.evoecom.com`
3. Verifier que la configuration du serveur web utilise :
   ```
   ssl_certificate /etc/letsencrypt/live/evoecom.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/evoecom.com/privkey.pem;
   ```
4. Recharger le serveur web : `sudo systemctl reload nginx` (ou apache2).

### Renouvellement
- Certbot installe un timer systemd (`certbot.timer`) qui verifie deux fois par jour.
- Pour tester manuellement : `sudo certbot renew --dry-run`.
- Apres un renouvellement effectif, recharger le serveur web.

### Verification
- Ligne de commande : `curl -Iv https://evoecom.com`
- Outils externes : SSL Labs (https://www.ssllabs.com/ssltest/) pour confirmer la chaine.
- Sur une machine cliente, verifier l’heure et la date systeme si le navigateur signale `ERR_CERT_DATE_INVALID`.

### Depannage courant
- **Ancien certificat charge** : le service web n’a pas ete relance. Executer `sudo systemctl reload nginx`.
- **Chaine incomplete** : s’assurer que la directive `ssl_certificate` pointe vers `fullchain.pem`.
- **Let’s Encrypt rate le renouvellement** : consulter `/var/log/letsencrypt/letsencrypt.log`.
- **Plusieurs frontaux ou CDN** : deplacer les nouveaux certificats sur toutes les instances, puis recharger chaque service.

### Automatisation
- Ajouter une verification mensuelle : `sudo systemctl list-timers | grep certbot`.
- (Optionnel) Configurer une alerte (cron + mail ou outil de supervision) qui surveille la date d’expiration via `openssl x509 -enddate -noout -in /etc/letsencrypt/live/evoecom.com/fullchain.pem`.

### Ressources
- Documentation Certbot : https://certbot.eff.org/
- Troubleshooting Let’s Encrypt : https://letsencrypt.org/docs/

