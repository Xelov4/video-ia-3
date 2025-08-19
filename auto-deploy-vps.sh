#!/bin/bash

# ============================================================================
# 🚀 AUTO-DEPLOYMENT SCRIPT - VIDEO-IA.NET PRODUCTION
# ============================================================================
# Script d'installation automatique sur VPS Ubuntu
# Exécution: ./auto-deploy-vps.sh

set -e  # Arrêt en cas d'erreur

VPS_IP="46.202.129.104"
DB_PASSWORD="video123"
GEMINI_API_KEY="AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA"
DOMAIN="video-ia.net"

echo "🚀 === AUTO-DEPLOYMENT VIDEO-IA.NET ==="
echo "🎯 VPS: $VPS_IP"
echo "🌐 Domain: $DOMAIN"
echo "📅 $(date)"
echo ""

# Phase 1: Préparation système
echo "📦 PHASE 1: Préparation système..."

ssh $VPS_IP << 'EOF'
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation dépendances
sudo apt install -y curl wget git unzip software-properties-common nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# Installation Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation PM2
sudo npm install -g pm2 typescript tsx prisma

# Démarrage services
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl start nginx  
sudo systemctl enable nginx

echo "✅ Phase 1 terminée"
EOF

# Phase 2: Configuration PostgreSQL
echo "📊 PHASE 2: Configuration base de données..."

ssh $VPS_IP << EOF
# Configuration PostgreSQL
sudo -u postgres psql << PSQL
CREATE USER video_ia_user WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE video_ia_net OWNER video_ia_user;
GRANT ALL PRIVILEGES ON DATABASE video_ia_net TO video_ia_user;
\q
PSQL

echo "✅ PostgreSQL configuré"
EOF

# Phase 3: Clone et configuration application  
echo "💻 PHASE 3: Installation application..."

ssh $VPS_IP << EOF
# Clone repository
cd /root
git clone https://github.com/Xelov4/video-ia-3.git video-ia.net
cd video-ia.net

# Installation dépendances
npm install --production

# Configuration .env
cat > .env << ENV
# Database
DATABASE_URL="postgresql://video_ia_user:$DB_PASSWORD@localhost:5432/video_ia_net?schema=public"

# API Keys
GOOGLE_GEMINI_API_KEY=$GEMINI_API_KEY

# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://$DOMAIN

# Security  
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://$DOMAIN
ENV

echo "✅ Application configurée"
EOF

# Phase 4: Import base de données
echo "🗄️ PHASE 4: Import données..."

ssh $VPS_IP << EOF
cd /root/video-ia-3

# Import backup
PGPASSWORD=$DB_PASSWORD psql -h localhost -U video_ia_user -d video_ia_net < video_ia_backup_production_20250818_233327.sql

# Vérification
TOOLS_COUNT=\$(PGPASSWORD=$DB_PASSWORD psql -h localhost -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tools;")
echo "✅ Import terminé: \$TOOLS_COUNT outils importés"
EOF

# Phase 5: Build et démarrage
echo "🔨 PHASE 5: Build et démarrage..."

ssh $VPS_IP << 'EOF'
cd /root/video-ia.net

# Génération Prisma
npx prisma generate

# Build Next.js
npm run build

# Configuration PM2
cat > ecosystem.config.js << PM2
module.exports = {
  apps: [{
    name: 'video-ia-net',
    script: 'npm',
    args: 'start',
    cwd: '/root/video-ia.net',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
PM2

# Démarrage PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Application démarrée"
EOF

# Phase 6: Configuration Nginx
echo "🌐 PHASE 6: Configuration Nginx..."

ssh $VPS_IP << EOF
# Configuration Nginx
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

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
    }

    location /_next/static/ {
        alias /root/video-ia.net/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /images/ {
        alias /root/video-ia.net/public/images/;
        expires 1y; 
        add_header Cache-Control "public";
    }
}
NGINX

# Activation site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test et restart
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Nginx configuré"
EOF

# Phase 7: SSL
echo "🔒 PHASE 7: Configuration SSL..."

ssh $VPS_IP << EOF
# Installation SSL automatique
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email jihad.ejjilali@gmail.com

echo "✅ SSL configuré"
EOF

# Phase 8: Scripts de monitoring
echo "📊 PHASE 8: Scripts de monitoring..."

ssh $VPS_IP << EOF
# Script health check
cat > /root/health-check.sh << HEALTH
#!/bin/bash
echo "=== VIDEO-IA.NET HEALTH CHECK ==="
echo "Date: \$(date)"
echo ""

echo "📱 Application Status:"
pm2 list | grep video-ia-net

echo ""
echo "🗄️ Database Status:"
PGPASSWORD=$DB_PASSWORD psql -h localhost -U video_ia_user -d video_ia_net -c "SELECT COUNT(*) as tools_count FROM tools;" 2>/dev/null || echo "❌ Database connection failed"

echo ""
echo "🌐 Nginx Status:"
sudo systemctl is-active nginx

echo ""
echo "💾 Disk Usage:"
df -h /

echo ""
echo "🧠 Memory Usage:"
free -h
HEALTH

chmod +x /root/health-check.sh

# Setup cron
mkdir -p /root/backups
(crontab -l 2>/dev/null; echo "0 * * * * /root/health-check.sh >> /var/log/video-ia-health.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * PGPASSWORD=$DB_PASSWORD pg_dump -h localhost -U video_ia_user -d video_ia_net > /root/backups/backup-\$(date +%Y%m%d).sql") | crontab -

echo "✅ Monitoring configuré"
EOF

# Tests finaux
echo "🧪 PHASE 9: Tests finaux..."

ssh $VPS_IP << EOF
echo "🔍 Tests système:"

# Test application
APP_STATUS=\$(pm2 list | grep video-ia-net | grep -o "online\|stopped")
echo "📱 Application: \$APP_STATUS"

# Test base de données  
DB_COUNT=\$(PGPASSWORD=$DB_PASSWORD psql -h localhost -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tools;" 2>/dev/null || echo "0")
echo "🗄️ Database: \$DB_COUNT outils"

# Test Nginx
NGINX_STATUS=\$(sudo systemctl is-active nginx)
echo "🌐 Nginx: \$NGINX_STATUS"

# Test HTTPS
SSL_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/ || echo "000")
echo "🔒 HTTPS: \$SSL_STATUS"

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "🌐 Site accessible sur: https://$DOMAIN"
EOF

echo ""
echo "=".repeat(80)
echo "🎉 AUTO-DEPLOYMENT TERMINÉ !"
echo "=".repeat(80)
echo ""
echo "✅ SERVICES DÉPLOYÉS:"
echo "   🌐 Site web: https://$DOMAIN"
echo "   📊 Monitoring: /root/health-check.sh"
echo "   🗄️ Database: PostgreSQL avec $(ssh $VPS_IP "PGPASSWORD=$DB_PASSWORD psql -h localhost -U video_ia_user -d video_ia_net -t -c 'SELECT COUNT(*) FROM tools;'" 2>/dev/null || echo "?") outils"
echo ""
echo "🔧 COMMANDES UTILES:"
echo "   ssh $VPS_IP"
echo "   pm2 status"
echo "   pm2 logs video-ia-net"
echo "   sudo systemctl status nginx"
echo ""
echo "🎯 PRÊT POUR PRODUCTION !"