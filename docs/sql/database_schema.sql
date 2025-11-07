-- ============================================
-- SCHÉMA DE BASE DE DONNÉES COMPLET
-- Pour le site EVO ECOM
-- ============================================

-- ============================================
-- 1. TABLE: affiliate_config (Influenceurs/Affiliés)
-- ============================================
CREATE TABLE IF NOT EXISTS affiliate_config (
  id BIGSERIAL PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_config_key ON affiliate_config(config_key);

-- Données initiales des influenceurs
INSERT INTO affiliate_config (config_key, config_value, updated_at)
VALUES (
  'affiliates',
  '{
    "APPLE": {
      "STFOUR": "https://apple.com/gs",
      "GLBNS": "https://apple.com/gb"
    },
    "MIC": {
      "STFOUR": "https://mic.com/gs",
      "GLBNS": "https://mic.com/gb"
    }
  }'::jsonb,
  NOW()
)
ON CONFLICT (config_key) 
DO UPDATE SET 
  config_value = EXCLUDED.config_value,
  updated_at = NOW();

-- Pages de paiement par défaut
INSERT INTO affiliate_config (config_key, config_value, updated_at)
VALUES (
  'defaultPages',
  '{
    "STFOUR": "https://triumtrade.thrivecart.com/starter-fournisseurs-og/",
    "GLBNS": "https://triumtrade.thrivecart.com/global-business-og/"
  }'::jsonb,
  NOW()
)
ON CONFLICT (config_key) 
DO UPDATE SET 
  config_value = EXCLUDED.config_value,
  updated_at = NOW();


-- ============================================
-- 2. TABLE: legal_content (Contenu Légal)
-- ============================================
CREATE TABLE IF NOT EXISTS legal_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT legal_content_single_row CHECK (id = 1)
);

-- Contenu légal par défaut
INSERT INTO legal_content (id, content, updated_at)
VALUES (
  1,
  '{
    "introduction": "Les présentes Conditions Générales de Vente et d''Utilisation (ci-après « CGV & CGU ») régissent les relations contractuelles entre TRIUM TRADE, société par actions simplifiée immatriculée au RCS de Paris sous le numéro 990 320 590, dont le siège social est situé au 231 rue Saint-Honoré, 75001 Paris, agissant pour la distribution de ses produits sous la marque EVO ECOM (ci-après « EVO ECOM »), et toute personne physique ou morale procédant à un achat ou utilisant le site internet https://evoecom.com (ci-après « le Site »).",
    "articles": [
      {
        "id": 1,
        "title": "Objet",
        "content": "Les présentes CGV & CGU définissent les conditions dans lesquelles EVO ECOM commercialise et met à disposition des contenus numériques, guides, ressources et autres produits en ligne, ainsi que les conditions d''utilisation du Site."
      },
      {
        "id": 2,
        "title": "Produits et Services",
        "content": "EVO ECOM propose à la vente des fichiers numériques et packs de ressources destinés aux entrepreneurs et utilisateurs souhaitant développer leur activité. Ces contenus peuvent comprendre notamment :\n\n• Des fichiers PDF (guides, check-lists, modèles)\n• Des archives compressées (ZIP) contenant plusieurs ressources\n• Des accès en ligne via une plateforme sécurisée\n• Des bonus (contacts, templates, guides additionnels)\n\nLes produits proposés sont décrits le plus précisément possible sur le Site. Toutefois, des différences minimes peuvent exister, ce que le Client reconnaît et accepte."
      },
      {
        "id": 3,
        "title": "Prix",
        "content": "Les prix sont indiqués en euros, toutes taxes comprises (TTC).\n\nEVO ECOM se réserve le droit de modifier ses prix à tout moment, étant précisé que le prix appliqué est celui en vigueur au moment de la validation de la commande."
      },
      {
        "id": 4,
        "title": "Commande et Paiement",
        "content": "Les commandes sont passées exclusivement en ligne sur le Site.\n\nLe Client sélectionne le produit souhaité, procède au paiement via les moyens sécurisés proposés et reçoit après confirmation de la transaction :\n\n• Soit un lien de téléchargement direct (fichiers numériques)\n• Soit un courriel avec identifiants d''accès pour la plateforme en ligne, selon le produit acheté.\n\nLe paiement est exigible immédiatement lors de la commande."
      },
      {
        "id": 5,
        "title": "Livraison des Produits",
        "content": "La livraison des produits est exclusivement numérique :\n\n• Par téléchargement immédiat depuis le Site\n• Ou par l''envoi d''un email contenant les identifiants d''accès\n\nLe Client est responsable de fournir une adresse email valide lors de l''achat."
      },
      {
        "id": 6,
        "title": "Droits d''Utilisation",
        "content": "Les fichiers et contenus achetés sont destinés à un usage strictement personnel et non transférable.\n\nToute reproduction, diffusion, partage ou revente non autorisée est strictement interdite et pourra donner lieu à des poursuites judiciaires."
      },
      {
        "id": 7,
        "title": "Propriété Intellectuelle",
        "content": "La marque EVO ECOM, ainsi que l''ensemble des contenus (textes, images, vidéos, guides, bases de données, logos, etc.), sont protégés par le droit de la propriété intellectuelle et restent la propriété exclusive de TRIUM TRADE ou de ses partenaires.\n\nToute reproduction totale ou partielle, modification ou exploitation non autorisée est interdite."
      },
      {
        "id": 8,
        "title": "Rétractation, Retours et Remboursements",
        "content": "Conformément à la législation applicable sur les produits numériques :\n\n• Aucun remboursement ne sera effectué après téléchargement des fichiers\n• Aucun remboursement ne sera accordé si le Client s''est connecté à la plateforme, l''accès constituant une consommation du service numérique\n• Toute réclamation doit être transmise à support@evoecom.com dans un délai de 14 jours suivant l''achat en cas de défaut manifeste du produit"
      },
      {
        "id": 9,
        "title": "Responsabilité",
        "content": "EVO ECOM ne saurait être tenu responsable de l''usage fait par le Client des informations et ressources fournies.\n\nLe Client est seul responsable de la mise en œuvre et de l''exploitation des conseils ou guides achetés."
      },
      {
        "id": 10,
        "title": "Données Personnelles",
        "content": "Les données collectées lors des commandes sont nécessaires au traitement des achats.\n\nEVO ECOM s''engage à respecter la réglementation en vigueur (RGPD).\n\nLe Client dispose d''un droit d''accès, de rectification, d''opposition et de suppression de ses données en écrivant à : support@evoecom.com."
      },
      {
        "id": 11,
        "title": "Utilisation du Site",
        "content": "En accédant au Site, le Client s''engage à :\n\n• Ne pas porter atteinte à son bon fonctionnement\n• Ne pas extraire ou réutiliser massivement les données\n• Ne pas utiliser le Site à des fins frauduleuses ou illicites"
      },
      {
        "id": 12,
        "title": "Cookies et Liens Hypertextes",
        "content": "Le Site peut utiliser des cookies pour améliorer l''expérience utilisateur. L''utilisateur peut les désactiver dans les paramètres de son navigateur.\n\nLe Site peut contenir des liens vers des sites tiers ; EVO ECOM décline toute responsabilité quant à leur contenu."
      },
      {
        "id": 13,
        "title": "Loi Applicable et Juridiction Compétente",
        "content": "Les présentes CGV & CGU sont régies par le droit français.\n\nEn cas de litige, les parties rechercheront une solution amiable. À défaut, compétence expresse est attribuée aux tribunaux compétents du ressort du siège social de TRIUM TRADE à Paris."
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
  }'::jsonb,
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();


-- ============================================
-- 3. TABLE: visitors (Tracking des Visiteurs avec UTM)
-- ============================================
CREATE TABLE IF NOT EXISTS visitors (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_mobile BOOLEAN DEFAULT FALSE,
  is_in_app BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  screen_resolution VARCHAR(50),
  viewport_size VARCHAR(50),
  language VARCHAR(10),
  timezone VARCHAR(100),
  affiliate_code VARCHAR(50),
  
  -- Colonnes UTM
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_timestamp ON visitors(timestamp);
CREATE INDEX IF NOT EXISTS idx_visitors_affiliate_code ON visitors(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_visitors_utm_campaign ON visitors(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_visitors_utm_source ON visitors(utm_source);
CREATE INDEX IF NOT EXISTS idx_visitors_device_type ON visitors(device_type);
CREATE INDEX IF NOT EXISTS idx_visitors_utm_medium ON visitors(utm_medium);


-- ============================================
-- 4. TABLE: link_clicks (Tracking des Clics)
-- ============================================
CREATE TABLE IF NOT EXISTS link_clicks (
  id BIGSERIAL PRIMARY KEY,
  link_url TEXT NOT NULL,
  link_type VARCHAR(50),
  link_text TEXT,
  affiliate_name VARCHAR(100),
  product_id VARCHAR(100),
  user_agent TEXT,
  referrer TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_url TEXT,
  is_mobile BOOLEAN DEFAULT FALSE,
  is_in_app BOOLEAN DEFAULT FALSE,
  click_source VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_link_clicks_timestamp ON link_clicks(timestamp);
CREATE INDEX IF NOT EXISTS idx_link_clicks_affiliate_name ON link_clicks(affiliate_name);
CREATE INDEX IF NOT EXISTS idx_link_clicks_product_id ON link_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_type ON link_clicks(link_type);
CREATE INDEX IF NOT EXISTS idx_link_clicks_click_source ON link_clicks(click_source);
CREATE INDEX IF NOT EXISTS idx_link_clicks_is_mobile ON link_clicks(is_mobile);
CREATE INDEX IF NOT EXISTS idx_link_clicks_is_in_app ON link_clicks(is_in_app);


-- ============================================
-- FIN DU SCHÉMA
-- ============================================

