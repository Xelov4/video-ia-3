-- Migration: Remove qualityScore columns
-- Date: 2024-12-19
-- Description: Remove qualityScore columns from tools, tool_translations, and category_translations tables

-- Remove quality_score column from tools table
ALTER TABLE tools DROP COLUMN IF EXISTS quality_score;

-- Remove quality_score column from tool_translations table
ALTER TABLE tool_translations DROP COLUMN IF EXISTS quality_score;

-- Remove quality_score column from category_translations table
ALTER TABLE category_translations DROP COLUMN IF EXISTS quality_score;

-- Verify the columns have been removed
SELECT 
    table_name,
    column_name
FROM information_schema.columns 
WHERE table_name IN ('tools', 'tool_translations', 'category_translations')
    AND column_name = 'quality_score';
