-- ============================================
-- TABLE: influencer_workspaces
-- Espace de travail dédié pour chaque influenceur
-- ============================================

CREATE TABLE IF NOT EXISTS influencer_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(influencer_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_influencer_workspaces_influencer ON influencer_workspaces(influencer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_workspaces_active ON influencer_workspaces(is_active);

-- ============================================
-- TABLE: influencer_calendar_events
-- Événements du calendrier pour chaque influenceur
-- ============================================

CREATE TABLE IF NOT EXISTS influencer_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES influencer_workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  event_type VARCHAR(50) DEFAULT 'task' CHECK (event_type IN ('task', 'deadline', 'event', 'meeting')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_workspace ON influencer_calendar_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON influencer_calendar_events(event_date);

-- ============================================
-- TABLE: influencer_calls
-- Planning des appels pour chaque influenceur
-- ============================================

CREATE TABLE IF NOT EXISTS influencer_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES influencer_workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  call_date DATE NOT NULL,
  call_time TIME NOT NULL,
  duration INTEGER, -- Durée en minutes
  call_type VARCHAR(50) DEFAULT 'call' CHECK (call_type IN ('call', 'meeting', 'interview', 'collaboration')),
  platform VARCHAR(100), -- Zoom, Teams, Google Meet, etc.
  meeting_link TEXT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_influencer_calls_workspace ON influencer_calls(workspace_id);
CREATE INDEX IF NOT EXISTS idx_influencer_calls_date ON influencer_calls(call_date);

-- ============================================
-- TABLE: influencer_content
-- Contenu à produire pour chaque influenceur
-- ============================================

CREATE TABLE IF NOT EXISTS influencer_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES influencer_workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) DEFAULT 'post' CHECK (content_type IN ('post', 'video', 'story', 'reel', 'article', 'other')),
  platform VARCHAR(100), -- Instagram, TikTok, YouTube, etc.
  deadline DATE,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'validated', 'published', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_by UUID REFERENCES auth.users(id),
  content_url TEXT, -- Lien vers le contenu produit (si applicable)
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_influencer_content_workspace ON influencer_content(workspace_id);
CREATE INDEX IF NOT EXISTS idx_influencer_content_status ON influencer_content(status);
CREATE INDEX IF NOT EXISTS idx_influencer_content_deadline ON influencer_content(deadline);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- Workspaces
ALTER TABLE influencer_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all workspaces"
  ON influencer_workspaces
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

CREATE POLICY "Influencers can view their own workspace"
  ON influencer_workspaces
  FOR SELECT
  USING (influencer_id = auth.uid());

CREATE POLICY "Admins can manage workspaces"
  ON influencer_workspaces
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

-- Calendar Events
ALTER TABLE influencer_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all calendar events"
  ON influencer_calendar_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

CREATE POLICY "Influencers can view their calendar events"
  ON influencer_calendar_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM influencer_workspaces
      WHERE influencer_workspaces.id = influencer_calendar_events.workspace_id
      AND influencer_workspaces.influencer_id = auth.uid()
    )
  );

-- Calls
ALTER TABLE influencer_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all calls"
  ON influencer_calls
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

CREATE POLICY "Influencers can view their calls"
  ON influencer_calls
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM influencer_workspaces
      WHERE influencer_workspaces.id = influencer_calls.workspace_id
      AND influencer_workspaces.influencer_id = auth.uid()
    )
  );

-- Content
ALTER TABLE influencer_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all content"
  ON influencer_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.access_level = 4
      AND user_profiles.is_active = TRUE
    )
  );

CREATE POLICY "Influencers can view their content"
  ON influencer_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM influencer_workspaces
      WHERE influencer_workspaces.id = influencer_content.workspace_id
      AND influencer_workspaces.influencer_id = auth.uid()
    )
  );

-- ============================================
-- Triggers pour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_influencer_workspaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER trigger_update_influencer_content_published_at
  BEFORE UPDATE ON influencer_content
  FOR EACH ROW
  EXECUTE FUNCTION update_influencer_content_published_at();

