#!/bin/bash

# 🚀 Setup VPS Complet pour video-ia.net
# Installation et configuration complète du VPS de production
# Usage: ./scripts/deploy/setup-vps-complete.sh

set -e

echo "🚀 Setup VPS Complet pour video-ia.net"
echo "======================================"

# Variables de configuration
VPS_IP="46.202.129.104"
DOMAIN="www.video-ia.net"
APP_DIR="/var/www/video-ia.net"
DB_NAME="video_ia_net"
DB_USER="video_ia_user"
DB_PASS="Buzzerbeater23"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Vérification des privilèges
check_privileges() {
    log "Vérification des privilèges..."
    if [[ $EUID -ne 0 ]]; then
        SUDO="sudo"
        log "Utilisation de sudo pour les privilèges élevés"
    else
        SUDO=""
        log "Exécution en tant que root"
    fi
}

# 1. Mise à jour du système
update_system() {
    log "Mise à jour du système Ubuntu..."
    $SUDO apt update && $SUDO apt upgrade -y
    $SUDO apt install -y curl wget git unzip software-properties-common
    success "Système mis à jour"
}

# 2. Installation Node.js
install_nodejs() {
    log "Installation de Node.js 18..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log "Node.js déjà installé: $NODE_VERSION"
        return
    fi
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | $SUDO -E bash -
    $SUDO apt-get install -y nodejs
    
    # Vérification
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    success "Node.js $NODE_VERSION installé"
    success "npm $NPM_VERSION installé"
}

# 3. Installation PostgreSQL
install_postgresql() {
    log "Installation de PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        log "PostgreSQL déjà installé"
        return
    fi
    
    $SUDO apt install -y postgresql postgresql-contrib postgresql-client
    $SUDO systemctl start postgresql
    $SUDO systemctl enable postgresql
    
    # Configuration base de données
    log "Configuration de la base de données..."
    $SUDO -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
\q
EOF
    
    success "PostgreSQL configuré avec la base $DB_NAME"
}

# 4. Installation PM2
install_pm2() {
    log "Installation de PM2..."
    
    if command -v pm2 &> /dev/null; then
        log "PM2 déjà installé"
        return
    fi
    
    $SUDO npm install -g pm2
    
    # Configuration de PM2 pour démarrer au boot
    $SUDO pm2 startup systemd -u $USER --hp $HOME
    
    success "PM2 installé et configuré"
}

# 5. Installation Nginx
install_nginx() {
    log "Installation de Nginx..."
    
    if command -v nginx &> /dev/null; then
        log "Nginx déjà installé"
        return
    fi
    
    $SUDO apt install -y nginx
    $SUDO systemctl start nginx
    $SUDO systemctl enable nginx
    
    # Configuration Nginx pour video-ia.net
    log "Configuration de Nginx..."
    $SUDO tee /etc/nginx/sites-available/video-ia.net << EOF
server {
    listen 80;
    server_name $DOMAIN video-ia.net;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN video-ia.net;
    
    # SSL Configuration (à configurer avec Let's Encrypt)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Temporary self-signed for initial setup
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
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
    
    # Static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Images
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/api/health;
    }
}
EOF
    
    # Activation du site
    $SUDO ln -sf /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/
    $SUDO rm -f /etc/nginx/sites-enabled/default
    
    # Création d'un certificat self-signed temporaire
    $SUDO openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/nginx-selfsigned.key \
        -out /etc/ssl/certs/nginx-selfsigned.crt \
        -subj "/C=FR/ST=France/L=Paris/O=VideoIA/CN=$DOMAIN"
    
    # Test et reload Nginx
    $SUDO nginx -t
    $SUDO systemctl reload nginx
    
    success "Nginx configuré pour $DOMAIN"
}

# 6. Installation Certbot (Let's Encrypt)
install_certbot() {
    log "Installation de Certbot pour SSL..."
    
    $SUDO apt install -y certbot python3-certbot-nginx
    
    warning "SSL sera configuré manuellement après vérification DNS"
    log "Pour activer SSL: sudo certbot --nginx -d $DOMAIN"
    
    success "Certbot installé"
}

# 7. Configuration des répertoires
setup_directories() {
    log "Configuration des répertoires d'application..."
    
    # Répertoire principal
    $SUDO mkdir -p $APP_DIR
    $SUDO chown -R $USER:$USER $APP_DIR
    
    # Répertoires de logs
    $SUDO mkdir -p /var/log/pm2
    $SUDO chown -R $USER:$USER /var/log/pm2
    
    # Répertoire de backups
    $SUDO mkdir -p /var/backups/video-ia-net
    $SUDO chown -R $USER:$USER /var/backups/video-ia-net
    
    success "Répertoires configurés"
}

# 8. Configuration du firewall
setup_firewall() {
    log "Configuration du firewall UFW..."
    
    $SUDO ufw --force enable
    $SUDO ufw default deny incoming
    $SUDO ufw default allow outgoing
    
    # Ports autorisés
    $SUDO ufw allow ssh
    $SUDO ufw allow 80/tcp   # HTTP
    $SUDO ufw allow 443/tcp  # HTTPS
    $SUDO ufw allow 5432/tcp # PostgreSQL (local seulement)
    
    $SUDO ufw status
    success "Firewall configuré"
}

# 9. Optimisation système
optimize_system() {
    log "Optimisation du système..."
    
    # Limits
    $SUDO tee -a /etc/security/limits.conf << EOF
# Video-IA.net optimizations
www-data soft nofile 65536
www-data hard nofile 65536
$USER soft nofile 65536
$USER hard nofile 65536
EOF
    
    # Sysctl optimizations
    $SUDO tee -a /etc/sysctl.conf << EOF
# Video-IA.net network optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15
EOF
    
    $SUDO sysctl -p
    success "Système optimisé"
}

# 10. Scripts de maintenance
create_maintenance_scripts() {
    log "Création des scripts de maintenance..."
    
    # Script de backup
    $SUDO tee /usr/local/bin/backup-video-ia.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/video-ia-net"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
PGPASSWORD="Buzzerbeater23" pg_dump -h localhost -U video_ia_user -d video_ia_net \
  --clean --if-exists -f "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup application (excluding node_modules)
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" \
  --exclude="node_modules" \
  --exclude=".next" \
  --exclude="logs" \
  -C /var/www video-ia.net

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    $SUDO chmod +x /usr/local/bin/backup-video-ia.sh
    
    # Script de monitoring
    $SUDO tee /usr/local/bin/monitor-video-ia.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/video-ia-monitor.log"

# Check if application is running
if ! curl -f -s http://localhost:3000/api/tools?limit=1 > /dev/null; then
    echo "$(date): Application not responding, restarting..." >> $LOG_FILE
    pm2 restart video-ia-net
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): Disk usage high: ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory
MEM_USAGE=$(free | awk 'FNR==2{printf "%.2f", $3/($2)*100}')
if [ $(echo "$MEM_USAGE > 85" | bc) -eq 1 ]; then
    echo "$(date): Memory usage high: ${MEM_USAGE}%" >> $LOG_FILE
fi
EOF
    
    $SUDO chmod +x /usr/local/bin/monitor-video-ia.sh
    
    # Crontab pour les tâches automatiques
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-video-ia.sh") | crontab -
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-video-ia.sh") | crontab -
    
    success "Scripts de maintenance créés"
}

# Fonction principale
main() {
    log "Début du setup VPS pour video-ia.net"
    
    check_privileges
    update_system
    install_nodejs
    install_postgresql
    install_pm2
    install_nginx
    install_certbot
    setup_directories
    setup_firewall
    optimize_system
    create_maintenance_scripts
    
    echo
    success "🎉 Setup VPS terminé avec succès!"
    echo
    echo "📋 Prochaines étapes:"
    echo "1. Cloner votre repository dans $APP_DIR"
    echo "2. Configurer les variables d'environnement"
    echo "3. Migrer votre base de données"
    echo "4. Démarrer l'application avec PM2"
    echo "5. Configurer SSL avec: sudo certbot --nginx -d $DOMAIN"
    echo
    echo "🔗 Commandes utiles:"
    echo "• Backup: /usr/local/bin/backup-video-ia.sh"
    echo "• Logs PM2: pm2 logs video-ia-net"
    echo "• Status Nginx: sudo systemctl status nginx"
    echo "• Status PostgreSQL: sudo systemctl status postgresql"
    echo
    echo "🌐 Votre site sera disponible sur: https://$DOMAIN"
}

# Exécution
main "$@"