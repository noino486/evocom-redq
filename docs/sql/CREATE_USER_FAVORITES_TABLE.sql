-- Création de la table user_favorites pour stocker les fournisseurs favoris des utilisateurs
-- Option 1: Table séparée (recommandée)

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL, -- ID de la section pack_sections (fournisseur)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, supplier_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_supplier_id ON user_favorites(supplier_id);

-- RLS (Row Level Security) pour sécuriser les données
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Les utilisateurs ne peuvent voir que leurs propres favoris
CREATE POLICY "Users can view their own favorites"
  ON user_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent insérer leurs propres favoris
CREATE POLICY "Users can insert their own favorites"
  ON user_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent supprimer leurs propres favoris
CREATE POLICY "Users can delete their own favorites"
  ON user_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_user_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_user_favorites_timestamp
  BEFORE UPDATE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_user_favorites_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE user_favorites IS 'Table pour stocker les fournisseurs favoris de chaque utilisateur';
COMMENT ON COLUMN user_favorites.user_id IS 'ID de l''utilisateur (référence à user_profiles)';
COMMENT ON COLUMN user_favorites.supplier_id IS 'ID de la section pack_sections (fournisseur)';

