const fs = require('fs');
const { parse } = require('csv-parse/sync');

async function debugCSVStructure() {
  try {
    console.log('🔍 Debug de la structure du CSV...\n');
    
    const inputPath = './data/working_database.csv';
    
    if (!fs.existsSync(inputPath)) {
      console.log('❌ Fichier working_database.csv non trouvé');
      return;
    }
    
    // Lire le fichier CSV
    const csvContent = fs.readFileSync(inputPath, 'utf-8');
    
    // Parser le CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';'
    });
    
    console.log(`📊 ${records.length} enregistrements lus`);
    
    if (records.length > 0) {
      const firstRecord = records[0];
      console.log('\n📋 Colonnes exactes du premier enregistrement:');
      Object.keys(firstRecord).forEach((key, index) => {
        console.log(`${index + 1}. "${key}": "${firstRecord[key]?.substring(0, 50) || 'null'}..."`);
      });
      
      console.log('\n🔍 Test d\'accès aux colonnes:');
      console.log('record.tool_name:', firstRecord.tool_name ? 'OK' : 'NULL');
      console.log('record["tool_name"]:', firstRecord["tool_name"] ? 'OK' : 'NULL');
      console.log('record.tool_category:', firstRecord.tool_category ? 'OK' : 'NULL');
      console.log('record["tool_link 1"]:', firstRecord["tool_link 1"] ? 'OK' : 'NULL');
      console.log('record.overview:', firstRecord.overview ? 'OK' : 'NULL');
      console.log('record.key_features_1:', firstRecord.key_features_1 ? 'OK' : 'NULL');
      console.log('record.use_cases_1:', firstRecord.use_cases_1 ? 'OK' : 'NULL');
      
      // Tester quelques enregistrements
      console.log('\n📋 Test des 3 premiers enregistrements:');
      for (let i = 0; i < Math.min(3, records.length); i++) {
        const record = records[i];
        console.log(`\nEnregistrement ${i + 1}:`);
        console.log(`  tool_name: "${record.tool_name}"`);
        console.log(`  tool_category: "${record.tool_category}"`);
        console.log(`  overview: "${record.overview?.substring(0, 100)}..."`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

debugCSVStructure(); 