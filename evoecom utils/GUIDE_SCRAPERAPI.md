# Guide de Configuration ScraperAPI

## Étape 1 : Créer un compte ScraperAPI

1. Allez sur https://www.scraperapi.com/
2. Cliquez sur **"Sign Up"** ou **"Get Started"**
3. Créez un compte (email + mot de passe)
4. Vérifiez votre email

## Étape 2 : Obtenir votre clé API

1. Une fois connecté, allez dans votre **Dashboard**
2. Vous verrez votre **API Key** (clé API)
3. **Copiez cette clé** - elle ressemble à : `abc123def456ghi789...`

> **Note** : Le plan gratuit offre 5,000 requêtes/mois, ce qui est suffisant pour tester

## Étape 3 : Configurer la clé dans Supabase

### Option A : Via la ligne de commande (Recommandé)

1. Ouvrez un terminal dans votre projet
2. Assurez-vous d'être connecté à Supabase :
   ```bash
   supabase login
   ```
3. Ajoutez votre clé ScraperAPI :
   ```bash
   supabase secrets set SCRAPER_API_KEY=votre_cle_api_ici
   ```
   
   Remplacez `votre_cle_api_ici` par votre vraie clé API ScraperAPI

### Option B : Via le Dashboard Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Edge Functions**
4. Cliquez sur **Secrets**
5. Ajoutez un nouveau secret :
   - **Name** : `SCRAPER_API_KEY`
   - **Value** : votre clé API ScraperAPI
6. Cliquez sur **Save**

## Étape 4 : Déployer l'edge function

Dans votre terminal, exécutez :

```bash
supabase functions deploy scrape-suppliers
```

## Étape 5 : Vérifier que ça fonctionne

1. Allez dans votre dashboard admin
2. Cliquez sur **"Scraper Fournisseurs"**
3. Sélectionnez un pays et un type de fournisseur
4. Cliquez sur **"Lancer le scraping"**
5. Vous devriez voir des vrais fournisseurs apparaître au lieu de `example-supplier-1.com`

## Vérification dans les logs

Pour voir si ScraperAPI est utilisé, vous pouvez vérifier les logs :

```bash
supabase functions logs scrape-suppliers
```

## Gestion des quotas

- **Plan gratuit** : 5,000 requêtes/mois
- Chaque fournisseur scrapé = 2 requêtes (1 pour la recherche, 1 pour le scraping)
- Vous pouvez scraper environ 2,500 fournisseurs/mois avec le plan gratuit

Pour plus de requêtes, consultez les plans payants sur https://www.scraperapi.com/pricing

## Dépannage

### Erreur : "SCRAPER_API_KEY not found"
- Vérifiez que vous avez bien configuré le secret dans Supabase
- Redéployez l'edge function après avoir ajouté le secret

### Erreur : "Invalid API key"
- Vérifiez que vous avez copié la bonne clé API
- Assurez-vous qu'il n'y a pas d'espaces avant/après la clé

### Aucun résultat trouvé
- C'est normal si les sites ne contiennent pas d'informations
- Le scraper essaie quand même d'extraire ce qu'il peut (nom, site web)

