# Commandes pour Déployer les Edge Functions

Ce document contient les commandes pour déployer les Edge Functions modifiées sur Supabase.

## Prérequis

1. **Supabase CLI installé** : [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
2. **Authentifié** : `supabase login`
3. **Projet lié** : `supabase link --project-ref sokdytywaipifrjcitcg`

## Commandes de déploiement

### Option 1 : Déployer les deux fonctions

**Windows CMD :**
```cmd
supabase functions deploy provision-user
supabase functions deploy create-user
```

**Windows PowerShell :**
```powershell
supabase functions deploy provision-user
supabase functions deploy create-user
```

### Option 2 : Déployer une seule fonction

**Déployer provision-user uniquement :**
```cmd
supabase functions deploy provision-user
```

**Déployer create-user uniquement :**
```cmd
supabase functions deploy create-user
```

## Vérifier les secrets configurés

Avant de déployer, vérifiez que les secrets sont bien configurés :

```cmd
supabase secrets list
```

Vous devriez voir :
- `WEBHOOK_SECRET` (pour provision-user)
- `SENDGRID_API_KEY` (pour l'envoi d'email)
- `SENDGRID_FROM_EMAIL` (optionnel)
- `SENDGRID_FROM_NAME` (optionnel)

## Configurer les secrets (si nécessaire)

**Configurer le secret webhook :**
```cmd
supabase secrets set WEBHOOK_SECRET=bfpY8OPmj/vV9J2+oR/uxMqL0LMazbBxntfd11BF3k4=
```

**Configurer SendGrid :**
```cmd
supabase secrets set SENDGRID_API_KEY=votre_cle_sendgrid
supabase secrets set SENDGRID_FROM_EMAIL=noreply@votre-domaine.com
supabase secrets set SENDGRID_FROM_NAME=EVO ECOM
```

## Vérifier le déploiement

Après le déploiement, vérifiez les logs :

```cmd
supabase functions logs provision-user
supabase functions logs create-user
```

Ou via le Dashboard Supabase :
1. Allez dans **Edge Functions** > **provision-user** (ou **create-user**)
2. Cliquez sur **Logs** pour voir les dernières exécutions

## Dépannage

### Erreur "Not linked to a project"

**Solution :**
```cmd
supabase link --project-ref sokdytywaipifrjcitcg
```

### Erreur "Not authenticated"

**Solution :**
```cmd
supabase login
```

### Erreur lors du déploiement

**Vérifier la connexion :**
```cmd
supabase status
```

**Voir les logs détaillés :**
```cmd
supabase functions deploy provision-user --debug
```

## Commandes complètes (copier-coller)

**Pour déployer tout :**
```cmd
supabase functions deploy provision-user && supabase functions deploy create-user
```

**Note :** En CMD Windows, utilisez `&&` pour enchaîner les commandes. En PowerShell, vous pouvez utiliser `;` ou `&&`.

## Script de déploiement automatique

Créez un fichier `deploy.bat` :

```batch
@echo off
echo Deploiement des Edge Functions...
echo.

echo Deploiement de provision-user...
supabase functions deploy provision-user
if %errorlevel% neq 0 (
    echo ERREUR lors du deploiement de provision-user
    pause
    exit /b 1
)

echo.
echo Deploiement de create-user...
supabase functions deploy create-user
if %errorlevel% neq 0 (
    echo ERREUR lors du deploiement de create-user
    pause
    exit /b 1
)

echo.
echo Deploiement termine avec succes!
pause
```

Utilisez-le avec :
```cmd
deploy.bat
```

