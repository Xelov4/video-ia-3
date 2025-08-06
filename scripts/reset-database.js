const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'video_ia_user',
  password: process.env.DB_PASSWORD || 'video_ia_dev_2024',
  ssl: false
});

async function resetDatabase() {
  try {
    console.log('🗑️  Réinitialisation complète de la base de données...\n');
    
    const client = await pool.connect();
    
    // Compter les données avant suppression
    const beforeStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM tools) as tools_count,
        (SELECT COUNT(*) FROM categories) as categories_count,
        (SELECT COUNT(*) FROM tags) as tags_count,
        (SELECT COUNT(*) FROM tool_translations) as translations_count
    `);
    
    console.log('📊 Données avant suppression:');
    console.log(`- Outils: ${beforeStats.rows[0].tools_count}`);
    console.log(`- Catégories: ${beforeStats.rows[0].categories_count}`);
    console.log(`- Tags: ${beforeStats.rows[0].tags_count}`);
    console.log(`- Traductions: ${beforeStats.rows[0].translations_count}`);
    console.log('');
    
    // Supprimer toutes les données dans l'ordre (pour respecter les contraintes de clés étrangères)
    console.log('🧹 Suppression des données...');
    
    // 1. Supprimer les liaisons (tables de jointure)
    await client.query('DELETE FROM tool_tags');
    console.log('✅ Liaisons outils-tags supprimées');
    
    await client.query('DELETE FROM tool_categories');
    console.log('✅ Liaisons outils-catégories supprimées');
    
    // 2. Supprimer les traductions
    await client.query('DELETE FROM tag_translations');
    console.log('✅ Traductions de tags supprimées');
    
    await client.query('DELETE FROM category_translations');
    console.log('✅ Traductions de catégories supprimées');
    
    await client.query('DELETE FROM tool_translations');
    console.log('✅ Traductions d\'outils supprimées');
    
    // 3. Supprimer les entités principales
    await client.query('DELETE FROM tags');
    console.log('✅ Tags supprimés');
    
    await client.query('DELETE FROM categories');
    console.log('✅ Catégories supprimées');
    
    await client.query('DELETE FROM tools');
    console.log('✅ Outils supprimés');
    
    // Vérifier que tout est vide
    const afterStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM tools) as tools_count,
        (SELECT COUNT(*) FROM categories) as categories_count,
        (SELECT COUNT(*) FROM tags) as tags_count,
        (SELECT COUNT(*) FROM tool_translations) as translations_count
    `);
    
    console.log('\n📊 Données après suppression:');
    console.log(`- Outils: ${afterStats.rows[0].tools_count}`);
    console.log(`- Catégories: ${afterStats.rows[0].categories_count}`);
    console.log(`- Tags: ${afterStats.rows[0].tags_count}`);
    console.log(`- Traductions: ${afterStats.rows[0].translations_count}`);
    
    // Réinitialiser les séquences si elles existent
    try {
      await client.query('ALTER SEQUENCE IF EXISTS tools_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE IF EXISTS tags_id_seq RESTART WITH 1');
      console.log('✅ Séquences réinitialisées');
    } catch (error) {
      console.log('ℹ️  Pas de séquences à réinitialiser (utilisation d\'UUID)');
    }
    
    client.release();
    console.log('\n🎉 Base de données complètement réinitialisée !');
    console.log('📝 Prêt pour une nouvelle migration avec le nouveau fichier CSV');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase(); 