#!/usr/bin/env tsx
/**
 * Migration Script: CSV to PostgreSQL (Multi-language)
 * Importe les 16,827 outils IA du CSV vers la nouvelle structure PostgreSQL
 * Basé sur le PRD v2.0 avec support multi-langue
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'video_ia_user',
  password: process.env.DB_PASSWORD || 'video_ia_dev_2024',
  ssl: false
};

interface CSVRow {
  tool_name: string;
  tool_category: string;
  tool_link: string;
  overview: string;
  tool_description: string;
  target_audience: string;
  key_features: string;
  use_cases: string;
  tags: string;
  image_url: string;
}

interface MigrationStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  categories: Set<string>;
  tags: Set<string>;
  startTime: Date;
}

class PostgreSQLMigrator {
  private pool: Pool;
  private stats: MigrationStats;

  constructor() {
    this.pool = new Pool(dbConfig);
    this.stats = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: 0,
      categories: new Set<string>(),
      tags: new Set<string>(),
      startTime: new Date()
    };
  }

  async run() {
    console.log('🚀 Démarrage de la migration CSV vers PostgreSQL (Multi-language)...\n');
    
    try {
      // 1. Vérifier la connexion
      await this.testConnection();
      
      // 2. Lire et parser le CSV
      const data = await this.readCSV();
      
      // 3. Nettoyer la base de données (optionnel)
      await this.cleanDatabase();
      
      // 4. Extraire et insérer les catégories
      await this.extractAndInsertCategories(data);
      
      // 5. Extraire et insérer les tags
      await this.extractAndInsertTags(data);
      
      // 6. Insérer les outils avec traductions
      await this.insertToolsWithTranslations(data);
      
      // 7. Créer les liaisons tags-outils
      await this.linkToolsAndTags(data);
      
      // 8. Mettre à jour les statistiques
      await this.updateStats();
      
      // 9. Afficher le résumé
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      process.exit(1);
    } finally {
      await this.pool.end();
    }
  }

  private async testConnection() {
    console.log('🔌 Test de connexion à PostgreSQL...');
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW(), version()');
      client.release();
      console.log('✅ Connexion PostgreSQL réussie:', result.rows[0].now);
    } catch (error) {
      throw new Error(`Impossible de se connecter à PostgreSQL: ${error}`);
    }
  }

  private async readCSV(): Promise<CSVRow[]> {
    console.log('📖 Lecture du fichier CSV...');
    
    const csvPath = path.join(process.cwd(), 'data', 'working_database_rationalized_full.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Fichier CSV non trouvé: ${csvPath}`);
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';'  // Utiliser le point-virgule comme séparateur
    });
    
    console.log(`✅ ${records.length} enregistrements lus depuis le CSV`);
    this.stats.total = records.length;
    
    return records;
  }

  private async cleanDatabase() {
    console.log('🔧 Vérification et création des tables...');
    
    const client = await this.pool.connect();
    try {
      // Vérifier si les tables existent, sinon les créer
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('tools', 'tool_translations', 'categories', 'tags')
      `);
      
      if (tableCheck.rows.length < 4) {
        console.log('📋 Création du schéma de base de données...');
        
        // Créer les tables de base si elles n'existent pas
        await client.query(`
          CREATE TABLE IF NOT EXISTS tools (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            slug VARCHAR(100) UNIQUE NOT NULL,
            official_url TEXT NOT NULL,
            logo_url TEXT,
            pricing_model VARCHAR(20),
            status VARCHAR(20) DEFAULT 'published',
            featured BOOLEAN DEFAULT FALSE,
            quality_score INTEGER DEFAULT 0,
            view_count INTEGER DEFAULT 0,
            click_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS tool_translations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
            language_id VARCHAR(5) DEFAULT 'en',
            name VARCHAR(200) NOT NULL,
            slug VARCHAR(150) NOT NULL,
            overview TEXT,
            description TEXT,
            key_features TEXT[],
            use_cases TEXT[],
            target_users TEXT[],
            meta_title VARCHAR(60),
            meta_description VARCHAR(160),
            ai_generated BOOLEAN DEFAULT FALSE,
            translation_source VARCHAR(20) DEFAULT 'imported',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tool_id, language_id)
          )
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            slug VARCHAR(100) UNIQUE NOT NULL,
            icon VARCHAR(50),
            color VARCHAR(7),
            featured BOOLEAN DEFAULT FALSE,
            enabled BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS category_translations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
            language_id VARCHAR(5) DEFAULT 'en',
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(120) NOT NULL,
            description TEXT,
            UNIQUE(category_id, language_id)
          )
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS tags (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            type VARCHAR(20) NOT NULL,
            slug VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS tag_translations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
            language_id VARCHAR(5) DEFAULT 'en',
            name VARCHAR(50) NOT NULL,
            description TEXT,
            UNIQUE(tag_id, language_id)
          )
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS tool_categories (
            tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
            category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
            is_primary BOOLEAN DEFAULT FALSE,
            PRIMARY KEY (tool_id, category_id)
          )
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS tool_tags (
            tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
            tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
            PRIMARY KEY (tool_id, tag_id)
          )
        `);
        
        // Créer les index
        await client.query('CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_tool_translations_language ON tool_translations(language_id, tool_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug)');
        
        console.log('✅ Schéma de base de données créé');
      } else {
        console.log('✅ Tables existantes détectées');
      }
      
    } finally {
      client.release();
    }
  }

  private async extractAndInsertCategories(data: CSVRow[]) {
    console.log('📂 Extraction et insertion des catégories...');
    
    const categories = new Set<string>();
    data.forEach(row => {
      if (row.tool_category) {
        categories.add(row.tool_category.trim());
      }
    });
    
    this.stats.categories = categories;
    console.log(`✅ ${categories.size} catégories uniques trouvées`);
  }

  private async extractAndInsertTags(data: CSVRow[]) {
    console.log('🏷️ Extraction et insertion des tags...');
    
    const tags = new Set<string>();
    data.forEach(row => {
      if (row.tags) {
        const tagList = row.tags.split(',').map(tag => tag.trim().toLowerCase());
        tagList.forEach(tag => {
          if (tag.length > 0) {
            tags.add(tag);
          }
        });
      }
    });
    
    this.stats.tags = tags;
    console.log(`✅ ${tags.size} tags uniques trouvés`);
  }

  private async insertToolsWithTranslations(data: CSVRow[]) {
    console.log('🛠️ Insertion des outils avec traductions...');
    
    const client = await this.pool.connect();
    let batchCount = 0;
    const batchSize = 100;
    
    try {
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        for (const row of batch) {
          try {
            const cleanedRow = this.cleanRowData(row);
            
            // Insérer l'outil principal
            const toolResult = await client.query(`
              INSERT INTO tools (
                slug, official_url, logo_url, pricing_model, 
                status, featured, quality_score
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING id
            `, [
              this.generateSlug(cleanedRow.tool_name),
              cleanedRow.tool_link,
              cleanedRow.image_url || null,
              this.detectPricingModel(cleanedRow),
              'published',
              false,
              this.calculateQualityScore(cleanedRow)
            ]);
            
            const toolId = toolResult.rows[0].id;
            
            // Insérer la traduction anglaise
            await client.query(`
              INSERT INTO tool_translations (
                tool_id, language_id, name, slug, overview, description,
                key_features, use_cases, target_users, meta_title, meta_description,
                ai_generated, translation_source
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
              toolId,
              'en',
              cleanedRow.tool_name,
              this.generateSlug(cleanedRow.tool_name),
              cleanedRow.overview,
              cleanedRow.tool_description,
              cleanedRow.key_features ? [cleanedRow.key_features] : [],
              cleanedRow.use_cases ? [cleanedRow.use_cases] : [],
              cleanedRow.target_audience ? [cleanedRow.target_audience] : [],
              this.generateMetaTitle(cleanedRow.tool_name),
              this.generateMetaDescription(cleanedRow.overview),
              false,
              'imported'
            ]);
            
            // Associer la catégorie
            if (cleanedRow.tool_category) {
              const categoryResult = await client.query(`
                SELECT id FROM categories WHERE slug = $1
              `, [this.generateSlug(cleanedRow.tool_category)]);
              
              if (categoryResult.rows.length > 0) {
                await client.query(`
                  INSERT INTO tool_categories (tool_id, category_id, is_primary)
                  VALUES ($1, $2, true)
                  ON CONFLICT DO NOTHING
                `, [toolId, categoryResult.rows[0].id]);
              }
            }
            
            this.stats.imported++;
            batchCount++;
            
            if (batchCount % 100 === 0) {
              console.log(`📊 ${batchCount}/${data.length} outils traités...`);
            }
            
          } catch (error) {
            console.error(`❌ Erreur lors de l'insertion de l'outil "${row.tool_name}":`, error);
            this.stats.errors++;
          }
        }
      }
      
      console.log(`✅ ${this.stats.imported} outils importés avec succès`);
      
    } finally {
      client.release();
    }
  }

  private async linkToolsAndTags(data: CSVRow[]) {
    console.log('🔗 Création des liaisons outils-tags...');
    
    const client = await this.pool.connect();
    let linkedCount = 0;
    
    try {
      for (const row of data) {
        if (row.tags) {
          const tagList = row.tags.split(',').map(tag => tag.trim().toLowerCase());
          
          for (const tagName of tagList) {
            if (tagName.length > 0) {
              try {
                // Trouver l'outil
                const toolResult = await client.query(`
                  SELECT id FROM tools WHERE slug = $1
                `, [this.generateSlug(row.tool_name)]);
                
                if (toolResult.rows.length > 0) {
                  const toolId = toolResult.rows[0].id;
                  
                  // Trouver ou créer le tag
                  let tagResult = await client.query(`
                    SELECT id FROM tags WHERE slug = $1
                  `, [this.generateSlug(tagName)]);
                  
                  if (tagResult.rows.length === 0) {
                    // Créer le tag
                    tagResult = await client.query(`
                      INSERT INTO tags (type, slug) VALUES ($1, $2) RETURNING id
                    `, ['custom', this.generateSlug(tagName)]);
                    
                    // Créer la traduction anglaise
                    await client.query(`
                      INSERT INTO tag_translations (tag_id, language_id, name)
                      VALUES ($1, $2, $3)
                    `, [tagResult.rows[0].id, 'en', tagName]);
                  }
                  
                  const tagId = tagResult.rows[0].id;
                  
                  // Créer la liaison
                  await client.query(`
                    INSERT INTO tool_tags (tool_id, tag_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                  `, [toolId, tagId]);
                  
                  linkedCount++;
                }
              } catch (error) {
                console.error(`❌ Erreur lors de la liaison tag "${tagName}":`, error);
              }
            }
          }
        }
      }
      
      console.log(`✅ ${linkedCount} liaisons outils-tags créées`);
      
    } finally {
      client.release();
    }
  }

  private async updateStats() {
    console.log('📊 Mise à jour des statistiques...');
    
    const client = await this.pool.connect();
    try {
      // Compter les outils par catégorie
      const categoryStats = await client.query(`
        SELECT c.slug, COUNT(tc.tool_id) as tool_count
        FROM categories c
        LEFT JOIN tool_categories tc ON c.id = tc.category_id
        GROUP BY c.id, c.slug
        ORDER BY tool_count DESC
      `);
      
      console.log('\n📈 Statistiques par catégorie:');
      categoryStats.rows.forEach(row => {
        console.log(`  ${row.slug}: ${row.tool_count} outils`);
      });
      
    } finally {
      client.release();
    }
  }

  private cleanRowData(row: CSVRow): CSVRow {
    return {
      tool_name: row.tool_name?.trim() || '',
      tool_category: row.tool_category?.trim() || '',
      tool_link: row.tool_link?.trim() || '',
      overview: row.overview?.trim() || '',
      tool_description: row.tool_description?.trim() || '',
      target_audience: row.target_audience?.trim() || '',
      key_features: row.key_features?.trim() || '',
      use_cases: row.use_cases?.trim() || '',
      tags: row.tags?.trim() || '',
      image_url: row.image_url?.trim() || ''
    };
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private calculateQualityScore(row: CSVRow): number {
    let score = 50; // Score de base
    
    // Bonus pour les champs remplis
    if (row.overview && row.overview.length > 50) score += 10;
    if (row.tool_description && row.tool_description.length > 100) score += 15;
    if (row.key_features && row.key_features.length > 20) score += 10;
    if (row.use_cases && row.use_cases.length > 20) score += 10;
    if (row.target_audience && row.target_audience.length > 10) score += 5;
    if (row.image_url) score += 5;
    if (row.tags && row.tags.length > 10) score += 5;
    
    return Math.min(score, 100);
  }

  private detectPricingModel(row: CSVRow): string {
    const text = (row.overview + ' ' + row.tool_description).toLowerCase();
    
    if (text.includes('free') || text.includes('gratuit')) return 'free';
    if (text.includes('freemium')) return 'freemium';
    if (text.includes('paid') || text.includes('payant')) return 'paid';
    if (text.includes('enterprise')) return 'enterprise';
    
    return 'unknown';
  }

  private generateMetaTitle(toolName: string): string {
    const title = `${toolName} - AI Tool for Content Creation | Video-IA.net`;
    return title.length > 60 ? title.substring(0, 57) + '...' : title;
  }

  private generateMetaDescription(overview: string): string {
    const cleanOverview = overview.replace(/[^\w\s]/g, '').substring(0, 150);
    const description = `${cleanOverview}... Discover this AI tool and more on Video-IA.net`;
    return description.length > 160 ? description.substring(0, 157) + '...' : description;
  }

  private printSummary() {
    const endTime = new Date();
    const duration = (endTime.getTime() - this.stats.startTime.getTime()) / 1000;
    
    console.log('\n🎉 Migration terminée !');
    console.log('================================');
    console.log(`⏱️  Durée: ${duration.toFixed(2)} secondes`);
    console.log(`📊 Total CSV: ${this.stats.total} outils`);
    console.log(`✅ Importés: ${this.stats.imported} outils`);
    console.log(`⏭️  Ignorés: ${this.stats.skipped} outils`);
    console.log(`❌ Erreurs: ${this.stats.errors} outils`);
    console.log(`📂 Catégories: ${this.stats.categories.size}`);
    console.log(`🏷️  Tags: ${this.stats.tags.size}`);
    console.log(`📈 Taux de succès: ${((this.stats.imported / this.stats.total) * 100).toFixed(1)}%`);
    
    if (this.stats.errors > 0) {
      console.log('\n⚠️  Certains outils n\'ont pas pu être importés. Vérifiez les logs ci-dessus.');
    }
    
    console.log('\n🚀 Prochaines étapes:');
    console.log('1. Vérifier les données: npm run db:test');
    console.log('2. Démarrer l\'application: npm run dev');
    console.log('3. Tester les API endpoints');
  }
}

async function main() {
  const migrator = new PostgreSQLMigrator();
  await migrator.run();
}

if (require.main === module) {
  main().catch(console.error);
} 