-- ============================================
-- Migration FORCÉE: Ajouter la colonne color à influencer_calendar_events
-- ============================================
-- Cette version force la création même si la colonne existe déjà

-- Supprimer la colonne si elle existe (pour forcer la recréation)
ALTER TABLE influencer_calendar_events
DROP COLUMN IF EXISTS color;

-- Ajouter la colonne
ALTER TABLE influencer_calendar_events
ADD COLUMN color VARCHAR(7) DEFAULT '#3B82F6';

-- Ajouter le commentaire
COMMENT ON COLUMN influencer_calendar_events.color IS 'Couleur hexadécimale pour l''affichage de l''événement dans le calendrier';

-- Rafraîchir le schéma PostgREST (nécessite les droits admin)
-- Note: Cette commande doit être exécutée via l'API Admin ou le dashboard Supabase
-- SELECT pg_notify('pgrst', 'reload schema');

