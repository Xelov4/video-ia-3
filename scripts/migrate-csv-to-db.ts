#!/usr/bin/env tsx
/**
 * Migration Script: CSV to PostgreSQL
 * Importe les 16,827 outils IA du CSV vers la base de données
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
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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

class CSVMigrator {
  private pool: Pool;
  private stats = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    categories: new Set<string>(),
    tags: new Set<string>()
  };

  constructor() {
    this.pool = new Pool(dbConfig);
  }

  async run() {
    console.log('🚀 Démarrage de la migration CSV vers PostgreSQL...\n');
    
    try {
      // 1. Vérifier la connexion
      await this.testConnection();
      
      // 2. Lire et parser le CSV
      const data = await this.readCSV();
      
      // 3. Nettoyer la base de données
      await this.cleanDatabase();
      
      // 4. Extraire et insérer les catégories
      await this.extractAndInsertCategories(data);
      
      // 5. Extraire et insérer les tags
      await this.extractAndInsertTags(data);
      
      // 6. Insérer les outils
      await this.insertTools(data);
      
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
    console.log('🔌 Test de connexion à la base de données...');
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Connexion réussie:', result.rows[0].now);
    } catch (error) {
      throw new Error(`Impossible de se connecter à la DB: ${error}`);
    }
  }

  private async readCSV(): Promise<CSVRow[]> {
    console.log('📄 Lecture du fichier CSV...');
    
    const csvPath = path.join(process.cwd(), 'data/working_database_rationalized_full.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Fichier CSV non trouvé: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      delimiter: ';',
      skip_empty_lines: true,
      trim: true
    }) as CSVRow[];

    this.stats.total = records.length;
    console.log(`✅ ${records.length} lignes lues depuis le CSV`);
    
    return records;
  }

  private async cleanDatabase() {
    console.log('🧹 Nettoyage de la base de données...');
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Supprimer dans l'ordre (contraintes FK)
      await client.query('DELETE FROM tool_tags');
      await client.query('DELETE FROM ai_tools');
      await client.query('DELETE FROM tags');
      await client.query('DELETE FROM categories WHERE name NOT IN (\'AI Assistant\', \'Content Creation\', \'Image Generation\', \'Video Generation\', \'Audio generation\', \'Text-to-speech\')');
      
      // Reset des séquences
      await client.query('ALTER SEQUENCE ai_tools_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE tags_id_seq RESTART WITH 1');
      
      await client.query('COMMIT');
      console.log('✅ Base de données nettoyée');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async extractAndInsertCategories(data: CSVRow[]) {
    console.log('📁 Extraction et insertion des catégories...');
    
    // Extraire toutes les catégories uniques
    const categories = new Set<string>();
    data.forEach(row => {
      if (row.tool_category && row.tool_category.trim()) {
        categories.add(row.tool_category.trim());
      }
    });

    this.stats.categories = categories;
    
    const client = await this.pool.connect();
    try {
      for (const category of categories) {
        const slug = this.generateSlug(category);
        await client.query(`
          INSERT INTO categories (name, slug, description, tool_count) 
          VALUES ($1, $2, $3, 0)
          ON CONFLICT (name) DO NOTHING
        `, [category, slug, `Outils de catégorie ${category}`]);
      }
      console.log(`✅ ${categories.size} catégories insérées`);
    } finally {
      client.release();
    }
  }

  private async extractAndInsertTags(data: CSVRow[]) {
    console.log('🏷️ Extraction et insertion des tags...');
    
    // Extraire tous les tags uniques
    const tags = new Set<string>();
    data.forEach(row => {
      if (row.tags && row.tags.trim()) {
        // Les tags peuvent être séparés par des virgules
        const rowTags = row.tags.split(',').map(t => t.trim()).filter(t => t);
        rowTags.forEach(tag => tags.add(tag));
      }
    });

    this.stats.tags = tags;
    
    const client = await this.pool.connect();
    try {
      for (const tag of tags) {
        const slug = this.generateSlug(tag);
        await client.query(`
          INSERT INTO tags (name, slug, usage_count) 
          VALUES ($1, $2, 0)
          ON CONFLICT (name) DO NOTHING
        `, [tag, slug]);
      }
      console.log(`✅ ${tags.size} tags insérés`);
    } finally {
      client.release();
    }
  }

  private async insertTools(data: CSVRow[]) {
    console.log('🔧 Insertion des outils...');
    
    const client = await this.pool.connect();
    const batchSize = 100;
    
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        for (const row of batch) {
          try {
            // Nettoyer et valider les données
            const cleanRow = this.cleanRowData(row);
            
            if (!cleanRow.tool_name || !cleanRow.tool_link) {
              this.stats.skipped++;
              continue;
            }

            await client.query(`
              INSERT INTO ai_tools (
                tool_name, tool_category, tool_link, overview, tool_description,
                target_audience, key_features, use_cases, tags, image_url,
                quality_score, is_active
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
              cleanRow.tool_name,
              cleanRow.tool_category,
              cleanRow.tool_link,
              cleanRow.overview,
              cleanRow.tool_description,
              cleanRow.target_audience,
              cleanRow.key_features,
              cleanRow.use_cases,
              cleanRow.tags,
              cleanRow.image_url,
              this.calculateQualityScore(cleanRow),
              true
            ]);
            
            this.stats.imported++;
            
          } catch (error) {
            console.warn(`⚠️ Erreur ligne ${i + 1}:`, error instanceof Error ? error.message : error);
            this.stats.errors++;
          }
        }
        
        // Afficher le progrès
        const progress = Math.round(((i + batchSize) / data.length) * 100);
        process.stdout.write(`\r📈 Progression: ${progress}% (${this.stats.imported} importés, ${this.stats.errors} erreurs)`);
      }
      
      await client.query('COMMIT');
      console.log(`\n✅ ${this.stats.imported} outils importés avec succès`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async linkToolsAndTags(data: CSVRow[]) {
    console.log('🔗 Création des liaisons outils-tags...');
    
    const client = await this.pool.connect();
    let linkedCount = 0;
    
    try {
      await client.query('BEGIN');
      
      // Récupérer tous les outils avec leurs IDs
      const toolsResult = await client.query('SELECT id, tool_name, tags FROM ai_tools WHERE tags IS NOT NULL AND tags != \'\'');
      const tools = toolsResult.rows;
      
      // Récupérer tous les tags avec leurs IDs
      const tagsResult = await client.query('SELECT id, name FROM tags');
      const tagsMap = new Map(tagsResult.rows.map(t => [t.name.toLowerCase(), t.id]));
      
      for (const tool of tools) {
        if (!tool.tags) continue;
        
        const toolTags = tool.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
        
        for (const tagName of toolTags) {
          const tagId = tagsMap.get(tagName.toLowerCase());
          
          if (tagId) {
            try {
              await client.query(`
                INSERT INTO tool_tags (tool_id, tag_id) 
                VALUES ($1, $2)
                ON CONFLICT (tool_id, tag_id) DO NOTHING
              `, [tool.id, tagId]);
              linkedCount++;
            } catch (error) {
              // Ignorer les doublons
            }
          }
        }
      }
      
      await client.query('COMMIT');
      console.log(`✅ ${linkedCount} liaisons outils-tags créées`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async updateStats() {
    console.log('📊 Mise à jour des statistiques...');
    
    const client = await this.pool.connect();
    try {
      // Mettre à jour le compteur d'outils par catégorie
      await client.query(`
        UPDATE categories 
        SET tool_count = (
          SELECT COUNT(*) 
          FROM ai_tools 
          WHERE tool_category = categories.name AND is_active = true
        )
      `);
      
      // Mettre à jour le compteur d'usage des tags
      await client.query(`
        UPDATE tags 
        SET usage_count = (
          SELECT COUNT(*) 
          FROM tool_tags 
          WHERE tag_id = tags.id
        )
      `);
      
      console.log('✅ Statistiques mises à jour');
    } finally {
      client.release();
    }
  }

  private cleanRowData(row: CSVRow): CSVRow {
    return {
      tool_name: row.tool_name?.trim() || '',
      tool_category: row.tool_category?.trim() || 'Other',
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

  private calculateQualityScore(row: CSVRow): number {
    let score = 30; // Score de base
    
    if (row.tool_description && row.tool_description.length > 100) score += 20;
    if (row.overview && row.overview.length > 50) score += 15;
    if (row.key_features && row.key_features.length > 20) score += 15;
    if (row.use_cases && row.use_cases.length > 20) score += 10;
    if (row.target_audience && row.target_audience.length > 10) score += 5;
    if (row.image_url && row.image_url.startsWith('http')) score += 5;
    
    return Math.min(score, 100);
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('='.repeat(50));
    console.log(`📄 Total lignes CSV: ${this.stats.total}`);
    console.log(`✅ Outils importés: ${this.stats.imported}`);
    console.log(`⏭️ Lignes ignorées: ${this.stats.skipped}`);
    console.log(`❌ Erreurs: ${this.stats.errors}`);
    console.log(`📁 Catégories: ${this.stats.categories.size}`);
    console.log(`🏷️ Tags: ${this.stats.tags.size}`);
    console.log(`📈 Taux de succès: ${Math.round((this.stats.imported / this.stats.total) * 100)}%`);
    console.log('='.repeat(50));
    
    if (this.stats.errors > 0) {
      console.log('⚠️ Vérifiez les logs pour les erreurs détaillées');
    }
    
    console.log('🎉 Migration terminée avec succès !');
  }
}

// Exécution du script
async function main() {
  const migrator = new CSVMigrator();
  await migrator.run();
}

if (require.main === module) {
  main().catch(console.error);
}

export { CSVMigrator };