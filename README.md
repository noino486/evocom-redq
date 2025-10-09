# 🚀 Site E-Commerce Moderne - Packs Digitaux avec Tracking d'Influenceurs

Site e-commerce professionnel pour la vente de packs digitaux avec système de tracking d'influenceurs intégré.

## ✨ Fonctionnalités Principales

### 🎯 Système de Tracking d'Influenceurs
- **Paramètres AF** : Chaque influenceur a un code unique (ex: `?AF=BENJAMIN`)
- **Persistance** : Le code reste actif pendant toute la navigation (localStorage)
- **Pages de paiement personnalisées** : Chaque influenceur a ses propres liens de paiement
- **Interface d'administration** : Gérez facilement vos influenceurs via `/admin`
- **Configuration externe** : Fichier JSON modifiable sans redéploiement
- **Indicateurs visuels** : Badge vert quand un code partenaire est actif

### 📄 Pages Produit Complètes
- Pages individuelles avec URL dédiées (style Shopify)
- Galerie d'images avec miniatures
- Descriptions détaillées et longues
- Sélecteur de quantité
- Breadcrumbs de navigation
- Produits similaires recommandés
- Tags et catégories
- Badge partenaire sur chaque page

### 🎨 Design Flat Futuriste
- Palette de couleurs moderne (Indigo/Violet/Rose)
- Effets glassmorphism et backdrop-blur
- Animations fluides avec Framer Motion
- Effets glow et shine sur les boutons
- Design responsive pour tous les appareils
- Icônes FontAwesome professionnelles

### 🔗 Navigation React Router
- Navigation SPA fluide
- URLs SEO-friendly
- Navigation par slug produit
- Préservation des paramètres AF

### 🔍 SEO & Performance
- Meta tags dynamiques avec react-helmet-async
- Build optimisé avec Vite
- Images optimisées
- Chargement rapide

## 🎨 Palette de Couleurs

- **Primary (Indigo)** : `#6366f1`
- **Secondary (Violet)** : `#8b5cf6`
- **Accent (Rose)** : `#ec4899`
- **Dark (Bleu nuit)** : `#1e1b4b`
- **Light (Violet clair)** : `#f5f3ff`

### Gradients
- **Principal** : `from-primary via-secondary to-accent`
- **Background** : `from-slate-50 via-purple-50 to-pink-50`

## 📦 Technologies Utilisées

### Frontend
- **React 18** - Framework UI
- **React Router DOM** - Navigation et routing
- **Context API** - Gestion d'état (tracking influenceurs)
- **Supabase** - Authentification sécurisée pour l'admin
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling utility-first
- **Framer Motion** - Animations fluides
- **React Icons** - Icônes FontAwesome
- **React Helmet Async** - Gestion SEO

## 🚀 Installation & Démarrage

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration Supabase (pour l'admin)

1. Créez un projet sur [Supabase](https://supabase.com)
2. Créez un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

3. Consultez [CONFIGURATION_SUPABASE.md](CONFIGURATION_SUPABASE.md) pour le guide complet

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:5173`

### 3. Build pour la production

```bash
npm run build
```

### 4. Créer un utilisateur admin

Via le dashboard Supabase :
1. **Authentication** → **Users** → **Add user**
2. Email : `admin@votredomaine.com`
3. Password : Générez un mot de passe fort
4. **Auto Confirm User** : ✅

### 5. Prévisualiser le build

```bash
npm run preview
```

## 🎯 Configuration des Influenceurs

### Méthode 1 : Interface Admin (Recommandée)

1. Accédez à `/admin`
2. Connectez-vous avec votre compte Supabase
3. Ajoutez/modifiez/supprimez des influenceurs
4. Sauvegardez la configuration

### Méthode 2 : Fichier JSON

Éditez `public/config/affiliates.json` :

```json
{
  "affiliates": {
    "BENJAMIN": {
      "STFOUR": "https://lien-benjamin-pack1.com",
      "GLBNS": "https://lien-benjamin-pack2.com"
    },
    "MARIE": {
      "STFOUR": "https://lien-marie-pack1.com",
      "GLBNS": "https://lien-marie-pack2.com"
    }
  },
  "defaultPages": {
    "STFOUR": "https://lien-defaut-pack1.com",
    "GLBNS": "https://lien-defaut-pack2.com"
  }
}
```

### Codes Produits

- **STFOUR** : Global Sourcing Pack (29.99€ TTC)
- **GLBNS** : Visionnaire Pack (39.99€ TTC)

## 🧪 Tester le Système d'Affiliation

### Sans code partenaire
```
http://localhost:5173/
```
→ Utilise les pages de paiement par défaut

### Avec code BENJAMIN
```
http://localhost:5173/?AF=BENJAMIN
```
→ Badge vert affiché + liens de Benjamin

### Avec code APPLE
```
http://localhost:5173/?AF=APPLE
```
→ Badge vert affiché + liens d'Apple

### Réinitialiser le tracking

Dans la console du navigateur (F12) :
```javascript
localStorage.removeItem('evocom-affiliate')
```

## 📁 Structure du Projet

```
evocom-redq/
├── public/
│   ├── config/
│   │   └── affiliates.json      # Configuration des influenceurs
│   └── logo.-evo-banniere.svg   # Logo du site
├── src/
│   ├── components/              # Composants réutilisables
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── Products.jsx
│   │   ├── Testimonials.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── context/
│   │   └── AffiliateContext.jsx # Gestion du tracking
│   ├── data/
│   │   └── products.js          # Données produits
│   ├── pages/
│   │   ├── Home.jsx             # Page d'accueil
│   │   ├── ProductDetail.jsx    # Page produit
│   │   └── Admin.jsx            # Interface admin
│   ├── App.jsx                  # Composant racine
│   ├── main.jsx                 # Point d'entrée
│   └── index.css                # Styles globaux
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── CONFIGURATION_INFLUENCEURS.md  # Guide complet
```

## 🔐 Sécurité

### Authentification Supabase

L'admin est sécurisé par **Supabase Auth** :
- ✅ Authentification email/password
- ✅ Gestion des sessions sécurisée
- ✅ Rate limiting intégré
- ✅ Logs d'authentification

### Configuration en production

1. Ajoutez les variables d'environnement sur votre hébergeur :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Désactivez les inscriptions publiques sur Supabase
3. Activez le rate limiting
4. Consultez [CONFIGURATION_SUPABASE.md](CONFIGURATION_SUPABASE.md)

## 📊 Produits Disponibles

### Global Sourcing Pack - 29.99€ TTC
- Liste de fournisseurs internationaux (50+ secteurs)
- Accès immédiat par email
- Mises à jour régulières

### Visionnaire Pack - 39.99€ TTC
- Tout du Global Sourcing Pack
- PDF Expatriation
- PDF Business Actif & Passif
- Accès Discord VIP à vie
- Communauté de 500+ membres

## 🎯 Fonctionnement du Tracking

1. **Influenceur partage** : `https://votresite.com?AF=BENJAMIN`
2. **Visiteur arrive** : Badge vert s'affiche
3. **Code sauvegardé** : Reste actif pendant toute la visite
4. **Clic sur "Acheter"** : Redirige vers la page de Benjamin
5. **Persistance** : Même après refresh, le code reste actif

## 📝 Guides

- **[CONFIGURATION_INFLUENCEURS.md](CONFIGURATION_INFLUENCEURS.md)** - Guide complet de configuration des influenceurs
- **[CONFIGURATION_SUPABASE.md](CONFIGURATION_SUPABASE.md)** - Guide d'authentification Supabase

## 🚀 Déploiement

### Netlify / Vercel

1. Connectez votre dépôt Git
2. Configuration :
   - Build command : `npm run build`
   - Publish directory : `dist`
3. Déployez !

### Modification de la config en production

- Éditez `/public/config/affiliates.json` directement
- OU utilisez l'interface `/admin`
- Pas besoin de rebuild

## 📞 Support

Pour toute question :
1. Consultez [CONFIGURATION_INFLUENCEURS.md](CONFIGURATION_INFLUENCEURS.md)
2. Vérifiez la console (F12) pour les erreurs
3. Validez votre JSON sur [jsonlint.com](https://jsonlint.com)

## 🎉 Changelog

### Version 2.1 (Octobre 2024)
- ✅ **Authentification Supabase** pour l'admin
- ✅ Login sécurisé avec email/password
- ✅ Gestion des sessions
- ✅ Protection production-ready

### Version 2.0 (Octobre 2024)
- ✅ Système de tracking d'influenceurs complet
- ✅ Interface d'administration
- ✅ Configuration JSON externe
- ✅ Design flat futuriste
- ✅ Persistance localStorage
- ❌ Supprimé : Panier, Stripe, serveur Express

### Version 1.0
- Site e-commerce initial avec panier et Stripe

---

**Made with ❤️ for digital entrepreneurs**
#   e v o c o m  
 