#!/usr/bin/env node

/**
 * Create Admin User Script
 * Usage: node scripts/create-admin-user.js [email] [password] [name] [role]
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

async function createAdminUser() {
  const email = process.argv[2] || 'admin2@video-ia.net';
  const password = process.argv[3] || 'Admin2024!';
  const name = process.argv[4] || 'Administrator 2';
  const role = process.argv[5] || 'admin';
  
  try {
    console.log('🔐 Creating new admin user...');
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('❌ User with this email already exists');
      return;
    }
    
    // Create the new admin user
    const result = await pool.query(
      'INSERT INTO admin_users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id',
      [email, hashedPassword, name, role]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin user created successfully!');
      console.log('🆔 ID:', result.rows[0].id);
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👤 Name:', name);
      console.log('🎭 Role:', role);
    } else {
      console.log('❌ Failed to create admin user');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await pool.end();
  }
}

createAdminUser();
