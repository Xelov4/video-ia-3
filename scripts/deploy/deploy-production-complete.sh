#!/bin/bash

# 🚀 Déploiement Production Complet - video-ia.net
# Script pour déployer complètement le site sur le VPS avec Nginx + SSL
# Usage: ./scripts/deploy/deploy-production-complete.sh

set -e

# Configuration
VPS_HOST="46.202.129.104"
VPS_USER="root"
VPS_PASSWORD="Buzzerbeater23"
DOMAIN="www.video-ia.net"
SECONDARY_DOMAIN="video-ia.net"
APP_PATH="/var/www/video-ia.net"
REPO_URL="https://github.com/Xelov4/video-ia-3.git"
DB_NAME="video_ia_net"
DB_USER="video_ia_user"
DB_PASSWORD="Buzzerbeater23"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Functions
log() { echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }
section() { echo -e "${PURPLE}"; echo "════════════════════════════════════════"; echo "🎯 $1"; echo "════════════════════════════════════════"; echo -e "${NC}"; }

# Vérifier la connectivité VPS
check_vps_connection() {
  section "VÉRIFICATION CONNECTIVITÉ VPS"
  
  log "Test de connexion SSH vers $VPS_HOST..."
  if sshpass -p "$VPS_PASSWORD" ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "echo 'SSH Connection OK'" > /dev/null 2>&1; then
    success "Connexion SSH établie avec succès"
  else
    error "Impossible de se connecter au VPS $VPS_HOST. Vérifiez les credentials."
  fi
  
  log "Vérification de l'OS du VPS..."
  VPS_OS=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "lsb_release -d" 2>/dev/null || echo "Ubuntu")
  log "OS détecté: $VPS_OS"
}

# Fonction pour exécuter des commandes sur le VPS
execute_on_vps() {
  local command="$1"
  local description="$2"
  
  if [ -n "$description" ]; then
    log "$description"
  fi
  
  sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "$command"
}

# Étape 1: Setup système complet
setup_vps_system() {
  section "SETUP SYSTÈME VPS COMPLET"
  
  log "Mise à jour du système..."
  execute_on_vps "apt update && apt upgrade -y" "Mise à jour des packages"
  
  log "Installation des dépendances système..."
  execute_on_vps "apt install -y curl wget git unzip software-properties-common build-essential" "Installation outils de base"
  
  success "Système de base configuré"
}

# Étape 2: Installation Node.js
install_nodejs() {
  section "INSTALLATION NODE.JS 18"
  
  log "Vérification si Node.js est déjà installé..."
  NODE_INSTALLED=$(execute_on_vps "command -v node || echo 'NOT_INSTALLED'")
  
  if [[ "$NODE_INSTALLED" == *"NOT_INSTALLED"* ]]; then
    log "Installation de Node.js 18..."
    execute_on_vps "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -" "Ajout du repository Node.js"
    execute_on_vps "apt-get install -y nodejs" "Installation Node.js"
  fi
  
  NODE_VERSION=$(execute_on_vps "node --version")
  NPM_VERSION=$(execute_on_vps "npm --version")
  success "Node.js installé: $NODE_VERSION, npm: $NPM_VERSION"
}

# Étape 3: Installation PostgreSQL
install_postgresql() {
  section "INSTALLATION POSTGRESQL"
  
  log "Installation de PostgreSQL..."
  execute_on_vps "apt install -y postgresql postgresql-contrib postgresql-client" "Installation PostgreSQL"
  
  log "Démarrage et activation de PostgreSQL..."
  execute_on_vps "systemctl start postgresql && systemctl enable postgresql" "Démarrage service"
  
  log "Configuration de la base de données..."
  execute_on_vps "sudo -u postgres psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\" || echo 'User already exists'"
  execute_on_vps "sudo -u postgres psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\" || echo 'Database already exists'"
  execute_on_vps "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\""
  execute_on_vps "sudo -u postgres psql -d $DB_NAME -c \"GRANT ALL ON SCHEMA public TO $DB_USER;\""
  execute_on_vps "sudo -u postgres psql -d $DB_NAME -c \"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;\""
  execute_on_vps "sudo -u postgres psql -d $DB_NAME -c \"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;\""
  
  success "PostgreSQL configuré avec la base $DB_NAME"
}

# Étape 4: Installation PM2
install_pm2() {
  section "INSTALLATION PM2"
  
  log "Installation de PM2 globalement..."
  execute_on_vps "npm install -g pm2" "Installation PM2"
  
  log "Configuration PM2 startup..."
  execute_on_vps "pm2 startup systemd -u root --hp /root" "Configuration démarrage automatique"
  
  success "PM2 installé et configuré"
}

# Étape 5: Installation Nginx
install_nginx() {
  section "INSTALLATION NGINX"
  
  log "Installation de Nginx..."
  execute_on_vps "apt install -y nginx" "Installation Nginx"
  
  log "Démarrage et activation de Nginx..."
  execute_on_vps "systemctl start nginx && systemctl enable nginx" "Activation service"
  
  success "Nginx installé et démarré"
}

# Étape 6: Clone et configuration de l'application
setup_application() {
  section "CONFIGURATION APPLICATION"
  
  log "Création du répertoire d'application..."
  execute_on_vps "mkdir -p $APP_PATH" "Création répertoire"
  
  log "Clone du repository..."
  execute_on_vps "cd $(dirname $APP_PATH) && rm -rf $(basename $APP_PATH) && git clone $REPO_URL $(basename $APP_PATH)" "Clone repository"
  
  log "Installation des dépendances..."
  execute_on_vps "cd $APP_PATH && npm ci --production" "Installation packages NPM"
  
  log "Configuration de l'environnement production..."
  execute_on_vps "cd $APP_PATH && cat > .env.production << 'EOF'
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXT_TELEMETRY_DISABLED=1
SECURE_COOKIES=true
LOG_LEVEL=info
ENABLE_ANALYTICS=true
EOF" "Configuration variables d'environnement"
  
  success "Application clonée et configurée"
}

# Étape 7: Build de l'application
build_application() {
  section "BUILD APPLICATION"
  
  log "Build de l'application Next.js..."
  execute_on_vps "cd $APP_PATH && npm run build" "Build production"
  
  log "Vérification du build..."
  execute_on_vps "cd $APP_PATH && ls -la .next/" "Vérification fichiers build"
  
  success "Application buildée avec succès"
}

# Étape 8: Migration de la base de données
migrate_database() {
  section "MIGRATION BASE DE DONNÉES"
  
  log "Test de connexion à la base de données..."
  execute_on_vps "PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c 'SELECT version();'" "Test connexion DB"
  
  log "Synchronisation de la base de données depuis DEV..."
  if [[ -f "scripts/deploy/sync-to-prod.js" ]]; then
    log "Exécution de la synchronisation des données..."
    # Exécuter la sync depuis la machine locale
    PROD_DB_HOST=$VPS_HOST PROD_DB_PASSWORD=$DB_PASSWORD node scripts/deploy/sync-to-prod.js --mode=full
  else
    warning "Script de synchronisation non trouvé, base de données sera vide"
  fi
  
  success "Base de données migrée"
}

# Étape 9: Configuration Nginx avec proxy
configure_nginx() {
  section "CONFIGURATION NGINX"
  
  log "Configuration du site Nginx..."
  execute_on_vps "cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    server_name $DOMAIN $SECONDARY_DOMAIN;
    
    # Redirect HTTP to HTTPS (will be configured after SSL)
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN $SECONDARY_DOMAIN;
    
    # SSL will be configured by Certbot
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection \"1; mode=block\";
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Main location
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # Static assets caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control \"public, max-age=31536000, immutable\";
    }
    
    # Images caching
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control \"public, max-age=86400\";
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/api/tools?limit=1;
    }
    
    # Favicon
    location /favicon.ico {
        proxy_pass http://localhost:3000;
        add_header Cache-Control \"public, max-age=86400\";
    }
}
EOF" "Création configuration Nginx"
  
  log "Activation du site..."
  execute_on_vps "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/" "Activation site"
  execute_on_vps "rm -f /etc/nginx/sites-enabled/default" "Suppression site par défaut"
  
  log "Test de la configuration Nginx..."
  execute_on_vps "nginx -t" "Validation configuration"
  
  success "Configuration Nginx créée"
}

# Étape 10: Installation SSL avec Certbot
install_ssl() {
  section "INSTALLATION SSL (CERTBOT)"
  
  log "Installation de Certbot..."
  execute_on_vps "apt install -y certbot python3-certbot-nginx" "Installation Certbot"
  
  log "Configuration temporaire pour validation domaine..."
  execute_on_vps "cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    server_name $DOMAIN $SECONDARY_DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF" "Configuration temporaire Nginx"
  
  execute_on_vps "systemctl reload nginx" "Rechargement Nginx"
  
  warning "IMPORTANT: Assurez-vous que le DNS pointe vers $VPS_HOST avant de continuer"
  echo "Appuyez sur Entrée quand le DNS est configuré..."
  read -r
  
  log "Génération du certificat SSL..."
  execute_on_vps "certbot --nginx -d $DOMAIN -d $SECONDARY_DOMAIN --non-interactive --agree-tos --email admin@video-ia.net" "Configuration SSL automatique"
  
  success "SSL configuré avec Let's Encrypt"
}

# Étape 11: Démarrage de l'application
start_application() {
  section "DÉMARRAGE APPLICATION"
  
  log "Arrêt de l'application existante..."
  execute_on_vps "pm2 stop video-ia-net || echo 'App was not running'" "Arrêt PM2"
  
  log "Démarrage de l'application avec PM2..."
  execute_on_vps "cd $APP_PATH && pm2 start ecosystem.config.js --env production" "Démarrage PM2"
  execute_on_vps "pm2 save" "Sauvegarde configuration PM2"
  
  log "Vérification du statut de l'application..."
  execute_on_vps "pm2 status" "Status PM2"
  
  success "Application démarrée avec PM2"
}

# Étape 12: Configuration du firewall
configure_firewall() {
  section "CONFIGURATION FIREWALL"
  
  log "Configuration UFW..."
  execute_on_vps "ufw --force enable" "Activation UFW"
  execute_on_vps "ufw default deny incoming" "Deny incoming par défaut"
  execute_on_vps "ufw default allow outgoing" "Allow outgoing par défaut"
  execute_on_vps "ufw allow ssh" "Autoriser SSH"
  execute_on_vps "ufw allow 80/tcp" "Autoriser HTTP"
  execute_on_vps "ufw allow 443/tcp" "Autoriser HTTPS"
  
  log "Statut du firewall:"
  execute_on_vps "ufw status" "Status firewall"
  
  success "Firewall configuré"
}

# Étape 13: Tests finaux
run_final_tests() {
  section "TESTS FINAUX"
  
  log "Test de l'application en local sur le VPS..."
  execute_on_vps "curl -f http://localhost:3000/api/tools?limit=1" "Test endpoint local"
  
  log "Attente du démarrage complet (30 secondes)..."
  sleep 30
  
  log "Test HTTPS externe..."
  if curl -f -s "https://$DOMAIN/api/tools?limit=1" > /dev/null; then
    success "Site accessible via HTTPS"
  else
    warning "Site pas encore accessible via HTTPS (propagation DNS en cours)"
  fi
  
  log "Vérification des services..."
  execute_on_vps "systemctl is-active nginx" "Status Nginx"
  execute_on_vps "systemctl is-active postgresql" "Status PostgreSQL"
  execute_on_vps "pm2 list | grep video-ia-net" "Status PM2"
  
  success "Tests finaux terminés"
}

# Fonction principale
main() {
  echo -e "${CYAN}"
  echo "════════════════════════════════════════"
  echo "🚀 DÉPLOIEMENT PRODUCTION COMPLET"
  echo "🌐 video-ia.net"
  echo "🖥️  VPS: $VPS_HOST"
  echo "════════════════════════════════════════"
  echo -e "${NC}"
  
  # Étapes de déploiement
  check_vps_connection
  setup_vps_system
  install_nodejs
  install_postgresql
  install_pm2
  install_nginx
  setup_application
  build_application
  migrate_database
  configure_nginx
  install_ssl
  start_application
  configure_firewall
  run_final_tests
  
  # Résumé final
  echo -e "${GREEN}"
  echo "════════════════════════════════════════"
  echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
  echo "════════════════════════════════════════"
  echo -e "${NC}"
  echo ""
  echo "📊 Résumé du déploiement:"
  echo "  🌐 Site: https://$DOMAIN"
  echo "  🌐 Alias: https://$SECONDARY_DOMAIN"
  echo "  🖥️  VPS: $VPS_HOST"
  echo "  🗄️  DB: PostgreSQL ($DB_NAME)"
  echo "  🔒 SSL: Let's Encrypt"
  echo "  ⚙️  Process: PM2"
  echo "  🌍 Proxy: Nginx"
  echo ""
  echo "🔧 Commandes utiles:"
  echo "  • Logs: ssh root@$VPS_HOST 'pm2 logs video-ia-net'"
  echo "  • Status: ssh root@$VPS_HOST 'pm2 status'"
  echo "  • Restart: ssh root@$VPS_HOST 'pm2 restart video-ia-net'"
  echo "  • Nginx: ssh root@$VPS_HOST 'systemctl status nginx'"
  echo ""
  echo "🎯 Votre site est maintenant en ligne à:"
  echo "    👉 https://$DOMAIN"
  echo ""
}

# Gestion des erreurs
trap 'error "Déploiement interrompu à l étape: $BASH_COMMAND"' ERR

# Exécution
main "$@"