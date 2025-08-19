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

class DatabaseExporter {
  constructor() {
    this.pool = new Pool(dbConfig);
    this.exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        databaseName: dbConfig.database,
        tables: [],
      },
      data: {},
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

  async getTableStructure() {
    const query = `
      SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND c.table_schema = 'public'
      ORDER BY t.table_name, c.ordinal_position
    `;

    const result = await this.client.query(query);
    const tables = {};

    result.rows.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        default: row.column_default,
        maxLength: row.character_maximum_length,
        precision: row.numeric_precision,
        scale: row.numeric_scale,
      });
    });

    return tables;
  }

  async exportTableData(tableName) {
    console.log(`📊 Export de la table: ${tableName}`);

    // Obtenir le nombre total d'enregistrements
    const countResult = await this.client.query(
      `SELECT COUNT(*) as count FROM ${tableName}`
    );
    const totalCount = parseInt(countResult.rows[0].count);

    if (totalCount === 0) {
      console.log(`   ⚠️  Table vide: ${tableName}`);
      return [];
    }

    // Exporter par lots pour éviter les problèmes de mémoire
    const batchSize = 1000;
    const allData = [];

    for (let offset = 0; offset < totalCount; offset += batchSize) {
      const query = `SELECT * FROM ${tableName} ORDER BY id LIMIT ${batchSize} OFFSET ${offset}`;
      const result = await this.client.query(query);

      // Convertir les dates en ISO string pour la sérialisation JSON
      const processedData = result.rows.map(row => {
        const processedRow = {};
        for (const [key, value] of Object.entries(row)) {
          if (value instanceof Date) {
            processedRow[key] = value.toISOString();
          } else {
            processedRow[key] = value;
          }
        }
        return processedRow;
      });

      allData.push(...processedData);
      console.log(
        `   📦 Lot ${Math.floor(offset / batchSize) + 1}: ${processedData.length} enregistrements`
      );
    }

    console.log(`   ✅ Export terminé: ${allData.length} enregistrements`);
    return allData;
  }

  async exportAllData() {
    try {
      console.log("🚀 Début de l'export de la base de données...");

      // Obtenir la structure des tables
      const tableStructure = await this.getTableStructure();
      this.exportData.metadata.tables = Object.keys(tableStructure);

      console.log('\n📋 Tables trouvées:', this.exportData.metadata.tables.join(', '));

      // Exporter les données de chaque table
      for (const tableName of this.exportData.metadata.tables) {
        const tableData = await this.exportTableData(tableName);
        this.exportData.data[tableName] = {
          structure: tableStructure[tableName],
          records: tableData,
          count: tableData.length,
        };
      }

      console.log('\n✅ Export terminé avec succès !');
    } catch (error) {
      console.error("❌ Erreur lors de l'export:", error.message);
      throw error;
    }
  }

  async saveExport(filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      filename = `database-export-${timestamp}.json`;
    }

    const exportPath = path.join(__dirname, '..', 'data', 'exports', filename);

    // Créer le dossier exports s'il n'existe pas
    const exportsDir = path.dirname(exportPath);
    await fs.mkdir(exportsDir, { recursive: true });

    // Sauvegarder l'export
    await fs.writeFile(exportPath, JSON.stringify(this.exportData, null, 2));

    console.log(`💾 Export sauvegardé: ${exportPath}`);
    return exportPath;
  }

  async generateImportTemplate() {
    const template = {
      metadata: {
        importDate: new Date().toISOString(),
        version: '1.0',
        source: 'database-export-template',
        description: "Template pour l'import de données",
      },
      importConfig: {
        mode: 'insert', // 'insert', 'update', 'upsert', 'replace'
        skipExisting: true,
        validateData: true,
        batchSize: 100,
      },
      data: {},
    };

    // Créer des templates vides pour chaque table
    for (const tableName of this.exportData.metadata.tables) {
      const tableStructure = this.exportData.data[tableName].structure;
      const sampleRecord = {};

      tableStructure.forEach(column => {
        // Générer des valeurs d'exemple basées sur le type
        switch (column.type) {
          case 'integer':
          case 'bigint':
            sampleRecord[column.column] = 0;
            break;
          case 'character varying':
          case 'text':
            sampleRecord[column.column] = '';
            break;
          case 'boolean':
            sampleRecord[column.column] = false;
            break;
          case 'timestamp without time zone':
          case 'timestamp with time zone':
            sampleRecord[column.column] = new Date().toISOString();
            break;
          case 'numeric':
          case 'decimal':
            sampleRecord[column.column] = 0.0;
            break;
          default:
            sampleRecord[column.column] = null;
        }
      });

      template.data[tableName] = {
        structure: tableStructure,
        records: [sampleRecord],
        count: 1,
      };
    }

    const templatePath = path.join(
      __dirname,
      '..',
      'data',
      'exports',
      'import-template.json'
    );
    await fs.writeFile(templatePath, JSON.stringify(template, null, 2));

    console.log(`📝 Template d'import généré: ${templatePath}`);
    return templatePath;
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
  const exporter = new DatabaseExporter();

  try {
    await exporter.connect();
    await exporter.exportAllData();

    // Sauvegarder l'export complet
    const exportPath = await exporter.saveExport();

    // Générer un template d'import
    const templatePath = await exporter.generateImportTemplate();

    console.log("\n📊 Résumé de l'export:");
    console.log('========================');
    for (const [tableName, tableData] of Object.entries(exporter.exportData.data)) {
      console.log(`${tableName}: ${tableData.count} enregistrements`);
    }

    console.log('\n📁 Fichiers générés:');
    console.log(`   Export complet: ${exportPath}`);
    console.log(`   Template import: ${templatePath}`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await exporter.close();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = DatabaseExporter;
