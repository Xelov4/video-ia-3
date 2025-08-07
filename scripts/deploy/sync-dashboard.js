#!/usr/bin/env node

/**
 * 📊 Database Sync Dashboard
 * 
 * Interface interactive pour gérer les synchronisations de base de données
 * 
 * Usage:
 *   npm run sync:dashboard
 *   node scripts/deploy/sync-dashboard.js
 */

import { DatabaseSyncer } from './sync-to-prod.js';
import { ProdToDevSyncer } from './sync-from-prod.js';
import { DatabaseAnalyzer } from './database-analyzer.js';
import readline from 'readline';
import fs from 'fs/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class SyncDashboard {
  constructor() {
    this.syncHistory = [];
  }

  async question(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  }

  displayHeader() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              📊 VIDEO-IA.NET SYNC DASHBOARD               ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  Gestion intelligente de la synchronisation des données   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log();
  }

  displayMainMenu() {
    console.log('🎯 OPTIONS DISPONIBLES:');
    console.log();
    console.log('1️⃣  📊 Analyser les bases de données');
    console.log('2️⃣  🔄 Synchroniser DEV → PROD');
    console.log('3️⃣  📥 Synchroniser PROD → DEV');
    console.log('4️⃣  📈 Afficher l\'historique des syncs');
    console.log('5️⃣  🔍 Mode diagnostic avancé');
    console.log('6️⃣  ⚙️  Configuration des paramètres');
    console.log('7️⃣  📚 Aide et documentation');
    console.log('8️⃣  🚪 Quitter');
    console.log();
  }

  async analyzeOption() {
    console.log('🔍 ANALYSE DES BASES DE DONNÉES');
    console.log('==============================');
    
    const options = await this.getAnalysisOptions();
    const analyzer = new DatabaseAnalyzer(options);
    
    try {
      const result = await analyzer.run();
      
      console.log('\n📊 Analyse terminée!');
      
      // Proposer des actions basées sur l'analyse
      if (result.recommendations.length > 0) {
        console.log('\n🎯 Actions recommandées:');
        result.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. ${rec}`);
        });
        
        const action = await this.question('\nVoulez-vous exécuter une synchronisation recommandée? (y/N): ');
        if (action.toLowerCase() === 'y') {
          await this.executeSyncFromRecommendation(result.recommendations);
        }
      }
      
    } catch (error) {
      console.log(`❌ Erreur lors de l'analyse: ${error.message}`);
    }
    
    await this.question('\nAppuyez sur Entrée pour continuer...');
  }

  async getAnalysisOptions() {
    const compareAll = await this.question('Analyse complète de toutes les tables? (y/N): ');
    const verbose = await this.question('Mode verbeux? (y/N): ');
    const saveReport = await this.question('Sauvegarder le rapport? (y/N): ');
    
    const options = {
      compareAll: compareAll.toLowerCase() === 'y',
      verbose: verbose.toLowerCase() === 'y',
      outputFile: saveReport.toLowerCase() === 'y' ? `sync-report-${Date.now()}.json` : null
    };
    
    return options;
  }

  async syncToProdOption() {
    console.log('🔄 SYNCHRONISATION DEV → PROD');
    console.log('=============================');
    
    const options = await this.getSyncToProdOptions();
    const syncer = new DatabaseSyncer(options);
    
    try {
      console.log('\n🚀 Démarrage de la synchronisation...');
      const result = await syncer.run();
      
      if (result.success) {
        console.log('✅ Synchronisation réussie!');
        this.addToHistory('DEV → PROD', result);
      } else {
        console.log('❌ Synchronisation échouée:', result.error);
      }
      
    } catch (error) {
      console.log(`💥 Erreur: ${error.message}`);
    }
    
    await this.question('\nAppuyez sur Entrée pour continuer...');
  }

  async getSyncToProdOptions() {
    console.log('\n⚙️ Configuration de la synchronisation:');
    
    const dryRun = await this.question('Mode test (dry run)? (Y/n): ');
    
    console.log('\nModes disponibles:');
    console.log('1. full - Synchronisation complète');
    console.log('2. tools - Outils uniquement');
    console.log('3. categories - Catégories uniquement');
    console.log('4. translations - Traductions uniquement');
    console.log('5. selective - Sélection personnalisée');
    
    const modeChoice = await this.question('Choisissez le mode (1-5): ');
    const modes = ['', 'full', 'tools', 'categories', 'translations', 'selective'];
    const mode = modes[parseInt(modeChoice)] || 'full';
    
    let tables = [];
    if (mode === 'selective') {
      const tablesInput = await this.question('Tables à synchroniser (séparées par des virgules): ');
      tables = tablesInput.split(',').map(t => t.trim());
    }
    
    const backup = await this.question('Créer un backup avant sync? (Y/n): ');
    const preserveAnalytics = await this.question('Préserver les analytics PROD? (Y/n): ');
    
    return {
      dryRun: dryRun.toLowerCase() !== 'n',
      mode,
      tables: tables.length > 0 ? tables : undefined,
      backup: backup.toLowerCase() !== 'n',
      preserveAnalytics: preserveAnalytics.toLowerCase() !== 'n',
      quiet: false
    };
  }

  async syncFromProdOption() {
    console.log('📥 SYNCHRONISATION PROD → DEV');
    console.log('=============================');
    
    const options = await this.getSyncFromProdOptions();
    const syncer = new ProdToDevSyncer(options);
    
    try {
      console.log('\n🚀 Démarrage de la synchronisation...');
      const result = await syncer.run();
      
      if (result.success) {
        console.log('✅ Synchronisation réussie!');
        this.addToHistory('PROD → DEV', result);
      } else {
        console.log('❌ Synchronisation échouée:', result.error);
      }
      
    } catch (error) {
      console.log(`💥 Erreur: ${error.message}`);
    }
    
    await this.question('\nAppuyez sur Entrée pour continuer...');
  }

  async getSyncFromProdOptions() {
    console.log('\n⚙️ Configuration de la synchronisation:');
    
    const dryRun = await this.question('Mode test (dry run)? (Y/n): ');
    
    console.log('\nModes disponibles:');
    console.log('1. content_only - Contenu sans analytics (recommandé)');
    console.log('2. full - Synchronisation complète');
    console.log('3. analytics_only - Analytics uniquement');
    console.log('4. tools_only - Outils uniquement');
    console.log('5. selective - Sélection personnalisée');
    
    const modeChoice = await this.question('Choisissez le mode (1-5): ');
    const modes = ['', 'content_only', 'full', 'analytics_only', 'tools_only', 'selective'];
    const mode = modes[parseInt(modeChoice)] || 'content_only';
    
    let tables = [];
    if (mode === 'selective') {
      const tablesInput = await this.question('Tables à synchroniser (séparées par des virgules): ');
      tables = tablesInput.split(',').map(t => t.trim());
    }
    
    const backup = await this.question('Créer un backup avant sync? (Y/n): ');
    const preserveDevData = await this.question('Préserver les données DEV spécifiques? (Y/n): ');
    
    return {
      dryRun: dryRun.toLowerCase() !== 'n',
      mode,
      tables: tables.length > 0 ? tables : undefined,
      backup: backup.toLowerCase() !== 'n',
      preserveDevData: preserveDevData.toLowerCase() !== 'n',
      quiet: false
    };
  }

  displayHistory() {
    console.log('📈 HISTORIQUE DES SYNCHRONISATIONS');
    console.log('=================================');
    
    if (this.syncHistory.length === 0) {
      console.log('Aucune synchronisation dans l\'historique de cette session.');
      return;
    }
    
    this.syncHistory.forEach((entry, index) => {
      console.log(`\n${index + 1}. ${entry.direction} - ${entry.timestamp}`);
      console.log(`   Status: ${entry.result.success ? '✅ Succès' : '❌ Échec'}`);
      if (entry.result.stats) {
        console.log(`   Durée: ${entry.result.duration}s`);
        console.log(`   Tables traitées: ${entry.result.stats.tablesProcessed}`);
        console.log(`   Enregistrements: ${entry.result.stats.rowsInserted} insérés, ${entry.result.stats.rowsUpdated} mis à jour`);
      }
    });
  }

  async diagnosticMode() {
    console.log('🔍 MODE DIAGNOSTIC AVANCÉ');
    console.log('=========================');
    
    console.log('1. Test de connectivité aux bases de données');
    console.log('2. Analyse de l\'intégrité des données');
    console.log('3. Vérification des performances');
    console.log('4. Audit de sécurité');
    console.log('5. Retour au menu principal');
    
    const choice = await this.question('\nChoisissez une option (1-5): ');
    
    switch (choice) {
      case '1':
        await this.testConnectivity();
        break;
      case '2':
        await this.checkDataIntegrity();
        break;
      case '3':
        await this.checkPerformance();
        break;
      case '4':
        await this.securityAudit();
        break;
      default:
        return;
    }
    
    await this.question('\nAppuyez sur Entrée pour continuer...');
  }

  async testConnectivity() {
    console.log('\n🔌 Test de connectivité...');
    
    // Tests basiques de connexion
    const { Pool } = await import('pg');
    
    const devConfig = {
      host: process.env.DEV_DB_HOST || 'localhost',
      port: process.env.DEV_DB_PORT || 5432,
      database: process.env.DEV_DB_NAME || 'video_ia_net',
      user: process.env.DEV_DB_USER || 'video_ia_user',
      password: process.env.DEV_DB_PASSWORD || 'video123',
    };
    
    const prodConfig = {
      host: process.env.PROD_DB_HOST || '46.202.129.104',
      port: process.env.PROD_DB_PORT || 5432,
      database: process.env.PROD_DB_NAME || 'video_ia_net',
      user: process.env.PROD_DB_USER || 'video_ia_user',
      password: process.env.PROD_DB_PASSWORD || 'Buzzerbeater23',
    };
    
    try {
      const devPool = new Pool(devConfig);
      await devPool.query('SELECT 1');
      console.log('✅ Connexion DEV réussie');
      await devPool.end();
    } catch (error) {
      console.log(`❌ Connexion DEV échouée: ${error.message}`);
    }
    
    try {
      const prodPool = new Pool(prodConfig);
      await prodPool.query('SELECT 1');
      console.log('✅ Connexion PROD réussie');
      await prodPool.end();
    } catch (error) {
      console.log(`❌ Connexion PROD échouée: ${error.message}`);
    }
  }

  async checkDataIntegrity() {
    console.log('\n🔍 Vérification de l\'intégrité...');
    console.log('Cette fonctionnalité sera implémentée dans la prochaine version.');
  }

  async checkPerformance() {
    console.log('\n⚡ Analyse des performances...');
    console.log('Cette fonctionnalité sera implémentée dans la prochaine version.');
  }

  async securityAudit() {
    console.log('\n🔒 Audit de sécurité...');
    console.log('Cette fonctionnalité sera implémentée dans la prochaine version.');
  }

  async showHelp() {
    console.log('📚 AIDE ET DOCUMENTATION');
    console.log('========================');
    console.log();
    console.log('🔄 TYPES DE SYNCHRONISATION:');
    console.log('• DEV → PROD: Déploie les modifications de développement en production');
    console.log('• PROD → DEV: Récupère les données de production vers le développement');
    console.log();
    console.log('🎯 MODES DE SYNCHRONISATION:');
    console.log('• full: Synchronise tout (attention aux analytics!)');
    console.log('• tools: Outils uniquement');
    console.log('• categories: Catégories uniquement');
    console.log('• content_only: Contenu sans les données d\'analytics');
    console.log('• analytics_only: Données d\'analytics uniquement');
    console.log();
    console.log('⚠️  BONNES PRATIQUES:');
    console.log('• Toujours faire un dry run en premier');
    console.log('• Créer des backups avant les syncs importantes');
    console.log('• Utiliser content_only pour PROD → DEV');
    console.log('• Analyser avant de synchroniser');
    console.log();
    console.log('🆘 EN CAS DE PROBLÈME:');
    console.log('• Les backups sont dans ./backups/');
    console.log('• Vérifiez les logs PM2: pm2 logs');
    console.log('• Contactez l\'équipe de développement');
    
    await this.question('\nAppuyez sur Entrée pour continuer...');
  }

  addToHistory(direction, result) {
    this.syncHistory.push({
      direction,
      timestamp: new Date().toISOString(),
      result
    });
    
    // Garder seulement les 10 derniers
    if (this.syncHistory.length > 10) {
      this.syncHistory.shift();
    }
  }

  async executeSyncFromRecommendation(recommendations) {
    // Logic pour exécuter automatiquement les syncs recommandées
    console.log('🤖 Exécution automatique des recommandations...');
    console.log('Cette fonctionnalité sera implémentée dans la prochaine version.');
  }

  async run() {
    try {
      while (true) {
        this.displayHeader();
        this.displayMainMenu();
        
        const choice = await this.question('Choisissez une option (1-8): ');
        
        switch (choice) {
          case '1':
            await this.analyzeOption();
            break;
          case '2':
            await this.syncToProdOption();
            break;
          case '3':
            await this.syncFromProdOption();
            break;
          case '4':
            this.displayHistory();
            await this.question('\nAppuyez sur Entrée pour continuer...');
            break;
          case '5':
            await this.diagnosticMode();
            break;
          case '6':
            console.log('⚙️ Configuration - À implémenter');
            await this.question('\nAppuyez sur Entrée pour continuer...');
            break;
          case '7':
            await this.showHelp();
            break;
          case '8':
            console.log('👋 Au revoir!');
            return;
          default:
            console.log('❌ Option invalide');
            await this.question('\nAppuyez sur Entrée pour continuer...');
        }
      }
    } finally {
      rl.close();
    }
  }
}

// CLI execution
async function main() {
  const dashboard = new SyncDashboard();
  await dashboard.run();
}

// Run if called directly
if (process.argv[1].endsWith('sync-dashboard.js')) {
  main().catch(console.error);
}

export { SyncDashboard };