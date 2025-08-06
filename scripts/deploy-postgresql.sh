#!/bin/bash

# Script de déploiement complet PostgreSQL pour Video-IA.net
# Orchestre toutes les étapes : installation → configuration → migration

set -e

echo "🚀 Déploiement complet PostgreSQL pour Video-IA.net"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction pour afficher les étapes
step() {
    echo -e "${BLUE}📋 Étape $1: $2${NC}"
    echo "----------------------------------------"
}

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Vérifier les prérequis
step "1" "Vérification des prérequis"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Installez Node.js: https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js et npm détectés${NC}"

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Vous devez être dans le répertoire du projet${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Répertoire du projet détecté${NC}"

# Installer les dépendances si nécessaire
step "2" "Installation des dépendances"

if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances npm..."
    npm install
    echo -e "${GREEN}✅ Dépendances installées${NC}"
else
    echo -e "${GREEN}✅ Dépendances déjà installées${NC}"
fi

# Rendre les scripts exécutables
step "3" "Configuration des scripts"

chmod +x scripts/setup-vps-database.sh
chmod +x scripts/setup-env.sh
chmod +x scripts/deploy-postgresql.sh

echo -e "${GREEN}✅ Scripts rendus exécutables${NC}"

# Demander si PostgreSQL est déjà installé
echo ""
echo -e "${YELLOW}🤔 PostgreSQL est-il déjà installé sur votre VPS ?${NC}"
read -p "Répondez 'y' si oui, 'n' si non: " postgres_installed

if [ "$postgres_installed" != "y" ]; then
    step "4" "Installation de PostgreSQL"
    echo "Exécution du script d'installation PostgreSQL..."
    ./scripts/setup-vps-database.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PostgreSQL installé avec succès${NC}"
    else
        echo -e "${RED}❌ Erreur lors de l'installation de PostgreSQL${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ PostgreSQL déjà installé${NC}"
fi

# Configuration des variables d'environnement
step "5" "Configuration des variables d'environnement"

echo "Configuration des variables d'environnement..."
./scripts/setup-env.sh

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Variables d'environnement configurées${NC}"
else
    echo -e "${RED}❌ Erreur lors de la configuration${NC}"
    exit 1
fi

# Charger les variables d'environnement
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Création des tables
step "6" "Création des tables PostgreSQL"

echo "Création des tables dans PostgreSQL..."

# Vérifier si psql est disponible
if command_exists psql; then
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f scripts/create-tables.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Tables créées avec succès${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la création des tables${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  psql non disponible, création des tables manuelle requise${NC}"
    echo "Exécutez manuellement:"
    echo "PGPASSWORD='$DB_PASSWORD' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/create-tables.sql"
fi

# Migration des données CSV
step "7" "Migration des données CSV"

echo "Vérification du fichier CSV..."

# Chercher le fichier CSV
CSV_FILE=""
for file in data/*.csv; do
    if [ -f "$file" ]; then
        CSV_FILE="$file"
        break
    fi
done

if [ -z "$CSV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Aucun fichier CSV trouvé dans le dossier data/${NC}"
    echo "Placez votre fichier CSV dans le dossier data/ et relancez le script"
    exit 1
fi

echo "Fichier CSV trouvé: $CSV_FILE"

# Exécuter la migration
echo "Démarrage de la migration des données..."
npx tsx scripts/migrate-csv-to-db.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration des données terminée${NC}"
else
    echo -e "${RED}❌ Erreur lors de la migration${NC}"
    exit 1
fi

# Test de l'application
step "8" "Test de l'application"

echo "Test de la connexion à la base de données..."

# Créer un script de test rapide
cat > test-db.js << 'EOF'
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
});

async function testDB() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT COUNT(*) as tool_count FROM ai_tools');
    client.release();
    console.log(`✅ Base de données OK: ${result.rows[0].tool_count} outils importés`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    process.exit(1);
  }
}

testDB();
EOF

node test-db.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Test de la base de données réussi${NC}"
    rm test-db.js
else
    echo -e "${RED}❌ Test de la base de données échoué${NC}"
    rm test-db.js
    exit 1
fi

# Résumé final
step "9" "Résumé du déploiement"

echo -e "${GREEN}🎉 Déploiement PostgreSQL terminé avec succès !${NC}"
echo ""
echo "📋 Résumé:"
echo "✅ PostgreSQL installé et configuré"
echo "✅ Variables d'environnement configurées"
echo "✅ Tables créées dans la base de données"
echo "✅ Données CSV migrées"
echo "✅ Tests de connexion réussis"
echo ""
echo "🚀 Prochaines étapes:"
echo "1. Démarrer l'application: npm run dev"
echo "2. Tester les API endpoints"
echo "3. Vérifier l'interface utilisateur"
echo ""
echo "📊 Statistiques de la base de données:"
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""
echo "🔗 Commandes utiles:"
echo "- Connexion directe: PGPASSWORD='$DB_PASSWORD' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
echo "- Redémarrer PostgreSQL: sudo systemctl restart postgresql"
echo "- Voir les logs: sudo journalctl -u postgresql"
echo "" 