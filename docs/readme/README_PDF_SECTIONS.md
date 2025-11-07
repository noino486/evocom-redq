# Guide d'installation - Sections PDF

## Étape 1 : Créer la table dans Supabase

1. Ouvrez votre projet Supabase
2. Allez dans l'éditeur SQL
3. Copiez-collez le contenu du fichier `sql/create_pdf_sections_table.sql`
4. Exécutez le script

## Étape 2 : Vérifier que la table existe

Dans Supabase, vérifiez que la table `pdf_sections` a été créée avec les colonnes suivantes :
- `id` (UUID)
- `title` (TEXT)
- `description` (TEXT)
- `pdf_url` (TEXT)
- `section_type` (TEXT) - doit être 'EXPATRIATION', 'REVENUE_ACTIF' ou 'REVENUE_PASSIF'
- `display_order` (INTEGER)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)
- `created_by`, `updated_by` (UUID)

## Étape 3 : Ajouter des PDFs

1. Connectez-vous en tant qu'admin
2. Allez dans le menu "PDFs par Section"
3. Sélectionnez une section (EXPATRIATION, Revenue Actif, ou Revenue Passif)
4. Cliquez sur "Ajouter un PDF"
5. Remplissez le formulaire :
   - **Titre** : Nom du PDF
   - **Description** : Description optionnelle
   - **URL du PDF** : URL complète du PDF (peut être un lien Gamma ou autre)
   - **Section** : Choisissez la section appropriée
   - **Ordre d'affichage** : Numéro pour ordonner les PDFs
   - **PDF actif** : Cochez pour activer le PDF

## Contrôle d'accès par pack

- **Pack Global Sourcing (STFOUR)** : Accès à "Revenue Actif" et "Revenue Passif" uniquement
- **Pack Global Business (GLBNS)** : Accès à toutes les sections (EXPATRIATION, Revenue Actif, Revenue Passif)

## Viewer Gamma

Si vous utilisez un lien Gamma (gamma.app), le viewer détectera automatiquement et affichera le document dans une iframe. Pour d'autres types de PDFs, un iframe standard sera utilisé.

## Dépannage

Si les sections ne s'affichent pas :

1. **Vérifiez la console du navigateur** (F12) pour voir les erreurs
2. **Vérifiez que la table existe** dans Supabase
3. **Vérifiez les RLS (Row Level Security)** - Les politiques doivent permettre la lecture aux utilisateurs authentifiés
4. **Vérifiez que vous avez ajouté des PDFs** dans la page de gestion
5. **Vérifiez que les PDFs sont actifs** (`is_active = true`)

## Messages d'erreur courants

- **"La table pdf_sections n'existe pas"** : Exécutez le script SQL
- **"Aucun PDF disponible"** : Ajoutez des PDFs via la page de gestion
- **Erreur 42P01** : La table n'existe pas dans Supabase

