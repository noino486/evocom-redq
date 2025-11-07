-- ============================================
-- CORRECTION DES POLITIQUES RLS POUR user_profiles
-- ============================================
-- 
-- Si le profil existe mais que vous ne pouvez pas le charger,
-- c'est probablement un problème de RLS (Row Level Security)
-- 
-- Exécutez ces commandes dans Supabase SQL Editor

-- 1. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Support can view non-admin profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- 2. Créer une politique simple pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- 3. Politique pour les admins (peuvent tout voir)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() 
      AND up.access_level = 4
      AND up.is_active = true
    )
  );

-- 4. Politique UPDATE pour que les utilisateurs puissent mettre à jour leur propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
  
-- 5. Fonction pour activer son propre profil (plus sécurisée, utilise SECURITY DEFINER)
CREATE OR REPLACE FUNCTION activate_own_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles
  SET 
    is_active = true,
    updated_at = NOW(),
    last_login = NOW()
  WHERE id = auth.uid()
    AND is_active = false;
END;
$$;

GRANT EXECUTE ON FUNCTION activate_own_profile() TO authenticated;

-- 5. Politique pour que les admins puissent tout modifier
CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() 
      AND up.access_level = 4
      AND up.is_active = true
    )
  );

-- Vérifier les politiques créées
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

