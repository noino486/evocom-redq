-- ============================================
-- CRÉER LE PROFIL POUR contact@nb-com.fr
-- ============================================
-- 
-- Copier-coller cette requête dans Supabase SQL Editor
-- et l'exécuter

INSERT INTO user_profiles (id, email, access_level, products, is_active)
VALUES (
  '6b3134c6-4e9c-46a4-a73e-ebb95dc314d7',  -- Votre userId
  'contact@nb-com.fr',                      -- Votre email
  4,                                         -- Niveau Admin
  '["STFOUR", "GLBNS"]'::jsonb,             -- Produits accessibles
  true                                       -- Compte actif
)
ON CONFLICT (id) 
DO UPDATE SET
  email = EXCLUDED.email,
  access_level = EXCLUDED.access_level,
  products = EXCLUDED.products,
  is_active = true,
  updated_at = NOW();

-- Vérifier que ça a fonctionné :
SELECT * FROM user_profiles WHERE email = 'contact@nb-com.fr';

