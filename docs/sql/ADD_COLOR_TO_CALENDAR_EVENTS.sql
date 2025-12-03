-- ============================================
-- Migration: Ajouter la colonne color à influencer_calendar_events
-- ============================================

ALTER TABLE influencer_calendar_events
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';

COMMENT ON COLUMN influencer_calendar_events.color IS 'Couleur hexadécimale pour l''affichage de l''événement dans le calendrier';

