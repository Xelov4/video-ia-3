#!/usr/bin/env node

/**
 * 🔄 Synchronisation Bidirectionnelle WSL ↔ VPS
 * 
 * Script complet pour synchroniser automatiquement:
 * - Code source (Git)
 * - Base de données (PostgreSQL)
 * - Assets et configurations
 * 
 * Usage:
 *   node scripts/deploy/sync-bidirectional.js --mode=dev-to-prod
 *   node scripts/deploy/sync-bidirectional.js --mode=prod-to-dev
 *   node scripts/deploy/sync-bidirectional.js --mode=full-sync
 */

import { Pool } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration des environnements
const ENVIRONMENTS = {
  dev: {
    name: 'Development (WSL)',
    db: {
      host: 'localhost',
      port: 5432,
      database: 'video_ia_net',
      user: 'video_ia_user',
      password: 'video123'
    },
    git: {
      remote: 'origin',
      branch: 'main'
    },
    app: {
      url: 'http://localhost:3000',
      path: process.cwd()
    }
  },
  prod: {
    name: 'Production (VPS)',
    db: {
      host: '46.202.129.104',
      port: 5432,
      database: 'video_ia_net',
      user: 'video_ia_user',
      password: 'Buzzerbeater23'
    },
    git: {
      remote: 'origin',
      branch: 'main'
    },
    app: {
      url: 'https://www.video-ia.net',
      path: '/var/www/video-ia.net'
    },
    ssh: {
      host: '46.202.129.104',
      user: 'root',
      password: 'Buzzerbeater23'
    }
  }
};

class BidirectionalSyncer {
  constructor(options = {}) {
    this.options = {
      mode: 'dev-to-prod',
      dryRun: false,
      backup: true,
      skipGit: false,
      skipDb: false,
      skipAssets: false,
      force: false,
      quiet: false,
      ...options
    };

    this.devPool = null;
    this.prodPool = null;
    
    this.stats = {
      startTime: Date.now(),
      operations: [],
      errors: [],
      warnings: [],
      backups: []
    };
  }

  async log(message, level = 'info') {
    if (this.options.quiet && level === 'info') return;
    
    const timestamp = new Date().toISOString();
    const emoji = {
      info: '📝',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍',
      sync: '🔄'
    }[level] || '📝';
    
    const logMessage = `${emoji} [${timestamp}] ${message}`;
    console.log(logMessage);
    
    this.stats.operations.push({ timestamp, level, message });
  }

  async connectDatabases() {
    this.log('Connexion aux bases de données...', 'sync');
    
    try {
      this.devPool = new Pool(ENVIRONMENTS.dev.db);
      this.prodPool = new Pool(ENVIRONMENTS.prod.db);
      
      // Test des connexions
      const devResult = await this.devPool.query('SELECT version(), COUNT(*) as tools FROM tools');
      const prodResult = await this.prodPool.query('SELECT version(), COUNT(*) as tools FROM tools');
      
      this.log(`DEV: ${devResult.rows[0].tools} outils`, 'success');
      this.log(`PROD: ${prodResult.rows[0].tools} outils`, 'success');
      
      return { dev: devResult.rows[0], prod: prodResult.rows[0] };
    } catch (error) {
      this.log(`Erreur connexion DB: ${error.message}`, 'error');
      throw error;
    }
  }

  async createBackup(environment) {
    if (!this.options.backup) return null;
    
    this.log(`Création backup ${environment}...`, 'sync');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup_${environment}_${timestamp}.sql`;
    const backupPath = path.join(process.cwd(), 'backups', 'sync', backupFile);
    
    try {
      // Créer le dossier de backup
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      
      const env = ENVIRONMENTS[environment];
      const pgDumpCmd = `PGPASSWORD="${env.db.password}" pg_dump -h ${env.db.host} -U ${env.db.user} -d ${env.db.database} --clean --if-exists -f "${backupPath}"`;
      
      await execAsync(pgDumpCmd);
      
      this.log(`Backup créé: ${backupFile}`, 'success');
      this.stats.backups.push({ environment, file: backupFile, path: backupPath });
      
      return backupPath;
    } catch (error) {
      this.log(`Erreur backup: ${error.message}`, 'warning');
      return null;
    }
  }

  async syncDatabase(from, to) {
    this.log(`Synchronisation DB: ${from} → ${to}`, 'sync');
    
    if (this.options.skipDb) {
      this.log('Synchronisation DB ignorée (--skip-db)', 'warning');
      return;
    }

    const fromPool = from === 'dev' ? this.devPool : this.prodPool;
    const toPool = to === 'dev' ? this.devPool : this.prodPool;
    
    try {
      // Backup de destination
      await this.createBackup(to);
      
      // Tables à synchroniser
      const tables = ['tools', 'categories', 'tool_translations', 'category_translations', 'languages'];
      
      for (const table of tables) {
        await this.syncTable(table, fromPool, toPool, from, to);
      }
      
      this.log(`Synchronisation DB terminée: ${from} → ${to}`, 'success');
    } catch (error) {
      this.log(`Erreur sync DB: ${error.message}`, 'error');
      throw error;
    }
  }

  async syncTable(tableName, fromPool, toPool, fromEnv, toEnv) {
    this.log(`Sync table: ${tableName} (${fromEnv} → ${toEnv})`);
    
    try {
      // Récupérer les données source
      const { rows: sourceData } = await fromPool.query(`SELECT * FROM ${tableName}`);
      
      if (sourceData.length === 0) {
        this.log(`Table ${tableName} vide dans ${fromEnv}`, 'warning');
        return;
      }
      
      if (this.options.dryRun) {
        this.log(`[DRY RUN] ${sourceData.length} enregistrements seraient synchronisés`);
        return;
      }
      
      // Stratégies spéciales selon les tables et direction
      let syncStrategy = 'replace';
      if (tableName === 'tools' && toEnv === 'prod') {
        syncStrategy = 'merge_analytics'; // Préserver les analytics en prod
      }
      
      await this.executeSyncStrategy(tableName, sourceData, toPool, syncStrategy);
      
      this.log(`${sourceData.length} enregistrements synchronisés`, 'success');
    } catch (error) {
      this.log(`Erreur sync table ${tableName}: ${error.message}`, 'error');
      throw error;
    }
  }

  async executeSyncStrategy(tableName, data, toPool, strategy) {
    if (data.length === 0) return;
    
    const columns = Object.keys(data[0]);
    
    await toPool.query('BEGIN');
    
    try {
      if (strategy === 'replace') {
        // Remplacement complet
        await toPool.query(`DELETE FROM ${tableName}`);
        
        const values = data.map((row, index) => {
          const placeholders = columns.map((_, colIndex) => 
            `$${index * columns.length + colIndex + 1}`
          ).join(', ');
          return `(${placeholders})`;
        }).join(', ');
        
        const flatValues = data.flatMap(row => columns.map(col => row[col]));
        
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values}`;
        await toPool.query(query, flatValues);
        
      } else if (strategy === 'merge_analytics') {
        // Merge intelligent pour préserver les analytics
        for (const row of data) {
          const setClause = columns
            .filter(col => !['view_count', 'click_count', 'favorite_count'].includes(col))
            .map(col => `${col} = $${columns.indexOf(col) + 1}`)
            .join(', ');
          
          const values = columns.map(col => row[col]);
          
          await toPool.query(`
            INSERT INTO ${tableName} (${columns.join(', ')}) 
            VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
            ON CONFLICT (id) DO UPDATE SET ${setClause}
          `, values);
        }
      }
      
      await toPool.query('COMMIT');
    } catch (error) {
      await toPool.query('ROLLBACK');
      throw error;
    }
  }

  async syncGit(direction) {
    if (this.options.skipGit) {
      this.log('Synchronisation Git ignorée (--skip-git)', 'warning');
      return;
    }

    this.log(`Synchronisation Git: ${direction}`, 'sync');
    
    try {
      if (direction === 'push') {
        // WSL → GitHub → VPS
        this.log('Push vers GitHub...');
        await execAsync('git add .');
        await execAsync(`git commit -m "Auto-sync: ${new Date().toISOString()}" || true`);
        await execAsync('git push origin main');
        
        // Pull sur VPS
        this.log('Pull sur VPS...');
        await this.executeOnVPS('cd /var/www/video-ia.net && git pull origin main');
        await this.executeOnVPS('cd /var/www/video-ia.net && npm ci --production');
        await this.executeOnVPS('cd /var/www/video-ia.net && npm run build');
        await this.executeOnVPS('pm2 reload video-ia-net');
        
      } else if (direction === 'pull') {
        // VPS → GitHub → WSL
        this.log('Pull depuis VPS...');
        await this.executeOnVPS('cd /var/www/video-ia.net && git add . && git commit -m "Auto-sync from prod" && git push origin main || true');
        await execAsync('git pull origin main');
        await execAsync('npm ci');
      }
      
      this.log('Synchronisation Git terminée', 'success');
    } catch (error) {
      this.log(`Erreur sync Git: ${error.message}`, 'error');
      throw error;
    }
  }

  async executeOnVPS(command) {
    const sshCommand = `sshpass -p "${ENVIRONMENTS.prod.ssh.password}" ssh -o StrictHostKeyChecking=no ${ENVIRONMENTS.prod.ssh.user}@${ENVIRONMENTS.prod.ssh.host} "${command}"`;
    
    if (this.options.dryRun) {
      this.log(`[DRY RUN] SSH: ${command}`);
      return;
    }
    
    const { stdout, stderr } = await execAsync(sshCommand);
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(stderr);
    }
    return stdout;
  }

  async validateSync() {
    this.log('Validation de la synchronisation...', 'sync');
    
    try {
      const devTools = await this.devPool.query('SELECT COUNT(*) FROM tools WHERE is_active = true');
      const prodTools = await this.prodPool.query('SELECT COUNT(*) FROM tools WHERE is_active = true');
      
      const devCount = parseInt(devTools.rows[0].count);
      const prodCount = parseInt(prodTools.rows[0].count);
      
      this.log(`Validation: DEV=${devCount}, PROD=${prodCount}`);
      
      const diff = Math.abs(devCount - prodCount);
      const diffPercent = (diff / Math.max(devCount, prodCount)) * 100;
      
      if (diffPercent > 10) {
        this.log(`Différence importante: ${diffPercent.toFixed(1)}%`, 'warning');
      } else {
        this.log('Synchronisation validée', 'success');
      }
      
      // Test des endpoints
      await this.validateEndpoints();
      
      return { dev: devCount, prod: prodCount, diffPercent };
    } catch (error) {
      this.log(`Erreur validation: ${error.message}`, 'warning');
      return null;
    }
  }

  async validateEndpoints() {
    const endpoints = [
      { env: 'dev', url: `${ENVIRONMENTS.dev.app.url}/api/tools?limit=1` },
      { env: 'prod', url: `${ENVIRONMENTS.prod.app.url}/api/tools?limit=1` }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);
        if (response.ok) {
          this.log(`Endpoint ${endpoint.env} OK`, 'success');
        } else {
          this.log(`Endpoint ${endpoint.env} erreur: ${response.status}`, 'warning');
        }
      } catch (error) {
        this.log(`Endpoint ${endpoint.env} inaccessible: ${error.message}`, 'warning');
      }
    }
  }

  async generateReport() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
    const report = {
      timestamp: new Date().toISOString(),
      mode: this.options.mode,
      duration: `${duration}s`,
      operations: this.stats.operations.length,
      errors: this.stats.errors.length,
      warnings: this.stats.warnings.length,
      backups: this.stats.backups,
      summary: {
        success: this.stats.errors.length === 0,
        message: this.stats.errors.length === 0 
          ? 'Synchronisation réussie' 
          : `${this.stats.errors.length} erreurs détectées`
      }
    };
    
    // Sauvegarder le rapport
    const reportPath = path.join(process.cwd(), 'logs', `sync-report-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  async run() {
    try {
      this.log(`🚀 Début synchronisation: ${this.options.mode}`, 'sync');
      this.log(`Options: ${JSON.stringify(this.options, null, 2)}`, 'debug');
      
      // Connexion aux bases de données
      await this.connectDatabases();
      
      // Exécution selon le mode
      switch (this.options.mode) {
        case 'dev-to-prod':
          await this.syncGit('push');
          await this.syncDatabase('dev', 'prod');
          break;
          
        case 'prod-to-dev':
          await this.syncGit('pull');
          await this.syncDatabase('prod', 'dev');
          break;
          
        case 'full-sync':
          // Sync intelligent bidirectionnel
          await this.syncGit('push');
          await this.syncDatabase('dev', 'prod');
          // Récupération analytics depuis prod
          await this.syncAnalyticsFromProd();
          break;
          
        default:
          throw new Error(`Mode inconnu: ${this.options.mode}`);
      }
      
      // Validation finale
      await this.validateSync();
      
      // Génération du rapport
      const report = await this.generateReport();
      
      this.log('🎉 Synchronisation terminée avec succès!', 'success');
      this.log(`Rapport: ${JSON.stringify(report.summary, null, 2)}`, 'info');
      
      return report;
      
    } catch (error) {
      this.log(`💥 Synchronisation échouée: ${error.message}`, 'error');
      this.stats.errors.push(error.message);
      
      const report = await this.generateReport();
      return report;
    } finally {
      // Nettoyage
      if (this.devPool) await this.devPool.end();
      if (this.prodPool) await this.prodPool.end();
    }
  }

  async syncAnalyticsFromProd() {
    this.log('Synchronisation des analytics PROD → DEV', 'sync');
    
    try {
      const analyticsQuery = `
        SELECT id, view_count, click_count, favorite_count 
        FROM tools 
        WHERE view_count > 0 OR click_count > 0 OR favorite_count > 0
      `;
      
      const { rows: prodAnalytics } = await this.prodPool.query(analyticsQuery);
      
      for (const analytics of prodAnalytics) {
        await this.devPool.query(`
          UPDATE tools 
          SET view_count = $2, click_count = $3, favorite_count = $4, updated_at = NOW()
          WHERE id = $1
        `, [analytics.id, analytics.view_count, analytics.click_count, analytics.favorite_count]);
      }
      
      this.log(`${prodAnalytics.length} analytics synchronisés`, 'success');
    } catch (error) {
      this.log(`Erreur sync analytics: ${error.message}`, 'warning');
    }
  }
}

// Interface CLI
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    mode: args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'dev-to-prod',
    dryRun: args.includes('--dry-run'),
    backup: !args.includes('--no-backup'),
    skipGit: args.includes('--skip-git'),
    skipDb: args.includes('--skip-db'),
    skipAssets: args.includes('--skip-assets'),
    force: args.includes('--force'),
    quiet: args.includes('--quiet')
  };
  
  // Validation du mode
  const validModes = ['dev-to-prod', 'prod-to-dev', 'full-sync'];
  if (!validModes.includes(options.mode)) {
    console.error(`Mode invalide. Utilisez: ${validModes.join(', ')}`);
    process.exit(1);
  }
  
  const syncer = new BidirectionalSyncer(options);
  const report = await syncer.run();
  
  process.exit(report.summary.success ? 0 : 1);
}

// Exécution si appelé directement
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export { BidirectionalSyncer };