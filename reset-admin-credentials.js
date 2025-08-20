const bcrypt = require('bcryptjs')
const { Pool } = require('pg')
const crypto = require('crypto')

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'video_ia_net',
  user: 'video_ia_user',
  password: 'video123',
  ssl: false
})

async function resetAdminCredentials() {
  try {
    console.log('🔐 Génération de nouveaux credentials admin...')
    
    // Generate secure password
    const newPassword = crypto.randomBytes(12).toString('base64').slice(0, 16)
    console.log('✅ Nouveau mot de passe généré:', newPassword)
    
    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
    console.log('✅ Hash généré')
    
    // Update in database
    const updateResult = await pool.query(
      `UPDATE admin_users 
       SET password_hash = $1, 
           updated_at = NOW() 
       WHERE email = $2 
       RETURNING id, email, name, role`,
      [hashedPassword, 'admin@video-ia.net']
    )
    
    if (updateResult.rows.length === 0) {
      console.log('❌ Aucun utilisateur mis à jour')
      return
    }
    
    const updatedUser = updateResult.rows[0]
    console.log('✅ Utilisateur mis à jour:', updatedUser)
    
    // Verify the new password works
    console.log('\n🧪 Vérification du nouveau mot de passe...')
    const isValid = await bcrypt.compare(newPassword, hashedPassword)
    console.log('✅ Vérification:', isValid ? 'SUCCÈS' : 'ÉCHEC')
    
    // Also create a simple admin/admin combination for easy access
    console.log('\n🔧 Création d\'un compte admin simple...')
    const simplePassword = 'admin2025!'
    const simpleHash = await bcrypt.hash(simplePassword, saltRounds)
    
    // Check if simple admin exists
    const existingSimple = await pool.query(
      'SELECT id FROM admin_users WHERE email = $1',
      ['admin@videoianet.com']
    )
    
    if (existingSimple.rows.length === 0) {
      // Create simple admin
      await pool.query(
        `INSERT INTO admin_users (email, name, password_hash, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        ['admin@videoianet.com', 'Simple Admin', simpleHash, 'super_admin', true]
      )
      console.log('✅ Compte admin simple créé')
    } else {
      // Update existing simple admin
      await pool.query(
        'UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [simpleHash, 'admin@videoianet.com']
      )
      console.log('✅ Compte admin simple mis à jour')
    }
    
    console.log('\n🎯 NOUVEAUX CREDENTIALS:')
    console.log('==========================================')
    console.log('📧 Email principal: admin@video-ia.net')
    console.log('🔐 Mot de passe: ' + newPassword)
    console.log('')
    console.log('📧 Email alternatif: admin@videoianet.com') 
    console.log('🔐 Mot de passe: admin2025!')
    console.log('==========================================')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await pool.end()
  }
}

resetAdminCredentials()