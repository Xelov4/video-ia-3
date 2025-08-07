#!/usr/bin/env node

/**
 * 🔍 Database Analyzer & Sync Advisor
 * 
 * Analyse les différences entre les bases de données DEV et PROD
 * et recommande la meilleure stratégie de synchronisation.
 * 
 * Usage:
 *   npm run sync:analyze
 *   npm run sync:analyze -- --compare-all --output=report.json
 */

import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

class DatabaseAnalyzer {
  constructor(options = {}) {
    this.devPool = new Pool(DEV_CONFIG);
    this.prodPool = new Pool(PROD_CONFIG);
    this.options = {
      compareAll: false,
      outputFile: null,
      verbose: false,
      ...options
    };
    
    this.analysis = {
      timestamp: new Date().toISOString(),
      tables: {},
      recommendations: [],
      summary: {},
      risks: []
    };
  }

  async log(message, level = 'info') {
    if (!this.options.verbose && level === 'debug') return;
    
    const prefix = {
      info: '📊',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    }[level] || '📊';
    
    console.log(`${prefix} ${message}`);
  }

  async analyzeTable(tableName) {
    this.log(`Analyse de la table ${tableName}...`, 'debug');
    
    try {
      // Statistiques de base
      const [devStats, prodStats] = await Promise.all([
        this.getTableStats(tableName, this.devPool),
        this.getTableStats(tableName, this.prodPool)
      ]);
      
      // Analyse des différences
      const differences = await this.compareTableData(tableName);
      
      // Analyse des performances
      const performance = await this.analyzeTablePerformance(tableName);
      
      const analysis = {
        dev: devStats,
        prod: prodStats,
        differences,
        performance,
        recommendations: this.generateTableRecommendations(tableName, devStats, prodStats, differences)
      };
      
      this.analysis.tables[tableName] = analysis;
      return analysis;
      
    } catch (error) {
      this.log(`Erreur analyse table ${tableName}: ${error.message}`, 'error');
      return null;
    }
  }

  async getTableStats(tableName, pool) {
    const queries = {
      tools: `
        SELECT 
          COUNT(*) as total_count,
          COUNT(*) FILTER (WHERE is_active = true) as active_count,
          COUNT(*) FILTER (WHERE featured = true) as featured_count,
          AVG(view_count) as avg_views,
          AVG(click_count) as avg_clicks,
          MAX(updated_at) as last_update,
          COUNT(DISTINCT tool_category) as categories_count
        FROM tools
      `,
      categories: `
        SELECT 
          COUNT(*) as total_count,
          AVG(tool_count) as avg_tools_per_category,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
          MAX(created_at) as last_created
        FROM categories
      `,
      tool_translations: `
        SELECT 
          COUNT(*) as total_count,
          COUNT(DISTINCT language_code) as languages_count,
          COUNT(DISTINCT tool_id) as tools_with_translations,
          AVG(quality_score) as avg_quality,
          COUNT(*) FILTER (WHERE human_reviewed = true) as human_reviewed_count
        FROM tool_translations
      `,
      default: `
        SELECT 
          COUNT(*) as total_count,
          MAX(updated_at) as last_update
        FROM ${tableName}
      `
    };
    
    const query = queries[tableName] || queries.default;
    const result = await pool.query(query);
    return result.rows[0];
  }

  async compareTableData(tableName) {
    this.log(`Comparaison des données ${tableName}...`, 'debug');
    
    try {
      if (tableName === 'tools') {
        return await this.compareToolsData();
      } else if (tableName === 'categories') {
        return await this.compareCategoriesData();
      }
      
      // Comparaison générique
      return await this.compareGenericTable(tableName);
      
    } catch (error) {
      this.log(`Erreur comparaison ${tableName}: ${error.message}`, 'warning');
      return { error: error.message };
    }
  }

  async compareToolsData() {
    // Outils présents dans DEV mais pas dans PROD
    const devOnlyQuery = `
      SELECT COUNT(*) as count, array_agg(tool_name ORDER BY tool_name LIMIT 10) as sample
      FROM tools 
      WHERE id NOT IN (
        SELECT id FROM tools 
      ) AND is_active = true
    `;
    
    // Outils modifiés plus récemment dans DEV
    const devNewerQuery = `
      SELECT COUNT(*) as count
      FROM tools dev_tools
      WHERE EXISTS (
        SELECT 1 FROM tools prod_tools 
        WHERE prod_tools.id = dev_tools.id 
        AND dev_tools.updated_at > prod_tools.updated_at
      )
    `;
    
    try {
      const [devOnly, prodOnly, devNewer, prodNewer] = await Promise.all([
        this.devPool.query(devOnlyQuery).catch(() => ({ rows: [{ count: 0, sample: [] }] })),
        this.prodPool.query(devOnlyQuery).catch(() => ({ rows: [{ count: 0, sample: [] }] })),
        this.devPool.query(devNewerQuery).catch(() => ({ rows: [{ count: 0 }] })),
        this.prodPool.query(devNewerQuery).catch(() => ({ rows: [{ count: 0 }] }))
      ]);
      
      return {
        devOnly: parseInt(devOnly.rows[0]?.count || 0),
        prodOnly: parseInt(prodOnly.rows[0]?.count || 0),
        devNewer: parseInt(devNewer.rows[0]?.count || 0),
        prodNewer: parseInt(prodNewer.rows[0]?.count || 0),
        devOnlySample: devOnly.rows[0]?.sample || [],
        prodOnlySample: prodOnly.rows[0]?.sample || []
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async compareCategoriesData() {
    try {
      const devCategoriesResult = await this.devPool.query('SELECT name FROM categories ORDER BY name');
      const prodCategoriesResult = await this.prodPool.query('SELECT name FROM categories ORDER BY name');
      
      const devCategories = new Set(devCategoriesResult.rows.map(r => r.name));
      const prodCategories = new Set(prodCategoriesResult.rows.map(r => r.name));
      
      const devOnly = [...devCategories].filter(cat => !prodCategories.has(cat));
      const prodOnly = [...prodCategories].filter(cat => !devCategories.has(cat));
      const common = [...devCategories].filter(cat => prodCategories.has(cat));
      
      return {
        devOnly: devOnly.length,
        prodOnly: prodOnly.length,
        common: common.length,
        devOnlyList: devOnly.slice(0, 10),
        prodOnlyList: prodOnly.slice(0, 10)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async compareGenericTable(tableName) {
    try {
      const [devCount, prodCount] = await Promise.all([
        this.devPool.query(`SELECT COUNT(*) as count FROM ${tableName}`),
        this.prodPool.query(`SELECT COUNT(*) as count FROM ${tableName}`)
      ]);
      
      return {
        devCount: parseInt(devCount.rows[0].count),
        prodCount: parseInt(prodCount.rows[0].count),
        difference: parseInt(devCount.rows[0].count) - parseInt(prodCount.rows[0].count)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async analyzeTablePerformance(tableName) {
    // Analyse basique de performance
    try {
      const sizeQuery = `
        SELECT 
          pg_size_pretty(pg_total_relation_size('${tableName}')) as table_size,
          pg_size_pretty(pg_relation_size('${tableName}')) as data_size
      `;
      
      const [devSize, prodSize] = await Promise.all([
        this.devPool.query(sizeQuery),
        this.prodPool.query(sizeQuery)
      ]);
      
      return {
        dev: devSize.rows[0],
        prod: prodSize.rows[0]
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  generateTableRecommendations(tableName, devStats, prodStats, differences) {
    const recommendations = [];
    
    if (!devStats || !prodStats || !differences) {
      return ['Analyse incomplète - vérification manuelle recommandée'];
    }
    
    // Recommandations pour les outils
    if (tableName === 'tools') {
      const devCount = parseInt(devStats.total_count || 0);
      const prodCount = parseInt(prodStats.total_count || 0);
      
      if (devCount > prodCount + 100) {
        recommendations.push('🚀 Sync DEV → PROD recommandée (nouveaux outils en DEV)');
      }
      
      if (prodCount > devCount + 100) {
        recommendations.push('📥 Sync PROD → DEV recommandée (nouveaux outils en PROD)');
      }
      
      if (differences.devNewer > 50) {
        recommendations.push(`⚡ ${differences.devNewer} outils plus récents en DEV`);
      }
      
      if (differences.prodNewer > 50) {
        recommendations.push(`📊 ${differences.prodNewer} outils plus récents en PROD (analytics?)` );
      }
      
      if (Math.abs(devCount - prodCount) / Math.max(devCount, prodCount) > 0.1) {
        recommendations.push('⚠️ Différence importante détectée (>10%) - sync complète recommandée');
      }
    }
    
    // Recommandations pour les catégories
    if (tableName === 'categories') {
      if (differences.devOnly > 0) {
        recommendations.push(`📁 ${differences.devOnly} nouvelles catégories en DEV`);
      }
      
      if (differences.prodOnly > 0) {
        recommendations.push(`📂 ${differences.prodOnly} catégories uniques en PROD`);
      }
    }
    
    return recommendations;
  }

  generateGlobalRecommendations() {
    const recs = [];
    const risks = [];
    
    // Analyse globale
    const toolsAnalysis = this.analysis.tables.tools;
    if (toolsAnalysis) {
      const devToolsCount = parseInt(toolsAnalysis.dev?.total_count || 0);
      const prodToolsCount = parseInt(toolsAnalysis.prod?.total_count || 0);
      
      if (devToolsCount === 0 || prodToolsCount === 0) {
        risks.push('🚨 Une des bases de données semble vide!');
        recs.push('Vérification manuelle urgente nécessaire');
      } else {
        const diffPercent = Math.abs(devToolsCount - prodToolsCount) / Math.max(devToolsCount, prodToolsCount);
        
        if (diffPercent > 0.5) {
          risks.push(`🚨 Différence majeure: ${Math.round(diffPercent * 100)}%`);
          recs.push('Sync complète recommandée avec backup préalable');
        } else if (diffPercent > 0.1) {
          recs.push('Sync incrémentale suffisante');
        } else {
          recs.push('Bases synchronisées - sync légère ou pas nécessaire');
        }
      }
      
      // Recommandations de direction
      if (devToolsCount > prodToolsCount) {
        recs.push('🔄 Direction recommandée: DEV → PROD');
      } else if (prodToolsCount > devToolsCount) {
        recs.push('🔄 Direction recommandée: PROD → DEV');
      }
    }
    
    this.analysis.recommendations = recs;
    this.analysis.risks = risks;
  }

  async generateSummary() {
    const tables = Object.keys(this.analysis.tables);
    let totalDevRecords = 0;
    let totalProdRecords = 0;
    
    for (const table of tables) {
      const analysis = this.analysis.tables[table];
      if (analysis?.dev?.total_count) {
        totalDevRecords += parseInt(analysis.dev.total_count);
      }
      if (analysis?.prod?.total_count) {
        totalProdRecords += parseInt(analysis.prod.total_count);
      }
    }
    
    this.analysis.summary = {
      tablesAnalyzed: tables.length,
      totalDevRecords,
      totalProdRecords,
      overallDifference: totalDevRecords - totalProdRecords,
      syncRequired: Math.abs(totalDevRecords - totalProdRecords) > 100,
      lastAnalysis: this.analysis.timestamp
    };
  }

  async run() {
    const startTime = Date.now();
    
    try {
      this.log('🔍 Début de l\'analyse des bases de données...');
      
      // Validation des connexions
      await Promise.all([
        this.devPool.query('SELECT 1'),
        this.prodPool.query('SELECT 1')
      ]);
      this.log('✅ Connexions validées');
      
      // Tables à analyser
      const tables = ['tools', 'categories', 'tool_translations', 'category_translations'];
      
      if (this.options.compareAll) {
        tables.push('languages', 'tags');
      }
      
      // Analyse de chaque table
      for (const table of tables) {
        await this.analyzeTable(table);
      }
      
      // Génération des recommandations globales
      this.generateGlobalRecommendations();
      
      // Génération du résumé
      await this.generateSummary();
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.log(`✅ Analyse terminée en ${duration}s`);
      
      // Affichage des résultats
      this.displayResults();
      
      // Sauvegarde si demandée
      if (this.options.outputFile) {
        await this.saveResults();
      }
      
      return this.analysis;
      
    } catch (error) {
      this.log(`❌ Erreur lors de l'analyse: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.devPool.end();
      await this.prodPool.end();
    }
  }

  displayResults() {
    console.log('\n📊 RÉSULTATS DE L\'ANALYSE\n');
    
    // Résumé
    const { summary } = this.analysis;
    console.log('📈 Résumé:');
    console.log(`  • Tables analysées: ${summary.tablesAnalyzed}`);
    console.log(`  • Records DEV: ${summary.totalDevRecords.toLocaleString()}`);
    console.log(`  • Records PROD: ${summary.totalProdRecords.toLocaleString()}`);
    console.log(`  • Différence: ${summary.overallDifference > 0 ? '+' : ''}${summary.overallDifference.toLocaleString()}`);
    
    // Risques
    if (this.analysis.risks.length > 0) {
      console.log('\n🚨 Risques identifiés:');
      this.analysis.risks.forEach(risk => console.log(`  ${risk}`));
    }
    
    // Recommandations
    console.log('\n🎯 Recommandations:');
    this.analysis.recommendations.forEach(rec => console.log(`  ${rec}`));
    
    // Détails par table
    console.log('\n📋 Détails par table:');
    Object.entries(this.analysis.tables).forEach(([table, analysis]) => {
      console.log(`\n  ${table.toUpperCase()}:`);
      console.log(`    DEV: ${analysis.dev?.total_count || 'N/A'} records`);
      console.log(`    PROD: ${analysis.prod?.total_count || 'N/A'} records`);
      
      if (analysis.recommendations?.length > 0) {
        analysis.recommendations.forEach(rec => 
          console.log(`    → ${rec}`)
        );
      }
    });
    
    console.log('\n');
  }

  async saveResults() {
    try {
      await fs.writeFile(
        this.options.outputFile,
        JSON.stringify(this.analysis, null, 2),
        'utf8'
      );
      this.log(`📄 Rapport sauvegardé: ${this.options.outputFile}`, 'success');
    } catch (error) {
      this.log(`❌ Erreur sauvegarde: ${error.message}`, 'error');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    compareAll: args.includes('--compare-all'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    outputFile: args.find(arg => arg.startsWith('--output='))?.split('=')[1]
  };
  
  const analyzer = new DatabaseAnalyzer(options);
  const result = await analyzer.run();
  
  // Code de sortie basé sur les risques
  const exitCode = result.risks.length > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Exécution si appelé directement
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export { DatabaseAnalyzer };