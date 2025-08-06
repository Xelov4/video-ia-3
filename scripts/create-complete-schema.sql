-- Schéma de base de données complet pour Video-IA.net
-- Basé sur le PRD v2.0 - Support multi-langue et auto-update

-- =====================================================
-- LANGUES SUPPORTÉES
-- =====================================================
CREATE TABLE IF NOT EXISTS languages (
  id VARCHAR(5) PRIMARY KEY,                    -- 'en', 'fr', 'it', etc.
  name VARCHAR(50) NOT NULL,                    -- 'English', 'Français', etc.
  native_name VARCHAR(50) NOT NULL,             -- Nom natif de la langue
  flag_emoji VARCHAR(10),                       -- 🇺🇸, 🇫🇷, etc.
  rtl BOOLEAN DEFAULT FALSE,                    -- Langues de droite à gauche
  enabled BOOLEAN DEFAULT TRUE,
  launch_date DATE,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les langues supportées
INSERT INTO languages (id, name, native_name, flag_emoji, enabled) VALUES
('en', 'English', 'English', '🇺🇸', true),
('fr', 'French', 'Français', '🇫🇷', true),
('it', 'Italian', 'Italiano', '🇮🇹', false),
('es', 'Spanish', 'Español', '🇪🇸', false),
('de', 'German', 'Deutsch', '🇩🇪', false),
('nl', 'Dutch', 'Nederlands', '🇳🇱', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- OUTILS IA (TABLE PRINCIPALE)
-- =====================================================
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,            -- Slug neutre (anglais)
  official_url TEXT NOT NULL,
  
  -- Assets média (neutres)
  screenshot_url TEXT,
  logo_url TEXT,
  gallery_urls TEXT[],
  
  -- Données techniques (neutres)
  pricing_model VARCHAR(20),
  social_links JSONB,
  technical_specs JSONB,
  api_available BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées auto-update
  last_scraped TIMESTAMP WITH TIME ZONE,
  auto_update_enabled BOOLEAN DEFAULT TRUE,
  scraping_errors TEXT[],
  update_frequency VARCHAR(20) DEFAULT 'monthly',
  
  -- Qualité et modération
  status VARCHAR(20) DEFAULT 'published',       -- draft, pending_review, approved, published
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  quality_score INTEGER DEFAULT 0,
  
  -- Statistiques
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TRADUCTIONS D'OUTILS
-- =====================================================
CREATE TABLE IF NOT EXISTS tool_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  language_id VARCHAR(5) REFERENCES languages(id),
  
  -- Contenu traduit
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(150) NOT NULL,                   -- Slug spécifique à la langue
  overview TEXT,
  description TEXT,
  key_features TEXT[],
  use_cases TEXT[],
  target_users TEXT[],
  
  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  keywords TEXT[],
  
  -- Métadonnées de contenu
  ai_generated BOOLEAN DEFAULT FALSE,
  human_reviewed BOOLEAN DEFAULT FALSE,
  quality_score DECIMAL(5,2),
  seo_score DECIMAL(5,2),
  completeness_score DECIMAL(5,2),
  
  -- Métadonnées de traduction
  translation_source VARCHAR(20),               -- 'gemini', 'human', 'imported'
  translator_notes TEXT,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tool_id, language_id)
);

-- =====================================================
-- CATÉGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  
  -- Visuel et ordre
  icon VARCHAR(50),
  color VARCHAR(7),                             -- Couleur hex
  order_index INTEGER DEFAULT 0,
  
  -- Métadonnées
  featured BOOLEAN DEFAULT FALSE,
  enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS category_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  language_id VARCHAR(5) REFERENCES languages(id),
  
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,                   -- Slug spécifique à la langue
  description TEXT,
  
  -- SEO
  seo_title VARCHAR(60),
  seo_description VARCHAR(160),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(category_id, language_id)
);

-- =====================================================
-- RELATIONS OUTILS-CATÉGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS tool_categories (
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (tool_id, category_id)
);

-- =====================================================
-- TAGS
-- =====================================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL,                    -- 'feature', 'industry', 'audience', etc.
  slug VARCHAR(100) UNIQUE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  language_id VARCHAR(5) REFERENCES languages(id),
  
  name VARCHAR(50) NOT NULL,
  description TEXT,
  synonyms TEXT[],
  
  UNIQUE(tag_id, language_id)
);

-- Relations outils-tags
CREATE TABLE IF NOT EXISTS tool_tags (
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, tag_id)
);

-- =====================================================
-- ARTICLES (BLOG)
-- =====================================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) UNIQUE NOT NULL,
  
  -- Métadonnées
  author VARCHAR(100),
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO
  canonical_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  language_id VARCHAR(5) REFERENCES languages(id),
  
  title VARCHAR(200) NOT NULL,
  excerpt TEXT,
  content TEXT,
  
  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  keywords TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(article_id, language_id)
);

-- =====================================================
-- JOBS D'AUTO-UPDATE
-- =====================================================
CREATE TABLE IF NOT EXISTS update_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  
  status VARCHAR(20) DEFAULT 'queued',          -- queued, processing, completed, failed
  priority VARCHAR(10) DEFAULT 'medium',
  
  -- Configuration du job
  languages VARCHAR(5)[],                       -- Langues à mettre à jour
  options JSONB,                                -- UpdateOptions
  
  -- Suivi d'exécution
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Résultats
  result JSONB,                                 -- UpdateResult
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEX POUR PERFORMANCE
-- =====================================================

-- Index principaux
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_featured ON tools(featured);
CREATE INDEX IF NOT EXISTS idx_tools_auto_update ON tools(auto_update_enabled, last_scraped);
CREATE INDEX IF NOT EXISTS idx_tools_quality ON tools(quality_score DESC);

-- Index pour les traductions
CREATE INDEX IF NOT EXISTS idx_tool_translations_language ON tool_translations(language_id, tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_translations_quality ON tool_translations(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_tool_translations_slug ON tool_translations(slug);

-- Index pour les catégories
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(featured, order_index);
CREATE INDEX IF NOT EXISTS idx_categories_enabled ON categories(enabled);
CREATE INDEX IF NOT EXISTS idx_category_translations_language ON category_translations(language_id, category_id);

-- Index pour les jobs
CREATE INDEX IF NOT EXISTS idx_update_jobs_status ON update_jobs(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_update_jobs_tool ON update_jobs(tool_id);

-- Index pour les relations
CREATE INDEX IF NOT EXISTS idx_tool_categories_tool ON tool_categories(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_categories_category ON tool_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_tool_tags_tool ON tool_tags(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_tags_tag ON tool_tags(tag_id);

-- =====================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tools_updated_at 
    BEFORE UPDATE ON tools 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CATÉGORIES DE BASE (ANGLAIS)
-- =====================================================
INSERT INTO categories (slug, icon, color, order_index, featured) VALUES
('ai-assistant', 'bot', '#3B82F6', 1, true),
('content-creation', 'edit', '#10B981', 2, true),
('image-generation', 'image', '#F59E0B', 3, true),
('data-analysis', 'chart', '#8B5CF6', 4, true),
('automation', 'zap', '#EF4444', 5, true),
('chat', 'message-circle', '#06B6D4', 6, true),
('developer-tools', 'code', '#84CC16', 7, true),
('art-generation', 'palette', '#EC4899', 8, true),
('image-editing', 'scissors', '#F97316', 9, true),
('video-generation', 'video', '#8B5CF6', 10, true),
('video-editing', 'film', '#06B6D4', 11, true),
('audio-generation', 'music', '#10B981', 12, true),
('text-generation', 'type', '#3B82F6', 13, true),
('code-generation', 'terminal', '#84CC16', 14, true),
('research', 'search', '#8B5CF6', 15, true)
ON CONFLICT (slug) DO NOTHING;

-- Traductions des catégories (anglais)
INSERT INTO category_translations (category_id, language_id, name, slug, description) 
SELECT 
  c.id,
  'en',
  CASE c.slug
    WHEN 'ai-assistant' THEN 'AI Assistant'
    WHEN 'content-creation' THEN 'Content Creation'
    WHEN 'image-generation' THEN 'Image Generation'
    WHEN 'data-analysis' THEN 'Data Analysis'
    WHEN 'automation' THEN 'Automation'
    WHEN 'chat' THEN 'Chat'
    WHEN 'developer-tools' THEN 'Developer Tools'
    WHEN 'art-generation' THEN 'Art Generation'
    WHEN 'image-editing' THEN 'Image Editing'
    WHEN 'video-generation' THEN 'Video Generation'
    WHEN 'video-editing' THEN 'Video Editing'
    WHEN 'audio-generation' THEN 'Audio Generation'
    WHEN 'text-generation' THEN 'Text Generation'
    WHEN 'code-generation' THEN 'Code Generation'
    WHEN 'research' THEN 'Research'
  END,
  c.slug,
  CASE c.slug
    WHEN 'ai-assistant' THEN 'AI-powered assistants and chatbots'
    WHEN 'content-creation' THEN 'Tools for creating digital content'
    WHEN 'image-generation' THEN 'AI image generation and creation'
    WHEN 'data-analysis' THEN 'Data analysis and visualization tools'
    WHEN 'automation' THEN 'Workflow automation and process optimization'
    WHEN 'chat' THEN 'Chat and messaging applications'
    WHEN 'developer-tools' THEN 'Tools for software developers'
    WHEN 'art-generation' THEN 'AI art and creative generation'
    WHEN 'image-editing' THEN 'Image editing and manipulation'
    WHEN 'video-generation' THEN 'AI video generation and creation'
    WHEN 'video-editing' THEN 'Video editing and post-production'
    WHEN 'audio-generation' THEN 'Audio generation and music creation'
    WHEN 'text-generation' THEN 'Text generation and writing tools'
    WHEN 'code-generation' THEN 'Code generation and programming'
    WHEN 'research' THEN 'Research and analysis tools'
  END
FROM categories c
WHERE c.slug IN (
  'ai-assistant', 'content-creation', 'image-generation', 'data-analysis', 
  'automation', 'chat', 'developer-tools', 'art-generation', 'image-editing',
  'video-generation', 'video-editing', 'audio-generation', 'text-generation',
  'code-generation', 'research'
)
ON CONFLICT (category_id, language_id) DO NOTHING;

-- =====================================================
-- TAGS DE BASE
-- =====================================================
INSERT INTO tags (type, slug) VALUES
-- Features
('feature', 'api'),
('feature', 'free'),
('feature', 'freemium'),
('feature', 'paid'),
('feature', 'enterprise'),
('feature', 'mobile-app'),
('feature', 'web-based'),
('feature', 'desktop'),
('feature', 'collaboration'),
('feature', 'real-time'),
('feature', 'offline'),
('feature', 'cloud-based'),

-- Industries
('industry', 'marketing'),
('industry', 'education'),
('industry', 'healthcare'),
('industry', 'finance'),
('industry', 'e-commerce'),
('industry', 'gaming'),
('industry', 'media'),
('industry', 'consulting'),

-- Audiences
('audience', 'beginners'),
('audience', 'professionals'),
('audience', 'enterprise'),
('audience', 'developers'),
('audience', 'designers'),
('audience', 'marketers'),
('audience', 'students'),
('audience', 'creators')
ON CONFLICT (slug) DO NOTHING;

-- Traductions des tags (anglais)
INSERT INTO tag_translations (tag_id, language_id, name, description) 
SELECT 
  t.id,
  'en',
  CASE t.slug
    WHEN 'api' THEN 'API'
    WHEN 'free' THEN 'Free'
    WHEN 'freemium' THEN 'Freemium'
    WHEN 'paid' THEN 'Paid'
    WHEN 'enterprise' THEN 'Enterprise'
    WHEN 'mobile-app' THEN 'Mobile App'
    WHEN 'web-based' THEN 'Web-based'
    WHEN 'desktop' THEN 'Desktop'
    WHEN 'collaboration' THEN 'Collaboration'
    WHEN 'real-time' THEN 'Real-time'
    WHEN 'offline' THEN 'Offline'
    WHEN 'cloud-based' THEN 'Cloud-based'
    WHEN 'marketing' THEN 'Marketing'
    WHEN 'education' THEN 'Education'
    WHEN 'healthcare' THEN 'Healthcare'
    WHEN 'finance' THEN 'Finance'
    WHEN 'e-commerce' THEN 'E-commerce'
    WHEN 'gaming' THEN 'Gaming'
    WHEN 'media' THEN 'Media'
    WHEN 'consulting' THEN 'Consulting'
    WHEN 'beginners' THEN 'Beginners'
    WHEN 'professionals' THEN 'Professionals'
    WHEN 'enterprise' THEN 'Enterprise'
    WHEN 'developers' THEN 'Developers'
    WHEN 'designers' THEN 'Designers'
    WHEN 'marketers' THEN 'Marketers'
    WHEN 'students' THEN 'Students'
    WHEN 'creators' THEN 'Creators'
  END,
  CASE t.slug
    WHEN 'api' THEN 'API available'
    WHEN 'free' THEN 'Free to use'
    WHEN 'freemium' THEN 'Free with premium features'
    WHEN 'paid' THEN 'Paid service'
    WHEN 'enterprise' THEN 'Enterprise solutions'
    WHEN 'mobile-app' THEN 'Mobile application'
    WHEN 'web-based' THEN 'Web-based tool'
    WHEN 'desktop' THEN 'Desktop application'
    WHEN 'collaboration' THEN 'Team collaboration features'
    WHEN 'real-time' THEN 'Real-time processing'
    WHEN 'offline' THEN 'Offline functionality'
    WHEN 'cloud-based' THEN 'Cloud-based solution'
    WHEN 'marketing' THEN 'Marketing industry'
    WHEN 'education' THEN 'Education sector'
    WHEN 'healthcare' THEN 'Healthcare industry'
    WHEN 'finance' THEN 'Financial services'
    WHEN 'e-commerce' THEN 'E-commerce platforms'
    WHEN 'gaming' THEN 'Gaming industry'
    WHEN 'media' THEN 'Media and entertainment'
    WHEN 'consulting' THEN 'Consulting services'
    WHEN 'beginners' THEN 'Suitable for beginners'
    WHEN 'professionals' THEN 'For professionals'
    WHEN 'enterprise' THEN 'Enterprise users'
    WHEN 'developers' THEN 'For developers'
    WHEN 'designers' THEN 'For designers'
    WHEN 'marketers' THEN 'For marketers'
    WHEN 'students' THEN 'For students'
    WHEN 'creators' THEN 'For content creators'
  END
FROM tags t
ON CONFLICT (tag_id, language_id) DO NOTHING;

-- =====================================================
-- AFFICHAGE DES TABLES CRÉÉES
-- =====================================================
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 