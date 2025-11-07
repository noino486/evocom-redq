-- ============================================
-- CORRECTION SIMPLE : Permettre aux utilisateurs d'activer leur propre profil
-- ============================================
-- Exécutez ce SQL dans Supabase Dashboard > SQL Editor

-- 1. Fonction pour activer son propre profil (après définition du mot de passe)
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

-- 2. Permissions pour exécuter la fonction
GRANT EXECUTE ON FUNCTION activate_own_profile() TO authenticated;

-- 3. Politique RLS simple pour permettre la mise à jour du propre profil
DROP POLICY IF EXISTS "Users can activate own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Activer l'utilisateur actuel qui a le problème
UPDATE user_profiles
SET is_active = true
WHERE email = 'ofmn360@gmail.com';

-- 5. Vérification : voir les politiques créées
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

