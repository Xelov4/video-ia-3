-- Schema de base de données multilingue pour Video-IA.net
-- Support pour: Allemand, Néerlandais, Italien, Anglais, Portugais, Français, Espagnol

-- Table des langues supportées
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    native_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des langues supportées
INSERT INTO languages (code, name, native_name) VALUES
('de', 'German', 'Deutsch'),
('nl', 'Dutch', 'Nederlands'),
('it', 'Italian', 'Italiano'),
('en', 'English', 'English'),
('pt', 'Portuguese', 'Português'),
('fr', 'French', 'Français'),
('es', 'Spanish', 'Español');

-- Table principale des outils IA
CREATE TABLE ai_tools (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) UNIQUE NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    primary_language_code VARCHAR(2) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    confidence_score INTEGER DEFAULT 0,
    data_completeness INTEGER DEFAULT 0,
    screenshot_url VARCHAR(500),
    logo_url VARCHAR(500),
    pricing_model VARCHAR(50),
    category VARCHAR(100),
    has_free_tier BOOLEAN DEFAULT false,
    has_paid_plans BOOLEAN DEFAULT false,
    has_enterprise BOOLEAN DEFAULT false,
    has_affiliate_program BOOLEAN DEFAULT false,
    first_scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_language_code) REFERENCES languages(code)
);

-- Table des contenus multilingues
CREATE TABLE ai_tool_translations (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    language_code VARCHAR(2) NOT NULL,
    tool_name VARCHAR(200) NOT NULL,
    primary_function TEXT,
    description TEXT,
    meta_title VARCHAR(200),
    meta_description VARCHAR(300),
    pricing_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code),
    UNIQUE(tool_id, language_code)
);

-- Table des caractéristiques (features) multilingues
CREATE TABLE ai_tool_features (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    language_code VARCHAR(2) NOT NULL,
    feature_text TEXT NOT NULL,
    feature_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Table des audiences cibles multilingues
CREATE TABLE ai_tool_audiences (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    language_code VARCHAR(2) NOT NULL,
    audience_text VARCHAR(200) NOT NULL,
    audience_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Table des tags multilingues
CREATE TABLE ai_tool_tags (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    language_code VARCHAR(2) NOT NULL,
    tag_text VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Table des métadonnées originales
CREATE TABLE ai_tool_metadata (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    original_title VARCHAR(500),
    original_content TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    og_title VARCHAR(500),
    og_description TEXT,
    raw_pricing_text TEXT[],
    raw_features_text TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE
);

-- Table des liens sociaux
CREATE TABLE ai_tool_social_links (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE
);

-- Table des informations de contact
CREATE TABLE ai_tool_contact_info (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    contact_type VARCHAR(50) NOT NULL, -- email, phone, address, contact_form, support
    contact_value TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE
);

-- Table des plans de tarification
CREATE TABLE ai_tool_pricing_plans (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    language_code VARCHAR(2) NOT NULL,
    plan_name VARCHAR(200) NOT NULL,
    plan_price VARCHAR(100),
    billing_cycle VARCHAR(20), -- monthly, yearly, one-time
    plan_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Table des caractéristiques des plans de tarification
CREATE TABLE ai_tool_pricing_features (
    id SERIAL PRIMARY KEY,
    pricing_plan_id INTEGER NOT NULL,
    feature_text TEXT NOT NULL,
    feature_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pricing_plan_id) REFERENCES ai_tool_pricing_plans(id) ON DELETE CASCADE
);

-- Table des informations d'affiliation
CREATE TABLE ai_tool_affiliate_info (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    affiliate_program_url VARCHAR(500),
    affiliate_contact_email VARCHAR(200),
    affiliate_contact_form VARCHAR(500),
    affiliate_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE
);

-- Table des actions recommandées multilingues
CREATE TABLE ai_tool_recommended_actions (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    language_code VARCHAR(2) NOT NULL,
    action_text TEXT NOT NULL,
    action_priority VARCHAR(20) DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Table de l'historique des mises à jour
CREATE TABLE ai_tool_update_history (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL,
    update_type VARCHAR(50) NOT NULL, -- scrape, translation, manual
    updated_fields TEXT[],
    update_notes TEXT,
    confidence_before INTEGER,
    confidence_after INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX idx_ai_tools_slug ON ai_tools(slug);
CREATE INDEX idx_ai_tools_category ON ai_tools(category);
CREATE INDEX idx_ai_tools_pricing_model ON ai_tools(pricing_model);
CREATE INDEX idx_ai_tools_active ON ai_tools(is_active);
CREATE INDEX idx_ai_tool_translations_tool_lang ON ai_tool_translations(tool_id, language_code);
CREATE INDEX idx_ai_tool_features_tool_lang ON ai_tool_features(tool_id, language_code);
CREATE INDEX idx_ai_tool_audiences_tool_lang ON ai_tool_audiences(tool_id, language_code);
CREATE INDEX idx_ai_tool_tags_tool_lang ON ai_tool_tags(tool_id, language_code);
CREATE INDEX idx_ai_tool_social_platform ON ai_tool_social_links(platform);
CREATE INDEX idx_ai_tool_pricing_plans_tool_lang ON ai_tool_pricing_plans(tool_id, language_code);

-- Vues pour faciliter les requêtes multilingues
CREATE VIEW ai_tools_with_translations AS
SELECT 
    t.id,
    t.url,
    t.slug,
    t.category,
    t.pricing_model,
    t.screenshot_url,
    t.logo_url,
    t.confidence_score,
    t.data_completeness,
    tr.language_code,
    tr.tool_name,
    tr.primary_function,
    tr.description,
    tr.meta_title,
    tr.meta_description,
    tr.pricing_summary
FROM ai_tools t
LEFT JOIN ai_tool_translations tr ON t.id = tr.tool_id;

CREATE VIEW ai_tools_complete_info AS
SELECT 
    t.*,
    tr.language_code,
    tr.tool_name,
    tr.primary_function,
    tr.description,
    tr.meta_title,
    tr.meta_description,
    tr.pricing_summary,
    array_agg(DISTINCT f.feature_text ORDER BY f.feature_order) as features,
    array_agg(DISTINCT a.audience_text ORDER BY a.audience_order) as target_audiences,
    array_agg(DISTINCT tg.tag_text) as tags
FROM ai_tools t
LEFT JOIN ai_tool_translations tr ON t.id = tr.tool_id
LEFT JOIN ai_tool_features f ON t.id = f.tool_id AND tr.language_code = f.language_code
LEFT JOIN ai_tool_audiences a ON t.id = a.tool_id AND tr.language_code = a.language_code
LEFT JOIN ai_tool_tags tg ON t.id = tg.tool_id AND tr.language_code = tg.language_code
GROUP BY t.id, tr.language_code, tr.tool_name, tr.primary_function, tr.description, tr.meta_title, tr.meta_description, tr.pricing_summary;