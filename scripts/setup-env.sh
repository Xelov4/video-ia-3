#!/bin/bash

# Script de configuration des variables d'environnement pour PostgreSQL
# À exécuter après l'installation de PostgreSQL

set -e

echo "🔧 Configuration des variables d'environnement PostgreSQL"
echo "========================================================"

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier si .env.local existe
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env.local non trouvé, création...${NC}"
    touch .env.local
fi

# Demander les informations de connexion
echo -e "${BLUE}📋 Configuration de la base de données PostgreSQL${NC}"
echo ""

read -p "Host PostgreSQL (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Port PostgreSQL (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Nom de la base de données (default: video_ia_net): " DB_NAME
DB_NAME=${DB_NAME:-video_ia_net}

read -p "Utilisateur PostgreSQL (default: video_ia_user): " DB_USER
DB_USER=${DB_USER:-video_ia_user}

read -s -p "Mot de passe PostgreSQL: " DB_PASSWORD
echo ""

# Backup du fichier .env.local existant
cp .env.local .env.local.backup

# Supprimer les anciennes variables PostgreSQL si elles existent
sed -i '/^DB_HOST=/d' .env.local
sed -i '/^DB_PORT=/d' .env.local
sed -i '/^DB_NAME=/d' .env.local
sed -i '/^DB_USER=/d' .env.local
sed -i '/^DB_PASSWORD=/d' .env.local

# Ajouter les nouvelles variables PostgreSQL
echo "" >> .env.local
echo "# PostgreSQL Configuration" >> .env.local
echo "DB_HOST=$DB_HOST" >> .env.local
echo "DB_PORT=$DB_PORT" >> .env.local
echo "DB_NAME=$DB_NAME" >> .env.local
echo "DB_USER=$DB_USER" >> .env.local
echo "DB_PASSWORD=$DB_PASSWORD" >> .env.local

# Ajouter les variables Next.js si elles n'existent pas
if ! grep -q "NEXT_PUBLIC_APP_URL" .env.local; then
    echo "" >> .env.local
    echo "# Next.js Configuration" >> .env.local
    echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> .env.local
    echo "NODE_ENV=development" >> .env.local
fi

echo -e "${GREEN}✅ Variables d'environnement configurées${NC}"
echo ""
echo -e "${BLUE}📋 Configuration actuelle:${NC}"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Tester la connexion
echo -e "${BLUE}🔍 Test de connexion à PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" &> /dev/null; then
        echo -e "${GREEN}✅ Connexion PostgreSQL réussie${NC}"
    else
        echo -e "${YELLOW}⚠️  Impossible de tester la connexion (psql non disponible ou erreur)${NC}"
        echo "Vous pouvez tester manuellement avec:"
        echo "PGPASSWORD='$DB_PASSWORD' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    fi
else
    echo -e "${YELLOW}⚠️  psql non installé, impossible de tester la connexion${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Configuration terminée !${NC}"
echo ""
echo "Prochaines étapes:"
echo "1. Exécuter: ./scripts/setup-vps-database.sh (si pas encore fait)"
echo "2. Exécuter: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/create-tables.sql"
echo "3. Exécuter: npm run migrate-csv"
echo "" 