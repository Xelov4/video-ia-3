#!/usr/bin/env node

/**
 * Script de Monitoring Migration Multilingue
 * Surveille performance et intégrité pendant migration
 */

const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'video_ia_net',
  user: 'video_ia_user',
  password: 'video123',
});

class MigrationMonitor {
  constructor() {
    this.startTime = Date.now();
    this.logFile = `logs/migration-monitor-${new Date().toISOString().split('T')[0]}.log`;
  }

  async init() {
    await client.connect();
    
    // Créer dossier logs si nécessaire
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    
    console.log('🔍 Migration Monitor Started');
    this.log('Migration Monitor Started');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
    console.log(`[${timestamp}] ${message}`);
  }

  async getSystemStats() {
    const stats = {};
    
    try {
      // Compter outils actifs
      const toolsResult = await client.query(
        'SELECT COUNT(*) as count FROM tools WHERE is_active = true'
      );
      stats.active_tools = parseInt(toolsResult.rows[0].count);
      
      // Compter traductions si table existe
      try {
        const translationsResult = await client.query(
          'SELECT language_code, COUNT(*) as count FROM tool_translations GROUP BY language_code'
        );
        stats.translations_by_language = translationsResult.rows.reduce((acc, row) => {
          acc[row.language_code] = parseInt(row.count);
          return acc;
        }, {});
      } catch (e) {
        stats.translations_by_language = 'Table not created yet';
      }
      
      // Taille base de données
      const dbSizeResult = await client.query(`
        SELECT pg_size_pretty(pg_database_size('video_ia_net')) as db_size
      `);
      stats.database_size = dbSizeResult.rows[0].db_size;
      
      // Performance test simple
      const start = Date.now();
      await client.query('SELECT COUNT(*) FROM tools WHERE is_active = true');
      const end = Date.now();
      stats.query_response_time_ms = end - start;
      
    } catch (error) {
      this.log(`❌ Error getting system stats: ${error.message}`);
      stats.error = error.message;
    }
    
    return stats;
  }

  async recordPhaseCompletion(phase, metrics = {}) {
    try {
      for (const [metricName, value] of Object.entries(metrics)) {
        await client.query(`
          INSERT INTO test_multilingual.migration_stats (phase, metric_name, metric_value)
          VALUES ($1, $2, $3)
        `, [phase, metricName, value]);
      }
      
      this.log(`✅ Phase ${phase} completed with metrics: ${JSON.stringify(metrics)}`);
    } catch (error) {
      this.log(`❌ Error recording phase completion: ${error.message}`);
    }
  }

  async checkIntegrity() {
    try {
      const result = await client.query('SELECT * FROM test_multilingual.validate_migration_integrity()');
      
      this.log('🔍 Integrity Check Results:');
      result.rows.forEach(check => {
        const status = check.status === 'PASS' ? '✅' : '❌';
        this.log(`  ${status} ${check.check_name}: ${check.details}`);
      });
      
      return result.rows.every(check => check.status === 'PASS');
    } catch (error) {
      this.log(`❌ Integrity check failed: ${error.message}`);
      return false;
    }
  }

  async generateReport() {
    const stats = await this.getSystemStats();
    const runtime = Date.now() - this.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      runtime_minutes: Math.round(runtime / 60000),
      system_stats: stats,
      phase_completion: await this.getPhaseCompletions()
    };
    
    this.log('📊 Current Status Report:');
    this.log(JSON.stringify(report, null, 2));
    
    return report;
  }

  async getPhaseCompletions() {
    try {
      const result = await client.query(`
        SELECT phase, COUNT(*) as metrics_count 
        FROM test_multilingual.migration_stats 
        GROUP BY phase 
        ORDER BY phase
      `);
      return result.rows;
    } catch (error) {
      return [];
    }
  }

  async close() {
    await client.end();
    this.log('🔚 Migration Monitor Stopped');
  }
}

// Export pour utilisation dans autres scripts
module.exports = MigrationMonitor;

// Si exécuté directement, faire un check rapide
if (require.main === module) {
  (async () => {
    const monitor = new MigrationMonitor();
    await monitor.init();
    await monitor.generateReport();
    await monitor.close();
  })();
}