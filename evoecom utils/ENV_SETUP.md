# Configuration Supabase - Variables d'environnement

Créez un fichier `.env` à la racine du projet avec vos identifiants Supabase :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_ici
```

## Où trouver ces valeurs ?

1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## Important !

⚠️ **Après avoir créé/modifié le fichier `.env` :**
- **Redémarrez votre serveur Vite** (Ctrl+C puis `npm run dev`)
- Les variables d'environnement sont chargées au démarrage du serveur

## Vérification

Après redémarrage, ouvrez la console (F12) et vous devriez voir :
```
[Supabase] Configuration trouvée: { url: "https://...", key: "eyJ..." }
```

Si vous voyez `MANQUANT`, vérifiez que :
1. Le fichier `.env` existe à la racine du projet
2. Les noms des variables commencent par `VITE_`
3. Le serveur a été redémarré

