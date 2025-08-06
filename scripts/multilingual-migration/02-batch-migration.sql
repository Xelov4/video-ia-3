-- =============================================
-- PHASE 1B: Migration par Batches Sécurisée
-- Duplication 16,765 outils × 7 langues = ~117K traductions
-- =============================================

-- Fonction de migration par batches avec rollback et monitoring
CREATE OR REPLACE FUNCTION migrate_tools_multilingual_batches(
  p_batch_size INTEGER DEFAULT 1000,
  p_max_batches INTEGER DEFAULT NULL,
  p_test_mode BOOLEAN DEFAULT false
)
RETURNS TABLE(
  batch_number INTEGER,
  tools_processed INTEGER,
  translations_created INTEGER,
  errors_count INTEGER,
  batch_duration_ms INTEGER,
  cumulative_processed INTEGER,
  estimated_remaining_minutes INTEGER
) AS $$
DECLARE
  current_batch INTEGER := 1;
  total_tools INTEGER;
  processed_tools INTEGER := 0;
  batch_start_time TIMESTAMP;
  batch_end_time TIMESTAMP;
  batch_duration INTEGER;
  avg_duration_per_batch NUMERIC := 0;
  tools_in_batch INTEGER;
  translations_in_batch INTEGER;
  errors_in_batch INTEGER;
  batch_tools RECORD;
  start_id INTEGER := 0;
  target_languages VARCHAR[] := ARRAY['en', 'fr', 'it', 'es', 'de', 'nl', 'pt'];
  lang VARCHAR;
BEGIN
  -- Obtenir le nombre total d'outils à migrer
  SELECT COUNT(*) INTO total_tools 
  FROM tools 
  WHERE is_active = true 
  AND (NOT p_test_mode OR id <= 100); -- Mode test limite à 100 outils
  
  -- Log début migration
  RAISE NOTICE '🚀 DÉBUT MIGRATION: % outils à traiter en batches de %', total_tools, p_batch_size;
  RAISE NOTICE '📊 Mode: % | Langues: % | Estimation: % traductions', 
    CASE WHEN p_test_mode THEN 'TEST' ELSE 'PRODUCTION' END,
    array_length(target_languages, 1),
    total_tools * array_length(target_languages, 1);
  
  -- Boucle de migration par batches
  WHILE processed_tools < total_tools AND (p_max_batches IS NULL OR current_batch <= p_max_batches) LOOP
    batch_start_time := clock_timestamp();
    tools_in_batch := 0;
    translations_in_batch := 0;
    errors_in_batch := 0;
    
    BEGIN
      -- Sélectionner le batch d'outils
      FOR batch_tools IN 
        SELECT t.id, t.tool_name, t.overview, t.tool_description, t.meta_title, t.meta_description
        FROM tools t
        WHERE t.is_active = true 
        AND t.id > start_id
        AND (NOT p_test_mode OR t.id <= 100)
        ORDER BY t.id
        LIMIT p_batch_size
      LOOP
        tools_in_batch := tools_in_batch + 1;
        
        -- Insérer traductions pour toutes les langues
        FOREACH lang IN ARRAY target_languages LOOP
          BEGIN
            INSERT INTO tool_translations (
              tool_id, 
              language_code, 
              name, 
              overview, 
              description, 
              meta_title, 
              meta_description,
              translation_source,
              quality_score
            ) VALUES (
              batch_tools.id,
              lang,
              batch_tools.tool_name,
              batch_tools.overview,
              batch_tools.tool_description,
              batch_tools.meta_title,
              batch_tools.meta_description,
              CASE WHEN lang = 'en' THEN 'imported' ELSE 'auto' END,
              CASE WHEN lang = 'en' THEN 10.00 ELSE 7.50 END -- Score plus haut pour EN source
            ) ON CONFLICT (tool_id, language_code) DO NOTHING;
            
            translations_in_batch := translations_in_batch + 1;
            
          EXCEPTION WHEN OTHERS THEN
            errors_in_batch := errors_in_batch + 1;
            RAISE WARNING 'Erreur outil % langue %: %', batch_tools.id, lang, SQLERRM;
          END;
        END LOOP;
        
        start_id := batch_tools.id;
      END LOOP;
      
      processed_tools := processed_tools + tools_in_batch;
      batch_end_time := clock_timestamp();
      batch_duration := EXTRACT(EPOCH FROM (batch_end_time - batch_start_time)) * 1000;
      
      -- Calculer durée moyenne et estimation
      IF current_batch = 1 THEN
        avg_duration_per_batch := batch_duration;
      ELSE
        avg_duration_per_batch := (avg_duration_per_batch * (current_batch - 1) + batch_duration) / current_batch;
      END IF;
      
      -- Commit après chaque batch pour éviter lock long
      COMMIT;
      
      -- Log progress
      IF current_batch % 5 = 0 OR current_batch = 1 THEN
        RAISE NOTICE '✅ Batch % | Outils: % | Traductions: % | Erreurs: % | Durée: %ms | Progression: %/%',
          current_batch, tools_in_batch, translations_in_batch, errors_in_batch, 
          batch_duration, processed_tools, total_tools;
      END IF;
      
      -- Retourner stats du batch
      RETURN QUERY SELECT 
        current_batch,
        tools_in_batch,
        translations_in_batch,
        errors_in_batch,
        batch_duration,
        processed_tools,
        CASE 
          WHEN processed_tools >= total_tools THEN 0
          ELSE ROUND(((total_tools - processed_tools)::NUMERIC / p_batch_size) * (avg_duration_per_batch / 60000))::INTEGER
        END;
      
      current_batch := current_batch + 1;
      
      -- Pause courte pour éviter saturation
      PERFORM pg_sleep(0.1);
      
    EXCEPTION WHEN OTHERS THEN
      errors_in_batch := errors_in_batch + tools_in_batch * array_length(target_languages, 1);
      RAISE WARNING '❌ ERREUR CRITIQUE Batch %: %', current_batch, SQLERRM;
      
      -- Retourner stats d'erreur
      RETURN QUERY SELECT 
        current_batch,
        0,
        0,
        errors_in_batch,
        0,
        processed_tools,
        -1; -- Indication d'erreur
      
      current_batch := current_batch + 1;
    END;
  END LOOP;
  
  -- Log fin migration
  RAISE NOTICE '🎉 MIGRATION TERMINÉE: % outils traités, % traductions créées',
    processed_tools, processed_tools * array_length(target_languages, 1);
  
  -- Enregistrer stats finales
  INSERT INTO test_multilingual.migration_stats (phase, metric_name, metric_value) VALUES
    ('PHASE_1B', 'total_tools_migrated', processed_tools),
    ('PHASE_1B', 'total_translations_created', processed_tools * array_length(target_languages, 1)),
    ('PHASE_1B', 'batches_processed', current_batch - 1),
    ('PHASE_1B', 'avg_duration_per_batch_ms', avg_duration_per_batch);
END;
$$ LANGUAGE plpgsql;

-- Fonction de validation post-migration
CREATE OR REPLACE FUNCTION validate_migration_completeness()
RETURNS TABLE(
  check_name VARCHAR,
  status VARCHAR,
  expected_count BIGINT,
  actual_count BIGINT,
  success_rate NUMERIC,
  details TEXT
) AS $$
BEGIN
  -- Vérifier nombre total de traductions
  RETURN QUERY
  WITH expected AS (
    SELECT COUNT(*) * 7 as expected_total
    FROM tools WHERE is_active = true
  ),
  actual AS (
    SELECT COUNT(*) as actual_total
    FROM tool_translations
  )
  SELECT 
    'total_translations'::VARCHAR as check_name,
    CASE 
      WHEN a.actual_total >= e.expected_total * 0.95 THEN 'PASS'::VARCHAR 
      ELSE 'FAIL'::VARCHAR 
    END as status,
    e.expected_total,
    a.actual_total,
    ROUND((a.actual_total::NUMERIC / e.expected_total) * 100, 2) as success_rate,
    CONCAT('Expected: ', e.expected_total, ', Got: ', a.actual_total)::TEXT as details
  FROM expected e, actual a;
  
  -- Vérifier répartition par langue
  RETURN QUERY
  SELECT 
    CONCAT('translations_', lang.code)::VARCHAR as check_name,
    CASE 
      WHEN COALESCE(tt.translation_count, 0) >= tool_count * 0.95 THEN 'PASS'::VARCHAR 
      ELSE 'FAIL'::VARCHAR 
    END as status,
    tool_count as expected_count,
    COALESCE(tt.translation_count, 0) as actual_count,
    ROUND((COALESCE(tt.translation_count, 0)::NUMERIC / tool_count) * 100, 2) as success_rate,
    CONCAT(lang.native_name, ' - ', COALESCE(tt.translation_count, 0), '/', tool_count)::TEXT as details
  FROM languages lang
  CROSS JOIN (SELECT COUNT(*) as tool_count FROM tools WHERE is_active = true) tc
  LEFT JOIN (
    SELECT language_code, COUNT(*) as translation_count 
    FROM tool_translations 
    GROUP BY language_code
  ) tt ON lang.code = tt.language_code
  WHERE lang.enabled = true
  ORDER BY lang.sort_order;
  
  -- Vérifier intégrité des contraintes
  RETURN QUERY
  SELECT 
    'constraint_violations'::VARCHAR as check_name,
    CASE WHEN violation_count = 0 THEN 'PASS'::VARCHAR ELSE 'FAIL'::VARCHAR END as status,
    0::BIGINT as expected_count,
    violation_count,
    CASE WHEN violation_count = 0 THEN 100.00 ELSE 0.00 END as success_rate,
    CONCAT('Violations trouvées: ', violation_count)::TEXT as details
  FROM (
    SELECT COUNT(*) as violation_count
    FROM tool_translations tt
    LEFT JOIN tools t ON tt.tool_id = t.id
    LEFT JOIN languages l ON tt.language_code = l.code
    WHERE t.id IS NULL OR l.code IS NULL OR tt.name IS NULL OR tt.name = ''
  ) v;
END;
$$ LANGUAGE plpgsql;

-- Fonction de rollback d'urgence
CREATE OR REPLACE FUNCTION emergency_rollback_migration()
RETURNS TEXT AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Compter avant suppression
  SELECT COUNT(*) INTO deleted_count FROM tool_translations;
  
  -- Supprimer toutes les traductions (garde la structure)
  DELETE FROM tool_translations;
  
  -- Remettre compteurs à zéro dans stats
  INSERT INTO test_multilingual.migration_stats (phase, metric_name, metric_value) VALUES
    ('ROLLBACK', 'translations_deleted', deleted_count),
    ('ROLLBACK', 'rollback_executed', 1);
  
  RETURN CONCAT('ROLLBACK EXÉCUTÉ: ', deleted_count, ' traductions supprimées');
END;
$$ LANGUAGE plpgsql;

-- Fonction optimisée pour migration catégories
CREATE OR REPLACE FUNCTION migrate_categories_multilingual()
RETURNS INTEGER AS $$
DECLARE
  category_record RECORD;
  translations_created INTEGER := 0;
  target_languages VARCHAR[] := ARRAY['en', 'fr', 'it', 'es', 'de', 'nl', 'pt'];
  lang VARCHAR;
BEGIN
  FOR category_record IN 
    SELECT id, name, description FROM categories
  LOOP
    FOREACH lang IN ARRAY target_languages LOOP
      BEGIN
        INSERT INTO category_translations (
          category_id,
          language_code,
          name,
          description,
          translation_source,
          quality_score
        ) VALUES (
          category_record.id,
          lang,
          category_record.name,
          category_record.description,
          CASE WHEN lang = 'en' THEN 'imported' ELSE 'auto' END,
          CASE WHEN lang = 'en' THEN 10.00 ELSE 7.50 END
        ) ON CONFLICT (category_id, language_code) DO NOTHING;
        
        translations_created := translations_created + 1;
        
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erreur catégorie % langue %: %', category_record.id, lang, SQLERRM;
      END;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '✅ Migration catégories terminée: % traductions créées', translations_created;
  RETURN translations_created;
END;
$$ LANGUAGE plpgsql;

-- Message de préparation
DO $$
BEGIN
  RAISE NOTICE '📋 PHASE 1B - Scripts de migration par batches créés';
  RAISE NOTICE '⚙️  Fonctions disponibles:';
  RAISE NOTICE '   - migrate_tools_multilingual_batches(batch_size, max_batches, test_mode)';
  RAISE NOTICE '   - validate_migration_completeness()';
  RAISE NOTICE '   - emergency_rollback_migration()';
  RAISE NOTICE '   - migrate_categories_multilingual()';
  RAISE NOTICE '🚨 Prêt pour migration: 16,765 outils → ~117K traductions';
END;
$$;