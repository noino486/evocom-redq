# Déploiement en production — SaaS Evo-Ecom

Ce guide rassemble toutes les étapes pour livrer une nouvelle version du dashboard Evo-Ecom en production (frontend Vite + Supabase + fonctions Edge). Il sert de checklist à suivre à chaque mise en prod.

---

## 1. Pré-requis

- Node.js 18+ et npm 9+ installés localement.
- Supabase CLI ≥ 1.150 (`supabase --version`).  
  → En cas de besoin, voir `evoecom utils/INSTALL_SUPABASE_CLI.md`.
- Accès au projet Supabase (droits d’édition).
- Accès au fournisseur d’hébergement frontend (Vercel, Netlify, OVH, etc.).
- Compte SendGrid (ou Resend) avec **expéditeur vérifié**.  
  → Pour la configuration détaillée : `docs/readme/README_SENDGRID_SUPABASE.md` et `evoecom utils/CONFIGURER_SENDGRID.md`.
- Secrets/API keys de production (Supabase, SendGrid, ScraperAPI, Webhook…).

---

## 2. Mettre à jour la branche de release

```bash
git checkout main
git pull origin main
npm install
```

Vérifier que tous les commits destinés à la prod sont bien fusionnés sur `main` (ou la branche de release que vous allez déployer).

---

## 3. Vérifier la configuration d’environnement

### 3.1 Frontend (`.env` à la racine du projet)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Ces variables doivent correspondre à l’instance **production** Supabase. Ne jamais commiter ce fichier.

### 3.2 Secrets Supabase (Edge Functions)

Vérifier / mettre à jour les secrets suivants :

```
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_URL=...
SITE_URL=https://app.evoecom.com        # URL du dashboard en prod
SENDGRID_API_KEY=...                   # ou RESEND_API_KEY si Resend
SENDGRID_FROM_EMAIL=noreply@...        # adresse vérifiée SendGrid
SENDGRID_FROM_NAME=EVO ECOM            # optionnel
WEBHOOK_SECRET=...                     # provision-user (si utilisé)
SCRAPERAPI_KEY=...                     # scrape-suppliers (si utilisé)
```

Commande utile :

```bash
supabase secrets list
supabase secrets set NAME=VALUE
```

Pour plus de détails sur chaque clé, voir `evoecom utils/ENV_SETUP.md`.

---

## 4. Contrôles qualité avant déploiement

1. `npm run build` — la build Vite doit réussir (aucune erreur).
2. Vérifier rapidement la console (warnings bloquants).
3. Lister les changements : `git status` pour s’assurer qu’il ne reste rien d’inattendu.
4. Préparer un changelog si nécessaire (fonctionnalités, correctifs).

---

## 5. Déployer les fonctions Supabase

> ⚠️ Toujours déployer avant d’allumer le frontend, pour éviter des incohérences côté API.

```bash
supabase functions deploy create-user
supabase functions deploy provision-user
supabase functions deploy scrape-suppliers
```

Tests rapides post-déploiement :

- `supabase functions list` pour vérifier le statut.
- Consulter `Supabase → Edge Functions → Logs` pendant qu’on déclenche :
  - une invitation d’utilisateur (`create-user`),
  - une création via webhook (`provision-user`),
  - un scraping (si utilisé).

---

## 6. Mettre à jour la base (si nécessaire)

S’il y a de nouvelles migrations/SQL :

1. Se connecter à Supabase Studio → SQL editor.
2. Exécuter les scripts requis dans `docs/sql/` (ex.: `create_pdf_sections_table.sql`).
3. Noter les scripts appliqués dans le changelog de déploiement.

---

## 7. Déployer le frontend

### 7.1 Générer la build

```bash
npm run build
```

Le dossier `dist/` est prêt à être uploadé.

### 7.2 Hébergement

- **Vercel / Netlify** : connecter le dépôt et déclencher un build à partir de la branche `main`.  
  - Variables d’environnement à configurer côté hébergeur (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.).
  - Vérifier les logs de build (`npm run build` doit passer).
- **Hébergement statique** : uploader le contenu de `dist/` via FTP/S3/CI.

### 7.3 Purge du cache

Si CDN activé, purger les caches (Cloudflare, Vercel, Netlify) pour s’assurer que les assets sont à jour.

---

## 8. Vérifications post-déploiement

1. **Connexion** : se connecter avec un compte admin (niveau 4).
2. **Création d’utilisateur** : tester le formulaire admin → l’email d’invitation doit partir (vérifier la boîte mail de test + logs Supabase).
3. **Dashboard Pack** : vérifier l’affichage des ressources PDF, images et fournisseurs.
4. **Reset mot de passe** : déclencher un reset et confirmer la réception de l’email (SendGrid).
5. **Scraper** (si utilisé) : lancer une demande test, vérifier que l’Edge Function répond.
6. Contrôler les logs Supabase pour s’assurer qu’il n’y a pas d’erreurs récurrentes (`Supabase → Logs`).

---

## 9. Communication & suivi

- Mettre à jour la fiche de release (Notion, Jira, Slack…).  
- Partager le changelog et les points d’attention (par ex. “nouvelle gestion des invitations SendGrid”).  
- Prévoir une phase d’observation (quelques heures) pour détecter les anomalies côté clients.

---

## 10. Dépannage rapide

| Problème | Piste |
| -------- | ----- |
| `Failed to send a request to the Edge Function` | Vérifier que `supabase functions serve/deploy` est bien en cours. |
| `SendGrid 403` | L’expéditeur n’est pas vérifié. Voir `README_SENDGRID_SUPABASE.md`. |
| Lien d’invitation invalide | Vérifier `SITE_URL` (doit pointer sur le domaine final). |
| Profil non mis à jour | Consulter la table `user_profiles` et les logs `create-user`. |
| Webhook Thrivecart | Vérifier `WEBHOOK_SECRET` et la documentation `evoecom utils/CONFIGURER_SECRET_WEBHOOK.md`. |

---

## 11. Annexe — Commandes utiles

```bash
# Lister / définir les secrets
supabase secrets list
supabase secrets set NAME=VALUE

# Servir les fonctions en local
supabase functions serve create-user --env-file supabase/.env

# Vérifier les logs (Supabase CLI)
supabase logs functions create-user

# Build frontend
npm run build

# Aperçu local après build
npm run preview
```

---

### Références internes

- `docs/readme/README_SENDGRID_SUPABASE.md`
- `evoecom utils/CONFIGURER_SENDGRID.md`
- `evoecom utils/DEPLOY_EDGE_FUNCTIONS.md`
- `evoecom utils/ENV_SETUP.md`
- `evoecom utils/VERIFIER_LOGS.md`

Ce README peut être enrichi à chaque release (retours d’expérience, nouveaux scripts SQL, nouvelles dépendances). N’hésitez pas à le mettre à jour !

