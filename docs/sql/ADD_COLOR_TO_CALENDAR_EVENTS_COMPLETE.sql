-- ============================================
-- Migration COMPLÈTE: Ajouter la colonne color à influencer_calendar_events
-- ============================================
-- Cette migration force la création et rafraîchit le cache PostgREST

-- Étape 1: Supprimer la colonne si elle existe (pour forcer la recréation)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'influencer_calendar_events' 
        AND column_name = 'color'
    ) THEN
        ALTER TABLE influencer_calendar_events DROP COLUMN color;
    END IF;
END $$;

-- Étape 2: Ajouter la colonne avec valeur par défaut
ALTER TABLE influencer_calendar_events
ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#3B82F6';

-- Étape 3: Ajouter le commentaire
COMMENT ON COLUMN influencer_calendar_events.color IS 'Couleur hexadécimale pour l''affichage de l''événement dans le calendrier';

-- Étape 4: Rafraîchir le cache PostgREST (nécessite les droits)
-- Note: Dans Supabase Dashboard, allez dans Settings > API > Rebuild Schema Cache
-- Ou utilisez cette commande si vous avez les droits admin:
NOTIFY pgrst, 'reload schema';

