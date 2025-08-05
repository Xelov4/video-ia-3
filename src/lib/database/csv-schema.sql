-- Schema optimisé pour les données CSV existantes
-- 16,827 outils IA avec structure simplifiée pour MVP rapide

-- Extension pour la recherche full-text
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Table principale des outils (adaptée aux données CSV)
CREATE TABLE ai_tools (
    id SERIAL PRIMARY KEY,
    
    -- Données CSV directes
    tool_name VARCHAR(200) NOT NULL,
    tool_category VARCHAR(100) NOT NULL,
    tool_link TEXT NOT NULL,
    overview TEXT,
    tool_description TEXT,
    target_audience TEXT,
    key_features TEXT,
    use_cases TEXT,
    tags TEXT,
    image_url TEXT,
    
    -- Données générées/calculées
    slug VARCHAR(250) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    quality_score INTEGER DEFAULT 50,
    
    -- SEO auto-généré
    meta_title VARCHAR(200),
    meta_description VARCHAR(300),
    seo_keywords TEXT,
    
    -- Compteurs
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index full-text
    search_vector tsvector
);

-- Table des catégories (extraite des données CSV)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    tool_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des tags (extraite des données CSV)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison outils-tags (many-to-many)
CREATE TABLE tool_tags (
    tool_id INTEGER REFERENCES ai_tools(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (tool_id, tag_id)
);

-- Table pour les statistiques quotidiennes
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_tools INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    top_category VARCHAR(100),
    top_search_term VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- Index pour les performances
CREATE INDEX idx_ai_tools_slug ON ai_tools(slug);
CREATE INDEX idx_ai_tools_category ON ai_tools(tool_category);
CREATE INDEX idx_ai_tools_active ON ai_tools(is_active);
CREATE INDEX idx_ai_tools_featured ON ai_tools(featured);
CREATE INDEX idx_ai_tools_quality ON ai_tools(quality_score DESC);
CREATE INDEX idx_ai_tools_created ON ai_tools(created_at DESC);
CREATE INDEX idx_ai_tools_views ON ai_tools(view_count DESC);

-- Index pour la recherche full-text
CREATE INDEX idx_ai_tools_search ON ai_tools USING gin(search_vector);
CREATE INDEX idx_ai_tools_name_trgm ON ai_tools USING gin(tool_name gin_trgm_ops);
CREATE INDEX idx_ai_tools_desc_trgm ON ai_tools USING gin(tool_description gin_trgm_ops);

-- Index pour les catégories et tags
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tool_tags_tool ON tool_tags(tool_id);
CREATE INDEX idx_tool_tags_tag ON tool_tags(tag_id);

-- Fonction pour générer le slug automatiquement
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(unaccent(trim(input_text)), '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le vecteur de recherche
CREATE OR REPLACE FUNCTION update_search_vector() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.tool_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.tool_category, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.overview, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.tool_description, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(NEW.tags, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour le vecteur de recherche
CREATE TRIGGER update_ai_tools_search_vector
    BEFORE INSERT OR UPDATE ON ai_tools
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- Fonction pour générer meta titre SEO
CREATE OR REPLACE FUNCTION generate_meta_title(tool_name TEXT, category TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN tool_name || ' - ' || category || ' AI Tool | Video-IA.net';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer meta description SEO
CREATE OR REPLACE FUNCTION generate_meta_description(tool_name TEXT, overview TEXT)
RETURNS TEXT AS $$
DECLARE
    description TEXT;
BEGIN
    description := COALESCE(overview, 'Découvrez ' || tool_name || ', un outil IA innovant.');
    -- Limiter à 155 caractères
    IF length(description) > 155 THEN
        description := left(description, 152) || '...';
    END IF;
    RETURN description;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer slug et SEO
CREATE OR REPLACE FUNCTION auto_generate_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Générer le slug si pas fourni
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.tool_name);
        -- Assurer l'unicité
        WHILE EXISTS (SELECT 1 FROM ai_tools WHERE slug = NEW.slug AND id != COALESCE(NEW.id, 0)) LOOP
            NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
        END LOOP;
    END IF;
    
    -- Générer meta_title si pas fourni
    IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
        NEW.meta_title := generate_meta_title(NEW.tool_name, NEW.tool_category);
    END IF;
    
    -- Générer meta_description si pas fourni
    IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
        NEW.meta_description := generate_meta_description(NEW.tool_name, NEW.overview);
    END IF;
    
    -- Mettre à jour updated_at
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_ai_tools_fields
    BEFORE INSERT OR UPDATE ON ai_tools
    FOR EACH ROW EXECUTE FUNCTION auto_generate_fields();

-- Vue pour les outils avec compteurs de tags
CREATE VIEW ai_tools_with_stats AS
SELECT 
    t.*,
    c.name as category_name,
    c.slug as category_slug,
    COALESCE(tag_count.count, 0) as tag_count,
    array_agg(tags.name) FILTER (WHERE tags.name IS NOT NULL) as tag_names
FROM ai_tools t
LEFT JOIN categories c ON c.name = t.tool_category
LEFT JOIN (
    SELECT tool_id, COUNT(*) as count 
    FROM tool_tags 
    GROUP BY tool_id
) tag_count ON tag_count.tool_id = t.id
LEFT JOIN tool_tags tt ON tt.tool_id = t.id
LEFT JOIN tags ON tags.id = tt.tag_id
WHERE t.is_active = true
GROUP BY t.id, c.name, c.slug, tag_count.count;

-- Vue pour les statistiques de catégories
CREATE VIEW category_stats AS
SELECT 
    c.*,
    COUNT(t.id) as actual_tool_count,
    COALESCE(AVG(t.view_count), 0) as avg_views,
    COALESCE(SUM(t.click_count), 0) as total_clicks
FROM categories c
LEFT JOIN ai_tools t ON t.tool_category = c.name AND t.is_active = true
GROUP BY c.id;

-- Fonction de recherche full-text optimisée
CREATE OR REPLACE FUNCTION search_tools(
    search_query TEXT,
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id INTEGER,
    tool_name VARCHAR(200),
    tool_category VARCHAR(100),
    slug VARCHAR(250),
    overview TEXT,
    image_url TEXT,
    view_count INTEGER,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.tool_name,
        t.tool_category,
        t.slug,
        t.overview,
        t.image_url,
        t.view_count,
        ts_rank(t.search_vector, plainto_tsquery('english', search_query)) as rank
    FROM ai_tools t
    WHERE 
        t.is_active = true
        AND (
            t.search_vector @@ plainto_tsquery('english', search_query)
            OR t.tool_name ILIKE '%' || search_query || '%'
            OR t.tool_description ILIKE '%' || search_query || '%'
        )
        AND (category_filter IS NULL OR t.tool_category = category_filter)
    ORDER BY 
        rank DESC,
        t.view_count DESC,
        t.tool_name
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Insérer quelques catégories de base (seront complétées par le script d'import)
INSERT INTO categories (name, slug, description, is_featured) VALUES
('AI Assistant', 'ai-assistant', 'Assistants IA polyvalents pour diverses tâches', true),
('Content Creation', 'content-creation', 'Outils de création de contenu automatisée', true),
('Image Generation', 'image-generation', 'Génération d\'images par intelligence artificielle', true),
('Video Generation', 'video-generation', 'Création de vidéos avec l\'IA', true),
('Audio generation', 'audio-generation', 'Génération audio et synthèse vocale', true),
('Text-to-speech', 'text-to-speech', 'Conversion de texte en parole naturelle', true)
ON CONFLICT (name) DO NOTHING;