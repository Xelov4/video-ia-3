# 🔄 Guide de Configuration Synchronisation WSL ↔ VPS

Guide complet pour mettre en place la synchronisation bidirectionnelle entre votre environnement de développement WSL et le VPS de production.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Configuration initiale](#configuration-initiale)
4. [Scripts de synchronisation](#scripts-de-synchronisation)
5. [GitHub Actions](#github-actions)
6. [Utilisation quotidienne](#utilisation-quotidienne)
7. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

### Architecture de synchronisation
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WSL (DEV)     │◄──►│    GitHub       │◄──►│   VPS (PROD)    │
│ localhost:5432  │    │   Repository    │    │46.202.129.104   │
│ video_ia_user   │    │                 │    │ video_ia_user   │
│ password:       │    │ Actions CI/CD   │    │ password:       │
│ video123        │    │                 │    │ Buzzerbeater23  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                    ┌─────────────────┐
                    │ Synchronisation │
                    │ Bidirectionnelle│
                    │   - Code Git    │
                    │ - Base données  │
                    │   - Assets      │
                    └─────────────────┘
```

### Types de synchronisation disponibles
- **🔄 dev-to-prod**: WSL → VPS (déploiement)
- **🔄 prod-to-dev**: VPS → WSL (récupération analytics)
- **🔄 full-sync**: Synchronisation complète bidirectionnelle
- **📦 quick-deploy**: Déploiement rapide code + DB

---

## ✅ Prérequis

### Sur WSL (Environnement de développement)
```bash
# Vérifier Node.js
node --version  # >= 18.0.0

# Vérifier PostgreSQL
psql --version  # >= 12.0

# Vérifier Git
git --version   # >= 2.30

# Installer sshpass si nécessaire
sudo apt-get install sshpass

# Vérifier la connexion à votre DB locale
PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -c "SELECT COUNT(*) FROM tools;"
```

### Sur le VPS (Production)
```bash
# SSH vers le VPS pour vérifier
ssh root@46.202.129.104

# Vérifier les services
systemctl status postgresql
systemctl status nginx
pm2 status

# Vérifier la base de données
PGPASSWORD=Buzzerbeater23 psql -h localhost -U video_ia_user -d video_ia_net -c "SELECT COUNT(*) FROM tools;"
```

---

## 🔧 Configuration initiale

### 1. Configuration des variables d'environnement

Créer le fichier `.env.sync` :
```bash
# Dans le répertoire racine du projet
cat > .env.sync << 'EOF'
# Development Database
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
DEV_DB_NAME=video_ia_net
DEV_DB_USER=video_ia_user
DEV_DB_PASSWORD=video123

# Production Database
PROD_DB_HOST=46.202.129.104
PROD_DB_PORT=5432
PROD_DB_NAME=video_ia_net
PROD_DB_USER=video_ia_user
PROD_DB_PASSWORD=Buzzerbeater23

# VPS Access
VPS_HOST=46.202.129.104
VPS_USER=root
VPS_PASSWORD=Buzzerbeater23
EOF
```

### 2. Configuration GitHub Secrets

Dans votre repository GitHub (Settings > Secrets and Variables > Actions) :

```bash
# Secrets requis
VPS_PASSWORD=Buzzerbeater23
PROD_DB_PASSWORD=Buzzerbeater23
```

### 3. Test de connectivité

```bash
# Test de toutes les connexions
npm run sync:analyze
```

---

## 📜 Scripts de synchronisation

### Script principal : Synchronisation bidirectionnelle
```bash
# Synchronisation DEV → PROD (déploiement)
npm run sync:dev-to-prod

# Synchronisation PROD → DEV (récupération données)
npm run sync:prod-to-dev

# Synchronisation complète bidirectionnelle
npm run sync:full

# Modes avancés
node scripts/deploy/sync-bidirectional.js --mode=dev-to-prod --dry-run
node scripts/deploy/sync-bidirectional.js --mode=prod-to-dev --skip-git
```

### Script de déploiement rapide
```bash
# Déploiement complet (code + DB)
npm run deploy:quick

# Déploiement code seulement
./scripts/deploy/quick-deploy.sh --skip-db

# Preview des actions (dry run)
./scripts/deploy/quick-deploy.sh --dry-run

# Déploiement sans rebuild
./scripts/deploy/quick-deploy.sh --skip-build
```

### Scripts existants améliorés
```bash
# Synchronisation DB DEV → PROD
npm run sync:to-prod -- --mode=tools --dry-run

# Synchronisation DB PROD → DEV
npm run sync:from-prod -- --mode=analytics-only

# Analyse des différences entre bases
npm run sync:analyze -- --verbose

# Dashboard interactif
npm run sync:dashboard
```

---

## ⚙️ GitHub Actions

### 1. Déploiement automatique (`.github/workflows/deploy-to-vps.yml`)

**Déclenchement :**
- Push sur `main` (automatique)
- Manuel via GitHub UI

**Options disponibles :**
- `deployment_type`: full, code-only, db-only, restart-only
- `skip_backup`: Ignorer la création de backup
- `dry_run`: Preview sans modifications

**Usage manuel :**
1. Aller sur GitHub > Actions
2. Sélectionner "🚀 Deploy to VPS"
3. Cliquer "Run workflow"
4. Choisir les options et "Run workflow"

### 2. Synchronisation DB (`.github/workflows/sync-databases.yml`)

**Déclenchement :**
- Manuel via GitHub UI
- Programmé quotidiennement à 02:00 UTC

**Options disponibles :**
- `sync_direction`: dev-to-prod, prod-to-dev, bidirectional
- `sync_mode`: full, content-only, tools-only, categories-only, analytics-only
- `dry_run`: Preview seulement
- `preserve_analytics`: Préserver les analytics de production

**Usage :**
1. GitHub > Actions > "🔄 Database Synchronization"
2. "Run workflow"
3. Configurer les options
4. "Run workflow"

---

## 🔄 Utilisation quotidienne

### Workflow de développement recommandé

#### 1. Développement local
```bash
# 1. Développer en local
npm run dev

# 2. Tester vos changements
npm run type-check
npm run test:database

# 3. Commiter vos changements
git add .
git commit -m "feat: nouvelles fonctionnalités"
```

#### 2. Déploiement rapide
```bash
# Option A: Déploiement automatique complet
npm run deploy:quick

# Option B: Déploiement via GitHub Actions
git push origin main  # Déclenche le déploiement automatique
```

#### 3. Récupération des analytics production
```bash
# Récupérer les stats de production vers développement
npm run sync:prod-to-dev

# Ou seulement les analytics
node scripts/deploy/sync-bidirectional.js --mode=prod-to-dev --skip-git
```

### Workflows spécialisés

#### Mise à jour de contenu important
```bash
# 1. Backup des deux environnements
npm run sync:analyze  # Voir les différences

# 2. Synchronisation avec backup
npm run sync:dev-to-prod  # Auto-backup inclus

# 3. Validation
curl -s https://www.video-ia.net/api/tools?limit=5 | jq '.'
```

#### Récupération d'urgence
```bash
# Si problème sur DEV, récupérer depuis PROD
npm run sync:prod-to-dev

# Ou plus sélectif
node scripts/deploy/sync-bidirectional.js --mode=prod-to-dev --skip-git --backup
```

---

## 🧪 Tests et validation

### Tests de connectivité
```bash
# Test complet des connexions
npm run sync:analyze

# Test endpoint DEV
curl -s http://localhost:3000/api/tools?limit=1

# Test endpoint PROD
curl -s https://www.video-ia.net/api/tools?limit=1
```

### Validation des données
```bash
# Comparer les bases de données
npm run validate:databases

# Voir les différences détaillées
npm run sync:analyze -- --compare-all --verbose --output=analysis.json
```

### Tests de déploiement
```bash
# Test complet du déploiement en dry run
./scripts/deploy/quick-deploy.sh --dry-run

# Test de l'infrastructure VPS
npm run test:deployment
```

---

## 🚨 Dépannage

### Problèmes de connectivité

#### Connexion DB échoue
```bash
# Test manuel des connexions
PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -c "SELECT 1;"
PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -c "SELECT 1;"

# Vérifier les ports
netstat -tulnp | grep 5432
```

#### SSH vers VPS échoue
```bash
# Test manuel SSH
sshpass -p "Buzzerbeater23" ssh -o ConnectTimeout=10 root@46.202.129.104 "echo 'OK'"

# Vérifier la connectivité
ping 46.202.129.104
nc -zv 46.202.129.104 22
```

### Problèmes de synchronisation

#### Synchronisation DB interrompue
```bash
# Vérifier l'état des transactions
npm run sync:analyze -- --check-locks

# Restaurer depuis backup si nécessaire
BACKUP_FILE=$(ls -1t backups/sync/backup_prod_*.sql | head -1)
PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -f "$BACKUP_FILE"
```

#### Différences importantes entre bases
```bash
# Analyse détaillée
npm run sync:analyze -- --verbose --output=diff-report.json

# Voir le rapport
cat diff-report.json | jq '.recommendations'

# Sync selective si nécessaire
node scripts/deploy/sync-bidirectional.js --mode=dev-to-prod --tables="tools,categories"
```

### Problèmes de déploiement

#### Application ne redémarre pas sur VPS
```bash
# SSH sur VPS et debug
ssh root@46.202.129.104

# Vérifier PM2
pm2 status
pm2 logs video-ia-net --lines 50

# Restart manuel si nécessaire
pm2 restart video-ia-net
```

#### Build échoue
```bash
# Test build local
npm run build

# Vérifier les types
npm run type-check

# Nettoyer et réessayer
rm -rf .next node_modules
npm ci
npm run build
```

---

## 📊 Monitoring et logs

### Logs disponibles
```bash
# Logs de synchronisation
ls -la logs/sync-report-*.json

# Logs PM2 sur VPS
ssh root@46.202.129.104 'pm2 logs video-ia-net --lines 100'

# Logs système VPS
ssh root@46.202.129.104 'tail -f /var/log/video-ia-monitor.log'
```

### Métriques importantes
```bash
# Stats des bases de données
npm run sync:analyze -- --stats-only

# Performance des endpoints
curl -w "@curl-format.txt" -o /dev/null -s https://www.video-ia.net/api/tools?limit=1
```

---

## ⚡ Commandes rapides

### Setup one-time
```bash
# Configuration complète du VPS
npm run deploy:vps-setup

# Premier déploiement
npm run deploy:migrate-initial
```

### Usage quotidien
```bash
# Déploiement rapide
npm run deploy:quick

# Récupération analytics
npm run sync:prod-to-dev

# Vérification état
npm run sync:analyze
```

### Debug
```bash
# Logs détaillés
npm run sync:dashboard

# Test connectivité
npm run validate:databases

# Backup manuel
node scripts/deploy/sync-bidirectional.js --mode=dev-to-prod --dry-run
```

---

## 🎯 Bonnes pratiques

### Avant chaque déploiement
1. ✅ Tester localement avec `npm run dev`
2. ✅ Vérifier les types avec `npm run type-check`
3. ✅ Commiter tous les changements
4. ✅ Analyser les différences avec `npm run sync:analyze`

### Synchronisation de données
1. 🔄 Préférer `dev-to-prod` pour le contenu
2. 🔄 Utiliser `prod-to-dev` pour récupérer les analytics
3. 🔄 Toujours créer des backups pour les opérations importantes
4. 🔄 Utiliser `dry-run` pour prévisualiser les changements

### Sécurité
1. 🔐 Ne jamais commiter les mots de passe
2. 🔐 Utiliser GitHub Secrets pour les credentials
3. 🔐 Vérifier les backups avant les opérations destructives
4. 🔐 Monitorer les logs après chaque déploiement

---

**🎉 Votre système de synchronisation est maintenant opérationnel !**

Pour toute question, référez-vous à ce guide ou utilisez les commandes de debug disponibles.