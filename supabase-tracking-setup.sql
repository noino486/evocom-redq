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

-- Créer la table visitors pour tracker les visiteurs
CREATE TABLE IF NOT EXISTS visitors (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_mobile BOOLEAN NOT NULL DEFAULT FALSE,
  is_in_app BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  viewport_size TEXT,
  language TEXT,
  timezone TEXT,
  affiliate_code TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
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

-- Index pour la table visitors
CREATE INDEX IF NOT EXISTS idx_visitors_timestamp ON visitors(timestamp);
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_affiliate_code ON visitors(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_visitors_device_type ON visitors(device_type);
CREATE INDEX IF NOT EXISTS idx_visitors_browser ON visitors(browser);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
CREATE INDEX IF NOT EXISTS idx_visitors_is_mobile ON visitors(is_mobile);
CREATE INDEX IF NOT EXISTS idx_visitors_is_in_app ON visitors(is_in_app);

-- Créer une vue pour les statistiques agrégées des clics
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

-- Créer une vue pour les statistiques agrégées des visiteurs
CREATE OR REPLACE VIEW visitor_stats AS
SELECT 
  DATE(timestamp) as visit_date,
  device_type,
  browser,
  os,
  country,
  affiliate_code,
  is_mobile,
  is_in_app,
  COUNT(*) as visitor_count,
  COUNT(DISTINCT session_id) as unique_visitor_count
FROM visitors
GROUP BY 
  DATE(timestamp),
  device_type,
  browser,
  os,
  country,
  affiliate_code,
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

-- Créer une fonction pour nettoyer les anciens visiteurs (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_visitors()
RETURNS void AS $$
BEGIN
  -- Supprimer les visiteurs plus anciens que 1 an
  DELETE FROM visitors 
  WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Activer RLS (Row Level Security) pour la sécurité
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre la lecture et l'écriture
-- (Ajustez selon vos besoins de sécurité)
CREATE POLICY "Allow all operations on link_clicks" ON link_clicks
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on visitors" ON visitors
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

-- Afficher les informations des tables créées
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('link_clicks', 'visitors')
ORDER BY table_name, ordinal_position;

-- Afficher un résumé des tables créées
SELECT 
  'link_clicks' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'link_clicks'
UNION ALL
SELECT 
  'visitors' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'visitors';
