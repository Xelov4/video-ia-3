#!/usr/bin/env node

/**
 * Reset Admin Password Script
 * Usage: node scripts/reset-admin-password.js [password]
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

async function resetAdminPassword() {
  const password = process.argv[2] || 'admin123';
  
  try {
    console.log('🔐 Resetting admin password...');
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update the admin user
    const result = await pool.query(
      'UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
      [hashedPassword, 'admin@video-ia.net']
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('📧 Email: admin@video-ia.net');
      console.log('🔑 Password:', password);
    } else {
      console.log('❌ Admin user not found');
    }
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();