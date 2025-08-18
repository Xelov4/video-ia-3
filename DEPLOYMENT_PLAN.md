# 🚀 PLAN DE DÉPLOIEMENT PRODUCTION - VIDEO-IA.NET

## 📋 OVERVIEW

Ce plan détaille le déploiement complet de Video-IA.net sur un VPS Ubuntu depuis zéro.

**Architecture:**
- **Local:** Branche `dev` pour développement
- **Production:** Branche `main` sur VPS Ubuntu
- **Auto-deploy:** GitHub Actions sur merge dev → main

---

## 🎯 PHASE 1: PRÉPARATION VPS UBUNTU

### 1.1 Setup système de base

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation des dépendances essentielles
sudo apt install -y curl wget git unzip software-properties-common

# Création utilisateur application (sécurité)
sudo adduser videoai
sudo usermod -aG sudo videoai
sudo su - videoai
```

### 1.2 Installation Node.js 18+

```bash
# Installation Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification
node --version  # doit être v18+
npm --version

# Installation PM2 (process manager)
sudo npm install -g pm2
```

### 1.3 Installation PostgreSQL

```bash
# Installation PostgreSQL 14+
sudo apt install -y postgresql postgresql-contrib

# Démarrage et activation
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configuration PostgreSQL
sudo -u postgres psql

-- Dans psql:
CREATE USER video_ia_user WITH PASSWORD 'VOTRE_PASSWORD_SECURISE';
CREATE DATABASE video_ia_net OWNER video_ia_user;
GRANT ALL PRIVILEGES ON DATABASE video_ia_net TO video_ia_user;
\q
```

### 1.4 Installation Nginx

```bash
# Installation Nginx
sudo apt install -y nginx

# Démarrage et activation
sudo systemctl start nginx
sudo systemctl enable nginx

# Test
curl localhost  # doit afficher page Nginx par défaut
```

---

## 🎯 PHASE 2: CONFIGURATION APPLICATION

### 2.1 Clone du repository

```bash
# Cloner le projet (branche main)
cd /home/videoai
git clone https://github.com/VOTRE_USERNAME/video-ia.net.git
cd video-ia.net

# Vérifier qu'on est sur main
git branch

# Si pas sur main:
git checkout main
```

### 2.2 Installation des dépendances

```bash
# Installation packages Node.js
npm install --production

# Installation globale de TypeScript si nécessaire
sudo npm install -g typescript tsx

# Installation Prisma CLI
sudo npm install -g prisma
```

### 2.3 Configuration des variables d'environnement

```bash
# Créer le fichier .env
nano .env
```

**Contenu .env production:**
```env
# Database
DATABASE_URL="postgresql://video_ia_user:VOTRE_PASSWORD_SECURISE@localhost:5432/video_ia_net?schema=public"

# API Keys (à récupérer de votre dev local)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://video-ia.net

# Security
NEXTAUTH_SECRET=generate_a_secure_random_string_here
NEXTAUTH_URL=https://video-ia.net
```

### 2.4 Setup base de données

```bash
# Génération du client Prisma
npx prisma generate

# Application des migrations
npx prisma db push

# Import des données depuis votre dev local
# (nous ferons ça séparément avec un dump SQL)
```

---

## 🎯 PHASE 3: MIGRATION DONNÉES

### 3.1 Export depuis dev local

**Sur votre machine locale:**

```bash
# Export complet de la DB
PGPASSWORD=video123 pg_dump -h localhost -U video_ia_user -d video_ia_net > video_ia_backup.sql

# Transfer vers VPS (via SCP)
scp video_ia_backup.sql videoai@VOTRE_VPS_IP:/home/videoai/video-ia.net/
```

### 3.2 Import sur production

**Sur le VPS:**

```bash
# Import des données
cd /home/videoai/video-ia.net
PGPASSWORD=VOTRE_PASSWORD_SECURISE psql -h localhost -U video_ia_user -d video_ia_net < video_ia_backup.sql

# Vérification
PGPASSWORD=VOTRE_PASSWORD_SECURISE psql -h localhost -U video_ia_user -d video_ia_net -c "SELECT COUNT(*) FROM tools;"
```

---

## 🎯 PHASE 4: BUILD ET DÉMARRAGE APPLICATION

### 4.1 Build production

```bash
# Build Next.js pour production
npm run build

# Vérification du build
ls -la .next/
```

### 4.2 Configuration PM2

```bash
# Créer fichier PM2 config
nano ecosystem.config.js
```

**Contenu ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'video-ia-net',
    script: 'npm',
    args: 'start',
    cwd: '/home/videoai/video-ia.net',
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
```

### 4.3 Démarrage avec PM2

```bash
# Démarrer l'application
pm2 start ecosystem.config.js

# Vérifier le statut
pm2 status

# Voir les logs
pm2 logs video-ia-net

# Sauvegarder la config PM2
pm2 save
pm2 startup
```

---

## 🎯 PHASE 5: CONFIGURATION NGINX ET SSL

### 5.1 Configuration Nginx

```bash
# Créer config Nginx
sudo nano /etc/nginx/sites-available/video-ia.net
```

**Contenu config Nginx:**
```nginx
server {
    listen 80;
    server_name video-ia.net www.video-ia.net;

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
    }

    # Serve static files directly
    location /_next/static/ {
        alias /home/videoai/video-ia.net/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /images/ {
        alias /home/videoai/video-ia.net/public/images/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

### 5.2 Activation du site

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/

# Supprimer le site par défaut
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5.3 Installation SSL avec Certbot

```bash
# Installation Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir certificat SSL
sudo certbot --nginx -d video-ia.net -d www.video-ia.net

# Test renouvellement automatique
sudo certbot renew --dry-run
```

---

## 🎯 PHASE 6: AUTO-DEPLOYMENT GITHUB ACTIONS

### 6.1 Setup SSH Keys

**Sur le VPS:**
```bash
# Générer clé SSH pour GitHub Actions
ssh-keygen -t rsa -b 4096 -C "deploy@video-ia.net"
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/id_rsa  # Copier cette clé privée
```

### 6.2 Configuration GitHub Actions

**Dans votre repo GitHub, créer: `.github/workflows/deploy.yml`**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /home/videoai/video-ia.net
          git pull origin main
          npm install --production
          npm run build
          pm2 restart video-ia-net
          pm2 save
```

### 6.3 Secrets GitHub

**Dans GitHub → Settings → Secrets and variables → Actions:**
- `VPS_HOST`: IP de votre VPS
- `VPS_USER`: videoai
- `VPS_SSH_KEY`: Clé privée SSH générée sur le VPS

---

## 🎯 PHASE 7: MONITORING ET MAINTENANCE

### 7.1 Scripts de monitoring

```bash
# Créer script de health check
nano /home/videoai/health-check.sh
```

**Contenu health-check.sh:**
```bash
#!/bin/bash
# Health check script

echo "=== VIDEO-IA.NET HEALTH CHECK ==="
echo "Date: $(date)"
echo ""

# Check application
echo "📱 Application Status:"
pm2 list | grep video-ia-net

echo ""
echo "🗄️ Database Status:"
PGPASSWORD=VOTRE_PASSWORD_SECURISE psql -h localhost -U video_ia_user -d video_ia_net -c "SELECT COUNT(*) as tools_count FROM tools;" 2>/dev/null || echo "❌ Database connection failed"

echo ""
echo "🌐 Nginx Status:"
sudo systemctl is-active nginx

echo ""
echo "💾 Disk Usage:"
df -h /

echo ""
echo "🧠 Memory Usage:"
free -h
```

### 7.2 Cron jobs

```bash
# Setup cron pour monitoring
crontab -e

# Ajouter ces lignes:
# Health check toutes les heures
0 * * * * /home/videoai/health-check.sh >> /var/log/video-ia-health.log 2>&1

# Backup DB quotidien
0 2 * * * PGPASSWORD=VOTRE_PASSWORD_SECURISE pg_dump -h localhost -U video_ia_user -d video_ia_net > /home/videoai/backups/backup-$(date +\%Y\%m\%d).sql
```

---

## 🎯 CHECKLIST FINAL

### ✅ Pré-déploiement
- [ ] VPS Ubuntu configuré
- [ ] Nom de domaine pointé vers VPS
- [ ] SSH access configuré
- [ ] Backup dev local créé

### ✅ Infrastructure
- [ ] Node.js 18+ installé
- [ ] PostgreSQL configuré
- [ ] Nginx installé et configuré
- [ ] PM2 installé
- [ ] SSL/HTTPS activé

### ✅ Application
- [ ] Code cloné (branche main)
- [ ] Dependencies installées
- [ ] .env configuré
- [ ] Database migrée
- [ ] Build réussi
- [ ] PM2 démarré

### ✅ Automation
- [ ] GitHub Actions configuré
- [ ] SSH keys en place
- [ ] Auto-deploy testé
- [ ] Monitoring en place

### ✅ Tests finaux
- [ ] Site accessible via HTTPS
- [ ] Base de données fonctionnelle
- [ ] API Gemini connectée
- [ ] Images uploadées
- [ ] Recherche fonctionnelle

---

## 🚨 COMMANDES D'URGENCE

```bash
# Restart complet
pm2 restart video-ia-net
sudo systemctl restart nginx

# Voir les logs
pm2 logs video-ia-net --lines 100
sudo tail -f /var/log/nginx/error.log

# Rollback si problème
git checkout HEAD~1
npm run build
pm2 restart video-ia-net

# Status système
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
```

---

**🎯 READY FOR PRODUCTION!**

Une fois ce plan exécuté, vous aurez:
- ✅ Site en production HTTPS
- ✅ Auto-deployment sur merge main
- ✅ Monitoring et backups
- ✅ Workflow dev → prod optimisé