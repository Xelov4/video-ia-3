#!/usr/bin/env node

const DatabaseExporter = require('./database-export');
const DatabaseImporter = require('./database-import');
const fs = require('fs').promises;
const path = require('path');

class DatabaseManager {
  constructor() {
    this.exportsDir = path.join(__dirname, '..', 'data', 'exports');
  }

  async ensureExportsDirectory() {
    await fs.mkdir(this.exportsDir, { recursive: true });
  }

  async listExports() {
    await this.ensureExportsDirectory();

    try {
      const files = await fs.readdir(this.exportsDir);
      const exports = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.exportsDir, file);
          const stats = await fs.stat(filePath);

          try {
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);

            exports.push({
              filename: file,
              path: filePath,
              size: stats.size,
              date: data.metadata?.exportDate || stats.mtime,
              tables: data.metadata?.tables || [],
              recordCount: Object.values(data.data || {}).reduce(
                (sum, table) => sum + (table.count || 0),
                0
              ),
            });
          } catch (error) {
            console.warn(`⚠️  Fichier corrompu: ${file}`);
          }
        }
      }

      return exports.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('❌ Erreur lors de la lecture des exports:', error.message);
      return [];
    }
  }

  async createBackup(description = '') {
    console.log("🔄 Création d'un backup de la base de données...");

    const exporter = new DatabaseExporter();

    try {
      await exporter.connect();
      await exporter.exportAllData();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `backup-${timestamp}${description ? '-' + description.replace(/\s+/g, '-') : ''}.json`;

      const backupPath = await exporter.saveExport(filename);

      console.log(`✅ Backup créé: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Erreur lors de la création du backup:', error.message);
      throw error;
    } finally {
      await exporter.close();
    }
  }

  async restoreFromBackup(backupFile, mode = 'upsert') {
    console.log(`🔄 Restauration depuis le backup: ${backupFile}`);

    const importer = new DatabaseImporter({ mode });

    try {
      await importer.connect();
      await importer.loadImportFile(backupFile);
      await importer.importAllData();

      const stats = importer.getImportStats();

      console.log('✅ Restauration terminée !');
      console.log(
        `📊 Résumé: ${stats.summary.totalImported} importés, ${stats.summary.totalSkipped} ignorés`
      );

      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error.message);
      throw error;
    } finally {
      await importer.close();
    }
  }

  async createTemplate() {
    console.log("📝 Création d'un template d'import...");

    const exporter = new DatabaseExporter();

    try {
      await exporter.connect();
      await exporter.exportAllData();

      const templatePath = await exporter.generateImportTemplate();

      console.log(`✅ Template créé: ${templatePath}`);
      return templatePath;
    } catch (error) {
      console.error('❌ Erreur lors de la création du template:', error.message);
      throw error;
    } finally {
      await exporter.close();
    }
  }

  async validateExport(exportFile) {
    console.log(`🔍 Validation de l'export: ${exportFile}`);

    try {
      const content = await fs.readFile(exportFile, 'utf8');
      const data = JSON.parse(content);

      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        stats: {
          tables: Object.keys(data.data || {}).length,
          totalRecords: 0,
          fileSize: content.length,
        },
      };

      // Validation de la structure
      if (!data.metadata) {
        validation.isValid = false;
        validation.errors.push('Métadonnées manquantes');
      }

      if (!data.data) {
        validation.isValid = false;
        validation.errors.push('Données manquantes');
      }

      // Validation des tables
      for (const [tableName, tableData] of Object.entries(data.data || {})) {
        if (!tableData.structure) {
          validation.errors.push(`Structure manquante pour la table: ${tableName}`);
        }

        if (!Array.isArray(tableData.records)) {
          validation.errors.push(
            `Enregistrements invalides pour la table: ${tableName}`
          );
        } else {
          validation.stats.totalRecords += tableData.records.length;
        }
      }

      if (validation.isValid) {
        console.log('✅ Export valide');
        console.log(
          `📊 Tables: ${validation.stats.tables}, Enregistrements: ${validation.stats.totalRecords}`
        );
      } else {
        console.log('❌ Export invalide');
        validation.errors.forEach(error => console.log(`   - ${error}`));
      }

      return validation;
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error.message);
      return {
        isValid: false,
        errors: [error.message],
        warnings: [],
        stats: { tables: 0, totalRecords: 0, fileSize: 0 },
      };
    }
  }

  async showHelp() {
    console.log(`
🔧 Gestionnaire de Base de Données Video-IA.net

Usage: node database-manager.js <commande> [options]

Commandes disponibles:

📤 EXPORT/IMPORT:
  export                    Créer un export complet de la base de données
  import <fichier> [mode]   Importer des données (modes: insert, update, upsert, replace)
  backup [description]      Créer un backup avec description optionnelle
  restore <fichier> [mode]  Restaurer depuis un backup

📋 GESTION:
  list                      Lister tous les exports disponibles
  template                  Créer un template d'import vide
  validate <fichier>        Valider un fichier d'export
  clean                     Nettoyer les anciens exports (garder les 10 plus récents)

📊 INFORMATIONS:
  stats                     Afficher les statistiques de la base de données
  help                      Afficher cette aide

Exemples:
  node database-manager.js export
  node database-manager.js import backup-2024-01-15.json upsert
  node database-manager.js backup "avant-mise-a-jour"
  node database-manager.js restore backup-2024-01-15.json replace
  node database-manager.js list
    `);
  }

  async showStats() {
    console.log('📊 Statistiques de la base de données...');

    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'video_ia_net',
      user: process.env.DB_USER || 'video_ia_user',
      password: process.env.DB_PASSWORD || 'video123',
      ssl: false,
    });

    try {
      const client = await pool.connect();

      // Obtenir les statistiques de toutes les tables
      const tables = [
        'admin_activity_log',
        'admin_sessions',
        'admin_users',
        'categories',
        'tags',
        'tools',
      ];
      const stats = {};

      for (const table of tables) {
        try {
          const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
          stats[table] = parseInt(result.rows[0].count);
        } catch (error) {
          stats[table] = 'N/A';
        }
      }

      console.log('\n📋 Statistiques par table:');
      console.log('========================');
      for (const [table, count] of Object.entries(stats)) {
        console.log(`${table}: ${count} enregistrements`);
      }

      const totalRecords = Object.values(stats).reduce(
        (sum, count) => sum + (typeof count === 'number' ? count : 0),
        0
      );

      console.log(`\n📊 Total: ${totalRecords} enregistrements`);

      client.release();
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des statistiques:',
        error.message
      );
    } finally {
      await pool.end();
    }
  }

  async cleanOldExports(keepCount = 10) {
    console.log(
      `🧹 Nettoyage des anciens exports (garder les ${keepCount} plus récents)...`
    );

    const exports = await this.listExports();

    if (exports.length <= keepCount) {
      console.log('✅ Aucun nettoyage nécessaire');
      return;
    }

    const toDelete = exports.slice(keepCount);

    for (const exportFile of toDelete) {
      try {
        await fs.unlink(exportFile.path);
        console.log(`🗑️  Supprimé: ${exportFile.filename}`);
      } catch (error) {
        console.error(
          `❌ Erreur lors de la suppression de ${exportFile.filename}:`,
          error.message
        );
      }
    }

    console.log(`✅ Nettoyage terminé: ${toDelete.length} fichiers supprimés`);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = new DatabaseManager();

  try {
    switch (command) {
      case 'export':
        const exporter = new DatabaseExporter();
        await exporter.connect();
        await exporter.exportAllData();
        const exportPath = await exporter.saveExport();
        await exporter.generateImportTemplate();
        await exporter.close();
        console.log(`✅ Export terminé: ${exportPath}`);
        break;

      case 'import':
        const importFile = args[1];
        const mode = args[2] || 'insert';
        if (!importFile) {
          console.error("❌ Fichier d'import requis");
          process.exit(1);
        }
        await manager.restoreFromBackup(importFile, mode);
        break;

      case 'backup':
        const description = args[1] || '';
        await manager.createBackup(description);
        break;

      case 'restore':
        const backupFile = args[1];
        const restoreMode = args[2] || 'upsert';
        if (!backupFile) {
          console.error('❌ Fichier de backup requis');
          process.exit(1);
        }
        await manager.restoreFromBackup(backupFile, restoreMode);
        break;

      case 'list':
        const exports = await manager.listExports();
        console.log('\n📁 Exports disponibles:');
        console.log('=====================');
        if (exports.length === 0) {
          console.log('Aucun export trouvé');
        } else {
          exports.forEach((exp, index) => {
            console.log(`${index + 1}. ${exp.filename}`);
            console.log(`   📅 ${new Date(exp.date).toLocaleString()}`);
            console.log(
              `   📊 ${exp.tables.length} tables, ${exp.recordCount} enregistrements`
            );
            console.log(`   📏 ${(exp.size / 1024).toFixed(1)} KB`);
            console.log('');
          });
        }
        break;

      case 'template':
        await manager.createTemplate();
        break;

      case 'validate':
        const validateFile = args[1];
        if (!validateFile) {
          console.error('❌ Fichier à valider requis');
          process.exit(1);
        }
        await manager.validateExport(validateFile);
        break;

      case 'clean':
        const keepCount = parseInt(args[1]) || 10;
        await manager.cleanOldExports(keepCount);
        break;

      case 'stats':
        await manager.showStats();
        break;

      case 'help':
      case '--help':
      case '-h':
        await manager.showHelp();
        break;

      default:
        console.error(
          '❌ Commande inconnue. Utilisez "help" pour voir les commandes disponibles.'
        );
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = DatabaseManager;
