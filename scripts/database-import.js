const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'video_ia_user',
  password: process.env.DB_PASSWORD || 'video123',
  ssl: false,
};

class DatabaseImporter {
  constructor(importConfig = {}) {
    this.pool = new Pool(dbConfig);
    this.config = {
      mode: 'insert', // 'insert', 'update', 'upsert', 'replace'
      skipExisting: true,
      validateData: true,
      batchSize: 100,
      ...importConfig,
    };
    this.stats = {
      imported: 0,
      skipped: 0,
      errors: 0,
      tables: {},
    };
  }

  async connect() {
    try {
      this.client = await this.pool.connect();
      console.log('✅ Connexion à la base de données établie');
    } catch (error) {
      console.error('❌ Erreur de connexion:', error.message);
      throw error;
    }
  }

  async loadImportFile(filePath) {
    try {
      console.log(`📂 Chargement du fichier d'import: ${filePath}`);
      const fileContent = await fs.readFile(filePath, 'utf8');
      this.importData = JSON.parse(fileContent);

      console.log(`📊 Données chargées:`);
      console.log(`   - Version: ${this.importData.metadata?.version || 'N/A'}`);
      console.log(`   - Tables: ${Object.keys(this.importData.data || {}).length}`);
      console.log(`   - Date: ${this.importData.metadata?.exportDate || 'N/A'}`);

      return this.importData;
    } catch (error) {
      console.error('❌ Erreur lors du chargement du fichier:', error.message);
      throw error;
    }
  }

  validateDataStructure(tableName, records, structure) {
    if (!this.config.validateData) return true;

    console.log(`🔍 Validation de la structure pour: ${tableName}`);

    for (const record of records) {
      for (const column of structure) {
        if (!column.nullable && !(column.column in record)) {
          throw new Error(
            `Colonne requise manquante: ${column.column} dans ${tableName}`
          );
        }
      }
    }

    return true;
  }

  async checkExistingRecords(tableName, records, primaryKey = 'id') {
    if (!this.config.skipExisting || this.config.mode === 'replace') {
      return { existing: [], new: records };
    }

    const primaryKeys = records
      .map(record => record[primaryKey])
      .filter(id => id !== null && id !== undefined);

    if (primaryKeys.length === 0) {
      return { existing: [], new: records };
    }

    const placeholders = primaryKeys.map((_, index) => `$${index + 1}`).join(',');
    const query = `SELECT ${primaryKey} FROM ${tableName} WHERE ${primaryKey} IN (${placeholders})`;

    const result = await this.client.query(query, primaryKeys);
    const existingIds = new Set(result.rows.map(row => row[primaryKey]));

    const existing = records.filter(record => existingIds.has(record[primaryKey]));
    const newRecords = records.filter(record => !existingIds.has(record[primaryKey]));

    return { existing, new: newRecords };
  }

  async insertRecords(tableName, records) {
    if (records.length === 0) return 0;

    // Convertir les noms de colonnes camelCase vers snake_case
    const convertColumnName = camelCase => {
      return camelCase.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    };

    const columns = Object.keys(records[0]);
    const dbColumns = columns.map(col => convertColumnName(col));

    const placeholders = records
      .map((_, recordIndex) => {
        const rowPlaceholders = columns
          .map((_, colIndex) => `$${recordIndex * columns.length + colIndex + 1}`)
          .join(', ');
        return `(${rowPlaceholders})`;
      })
      .join(', ');

    const query = `
      INSERT INTO ${tableName} (${dbColumns.join(', ')})
      VALUES ${placeholders}
      ON CONFLICT DO NOTHING
    `;

    const values = records.flatMap(record => columns.map(col => record[col]));

    const result = await this.client.query(query, values);
    return result.rowCount;
  }

  async updateRecords(tableName, records, primaryKey = 'id') {
    if (records.length === 0) return 0;

    // Convertir les noms de colonnes camelCase vers snake_case
    const convertColumnName = camelCase => {
      return camelCase.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    };

    let updatedCount = 0;

    for (const record of records) {
      const columns = Object.keys(record).filter(col => col !== primaryKey);
      const dbColumns = columns.map(col => convertColumnName(col));
      const setClause = dbColumns
        .map((col, index) => `${col} = $${index + 2}`)
        .join(', ');

      const query = `
        UPDATE ${tableName} 
        SET ${setClause}
        WHERE ${convertColumnName(primaryKey)} = $1
      `;

      const values = [record[primaryKey], ...columns.map(col => record[col])];
      const result = await this.client.query(query, values);
      updatedCount += result.rowCount;
    }

    return updatedCount;
  }

  async upsertRecords(tableName, records, primaryKey = 'id') {
    if (records.length === 0) return 0;

    // Convertir les noms de colonnes camelCase vers snake_case
    const convertColumnName = camelCase => {
      return camelCase.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    };

    const columns = Object.keys(records[0]);
    const dbColumns = columns.map(col => convertColumnName(col));

    const placeholders = records
      .map((_, recordIndex) => {
        const rowPlaceholders = columns
          .map((_, colIndex) => `$${recordIndex * columns.length + colIndex + 1}`)
          .join(', ');
        return `(${rowPlaceholders})`;
      })
      .join(', ');

    const updateClause = dbColumns
      .filter(col => col !== convertColumnName(primaryKey))
      .map(col => `${col} = EXCLUDED.${col}`)
      .join(', ');

    const query = `
      INSERT INTO ${tableName} (${dbColumns.join(', ')})
      VALUES ${placeholders}
      ON CONFLICT (${convertColumnName(primaryKey)}) DO UPDATE SET ${updateClause}
    `;

    const values = records.flatMap(record => columns.map(col => record[col]));

    const result = await this.client.query(query, values);
    return result.rowCount;
  }

  async replaceTableData(tableName, records) {
    // Supprimer toutes les données existantes
    await this.client.query(`DELETE FROM ${tableName}`);

    // Insérer les nouvelles données
    return await this.insertRecords(tableName, records);
  }

  async importTableData(tableName, tableData) {
    console.log(`\n📊 Import de la table: ${tableName}`);

    const { records, structure } = tableData;

    if (!records || records.length === 0) {
      console.log(`   ⚠️  Aucune donnée à importer pour: ${tableName}`);
      return;
    }

    // Validation de la structure
    this.validateDataStructure(tableName, records, structure);

    // Vérifier les enregistrements existants
    const { existing, new: newRecords } = await this.checkExistingRecords(
      tableName,
      records
    );

    console.log(
      `   📈 Enregistrements: ${records.length} total, ${existing.length} existants, ${newRecords.length} nouveaux`
    );

    let importedCount = 0;
    let skippedCount = existing.length;

    // Traitement selon le mode
    switch (this.config.mode) {
      case 'insert':
        if (newRecords.length > 0) {
          importedCount = await this.insertRecords(tableName, newRecords);
        }
        break;

      case 'update':
        if (existing.length > 0) {
          importedCount = await this.updateRecords(tableName, existing);
        }
        break;

      case 'upsert':
        importedCount = await this.upsertRecords(tableName, records);
        skippedCount = 0;
        break;

      case 'replace':
        importedCount = await this.replaceTableData(tableName, records);
        skippedCount = 0;
        break;

      default:
        throw new Error(`Mode d'import non supporté: ${this.config.mode}`);
    }

    // Mettre à jour les statistiques
    this.stats.tables[tableName] = {
      total: records.length,
      imported: importedCount,
      skipped: skippedCount,
      errors: 0,
    };

    console.log(
      `   ✅ Import terminé: ${importedCount} importés, ${skippedCount} ignorés`
    );
  }

  async importAllData() {
    try {
      console.log("🚀 Début de l'import de la base de données...");
      console.log(
        `🔧 Mode: ${this.config.mode}, Taille de lot: ${this.config.batchSize}`
      );

      const tables = Object.keys(this.importData.data);

      for (const tableName of tables) {
        try {
          await this.importTableData(tableName, this.importData.data[tableName]);
        } catch (error) {
          console.error(`❌ Erreur lors de l'import de ${tableName}:`, error.message);
          this.stats.errors++;
          this.stats.tables[tableName] = {
            total: 0,
            imported: 0,
            skipped: 0,
            errors: 1,
          };
        }
      }

      console.log('\n✅ Import terminé !');
    } catch (error) {
      console.error("❌ Erreur lors de l'import:", error.message);
      throw error;
    }
  }

  getImportStats() {
    const totalImported = Object.values(this.stats.tables).reduce(
      (sum, table) => sum + table.imported,
      0
    );
    const totalSkipped = Object.values(this.stats.tables).reduce(
      (sum, table) => sum + table.skipped,
      0
    );
    const totalErrors = Object.values(this.stats.tables).reduce(
      (sum, table) => sum + table.errors,
      0
    );

    return {
      summary: {
        totalImported,
        totalSkipped,
        totalErrors,
        tablesProcessed: Object.keys(this.stats.tables).length,
      },
      details: this.stats.tables,
    };
  }

  async close() {
    if (this.client) {
      this.client.release();
    }
    await this.pool.end();
    console.log('🔌 Connexion fermée');
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  const importFile = args[0];

  if (!importFile) {
    console.error('❌ Usage: node database-import.js <fichier-export.json> [mode]');
    console.error('   Modes disponibles: insert, update, upsert, replace');
    process.exit(1);
  }

  const mode = args[1] || 'insert';
  const importer = new DatabaseImporter({ mode });

  try {
    await importer.connect();
    await importer.loadImportFile(importFile);
    await importer.importAllData();

    const stats = importer.getImportStats();

    console.log("\n📊 Résumé de l'import:");
    console.log('========================');
    console.log(`Total importé: ${stats.summary.totalImported}`);
    console.log(`Total ignoré: ${stats.summary.totalSkipped}`);
    console.log(`Erreurs: ${stats.summary.totalErrors}`);
    console.log(`Tables traitées: ${stats.summary.tablesProcessed}`);

    console.log('\n📋 Détails par table:');
    for (const [tableName, tableStats] of Object.entries(stats.details)) {
      console.log(
        `  ${tableName}: ${tableStats.imported}/${tableStats.total} importés`
      );
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await importer.close();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = DatabaseImporter;
