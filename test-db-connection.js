const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuration de la base de données
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'video_ia_net',
  user: 'video_ia_user',
  password: 'video123',
  ssl: false,
});

async function testDatabaseConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...');

    // Test de connexion simple
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données réussie:', result.rows[0]);

    // Vérifier la table admin_users
    const adminUsers = await pool.query(
      'SELECT id, email, name, role, is_active FROM admin_users'
    );
    console.log('📊 Utilisateurs admin trouvés:', adminUsers.rows.length);

    adminUsers.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Actif: ${user.is_active}`);
    });

    // Test des deux comptes avec les nouveaux mots de passe
    const testAccounts = [
      { email: 'admin@video-ia.net', password: 'Admin123!' },
      { email: 'admin2@video-ia.net', password: 'Admin456!' },
    ];

    for (const account of testAccounts) {
      console.log(`\n🔑 Test du compte: ${account.email}`);

      const testUser = await pool.query(
        'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
        [account.email]
      );

      if (testUser.rows.length > 0) {
        const user = testUser.rows[0];
        console.log('  - ID:', user.id);
        console.log('  - Nom:', user.name);
        console.log('  - Rôle:', user.role);
        console.log(
          '  - Hash du mot de passe:',
          user.password_hash.substring(0, 20) + '...'
        );

        // Test du mot de passe
        const isValid = await bcrypt.compare(account.password, user.password_hash);
        console.log(
          '  - Test du mot de passe:',
          account.password,
          '->',
          isValid ? '✅ Valide' : '❌ Invalide'
        );

        if (!isValid) {
          console.log('  ⚠️  Le mot de passe ne correspond pas au hash stocké');
        }
      } else {
        console.log('  ❌ Utilisateur non trouvé ou inactif');
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
