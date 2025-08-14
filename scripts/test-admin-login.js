#!/usr/bin/env node

/**
 * Test Admin Login Script
 * Tests if admin credentials work correctly
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'video_ia_user',
  password: process.env.DB_PASSWORD || 'video123',
  ssl: false
});

async function testAdminLogin() {
  const testCredentials = [
    {
      email: 'admin@video-ia.net',
      password: 'VideoIA2024!',
      description: 'Compte Principal'
    },
    {
      email: 'admin2@video-ia.net',
      password: 'SecurePass2024!',
      description: 'Compte Secondaire'
    }
  ];
  
  try {
    console.log('🧪 Testing admin login credentials...\n');
    
    for (const cred of testCredentials) {
      console.log(`🔐 Testing: ${cred.description}`);
      console.log(`📧 Email: ${cred.email}`);
      
      // Check if user exists
      const userResult = await pool.query(
        'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
        [cred.email]
      );
      
      if (userResult.rows.length === 0) {
        console.log('❌ User not found or inactive\n');
        continue;
      }
      
      const user = userResult.rows[0];
      console.log(`✅ User found: ${user.name} (${user.role})`);
      
      // Test password
      const isValidPassword = await bcrypt.compare(cred.password, user.password_hash);
      
      if (isValidPassword) {
        console.log('🔑 Password: ✅ Valid');
        console.log(`📅 Last login: ${user.last_login_at || 'Never'}`);
        console.log(`📅 Created: ${user.created_at}`);
      } else {
        console.log('🔑 Password: ❌ Invalid');
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('✅ Login test completed!');
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  } finally {
    await pool.end();
  }
}

testAdminLogin();
