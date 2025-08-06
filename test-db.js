const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'video_ia_user',
  password: process.env.DB_PASSWORD || 'video123',
  ssl: false
});

async function testDB() {
  try {
    console.log('🔌 Test de connexion PostgreSQL...');
    
    const client = await pool.connect();
    
    // Test de connexion
    const versionResult = await client.query('SELECT version()');
    console.log('✅ Connexion réussie:', versionResult.rows[0].version.split(' ')[0]);
    
    // Vérifier les tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables disponibles:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Compter les outils si la table existe
    if (tablesResult.rows.some(row => row.table_name === 'tools')) {
      const toolsCount = await client.query('SELECT COUNT(*) as count FROM tools');
      console.log(`\n🛠️  Outils dans la base: ${toolsCount.rows[0].count}`);
    }
    
    // Compter les catégories si la table existe
    if (tablesResult.rows.some(row => row.table_name === 'categories')) {
      const categoriesCount = await client.query('SELECT COUNT(*) as count FROM categories');
      console.log(`📂 Catégories dans la base: ${categoriesCount.rows[0].count}`);
    }
    
    client.release();
    console.log('\n✅ Test de base de données réussi !');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur de test:', error.message);
    process.exit(1);
  }
}

testDB(); 