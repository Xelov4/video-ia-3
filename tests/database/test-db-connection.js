#!/usr/bin/env node

/**
 * Script de test pour diagnostiquer le problème de connexion PostgreSQL
 */

const { Pool } = require('pg');

// Charger les variables d'environnement depuis le répertoire racine
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  }
}

// Charger .env.local depuis le répertoire racine
loadEnvFile(path.join(__dirname, '../../.env.local'));

console.log('🔍 Diagnostic de la connexion PostgreSQL');
console.log('=====================================');

// Afficher la configuration (sans le mot de passe)
console.log('Configuration détectée:');
console.log('- Host:', process.env.DB_HOST);
console.log('- Port:', process.env.DB_PORT);
console.log('- Database:', process.env.DB_NAME);
console.log('- User:', process.env.DB_USER);
console.log('- Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-3) : 'undefined');
console.log('');

// Configuration de test
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

console.log('Configuration complète:');
console.log(JSON.stringify(dbConfig, null, 2));
console.log('');

// Test 1: Connexion simple
async function testConnection() {
  console.log('🧪 Test 1: Connexion simple');
  
  try {
    const pool = new Pool(dbConfig);
    
    pool.on('error', (err) => {
      console.error('❌ Erreur pool:', err.message);
    });
    
    pool.on('connect', () => {
      console.log('✅ Nouvelle connexion établie');
    });
    
    const client = await pool.connect();
    console.log('✅ Connexion réussie !');
    
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('📊 Informations de connexion:');
    console.log('- Database:', result.rows[0].current_database);
    console.log('- User:', result.rows[0].current_user);
    console.log('- Version:', result.rows[0].version);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Test 2: Test avec mot de passe simple
async function testWithSimplePassword() {
  console.log('\n🧪 Test 2: Connexion avec mot de passe simple');
  
  try {
    const simpleConfig = { ...dbConfig, password: 'test123' };
    const pool = new Pool(simpleConfig);
    
    const client = await pool.connect();
    console.log('✅ Connexion avec mot de passe simple réussie');
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Erreur avec mot de passe simple:', error.message);
    return false;
  }
}

// Test 3: Test avec psql
async function testWithPsql() {
  console.log('\n🧪 Test 3: Test avec psql');
  
  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);
  
  try {
    const cmd = `PGPASSWORD="${process.env.DB_PASSWORD}" psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -c "SELECT 'OK' as status;"`;
    const { stdout, stderr } = await execAsync(cmd);
    
    if (stderr) {
      console.error('❌ Erreur psql:', stderr);
      return false;
    }
    
    console.log('✅ psql fonctionne:', stdout.trim());
    return true;
  } catch (error) {
    console.error('❌ Erreur psql:', error.message);
    return false;
  }
}

// Test 4: Vérifier les variables d'environnement
function checkEnvironment() {
  console.log('\n🧪 Test 4: Vérification des variables d\'environnement');
  
  const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  let allPresent = true;
  
  for (const var_name of required) {
    const value = process.env[var_name];
    if (!value) {
      console.error(`❌ Variable manquante: ${var_name}`);
      allPresent = false;
    } else {
      console.log(`✅ ${var_name}: ${var_name.includes('PASSWORD') ? '***' + value.slice(-3) : value}`);
    }
  }
  
  return allPresent;
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage des tests...\n');
  
  // Test 4 en premier
  const envOk = checkEnvironment();
  
  if (!envOk) {
    console.log('\n❌ Variables d\'environnement manquantes. Arrêt des tests.');
    return;
  }
  
  // Tests de connexion
  const test1 = await testConnection();
  const test2 = await testWithSimplePassword();
  const test3 = await testWithPsql();
  
  console.log('\n📊 Résumé des tests:');
  console.log('- Variables d\'environnement:', envOk ? '✅' : '❌');
  console.log('- Connexion simple:', test1 ? '✅' : '❌');
  console.log('- Mot de passe simple:', test2 ? '✅' : '❌');
  console.log('- Test psql:', test3 ? '✅' : '❌');
  
  if (test1) {
    console.log('\n🎉 La connexion fonctionne ! Le problème vient de l\'application Next.js.');
  } else {
    console.log('\n🔧 Le problème vient de la configuration PostgreSQL.');
  }
}

main().catch(console.error); 