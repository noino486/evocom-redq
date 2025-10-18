-- Script SQL pour créer la table de tracking des clics
-- À exécuter dans votre base de données Supabase

-- Créer la table link_clicks pour tracker les clics
CREATE TABLE IF NOT EXISTS link_clicks (
  id BIGSERIAL PRIMARY KEY,
  link_url TEXT NOT NULL,
  link_type TEXT NOT NULL CHECK (link_type IN ('product', 'affiliate', 'external', 'internal')),
  link_text TEXT,
  affiliate_name TEXT,
  product_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_url TEXT NOT NULL,
  is_mobile BOOLEAN NOT NULL DEFAULT FALSE,
  is_in_app BOOLEAN NOT NULL DEFAULT FALSE,
  click_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Créer des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_link_clicks_timestamp ON link_clicks(timestamp);
CREATE INDEX IF NOT EXISTS idx_link_clicks_affiliate_name ON link_clicks(affiliate_name);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_type ON link_clicks(link_type);
CREATE INDEX IF NOT EXISTS idx_link_clicks_product_id ON link_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_is_mobile ON link_clicks(is_mobile);
CREATE INDEX IF NOT EXISTS idx_link_clicks_is_in_app ON link_clicks(is_in_app);
CREATE INDEX IF NOT EXISTS idx_link_clicks_click_source ON link_clicks(click_source);

-- Créer une vue pour les statistiques agrégées
CREATE OR REPLACE VIEW link_click_stats AS
SELECT 
  DATE(timestamp) as click_date,
  link_type,
  affiliate_name,
  product_id,
  click_source,
  is_mobile,
  is_in_app,
  COUNT(*) as click_count
FROM link_clicks
GROUP BY 
  DATE(timestamp),
  link_type,
  affiliate_name,
  product_id,
  click_source,
  is_mobile,
  is_in_app;

-- Créer une fonction pour nettoyer les anciens clics (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_clicks()
RETURNS void AS $$
BEGIN
  -- Supprimer les clics plus anciens que 1 an
  DELETE FROM link_clicks 
  WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Activer RLS (Row Level Security) pour la sécurité
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre la lecture et l'écriture
-- (Ajustez selon vos besoins de sécurité)
CREATE POLICY "Allow all operations on link_clicks" ON link_clicks
  FOR ALL USING (true);

-- Insérer des données de test (optionnel - à supprimer en production)
-- INSERT INTO link_clicks (
--   link_url, 
--   link_type, 
--   link_text, 
--   affiliate_name, 
--   product_id, 
--   user_agent, 
--   page_url, 
--   is_mobile, 
--   is_in_app, 
--   click_source
-- ) VALUES (
--   'https://example.com/test',
--   'affiliate',
--   'Test Link',
--   'TEST_AFFILIATE',
--   'STFOUR',
--   'Mozilla/5.0...',
--   'https://yoursite.com/',
--   false,
--   false,
--   'test'
-- );

-- Afficher les informations de la table créée
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'link_clicks'
ORDER BY ordinal_position;
