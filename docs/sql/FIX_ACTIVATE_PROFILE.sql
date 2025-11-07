-- ============================================
-- CORRECTION : Permettre aux utilisateurs d'activer leur propre profil
-- ============================================

-- 1. Créer une fonction pour activer son propre profil (après définition du mot de passe)
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
  
  -- Si aucune ligne n'a été mise à jour, le profil n'existe pas ou est déjà actif
  IF NOT FOUND THEN
    RAISE NOTICE 'Aucun profil inactif trouvé pour cet utilisateur';
  END IF;
END;
$$;

-- 2. Donner les permissions d'exécution à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION activate_own_profile() TO authenticated;

-- 3. Ajouter une politique RLS pour permettre à l'utilisateur de mettre à jour son propre profil
DROP POLICY IF EXISTS "Users can activate own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
  
-- Note: La politique permet à l'utilisateur de mettre à jour son propre profil
-- Pour restreindre à l'activation uniquement, utilisez la fonction RPC activate_own_profile()

-- 4. Pour l'utilisateur actuel qui a le problème :
UPDATE user_profiles
SET is_active = true
WHERE email = 'ofmn360@gmail.com';

-- 5. Vérifier les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

