-- ============================================
-- MIGRATION: Prévention des doublons
-- Ajoute des contraintes et index pour empêcher les doublons
-- ============================================

-- Créer une fonction pour normaliser les URLs (enlever www, https, trailing slash)
CREATE OR REPLACE FUNCTION normalize_url(url TEXT)
RETURNS TEXT AS $$
BEGIN
  IF url IS NULL OR url = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(url, '^https?://', '', 'gi'),
        '^www\.', '', 'gi'
      ),
      '/$', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Créer un index unique sur l'URL normalisée (si pas déjà existant)
-- Note: On ne peut pas créer une contrainte unique directement sur une fonction,
-- donc on va créer un index unique sur une colonne calculée

-- Ajouter une colonne pour stocker l'URL normalisée (si elle n'existe pas déjà)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' AND column_name = 'website_normalized'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN website_normalized TEXT;
  END IF;
END $$;

-- Créer un index sur website_normalized
CREATE INDEX IF NOT EXISTS idx_suppliers_website_normalized 
ON suppliers(website_normalized) 
WHERE website_normalized IS NOT NULL;

-- Créer une fonction trigger pour mettre à jour website_normalized automatiquement
CREATE OR REPLACE FUNCTION update_website_normalized()
RETURNS TRIGGER AS $$
BEGIN
  NEW.website_normalized = normalize_url(NEW.website);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_website_normalized ON suppliers;
CREATE TRIGGER trigger_update_website_normalized
  BEFORE INSERT OR UPDATE OF website ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_website_normalized();

-- Mettre à jour les URLs existantes
UPDATE suppliers 
SET website_normalized = normalize_url(website)
WHERE website_normalized IS NULL AND website IS NOT NULL;

-- Créer une fonction pour vérifier les doublons avant insertion
CREATE OR REPLACE FUNCTION check_supplier_duplicate()
RETURNS TRIGGER AS $$
DECLARE
  existing_count INTEGER;
  normalized_url TEXT;
BEGIN
  normalized_url = normalize_url(NEW.website);
  
  IF normalized_url IS NOT NULL THEN
    -- Vérifier s'il existe déjà un fournisseur avec la même URL normalisée
    SELECT COUNT(*) INTO existing_count
    FROM suppliers
    WHERE website_normalized = normalized_url
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status != 'deleted';
    
    IF existing_count > 0 THEN
      RAISE EXCEPTION 'Un fournisseur avec le site web "%" existe déjà', NEW.website;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour vérifier les doublons
DROP TRIGGER IF EXISTS trigger_check_supplier_duplicate ON suppliers;
CREATE TRIGGER trigger_check_supplier_duplicate
  BEFORE INSERT OR UPDATE OF website ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION check_supplier_duplicate();

-- Commentaires
COMMENT ON FUNCTION normalize_url IS 'Normalise une URL en enlevant le protocole, www et le trailing slash';
COMMENT ON COLUMN suppliers.website_normalized IS 'URL normalisée pour faciliter la détection des doublons';
COMMENT ON FUNCTION check_supplier_duplicate IS 'Vérifie qu''il n''y a pas de doublon avant l''insertion ou la mise à jour';

