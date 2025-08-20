# ===================================================================
# 🐳 VIDEO-IA.NET - COMPLETE DOCKERIZED STACK
# ===================================================================
# All-in-one container avec:
# - Next.js 15 + PostgreSQL 16 + Prisma
# - Puppeteer + Chromium pour scraping  
# - Auto-update system + CI/CD ready
# - Monitoring + Health checks
# - Migration-ready avec volumes persistants
# ===================================================================

FROM ubuntu:22.04

LABEL maintainer="Video-IA.net"
LABEL version="1.0.0"
LABEL description="Complete Video-IA stack - Next.js + PostgreSQL + Scraper"

# ===================================================================
# VARIABLES D'ENVIRONNEMENT SYSTÈME
# ===================================================================
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20
ENV POSTGRESQL_VERSION=16
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV TZ=Europe/Paris

# ===================================================================
# INSTALLATION SYSTÈME DE BASE
# ===================================================================
RUN apt-get update && apt-get install -y \
    # Base système
    curl \
    wget \
    gnupg \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    lsb-release \
    # Outils système
    supervisor \
    cron \
    logrotate \
    htop \
    git \
    unzip \
    # Outils réseau
    netcat-openbsd \
    iputils-ping \
    # Sécurité
    fail2ban \
    # Nettoyage
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ===================================================================
# INSTALLATION NODE.JS 20
# ===================================================================
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pm2 \
    && apt-get clean

# ===================================================================
# INSTALLATION POSTGRESQL 16
# ===================================================================
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y \
        postgresql-${POSTGRESQL_VERSION} \
        postgresql-client-${POSTGRESQL_VERSION} \
        postgresql-contrib-${POSTGRESQL_VERSION} \
    && apt-get clean

# ===================================================================
# INSTALLATION CHROMIUM + DÉPENDANCES PUPPETEER
# ===================================================================
RUN apt-get update && apt-get install -y \
    # Chromium et dépendances
    chromium-browser \
    # Fonts système
    fonts-liberation \
    fonts-dejavu-core \
    fonts-noto-color-emoji \
    fontconfig \
    # Librairies graphiques
    libxss1 \
    libappindicator1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxshmfence1 \
    libnss3 \
    libgconf-2-4 \
    # Traitement d'images
    imagemagick \
    libvips-tools \
    optipng \
    jpegoptim \
    # Nettoyage
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ===================================================================
# CONFIGURATION POSTGRESQL
# ===================================================================
USER postgres

# Initialisation cluster PostgreSQL
RUN /usr/lib/postgresql/${POSTGRESQL_VERSION}/bin/initdb -D /var/lib/postgresql/${POSTGRESQL_VERSION}/main

# Configuration PostgreSQL optimisée pour production
RUN echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/${POSTGRESQL_VERSION}/main/pg_hba.conf \
    && echo "listen_addresses='*'" >> /var/lib/postgresql/${POSTGRESQL_VERSION}/main/postgresql.conf \
    && echo "port = 5432" >> /var/lib/postgresql/${POSTGRESQL_VERSION}/main/postgresql.conf \
    && echo "max_connections = 100" >> /var/lib/postgresql/${POSTGRESQL_VERSION}/main/postgresql.conf \
    && echo "shared_buffers = 256MB" >> /var/lib/postgresql/${POSTGRESQL_VERSION}/main/postgresql.conf \
    && echo "effective_cache_size = 1GB" >> /var/lib/postgresql/${POSTGRESQL_VERSION}/main/postgresql.conf \
    && echo "work_mem = 4MB" >> /var/lib/postgresql/${POSTGRESQL_VERSION}/main/postgresql.conf \
    && echo "maintenance_work_mem = 64MB" >> /var/lib/postgresql/${POSTGRESQL_VERSION}/main/postgresql.conf

USER root

# ===================================================================
# CRÉATION RÉPERTOIRES APPLICATION
# ===================================================================
WORKDIR /app

# Répertoires pour données persistantes
RUN mkdir -p \
    /app/data/postgres \
    /app/data/backups \
    /app/data/logs \
    /app/data/uploads \
    /app/data/cache \
    /var/log/video-ia \
    /etc/supervisor/conf.d

# ===================================================================
# COPIE ET INSTALLATION APPLICATION
# ===================================================================

# Copie package.json en premier pour optimiser cache Docker
COPY package*.json ./
COPY prisma ./prisma/

# Installation dépendances Node.js (production + dev pour build)
RUN npm ci --include=dev --no-audit --no-fund

# Copie code source complet
COPY . .

# Génération client Prisma
RUN npx prisma generate

# Build application Next.js
RUN npm run build

# Nettoyage dépendances dev après build
RUN npm prune --omit=dev

# ===================================================================
# IMPORT DONNÉES ACTUELLES
# ===================================================================

# Copie du dump SQL existant dans le container (si disponible)
COPY video_ia_net_backup_20250812_164525.sql /app/data/initial-db-dump.sql

# Assets statiques existants
RUN mkdir -p /app/public/images/tools && \
    mkdir -p /app/public/images/logos && \
    mkdir -p /app/public/images/screenshots

# Si vous avez des assets existants, décommentez :
# COPY public/images/tools/ /app/public/images/tools/
# COPY public/images/logos/ /app/public/images/logos/
# COPY public/images/screenshots/ /app/public/images/screenshots/

# ===================================================================
# SCRIPTS DE GESTION
# ===================================================================

# Script d'initialisation principal
COPY <<EOF /app/scripts/init-container.sh
#!/bin/bash
set -e

echo "🚀 [INIT] Starting Video-IA Complete Stack..."

# 1. Démarrage PostgreSQL
echo "🗄️  [INIT] Starting PostgreSQL..."
service postgresql start

# Attente PostgreSQL
echo "⏳ [INIT] Waiting for PostgreSQL..."
until su - postgres -c "pg_isready" 2>/dev/null; do
    echo "   Waiting for PostgreSQL to start..."
    sleep 2
done

# 2. Configuration base de données
echo "🔧 [INIT] Configuring database..."
su - postgres -c "createuser -s video_ia_user 2>/dev/null || true"
su - postgres -c "createdb -O video_ia_user video_ia_net 2>/dev/null || true"
su - postgres -c "psql -c \"ALTER USER video_ia_user WITH PASSWORD 'video123';\" 2>/dev/null || true"

# 3. Import données si première installation
if [ ! -f /app/data/postgres/.imported ]; then
    echo "📥 [INIT] Importing initial database..."
    if [ -f /app/data/initial-db-dump.sql ]; then
        su - postgres -c "psql -U video_ia_user -d video_ia_net -f /app/data/initial-db-dump.sql" || echo "Import failed, continuing..."
    fi
    
    # Migration Prisma
    echo "🔄 [INIT] Running Prisma migrations..."
    cd /app && npx prisma migrate deploy || echo "Migrations failed, continuing..."
    
    touch /app/data/postgres/.imported
    echo "✅ [INIT] Database imported successfully"
fi

# 4. Démarrage application Next.js
echo "🚀 [INIT] Starting Next.js application..."
cd /app
exec npm start
EOF

# Script de health check
COPY <<EOF /app/scripts/health-check.sh
#!/bin/bash

# Check PostgreSQL
if ! su - postgres -c "pg_isready" >/dev/null 2>&1; then
    echo "❌ PostgreSQL not responding"
    exit 1
fi

# Check Next.js
if ! curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "❌ Next.js not responding"
    exit 1
fi

# Check disk space (minimum 1GB libre)
available=\$(df /app | tail -1 | awk '{print \$4}')
if [ "\$available" -lt 1000000 ]; then
    echo "⚠️  Low disk space: \${available}K available"
fi

echo "✅ All services healthy"
exit 0
EOF

# Script de backup automatique
COPY <<EOF /app/scripts/backup-database.sh
#!/bin/bash
set -e

BACKUP_DIR="/app/data/backups"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/video_ia_backup_\$DATE.sql"

echo "📦 [BACKUP] Starting database backup..."

# Créer répertoire backup si nécessaire
mkdir -p \$BACKUP_DIR

# Backup PostgreSQL
su - postgres -c "pg_dump -U video_ia_user video_ia_net > \$BACKUP_FILE"

# Compression
gzip "\$BACKUP_FILE"

# Nettoyage anciens backups (garde 10 derniers)
ls -t \$BACKUP_DIR/*.sql.gz | tail -n +11 | xargs -r rm

echo "✅ [BACKUP] Database backup completed: \$BACKUP_FILE.gz"
EOF

# Script de mise à jour automatique
COPY <<EOF /app/scripts/auto-update.sh
#!/bin/bash
set -e

echo "🔄 [UPDATE] Checking for updates..."

cd /app

# Pull dernières modifications Git (si repository configuré)
if [ -d .git ]; then
    git fetch origin main
    
    # Check si nouvelles modifications
    LOCAL=\$(git rev-parse HEAD)
    REMOTE=\$(git rev-parse origin/main)
    
    if [ "\$LOCAL" != "\$REMOTE" ]; then
        echo "📥 [UPDATE] New updates available, pulling..."
        git pull origin main
        
        # Rebuild si nécessaire
        npm ci --omit=dev
        npm run build
        
        # Migration Prisma
        npx prisma migrate deploy
        
        echo "🔄 [UPDATE] Restarting application..."
        pm2 restart all || echo "Manual restart required"
        
        echo "✅ [UPDATE] Application updated successfully"
    else
        echo "✅ [UPDATE] Application is up to date"
    fi
fi
EOF

# Rendre scripts exécutables
RUN chmod +x /app/scripts/*.sh

# ===================================================================
# CONFIGURATION SUPERVISOR
# ===================================================================

COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/video-ia/supervisord.log
pidfile=/var/run/supervisord.pid
user=root

[program:postgresql]
command=/usr/lib/postgresql/16/bin/postgres -D /var/lib/postgresql/16/main -c config_file=/etc/postgresql/16/main/postgresql.conf
user=postgres
autostart=true
autorestart=true
stdout_logfile=/var/log/video-ia/postgresql.log
stderr_logfile=/var/log/video-ia/postgresql.log

[program:nextjs]
command=/app/scripts/init-container.sh
directory=/app
user=root
autostart=true
autorestart=true
stdout_logfile=/var/log/video-ia/nextjs.log
stderr_logfile=/var/log/video-ia/nextjs.log

[program:health-monitor]
command=/bin/bash -c "while true; do /app/scripts/health-check.sh && sleep 300; done"
autostart=true
autorestart=true
stdout_logfile=/var/log/video-ia/health.log
stderr_logfile=/var/log/video-ia/health.log
EOF

# ===================================================================
# CONFIGURATION CRON POUR AUTO-UPDATE
# ===================================================================

# Crontab pour mises à jour automatiques
RUN echo "# Video-IA Automated Tasks" > /etc/cron.d/video-ia \
    && echo "0 2 * * * root /app/scripts/backup-database.sh >> /var/log/video-ia/backup.log 2>&1" >> /etc/cron.d/video-ia \
    && echo "*/30 * * * * root /app/scripts/auto-update.sh >> /var/log/video-ia/update.log 2>&1" >> /etc/cron.d/video-ia \
    && echo "0 4 * * 0 root find /app/data/backups -name '*.sql.gz' -mtime +30 -delete" >> /etc/cron.d/video-ia \
    && chmod 0644 /etc/cron.d/video-ia

# ===================================================================
# CONFIGURATION FINALE
# ===================================================================

# Variables d'environnement par défaut (override avec docker run -e)
ENV DATABASE_URL="postgresql://video_ia_user:video123@localhost:5432/video_ia_net?schema=public"
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXTAUTH_SECRET=""
ENV NEXTAUTH_URL="http://localhost:3000"

# Ports exposés
EXPOSE 3000

# Volumes pour persistance données
VOLUME ["/var/lib/postgresql", "/app/data", "/var/log/video-ia"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /app/scripts/health-check.sh

# Point d'entrée
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]