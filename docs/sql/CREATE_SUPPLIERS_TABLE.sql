-- ============================================
-- TABLE: suppliers
-- Pour stocker les fournisseurs scrapés
-- ============================================

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(255),
  country VARCHAR(100),
  supplier_type VARCHAR(100),
  address TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'verified', 'pending')),
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  CONSTRAINT unique_supplier_website UNIQUE(website)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_suppliers_country ON suppliers(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_scraped_at ON suppliers(scraped_at DESC);

-- RLS (Row Level Security)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Policy: Admins et utilisateurs Pack Global Business (niveau >= 2) peuvent voir les fournisseurs
CREATE POLICY "Admins and Global Business users can view suppliers"
  ON suppliers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_active = TRUE
      AND user_profiles.access_level >= 2
    )
  );

-- Policy: Seuls les admins peuvent insérer des fournisseurs
CREATE POLICY "Admins can insert suppliers"
  ON suppliers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

-- Policy: Seuls les admins peuvent modifier les fournisseurs
CREATE POLICY "Admins can update suppliers"
  ON suppliers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

-- Policy: Seuls les admins peuvent supprimer les fournisseurs
CREATE POLICY "Admins can delete suppliers"
  ON suppliers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_suppliers_updated_at();

-- Table pour suivre les jobs de scraping
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country VARCHAR(100) NOT NULL,
  supplier_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'stopped', 'error')),
  total_found INTEGER DEFAULT 0,
  total_saved INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created_at ON scraping_jobs(created_at DESC);

ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scraping jobs"
  ON scraping_jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

