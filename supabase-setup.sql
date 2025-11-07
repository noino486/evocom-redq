-- ============================================
-- Configuration Supabase pour evocom-redq
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- 1. Créer la table affiliate_config (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS affiliate_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_affiliate_config_key ON affiliate_config(config_key);

-- 3. Activer Row Level Security (RLS)
ALTER TABLE affiliate_config ENABLE ROW LEVEL SECURITY;

-- 4. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Lecture publique affiliate_config" ON affiliate_config;
DROP POLICY IF EXISTS "Modification authentifiée affiliate_config" ON affiliate_config;

-- 5. Politique : Tout le monde peut lire la configuration
CREATE POLICY "Lecture publique affiliate_config"
ON affiliate_config
FOR SELECT
TO public
USING (true);

-- 6. Politique : Seuls les utilisateurs authentifiés peuvent insérer/modifier/supprimer
CREATE POLICY "Modification authentifiée affiliate_config"
ON affiliate_config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Insérer les données par défaut si elles n'existent pas
INSERT INTO affiliate_config (config_key, config_value, updated_at)
VALUES 
  ('affiliates', '{
    "APPLE": {
      "STFOUR": "https://apple.com/gs",
      "GLBNS": "https://apple.com/gb"
    },
    "MIC": {
      "STFOUR": "https://mic.com/gs",
      "GLBNS": "https://mic.com/gb"
    }
  }'::jsonb, NOW()),
  ('defaultPages', '{
    "STFOUR": "https://triumtrade.thrivecart.com/starter-fournisseurs-og/",
    "GLBNS": "https://triumtrade.thrivecart.com/global-business-og/"
  }'::jsonb, NOW())
ON CONFLICT (config_key) DO NOTHING;

-- 8. Vérification : Afficher les données
SELECT * FROM affiliate_config;

-- ============================================
-- Instructions :
-- 1. Copiez tout ce fichier
-- 2. Allez sur supabase.com -> Votre projet
-- 3. Allez dans SQL Editor
-- 4. Collez le code et cliquez sur "Run"
-- 5. Vérifiez que les données apparaissent bien
-- ============================================

