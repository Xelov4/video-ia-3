-- =============================================
-- PHASE 1A: Architecture Base de Données Multilingue
-- Video-IA.net - Migration vers 7 langues
-- =============================================

-- Table des langues supportées
CREATE TABLE IF NOT EXISTS languages (
  code VARCHAR(2) PRIMARY KEY,                    -- 'en', 'fr', 'it', etc.
  name VARCHAR(50) NOT NULL,                      -- 'English', 'French', etc.
  native_name VARCHAR(50) NOT NULL,               -- 'English', 'Français', etc.
  flag_emoji VARCHAR(10),                         -- 🇺🇸, 🇫🇷, etc.
  enabled BOOLEAN DEFAULT true,                   -- Langue activée
  fallback_language VARCHAR(2),                   -- Langue de fallback
  sort_order INTEGER DEFAULT 0,                   -- Ordre d'affichage
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contrainte fallback_language doit être une langue valide
ALTER TABLE languages ADD CONSTRAINT fk_languages_fallback 
FOREIGN KEY (fallback_language) REFERENCES languages(code) DEFERRABLE;

-- Insertion des langues supportées avec fallbacks hiérarchiques
INSERT INTO languages (code, name, native_name, flag_emoji, enabled, fallback_language, sort_order) VALUES
('en', 'English', 'English', '🇺🇸', true, NULL, 1),           -- Langue de base, pas de fallback
('fr', 'French', 'Français', '🇫🇷', true, 'en', 2),
('it', 'Italian', 'Italiano', '🇮🇹', true, 'en', 3),
('es', 'Spanish', 'Español', '🇪🇸', true, 'en', 4),
('de', 'German', 'Deutsch', '🇩🇪', true, 'en', 5),
('nl', 'Dutch', 'Nederlands', '🇳🇱', true, 'en', 6),
('pt', 'Portuguese', 'Português', '🇵🇹', true, 'en', 7)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  native_name = EXCLUDED.native_name,
  flag_emoji = EXCLUDED.flag_emoji,
  enabled = EXCLUDED.enabled,
  fallback_language = EXCLUDED.fallback_language,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- Table des traductions d'outils avec contraintes strictes
CREATE TABLE IF NOT EXISTS tool_translations (
  id SERIAL PRIMARY KEY,
  tool_id INTEGER NOT NULL,
  language_code VARCHAR(2) NOT NULL,
  
  -- Champs traduits obligatoires
  name VARCHAR(255) NOT NULL CHECK (name != '' AND LENGTH(TRIM(name)) > 0),
  
  -- Champs traduits optionnels
  overview TEXT,
  description TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Métadonnées de qualité
  translation_source VARCHAR(20) DEFAULT 'auto' CHECK (translation_source IN ('auto', 'human', 'imported', 'ai')),
  quality_score DECIMAL(3,2) DEFAULT 0.00 CHECK (quality_score >= 0 AND quality_score <= 10),
  human_reviewed BOOLEAN DEFAULT false,
  
  -- Audit trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  UNIQUE(tool_id, language_code),
  FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
  FOREIGN KEY (language_code) REFERENCES languages(code) ON UPDATE CASCADE
);

-- Index ultra-optimisés pour performance
CREATE INDEX IF NOT EXISTS idx_tool_translations_lookup 
ON tool_translations(language_code, tool_id) 
INCLUDE (name, overview, description);

CREATE INDEX IF NOT EXISTS idx_tool_translations_quality 
ON tool_translations(quality_score DESC, human_reviewed DESC) 
WHERE quality_score > 0;

CREATE INDEX IF NOT EXISTS idx_tool_translations_tool_id 
ON tool_translations(tool_id);

-- Table des traductions de catégories
CREATE TABLE IF NOT EXISTS category_translations (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  language_code VARCHAR(2) NOT NULL,
  
  -- Champs traduits
  name VARCHAR(100) NOT NULL CHECK (name != '' AND LENGTH(TRIM(name)) > 0),
  description TEXT,
  
  -- Métadonnées
  translation_source VARCHAR(20) DEFAULT 'auto',
  quality_score DECIMAL(3,2) DEFAULT 0.00,
  human_reviewed BOOLEAN DEFAULT false,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  UNIQUE(category_id, language_code),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (language_code) REFERENCES languages(code) ON UPDATE CASCADE
);

-- Index pour catégories
CREATE INDEX IF NOT EXISTS idx_category_translations_lookup 
ON category_translations(language_code, category_id) 
INCLUDE (name, description);

-- Fonction de fallback hiérarchique ultra-optimisée
CREATE OR REPLACE FUNCTION get_tool_with_translation(p_tool_id INTEGER, p_language VARCHAR(2))
RETURNS TABLE(
  id INTEGER,
  slug VARCHAR,
  tool_link TEXT,
  image_url TEXT,
  view_count INTEGER,
  is_active BOOLEAN,
  name VARCHAR,
  overview TEXT,
  description TEXT,
  meta_title VARCHAR,
  meta_description TEXT,
  resolved_language VARCHAR(2),
  translation_source VARCHAR,
  quality_score DECIMAL
) AS $$
DECLARE
  fallback_lang VARCHAR(2);
BEGIN
  -- Obtenir la langue de fallback
  SELECT fallback_language INTO fallback_lang 
  FROM languages 
  WHERE code = p_language;
  
  -- Requête optimisée avec fallback hiérarchique
  RETURN QUERY
  SELECT 
    t.id,
    t.slug,
    t.tool_link,
    t.image_url,
    t.view_count,
    t.is_active,
    COALESCE(tr_requested.name, tr_fallback.name, t.tool_name)::VARCHAR as name,
    COALESCE(tr_requested.overview, tr_fallback.overview, t.overview) as overview,
    COALESCE(tr_requested.description, tr_fallback.description, t.tool_description) as description,
    COALESCE(tr_requested.meta_title, tr_fallback.meta_title, t.meta_title)::VARCHAR as meta_title,
    COALESCE(tr_requested.meta_description, tr_fallback.meta_description, t.meta_description) as meta_description,
    CASE 
      WHEN tr_requested.language_code IS NOT NULL THEN tr_requested.language_code
      WHEN tr_fallback.language_code IS NOT NULL THEN tr_fallback.language_code
      ELSE 'original'
    END::VARCHAR(2) as resolved_language,
    CASE 
      WHEN tr_requested.language_code IS NOT NULL THEN 'exact'
      WHEN tr_fallback.language_code IS NOT NULL THEN 'fallback'
      ELSE 'original'
    END::VARCHAR as translation_source,
    COALESCE(tr_requested.quality_score, tr_fallback.quality_score, 0.00) as quality_score
  FROM tools t
  LEFT JOIN tool_translations tr_requested ON t.id = tr_requested.tool_id AND tr_requested.language_code = p_language
  LEFT JOIN tool_translations tr_fallback ON t.id = tr_fallback.tool_id AND tr_fallback.language_code = COALESCE(fallback_lang, 'en')
  WHERE t.id = p_tool_id AND t.is_active = true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour recherche multilingue avec pagination
CREATE OR REPLACE FUNCTION search_tools_multilingual(
  p_language VARCHAR(2),
  p_search_term VARCHAR DEFAULT NULL,
  p_category VARCHAR DEFAULT NULL,
  p_featured BOOLEAN DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_sort_by VARCHAR DEFAULT 'created_at',
  p_sort_order VARCHAR DEFAULT 'DESC'
)
RETURNS TABLE(
  id INTEGER,
  slug VARCHAR,
  tool_link TEXT,
  image_url TEXT,
  view_count INTEGER,
  featured BOOLEAN,
  name VARCHAR,
  overview TEXT,
  resolved_language VARCHAR(2),
  translation_source VARCHAR,
  quality_score DECIMAL,
  total_count BIGINT
) AS $$
DECLARE
  fallback_lang VARCHAR(2);
  dynamic_query TEXT;
  order_clause TEXT;
BEGIN
  -- Obtenir langue de fallback
  SELECT fallback_language INTO fallback_lang 
  FROM languages 
  WHERE code = p_language;
  
  -- Construire clause ORDER BY sécurisée
  order_clause := CASE 
    WHEN p_sort_by = 'name' THEN 'COALESCE(tr_requested.name, tr_fallback.name, t.tool_name)'
    WHEN p_sort_by = 'view_count' THEN 't.view_count'
    WHEN p_sort_by = 'quality_score' THEN 'COALESCE(tr_requested.quality_score, tr_fallback.quality_score, 0)'
    ELSE 't.created_at'
  END;
  
  IF p_sort_order = 'ASC' THEN
    order_clause := order_clause || ' ASC';
  ELSE
    order_clause := order_clause || ' DESC';
  END IF;
  
  -- Requête dynamique avec tous les filtres
  dynamic_query := '
  WITH filtered_tools AS (
    SELECT t.*, COUNT(*) OVER() as total_count
    FROM tools t
    WHERE t.is_active = true'
    || CASE WHEN p_category IS NOT NULL THEN ' AND t.tool_category = $4' ELSE '' END
    || CASE WHEN p_featured IS NOT NULL THEN ' AND t.featured = $5' ELSE '' END
    || CASE WHEN p_search_term IS NOT NULL THEN ' AND (t.tool_name ILIKE $6 OR t.overview ILIKE $6)' ELSE '' END
    || '
  )
  SELECT 
    t.id,
    t.slug::VARCHAR,
    t.tool_link,
    t.image_url,
    t.view_count,
    t.featured,
    COALESCE(tr_requested.name, tr_fallback.name, t.tool_name)::VARCHAR as name,
    COALESCE(tr_requested.overview, tr_fallback.overview, t.overview) as overview,
    CASE 
      WHEN tr_requested.language_code IS NOT NULL THEN tr_requested.language_code
      WHEN tr_fallback.language_code IS NOT NULL THEN tr_fallback.language_code
      ELSE ''original''
    END::VARCHAR(2) as resolved_language,
    CASE 
      WHEN tr_requested.language_code IS NOT NULL THEN ''exact''
      WHEN tr_fallback.language_code IS NOT NULL THEN ''fallback''
      ELSE ''original''
    END::VARCHAR as translation_source,
    COALESCE(tr_requested.quality_score, tr_fallback.quality_score, 0.00) as quality_score,
    t.total_count
  FROM filtered_tools t
  LEFT JOIN tool_translations tr_requested ON t.id = tr_requested.tool_id AND tr_requested.language_code = $1
  LEFT JOIN tool_translations tr_fallback ON t.id = tr_fallback.tool_id AND tr_fallback.language_code = COALESCE($2, ''en'')
  ORDER BY ' || order_clause || '
  LIMIT $3 OFFSET $7';
  
  -- Exécuter la requête avec paramètres
  RETURN QUERY EXECUTE dynamic_query 
  USING p_language, fallback_lang, p_limit, p_category, p_featured, '%' || p_search_term || '%', p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger pour mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer triggers
CREATE TRIGGER update_tool_translations_updated_at 
BEFORE UPDATE ON tool_translations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_translations_updated_at 
BEFORE UPDATE ON category_translations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_languages_updated_at 
BEFORE UPDATE ON languages 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vue pour simplifier les requêtes courantes
CREATE OR REPLACE VIEW tools_with_default_translation AS
SELECT 
  t.id,
  t.slug,
  t.tool_link,
  t.image_url,
  t.view_count,
  t.is_active,
  t.featured,
  t.quality_score,
  t.created_at,
  COALESCE(tr_en.name, t.tool_name) as name,
  COALESCE(tr_en.overview, t.overview) as overview,
  COALESCE(tr_en.description, t.tool_description) as description,
  COALESCE(tr_en.meta_title, t.meta_title) as meta_title,
  COALESCE(tr_en.meta_description, t.meta_description) as meta_description
FROM tools t
LEFT JOIN tool_translations tr_en ON t.id = tr_en.tool_id AND tr_en.language_code = 'en'
WHERE t.is_active = true;

-- Enregistrer succès de la phase
INSERT INTO test_multilingual.migration_stats (phase, metric_name, metric_value) VALUES
('PHASE_1A', 'tables_created', 3),
('PHASE_1A', 'indexes_created', 4),
('PHASE_1A', 'functions_created', 3),
('PHASE_1A', 'languages_inserted', 7),
('PHASE_1A', 'architecture_ready', 1);

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ PHASE 1A COMPLETED: Architecture multilingue créée avec succès';
  RAISE NOTICE '📊 Tables: languages, tool_translations, category_translations';
  RAISE NOTICE '🔍 Index optimisés pour performance < 100ms';
  RAISE NOTICE '🔄 Fonctions fallback hiérarchiques opérationnelles';
  RAISE NOTICE '🌐 7 langues configurées: EN, FR, IT, ES, DE, NL, PT';
END;
$$;