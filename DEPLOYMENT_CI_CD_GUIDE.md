# 🚀 Guide de Déploiement CI/CD - video-ia.net

Guide complet pour le déploiement et la synchronisation automatique avec GitHub Actions.

---

## 📋 Table des Matières

1. [Vue d'ensemble du système](#vue-densemble-du-système)
2. [Configuration initiale](#configuration-initiale)
3. [GitHub Actions Workflows](#github-actions-workflows)
4. [Synchronisation des bases de données](#synchronisation-des-bases-de-données)
5. [Interface de contrôle](#interface-de-contrôle)
6. [Maintenance et monitoring](#maintenance-et-monitoring)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble du système

### Architecture Dual-Database
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│   DEV (WSL) │◄──►│  GitHub Actions │◄──►│ PROD (VPS)  │
│  localhost  │    │   Sync Engine   │    │46.202.129.104│
└─────────────┘    └─────────────────┘    └─────────────┘
```

### Composants du système
- **GitHub Actions**: Déploiement automatique et synchronisation
- **Scripts de sync**: Synchronisation bidirectionnelle intelligente
- **PM2**: Gestion des processus en production
- **Nginx**: Reverse proxy avec SSL
- **PostgreSQL**: Base de données dupliquée DEV/PROD

---

## 🔧 Configuration initiale

### 1. Variables d'environnement GitHub

Dans votre repository GitHub, allez dans **Settings > Secrets and Variables > Actions** et ajoutez:

```bash
# VPS Access
VPS_HOST=46.202.129.104
VPS_USER=root
VPS_PASSWORD=Buzzerbeater23

# Production Database
PROD_DATABASE_URL=postgresql://video_ia_user:Buzzerbeater23@localhost:5432/video_ia_net
PROD_DB_HOST=localhost
PROD_DB_PORT=5432
PROD_DB_NAME=video_ia_net
PROD_DB_USER=video_ia_user
PROD_DB_PASSWORD=Buzzerbeater23

# Development Database (pour sync)
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
DEV_DB_NAME=video_ia_net
DEV_DB_USER=video_ia_user
DEV_DB_PASSWORD=video123
```

### 2. Configuration du VPS

Exécutez le script de setup automatique:

```bash
# Rendre le script exécutable
chmod +x scripts/deploy/setup-vps-complete.sh

# Setup complet du VPS
./scripts/deploy/setup-vps-complete.sh
```

Ce script installe automatiquement:
- Node.js 18
- PostgreSQL avec base de données configurée
- PM2 pour la gestion des processus
- Nginx avec configuration SSL
- Certbot pour Let's Encrypt
- Scripts de maintenance automatique

### 3. Migration initiale des données

```bash
# Migration one-shot DEV → PROD
npm run deploy:migrate-initial
```

---

## 🔄 GitHub Actions Workflows

### 1. Déploiement automatique (`deploy.yml`)

**Déclenchement**: Push sur `main` ou manuel

**Actions**:
- Build et test de l'application
- Déploiement sur le VPS
- Restart PM2
- Health check post-déploiement

**Usage manuel**:
```yaml
# Via GitHub UI > Actions > Deploy to Production
# Options:
# - skip_build: Déployer sans rebuild
# - restart_only: Redémarrage PM2 uniquement
```

### 2. Sync DEV → PROD (`sync-to-prod.yml`)

**Usage**: GitHub UI > Actions > Sync Database DEV → PROD

**Options disponibles**:
- **sync_mode**: 
  - `full`: Synchronisation complète
  - `tools`: Outils uniquement
  - `categories`: Catégories uniquement  
  - `translations`: Traductions uniquement
  - `selective`: Tables personnalisées
- **dry_run**: Prévisualisation sans modifications
- **preserve_analytics**: Conserver les stats de production
- **backup_before_sync**: Backup automatique

**Exemple**:
```bash
# Mode tools avec dry run
sync_mode: tools
dry_run: true
preserve_analytics: true
backup_before_sync: true
```

### 3. Sync PROD → DEV (`sync-from-prod.yml`)

**Usage**: Récupération des données de production

**Options disponibles**:
- **sync_mode**:
  - `content_only`: Contenu sans analytics (recommandé)
  - `full`: Synchronisation complète avec analytics
  - `analytics_only`: Analytics uniquement
  - `tools_only`: Outils uniquement
  - `selective`: Sélection personnalisée
- **preserve_dev_data**: Conserver certaines données DEV

### 4. Sync programmé (`scheduled-sync.yml`)

**Programmation automatique**:
- **Daily** (2h00 UTC): Sync légère DEV → PROD
- **Weekly** (Dimanche 4h00 UTC): Sync bidirectionnelle complète

**Contrôle manuel**: Possibilité de déclencher emergency sync

---

## 🔄 Synchronisation des bases de données

### Scripts disponibles

```bash
# Analyse des différences
npm run sync:analyze

# Synchronisation DEV → PROD
npm run sync:to-prod -- --mode=tools --dry-run

# Synchronisation PROD → DEV  
npm run sync:from-prod -- --mode=content_only --dry-run

# Interface interactive
npm run sync:dashboard
```

### Modes de synchronisation

#### DEV → PROD
- **full**: Tout synchroniser (⚠️ écrase analytics PROD)
- **tools**: Outils + traductions outils
- **categories**: Catégories + traductions catégories
- **content_only**: Contenu sans analytics
- **selective**: Tables personnalisées

#### PROD → DEV
- **content_only**: Contenu sans analytics (recommandé)
- **full**: Tout avec analytics
- **analytics_only**: Seulement les stats (view_count, etc.)
- **tools_only**: Outils uniquement

### Stratégies de conflict resolution

```javascript
// Exemple: Merge intelligent des analytics
const finalViewCount = Math.max(
  prodTool.view_count || 0,
  devTool.view_count || 0
);
```

---

## 📊 Interface de contrôle

### Dashboard interactif

```bash
npm run sync:dashboard
```

Fonctionnalités:
- 📊 Analyse en temps réel des bases
- 🔄 Synchronisation guidée avec options
- 📈 Historique des synchronisations
- 🔍 Mode diagnostic avancé
- 📚 Aide contextuelle

### Commandes en ligne

```bash
# Analyse complète avec rapport
npm run sync:analyze -- --compare-all --output=report.json

# Sync dry-run avec mode spécifique
npm run sync:to-prod -- --mode=tools --dry-run --preserve-analytics

# Validation des bases
npm run validate:databases
```

---

## 🔧 Maintenance et monitoring

### Scripts de maintenance automatique

Le VPS est configuré avec:

```bash
# Backup quotidien (Cron 2h00)
/usr/local/bin/backup-video-ia.sh

# Monitoring (toutes les 5min)
/usr/local/bin/monitor-video-ia.sh
```

### Monitoring PM2

```bash
# Status des processus
pm2 status

# Logs en temps réel
pm2 logs video-ia-net

# Monitoring avancé
pm2 monit

# Restart si nécessaire
pm2 restart video-ia-net
```

### Health checks

L'application expose des endpoints de santé:

```bash
# Health check local
curl http://localhost:3000/api/tools?limit=1

# Health check production
curl https://www.video-ia.net/api/tools?limit=1
```

---

## 🆘 Troubleshooting

### Problèmes de synchronisation

#### Erreur: "Base de données inaccessible"
```bash
# Vérifier les connexions
npm run sync:analyze

# Test de connectivité manuel
PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -c "SELECT 1;"
```

#### Sync interrompue
```bash
# Vérifier les backups disponibles
ls -la backups/

# Restaurer si nécessaire
pg_restore -h HOST -U USER -d DB backup_file.dump
```

#### Différence importante entre bases
```bash
# Analyse détaillée
npm run sync:analyze -- --verbose --output=analysis.json

# Review manuelle du rapport
cat analysis.json | jq '.recommendations'
```

### Problèmes de déploiement

#### Build failed
```bash
# Vérifier les types localement
npm run type-check

# Build local
npm run build
```

#### PM2 ne redémarre pas
```bash
# SSH sur le VPS
ssh root@46.202.129.104

# Debug PM2
pm2 logs video-ia-net --lines 50
pm2 restart video-ia-net --update-env
```

#### Nginx 502 Bad Gateway
```bash
# Vérifier que l'app répond
curl http://localhost:3000

# Logs Nginx
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart nginx
pm2 restart video-ia-net
```

### Recovery procedures

#### Restauration complète
```bash
# 1. Arrêter l'application
pm2 stop video-ia-net

# 2. Restaurer la base depuis backup
pg_restore -h localhost -U video_ia_user -d video_ia_net backup_file.dump

# 3. Redémarrer
pm2 start video-ia-net
```

#### Rollback de déploiement
```bash
# Via GitHub Actions - Run deploy workflow avec:
# restart_only: true (pas de code update)

# Ou manuellement sur VPS:
cd /var/www/video-ia.net
git reset --hard HEAD~1
pm2 restart video-ia-net
```

---

## ⚙️ Configuration avancée

### Variables d'environnement complètes

#### Développement (.env.local)
```bash
DATABASE_URL=postgresql://video_ia_user:video123@localhost:5432/video_ia_net
NODE_ENV=development
```

#### Production (.env.production)
```bash
DATABASE_URL=postgresql://video_ia_user:Buzzerbeater23@localhost:5432/video_ia_net
NODE_ENV=production
NEXTAUTH_URL=https://www.video-ia.net
SECURE_COOKIES=true
```

### Optimisation PostgreSQL

```sql
-- Configuration appliquée automatiquement
shared_buffers = 512MB
effective_cache_size = 1GB
work_mem = 4MB
max_connections = 100
```

### Sécurité

- Firewall UFW configuré (ports 80, 443, 22, 5432)
- SSL automatique avec Let's Encrypt
- Headers de sécurité Nginx
- Connexions DB chiffrées
- Rotation automatique des logs

---

## 🎯 Workflows recommandés

### Développement quotidien
1. Développer en local sur WSL
2. Tester avec `npm run dev`
3. Commit sur une branche feature
4. Merge sur `main` → déploiement automatique

### Synchronisation hebdomadaire
1. `npm run sync:analyze` pour voir les différences
2. Sync PROD → DEV pour récupérer les analytics
3. Développer les nouvelles features
4. Sync DEV → PROD pour déployer le contenu

### Mise en production majeure
1. Backup manuel des deux bases
2. Tests complets en local
3. Sync en mode dry-run
4. Déploiement avec surveillance
5. Validation post-déploiement

---

## 📞 Support et ressources

### Commandes de diagnostic rapide

```bash
# Statut complet du système
npm run sync:dashboard

# Rapport détaillé
npm run validate:databases

# Test de toutes les connexions
npm run sync:analyze -- --verbose
```

### Logs importants

```bash
# Application
pm2 logs video-ia-net

# Système  
tail -f /var/log/video-ia-monitor.log

# Nginx
sudo tail -f /var/log/nginx/access.log

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

---

**🎉 Votre système de déploiement CI/CD est maintenant opérationnel !**

Pour toute question ou problème, référez-vous à cette documentation ou utilisez l'interface interactive `npm run sync:dashboard`.