-- Script pour nettoyer les URLs invalides du scraper
-- À exécuter dans Supabase SQL Editor

-- Supprimer les fournisseurs avec des domaines invalides
DELETE FROM suppliers 
WHERE website LIKE '%googleadservices%'
   OR website LIKE '%w3.org%'
   OR website LIKE '%schema.org%'
   OR website LIKE '%google.com%'
   OR website LIKE '%youtube.com%'
   OR website LIKE '%wikipedia.org%'
   OR website LIKE '%facebook.com%'
   OR website LIKE '%twitter.com%'
   OR website LIKE '%linkedin.com%'
   OR website LIKE '%/aclk%'
   OR website LIKE '%/conversion/%'
   OR website LIKE '%/pagead/%';

-- Vérifier les résultats
SELECT 
  COUNT(*) as total_suppliers,
  COUNT(CASE WHEN website LIKE '%googleadservices%' THEN 1 END) as google_ads,
  COUNT(CASE WHEN website LIKE '%w3.org%' THEN 1 END) as w3_org,
  COUNT(CASE WHEN website LIKE '%schema.org%' THEN 1 END) as schema_org
FROM suppliers;

