# Guide d'installation de Supabase CLI sur Windows

## Option 1 : Via Scoop (Recommandé pour Windows)

### 1. Installer Scoop (si pas déjà installé)

Ouvrez PowerShell en tant qu'administrateur et exécutez :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### 2. Installer Supabase CLI via Scoop

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 3. Vérifier l'installation

```powershell
supabase --version
```

---

## Option 2 : Via npm en mode local (dans votre projet)

### 1. Installer Supabase CLI dans votre projet

Dans le dossier de votre projet, exécutez :

```bash
npm install supabase --save-dev
```

### 2. Utiliser Supabase CLI via npx

```bash
npx supabase --version
npx supabase login
npx supabase functions deploy create-user
```

---

## Option 3 : Via les binaires précompilés

### 1. Télécharger le binaire pour Windows

Allez sur : https://github.com/supabase/cli/releases

Téléchargez le fichier `supabase_<version>_windows_amd64.zip`

### 2. Extraire et ajouter au PATH

1. Extrayez le fichier ZIP
2. Renommez `supabase.exe` et placez-le dans un dossier accessible
3. Ajoutez ce dossier à votre PATH Windows

---

## Option 4 : Via Chocolatey (si installé)

```powershell
choco install supabase
```

---

## Après l'installation

### 1. Se connecter à Supabase

```bash
supabase login
```

Ou si installé localement :
```bash
npx supabase login
```

### 2. Lier votre projet

```bash
supabase link --project-ref votre-project-ref
```

**Pour trouver votre `project-ref`** :
- Allez dans Supabase Dashboard
- Settings > General
- Copiez le "Reference ID"

### 3. Déployer la fonction

```bash
supabase functions deploy create-user
```

Ou si installé localement :
```bash
npx supabase functions deploy create-user
```

---

## Recommandation

Pour Windows, **Option 1 (Scoop)** est la plus simple et propre. Sinon, utilisez **Option 2 (npm local)** qui fonctionne sans configuration supplémentaire.

---

## Vérification

Après installation, testez avec :

```bash
supabase --version
```

Vous devriez voir quelque chose comme : `supabase 1.xxx.x`

