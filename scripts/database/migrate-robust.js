#!/usr/bin/env node

/**
 * Script de migration robuste pour importer les données CSV
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Charger les variables d'environnement
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnvFile('.env.local');

async function migrateData() {
  console.log('🚀 Démarrage de la migration robuste...\n');
  
  try {
    // 1. Vérifier que le fichier CSV existe
    const csvPath = path.join(process.cwd(), 'data', 'working_database_clean.csv');
    if (!fs.existsSync(csvPath)) {
      console.log('❌ Fichier CSV nettoyé non trouvé. Exécutez d\'abord analyze-and-clean-csv.js');
      return;
    }
    
    console.log('✅ Fichier CSV trouvé:', csvPath);
    
    // 2. Créer les tables avec la structure appropriée
    console.log('\n📋 Création des tables...');
    
    const createTablesSQL = `
      -- Supprimer les tables existantes
      DROP TABLE IF EXISTS tool_tags CASCADE;
      DROP TABLE IF EXISTS tool_categories CASCADE;
      DROP TABLE IF EXISTS tag_translations CASCADE;
      DROP TABLE IF EXISTS category_translations CASCADE;
      DROP TABLE IF EXISTS tool_translations CASCADE;
      DROP TABLE IF EXISTS tags CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS tools CASCADE;
      
      -- Créer les tables avec la structure simple
      CREATE TABLE tools (
        id SERIAL PRIMARY KEY,
        tool_name VARCHAR(255) NOT NULL,
        tool_category VARCHAR(100),
        tool_link TEXT,
        overview TEXT,
        tool_description TEXT,
        target_audience TEXT,
        key_features TEXT,
        use_cases TEXT,
        tags TEXT,
        image_url TEXT,
        slug VARCHAR(255) UNIQUE,
        is_active BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        quality_score INTEGER DEFAULT 0,
        meta_title VARCHAR(255),
        meta_description TEXT,
        seo_keywords TEXT,
        view_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        favorite_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE,
        description TEXT,
        icon_name VARCHAR(50),
        tool_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) UNIQUE,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Écrire le SQL dans un fichier temporaire
    fs.writeFileSync('/tmp/create_tables.sql', createTablesSQL);
    await execAsync(`sudo -u postgres psql -d video_ia_net -f /tmp/create_tables.sql`);
    console.log('✅ Tables créées avec succès');
    
    // 3. Donner les permissions
    console.log('\n🔐 Attribution des permissions...');
    await execAsync(`sudo -u postgres psql -d video_ia_net -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO video_ia_user;"`);
    await execAsync(`sudo -u postgres psql -d video_ia_net -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO video_ia_user;"`);
    console.log('✅ Permissions attribuées');
    
    // 4. Lire et analyser le CSV
    console.log('\n📖 Lecture du CSV...');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(';');
    const dataLines = lines.slice(1);
    
    console.log(`✅ ${dataLines.length} lignes de données trouvées`);
    
    // 5. Insérer les données par lots
    console.log('\n🛠️ Insertion des données...');
    
    const batchSize = 50;
    let insertedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < dataLines.length; i += batchSize) {
      const batch = dataLines.slice(i, i + batchSize);
      const batchSQL = [];
      
      for (const line of batch) {
        try {
          const values = line.split(';');
          const toolName = values[0] || '';
          const category = values[1] || '';
          const link = values[2] || '';
          const overview = values[3] || '';
          const description = values[4] || '';
          const targetAudience = values[5] || '';
          const keyFeatures = values[6] || '';
          const useCases = values[7] || '';
          const tags = values[8] || '';
          const imageUrl = values[9] || '';
          
          if (toolName && toolName.trim().length > 0) {
            const slug = toolName.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim();
            
            // Échapper les caractères spéciaux pour PostgreSQL
            const escapedToolName = toolName.replace(/'/g, "''");
            const escapedCategory = category.replace(/'/g, "''");
            const escapedLink = link.replace(/'/g, "''");
            const escapedOverview = overview.replace(/'/g, "''");
            const escapedDescription = description.replace(/'/g, "''");
            const escapedTargetAudience = targetAudience.replace(/'/g, "''");
            const escapedKeyFeatures = keyFeatures.replace(/'/g, "''");
            const escapedUseCases = useCases.replace(/'/g, "''");
            const escapedTags = tags.replace(/'/g, "''");
            const escapedImageUrl = imageUrl.replace(/'/g, "''");
            
            batchSQL.push(`
              INSERT INTO tools (
                tool_name, tool_category, tool_link, overview, tool_description,
                target_audience, key_features, use_cases, tags, image_url, slug
              ) VALUES (
                '${escapedToolName}', '${escapedCategory}', '${escapedLink}', '${escapedOverview}', '${escapedDescription}',
                '${escapedTargetAudience}', '${escapedKeyFeatures}', '${escapedUseCases}', '${escapedTags}', '${escapedImageUrl}', '${slug}'
              ) ON CONFLICT (slug) DO NOTHING;
            `);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Erreur ligne ${i + 1}:`, error.message);
        }
      }
      
      if (batchSQL.length > 0) {
        try {
          const batchFile = `/tmp/batch_${i}.sql`;
          fs.writeFileSync(batchFile, batchSQL.join('\n'));
          await execAsync(`sudo -u postgres psql -d video_ia_net -f ${batchFile}`);
          insertedCount += batchSQL.length;
          fs.unlinkSync(batchFile); // Nettoyer le fichier temporaire
        } catch (error) {
          errorCount += batchSQL.length;
          console.error(`❌ Erreur batch ${i}:`, error.message);
        }
      }
      
      if (i % 500 === 0) {
        console.log(`📊 ${i}/${dataLines.length} lignes traitées...`);
      }
    }
    
    // 6. Créer les catégories
    console.log('\n📂 Création des catégories...');
    const categoriesSQL = `
      INSERT INTO categories (name, slug, tool_count)
      SELECT tool_category, 
             LOWER(REPLACE(tool_category, ' ', '-')) as slug,
             COUNT(*) as tool_count
      FROM tools 
      WHERE tool_category IS NOT NULL AND tool_category != ''
      GROUP BY tool_category
      ON CONFLICT (slug) DO NOTHING;
    `;
    
    fs.writeFileSync('/tmp/create_categories.sql', categoriesSQL);
    await execAsync(`sudo -u postgres psql -d video_ia_net -f /tmp/create_categories.sql`);
    
    // 7. Mettre à jour les statistiques
    console.log('\n📊 Mise à jour des statistiques...');
    const updateStatsSQL = `
      UPDATE categories SET tool_count = (
        SELECT COUNT(*) FROM tools WHERE tool_category = categories.name
      );
    `;
    
    fs.writeFileSync('/tmp/update_stats.sql', updateStatsSQL);
    await execAsync(`sudo -u postgres psql -d video_ia_net -f /tmp/update_stats.sql`);
    
    // Nettoyer les fichiers temporaires
    fs.unlinkSync('/tmp/create_tables.sql');
    fs.unlinkSync('/tmp/create_categories.sql');
    fs.unlinkSync('/tmp/update_stats.sql');
    
    console.log('\n🎉 Migration terminée !');
    console.log(`✅ ${insertedCount} outils importés`);
    console.log(`❌ ${errorCount} erreurs`);
    
    // 8. Afficher les statistiques
    const stats = await execAsync(`sudo -u postgres psql -d video_ia_net -c "
      SELECT 
        (SELECT COUNT(*) FROM tools) as total_tools,
        (SELECT COUNT(*) FROM categories) as total_categories,
        (SELECT COUNT(*) FROM tools WHERE tool_category IS NOT NULL) as tools_with_category;
    "`);
    
    console.log('\n📈 Statistiques:');
    console.log(stats.stdout);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
  }
}

migrateData(); 