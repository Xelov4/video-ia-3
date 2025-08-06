const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'video_ia_user',
  password: process.env.DB_PASSWORD || 'video_ia_dev_2024',
  ssl: false
});

async function testDatabase() {
  try {
    console.log('🔌 Test de connexion à PostgreSQL...');
    
    const client = await pool.connect();
    
    // Test de connexion
    const versionResult = await client.query('SELECT version()');
    console.log('✅ Connexion réussie:', versionResult.rows[0].version.split(' ')[0]);
    
    // Compter les outils
    const toolsResult = await client.query('SELECT COUNT(*) as count FROM tools');
    console.log('📊 Outils dans la base:', toolsResult.rows[0].count);
    
    // Compter les catégories
    const categoriesResult = await client.query('SELECT COUNT(*) as count FROM categories');
    console.log('📂 Catégories dans la base:', categoriesResult.rows[0].count);
    
    // Compter les tags
    const tagsResult = await client.query('SELECT COUNT(*) as count FROM tags');
    console.log('🏷️ Tags dans la base:', tagsResult.rows[0].count);
    
    // Compter les traductions d'outils
    const translationsResult = await client.query('SELECT COUNT(*) as count FROM tool_translations');
    console.log('🌐 Traductions d\'outils:', translationsResult.rows[0].count);
    
    // Afficher quelques exemples d'outils
    const examplesResult = await client.query(`
      SELECT t.slug, tt.name, tt.overview 
      FROM tools t 
      JOIN tool_translations tt ON t.id = tt.tool_id 
      WHERE tt.language_id = 'en' 
      LIMIT 5
    `);
    
    console.log('\n📋 Exemples d\'outils importés:');
    examplesResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (${row.slug})`);
      console.log(`   ${row.overview?.substring(0, 100)}...`);
    });
    
    // Statistiques par catégorie
    const categoryStatsResult = await client.query(`
      SELECT c.slug, COUNT(tc.tool_id) as tool_count
      FROM categories c
      LEFT JOIN tool_categories tc ON c.id = tc.category_id
      GROUP BY c.id, c.slug
      ORDER BY tool_count DESC
      LIMIT 10
    `);
    
    console.log('\n📈 Top 10 des catégories:');
    categoryStatsResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.slug}: ${row.tool_count} outils`);
    });
    
    client.release();
    console.log('\n✅ Test de base de données terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase(); 