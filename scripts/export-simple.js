const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportDatabase() {
  try {
    console.log("🔄 Début de l'exportation de la base de données...");

    // Créer le dossier d'export s'il n'existe pas
    const exportDir = path.join(__dirname, '../data-exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = path.join(exportDir, `database-export-${timestamp}.json`);

    // Récupérer toutes les données de chaque table
    const data = {
      exportDate: new Date().toISOString(),
      database: 'video-ia.net',
      tables: {},
    };

    console.log('📊 Récupération des langues...');
    const languages = await prisma.language.findMany();
    data.tables.languages = languages;
    console.log(`   ✅ ${languages.length} langues exportées`);

    console.log('📊 Récupération des catégories...');
    const categories = await prisma.category.findMany();
    data.tables.categories = categories;
    console.log(`   ✅ ${categories.length} catégories exportées`);

    console.log('📊 Récupération des tags...');
    const tags = await prisma.tag.findMany();
    data.tables.tags = tags;
    console.log(`   ✅ ${tags.length} tags exportés`);

    console.log('📊 Récupération des outils...');
    const tools = await prisma.tool.findMany();
    data.tables.tools = tools;
    console.log(`   ✅ ${tools.length} outils exportés`);

    console.log("📊 Récupération des traductions d'outils...");
    const toolTranslations = await prisma.toolTranslation.findMany();
    data.tables.toolTranslations = toolTranslations;
    console.log(`   ✅ ${toolTranslations.length} traductions d'outils exportées`);

    console.log('📊 Récupération des traductions de catégories...');
    const categoryTranslations = await prisma.categoryTranslation.findMany();
    data.tables.categoryTranslations = categoryTranslations;
    console.log(
      `   ✅ ${categoryTranslations.length} traductions de catégories exportées`
    );

    // Écrire les données dans le fichier JSON
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`✅ Exportation terminée !`);
    console.log(`📁 Fichier créé: ${exportPath}`);
    console.log(`📊 Statistiques:`);
    console.log(`   - Langues: ${languages.length}`);
    console.log(`   - Catégories: ${categories.length}`);
    console.log(`   - Tags: ${tags.length}`);
    console.log(`   - Outils: ${tools.length}`);
    console.log(`   - Traductions d'outils: ${toolTranslations.length}`);
    console.log(`   - Traductions de catégories: ${categoryTranslations.length}`);

    // Créer aussi un fichier SQL pour la restauration
    await createSQLBackup(exportPath.replace('.json', '.sql'));
  } catch (error) {
    console.error("❌ Erreur lors de l'exportation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSQLBackup(sqlFilePath) {
  console.log('🔄 Création du fichier SQL de sauvegarde...');

  try {
    // Récupérer les données pour créer les INSERT statements
    const languages = await prisma.language.findMany();
    const categories = await prisma.category.findMany();
    const tags = await prisma.tag.findMany();
    const tools = await prisma.tool.findMany();
    const toolTranslations = await prisma.toolTranslation.findMany();
    const categoryTranslations = await prisma.categoryTranslation.findMany();

    let sqlContent = `-- Export de la base de données video-ia.net
-- Date: ${new Date().toISOString()}
-- Généré automatiquement

-- Réinitialisation des séquences
TRUNCATE TABLE languages CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE tags CASCADE;
TRUNCATE TABLE tools CASCADE;
TRUNCATE TABLE tool_translations CASCADE;
TRUNCATE TABLE category_translations CASCADE;

`;

    // Insérer les langues
    if (languages.length > 0) {
      sqlContent += `-- Insertion des langues\n`;
      languages.forEach(lang => {
        sqlContent += `INSERT INTO languages (code, name, "native_name", "flag_emoji", enabled, "fallback_language", "sort_order", "created_at", "updated_at") VALUES ('${lang.code}', '${lang.name}', '${lang.nativeName}', ${lang.flagEmoji ? `'${lang.flagEmoji}'` : 'NULL'}, ${lang.enabled}, ${lang.fallbackLanguage ? `'${lang.fallbackLanguage}'` : 'NULL'}, ${lang.sortOrder}, '${lang.createdAt.toISOString()}', '${lang.updatedAt.toISOString()}');\n`;
      });
      sqlContent += '\n';
    }

    // Insérer les catégories
    if (categories.length > 0) {
      sqlContent += `-- Insertion des catégories\n`;
      categories.forEach(cat => {
        sqlContent += `INSERT INTO categories (id, name, slug, description, "icon_name", "tool_count", "is_featured", "created_at") VALUES (${cat.id}, '${cat.name}', ${cat.slug ? `'${cat.slug}'` : 'NULL'}, ${cat.description ? `'${cat.description.replace(/'/g, "''")}'` : 'NULL'}, ${cat.iconName ? `'${cat.iconName}'` : 'NULL'}, ${cat.toolCount || 0}, ${cat.isFeatured || false}, '${cat.createdAt.toISOString()}');\n`;
      });
      sqlContent += '\n';
    }

    // Insérer les tags
    if (tags.length > 0) {
      sqlContent += `-- Insertion des tags\n`;
      tags.forEach(tag => {
        sqlContent += `INSERT INTO tags (id, name, slug, "usage_count", "created_at") VALUES (${tag.id}, '${tag.name}', ${tag.slug ? `'${tag.slug}'` : 'NULL'}, ${tag.usageCount || 0}, '${tag.createdAt.toISOString()}');\n`;
      });
      sqlContent += '\n';
    }

    // Insérer les outils
    if (tools.length > 0) {
      sqlContent += `-- Insertion des outils\n`;
      tools.forEach(tool => {
        sqlContent += `INSERT INTO tools (id, "tool_name", "tool_category", "tool_link", overview, "tool_description", "target_audience", "key_features", "use_cases", tags, "image_url", slug, "is_active", featured, "quality_score", "meta_title", "meta_description", "seo_keywords", "view_count", "click_count", "favorite_count", "created_at", "updated_at", "last_checked_at") VALUES (${tool.id}, '${tool.toolName.replace(/'/g, "''")}', ${tool.toolCategory ? `'${tool.toolCategory.replace(/'/g, "''")}'` : 'NULL'}, ${tool.toolLink ? `'${tool.toolLink.replace(/'/g, "''")}'` : 'NULL'}, ${tool.overview ? `'${tool.overview.replace(/'/g, "''")}'` : 'NULL'}, ${tool.toolDescription ? `'${tool.toolDescription.replace(/'/g, "''")}'` : 'NULL'}, ${tool.targetAudience ? `'${tool.targetAudience.replace(/'/g, "''")}'` : 'NULL'}, ${tool.keyFeatures ? `'${tool.keyFeatures.replace(/'/g, "''")}'` : 'NULL'}, ${tool.useCases ? `'${tool.useCases.replace(/'/g, "''")}'` : 'NULL'}, ${tool.tags ? `'${tool.tags.replace(/'/g, "''")}'` : 'NULL'}, ${tool.imageUrl ? `'${tool.imageUrl.replace(/'/g, "''")}'` : 'NULL'}, ${tool.slug ? `'${tool.slug}'` : 'NULL'}, ${tool.isActive !== null ? tool.isActive : 'NULL'}, ${tool.featured !== null ? tool.featured : 'NULL'}, ${tool.qualityScore || 0}, ${tool.metaTitle ? `'${tool.metaTitle.replace(/'/g, "''")}'` : 'NULL'}, ${tool.metaDescription ? `'${tool.metaDescription.replace(/'/g, "''")}'` : 'NULL'}, ${tool.seoKeywords ? `'${tool.seoKeywords.replace(/'/g, "''")}'` : 'NULL'}, ${tool.viewCount || 0}, ${tool.clickCount || 0}, ${tool.favoriteCount || 0}, '${tool.createdAt.toISOString()}', '${tool.updatedAt.toISOString()}', '${tool.lastCheckedAt.toISOString()}');\n`;
      });
      sqlContent += '\n';
    }

    // Insérer les traductions d'outils
    if (toolTranslations.length > 0) {
      sqlContent += `-- Insertion des traductions d'outils\n`;
      toolTranslations.forEach(trans => {
        sqlContent += `INSERT INTO tool_translations (id, "tool_id", "language_code", name, overview, description, "meta_title", "meta_description", "translation_source", "quality_score", "human_reviewed", "created_at", "updated_at") VALUES (${trans.id}, ${trans.toolId}, '${trans.languageCode}', '${trans.name.replace(/'/g, "''")}', ${trans.overview ? `'${trans.overview.replace(/'/g, "''")}'` : 'NULL'}, ${trans.description ? `'${trans.description.replace(/'/g, "''")}'` : 'NULL'}, ${trans.metaTitle ? `'${trans.metaTitle.replace(/'/g, "''")}'` : 'NULL'}, ${trans.metaDescription ? `'${trans.metaDescription.replace(/'/g, "''")}'` : 'NULL'}, '${trans.translationSource}', ${trans.qualityScore}, ${trans.humanReviewed}, '${trans.createdAt.toISOString()}', '${trans.updatedAt.toISOString()}');\n`;
      });
      sqlContent += '\n';
    }

    // Insérer les traductions de catégories
    if (categoryTranslations.length > 0) {
      sqlContent += `-- Insertion des traductions de catégories\n`;
      categoryTranslations.forEach(trans => {
        sqlContent += `INSERT INTO category_translations (id, "category_id", "language_code", name, description, "translation_source", "quality_score", "human_reviewed", "created_at", "updated_at") VALUES (${trans.id}, ${trans.categoryId}, '${trans.languageCode}', '${trans.name.replace(/'/g, "''")}', ${trans.description ? `'${trans.description.replace(/'/g, "''")}'` : 'NULL'}, '${trans.translationSource}', ${trans.qualityScore}, ${trans.humanReviewed}, '${trans.createdAt.toISOString()}', '${trans.updatedAt.toISOString()}');\n`;
      });
      sqlContent += '\n';
    }

    // Réinitialiser les séquences
    sqlContent += `-- Réinitialisation des séquences
SELECT setval('languages_code_seq', (SELECT MAX(code) FROM languages));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('tags_id_seq', (SELECT MAX(id) FROM tags));
SELECT setval('tools_id_seq', (SELECT MAX(id) FROM tools));
SELECT setval('tool_translations_id_seq', (SELECT MAX(id) FROM tool_translations));
SELECT setval('category_translations_id_seq', (SELECT MAX(id) FROM category_translations));
`;

    fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
    console.log(`✅ Fichier SQL créé: ${sqlFilePath}`);
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier SQL:', error);
  }
}

// Exécuter l'exportation
exportDatabase();
