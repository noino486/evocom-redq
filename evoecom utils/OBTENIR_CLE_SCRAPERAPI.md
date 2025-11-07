# Comment Obtenir une Clé API ScraperAPI (GRATUIT)

## Étape 1 : Créer un compte ScraperAPI

1. **Allez sur** : https://www.scraperapi.com/
2. **Cliquez sur** le bouton **"Get Started"** ou **"Sign Up"** (en haut à droite)
3. **Remplissez le formulaire** :
   - Email
   - Mot de passe
   - Confirmez votre mot de passe
4. **Cliquez sur** "Create Account" ou "Sign Up"

## Étape 2 : Vérifier votre email

1. Allez dans votre boîte mail
2. Ouvrez l'email de ScraperAPI
3. Cliquez sur le lien de vérification

## Étape 3 : Obtenir votre clé API

1. **Connectez-vous** sur https://www.scraperapi.com/
2. Une fois connecté, vous serez redirigé vers votre **Dashboard**
3. Vous verrez une section **"API Key"** ou **"Your API Key"**
4. **Copiez cette clé** (elle ressemble à quelque chose comme : `abc123def456ghi789jkl012mno345`)

> 💡 **Astuce** : La clé est généralement affichée en grand au centre du dashboard après connexion

## Étape 4 : Utiliser la clé dans votre projet

Une fois que vous avez votre clé, exécutez dans votre terminal :

```bash
supabase secrets set SCRAPER_API_KEY=votre_cle_ici
```

Puis redéployez :

```bash
supabase functions deploy scrape-suppliers
```

## Plan Gratuit ScraperAPI

- ✅ **5,000 requêtes par mois** (gratuit)
- ✅ **Pas besoin de carte bancaire**
- ✅ **Suffisant pour tester et faire des petits scrapings**

## Si vous avez des problèmes

- **Vous ne voyez pas la clé API** : Regardez dans "Account Settings" ou "API Keys"
- **Email non reçu** : Vérifiez vos spams
- **Compte non créé** : Réessayez avec un autre email

