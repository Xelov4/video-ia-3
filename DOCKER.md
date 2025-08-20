# 🐳 VIDEO-IA.NET - GUIDE DOCKER COMPLET

## 🎯 OVERVIEW

Cette dockerisation complète permet de déployer **toute l'application Video-IA.net** dans un seul container, incluant :

- ✅ **Next.js 15** avec toutes les pages et API routes
- ✅ **PostgreSQL 16** avec les 16k+ outils importés
- ✅ **Puppeteer + Chromium** pour le scraping
- ✅ **Système auto-update** avec Git integration
- ✅ **Monitoring et health checks** automatiques
- ✅ **Backup automatique** des données
- ✅ **Migration facile** entre serveurs

## 🚀 DÉPLOIEMENT RAPIDE

### 1. Prérequis
```bash
# Installer Docker et Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Déploiement en 1 Commande
```bash
# Clone et déploie automatiquement
git clone <your-repo> video-ia.net
cd video-ia.net
./deploy-docker.sh
```

### 3. Accès à l'Application
- **URL**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:3000/api/tools

## 📋 CONFIGURATION DÉTAILLÉE

### Variables d'Environnement Critiques

Éditez `.env` avant le déploiement :

```bash
# 🔐 SÉCURITÉ - CHANGER OBLIGATOIREMENT !
NEXTAUTH_SECRET=votre-secret-ultra-securise-256-bits
DB_PASSWORD=mot-de-passe-base-donnees-securise
GEMINI_API_KEY=votre-nouvelle-cle-gemini-api

# 🌐 DOMAINE
NEXTAUTH_URL=https://votre-domaine.com
NEXT_PUBLIC_BASE_URL=https://votre-domaine.com

# 🤖 SCRAPER (optionnel)
ENABLE_SCRAPER=true
MAX_SCRAPER_CONCURRENT=3

# 🔄 AUTO-UPDATE (optionnel)
ENABLE_AUTO_UPDATE=true
GIT_REPOSITORY_URL=https://github.com/your-org/video-ia.net.git
```

### Structure des Volumes

```bash
./data/
├── postgres/          # Base PostgreSQL (16k+ outils)
├── app/               # Backups et données application
├── logs/              # Logs système 
└── assets/           # Images et screenshots générés
```

## 🔧 COMMANDES ESSENTIELLES

### Gestion du Container
```bash
# Démarrage
./deploy-docker.sh deploy

# Statut et logs
docker-compose logs -f
docker exec video-ia-complete /app/scripts/health-check.sh

# Redémarrage
docker-compose restart

# Arrêt
docker-compose down

# Backup manuel
docker exec video-ia-complete /app/scripts/backup-database.sh
```

### Accès au Container
```bash
# Shell dans le container
docker exec -it video-ia-complete bash

# Accès PostgreSQL
docker exec -it video-ia-complete su - postgres -c "psql -U video_ia_user -d video_ia_net"

# Logs temps réel
docker exec -it video-ia-complete tail -f /var/log/video-ia/nextjs.log
```

## 🔄 MIGRATION ENTRE SERVEURS

### Export depuis Serveur Source
```bash
# 1. Backup complet
./deploy-docker.sh backup

# 2. Export image + données
docker save video-ia:latest | gzip > video-ia-complete.tar.gz
tar -czf video-ia-data.tar.gz ./data/
```

### Import sur Nouveau Serveur
```bash
# 1. Transfer des fichiers
scp video-ia-complete.tar.gz user@nouveau-serveur:/path/
scp video-ia-data.tar.gz user@nouveau-serveur:/path/

# 2. Restoration
docker load < video-ia-complete.tar.gz
tar -xzf video-ia-data.tar.gz

# 3. Démarrage
docker-compose up -d
```

## 🔍 MONITORING & MAINTENANCE

### Health Checks Automatiques
```bash
# Status global
curl http://localhost:3000/api/health

# Health check interne
docker exec video-ia-complete /app/scripts/health-check.sh
```

### Logs Système
```bash
# Logs application
docker-compose logs video-ia-app

# Logs PostgreSQL
docker exec video-ia-complete tail -f /var/log/video-ia/postgresql.log

# Logs scraper
docker exec video-ia-complete tail -f /var/log/video-ia/scraper.log
```

### Backups Automatiques
- **Fréquence**: Tous les jours à 2h00
- **Rétention**: 30 jours
- **Location**: `./data/app/backups/`
- **Format**: `video_ia_backup_YYYYMMDD_HHMMSS.sql.gz`

## 🔒 SÉCURITÉ

### Points Critiques Sécurisés ✅
- ✅ **Clés API** externalisées dans .env
- ✅ **Mots de passe** générés automatiquement
- ✅ **Container** non-root quand possible
- ✅ **Volumes** isolés
- ✅ **Réseau** bridge sécurisé

### Recommandations Production
```bash
# 1. Utiliser Docker secrets
docker secret create db_password ./secrets/db_password.txt

# 2. Firewall restrictif
sudo ufw allow 3000/tcp
sudo ufw enable

# 3. Monitoring externe
# Intégrer avec votre solution monitoring (Prometheus, etc.)

# 4. Certificats SSL
# Utiliser Traefik ou nginx-proxy pour HTTPS automatique
```

## 🚨 DÉPANNAGE

### Problèmes Courants

**Container ne démarre pas**
```bash
# Vérifier logs
docker-compose logs video-ia-app

# Vérifier santé PostgreSQL
docker exec video-ia-complete su - postgres -c "pg_isready"
```

**Erreurs Puppeteer**
```bash
# Vérifier Chrome
docker exec video-ia-complete chromium-browser --version

# Test scraper
docker exec video-ia-complete node -e "const puppeteer = require('puppeteer'); console.log('Puppeteer OK')"
```

**Base données corrompue**
```bash
# Restaurer depuis backup
ls ./data/app/backups/
docker exec video-ia-complete /app/scripts/restore-backup.sh backup-file.sql.gz
```

**Performance dégradée**
```bash
# Vérifier ressources
docker stats video-ia-complete

# Optimiser PostgreSQL
docker exec video-ia-complete psql -U video_ia_user -d video_ia_net -c "VACUUM ANALYZE;"
```

## 📊 PERFORMANCE

### Ressources Recommandées
- **CPU**: 2-4 cores
- **RAM**: 4-8 GB
- **Disk**: 20-50 GB SSD
- **Network**: 100+ Mbps

### Optimisations Intégrées
- ✅ **Multi-stage build** pour taille optimale
- ✅ **Cache layers** Docker optimisés
- ✅ **PostgreSQL** configuré pour production
- ✅ **Next.js** build optimisé
- ✅ **Images** compression automatique

## 🔄 AUTO-UPDATE SYSTÈME

### Configuration Git Auto-Pull
```bash
# Le container vérifie les updates toutes les 30 minutes
# Configuration dans .env:
ENABLE_AUTO_UPDATE=true
GIT_REPOSITORY_URL=https://github.com/your-org/video-ia.net.git
UPDATE_CHECK_INTERVAL=1800  # 30 minutes
```

### Watchtower (Update Image Docker)
```bash
# Inclus dans docker-compose.yml
# Vérifie nouvelle image toutes les heures
# Redémarre automatiquement si nouvelle version
```

## 📈 MÉTRIQUES & MONITORING

### Métriques Collectées
- 🔍 **Health checks** (PostgreSQL + Next.js)
- 📊 **Performance** (CPU, RAM, Disk)
- 🔄 **Uptime** et availability
- 🤖 **Scraper** success rate
- 📦 **Database** size et growth
- 🌐 **Traffic** et response times

### Intégration Monitoring Externe
```yaml
# Exemple avec Prometheus
version: '3.8'
services:
  video-ia-app:
    # ... config existante
    ports:
      - "9090:9090"  # Métriques Prometheus
    environment:
      - ENABLE_METRICS=true
      - METRICS_PORT=9090
```

## 🎯 VERSIONS & UPDATES

### Version Actuelle: `1.0.0`
- ✅ All-in-one container
- ✅ PostgreSQL 16 + Next.js 15
- ✅ Auto-update system
- ✅ Production ready

### Prochaines Versions
- `1.1.0`: Redis cache intégré
- `1.2.0`: Multi-container orchestration
- `1.3.0`: Kubernetes support
- `2.0.0`: Microservices architecture

## 📞 SUPPORT

### Logs Utiles pour Debug
```bash
# Package logs complet pour support
./deploy-docker.sh status > debug-logs.txt
docker-compose logs >> debug-logs.txt
docker exec video-ia-complete /app/scripts/health-check.sh >> debug-logs.txt
```

### Issues Connues
1. **Puppeteer** peut nécessiter `--no-sandbox` selon l'environnement
2. **PostgreSQL** init peut prendre 2-3 minutes au premier démarrage
3. **Auto-update** nécessite accès Git (clés SSH si repo privé)

---

## 🎉 CONCLUSION

Cette dockerisation complète vous offre :

🚀 **Déploiement en 1 commande**  
📦 **Migration facile** entre serveurs  
🔄 **Auto-update** intégré  
🛡️ **Sécurité** renforcée  
📊 **Monitoring** complet  
💾 **Backups** automatiques  

**L'application Video-IA.net est maintenant prête pour la production avec Docker !**

---

*Documentation mise à jour le 20 août 2025 | Version Docker 1.0.0*