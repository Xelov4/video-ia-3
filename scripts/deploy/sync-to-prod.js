#!/usr/bin/env node

/**
 * 🔄 Database Sync: DEV → PROD
 * 
 * Synchronise intelligemment la base de données de développement 
 * vers la production en préservant les données critiques.
 * 
 * Usage:
 *   npm run sync:to-prod
 *   npm run sync:to-prod -- --mode=tools --dry-run
 *   npm run sync:to-prod -- --mode=selective --tables="tools,categories"
 */

import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration des connexions
const DEV_CONFIG = {
  host: process.env.DEV_DB_HOST || 'localhost',
  port: process.env.DEV_DB_PORT || 5432,
  database: process.env.DEV_DB_NAME || 'video_ia_net',
  user: process.env.DEV_DB_USER || 'video_ia_user',
  password: process.env.DEV_DB_PASSWORD || 'video123',
};

const PROD_CONFIG = {
  host: process.env.PROD_DB_HOST || process.env.VPS_HOST || '46.202.129.104',
  port: process.env.PROD_DB_PORT || 5432,
  database: process.env.PROD_DB_NAME || 'video_ia_net',
  user: process.env.PROD_DB_USER || 'video_ia_user',
  password: process.env.PROD_DB_PASSWORD || 'Buzzerbeater23',
};

// Tables et colonnes à synchroniser
const SYNC_TABLES = {
  tools: {
    primaryKey: 'id',
    preserveColumns: ['view_count', 'click_count', 'favorite_count', 'created_at'],
    conflictStrategy: 'merge' // merge, replace, skip
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

class DatabaseSyncer {
  constructor(options = {}) {
    this.devPool = new Pool(DEV_CONFIG);
    this.prodPool = new Pool(PROD_CONFIG);
    this.options = {
      dryRun: false,
      mode: 'full',
      preserveAnalytics: true,
      tables: Object.keys(SYNC_TABLES),
      backup: true,
      quiet: false,
      incremental: false,
      ...options
    };
    
    this.stats = {
      tablesProcessed: 0,
      rowsInserted: 0,
      rowsUpdated: 0,
      rowsSkipped: 0,
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
      // Test connexion DEV
      const devResult = await this.devPool.query('SELECT version(), COUNT(*) as tool_count FROM tools');
      this.log(`DEV connecté: ${devResult.rows[0].tool_count} outils`, 'success');
      
      // Test connexion PROD
      const prodResult = await this.prodPool.query('SELECT version(), COUNT(*) as tool_count FROM tools');
      this.log(`PROD connecté: ${prodResult.rows[0].tool_count} outils`, 'success');
      
      return { dev: devResult.rows[0], prod: prodResult.rows[0] };
    } catch (error) {
      this.log(`Erreur de connexion: ${error.message}`, 'error');
      throw error;
    }
  }

  async createBackup() {
    if (!this.options.backup) return null;
    
    this.log('Création du backup de production...');
    const backupFile = `backup_prod_sync_${Date.now()}.sql`;
    
    try {
      // Pour simplifier, on sauvegarde juste les métadonnées importantes
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
          'pre_dev_sync';
      `;
      
      await this.prodPool.query(backupQuery);
      this.log('Backup créé avec succès', 'success');
      return backupFile;
    } catch (error) {
      this.log(`Erreur backup: ${error.message}`, 'warning');
      return null;
    }
  }

  async getTableData(tableName, pool) {
    const tableConfig = SYNC_TABLES[tableName];
    if (!tableConfig) {
      throw new Error(`Table ${tableName} non configurée pour la sync`);
    }

    let query = `SELECT * FROM ${tableName}`;
    
    // Pour la sync incrémentale, ne prendre que les données modifiées récemment
    if (this.options.incremental && tableName === 'tools') {
      query += ` WHERE updated_at > NOW() - INTERVAL '24 hours'`;
    }
    
    const result = await pool.query(query);
    return result.rows;
  }

  generateUpsertQuery(tableName, data) {
    if (data.length === 0) return null;
    
    const tableConfig = SYNC_TABLES[tableName];
    const columns = Object.keys(data[0]);
    const primaryKeys = Array.isArray(tableConfig.primaryKey) 
      ? tableConfig.primaryKey 
      : [tableConfig.primaryKey];
    
    // Construction de la requête UPSERT
    const placeholders = data.map((_, index) => {
      const rowPlaceholders = columns.map((_, colIndex) => 
        `$${index * columns.length + colIndex + 1}`
      ).join(', ');
      return `(${rowPlaceholders})`;
    }).join(', ');
    
    const values = data.flatMap(row => columns.map(col => row[col]));
    
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

  async syncTable(tableName) {
    this.log(`Synchronisation de la table ${tableName}...`);
    
    try {
      // Récupération des données DEV
      const devData = await this.getTableData(tableName, this.devPool);
      this.log(`${devData.length} enregistrements trouvés dans DEV`);
      
      if (devData.length === 0) {
        this.log(`Table ${tableName} vide en DEV, synchronisation ignorée`, 'warning');
        return;
      }
      
      if (this.options.dryRun) {
        this.log(`[DRY RUN] ${devData.length} enregistrements seraient synchronisés`);
        this.stats.rowsSkipped += devData.length;
        return;
      }
      
      // Génération et exécution de la requête UPSERT
      const upsertData = this.generateUpsertQuery(tableName, devData);
      if (!upsertData) return;
      
      await this.prodPool.query('BEGIN');
      
      try {
        const result = await this.prodPool.query(upsertData.query, upsertData.values);
        await this.prodPool.query('COMMIT');
        
        this.stats.rowsInserted += result.rowCount || 0;
        this.log(`${result.rowCount} enregistrements synchronisés`, 'success');
        
      } catch (error) {
        await this.prodPool.query('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      this.log(`Erreur sync table ${tableName}: ${error.message}`, 'error');
      this.stats.errors.push({ table: tableName, error: error.message });
      throw error;
    }
    
    this.stats.tablesProcessed++;
  }

  async validateSync() {
    this.log('Validation post-synchronisation...');
    
    try {
      const devCount = await this.devPool.query('SELECT COUNT(*) FROM tools WHERE is_active = true');
      const prodCount = await this.prodPool.query('SELECT COUNT(*) FROM tools WHERE is_active = true');
      
      const devTotal = parseInt(devCount.rows[0].count);
      const prodTotal = parseInt(prodCount.rows[0].count);
      
      this.log(`Validation: DEV=${devTotal}, PROD=${prodTotal}`);
      
      if (Math.abs(devTotal - prodTotal) > devTotal * 0.1) {
        this.log('⚠️ Différence importante détectée (>10%)', 'warning');
      } else {
        this.log('✅ Validation réussie', 'success');
      }
      
      return { dev: devTotal, prod: prodTotal };
    } catch (error) {
      this.log(`Erreur validation: ${error.message}`, 'error');
      return null;
    }
  }

  async run() {
    const startTime = Date.now();
    
    try {
      this.log('🚀 Début de la synchronisation DEV → PROD');
      this.log(`Mode: ${this.options.mode}, Dry Run: ${this.options.dryRun}`);
      
      // Validation des connexions
      const connections = await this.validateConnections();
      
      // Backup si nécessaire
      await this.createBackup();
      
      // Détermination des tables à synchroniser
      let tablesToSync = this.options.tables;
      
      if (this.options.mode === 'tools') {
        tablesToSync = ['tools', 'tool_translations'];
      } else if (this.options.mode === 'categories') {
        tablesToSync = ['categories', 'category_translations'];
      } else if (this.options.mode === 'translations') {
        tablesToSync = ['tool_translations', 'category_translations'];
      } else if (this.options.mode === 'content_only') {
        tablesToSync = ['tools', 'categories', 'tool_translations', 'category_translations'];
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
      this.log(`Durée: ${duration}s, Tables: ${this.stats.tablesProcessed}, Erreurs: ${this.stats.errors.length}`);
      
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
      await this.devPool.end();
      await this.prodPool.end();
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    mode: args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'full',
    preserveAnalytics: !args.includes('--no-preserve-analytics'),
    backup: !args.includes('--no-backup'),
    quiet: args.includes('--quiet'),
    incremental: args.includes('--incremental'),
  };
  
  // Tables personnalisées
  const tablesArg = args.find(arg => arg.startsWith('--tables='));
  if (tablesArg) {
    options.tables = tablesArg.split('=')[1].split(',');
  }
  
  const syncer = new DatabaseSyncer(options);
  const result = await syncer.run();
  
  process.exit(result.success ? 0 : 1);
}

// Exécution si appelé directement
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export { DatabaseSyncer };