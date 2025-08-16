#!/bin/bash

# Script de déploiement pour VideoIA.net
# À exécuter sur le serveur de production

echo "🚀 Déploiement de VideoIA.net en production"
echo "========================================"

# Variables
APP_DIR="/root/video-ia.net"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Vérifier si le répertoire existe
if [ ! -d "$APP_DIR" ]; then
  echo "❌ Le répertoire $APP_DIR n'existe pas"
  exit 1
fi

# Créer le répertoire de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

echo "📦 Mise à jour des dépendances..."
npm install

echo "🧪 Vérification des types..."
npm run type-check

echo "📋 Vérification du linter..."
npm run lint

echo "🔍 Vérification de la configuration..."
npx tsx scripts/check-setup.ts

echo "📊 Vérification des migrations Prisma..."
npx prisma validate

echo "👷 Construction de l'application..."
npm run build

echo "✅ Build terminé avec succès !"

echo "🚀 Démarrage de l'application en mode production..."
# Arrêter l'instance précédente si elle existe
pm2 stop video-ia 2>/dev/null || true

# Démarrer la nouvelle instance
pm2 start npm --name "video-ia" -- start
pm2 save

echo "📊 Status de l'application :"
pm2 status video-ia

echo ""
echo "✅ VideoIA.net a été déployé avec succès !"
echo "🌐 Votre application est accessible à l'adresse :"
echo "   http://localhost:3000"
echo ""
echo "👉 Pour suivre les logs :"
echo "   pm2 logs video-ia"
echo ""
