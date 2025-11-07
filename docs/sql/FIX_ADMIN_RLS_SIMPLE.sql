-- ============================================
-- CORRECTION RLS SIMPLE : Admins voient TOUS les utilisateurs
-- ============================================
-- Exécutez ce SQL dans Supabase Dashboard > SQL Editor

-- 1. Supprimer TOUTES les politiques existantes pour repartir à zéro
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Support can view non-admin profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can activate own profile" ON user_profiles;

-- 2. Fonction helper pour vérifier si l'utilisateur est admin (bypass RLS)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_access_level INTEGER;
BEGIN
  -- Bypass RLS grâce à SECURITY DEFINER
  SELECT access_level INTO v_access_level
  FROM user_profiles
  WHERE id = auth.uid() AND is_active = true
  LIMIT 1;
  
  RETURN COALESCE(v_access_level, 0) = 4;
END;
$$;

-- 3. Fonction helper pour vérifier si l'utilisateur est support ou admin
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
  WHERE id = auth.uid() AND is_active = true
  LIMIT 1;
  
  RETURN COALESCE(v_access_level, 0) >= 3;
END;
$$;

-- 4. POLITIQUES SELECT (LECTURE)
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Les admins peuvent voir TOUS les profils (priorité haute)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin_user() = true);

-- Les supports peuvent voir les profils non-admin
CREATE POLICY "Support can view non-admin profiles"
  ON user_profiles FOR SELECT
  USING (
    is_support_or_admin() = true 
    AND access_level < 4
  );

-- 5. POLITIQUES UPDATE (MODIFICATION)
-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les admins peuvent modifier TOUS les profils
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (is_admin_user() = true)
  WITH CHECK (is_admin_user() = true);

-- 6. POLITIQUES INSERT/DELETE (pour les admins uniquement)
CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (is_admin_user() = true);

CREATE POLICY "Admins can delete profiles"
  ON user_profiles FOR DELETE
  USING (is_admin_user() = true);

-- 7. Vérifier votre statut admin actuel
SELECT 
  email,
  access_level,
  is_active,
  is_admin_user() AS est_admin,
  CASE 
    WHEN is_admin_user() THEN '✅ Vous êtes admin'
    ELSE '❌ Vous n''êtes pas admin'
  END AS statut
FROM user_profiles
WHERE id = auth.uid();

-- 8. Compter tous les utilisateurs (visible uniquement si admin)
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_active = true) as active_users,
  COUNT(*) FILTER (WHERE access_level = 4) as admins
FROM user_profiles;

-- 9. Lister TOUS les utilisateurs (visibles seulement aux admins)
SELECT 
  email,
  access_level,
  is_active,
  created_at,
  last_login
FROM user_profiles
ORDER BY created_at DESC;

