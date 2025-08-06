-- =============================================
-- Script Test Environment pour Migration Multilingue
-- =============================================

-- Créer une table de test avec subset des données
CREATE SCHEMA IF NOT EXISTS test_multilingual;

-- Copier structure tools pour tests
CREATE TABLE test_multilingual.tools_test AS 
SELECT * FROM tools WHERE is_active = true LIMIT 100;

-- Copier categories pour tests  
CREATE TABLE test_multilingual.categories_test AS 
SELECT * FROM categories;

-- Stats baseline pour validation
CREATE TABLE test_multilingual.migration_stats (
  phase VARCHAR(50),
  metric_name VARCHAR(100),
  metric_value NUMERIC,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer stats baseline
INSERT INTO test_multilingual.migration_stats (phase, metric_name, metric_value) VALUES
('PHASE_0', 'total_tools', (SELECT COUNT(*) FROM tools WHERE is_active = true)),
('PHASE_0', 'total_categories', (SELECT COUNT(*) FROM categories)),
('PHASE_0', 'avg_response_time_ms', 14.6),
('PHASE_0', 'baseline_memory_kb', 60);

-- Fonction de validation post-migration
CREATE OR REPLACE FUNCTION test_multilingual.validate_migration_integrity()
RETURNS TABLE(check_name VARCHAR, status VARCHAR, details TEXT) AS $$
BEGIN
  -- Vérifier que tous les outils ont au moins une traduction
  RETURN QUERY
  SELECT 
    'tools_have_translations'::VARCHAR as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR 
      ELSE 'FAIL'::VARCHAR 
    END as status,
    CONCAT('Tools without translations: ', COUNT(*))::TEXT as details
  FROM tools t 
  LEFT JOIN tool_translations tt ON t.id = tt.tool_id 
  WHERE t.is_active = true AND tt.tool_id IS NULL;
  
  -- Vérifier contraintes langue
  RETURN QUERY
  SELECT 
    'valid_language_codes'::VARCHAR as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR 
      ELSE 'FAIL'::VARCHAR 
    END as status,
    CONCAT('Invalid language codes: ', COUNT(*))::TEXT as details
  FROM tool_translations tt 
  WHERE tt.language_code NOT IN ('en', 'fr', 'it', 'es', 'de', 'nl', 'pt');
END;
$$ LANGUAGE plpgsql;

-- Log de démarrage Phase 0
INSERT INTO test_multilingual.migration_stats (phase, metric_name, metric_value) VALUES
('PHASE_0', 'backup_created', 1),
('PHASE_0', 'test_env_ready', 1);