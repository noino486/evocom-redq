-- ============================================
-- TABLE: supplier_category_images
-- Pour stocker les images des catégories de fournisseurs
-- ============================================

CREATE TABLE IF NOT EXISTS supplier_category_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_supplier_category_images_category ON supplier_category_images(category_name);

-- RLS (Row Level Security)
ALTER TABLE supplier_category_images ENABLE ROW LEVEL SECURITY;

-- Policy: Tous les utilisateurs authentifiés peuvent voir les images
DROP POLICY IF EXISTS "Authenticated users can view category images" ON supplier_category_images;
CREATE POLICY "Authenticated users can view category images"
  ON supplier_category_images
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Seuls les admins peuvent gérer les images
DROP POLICY IF EXISTS "Admins can manage category images" ON supplier_category_images;
CREATE POLICY "Admins can manage category images"
  ON supplier_category_images
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
CREATE OR REPLACE FUNCTION update_supplier_category_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_supplier_category_images_updated_at ON supplier_category_images;
CREATE TRIGGER trigger_update_supplier_category_images_updated_at
  BEFORE UPDATE ON supplier_category_images
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_category_images_updated_at();

-- Commentaire pour documenter la table
COMMENT ON TABLE supplier_category_images IS 'Stocke les images associées aux catégories de fournisseurs';
COMMENT ON COLUMN supplier_category_images.category_name IS 'Nom de la catégorie (ex: Textiles pour Femme)';
COMMENT ON COLUMN supplier_category_images.image_url IS 'URL de l''image (peut être une URL externe ou un chemin Supabase Storage)';

-- ============================================
-- INSTRUCTIONS POUR CONFIGURER LE STORAGE
-- ============================================
-- 
-- 1. Exécutez ce script SQL dans Supabase Dashboard > SQL Editor
-- 2. Créez le bucket Supabase Storage:
--    - Allez dans Supabase Dashboard > Storage
--    - Cliquez sur "New bucket"
--    - Nom: supplier-category-images
--    - Public: Oui
--    - File size limit: Aucune limite (ou selon vos besoins)
--    - Allowed MIME types: image/png, image/jpeg, image/jpg, image/webp
-- 3. Exécutez le script CREATE_STORAGE_POLICIES_CATEGORY_IMAGES.sql pour configurer les policies de sécurité
-- 4. Les images seront automatiquement uploadées et sauvegardées lors de l'utilisation de l'interface

