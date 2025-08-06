#!/bin/bash

# Script de setup automatique de la base de données Video-IA.net
# Utilise Supabase pour le PostgreSQL managed

set -e

echo "🚀 Setup de la base de données Video-IA.net"
echo "============================================"

# Vérifier que les variables d'environnement sont définies
if [ -z "$DB_HOST" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Variables d'environnement manquantes!"
    echo "Définissez DB_HOST, DB_PASSWORD, etc. dans votre .env"
    echo ""
    echo "Exemple pour Supabase:"
    echo "DB_HOST=db.xxxxx.supabase.co"
    echo "DB_NAME=postgres"
    echo "DB_USER=postgres"
    echo "DB_PASSWORD=your_password"
    exit 1
fi

echo "📊 Configuration détectée:"
echo "Host: $DB_HOST"
echo "Database: ${DB_NAME:-postgres}"
echo "User: ${DB_USER:-postgres}"
echo ""

# Test de connexion
echo "🔌 Test de connexion..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U ${DB_USER:-postgres} -d ${DB_NAME:-postgres} -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Connexion réussie!"
else
    echo "❌ Impossible de se connecter à la base de données"
    echo "Vérifiez vos paramètres de connexion"
    exit 1
fi

# Créer le schéma
echo "📋 Création du schéma..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U ${DB_USER:-postgres} -d ${DB_NAME:-postgres} -f src/lib/database/csv-schema.sql

echo "✅ Schéma créé avec succès"

# Ajouter les fonctions supplémentaires
echo "⚙️ Ajout des fonctions SQL..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U ${DB_USER:-postgres} -d ${DB_NAME:-postgres} -f src/lib/database/functions.sql

echo "✅ Fonctions SQL ajoutées"

# Vérifier que tout est en place
echo "🔍 Vérification de la structure..."
TABLES=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U ${DB_USER:-postgres} -d ${DB_NAME:-postgres} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('ai_tools', 'categories', 'tags', 'tool_tags');")

if [ "$TABLES" -eq 4 ]; then
    echo "✅ Toutes les tables sont créées"
else
    echo "⚠️ Certaines tables sont manquantes ($TABLES/4)"
fi

echo ""
echo "🎉 Base de données prête!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Exécuter la migration CSV:"
echo "   npm run migrate:csv"
echo ""
echo "2. Lancer l'application:"
echo "   npm run dev"
echo ""
echo "3. Visiter http://localhost:3000"
echo ""