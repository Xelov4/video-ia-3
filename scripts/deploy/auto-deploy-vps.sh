#!/bin/bash

# 🚀 Script de Déploiement Automatique pour VPS
# À exécuter sur votre VPS : 46.202.129.104
# Usage: curl -sL https://raw.githubusercontent.com/VOTRE_USERNAME/video-ia.net/main/scripts/deploy/auto-deploy-vps.sh | bash

set -e

echo "🚀 Déploiement Automatique video-ia.net"
echo "========================================"

# Variables
DOMAIN="www.video-ia.net"
APP_DIR="/var/www/video-ia.net"
DB_NAME="video_ia_net"
DB_USER="video_ia_user"
DB_PASS="Buzzerbeater23"
REPO_URL="https://github.com/YOUR_USERNAME/video-ia.net.git"  # CHANGEZ CECI

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# 1. Mise à jour système et installation Node.js
log "Installation des dépendances système..."
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs postgresql postgresql-contrib nginx certbot python3-certbot-nginx git curl
success "Dépendances système installées"

# 2. Installation PM2
log "Installation de PM2..."
npm install -g pm2
pm2 install pm2-logrotate
success "PM2 installé"

# 3. Configuration PostgreSQL
log "Configuration de PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF
success "PostgreSQL configuré"

# 4. Clone du repository
log "Clone du repository..."
mkdir -p /var/www
cd /var/www

if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi
success "Repository cloné"

# 5. Installation des dépendances Node.js
log "Installation des dépendances..."
npm ci --production
success "Dépendances installées"

# 6. Configuration environnement
log "Configuration de l'environnement..."
cat > .env.production << EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXT_TELEMETRY_DISABLED=1
SECURE_COOKIES=true
EOF
success "Environnement configuré"

# 7. Build de l'application
log "Build de l'application..."
npm run build
success "Application buildée"

# 8. Configuration PM2
log "Configuration PM2..."
pm2 delete video-ia-net 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root
success "PM2 configuré"

# 9. Configuration Nginx
log "Configuration Nginx..."
cat > /etc/nginx/sites-available/video-ia.net << 'NGINXEOF'
server {
    listen 80;
    server_name www.video-ia.net video-ia.net;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Main location
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
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
    
    # Health check
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
NGINXEOF

# Activer le site
ln -sf /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test et restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx
success "Nginx configuré"

# 10. Configuration du firewall
log "Configuration du firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
success "Firewall configuré"

# 11. Test de l'application
log "Test de l'application..."
sleep 5

if curl -f -s http://localhost:3000 > /dev/null; then
    success "Application répond correctement"
else
    error "Application ne répond pas"
fi

# 12. Configuration SSL
log "Configuration SSL..."
echo "Attendez que le DNS soit propagé, puis exécutez:"
echo "certbot --nginx -d $DOMAIN -d video-ia.net --non-interactive --agree-tos --email votre-email@domain.com"

# 13. Résumé final
echo
echo "════════════════════════════════════════"
echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
echo "════════════════════════════════════════"
echo
echo "📊 Statut des services:"
systemctl is-active --quiet postgresql && echo "✅ PostgreSQL: Actif" || echo "❌ PostgreSQL: Inactif"
systemctl is-active --quiet nginx && echo "✅ Nginx: Actif" || echo "❌ Nginx: Inactif"
pm2 list | grep -q video-ia-net && echo "✅ PM2: Application démarrée" || echo "❌ PM2: Application arrêtée"

echo
echo "🌐 Votre site sera bientôt accessible sur:"
echo "   http://$(curl -s ifconfig.me) (IP directe)"
echo "   http://$DOMAIN (après propagation DNS)"
echo
echo "🔒 Pour activer HTTPS (après vérification DNS):"
echo "   certbot --nginx -d $DOMAIN -d video-ia.net"
echo
echo "📋 Commandes utiles:"
echo "   pm2 status                    # Statut de l'application"
echo "   pm2 logs video-ia-net         # Logs de l'application"
echo "   systemctl status nginx        # Statut Nginx"
echo "   systemctl status postgresql   # Statut PostgreSQL"
echo
echo "📍 IMPORTANT: Il vous reste à migrer votre base de données!"
echo "   Depuis votre machine locale, exécutez:"
echo "   npm run deploy:migrate-initial"

# NOTE: La base de données est vide, il faut migrer depuis DEV
echo
echo "⚠️  BASE DE DONNÉES VIDE - MIGRATION NÉCESSAIRE"
echo "   Votre base PostgreSQL est configurée mais vide."
echo "   Vous devez migrer vos données depuis votre environnement local."