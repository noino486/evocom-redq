-- ============================================
-- POLICIES SUPABASE STORAGE
-- Pour permettre l'upload d'images de catégories
-- ============================================
-- 
-- IMPORTANT: Ce script doit être exécuté dans Supabase Dashboard > SQL Editor
-- APRÈS avoir créé le bucket "supplier-category-images" dans Storage
--
-- Pour créer le bucket:
-- 1. Allez dans Supabase Dashboard > Storage
-- 2. Cliquez sur "New bucket"
-- 3. Nom: supplier-category-images
-- 4. Public: Oui (pour permettre l'accès public aux images)
-- 5. File size limit: Aucune limite (ou selon vos besoins)
-- 6. Allowed MIME types: image/png, image/jpeg, image/jpg, image/webp
--
-- ============================================
-- POLICIES POUR LE BUCKET
-- ============================================

-- Policy: Tous les utilisateurs authentifiés peuvent lire les images
DROP POLICY IF EXISTS "Public read access for category images" ON storage.objects;
CREATE POLICY "Public read access for category images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'supplier-category-images');

-- Policy: Seuls les admins peuvent uploader les images
DROP POLICY IF EXISTS "Admins can upload category images" ON storage.objects;
CREATE POLICY "Admins can upload category images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'supplier-category-images' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

-- Policy: Seuls les admins peuvent modifier les images
DROP POLICY IF EXISTS "Admins can update category images" ON storage.objects;
CREATE POLICY "Admins can update category images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'supplier-category-images' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

-- Policy: Seuls les admins peuvent supprimer les images
DROP POLICY IF EXISTS "Admins can delete category images" ON storage.objects;
CREATE POLICY "Admins can delete category images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'supplier-category-images' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

