-- ============================================
-- Mettre à jour les événements existants sans couleur
-- ============================================

-- Mettre à jour tous les événements qui n'ont pas de couleur
UPDATE influencer_calendar_events
SET color = '#3B82F6'
WHERE color IS NULL OR color = '';

