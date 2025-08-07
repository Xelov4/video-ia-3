# 🚀 Déploiement Complet video-ia.net - Guide A à Z

**Guide complet pour déployer video-ia.net en production avec CI/CD automatique**

---

## 📋 Prérequis

- ✅ VPS Ubuntu avec IP : **46.202.129.104**
- ✅ Domaine configuré : **www.video-ia.net** pointant vers l'IP
- ✅ Accès SSH root au VPS
- ✅ Repository GitHub avec le code
- ✅ Base de données locale fonctionnelle (16K+ outils)

---

## 🎯 Résultat Final

Après ce guide, vous aurez :
- ✅ Site accessible sur https://www.video-ia.net
- ✅ Base de données migrée (16K+ outils)
- ✅ SSL automatique (Let's Encrypt)
- ✅ PM2 + Nginx en production
- ✅ GitHub Actions pour déploiement automatique
- ✅ Synchronisation bidirectionnelle DEV ↔ PROD

---

## 🚀 ÉTAPE 1 : Configuration GitHub Secrets (5 min)

### 1.1 Accéder aux GitHub Secrets

1. Allez sur votre repository GitHub
2. **Settings** > **Secrets and Variables** > **Actions**
3. Cliquez sur **New repository secret**

### 1.2 Ajouter les secrets suivants

```bash
# Accès VPS
VPS_HOST=46.202.129.104
VPS_USER=root
VPS_PASSWORD=Buzzerbeater23

# Base de données Production
PROD_DATABASE_URL=postgresql://video_ia_user:Buzzerbeater23@localhost:5432/video_ia_net
PROD_DB_HOST=localhost
PROD_DB_PORT=5432
PROD_DB_NAME=video_ia_net
PROD_DB_USER=video_ia_user
PROD_DB_PASSWORD=Buzzerbeater23

# Base de données Développement (pour sync)
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
DEV_DB_NAME=video_ia_net
DEV_DB_USER=video_ia_user
DEV_DB_PASSWORD=video123
```

**⚠️ Important** : Ajoutez chaque secret individuellement avec le nom exact et la valeur correspondante.

---

## 🏗️ ÉTAPE 2 : Setup Automatique du VPS (10 min)

### 2.1 Connexion SSH au VPS

```bash
ssh root@46.202.129.104
```

### 2.2 Script de Déploiement Automatique

Exécutez ce script complet sur votre VPS :

```bash
#!/bin/bash
set -e

echo "🚀 DÉPLOIEMENT AUTOMATIQUE VIDEO-IA.NET"
echo "========================================"

# Variables (MODIFIEZ LE REPO URL)
REPO_URL="https://github.com/VOTRE_USERNAME/video-ia.net.git"
DOMAIN="www.video-ia.net"
DB_USER="video_ia_user"
DB_PASS="Buzzerbeater23"
DB_NAME="video_ia_net"

echo "📦 1. Installation des dépendances système..."
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs postgresql postgresql-contrib nginx certbot python3-certbot-nginx git curl

echo "🔧 2. Installation PM2..."
npm install -g pm2

echo "🐘 3. Configuration PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
\\q
EOF

echo "📁 4. Clone du repository..."
cd /var/www
if [ -d "video-ia.net" ]; then
    cd video-ia.net && git pull
else
    git clone $REPO_URL video-ia.net && cd video-ia.net
fi

echo "📦 5. Installation dépendances Node.js..."
npm ci --production

echo "⚙️ 6. Configuration environnement..."
cat > .env.production << EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXT_TELEMETRY_DISABLED=1
SECURE_COOKIES=true
EOF

echo "🏗️ 7. Build de l'application..."
npm run build

echo "🚀 8. Configuration PM2..."
pm2 delete video-ia-net 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd

echo "🌐 9. Configuration Nginx..."
cat > /etc/nginx/sites-available/video-ia.net << 'NGINXEOF'
server {
    listen 80;
    server_name www.video-ia.net video-ia.net;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
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
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "🔒 10. Configuration firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

echo "✅ SETUP VPS TERMINÉ!"
echo "🌐 Test: curl http://localhost:3000"
curl -s http://localhost:3000 > /dev/null && echo "✅ Application répond" || echo "❌ Problème application"

echo ""
echo "📍 PROCHAINES ÉTAPES:"
echo "1. Migrer la base de données depuis votre machine locale"
echo "2. Configurer SSL avec certbot"
echo "3. Tester l'accès depuis l'extérieur"
```

### 2.3 Copier-Coller et Exécuter

1. **Modifiez le REPO_URL** dans le script avec votre vraie URL GitHub
2. Copiez tout le script ci-dessus
3. Collez-le dans votre terminal SSH sur le VPS
4. Appuyez sur Entrée et attendez la fin

---

## 💾 ÉTAPE 3 : Migration de la Base de Données (10 min)

### 3.1 Depuis Votre Machine Locale (WSL)

```bash
# Naviguer vers le projet
cd /root/video-ia.net

# Exécuter la migration automatique
npm run deploy:migrate-initial
```

**Ce script va :**
- ✅ Exporter votre base locale (16K+ outils)
- ✅ La transférer sur le VPS  
- ✅ L'importer en production
- ✅ Valider que tout est OK

### 3.2 Vérification de la Migration

```bash
# Test depuis votre machine locale
curl https://www.video-ia.net/api/tools?limit=5

# Ou depuis le VPS
ssh root@46.202.129.104
curl http://localhost:3000/api/tools?limit=5
```

**Résultat attendu :** JSON avec vos outils

---

## 🔒 ÉTAPE 4 : Configuration SSL (5 min)

### 4.1 Sur le VPS

```bash
# Vérifier que le DNS fonctionne
dig www.video-ia.net
nslookup www.video-ia.net

# Configuration SSL automatique
certbot --nginx -d www.video-ia.net -d video-ia.net --non-interactive --agree-tos --email VOTRE_EMAIL@domaine.com
```

### 4.2 Test HTTPS

```bash
# Test depuis le VPS
curl https://www.video-ia.net/api/tools?limit=1

# Test depuis votre navigateur
# Ouvrez : https://www.video-ia.net
```

**✅ Votre site est maintenant en ligne !**

---

## ⚙️ ÉTAPE 5 : Configuration GitHub Actions (Déjà fait)

Les workflows sont déjà créés dans `.github/workflows/` :

- ✅ **deploy.yml** : Déploiement automatique sur push `main`
- ✅ **sync-to-prod.yml** : Sync DEV → PROD manuel  
- ✅ **sync-from-prod.yml** : Sync PROD → DEV manuel
- ✅ **scheduled-sync.yml** : Synchronisation programmée

### 5.1 Test du Déploiement Automatique

```bash
# Sur votre machine locale
echo "# Test deploy" >> README.md
git add .
git commit -m "test: deploy automatique"
git push origin main
```

**GitHub Actions va automatiquement :**
1. Builder l'application
2. La déployer sur le VPS
3. Redémarrer PM2
4. Faire un health check

---

## 🔄 ÉTAPE 6 : Synchronisation des Bases (Usage quotidien)

### 6.1 Interface Interactive

```bash
# Depuis votre machine locale
npm run sync:dashboard
```

**Menu interactif :**
```
╔════════════════════════════════════════════════════════════╗
║              📊 VIDEO-IA.NET SYNC DASHBOARD               ║
╠════════════════════════════════════════════════════════════╣
║  Gestion intelligente de la synchronisation des données   ║
╚════════════════════════════════════════════════════════════╝

1️⃣  📊 Analyser les bases de données
2️⃣  🔄 Synchroniser DEV → PROD  
3️⃣  📥 Synchroniser PROD → DEV
4️⃣  📈 Afficher l'historique des syncs
```

### 6.2 Synchronisation via GitHub Actions

#### DEV → PROD (Déployer du nouveau contenu)
1. **GitHub** > **Actions** > **Sync Database DEV → PROD**
2. **Run workflow**
3. Choisir les options :
   - Mode : `tools` (pour nouveaux outils)
   - Dry run : `true` (test d'abord)
   - Preserve analytics : `true`

#### PROD → DEV (Récupérer les analytics)
1. **GitHub** > **Actions** > **Sync Database PROD → DEV**  
2. **Run workflow**
3. Mode : `content_only` (recommandé)

### 6.3 Synchronisation Automatique

- **Quotidienne** (2h00 UTC) : Sync légère DEV → PROD
- **Hebdomadaire** (Dimanche 4h00 UTC) : Sync complète bidirectionnelle

---

## 📊 ÉTAPE 7 : Tests et Validation

### 7.1 Test Complet du Système

```bash
# Depuis votre machine locale
npm run test:deployment
```

**Ce test vérifie :**
- ✅ Connectivité aux bases de données
- ✅ Scripts de synchronisation  
- ✅ Processus de build
- ✅ Connectivité VPS
- ✅ Configuration serveur
- ✅ Performance et sécurité

### 7.2 Vérifications Manuelles

#### Site Web
```bash
# Page d'accueil
curl https://www.video-ia.net

# API Tools
curl https://www.video-ia.net/api/tools?limit=5

# Page outil spécifique
curl https://www.video-ia.net/en/tools/chatgpt
```

#### Services
```bash
# Sur le VPS
ssh root@46.202.129.104

# Status des services
pm2 status
systemctl status nginx
systemctl status postgresql

# Logs
pm2 logs video-ia-net --lines 20
```

---

## 🎯 ÉTAPE 8 : Workflow de Développement

### 8.1 Développement Quotidien

```bash
# 1. Développer en local
npm run dev

# 2. Tester vos changements
npm run type-check
npm run build

# 3. Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
# → Déploiement automatique !
```

### 8.2 Gestion des Données

#### Ajouter du Nouveau Contenu (DEV → PROD)
```bash
# 1. Ajouter du contenu en local
# 2. Analyser les différences
npm run sync:analyze

# 3. Synchroniser (via GitHub Actions ou local)
npm run sync:to-prod -- --mode=tools --dry-run
npm run sync:to-prod -- --mode=tools  # Après validation
```

#### Récupérer les Analytics (PROD → DEV)
```bash
# Hebdomadaire pour récupérer les analytics de production
npm run sync:from-prod -- --mode=content_only
```

---

## 🔧 ÉTAPE 9 : Maintenance et Monitoring

### 9.1 Commandes Utiles

#### Sur votre machine locale
```bash
# Interface de gestion
npm run sync:dashboard

# Analyse rapide des bases
npm run sync:analyze

# Tests complets
npm run test:deployment

# Validation des bases
npm run validate:databases
```

#### Sur le VPS
```bash
# Status des services
pm2 status
systemctl status nginx postgresql

# Logs
pm2 logs video-ia-net
tail -f /var/log/nginx/error.log

# Restart si nécessaire
pm2 restart video-ia-net
systemctl restart nginx
```

### 9.2 Backups Automatiques

Le système crée automatiquement :
- **Backups quotidiens** de la base de données (cron 2h00)
- **Backups avant sync** importantes
- **Logs rotatifs** PM2

Localisation : `/var/backups/video-ia-net/`

### 9.3 Surveillance

#### Health Checks Automatiques
- **GitHub Actions** : Health check après chaque déploiement
- **PM2** : Restart automatique si crash
- **Cron monitoring** : Vérification toutes les 5 minutes

#### Métriques à Surveiller
```bash
# Utilisation disque
df -h

# Utilisation mémoire  
free -h

# Status PostgreSQL
PGPASSWORD=Buzzerbeater23 psql -h localhost -U video_ia_user -d video_ia_net -c "SELECT COUNT(*) FROM tools;"

# Performance web
curl -w "@curl-format.txt" -o /dev/null https://www.video-ia.net/api/tools?limit=1
```

---

## 🆘 ÉTAPE 10 : Troubleshooting

### 10.1 Site Inaccessible

```bash
# 1. Vérifier les services
ssh root@46.202.129.104
pm2 status                    # Application
systemctl status nginx        # Serveur web
systemctl status postgresql   # Base de données

# 2. Restart si nécessaire
pm2 restart video-ia-net
systemctl restart nginx

# 3. Vérifier les logs
pm2 logs video-ia-net --lines 50
tail -f /var/log/nginx/error.log
```

### 10.2 Problèmes de Synchronisation

```bash
# 1. Tester la connectivité
npm run sync:analyze

# 2. Vérifier les connexions DB
PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -c "SELECT 1;"
PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -c "SELECT 1;"

# 3. Sync en mode debug
npm run sync:to-prod -- --mode=tools --dry-run --verbose
```

### 10.3 Problèmes GitHub Actions

1. **Vérifier les secrets** : Settings > Secrets > Actions
2. **Consulter les logs** : Actions > Workflow failed > Détails
3. **Tester en local** : `npm run test:deployment`

### 10.4 Restauration d'Urgence

#### Base de Données
```bash
# Lister les backups disponibles
ls -la /var/backups/video-ia-net/

# Restaurer depuis backup
PGPASSWORD=Buzzerbeater23 pg_restore -h localhost -U video_ia_user -d video_ia_net backup_file.dump
```

#### Application
```bash
# Rollback de code
cd /var/www/video-ia.net
git reset --hard HEAD~1
npm run build
pm2 restart video-ia-net
```

---

## ✅ CHECKLIST FINALE

### Déploiement Initial
- [ ] GitHub Secrets configurés
- [ ] VPS setup avec le script automatique  
- [ ] Base de données migrée (16K+ outils)
- [ ] SSL configuré (https://www.video-ia.net)
- [ ] Tests de validation réussis
- [ ] GitHub Actions fonctionnels

### Tests de Validation
- [ ] Site accessible : https://www.video-ia.net
- [ ] API répond : https://www.video-ia.net/api/tools?limit=5
- [ ] Page outil : https://www.video-ia.net/en/tools/chatgpt
- [ ] Déploiement auto fonctionne (push sur main)
- [ ] Synchronisation DEV ↔ PROD testée

### Monitoring
- [ ] PM2 status : `pm2 status`
- [ ] Nginx status : `systemctl status nginx`
- [ ] PostgreSQL status : `systemctl status postgresql`
- [ ] Logs sans erreurs : `pm2 logs video-ia-net`
- [ ] Backups automatiques configurés

---

## 🎉 FÉLICITATIONS !

**Votre système est maintenant complètement opérationnel !**

🌐 **Site live** : https://www.video-ia.net  
🚀 **Déploiement automatique** : Push sur `main`  
🔄 **Sync bidirectionnelle** : Interface interactive  
📊 **16K+ outils** : Base de données complète  
🔒 **SSL automatique** : Let's Encrypt  
🛡️ **Production ready** : PM2 + Nginx + PostgreSQL  

### Ressources Utiles
- 📚 [Guide complet](../DEPLOYMENT_CI_CD_GUIDE.md)
- ⚡ [Quick Start](../QUICK_START_DEPLOYMENT.md)
- 🔧 [GitHub Actions](../.github/DEPLOYMENT_README.md)
- 📊 Interface interactive : `npm run sync:dashboard`

**Votre plateforme video-ia.net est maintenant prête à accueillir vos utilisateurs !** 🚀