# Mise à jour de l'API Key du Scraper

## Nouvelle API Key

**API Key ScraperAPI** : `621fc8742ec8167ecdbfc66c0ea2c759`

## Configuration via la ligne de commande (Recommandé)

1. Ouvrez un terminal dans votre projet
2. Assurez-vous d'être connecté à Supabase :
   ```bash
   supabase login
   ```
3. Mettez à jour la clé ScraperAPI :
   ```bash
   supabase secrets set SCRAPER_API_KEY=621fc8742ec8167ecdbfc66c0ea2c759
   ```

## Configuration via le Dashboard Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Edge Functions**
4. Cliquez sur **Secrets**
5. Trouvez le secret `SCRAPER_API_KEY` ou créez-le s'il n'existe pas
6. Mettez à jour la valeur avec : `621fc8742ec8167ecdbfc66c0ea2c759`
7. Cliquez sur **Save**

## Redéployer l'edge function

Après avoir mis à jour le secret, redéployez l'edge function :

```bash
supabase functions deploy scrape-suppliers
```

## Vérification

Pour vérifier que la nouvelle clé fonctionne :

1. Allez dans votre dashboard admin
2. Cliquez sur **"Scraper Fournisseurs"**
3. Sélectionnez un pays et une catégorie/sous-catégorie
4. Cliquez sur **"Lancer le scraping"**
5. Vérifiez les logs si nécessaire :
   ```bash
   supabase functions logs scrape-suppliers
   ```

## Notes

- La clé API est maintenant configurée et sera utilisée automatiquement pour tous les scrapings futurs
- Assurez-vous que le secret est bien configuré avant de lancer un scraping
- Si vous rencontrez des erreurs, vérifiez que la clé n'a pas d'espaces avant/après

