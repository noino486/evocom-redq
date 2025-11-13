-- ============================================
-- TABLE: settings
-- Stocke les paramètres globaux éditables depuis l'admin
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Exemple d'initialisation du lien Discord
INSERT INTO settings (key, value, description)
VALUES (
  'discord_link',
  'https://discord.gg/Hhvme4gN',
  'Lien d’invitation vers la communauté Discord'
)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- TABLE: sales
-- Enregistre chaque vente de pack réalisée
-- ============================================

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pack_id TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_pack_id ON sales(pack_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);


