#!/usr/bin/env node

/**
 * Script de test complet pour toutes les API de video-ia.net
 * Usage: node test-api.js
 */

const BASE_URL = 'http://localhost:3000';

// Charger les variables d'environnement depuis le répertoire racine
const path = require('path');
const fs = require('fs');

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

// Couleurs pour l'affichage
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  log(`\n${colors.cyan}🧪 Test: ${name}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function testAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  const body = options.body;
  
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    if (body) {
      config.body = JSON.stringify(body);
    }
    
    logInfo(`${method} ${url}`);
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (response.ok) {
      logSuccess(`Status: ${response.status}`);
      logInfo(`Response: ${JSON.stringify(data, null, 2)}`);
      return { success: true, data, status: response.status };
    } else {
      logError(`Status: ${response.status}`);
      logError(`Error: ${JSON.stringify(data, null, 2)}`);
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    logError(`Erreur de connexion: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testCategoriesAPI() {
  logTest('API Catégories');
  
  // Test 1: Récupérer toutes les catégories
  logInfo('1. Récupération de toutes les catégories');
  await testAPI('/api/categories');
  
  // Test 2: Récupérer seulement les catégories en vedette
  logInfo('2. Récupération des catégories en vedette');
  await testAPI('/api/categories?featured=true');
}

async function testToolsAPI() {
  logTest('API Outils');
  
  // Test 1: Récupérer tous les outils (première page)
  logInfo('1. Récupération de tous les outils (page 1)');
  await testAPI('/api/tools');
  
  // Test 2: Récupérer les outils avec pagination
  logInfo('2. Récupération des outils (page 2, 10 par page)');
  await testAPI('/api/tools?page=2&per_page=10');
  
  // Test 3: Recherche d'outils par mot-clé
  logInfo('3. Recherche d\'outils par mot-clé "video"');
  await testAPI('/api/tools?q=video');
  
  // Test 4: Filtrer par catégorie
  logInfo('4. Filtrage par catégorie');
  await testAPI('/api/tools?category=video-editing');
  
  // Test 5: Récupérer seulement les outils en vedette
  logInfo('5. Récupération des outils en vedette');
  await testAPI('/api/tools?featured=true');
  
  // Test 6: Combinaison de filtres
  logInfo('6. Combinaison de filtres (recherche + catégorie)');
  await testAPI('/api/tools?q=ai&category=video-editing&featured=true');
}

async function testToolDetailAPI() {
  logTest('API Détail d\'outil');
  
  // Test 1: Récupérer un outil par slug (exemple)
  logInfo('1. Récupération d\'un outil par slug');
  await testAPI('/api/tools/example-tool-slug');
  
  // Test 2: Test avec un slug inexistant
  logInfo('2. Test avec un slug inexistant');
  await testAPI('/api/tools/non-existent-tool');
}

async function testScrapeAPI() {
  logTest('API Scraping');
  
  // Test 1: Analyser un site d'outil IA
  logInfo('1. Analyse d\'un site d\'outil IA');
  await testAPI('/api/scrape', {
    method: 'POST',
    body: {
      url: 'https://example-ai-tool.com'
    }
  });
  
  // Test 2: Test avec URL invalide
  logInfo('2. Test avec URL invalide');
  await testAPI('/api/scrape', {
    method: 'POST',
    body: {
      url: 'invalid-url'
    }
  });
  
  // Test 3: Test sans URL
  logInfo('3. Test sans URL');
  await testAPI('/api/scrape', {
    method: 'POST',
    body: {}
  });
}

async function testHealthCheck() {
  logTest('Vérification de santé du serveur');
  
  try {
    const response = await fetch(`${BASE_URL}`);
    if (response.ok) {
      logSuccess('Serveur accessible');
    } else {
      logError(`Serveur accessible mais status: ${response.status}`);
    }
  } catch (error) {
    logError(`Serveur non accessible: ${error.message}`);
  }
}

async function runAllTests() {
  log(`${colors.bright}${colors.magenta}🚀 Démarrage des tests API pour video-ia.net${colors.reset}`);
  log(`${colors.yellow}Base URL: ${BASE_URL}${colors.reset}\n`);
  
  // Vérifier que le serveur est accessible
  await testHealthCheck();
  
  // Tests des différentes API
  await testCategoriesAPI();
  await testToolsAPI();
  await testToolDetailAPI();
  await testScrapeAPI();
  
  log(`\n${colors.bright}${colors.green}✨ Tests terminés !${colors.reset}`);
}

// Fonction principale
async function main() {
  try {
    await runAllTests();
  } catch (error) {
    logError(`Erreur lors de l'exécution des tests: ${error.message}`);
    process.exit(1);
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  testAPI,
  testCategoriesAPI,
  testToolsAPI,
  testToolDetailAPI,
  testScrapeAPI,
  testHealthCheck
}; 