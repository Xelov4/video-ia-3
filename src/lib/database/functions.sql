-- Fonctions SQL supplémentaires pour PostgreSQL

-- Fonction pour incrémenter le compteur de vues
CREATE OR REPLACE FUNCTION increment_view_count(tool_id INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE ai_tools 
    SET view_count = view_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = tool_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter le compteur de clics
CREATE OR REPLACE FUNCTION increment_click_count(tool_id INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE ai_tools 
    SET click_count = click_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = tool_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour la recherche full-text optimisée avec Supabase
CREATE OR REPLACE FUNCTION search_ai_tools(
    search_query TEXT DEFAULT '',
    category_filter TEXT DEFAULT NULL,
    featured_only BOOLEAN DEFAULT false,
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
    quality_score INTEGER,
    featured BOOLEAN,
    relevance_score REAL
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
        t.quality_score,
        t.featured,
        CASE 
            WHEN search_query = '' THEN 1.0
            ELSE ts_rank(t.search_vector, plainto_tsquery('english', search_query))
        END as relevance_score
    FROM ai_tools t
    WHERE 
        t.is_active = true
        AND (
            search_query = '' 
            OR t.search_vector @@ plainto_tsquery('english', search_query)
            OR t.tool_name ILIKE '%' || search_query || '%'
            OR t.tool_description ILIKE '%' || search_query || '%'
        )
        AND (category_filter IS NULL OR t.tool_category = category_filter)
        AND (featured_only = false OR t.featured = true)
    ORDER BY 
        relevance_score DESC,
        t.quality_score DESC,
        t.view_count DESC,
        t.tool_name
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir des suggestions de tools similaires
CREATE OR REPLACE FUNCTION get_similar_tools(
    input_tool_id INTEGER,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE(
    id INTEGER,
    tool_name VARCHAR(200),
    tool_category VARCHAR(100),
    slug VARCHAR(250),
    overview TEXT,
    image_url TEXT,
    quality_score INTEGER
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
        t.quality_score
    FROM ai_tools t
    WHERE 
        t.is_active = true
        AND t.id != input_tool_id
        AND t.tool_category = (
            SELECT tool_category 
            FROM ai_tools 
            WHERE id = input_tool_id
        )
    ORDER BY 
        t.quality_score DESC,
        t.view_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques globales
CREATE OR REPLACE FUNCTION get_global_stats()
RETURNS TABLE(
    total_tools BIGINT,
    total_categories BIGINT,
    total_tags BIGINT,
    total_views BIGINT,
    total_clicks BIGINT,
    top_category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM ai_tools WHERE is_active = true),
        (SELECT COUNT(*) FROM categories),
        (SELECT COUNT(*) FROM tags),
        (SELECT COALESCE(SUM(view_count), 0) FROM ai_tools WHERE is_active = true),
        (SELECT COALESCE(SUM(click_count), 0) FROM ai_tools WHERE is_active = true),
        (SELECT tool_category 
         FROM ai_tools 
         WHERE is_active = true 
         GROUP BY tool_category 
         ORDER BY COUNT(*) DESC 
         LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour auto-complétion de recherche
CREATE OR REPLACE FUNCTION autocomplete_search(
    search_prefix TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
    suggestion TEXT,
    type TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    -- Suggestions de noms d'outils
    SELECT 
        t.tool_name as suggestion,
        'tool' as type,
        1::BIGINT as count
    FROM ai_tools t
    WHERE 
        t.is_active = true
        AND t.tool_name ILIKE search_prefix || '%'
    ORDER BY t.quality_score DESC, t.view_count DESC
    LIMIT limit_count / 2
    
    UNION ALL
    
    -- Suggestions de catégories
    SELECT 
        c.name as suggestion,
        'category' as type,
        c.tool_count as count
    FROM categories c
    WHERE 
        c.name ILIKE search_prefix || '%'
        AND c.tool_count > 0
    ORDER BY c.tool_count DESC
    LIMIT limit_count / 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue matérialisée pour les statistiques (refresh périodique)
CREATE MATERIALIZED VIEW IF NOT EXISTS tool_stats_summary AS
SELECT 
    tool_category,
    COUNT(*) as tool_count,
    AVG(quality_score) as avg_quality,
    SUM(view_count) as total_views,
    SUM(click_count) as total_clicks,
    COUNT(*) FILTER (WHERE featured = true) as featured_count
FROM ai_tools 
WHERE is_active = true
GROUP BY tool_category
ORDER BY tool_count DESC;

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX IF NOT EXISTS idx_tool_stats_category ON tool_stats_summary(tool_category);

-- Fonction pour rafraîchir les statistiques
CREATE OR REPLACE FUNCTION refresh_tool_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW tool_stats_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politique de sécurité RLS (Row Level Security) pour Supabase
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les outils actifs
CREATE POLICY "Allow public read access to active tools" ON ai_tools
    FOR SELECT USING (is_active = true);

-- Politique de lecture publique pour les catégories
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

-- Politique de lecture publique pour les tags
CREATE POLICY "Allow public read access to tags" ON tags
    FOR SELECT USING (true);

-- Politique de lecture publique pour les liaisons tool_tags
CREATE POLICY "Allow public read access to tool_tags" ON tool_tags
    FOR SELECT USING (true);

-- Trigger pour maintenir les compteurs de catégories à jour
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour l'ancienne catégorie si c'est un UPDATE
    IF TG_OP = 'UPDATE' AND OLD.tool_category != NEW.tool_category THEN
        UPDATE categories 
        SET tool_count = (
            SELECT COUNT(*) 
            FROM ai_tools 
            WHERE tool_category = OLD.tool_category AND is_active = true
        )
        WHERE name = OLD.tool_category;
    END IF;
    
    -- Mettre à jour la nouvelle/actuelle catégorie
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE categories 
        SET tool_count = (
            SELECT COUNT(*) 
            FROM ai_tools 
            WHERE tool_category = NEW.tool_category AND is_active = true
        )
        WHERE name = NEW.tool_category;
    END IF;
    
    -- Pour DELETE, mettre à jour l'ancienne catégorie
    IF TG_OP = 'DELETE' THEN
        UPDATE categories 
        SET tool_count = (
            SELECT COUNT(*) 
            FROM ai_tools 
            WHERE tool_category = OLD.tool_category AND is_active = true
        )
        WHERE name = OLD.tool_category;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ai_tools
    FOR EACH ROW EXECUTE FUNCTION update_category_count();