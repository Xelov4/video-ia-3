const fs = require('fs');
const { parse } = require('csv-parse/sync');

async function analyzeCSVStructure() {
  try {
    console.log('📊 Analyse de la structure du CSV...');
    
    const csvPath = './data/working_database_rationalized_full.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Lire les premières lignes pour voir la structure
    const lines = csvContent.split('\n').slice(0, 3);
    console.log('\n📋 Premières lignes du CSV:');
    lines.forEach((line, index) => {
      console.log(`Ligne ${index + 1}: ${line.substring(0, 200)}...`);
    });
    
    // Parser avec les colonnes automatiques
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',
      max_record_size: 1000000 // Augmenter la taille max
    });
    
    console.log(`\n✅ ${records.length} enregistrements lus`);
    
    // Analyser les colonnes du premier enregistrement
    if (records.length > 0) {
      const firstRecord = records[0];
      console.log('\n📋 Colonnes disponibles:');
      Object.keys(firstRecord).forEach((key, index) => {
        console.log(`${index + 1}. ${key}: "${firstRecord[key]?.substring(0, 50)}..."`);
      });
      
      // Analyser quelques exemples
      console.log('\n🔍 Exemples de données:');
      console.log('tool_name:', firstRecord.tool_name);
      console.log('tool_category:', firstRecord.tool_category);
      console.log('tool_link 1:', firstRecord['tool_link 1']);
      console.log('overview:', firstRecord.overview?.substring(0, 100));
      console.log('tool_desc:', firstRecord.tool_desc?.substring(0, 100));
      console.log('who 1:', firstRecord['who 1']);
      console.log('key_featu:', firstRecord['key_featu']);
      console.log('use_cases:', firstRecord['use_cases']);
      console.log('tag 1:', firstRecord['tag 1']);
      console.log('image 1:', firstRecord['image 1']);
    }
    
    // Analyser les catégories
    const categories = new Set();
    const categoryCount = {};
    
    records.slice(0, 100).forEach(record => {
      if (record.tool_category) {
        const category = record.tool_category.trim();
        categories.add(category);
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });
    
    console.log('\n📂 Catégories trouvées (échantillon):');
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} outils`);
      });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

analyzeCSVStructure(); 