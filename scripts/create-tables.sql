-- Script de création des tables pour Video-IA.net
-- Compatible PostgreSQL 12+

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(100),
    tool_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des tags
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des outils IA
CREATE TABLE IF NOT EXISTS ai_tools (
    id SERIAL PRIMARY KEY,
    tool_name VARCHAR(500) NOT NULL,
    tool_category VARCHAR(255) NOT NULL,
    tool_link VARCHAR(1000) NOT NULL,
    overview TEXT,
    tool_description TEXT,
    target_audience TEXT,
    key_features TEXT,
    use_cases TEXT,
    tags TEXT,
    image_url VARCHAR(1000),
    slug VARCHAR(500) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    quality_score INTEGER DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    seo_keywords TEXT,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison outils-tags (many-to-many)
CREATE TABLE IF NOT EXISTS tool_tags (
    tool_id INTEGER REFERENCES ai_tools(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (tool_id, tag_id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_ai_tools_slug ON ai_tools(slug);
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools(tool_category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_featured ON ai_tools(featured);
CREATE INDEX IF NOT EXISTS idx_ai_tools_active ON ai_tools(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_tools_quality ON ai_tools(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_tools_updated_at 
    BEFORE UPDATE ON ai_tools 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour le compteur d'outils par catégorie
CREATE OR REPLACE FUNCTION update_category_tool_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories 
        SET tool_count = tool_count + 1 
        WHERE name = NEW.tool_category;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories 
        SET tool_count = tool_count - 1 
        WHERE name = OLD.tool_category;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.tool_category != OLD.tool_category THEN
            UPDATE categories 
            SET tool_count = tool_count + 1 
            WHERE name = NEW.tool_category;
            UPDATE categories 
            SET tool_count = tool_count - 1 
            WHERE name = OLD.tool_category;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_category_tool_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ai_tools
    FOR EACH ROW EXECUTE FUNCTION update_category_tool_count();

-- Insérer quelques catégories de base
INSERT INTO categories (name, slug, description, icon_name, is_featured) VALUES
('Video Editing', 'video-editing', 'Outils d''édition vidéo avec IA', 'video', true),
('Video Generation', 'video-generation', 'Génération de vidéos avec IA', 'play', true),
('Video Enhancement', 'video-enhancement', 'Amélioration de qualité vidéo', 'star', true),
('Video Analysis', 'video-analysis', 'Analyse et détection dans les vidéos', 'search', true),
('Video Compression', 'video-compression', 'Compression et optimisation vidéo', 'compress', false),
('Video Effects', 'video-effects', 'Effets spéciaux et filtres vidéo', 'magic', false),
('Video Transcription', 'video-transcription', 'Transcription automatique de vidéos', 'file-text', false),
('Video Translation', 'video-translation', 'Traduction et sous-titrage vidéo', 'globe', false)
ON CONFLICT (name) DO NOTHING;

-- Afficher les tables créées
SELECT table_name, column_count 
FROM (
    SELECT 
        t.table_name,
        COUNT(c.column_name) as column_count
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    GROUP BY t.table_name
) tables
ORDER BY table_name; 