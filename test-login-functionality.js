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

async function testLoginFunctionality() {
  try {
    console.log('🧪 TEST COMPLET DE LA FONCTIONNALITÉ LOGIN')
    console.log('=' .repeat(50))
    
    // Test 1: Vérifier les utilisateurs actifs
    console.log('\n1️⃣ VÉRIFICATION DES UTILISATEURS ACTIFS')
    const activeUsers = await pool.query(
      'SELECT id, email, name, role, is_active FROM admin_users WHERE is_active = true ORDER BY id'
    )
    
    console.log(`✅ ${activeUsers.rows.length} utilisateur(s) actif(s) trouvé(s):`)
    activeUsers.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`)
    })
    
    // Test 2: Test du premier compte
    console.log('\n2️⃣ TEST COMPTE PRINCIPAL')
    const primaryUser = await pool.query(
      'SELECT email, password_hash FROM admin_users WHERE email = $1',
      ['admin@video-ia.net']
    )
    
    if (primaryUser.rows.length > 0) {
      const user = primaryUser.rows[0]
      const isValidPrimary = await bcrypt.compare('KVifO/+8KaJJBMEp', user.password_hash)
      console.log(`✅ admin@video-ia.net + KVifO/+8KaJJBMEp: ${isValidPrimary ? 'VALIDE ✓' : 'INVALIDE ✗'}`)
    }
    
    // Test 3: Test du compte simple
    console.log('\n3️⃣ TEST COMPTE ALTERNATIF')
    const simpleUser = await pool.query(
      'SELECT email, password_hash FROM admin_users WHERE email = $1',
      ['admin@videoianet.com']
    )
    
    if (simpleUser.rows.length > 0) {
      const user = simpleUser.rows[0]
      const isValidSimple = await bcrypt.compare('admin2025!', user.password_hash)
      console.log(`✅ admin@videoianet.com + admin2025!: ${isValidSimple ? 'VALIDE ✓' : 'INVALIDE ✗'}`)
    }
    
    // Test 4: Simulation complète du processus d'authentification
    console.log('\n4️⃣ SIMULATION PROCESSUS AUTHENTIFICATION')
    
    async function simulateAuth(email, password) {
      console.log(`\n🔍 Test: ${email} + ${password}`)
      
      // Étape 1: Recherche utilisateur
      const result = await pool.query(
        'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
        [email]
      )
      
      if (result.rows.length === 0) {
        console.log('   ❌ Utilisateur non trouvé ou inactif')
        return false
      }
      
      const user = result.rows[0]
      console.log(`   ✅ Utilisateur trouvé: ${user.name} (${user.role})`)
      
      // Étape 2: Vérification mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      console.log(`   ${isValidPassword ? '✅' : '❌'} Mot de passe: ${isValidPassword ? 'VALIDE' : 'INVALIDE'}`)
      
      if (isValidPassword) {
        // Étape 3: Mise à jour last_login
        await pool.query(
          'UPDATE admin_users SET last_login_at = NOW() WHERE id = $1',
          [user.id]
        )
        console.log('   ✅ Last login mis à jour')
        
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
      
      return false
    }
    
    // Test des deux comptes
    const test1 = await simulateAuth('admin@video-ia.net', 'KVifO/+8KaJJBMEp')
    const test2 = await simulateAuth('admin@videoianet.com', 'admin2025!')
    
    // Test 5: Vérification de l'ancien mot de passe (doit échouer)
    console.log('\n5️⃣ VÉRIFICATION SÉCURITÉ (ancien mot de passe)')
    const oldPasswordTest = await simulateAuth('admin@video-ia.net', 'admin123')
    
    console.log('\n' + '=' .repeat(50))
    console.log('📊 RÉSULTAT DES TESTS:')
    console.log(`✅ Compte principal: ${test1 ? 'FONCTIONNEL' : 'ÉCHEC'}`)
    console.log(`✅ Compte alternatif: ${test2 ? 'FONCTIONNEL' : 'ÉCHEC'}`)
    console.log(`🔒 Ancien mot de passe: ${!oldPasswordTest ? 'SÉCURISÉ (invalidé)' : 'RISQUE SÉCURITAIRE'}`)
    
    if (test1 && test2 && !oldPasswordTest) {
      console.log('\n🎉 TOUS LES TESTS PASSÉS - LOGIN FONCTIONNEL')
    } else {
      console.log('\n❌ PROBLÈME DÉTECTÉ DANS LES TESTS')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
  } finally {
    await pool.end()
  }
}

testLoginFunctionality()