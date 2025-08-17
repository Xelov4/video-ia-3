const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// Configuration de la base de données
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'video_ia_net',
  user: 'video_ia_user',
  password: 'video123',
  ssl: false
})

async function resetAdminPasswords() {
  try {
    console.log('🔧 Réinitialisation des mots de passe admin...')
    
    // Nouveaux mots de passe sécurisés
    const newPasswords = {
      'admin@video-ia.net': 'Admin123!',
      'admin2@video-ia.net': 'Admin456!'
    }
    
    for (const [email, password] of Object.entries(newPasswords)) {
      console.log(`\n🔑 Réinitialisation pour: ${email}`)
      
      // Hasher le nouveau mot de passe
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      
      // Mettre à jour la base de données
      const result = await pool.query(
        'UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id, name, role',
        [hashedPassword, email]
      )
      
      if (result.rows.length > 0) {
        const user = result.rows[0]
        console.log(`  ✅ Mot de passe mis à jour pour ${user.name} (${user.role})`)
        console.log(`  🔐 Nouveau mot de passe: ${password}`)
        
        // Vérifier que le nouveau mot de passe fonctionne
        const isValid = await bcrypt.compare(password, hashedPassword)
        console.log(`  🔍 Vérification: ${isValid ? '✅ OK' : '❌ ERREUR'}`)
      } else {
        console.log(`  ❌ Utilisateur ${email} non trouvé`)
      }
    }
    
    console.log('\n🎉 Réinitialisation terminée!')
    console.log('\n📋 Nouveaux identifiants de connexion:')
    console.log('  - admin@video-ia.net / Admin123!')
    console.log('  - admin2@video-ia.net / Admin456!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message)
  } finally {
    await pool.end()
  }
}

resetAdminPasswords()
