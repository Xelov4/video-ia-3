const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

async function analyzeAndCleanCSV() {
  try {
    console.log('🔍 Analyse et nettoyage du CSV working_database.csv...\n');
    
    const inputPath = './data/working_database.csv';
    const outputPath = './data/working_database_clean.csv';
    
    if (!fs.existsSync(inputPath)) {
      console.log('❌ Fichier working_database.csv non trouvé');
      console.log('📁 Fichiers disponibles dans data/:');
      const files = fs.readdirSync('./data/');
      files.forEach(file => console.log(`  - ${file}`));
      return;
    }
    
    // Lire le fichier CSV
    const csvContent = fs.readFileSync(inputPath, 'utf-8');
    
    // Analyser la structure
    console.log('📋 Analyse de la structure...');
    const lines = csvContent.split('\n').slice(0, 5);
    console.log('\nPremières lignes du CSV:');
    lines.forEach((line, index) => {
      console.log(`Ligne ${index + 1}: ${line.substring(0, 200)}...`);
    });
    
    // Parser le CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';'
    });
    
    console.log(`\n📊 ${records.length} enregistrements lus`);
    
    // Analyser les colonnes
    if (records.length > 0) {
      const firstRecord = records[0];
      console.log('\n📋 Colonnes détectées:');
      Object.keys(firstRecord).forEach((key, index) => {
        const value = firstRecord[key];
        const preview = value ? value.substring(0, 50) : 'null';
        console.log(`${index + 1}. ${key}: "${preview}..."`);
      });
    }
    
    // Nettoyer les données
    console.log('\n🧹 Nettoyage des données...');
    
    const cleanedRecords = [];
    let skippedRows = 0;
    let emptyRows = 0;
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      // Trouver le nom de l'outil en cherchant dans toutes les colonnes possibles
      let toolName = '';
      for (const key of Object.keys(record)) {
        if (key.toLowerCase().includes('tool_name') || key.toLowerCase().includes('name')) {
          toolName = record[key];
          break;
        }
      }
      
      // Si pas trouvé, essayer la première colonne
      if (!toolName && Object.keys(record).length > 0) {
        const firstKey = Object.keys(record)[0];
        toolName = record[firstKey];
      }
      
      // Vérifier si la ligne a un nom d'outil
      if (!toolName || toolName.trim().length === 0) {
        emptyRows++;
        continue;
      }
      
      // Nettoyer chaque champ en utilisant les noms de colonnes exacts détectés
      const cleanedRecord = {
        tool_name: cleanField(toolName),
        tool_category: cleanField(record.tool_category),
        'tool_link 1': cleanField(record['tool_link 1']),
        overview: cleanField(record.overview),
        tool_description: cleanField(record.tool_description),
        target_audience: cleanField(record.target_audience),
        target_audience2: cleanField(record.target_audience2),
        target_audience3: cleanField(record.target_audience3),
        target_audience4: cleanField(record.target_audience4),
        'key_features 1': cleanField(record.key_features_1),
        'key_features 2': cleanField(record.key_features_2),
        'key_features 3': cleanField(record.key_features_3),
        'key_features 4': cleanField(record.key_features_4),
        'use_cases_1': cleanField(record.use_cases_1),
        'use_cases_2': cleanField(record.use_cases_2),
        'use_cases_3': cleanField(record.use_cases_3),
        'use_cases_4': cleanField(record.use_cases_4),
        'tag_1': cleanField(record.tag_1),
        'tag_2': cleanField(record.tag_2),
        image_link: cleanField(record.image_link)
      };
      
      // Vérifier si l'outil a des données minimales
      if (cleanedRecord.tool_name && cleanedRecord.tool_name.length > 0) {
        cleanedRecords.push(cleanedRecord);
      } else {
        skippedRows++;
      }
    }
    
    console.log(`✅ ${cleanedRecords.length} enregistrements nettoyés`);
    console.log(`⏭️ ${skippedRows} lignes ignorées (données insuffisantes)`);
    console.log(`🗑️ ${emptyRows} lignes vides supprimées`);
    
    // Analyser les données nettoyées
    console.log('\n📈 Analyse des données nettoyées...');
    
    // Compter les catégories
    const categories = new Set();
    const categoryCount = {};
    
    cleanedRecords.forEach(record => {
      if (record.tool_category) {
        const category = record.tool_category.trim();
        categories.add(category);
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });
    
    console.log(`\n📂 Catégories trouvées: ${categories.size}`);
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} outils`);
      });
    
    // Analyser les URLs
    let validUrls = 0;
    let invalidUrls = 0;
    
    cleanedRecords.forEach(record => {
      if (record['tool_link 1'] && record['tool_link 1'].startsWith('http')) {
        validUrls++;
      } else {
        invalidUrls++;
      }
    });
    
    console.log(`\n🔗 URLs: ${validUrls} valides, ${invalidUrls} invalides`);
    
    // Analyser les descriptions
    let withDescription = 0;
    let withoutDescription = 0;
    
    cleanedRecords.forEach(record => {
      if (record.tool_description && record.tool_description.length > 50) {
        withDescription++;
      } else {
        withoutDescription++;
      }
    });
    
    console.log(`📝 Descriptions: ${withDescription} complètes, ${withoutDescription} manquantes`);
    
    // Écrire le CSV nettoyé
    console.log('\n💾 Écriture du CSV nettoyé...');
    
    const outputContent = stringify(cleanedRecords, {
      header: true,
      delimiter: ';'
    });
    
    fs.writeFileSync(outputPath, outputContent);
    
    console.log(`✅ CSV nettoyé créé: ${outputPath}`);
    console.log(`📊 ${cleanedRecords.length} enregistrements exportés`);
    
    // Afficher quelques exemples
    console.log('\n📋 Exemples d\'enregistrements nettoyés:');
    cleanedRecords.slice(0, 3).forEach((record, index) => {
      console.log(`\n${index + 1}. ${record.tool_name}`);
      console.log(`   Catégorie: ${record.tool_category}`);
      console.log(`   URL: ${record['tool_link 1']}`);
      console.log(`   Aperçu: ${record.overview?.substring(0, 100)}...`);
    });
    
    console.log('\n🎉 Nettoyage terminé avec succès !');
    console.log(`📁 Fichier prêt: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

function cleanField(value) {
  if (!value) return '';
  
  return value
    .trim()
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples
    .replace(/[\r\n\t]/g, ' ') // Remplacer les retours à la ligne
    .replace(/[^\x00-\x7F]/g, '') // Supprimer les caractères non-ASCII
    .replace(/[""]/g, '"') // Normaliser les guillemets
    .replace(/['']/g, "'") // Normaliser les apostrophes
    .replace(/[–—]/g, '-') // Normaliser les tirets
    .replace(/[…]/g, '...') // Normaliser les points de suspension
    .replace(/\s*;\s*/g, ', ') // Remplacer les points-virgules par des virgules
    .replace(/\s*,\s*/g, ', ') // Normaliser les virgules
    .replace(/^\s*[,\s]+\s*$/, '') // Supprimer les lignes vides
    .substring(0, 1000); // Limiter la longueur
}

analyzeAndCleanCSV(); 