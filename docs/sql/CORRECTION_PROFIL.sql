-- ============================================
-- CORRECTION DU PROFIL ET POLITIQUES RLS
-- ============================================
-- 
-- 1. Corriger les produits (il manque "LBNS")
UPDATE user_profiles
SET products = '["STFOUR", "GLBNS"]'::jsonb
WHERE email = 'contact@nb-com.fr';

-- 2. Vérifier le profil
SELECT * FROM user_profiles WHERE email = 'contact@nb-com.fr';

