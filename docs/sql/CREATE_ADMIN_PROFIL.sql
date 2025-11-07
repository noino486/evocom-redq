-- ============================================
-- Création d'un profil ADMIN pour contact@nb-com.fr
-- ============================================
-- Cette requête crée un profil administrateur avec accès complet
-- si l'utilisateur existe dans auth.users mais pas encore dans user_profiles

INSERT INTO user_profiles (id, email, access_level, products, is_active)
SELECT 
  id,
  email,
  4 AS access_level,  -- 4 = Admin (accès complet)
  '["STFOUR", "GLBNS"]'::jsonb AS products,
  true AS is_active
FROM auth.users
WHERE email = 'contact@nb-com.fr'
AND id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;  -- Protection supplémentaire contre les doublons

-- Vérifier que le profil a été créé
SELECT 
  id,
  email,
  access_level,
  products,
  is_active,
  created_at
FROM user_profiles
WHERE email = 'contact@nb-com.fr';

