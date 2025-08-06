const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'video_ia_user',
  password: process.env.DB_PASSWORD || 'video123',
  ssl: false
})

async function testConnection() {
  try {
    const client = await pool.connect()
    
    // Test basic connection
    const result = await client.query('SELECT 1 as test')
    console.log('✅ Database connection successful')
    
    // Test tables exist
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('tools', 'categories', 'admin_users')
    `)
    
    console.log(`✅ Found ${tablesResult.rows.length} required tables:`)
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}`)
    })
    
    // Test data exists
    const toolsCount = await client.query('SELECT COUNT(*) as count FROM tools')
    const categoriesCount = await client.query('SELECT COUNT(*) as count FROM categories')
    
    console.log(`✅ Data summary:`)
    console.log(`   - Tools: ${toolsCount.rows[0].count}`)
    console.log(`   - Categories: ${categoriesCount.rows[0].count}`)
    
    client.release()
    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()