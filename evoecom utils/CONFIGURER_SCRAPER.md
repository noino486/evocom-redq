# Configuration du Scraper de Fournisseurs

## Problème rencontré

Si vous voyez des données de test comme `example-supplier-1.com`, c'est parce que l'edge function utilise des données de démo par défaut.

## Solution : Configurer une vraie recherche

### Option 1 : Google Custom Search API (Recommandé)

1. **Créer un Custom Search Engine** :
   - Allez sur https://programmablesearchengine.google.com/
   - Créez un nouveau moteur de recherche
   - Notez le **Search Engine ID** (cx)

2. **Obtenir une clé API** :
   - Allez sur https://console.cloud.google.com/
   - Créez un projet ou sélectionnez-en un
   - Activez l'API "Custom Search API"
   - Créez une clé API

3. **Configurer dans Supabase** :
   ```bash
   supabase secrets set GOOGLE_API_KEY=votre_cle_api
   supabase secrets set GOOGLE_SEARCH_ENGINE_ID=votre_search_engine_id
   ```

### Option 2 : ScraperAPI (Alternative)

1. **Inscription** :
   - Allez sur https://www.scraperapi.com/
   - Créez un compte (plan gratuit disponible)
   - Récupérez votre clé API

2. **Configurer dans Supabase** :
   ```bash
   supabase secrets set SCRAPER_API_KEY=votre_cle_scraperapi
   ```

### Option 3 : DuckDuckGo (Gratuit, sans API)

Cette option fonctionne automatiquement sans configuration, mais peut être moins fiable et plus lente.

## Déployer l'edge function

Après avoir configuré les secrets :

```bash
supabase functions deploy scrape-suppliers
```

## Nettoyer les données de test

Exécutez ce script SQL dans Supabase pour supprimer les anciennes données de test :

```sql
DELETE FROM suppliers WHERE website LIKE 'https://example-supplier%';
DELETE FROM scraping_jobs WHERE status = 'completed' AND total_saved = 0;
```

## Utilisation

1. Allez dans "Scraper Fournisseurs" dans le dashboard admin
2. Sélectionnez un pays et un type de fournisseur
3. Cliquez sur "Lancer le scraping"
4. Les vrais fournisseurs seront trouvés et ajoutés automatiquement

## Notes importantes

- **Google Custom Search API** : 100 requêtes gratuites/jour, puis payant
- **ScraperAPI** : Plan gratuit avec 5000 requêtes/mois
- **DuckDuckGo** : Gratuit mais peut être bloqué si trop de requêtes
- Le scraping peut prendre plusieurs minutes selon le nombre de sites à analyser

