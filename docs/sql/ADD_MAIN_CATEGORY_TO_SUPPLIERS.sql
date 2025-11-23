-- ============================================
-- MIGRATION: Ajout de la colonne main_category
-- Pour supporter la structure hiérarchique des catégories
-- ============================================

-- Ajouter la colonne main_category à la table suppliers
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS main_category VARCHAR(100);

-- Ajouter la colonne main_category à la table scraping_jobs
ALTER TABLE scraping_jobs 
ADD COLUMN IF NOT EXISTS main_category VARCHAR(100);

-- Créer un index pour améliorer les performances de recherche par catégorie principale
CREATE INDEX IF NOT EXISTS idx_suppliers_main_category ON suppliers(main_category);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_main_category ON scraping_jobs(main_category);

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN suppliers.main_category IS 'Catégorie principale du fournisseur (ex: Transport et logistique, Textile pour Homme, etc.)';
COMMENT ON COLUMN suppliers.supplier_type IS 'Sous-catégorie spécifique du fournisseur (ex: Société d''import-export, Exportateur, etc.)';
COMMENT ON COLUMN scraping_jobs.main_category IS 'Catégorie principale utilisée pour le scraping';
COMMENT ON COLUMN scraping_jobs.supplier_type IS 'Sous-catégorie spécifique utilisée pour le scraping';

