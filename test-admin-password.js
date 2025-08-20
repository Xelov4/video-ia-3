const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'video_ia_net',
  user: 'video_ia_user',
  password: 'video123',
  ssl: false
})

async function testPassword() {
  try {
    console.log('🔍 Test des mots de passe admin...')
    
    // Get user from database
    const result = await pool.query(
      'SELECT email, password_hash FROM admin_users WHERE email = $1',
      ['admin@video-ia.net']
    )
    
    if (result.rows.length === 0) {
      console.log('❌ Utilisateur non trouvé')
      return
    }
    
    const user = result.rows[0]
    console.log('✅ Utilisateur trouvé:', user.email)
    console.log('🔐 Hash stocké:', user.password_hash)
    
    // Test common passwords
    const testPasswords = [
      'admin',
      'password',
      'admin123',
      'video123',
      'videoianet',
      'administrator',
      '123456'
    ]
    
    console.log('\n🧪 Test des mots de passe courants...')
    
    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, user.password_hash)
      console.log(`${isValid ? '✅' : '❌'} "${password}": ${isValid ? 'VALIDE' : 'invalide'}`)
      
      if (isValid) {
        console.log(`\n🎯 MOT DE PASSE TROUVÉ: "${password}"`)
        break
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await pool.end()
  }
}

testPassword()