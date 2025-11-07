-- ============================================
-- CORRECTION RLS : Permettre aux admins de voir tous les utilisateurs
-- ============================================
-- Exécutez ce SQL dans Supabase Dashboard > SQL Editor

-- 1. Fonction helper pour vérifier si l'utilisateur est admin (bypass RLS)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_access_level INTEGER;
BEGIN
  SELECT access_level INTO v_access_level
  FROM user_profiles
  WHERE id = auth.uid() AND is_active = true;
  
  RETURN COALESCE(v_access_level, 0) = 4;
END;
$$;

-- 2. Fonction helper pour vérifier si l'utilisateur est support ou admin
CREATE OR REPLACE FUNCTION is_support_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_access_level INTEGER;
BEGIN
  SELECT access_level INTO v_access_level
  FROM user_profiles
  WHERE id = auth.uid() AND is_active = true;
  
  RETURN COALESCE(v_access_level, 0) >= 3;
END;
$$;

-- 3. Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Support can view non-admin profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- 4. Nouvelle politique pour les admins (utilise la fonction helper)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin_user() = true);

-- 5. Politique pour les supports (peuvent voir les non-admins)
CREATE POLICY "Support can view non-admin profiles"
  ON user_profiles FOR SELECT
  USING (
    is_support_or_admin() = true AND
    access_level < 4
  );

-- 6. Politique UPDATE/DELETE pour les admins
CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  USING (is_admin_user() = true)
  WITH CHECK (is_admin_user() = true);

-- 7. Vérifier les politiques créées
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 8. Test : Vérifier votre statut admin
SELECT 
  email,
  access_level,
  is_active,
  is_admin_user() AS is_admin_check
FROM user_profiles
WHERE id = auth.uid();

