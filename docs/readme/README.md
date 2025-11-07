# EvoEcom – Packs Digitaux & Dashboard

## Aperçu

EvoEcom est une application React/Vite tout-en-un qui combine :

- **Un site marketing public** présentant deux packs digitaux (Global Sourcing & Global Business) avec pages produits détaillées, storytelling, témoignages et suivi des clics.
- **Un dashboard sécurisé** réservé aux clients et administrateurs pour consulter les packs, afficher des ressources PDF, gérer les fournisseurs (scraping et ajout manuel), suivre les statistiques et piloter les affiliés.

Le front s'appuie sur Supabase pour l'authentification, la gestion de contenu, le tracking et les edge functions (scraping fournisseurs, provisioning utilisateur, etc.).

## Stack principale

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) (ES modules, HMR)
- [Tailwind CSS 3](https://tailwindcss.com/) pour le design responsive
- [Framer Motion](https://www.framer.com/motion/) pour les animations
- [Supabase](https://supabase.com/) : Auth, base de données Postgres, edge functions, RLS
- [SendGrid](https://sendgrid.com/) (via Supabase) pour l’envoi d’emails transactionnels
- [React Router 6](https://reactrouter.com/) pour la navigation
- [React Icons](https://react-icons.github.io/react-icons/) & Lucide pour l’iconographie

## Fonctionnalités clés

### Site public
- Page d’accueil immersive (`src/pages/Home.jsx`) avec sections modulaires (Héros, Packs, Process, Discord, WhatsApp, FOMO, etc.).
- Composant `Products` avec cartes animées, tarifs barrés et CTA.
- Page produit (`src/pages/ProductDetail.jsx`) avec bénéfices détaillés, cross-sell et CTA d’achat.
- Tracking global des clics (affiliés, pages, sources) via Supabase (`useGlobalClickTracker`).

### Dashboard
- Layout responsive avec sidebar compacte et navigation par rôle (`src/components/DashboardLayout.jsx`).
- Packs Global Sourcing & Global Business (`DashboardPack.jsx`) :
  - Gestion de sections PDF par catégorie (Expatriation, Revenue Actif/Passif) avec viewer Gamma en plein écran.
  - Cartes de catégories fournisseurs illustrées (images `public/categories`) et modules de protection anti-copie.
  - Filtres dynamiques (pays, vedettes, favoris) et rendu par pack.
- Scraper fournisseurs (`DashboardScraper.jsx`) :
  - Lancement/arrêt de jobs edge function (`supabase/functions/scrape-suppliers`).
  - Formulaire d’ajout manuel, édition inline, publication vers pack business.
  - Tableau responsive avec sélection multiple et actions groupées.
- Statistiques utilisateurs (`DashboardStats.jsx`) : cartes synthétiques, répartition par niveaux.
- Autres pages : produits, PDF sections, utilisateurs, affiliés, paramètres.

### Supabase & Backend
- Tables essentielles : `user_profiles`, `pack_sections`, `suppliers`, `pdf_sections`, `link_clicks`, `favorites`, etc.
- Scripts SQL versionnés (dossier `sql/` + racine) pour créer/mettre à jour les tables et RLS.
- Edge functions TypeScript (`supabase/functions/*`) :
  - `create-user` / `provision-user` pour gérer l’onboarding.
  - `scrape-suppliers` pour orchestrer le scraping via API externe.

## Prérequis

- Node.js 18+ & npm
- Un projet Supabase configuré (URL + clé Anon et Service Role)
- Un compte SendGrid validé (Single Sender ou Domain Auth)
- Supabase CLI (facultatif mais recommandé pour déployer les edge functions)

## Installation & lancement

```bash
# cloner le dépôt
git clone <url-du-repo>
cd Saas\ Evo-Ecom

# installer les dépendances
npm install

# lancer le serveur de dev (http://localhost:5173)
npm run dev

# build production
npm run build

# prévisualiser le build
npm run preview
```

## Variables d’environnement

Créer un fichier `.env` à la racine (copier depuis `.env.example` si nécessaire) :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

> Ces variables alimentent le client Supabase (`src/config/supabase.js`) et les appels edge functions (scraper).

### Supabase (en self-host ou CLI)

Si vous utilisez Supabase CLI / Docker, ajoutez également :

```env
SUPABASE_SMTP_HOST=smtp.sendgrid.net
SUPABASE_SMTP_PORT=587
SUPABASE_SMTP_USER=apikey
SUPABASE_SMTP_PASS=<clé-api-sendgrid>
SUPABASE_SMTP_SENDER=noreply@votredomaine.com
SUPABASE_SMTP_ADMIN_EMAIL=noreply@votredomaine.com
```

## Configuration Supabase

1. **Base de données** : exécuter les scripts SQL fournis pour créer les tables et politiques RLS. Les scripts principaux :
   - `sql/create_pdf_sections_table.sql`
   - `CREATE_SUPPLIERS_TABLE.sql`, `CREATE_PACK_SECTIONS.sql`, `CREATE_USER_FAVORITES_TABLE.sql`
   - Scripts de correctifs (`FIX_*`, `CORRECTION_*`, etc.) selon vos besoins.
2. **Edge functions** :
   - Installer Supabase CLI (`INSTALL_SUPABASE_CLI.md`).
   - Lancer `supabase login` puis `supabase functions deploy <nom>` (cf. `DEPLOY_EDGE_FUNCTION.md`).
3. **Stockage / assets** : `public/categories` contient les visuels utilisés comme arrière-plan des cartes fournisseurs.

## Intégration SendGrid (emails Auth Supabase)

Résumé rapide (détails dans `CONFIGURER_SENDGRID.md` ou `CONFIGURER_EMAIL_INVITATION.md`) :

1. Créer un compte SendGrid et valider un expéditeur (Single Sender ou Domain Auth).
2. Générer une clé API (droit « Mail Send ») et la renseigner dans Supabase (`apikey` comme username, clé comme password).
3. Définir l’adresse d’envoi par défaut dans Supabase (`Auth → Settings → Email`).
4. Tester l’envoi via « Send magic link » ou invitation utilisateur.

## Structure du projet

```
├── public/                 # Assets publics (images packs, catégories, logos)
├── src/
│   ├── components/         # Composants UI réutilisables
│   ├── pages/              # Pages marketing & dashboard
│   ├── context/            # Contextes Auth, Affiliés, Mentions légales
│   ├── hooks/              # Hooks (tracking global)
│   ├── data/               # Données statiques (catalogue produits)
│   └── utils/              # Tracking clics, visiteurs
├── supabase/functions/     # Edge functions (TypeScript)
├── sql/ & *.sql            # Scripts SQL (schema & correctifs)
├── README_*.md             # Guides ciblés (webhooks, emails, dashboard...)
├── package.json            # Scripts & dépendances
└── README.md               # (ce fichier)
```

## Guides complémentaires

Le dépôt inclut de nombreuses fiches pratiques (recommandé) :

- `CONFIGURER_SENDGRID.md`, `CONFIGURER_EMAIL_INVITATION.md`, `GUIDE_EMAIL_RESET_PASSWORD.md`
- `CONFIGURER_SCRAPER.md`, `GUIDE_SCRAPERAPI.md`
- `CONFIGURER_WEBHOOK_THRIVECART.md`, `README_WEBHOOK_THRIVECART.md`
- `README_DASHBOARD.md`, `README_PDF_SECTIONS.md`
- `DEPLOY_EDGE_FUNCTION.md`, `DEPLOY_EDGE_FUNCTIONS.md`

## Personnalisation & ressources

- **Images catégories** (`public/categories`) : modifiez ou ajoutez des visuels. Les cartes utilisent `background-image` + overlay.
- **PDFs** : la table `pdf_sections` gère les ressources Gamma (viewer). Voir `README_PDF_SECTIONS.md` pour alimenter les données.
- **Fournisseurs** : table `suppliers` + interface scraping/ajout manuel. Les données sont protégées (anti-copie) dans le dashboard.

## Support & debug

- Logs Supabase : `VERIFIER_LOGS.md`
- Debug edge functions : `DEBUG_EDGE_FUNCTION.md`
- Guides de provisioning utilisateur : `GUIDE_AUTOMATISATION_CREATION_COMPTE.md`, `GUIDE_CONNEXION.md`

---

Pour toute contribution : effectuez vos modifications sur une branche dédiée, lancez `npm run build` pour vérifier le bundle, puis ouvrez une pull request avec le détail des changements et scripts SQL associés. Bonne exploration !
