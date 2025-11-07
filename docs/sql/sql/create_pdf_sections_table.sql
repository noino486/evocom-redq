CREATE TABLE IF NOT EXISTS pdf_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN ('EXPATRIATION', 'REVENUE_ACTIF', 'REVENUE_PASSIF')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_pdf_sections_section_type ON pdf_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_pdf_sections_is_active ON pdf_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_pdf_sections_display_order ON pdf_sections(display_order);

CREATE OR REPLACE FUNCTION update_pdf_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pdf_sections_updated_at
  BEFORE UPDATE ON pdf_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_pdf_sections_updated_at();

ALTER TABLE pdf_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read pdf_sections"
  ON pdf_sections
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to insert pdf_sections"
  ON pdf_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level >= 4
    )
  );

CREATE POLICY "Allow admins to update pdf_sections"
  ON pdf_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level >= 4
    )
  );

CREATE POLICY "Allow admins to delete pdf_sections"
  ON pdf_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level >= 4
    )
  );
