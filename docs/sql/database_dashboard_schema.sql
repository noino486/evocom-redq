-- ============================================
-- SCHÉMA DASHBOARD AVEC 4 NIVEAUX D'ACCÈS
-- ============================================

-- ============================================
-- TABLE: user_profiles (Profils utilisateurs avec niveaux)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  access_level INTEGER NOT NULL DEFAULT 1 CHECK (access_level BETWEEN 1 AND 4),
  -- Niveaux:
  -- 1: Produit 1 seulement
  -- 2: Produits 1 + 2
  -- 3: Support
  -- 4: Admin (accès complet)
  products JSONB DEFAULT '[]'::jsonb, -- Produits accessibles: ["STFOUR", "GLBNS"]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_access_level ON user_profiles(access_level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- RLS (Row Level Security) - Politiques de sécurité
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Fonctions helper pour vérifier les permissions (bypass RLS avec SECURITY DEFINER)
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

-- Politique: Les admins peuvent voir tous les profils (utilise la fonction helper)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin_user() = true);

-- Politique: Les supports peuvent voir les profils de niveau 1-3
CREATE POLICY "Support can view non-admin profiles"
  ON user_profiles FOR SELECT
  USING (
    is_support_or_admin() = true AND
    access_level < 4
  );

-- Politique: Les admins peuvent tout faire
CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  USING (is_admin_user() = true)
  WITH CHECK (is_admin_user() = true);

-- Politique: Les utilisateurs peuvent mettre à jour leur propre profil (après invitation)
-- Note: Pour l'activation spécifique, utilisez la fonction activate_own_profile()
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fonction pour activer son propre profil (utilisée après définition du mot de passe)
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

-- Permissions pour la fonction
GRANT EXECUTE ON FUNCTION activate_own_profile() TO authenticated;


-- ============================================
-- FONCTION: Créer ou mettre à jour un profil utilisateur
-- ============================================
CREATE OR REPLACE FUNCTION create_user_profile(
  p_email VARCHAR,
  p_access_level INTEGER,
  p_products JSONB,
  p_password VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_record RECORD;
  v_result JSONB;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    -- Créer un nouvel utilisateur si le mot de passe est fourni
    IF p_password IS NOT NULL THEN
      -- Note: En production, utilisez l'API Supabase Admin pour créer l'utilisateur
      -- car l'insertion directe dans auth.users nécessite des privilèges superuser
      RAISE EXCEPTION 'Pour créer un utilisateur, utilisez l''API Supabase Auth ou le webhook';
    ELSE
      RAISE EXCEPTION 'Email existe mais pas de profil. Utilisez create_user_profile_for_existing_user';
    END IF;
  END IF;

  -- Créer ou mettre à jour le profil
  INSERT INTO user_profiles (id, email, access_level, products, updated_at)
  VALUES (v_user_id, p_email, p_access_level, p_products, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    access_level = EXCLUDED.access_level,
    products = EXCLUDED.products,
    updated_at = NOW(),
    is_active = TRUE;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'message', 'Profil créé/mis à jour avec succès'
  );
END;
$$;


-- ============================================
-- FONCTION: Mettre à jour le niveau d'accès
-- ============================================
CREATE OR REPLACE FUNCTION update_user_access_level(
  p_user_id UUID,
  p_access_level INTEGER,
  p_products JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que seul un admin peut faire ça
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND access_level = 4
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier les niveaux d''accès';
  END IF;

  UPDATE user_profiles
  SET 
    access_level = p_access_level,
    products = COALESCE(p_products, products),
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Niveau d''accès mis à jour'
  );
END;
$$;


-- ============================================
-- FONCTION: Révoquer l'accès d'un utilisateur
-- ============================================
CREATE OR REPLACE FUNCTION revoke_user_access(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que seul un admin peut faire ça
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND access_level = 4
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent révoquer l''accès';
  END IF;

  UPDATE user_profiles
  SET 
    is_active = FALSE,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Accès révoqué avec succès'
  );
END;
$$;


-- ============================================
-- FONCTION: Restaurer l'accès d'un utilisateur
-- ============================================
CREATE OR REPLACE FUNCTION restore_user_access(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que seul un admin peut faire ça
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND access_level = 4
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent restaurer l''accès';
  END IF;

  UPDATE user_profiles
  SET 
    is_active = TRUE,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Accès restauré avec succès'
  );
END;
$$;


-- ============================================
-- FONCTION: Obtenir les statistiques des utilisateurs (Admin uniquement)
-- ============================================
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND access_level = 4
  ) THEN
    RAISE EXCEPTION 'Accès refusé. Administrateur requis.';
  END IF;

  SELECT jsonb_build_object(
    'total_users', COUNT(*),
    'active_users', COUNT(*) FILTER (WHERE is_active = TRUE),
    'inactive_users', COUNT(*) FILTER (WHERE is_active = FALSE),
    'by_level', jsonb_object_agg(
      access_level::text,
      level_count
    ),
    'users_by_product', (
      SELECT jsonb_object_agg(product, user_count)
      FROM (
        SELECT 
          jsonb_array_elements_text(products) as product,
          COUNT(*) as user_count
        FROM user_profiles
        WHERE is_active = TRUE
        GROUP BY product
      ) product_stats
    )
  )
  INTO v_stats
  FROM (
    SELECT 
      access_level,
      COUNT(*) as level_count
    FROM user_profiles
    GROUP BY access_level
  ) level_stats;

  RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$;


-- ============================================
-- TRIGGER: Mettre à jour updated_at automatiquement
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- TRIGGER: Mettre à jour last_login
-- ============================================
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET last_login = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Ce trigger sera déclenché par un trigger sur auth.users
-- qui devra être configuré dans Supabase Dashboard


-- ============================================
-- VUE: Vue simplifiée pour les utilisateurs actifs
-- ============================================
CREATE OR REPLACE VIEW active_users_view AS
SELECT 
  id,
  email,
  access_level,
  products,
  created_at,
  last_login,
  is_active
FROM user_profiles
WHERE is_active = TRUE;


-- ============================================
-- FIN DU SCHÉMA
-- ============================================

