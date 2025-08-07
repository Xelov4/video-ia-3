#!/usr/bin/env node

/**
 * 🔄 Database Sync: PROD → DEV
 * 
 * Synchronise intelligemment la base de données de production 
 * vers le développement en préservant les données locales importantes.
 * 
 * Usage:
 *   npm run sync:from-prod
 *   npm run sync:from-prod -- --mode=content_only --dry-run
 *   npm run sync:from-prod -- --mode=analytics_only
 */

import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration des connexions (inversée par rapport à sync-to-prod)
const PROD_CONFIG = {
  host: process.env.PROD_DB_HOST || process.env.VPS_HOST || '46.202.129.104',
  port: process.env.PROD_DB_PORT || 5432,
  database: process.env.PROD_DB_NAME || 'video_ia_net',
  user: process.env.PROD_DB_USER || 'video_ia_user',
  password: process.env.PROD_DB_PASSWORD || 'Buzzerbeater23',
};

const DEV_CONFIG = {
  host: process.env.DEV_DB_HOST || 'localhost',
  port: process.env.DEV_DB_PORT || 5432,
  database: process.env.DEV_DB_NAME || 'video_ia_net',
  user: process.env.DEV_DB_USER || 'video_ia_user',
  password: process.env.DEV_DB_PASSWORD || 'video123',
};

// Configuration spécifique pour PROD → DEV
const SYNC_TABLES = {
  tools: {
    primaryKey: 'id',
    preserveColumns: ['created_at'], // Préserver les dates de création DEV
    analyticsColumns: ['view_count', 'click_count', 'favorite_count'],
    conflictStrategy: 'smart_merge' // Stratégie intelligente
  },
  categories: {
    primaryKey: 'id',
    preserveColumns: ['created_at'],
    conflictStrategy: 'replace'
  },
  tool_translations: {
    primaryKey: ['tool_id', 'language_code'],
    preserveColumns: ['created_at'],
    conflictStrategy: 'replace'
  },
  category_translations: {
    primaryKey: ['category_id', 'language_code'],
    preserveColumns: ['created_at'],
    conflictStrategy: 'replace'
  },
  languages: {
    primaryKey: 'code',
    preserveColumns: ['created_at'],
    conflictStrategy: 'merge'
  }
};

class ProdToDevSyncer {
  constructor(options = {}) {
    this.prodPool = new Pool(PROD_CONFIG);
    this.devPool = new Pool(DEV_CONFIG);
    this.options = {
      dryRun: false,
      mode: 'content_only', // Par défaut, pas d'analytics
      preserveDevData: true,
      tables: Object.keys(SYNC_TABLES),
      backup: true,
      quiet: false,
      ...options
    };
    
    this.stats = {
      tablesProcessed: 0,
      rowsInserted: 0,
      rowsUpdated: 0,
      rowsSkipped: 0,
      analyticsPreserved: 0,
      errors: []
    };
  }

  async log(message, level = 'info') {
    if (this.options.quiet && level === 'info') return;
    
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📝',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    }[level] || '📝';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async validateConnections() {
    this.log('Validation des connexions aux bases de données...');
    
    try {
      // Test connexion PROD
      const prodResult = await this.prodPool.query('SELECT version(), COUNT(*) as tool_count FROM tools');
      this.log(`PROD connecté: ${prodResult.rows[0].tool_count} outils`, 'success');
      
      // Test connexion DEV
      const devResult = await this.devPool.query('SELECT version(), COUNT(*) as tool_count FROM tools');
      this.log(`DEV connecté: ${devResult.rows[0].tool_count} outils`, 'success');
      
      return { prod: prodResult.rows[0], dev: devResult.rows[0] };
    } catch (error) {
      this.log(`Erreur de connexion: ${error.message}`, 'error');
      throw error;
    }
  }

  async createDevBackup() {
    if (!this.options.backup) return null;
    
    this.log('Création du backup de développement...');
    
    try {
      const backupQuery = `
        CREATE TABLE IF NOT EXISTS sync_backups (
          id SERIAL PRIMARY KEY,
          backup_date TIMESTAMP DEFAULT NOW(),
          tool_count INTEGER,
          category_count INTEGER,
          backup_type VARCHAR(50)
        );
        
        INSERT INTO sync_backups (tool_count, category_count, backup_type)
        SELECT 
          (SELECT COUNT(*) FROM tools),
          (SELECT COUNT(*) FROM categories),
          'pre_prod_sync';
      `;
      
      await this.devPool.query(backupQuery);
      this.log('Backup DEV créé avec succès', 'success');
      return true;
    } catch (error) {
      this.log(`Erreur backup DEV: ${error.message}`, 'warning');
      return null;
    }
  }

  async getDevAnalytics(tableName) {
    if (tableName !== 'tools') return new Map();
    
    this.log('Récupération des analytics DEV existantes...');
    
    try {
      const result = await this.devPool.query(`
        SELECT id, view_count, click_count, favorite_count, created_at
        FROM tools 
        WHERE view_count > 0 OR click_count > 0 OR favorite_count > 0
      `);
      
      const analyticsMap = new Map();
      result.rows.forEach(row => {
        analyticsMap.set(row.id, {
          view_count: row.view_count || 0,
          click_count: row.click_count || 0,
          favorite_count: row.favorite_count || 0,
          dev_created_at: row.created_at
        });
      });
      
      this.log(`${analyticsMap.size} outils avec analytics DEV préservées`);
      return analyticsMap;
    } catch (error) {
      this.log(`Erreur récupération analytics: ${error.message}`, 'warning');
      return new Map();
    }
  }

  generateSmartUpsertQuery(tableName, prodData, devAnalytics = new Map()) {
    if (prodData.length === 0) return null;
    
    const tableConfig = SYNC_TABLES[tableName];
    const columns = Object.keys(prodData[0]);
    const primaryKeys = Array.isArray(tableConfig.primaryKey) 
      ? tableConfig.primaryKey 
      : [tableConfig.primaryKey];
    
    // Pour les outils, on fait un merge intelligent avec les analytics
    if (tableName === 'tools' && this.options.mode !== 'full') {
      return this.generateToolsSmartSync(prodData, devAnalytics);
    }
    
    // Pour les autres tables, upsert classique
    const placeholders = prodData.map((_, index) => {
      const rowPlaceholders = columns.map((_, colIndex) => 
        `$${index * columns.length + colIndex + 1}`
      ).join(', ');
      return `(${rowPlaceholders})`;
    }).join(', ');
    
    const values = prodData.flatMap(row => columns.map(col => row[col]));
    
    const conflictColumns = primaryKeys.join(', ');
    const updateColumns = columns
      .filter(col => !primaryKeys.includes(col))
      .filter(col => !tableConfig.preserveColumns?.includes(col))
      .map(col => `${col} = EXCLUDED.${col}`)
      .join(', ');
    
    const query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES ${placeholders}
      ON CONFLICT (${conflictColumns}) DO ${updateColumns ? `UPDATE SET ${updateColumns}` : 'NOTHING'}
    `;
    
    return { query, values };
  }

  generateToolsSmartSync(prodData, devAnalytics) {
    this.log('Génération de la sync intelligente des outils...');
    
    const queries = [];
    let preservedCount = 0;
    
    for (const tool of prodData) {
      const devStats = devAnalytics.get(tool.id);
      
      // Stratégie de merge des analytics
      const finalViewCount = this.options.mode === 'analytics_only' 
        ? tool.view_count 
        : Math.max(tool.view_count || 0, devStats?.view_count || 0);
        
      const finalClickCount = this.options.mode === 'analytics_only'
        ? tool.click_count
        : Math.max(tool.click_count || 0, devStats?.click_count || 0);
        
      const finalFavoriteCount = this.options.mode === 'analytics_only'
        ? tool.favorite_count
        : Math.max(tool.favorite_count || 0, devStats?.favorite_count || 0);
      
      // Préserver la date de création DEV si elle existe
      const finalCreatedAt = (this.options.preserveDevData && devStats?.dev_created_at) 
        ? devStats.dev_created_at 
        : tool.created_at;
      
      if (devStats && this.options.mode !== 'analytics_only') {
        preservedCount++;
      }
      
      const columns = Object.keys(tool);
      const values = columns.map(col => {
        switch (col) {
          case 'view_count': return finalViewCount;
          case 'click_count': return finalClickCount;
          case 'favorite_count': return finalFavoriteCount;
          case 'created_at': return finalCreatedAt;
          default: return tool[col];
        }
      });
      
      queries.push({
        columns,
        values,
        toolId: tool.id
      });
    }
    
    this.stats.analyticsPreserved = preservedCount;
    
    // Construction de la requête batch
    const allColumns = queries[0].columns;
    const placeholders = queries.map((_, index) => {
      const rowPlaceholders = allColumns.map((_, colIndex) => 
        `$${index * allColumns.length + colIndex + 1}`
      ).join(', ');
      return `(${rowPlaceholders})`;
    }).join(', ');
    
    const allValues = queries.flatMap(q => q.values);
    
    const updateColumns = allColumns
      .filter(col => col !== 'id')
      .map(col => `${col} = EXCLUDED.${col}`)
      .join(', ');
    
    const query = `
      INSERT INTO tools (${allColumns.join(', ')})
      VALUES ${placeholders}
      ON CONFLICT (id) DO UPDATE SET ${updateColumns}
    `;
    
    return { query, values: allValues };
  }

  async syncTable(tableName) {
    this.log(`Synchronisation de la table ${tableName}...`);
    
    try {
      // Récupération des données PROD
      const prodData = await this.getProdData(tableName);
      this.log(`${prodData.length} enregistrements trouvés dans PROD`);
      
      if (prodData.length === 0) {
        this.log(`Table ${tableName} vide en PROD, synchronisation ignorée`, 'warning');
        return;
      }
      
      // Récupération des analytics DEV si nécessaire
      let devAnalytics = new Map();
      if (tableName === 'tools' && this.options.preserveDevData) {
        devAnalytics = await this.getDevAnalytics(tableName);
      }
      
      if (this.options.dryRun) {
        this.log(`[DRY RUN] ${prodData.length} enregistrements seraient synchronisés`);
        if (devAnalytics.size > 0) {
          this.log(`[DRY RUN] ${devAnalytics.size} analytics DEV seraient préservées`);
        }
        this.stats.rowsSkipped += prodData.length;
        return;
      }
      
      // Génération et exécution de la requête
      const upsertData = this.generateSmartUpsertQuery(tableName, prodData, devAnalytics);
      if (!upsertData) return;
      
      await this.devPool.query('BEGIN');
      
      try {
        const result = await this.devPool.query(upsertData.query, upsertData.values);
        await this.devPool.query('COMMIT');
        
        this.stats.rowsInserted += result.rowCount || 0;
        this.log(`${result.rowCount} enregistrements synchronisés`, 'success');
        
        if (this.stats.analyticsPreserved > 0) {
          this.log(`${this.stats.analyticsPreserved} analytics DEV préservées`, 'success');
        }
        
      } catch (error) {
        await this.devPool.query('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      this.log(`Erreur sync table ${tableName}: ${error.message}`, 'error');
      this.stats.errors.push({ table: tableName, error: error.message });
      throw error;
    }
    
    this.stats.tablesProcessed++;
  }

  async getProdData(tableName) {
    let query = `SELECT * FROM ${tableName}`;
    
    // Filtres selon le mode
    if (this.options.mode === 'analytics_only' && tableName === 'tools') {
      query = `SELECT id, view_count, click_count, favorite_count, updated_at FROM ${tableName}`;
    } else if (this.options.mode === 'content_only' && tableName === 'tools') {
      // Exclure les colonnes d'analytics dans la requête
      query = `
        SELECT id, tool_name, tool_category, tool_link, overview, tool_description,
               target_audience, key_features, use_cases, tags, image_url, slug,
               is_active, featured, quality_score, meta_title, meta_description,
               seo_keywords, created_at, updated_at, last_checked_at
        FROM ${tableName}
      `;
    }
    
    const result = await this.prodPool.query(query);
    return result.rows;
  }

  async validateSync() {
    this.log('Validation post-synchronisation...');
    
    try {
      const prodCount = await this.prodPool.query('SELECT COUNT(*) FROM tools WHERE is_active = true');
      const devCount = await this.devPool.query('SELECT COUNT(*) FROM tools WHERE is_active = true');
      
      const prodTotal = parseInt(prodCount.rows[0].count);
      const devTotal = parseInt(devCount.rows[0].count);
      
      this.log(`Validation: PROD=${prodTotal}, DEV=${devTotal}`);
      
      // Vérification de l'intégrité des traductions
      const translationCheck = await this.devPool.query(`
        SELECT COUNT(*) FROM tools t 
        LEFT JOIN tool_translations tt ON t.id = tt.tool_id 
        WHERE tt.tool_id IS NULL AND t.is_active = true
      `);
      
      const orphanTools = parseInt(translationCheck.rows[0].count);
      if (orphanTools > 0) {
        this.log(`⚠️ ${orphanTools} outils sans traductions détectés`, 'warning');
      }
      
      return { prod: prodTotal, dev: devTotal, orphanTools };
    } catch (error) {
      this.log(`Erreur validation: ${error.message}`, 'error');
      return null;
    }
  }

  async run() {
    const startTime = Date.now();
    
    try {
      this.log('🚀 Début de la synchronisation PROD → DEV');
      this.log(`Mode: ${this.options.mode}, Dry Run: ${this.options.dryRun}`);
      
      // Validation des connexions
      await this.validateConnections();
      
      // Backup si nécessaire
      await this.createDevBackup();
      
      // Détermination des tables à synchroniser
      let tablesToSync = this.options.tables;
      
      if (this.options.mode === 'tools_only') {
        tablesToSync = ['tools'];
      } else if (this.options.mode === 'categories_only') {
        tablesToSync = ['categories', 'category_translations'];
      } else if (this.options.mode === 'translations_only') {
        tablesToSync = ['tool_translations', 'category_translations'];
      } else if (this.options.mode === 'analytics_only') {
        tablesToSync = ['tools']; // Seulement les analytics des outils
      }
      
      // Synchronisation des tables
      for (const table of tablesToSync) {
        if (SYNC_TABLES[table]) {
          await this.syncTable(table);
        }
      }
      
      // Validation finale
      await this.validateSync();
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      this.log('🎉 Synchronisation terminée avec succès!', 'success');
      this.log(`Durée: ${duration}s, Tables: ${this.stats.tablesProcessed}, Analytics préservées: ${this.stats.analyticsPreserved}`);
      
      return {
        success: true,
        duration,
        stats: this.stats
      };
      
    } catch (error) {
      this.log(`💥 Synchronisation échouée: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message,
        stats: this.stats
      };
    } finally {
      await this.prodPool.end();
      await this.devPool.end();
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    mode: args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'content_only',
    preserveDevData: !args.includes('--no-preserve-dev-data'),
    backup: !args.includes('--no-backup'),
    quiet: args.includes('--quiet'),
  };
  
  // Tables personnalisées
  const tablesArg = args.find(arg => arg.startsWith('--tables='));
  if (tablesArg) {
    options.tables = tablesArg.split('=')[1].split(',');
  }
  
  const syncer = new ProdToDevSyncer(options);
  const result = await syncer.run();
  
  process.exit(result.success ? 0 : 1);
}

// Exécution si appelé directement
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export { ProdToDevSyncer };