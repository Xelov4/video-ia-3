# 🐳 PLAN DOCKER MODULAIRE - Video-IA.net

## 🎯 VISION MODULAIRE

### Objectif Principal
Créer un conteneur portable avec Next.js + PostgreSQL, avec possibilité d'ajouter/enlever des fonctionnalités selon les besoins, sans perte de données.

### Architecture 3-Tiers Flexible
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   CORE (1.5GB)  │  │ SCRAPER (3.5GB) │  │  FULL (4.0GB)  │
│                 │  │                 │  │                 │
│ ✅ Next.js      │  │ ✅ CORE +       │  │ ✅ SCRAPER +    │
│ ✅ PostgreSQL   │  │ ✅ Puppeteer    │  │ ✅ Monitoring   │
│ ✅ Prisma       │  │ ✅ Chromium     │  │ ✅ Cron Jobs    │
│ ✅ Data Import  │  │ ✅ Image Gen    │  │ ✅ Health Check │
│                 │  │ ✅ AI Scraping  │  │ ✅ Auto Backup  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        ↓                      ↓                      ↓
   Port: 3000            Port: 3000            Port: 3000
   Usage: Prod simple    Usage: Avec scraper   Usage: Entreprise
```

---

## 📋 ANALYSE COMPLÈTE DES COMPOSANTS

### 🔍 Ce qui EST dans le Code Source
```
✅ Application Next.js complète
✅ Configuration Prisma + schéma DB
✅ Scripts de maintenance (scripts/)
✅ Service de scraping (toolContentUpdaterOptimized)
✅ Configuration Sentry + monitoring
✅ Système multilingue complet
✅ Interface admin complète
```

### 🚨 Ce qui N'EST PAS dans le Code Source (Généré Dynamiquement)
```
❗ /public/logos/ (3.4MB) - Logos d'outils scrapés
❗ /public/screenshots/ (2.6MB) - Screenshots d'outils
❗ Base de données PostgreSQL avec 16,765 outils
❗ Certificats SSL et configuration Nginx
❗ Logs de santé et monitoring
❗ Backups automatiques
❗ Tâches cron configurées
```

### 🛠️ Dépendances Système Critiques
```
📦 Node.js 20 + npm
📦 PostgreSQL 16 
📦 Chromium/Chrome (pour Puppeteer)
📦 Supervisor (gestion processus)
📦 Cron (tâches programmées)
📦 Fonts système (pour screenshots)
📦 Sharp + ImageMagick (traitement images)
```

---

## 🏗️ ARCHITECTURE DÉTAILLÉE PAR VERSION

### 📦 VERSION CORE (video-ia:core) - 1.5GB
```dockerfile
FROM ubuntu:22.04

# Services Core
├── PostgreSQL 16 (serveur DB)
├── Next.js App (port 3000)
├── Prisma Client + Migrations
├── Supervisor (gestionnaire processus)
└── Variables d'environnement sécurisées

# Processus Supervisés
├── postgresql (port 5432 interne)
├── nextjs (port 3000)
└── health-monitor (basique)

# Volumes Recommandés
├── postgres_data:/var/lib/postgresql (persistance DB)
└── app_logs:/app/logs (logs application)
```

**🎯 Cas d'Usage**: Production simple, migration rapide, environnement de test

### 🤖 VERSION SCRAPER (video-ia:scraper) - 3.5GB
```dockerfile
FROM video-ia:core

# Ajouts Scraper
├── Chromium Browser (headless)
├── Puppeteer dependencies
├── Fonts système complètes
├── Sharp + ImageMagick
└── Service toolContentUpdaterOptimized

# Processus Supervisés Additionnels
├── scraper-service (API Gemini)
└── image-optimizer (traitement assets)

# Volumes Recommandés Additionnels  
├── dynamic_assets:/app/public/logos
├── dynamic_assets:/app/public/screenshots
└── scraper_cache:/tmp/puppeteer
```

**🎯 Cas d'Usage**: Site avec contenu dynamique, scraping automatique, génération d'assets

### 🚀 VERSION FULL (video-ia:full) - 4.0GB
```dockerfile
FROM video-ia:scraper

# Ajouts Monitoring & Automation
├── Cron daemon (tâches programmées)
├── Enhanced health monitoring
├── Automated backup system
├── Log rotation & management
└── Performance metrics collector

# Tâches Cron Configurées
├── 0 * * * * health-check.sh (monitoring)
├── 0 2 * * * pg_dump backup (sauvegarde DB)
├── 0 6 * * * log-rotation (nettoyage logs)
└── 0 4 * * 0 cleanup-assets (nettoyage cache)

# Volumes Recommandés Additionnels
├── backups:/backups (sauvegardes automatiques)
├── monitoring:/var/log/monitoring (logs système)
└── health_data:/app/health (métriques santé)
```

**🎯 Cas d'Usage**: Production entreprise, haute disponibilité, monitoring complet

---

## 🔧 CONFIGURATION MODULAIRE

### Variables d'Environnement de Contrôle
```env
# Configuration Core (toutes versions)
DATABASE_URL=postgresql://video_ia_user:video123@localhost:5432/video_ia_net
NODE_ENV=production
PORT=3000
NEXTAUTH_SECRET=T2A5SWo/lykmBXd9xNpSejn0iEocDXlDq5N/yTXSSno=
NEXTAUTH_URL=https://video-ia.net

# Configuration Scraper (versions scraper + full)
GEMINI_API_KEY=AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA
ENABLE_SCRAPER=true|false
SCRAPER_SCHEDULE=0 3 * * * (optionnel)
MAX_SCRAPER_CONCURRENT=3

# Configuration Monitoring (version full)
ENABLE_MONITORING=true|false
ENABLE_AUTO_BACKUP=true|false  
HEALTH_CHECK_INTERVAL=300 (5min)
BACKUP_RETENTION_DAYS=30
SENTRY_DSN=https://9d41a85c6612c8f054181ec316607cb4@o4509867619516416.ingest.de.sentry.io/4509867707269200

# Configuration Debug
LOG_LEVEL=info|debug|error
ENABLE_VERBOSE_LOGS=false
```

### Architecture Réseau Docker
```yaml
networks:
  video-ia-network:
    driver: bridge
    internal: false  # Accès internet pour scraper
  
# Ports Exposés
ports:
  - "3000:3000"  # Next.js (toutes versions)
  
# Ports Internes Seulement  
internal_ports:
  - "5432:5432"  # PostgreSQL (non exposé)
```

---

## 📁 STRUCTURE PROJET DOCKER

```
video-ia.net/
├── Dockerfile                    # Multi-stage build
├── docker-compose.core.yml      # Version core seulement
├── docker-compose.scraper.yml   # Version avec scraper
├── docker-compose.full.yml      # Version complète
├── .dockerignore                # Exclusions build
│
├── docker/
│   ├── supervisord.conf         # Configuration processus
│   ├── postgresql.conf          # Config PostgreSQL optimisée
│   ├── nginx.conf              # Config Nginx (si intégré)
│   │
│   ├── scripts/
│   │   ├── entrypoint.sh       # Point d'entrée principal
│   │   ├── init-postgres.sh    # Initialisation DB + import
│   │   ├── start-app.sh        # Démarrage Next.js
│   │   ├── health-check.sh     # Monitoring santé
│   │   ├── backup-db.sh        # Sauvegarde automatique
│   │   └── cleanup-assets.sh   # Nettoyage cache
│   │
│   └── config/
│       ├── cron.d/             # Tâches cron
│       ├── logrotate.d/        # Rotation logs
│       └── fail2ban/           # Protection sécurité (futur)
│
├── data/
│   ├── postgres-init/          # Scripts init DB
│   ├── seed-data/              # Données de seed
│   └── backups/               # Sauvegardes manuelles
│
└── docs/
    ├── deployment.md           # Guide déploiement
    ├── troubleshooting.md      # Guide dépannage
    └── upgrade.md             # Guide mise à jour
```

---

## 🚀 DOCKERFILE MULTI-STAGE

```dockerfile
# ================================================================
# STAGE 1: BASE - Dependencies & Setup
# ================================================================
FROM ubuntu:22.04 AS base
LABEL maintainer="Video-IA.net"
LABEL version="1.0.0"

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20

# System dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    software-properties-common \
    supervisor \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ================================================================
# STAGE 2: CORE - PostgreSQL + Next.js + Prisma
# ================================================================
FROM base AS core
LABEL stage="core"

# PostgreSQL installation
RUN apt-get update && apt-get install -y \
    postgresql-16 \
    postgresql-client-16 \
    postgresql-contrib-16 \
    && apt-get clean

# Application setup
COPY package*.json ./
RUN npm ci --omit=dev --no-audit

COPY . .
RUN npx prisma generate
RUN npm run build

# PostgreSQL configuration
COPY docker/config/postgresql.conf /etc/postgresql/16/main/
COPY docker/scripts/init-postgres.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/*

# Supervisor configuration for CORE
COPY docker/supervisord.core.conf /etc/supervisor/conf.d/supervisord.conf

# Scripts and entrypoint
COPY docker/scripts/entrypoint.sh /entrypoint.sh
COPY docker/scripts/start-app.sh /start-app.sh
COPY docker/scripts/health-check.sh /health-check.sh
RUN chmod +x /entrypoint.sh /start-app.sh /health-check.sh

EXPOSE 3000
VOLUME ["/var/lib/postgresql", "/app/logs"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# ================================================================
# STAGE 3: SCRAPER - + Puppeteer + Chromium + Image Processing
# ================================================================
FROM core AS scraper
LABEL stage="scraper"

# Chromium and dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium-browser \
    fonts-liberation \
    fonts-dejavu-core \
    fontconfig \
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
    # Image processing
    imagemagick \
    libvips-tools \
    && apt-get clean

# Puppeteer configuration
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Supervisor configuration for SCRAPER
COPY docker/supervisord.scraper.conf /etc/supervisor/conf.d/supervisord.conf

VOLUME ["/var/lib/postgresql", "/app/logs", "/app/public/logos", "/app/public/screenshots"]

# ================================================================
# STAGE 4: FULL - + Monitoring + Cron + Automation
# ================================================================
FROM scraper AS full
LABEL stage="full"

# Monitoring and automation tools
RUN apt-get update && apt-get install -y \
    cron \
    logrotate \
    htop \
    iostat \
    && apt-get clean

# Cron jobs setup
COPY docker/config/cron.d/* /etc/cron.d/
RUN chmod 0644 /etc/cron.d/*

# Backup and monitoring scripts
COPY docker/scripts/backup-db.sh /backup-db.sh
COPY docker/scripts/cleanup-assets.sh /cleanup-assets.sh
RUN chmod +x /backup-db.sh /cleanup-assets.sh

# Log rotation configuration
COPY docker/config/logrotate.d/* /etc/logrotate.d/

# Supervisor configuration for FULL
COPY docker/supervisord.full.conf /etc/supervisor/conf.d/supervisord.conf

VOLUME ["/var/lib/postgresql", "/app/logs", "/app/public/logos", "/app/public/screenshots", "/backups"]
```

---

## 🎛️ DOCKER COMPOSE CONFIGURATIONS

### Core Version (docker-compose.core.yml)
```yaml
version: '3.8'

services:
  video-ia-core:
    build:
      context: .
      target: core
      args:
        - NODE_ENV=production
    ports:
      - "3000:3000"
    volumes:
      - postgres_data:/var/lib/postgresql
      - app_logs:/app/logs
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
      - PORT=3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "/health-check.sh"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  app_logs:
```

### Scraper Version (docker-compose.scraper.yml)
```yaml
version: '3.8'

services:
  video-ia-scraper:
    build:
      context: .
      target: scraper
    ports:
      - "3000:3000"
    volumes:
      - postgres_data:/var/lib/postgresql
      - app_logs:/app/logs
      - dynamic_assets:/app/public/logos
      - screenshots:/app/public/screenshots
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ENABLE_SCRAPER=true
      - NODE_ENV=production
    restart: unless-stopped
    cap_add:
      - SYS_ADMIN  # Pour Puppeteer
    security_opt:
      - seccomp:unconfined  # Pour Chromium

volumes:
  postgres_data:
  app_logs:
  dynamic_assets:
  screenshots:
```

### Full Version (docker-compose.full.yml)
```yaml
version: '3.8'

services:
  video-ia-full:
    build:
      context: .
      target: full
    ports:
      - "3000:3000"
    volumes:
      - postgres_data:/var/lib/postgresql
      - app_logs:/app/logs
      - dynamic_assets:/app/public/logos
      - screenshots:/app/public/screenshots
      - backups:/backups
      - monitoring:/var/log/monitoring
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - SENTRY_DSN=${SENTRY_DSN}
      - ENABLE_SCRAPER=true
      - ENABLE_MONITORING=true
      - ENABLE_AUTO_BACKUP=true
      - NODE_ENV=production
    restart: unless-stopped
    cap_add:
      - SYS_ADMIN
    security_opt:
      - seccomp:unconfined

volumes:
  postgres_data:
  app_logs:
  dynamic_assets:
  screenshots:
  backups:
  monitoring:
```

---

## 🔄 MIGRATION ET DÉPLOIEMENT

### Préparation des Données
```bash
# 1. Export base de données existante
pg_dump -h localhost -U video_ia_user -d video_ia_net > current-db-backup.sql

# 2. Sauvegarde assets dynamiques
tar -czf assets-backup.tar.gz /root/video-ia.net/public/logos /root/video-ia.net/public/screenshots

# 3. Export configuration
cp /root/video-ia.net/.env ./docker/.env.production
```

### Build des Images
```bash
# Version Core seulement
docker build --target core -t video-ia:core .

# Version avec Scraper
docker build --target scraper -t video-ia:scraper .

# Version complète
docker build --target full -t video-ia:full .

# Ou build toutes les versions en une fois
docker build -t video-ia:full .  # Inclut automatiquement les layers précédents
```

### Déploiement Progressif
```bash
# 1. Test en local avec Core
docker-compose -f docker-compose.core.yml up -d

# 2. Si OK, upgrade vers Scraper
docker-compose down
docker-compose -f docker-compose.scraper.yml up -d

# 3. Si OK, upgrade vers Full
docker-compose down
docker-compose -f docker-compose.full.yml up -d
```

### Migration des Données
```bash
# Restauration automatique au premier démarrage via entrypoint.sh
# Ou restauration manuelle:
docker exec -i video-ia-container psql -U video_ia_user -d video_ia_net < current-db-backup.sql
```

---

## 🛡️ SÉCURITÉ ET BONNES PRATIQUES

### Gestion des Secrets
```yaml
# Utilisation de Docker secrets (recommandé)
secrets:
  database_password:
    file: ./secrets/db_password.txt
  gemini_api_key:
    file: ./secrets/gemini_key.txt
  nextauth_secret:
    file: ./secrets/nextauth_secret.txt
```

### Isolation Réseau
```yaml
networks:
  internal:
    driver: bridge
    internal: true  # Pas d'accès internet direct
  external:
    driver: bridge  # Accès internet pour scraper seulement
```

### Limites de Ressources
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

---

## 🔧 SCRIPTS D'AUTOMATISATION

### Entrypoint Principal (docker/scripts/entrypoint.sh)
```bash
#!/bin/bash
set -e

echo "🚀 Starting Video-IA Container..."

# 1. Initialize PostgreSQL if needed
if [ ! -f /var/lib/postgresql/16/main/PG_VERSION ]; then
    echo "📊 Initializing PostgreSQL..."
    /docker-entrypoint-initdb.d/init-postgres.sh
fi

# 2. Start PostgreSQL
echo "🗄️ Starting PostgreSQL..."
service postgresql start

# 3. Wait for PostgreSQL
until pg_isready -h localhost -p 5432; do
    echo "⏳ Waiting for PostgreSQL..."
    sleep 2
done

# 4. Run Prisma migrations
echo "🔧 Running Prisma migrations..."
cd /app && npx prisma migrate deploy

# 5. Import existing data if backup exists
if [ -f /data/current-db-backup.sql ] && [ ! -f /var/lib/postgresql/.imported ]; then
    echo "📥 Importing existing database..."
    psql -h localhost -U video_ia_user -d video_ia_net < /data/current-db-backup.sql
    touch /var/lib/postgresql/.imported
fi

# 6. Start application services via Supervisor
echo "🎯 Starting application services..."
exec "$@"
```

### Health Check (docker/scripts/health-check.sh)
```bash
#!/bin/bash

# Check PostgreSQL
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "❌ PostgreSQL not responding"
    exit 1
fi

# Check Next.js
if ! curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "❌ Next.js not responding"  
    exit 1
fi

echo "✅ All services healthy"
exit 0
```

---

## 📊 MONITORING ET MAINTENANCE

### Métriques Collectées (Version Full)
```yaml
System:
  - CPU usage
  - Memory usage  
  - Disk space
  - Network I/O

Application:
  - Response times
  - Error rates
  - Database connections
  - Active users

Scraper:
  - Success rate
  - Processing time
  - Generated assets
  - API calls count
```

### Logs Structurés
```yaml
Locations:
  - /app/logs/application.log (Next.js)
  - /var/log/postgresql/postgresql.log (Database)
  - /app/logs/scraper.log (Scraping activities)
  - /var/log/supervisor/ (Process management)

Rotation:
  - Daily rotation
  - 30 days retention
  - Compression enabled
```

### Backup Strategy (Version Full)
```yaml
Database:
  - Daily backup at 2 AM
  - Weekly full backup
  - 30 days retention

Assets:
  - Weekly backup of generated assets
  - Incremental backup

Configuration:
  - Backup of environment variables
  - Backup of custom configurations
```

---

## 🎯 PLAN DE MISE EN ŒUVRE

### Phase 1: Développement (Semaine 1)
```bash
✅ Création du Dockerfile multi-stage
✅ Scripts de configuration
✅ Tests locaux version Core
✅ Validation import/export données
```

### Phase 2: Tests (Semaine 2) 
```bash
✅ Tests version Scraper
✅ Validation génération assets
✅ Tests version Full
✅ Performance benchmarks
```

### Phase 3: Production (Semaine 3)
```bash
✅ Migration données production
✅ Déploiement version choisie
✅ Monitoring et alertes
✅ Documentation utilisateur
```

### Phase 4: Optimisation (Semaine 4)
```bash
✅ Fine-tuning performance
✅ Sécurisation avancée  
✅ Automation CI/CD
✅ Formation équipe
```

---

## 💡 AVANTAGES DE CETTE APPROCHE

### ✅ Flexibilité Maximale
- **Choix de version** selon les besoins
- **Upgrade/downgrade** sans perte de données
- **Modification à chaud** via variables d'environnement
- **Volumes optionnels** selon les fonctionnalités

### ✅ Portabilité Garantie
- **Container unique** = déploiement simple
- **Données isolées** dans des volumes
- **Configuration externalisée**
- **Compatible tous environnements**

### ✅ Maintenance Simplifiée
- **Multi-stage build** = optimisation taille
- **Scripts automatisés** pour toutes les tâches
- **Health checks** intégrés
- **Logs centralisés** et structurés

### ✅ Production Ready
- **Monitoring complet** (version Full)
- **Sauvegardes automatiques**
- **Sécurité multi-layers**
- **Scalabilité horizontale** possible

---

## 🚀 COMMANDES DE DÉPLOIEMENT

### Déploiement Rapide - Version Core
```bash
# Clone et build
git clone <repo> && cd video-ia.net
docker build --target core -t video-ia:core .

# Run avec persistance minimale
docker run -d \
  --name video-ia-prod \
  -p 3000:3000 \
  -v postgres_data:/var/lib/postgresql \
  -e DATABASE_URL="postgresql://user:pass@localhost:5432/video_ia_net" \
  --restart unless-stopped \
  video-ia:core
```

### Déploiement Avancé - Version Full
```bash
# Environment setup
cp .env.example .env.production
# Edit .env.production with your values

# Build and deploy
docker-compose -f docker-compose.full.yml up -d

# Monitor logs
docker-compose logs -f
```

### Migration depuis Serveur Existant
```bash
# 1. Export data from current server
./docker/scripts/export-current-data.sh

# 2. Build container with data
docker build -t video-ia:migrated .

# 3. Deploy on new server
docker save video-ia:migrated | gzip > video-ia-backup.tar.gz
# Transfer to new server
docker load < video-ia-backup.tar.gz
docker run -d video-ia:migrated
```

---

## 📝 CONCLUSION

Cette architecture modulaire offre:

🎯 **3 versions** adaptées à différents besoins et budgets  
🔧 **Configuration flexible** via variables d'environnement  
📦 **Portabilité garantie** sur n'importe quel serveur Docker  
🔄 **Migration progressive** Core → Scraper → Full  
💾 **Données persistantes** dans des volumes Docker  
🛡️ **Sécurité production** avec isolation des services  
📊 **Monitoring optionnel** pour les environnements critiques  

**Next Steps**: Validation de l'approche et début d'implémentation par la version choisie ! 

---

*Version: 2.0 | Date: 2025-08-20 | Author: Claude Code Assistant*