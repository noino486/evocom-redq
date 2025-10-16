-- Table pour stocker le contenu des mentions légales
CREATE TABLE IF NOT EXISTS legal_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Règle pour s'assurer qu'il n'y a qu'une seule ligne
CREATE UNIQUE INDEX IF NOT EXISTS legal_content_single_row ON legal_content ((1));

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_legal_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS legal_content_updated_at ON legal_content;
CREATE TRIGGER legal_content_updated_at
  BEFORE UPDATE ON legal_content
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_content_updated_at();

-- Insertion du contenu par défaut (optionnel)
-- Vous pouvez décommenter cette section si vous voulez initialiser avec du contenu par défaut
/*
INSERT INTO legal_content (content) VALUES (
  '{
    "introduction": "Les présentes Conditions Générales de Vente et d'\''Utilisation (ci-après « CGV & CGU ») régissent les relations contractuelles entre TRIUM TRADE, société par actions simplifiée immatriculée au RCS de Paris sous le numéro 990 320 590, dont le siège social est situé au 231 rue Saint-Honoré, 75001 Paris, agissant pour la distribution de ses produits sous la marque EVO ECOM (ci-après « EVO ECOM »), et toute personne physique ou morale procédant à un achat ou utilisant le site internet https://evoecom.com (ci-après « le Site »).",
    "articles": [
      {
        "id": 1,
        "title": "Objet",
        "content": "Les présentes CGV & CGU définissent les conditions dans lesquelles EVO ECOM commercialise et met à disposition des contenus numériques, guides, ressources et autres produits en ligne, ainsi que les conditions d'\''utilisation du Site."
      }
    ],
    "legalInfo": {
      "companyName": "TRIUM TRADE, SAS",
      "rcsNumber": "RCS Paris 990 320 590",
      "address": "231 rue Saint-Honoré, 75001 Paris",
      "director": "Thomas Duarte",
      "email": "support@evoecom.com",
      "website": "https://evoecom.com",
      "hosting": "Kajabi LLC, 17100 Laguna Canyon Rd Suite 100, Irvine, CA 92603, États-Unis"
    }
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;
*/

-- Permissions (ajustez selon vos besoins)
-- RLS (Row Level Security) - optionnel
ALTER TABLE legal_content ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Enable read access for authenticated users" ON legal_content
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Enable update access for authenticated users" ON legal_content
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique pour permettre l'insertion aux utilisateurs authentifiés
CREATE POLICY "Enable insert access for authenticated users" ON legal_content
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
