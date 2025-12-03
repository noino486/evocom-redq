-- =====================================================
-- Migration complète pour l'Organisation Influenceurs
-- =====================================================
-- Ce fichier contient toutes les migrations nécessaires
-- pour la fonctionnalité "Organisation Influenceurs"
-- =====================================================

-- =====================================================
-- 1. Création des tables principales
-- =====================================================

-- Table des workspaces des influenceurs
CREATE TABLE IF NOT EXISTS influencer_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(influencer_id)
);

-- Table des événements du calendrier
CREATE TABLE IF NOT EXISTS influencer_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES influencer_workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  event_type VARCHAR(50) DEFAULT 'task' CHECK (event_type IN ('task', 'deadline', 'event', 'meeting')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des appels
CREATE TABLE IF NOT EXISTS influencer_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES influencer_workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  call_date DATE NOT NULL,
  call_time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  call_type VARCHAR(50) DEFAULT 'call' CHECK (call_type IN ('call', 'meeting', 'interview', 'collaboration')),
  platform VARCHAR(100),
  meeting_link TEXT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table du contenu à produire
CREATE TABLE IF NOT EXISTS influencer_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES influencer_workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) DEFAULT 'post' CHECK (content_type IN ('post', 'video', 'story', 'reel', 'article', 'other')),
  platform VARCHAR(100),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'validated', 'published', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_by UUID REFERENCES auth.users(id),
  content_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- =====================================================
-- 2. Ajout de la colonne has_active_workspace à user_profiles
-- =====================================================

-- Ajouter la colonne si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'has_active_workspace'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN has_active_workspace BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- =====================================================
-- 3. Ajout de la colonne color aux événements (si nécessaire)
-- =====================================================

-- Supprimer la colonne si elle existe déjà (pour réinitialisation propre)
ALTER TABLE influencer_calendar_events
DROP COLUMN IF EXISTS color;

-- Ajouter la colonne color
ALTER TABLE influencer_calendar_events
ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#3B82F6';

-- Commentaire sur la colonne
COMMENT ON COLUMN influencer_calendar_events.color IS 'Couleur hexadécimale pour l''affichage de l''événement dans le calendrier';

-- Mettre à jour les événements existants qui n'auraient pas de couleur
UPDATE influencer_calendar_events
SET color = '#3B82F6'
WHERE color IS NULL OR color = '';

-- =====================================================
-- 4. Création des index pour améliorer les performances
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_influencer_workspaces_influencer ON influencer_workspaces(influencer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_workspaces_active ON influencer_workspaces(is_active);
CREATE INDEX IF NOT EXISTS idx_calendar_events_workspace ON influencer_calendar_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON influencer_calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_influencer_calls_workspace ON influencer_calls(workspace_id);
CREATE INDEX IF NOT EXISTS idx_influencer_calls_date ON influencer_calls(call_date);
CREATE INDEX IF NOT EXISTS idx_influencer_content_workspace ON influencer_content(workspace_id);
CREATE INDEX IF NOT EXISTS idx_influencer_content_status ON influencer_content(status);
CREATE INDEX IF NOT EXISTS idx_influencer_content_deadline ON influencer_content(deadline);

-- =====================================================
-- 5. Fonction pour mettre à jour has_active_workspace
-- =====================================================

CREATE OR REPLACE FUNCTION update_has_active_workspace()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles
    SET has_active_workspace = TRUE
    WHERE id = NEW.influencer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles
    SET has_active_workspace = EXISTS (
      SELECT 1 FROM influencer_workspaces 
      WHERE influencer_id = OLD.influencer_id
    )
    WHERE id = OLD.influencer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. Trigger pour mettre à jour has_active_workspace
-- =====================================================

DROP TRIGGER IF EXISTS trigger_update_has_active_workspace ON influencer_workspaces;

CREATE TRIGGER trigger_update_has_active_workspace
AFTER INSERT OR DELETE ON influencer_workspaces
FOR EACH ROW
EXECUTE FUNCTION update_has_active_workspace();

-- =====================================================
-- 7. Row Level Security (RLS) Policies
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE influencer_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_content ENABLE ROW LEVEL SECURITY;

-- Policies pour influencer_workspaces
DROP POLICY IF EXISTS "Admins can view all workspaces" ON influencer_workspaces;
CREATE POLICY "Admins can view all workspaces" ON influencer_workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Influencers can view their own workspace" ON influencer_workspaces;
CREATE POLICY "Influencers can view their own workspace" ON influencer_workspaces
  FOR SELECT USING (influencer_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage workspaces" ON influencer_workspaces;
CREATE POLICY "Admins can manage workspaces" ON influencer_workspaces
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

-- Policies pour influencer_calendar_events
DROP POLICY IF EXISTS "Admins can manage all calendar events" ON influencer_calendar_events;
CREATE POLICY "Admins can manage all calendar events" ON influencer_calendar_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Influencers can view their calendar events" ON influencer_calendar_events;
CREATE POLICY "Influencers can view their calendar events" ON influencer_calendar_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM influencer_workspaces
      WHERE influencer_workspaces.id = influencer_calendar_events.workspace_id
      AND influencer_workspaces.influencer_id = auth.uid()
    )
  );

-- Policies pour influencer_calls
DROP POLICY IF EXISTS "Admins can manage all calls" ON influencer_calls;
CREATE POLICY "Admins can manage all calls" ON influencer_calls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Influencers can view their calls" ON influencer_calls;
CREATE POLICY "Influencers can view their calls" ON influencer_calls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM influencer_workspaces
      WHERE influencer_workspaces.id = influencer_calls.workspace_id
      AND influencer_workspaces.influencer_id = auth.uid()
    )
  );

-- Policies pour influencer_content
DROP POLICY IF EXISTS "Admins can manage all content" ON influencer_content;
CREATE POLICY "Admins can manage all content" ON influencer_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Influencers can view their content" ON influencer_content;
CREATE POLICY "Influencers can view their content" ON influencer_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM influencer_workspaces
      WHERE influencer_workspaces.id = influencer_content.workspace_id
      AND influencer_workspaces.influencer_id = auth.uid()
    )
  );

-- =====================================================
-- 8. Fonctions et triggers pour updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_influencer_workspaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_influencer_workspaces_updated_at ON influencer_workspaces;
CREATE TRIGGER trigger_update_influencer_workspaces_updated_at
  BEFORE UPDATE ON influencer_workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_influencer_workspaces_updated_at();

CREATE OR REPLACE FUNCTION update_influencer_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_influencer_calendar_events_updated_at ON influencer_calendar_events;
CREATE TRIGGER trigger_update_influencer_calendar_events_updated_at
  BEFORE UPDATE ON influencer_calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_influencer_calendar_events_updated_at();

CREATE OR REPLACE FUNCTION update_influencer_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_influencer_calls_updated_at ON influencer_calls;
CREATE TRIGGER trigger_update_influencer_calls_updated_at
  BEFORE UPDATE ON influencer_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_influencer_calls_updated_at();

CREATE OR REPLACE FUNCTION update_influencer_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_influencer_content_updated_at ON influencer_content;
CREATE TRIGGER trigger_update_influencer_content_updated_at
  BEFORE UPDATE ON influencer_content
  FOR EACH ROW
  EXECUTE FUNCTION update_influencer_content_updated_at();

-- Trigger pour published_at
CREATE OR REPLACE FUNCTION update_influencer_content_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_influencer_content_published_at ON influencer_content;
CREATE TRIGGER trigger_update_influencer_content_published_at
  BEFORE UPDATE ON influencer_content
  FOR EACH ROW
  EXECUTE FUNCTION update_influencer_content_published_at();

-- =====================================================
-- Migration terminée
-- =====================================================
-- Toutes les tables, index, triggers et policies ont été créés
-- =====================================================

