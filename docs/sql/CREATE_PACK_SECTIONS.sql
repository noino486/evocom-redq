-- ============================================
-- TABLE: pack_sections
-- Pour gérer les sections des packs (Global Sourcing et Business)
-- ============================================

CREATE TABLE IF NOT EXISTS pack_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id VARCHAR(20) NOT NULL CHECK (pack_id IN ('STFOUR', 'GLBNS')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100) NOT NULL DEFAULT 'FaFileAlt',
  pdf_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pack_sections_pack_id ON pack_sections(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_sections_display_order ON pack_sections(pack_id, display_order);
CREATE INDEX IF NOT EXISTS idx_pack_sections_active ON pack_sections(pack_id, is_active);

-- RLS (Row Level Security)
ALTER TABLE pack_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les sections actives
CREATE POLICY "Anyone can view active pack sections"
  ON pack_sections
  FOR SELECT
  USING (is_active = TRUE);

-- Policy: Seuls les admins peuvent modifier les sections
CREATE POLICY "Admins can manage pack sections"
  ON pack_sections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_pack_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pack_sections_updated_at
  BEFORE UPDATE ON pack_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_pack_sections_updated_at();

