-- ============================================
-- TEST DIRECT : Vérifier l'accès au profil
-- ============================================
-- 
-- Exécutez cette requête dans Supabase SQL Editor
-- pour vérifier que votre profil existe et est accessible

-- 1. Vérifier que le profil existe
SELECT * FROM user_profiles 
WHERE email = 'contact@nb-com.fr';

-- 2. Vérifier les politiques RLS actives
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 3. Test avec votre userId directement
SELECT * FROM user_profiles 
WHERE id = '6b3134c6-4e9c-46a4-a73e-ebb95dc314d7';

-- 4. Si vous voyez le profil dans les résultats ci-dessus,
-- mais qu'il ne se charge pas dans l'app, c'est un problème RLS.
-- Dans ce cas, exécutez FIX_RLS_POLICIES.sql

