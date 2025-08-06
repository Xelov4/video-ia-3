#!/bin/bash

# Script d'installation PostgreSQL sur VPS Ubuntu pour Video-IA.net
# Compatible Ubuntu 20.04, 22.04, 24.04

set -e

echo "🚀 Installation PostgreSQL sur VPS Ubuntu"
echo "==========================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si on est root ou avec sudo
if [[ $EUID -eq 0 ]]; then
   SUDO=""
else
   SUDO="sudo"
fi

echo -e "${BLUE}📋 Informations système${NC}"
echo "OS: $(lsb_release -d | cut -f2)"
echo "User: $(whoami)"
echo ""

# 1. Mise à jour du système
echo -e "${BLUE}📦 Mise à jour du système...${NC}"
$SUDO apt update && $SUDO apt upgrade -y

# 2. Installation PostgreSQL
echo -e "${BLUE}🐘 Installation PostgreSQL...${NC}"
$SUDO apt install -y postgresql postgresql-contrib postgresql-client

# 3. Démarrer et activer PostgreSQL
echo -e "${BLUE}🔧 Configuration du service...${NC}"
$SUDO systemctl start postgresql
$SUDO systemctl enable postgresql

# Vérifier le statut
if $SUDO systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL démarré avec succès${NC}"
else
    echo -e "${RED}❌ Erreur: PostgreSQL ne démarre pas${NC}"
    exit 1
fi

# 4. Configuration de la base de données
echo -e "${BLUE}🔐 Configuration de la base de données...${NC}"

# Générer un mot de passe aléatoire sécurisé
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_NAME="video_ia_net"
DB_USER="video_ia_user"

echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""

# Créer l'utilisateur et la base de données
$SUDO -u postgres psql << EOF
-- Créer l'utilisateur
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Créer la base de données
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Accorder tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Se connecter à la DB et donner les permissions sur le schéma
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Afficher les infos
\l
\q
EOF

echo -e "${GREEN}✅ Base de données créée avec succès${NC}"

# 5. Configuration de l'accès réseau (si nécessaire)
echo -e "${BLUE}🌐 Configuration de l'accès réseau...${NC}"

# Backup des fichiers de config
$SUDO cp /etc/postgresql/*/main/postgresql.conf /etc/postgresql/*/main/postgresql.conf.backup
$SUDO cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Permettre les connexions externes (optionnel)
POSTGRES_VERSION=$($SUDO -u postgres psql -t -c "SELECT version();" | grep -oE '[0-9]+\.[0-9]+' | head -1)
POSTGRES_MAJOR=$(echo $POSTGRES_VERSION | cut -d. -f1)

if [ -z "$POSTGRES_MAJOR" ]; then
    POSTGRES_MAJOR="14" # Fallback
fi

CONFIG_DIR="/etc/postgresql/$POSTGRES_MAJOR/main"

echo "Configuration PostgreSQL $POSTGRES_VERSION dans $CONFIG_DIR"

# Activer les connexions locales et réseau
$SUDO sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" $CONFIG_DIR/postgresql.conf
$SUDO sed -i "s/#port = 5432/port = 5432/" $CONFIG_DIR/postgresql.conf

# Permettre les connexions MD5 pour notre utilisateur
echo "host    $DB_NAME    $DB_USER    127.0.0.1/32    md5" | $SUDO tee -a $CONFIG_DIR/pg_hba.conf
echo "host    $DB_NAME    $DB_USER    ::1/128         md5" | $SUDO tee -a $CONFIG_DIR/pg_hba.conf

# Si on veut permettre les connexions externes (décommenter si nécessaire)
# echo "host    $DB_NAME    $DB_USER    0.0.0.0/0       md5" | $SUDO tee -a $CONFIG_DIR/pg_hba.conf

# 6. Restart PostgreSQL pour appliquer les changements
echo -e "${BLUE}🔄 Redémarrage PostgreSQL...${NC}"
$SUDO systemctl restart postgresql

# Vérifier que tout fonctionne
sleep 2
if $SUDO systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL redémarré avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors du redémarrage${NC}"
    exit 1
fi

# 7. Test de connexion
echo -e "${BLUE}🧪 Test de connexion...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connexion test réussie${NC}"
else
    echo -e "${RED}❌ Erreur de connexion${NC}"
    exit 1
fi

# 8. Installation des outils supplémentaires
echo -e "${BLUE}🛠️ Installation des outils supplémentaires...${NC}"
$SUDO apt install -y curl wget git nodejs npm

# 9. Optimisation PostgreSQL pour notre usage
echo -e "${BLUE}⚡ Optimisation PostgreSQL...${NC}"

# Calculer les paramètres selon la RAM disponible
TOTAL_RAM=$(free -m | awk 'NR==2{print $2}')
SHARED_BUFFERS=$((TOTAL_RAM / 4))  # 25% de la RAM
EFFECTIVE_CACHE_SIZE=$((TOTAL_RAM * 3 / 4))  # 75% de la RAM

# Limiter les valeurs pour éviter les erreurs
if [ $SHARED_BUFFERS -gt 2048 ]; then
    SHARED_BUFFERS=2048
fi

if [ $SHARED_BUFFERS -lt 128 ]; then
    SHARED_BUFFERS=128
fi

echo "RAM totale: ${TOTAL_RAM}MB"
echo "shared_buffers: ${SHARED_BUFFERS}MB"
echo "effective_cache_size: ${EFFECTIVE_CACHE_SIZE}MB"

# Appliquer les optimisations
$SUDO tee -a $CONFIG_DIR/postgresql.conf << EOF

# Optimisations Video-IA.net
shared_buffers = ${SHARED_BUFFERS}MB
effective_cache_size = ${EFFECTIVE_CACHE_SIZE}MB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_parallel_maintenance_workers = 4
EOF

# 10. Redémarrage final
echo -e "${BLUE}🔄 Redémarrage final...${NC}"
$SUDO systemctl restart postgresql

sleep 3

# 11. Créer le fichier .env pour l'application
echo -e "${BLUE}📝 Création du fichier de configuration...${NC}"
cat > /tmp/video-ia-db.env << EOF
# Configuration Base de Données VPS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Pour l'application Next.js
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
NODE_ENV=development
EOF

# 12. Affichage du résumé
echo ""
echo -e "${GREEN}🎉 Installation terminée avec succès !${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}📋 Informations de connexion :${NC}"
echo "Host: localhost"
echo "Port: 5432"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""
echo -e "${YELLOW}🔗 URL de connexion :${NC}"
echo "postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo -e "${BLUE}📝 Fichier de config créé : /tmp/video-ia-db.env${NC}"
echo "Copiez ces variables dans votre .env.local"
echo ""
echo -e "${YELLOW}📊 Statut PostgreSQL :${NC}"
$SUDO systemctl status postgresql --no-pager -l
echo ""
echo -e "${YELLOW}🧪 Test rapide :${NC}"
echo "PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c 'SELECT version();'"
echo ""
echo -e "${GREEN}✅ Prêt pour la migration des 16,827 outils !${NC}"

# 13. Afficher les prochaines étapes
echo ""
echo -e "${BLUE}📋 Prochaines étapes :${NC}"
echo "1. Copier les variables DB dans votre .env.local"
echo "2. cd /path/to/video-ia.net"
echo "3. npm install"
echo "4. npm run db:setup"
echo "5. npm run migrate:csv"
echo ""