const fs = require('fs');
const { parse } = require('csv-parse/sync');

async function analyzeNewCSV() {
  try {
    console.log('📊 Analyse du nouveau fichier CSV working_database.csv...');
    
    const csvPath = './data/working_database.csv';
    
    if (!fs.existsSync(csvPath)) {
      console.log('❌ Fichier working_database.csv non trouvé');
      console.log('📁 Fichiers disponibles dans data/:');
      const files = fs.readdirSync('./data/');
      files.forEach(file => console.log(`  - ${file}`));
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Lire les premières lignes pour voir la structure
    const lines = csvContent.split('\n').slice(0, 5);
    console.log('\n📋 Premières lignes du CSV:');
    lines.forEach((line, index) => {
      console.log(`Ligne ${index + 1}: ${line.substring(0, 200)}...`);
    });
    
    // Parser avec les colonnes automatiques
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';', // Utiliser le point-virgule
      max_record_size: 1000000
    });
    
    console.log(`\n✅ ${records.length} enregistrements lus`);
    
    // Analyser les colonnes du premier enregistrement
    if (records.length > 0) {
      const firstRecord = records[0];
      console.log('\n📋 Colonnes disponibles:');
      Object.keys(firstRecord).forEach((key, index) => {
        const value = firstRecord[key];
        const preview = value ? value.substring(0, 50) : 'null';
        console.log(`${index + 1}. ${key}: "${preview}..."`);
      });
      
      // Analyser quelques exemples
      console.log('\n🔍 Exemples de données:');
      console.log('tool_name:', firstRecord.tool_name);
      console.log('tool_category:', firstRecord.tool_category);
      console.log('tool_link:', firstRecord.tool_link);
      console.log('overview:', firstRecord.overview?.substring(0, 100));
      console.log('tool_description:', firstRecord.tool_description?.substring(0, 100));
      console.log('target_audience:', firstRecord.target_audience);
      console.log('key_features:', firstRecord.key_features);
      console.log('use_cases:', firstRecord.use_cases);
      console.log('tags:', firstRecord.tags);
      console.log('image_url:', firstRecord.image_url);
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
      .slice(0, 15)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} outils`);
      });
    
    // Analyser les tags
    const tags = new Set();
    records.slice(0, 100).forEach(record => {
      if (record.tags) {
        const tagList = record.tags.split(',').map(tag => tag.trim().toLowerCase());
        tagList.forEach(tag => {
          if (tag.length > 0) {
            tags.add(tag);
          }
        });
      }
    });
    
    console.log(`\n🏷️ Tags uniques trouvés (échantillon): ${tags.size}`);
    Array.from(tags).slice(0, 20).forEach(tag => {
      console.log(`  - ${tag}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

analyzeNewCSV(); 