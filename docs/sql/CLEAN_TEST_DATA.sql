-- Script pour nettoyer les données de test du scraper
-- À exécuter dans Supabase SQL Editor

-- Supprimer les fournisseurs de test
DELETE FROM suppliers 
WHERE website LIKE 'https://example-supplier%' 
   OR website LIKE 'http://example-supplier%';

-- Supprimer les jobs de test qui n'ont rien trouvé
DELETE FROM scraping_jobs 
WHERE status = 'completed' 
  AND total_saved = 0 
  AND created_at < NOW() - INTERVAL '1 day';

-- Vérifier combien de lignes ont été supprimées
SELECT 
  (SELECT COUNT(*) FROM suppliers WHERE website LIKE 'https://example-supplier%') as remaining_test_suppliers,
  (SELECT COUNT(*) FROM suppliers) as total_suppliers;

