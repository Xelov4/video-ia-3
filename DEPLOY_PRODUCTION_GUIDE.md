# 🚀 Guide de Déploiement Production - video-ia.net

Guide complet pour déployer le site en production avec SSL, Nginx, et tout opérationnel.

---

## ⚡ Déploiement Express (1 commande)

**Pour déployer complètement le site :**

```bash
npm run deploy:production
```

Cette commande unique va :
- ✅ Configurer le VPS (Node.js, PostgreSQL, PM2, Nginx)
- ✅ Cloner et builder l'application
- ✅ Migrer la base de données
- ✅ Configurer SSL avec Let's Encrypt
- ✅ Démarrer l'application
- ✅ Configurer le firewall
- ✅ Rendre le site accessible sur https://www.video-ia.net

---

## 📋 Prérequis

### 1. Configuration DNS
**IMPORTANT :** Avant de lancer le déploiement, configurez votre DNS :

```
Type A: www.video-ia.net → 46.202.129.104
Type A: video-ia.net     → 46.202.129.104
```

### 2. Accès VPS
- **IP :** 46.202.129.104
- **User :** root  
- **Password :** Buzzerbeater23

### 3. Environnement Local
```bash
# Vérifier que sshpass est installé
sudo apt-get install sshpass

# Être dans le répertoire du projet
cd /root/video-ia.net
```

---

## 🔧 Déploiement Étape par Étape

### Option 1 : Déploiement Automatique Complet
```bash
# Déploiement complet en une commande
npm run deploy:production
```

Le script vous guidera à travers chaque étape :
1. **Vérification connectivité** VPS
2. **Installation système** (Node.js, PostgreSQL, PM2, Nginx)
3. **Clone et configuration** de l'application
4. **Build** de l'application Next.js
5. **Migration** de la base de données
6. **Configuration Nginx** avec proxy
7. **Installation SSL** (Let's Encrypt)
8. **Démarrage** avec PM2
9. **Configuration firewall** UFW
10. **Tests finaux** de validation

### Option 2 : Déploiement Manuel

#### Étape 1 : Configurer le VPS
```bash
# Se connecter au VPS
ssh root@46.202.129.104

# Exécuter le script de setup
curl -sL https://raw.githubusercontent.com/Xelov4/video-ia-3/main/scripts/deploy/deploy-production-complete.sh | bash
```

#### Étape 2 : Vérification Post-Déploiement
```bash
# Vérifier les services
systemctl status nginx
systemctl status postgresql
pm2 status

# Tester l'application
curl http://localhost:3000/api/tools?limit=1
curl https://www.video-ia.net/api/tools?limit=1
```

---

## 🌐 Configuration DNS Detaillée

### Enregistrements DNS Requis
```dns
# Domaine principal
www.video-ia.net.    300    IN    A    46.202.129.104
video-ia.net.        300    IN    A    46.202.129.104

# Optionnel : Sous-domaines
api.video-ia.net.    300    IN    A    46.202.129.104
admin.video-ia.net.  300    IN    A    46.202.129.104
```

### Vérification DNS
```bash
# Vérifier la propagation DNS
nslookup www.video-ia.net
nslookup video-ia.net

# Ou avec dig
dig www.video-ia.net +short
dig video-ia.net +short
```

**⚠️ IMPORTANT :** Attendez que le DNS soit propagé avant la configuration SSL !

---

## 🔒 Configuration SSL Automatique

Le script configure automatiquement SSL avec Let's Encrypt :

### Certificats Générés
- **www.video-ia.net**
- **video-ia.net**

### Renouvellement Automatique
```bash
# Le renouvellement est automatique, mais pour tester :
certbot renew --dry-run
```

### Configuration Nginx SSL
```nginx
# Configuration automatique par Certbot
server {
    listen 443 ssl http2;
    server_name www.video-ia.net video-ia.net;
    
    ssl_certificate /etc/letsencrypt/live/www.video-ia.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.video-ia.net/privkey.pem;
    
    # Proxy vers l'application Node.js
    location / {
        proxy_pass http://localhost:3000;
        # ... headers et configuration
    }
}
```

---

## 🗄️ Configuration Base de Données

### Base de Données Créée
```yaml
Database: video_ia_net
User: video_ia_user  
Password: Buzzerbeater23
Host: localhost
Port: 5432
```

### Migration des Données
Le script migre automatiquement :
- ✅ **16K+ outils** depuis votre DB locale
- ✅ **50+ catégories**
- ✅ **Traductions** (7 langues)
- ✅ **Structure complète**

### Vérification DB
```bash
# Se connecter à la DB
PGPASSWORD=Buzzerbeater23 psql -h localhost -U video_ia_user -d video_ia_net

# Vérifier les données
SELECT COUNT(*) FROM tools;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM tool_translations;
```

---

## ⚙️ Configuration Application

### Variables d'Environnement Production
```env
# Fichier .env.production créé automatiquement
DATABASE_URL=postgresql://video_ia_user:Buzzerbeater23@localhost:5432/video_ia_net
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://www.video-ia.net
NEXTAUTH_SECRET=[généré automatiquement]
NEXT_TELEMETRY_DISABLED=1
SECURE_COOKIES=true
LOG_LEVEL=info
ENABLE_ANALYTICS=true
```

### Configuration PM2
```javascript
// ecosystem.config.js utilisé pour PM2
{
  name: 'video-ia-net',
  script: 'node_modules/next/dist/bin/next',
  args: 'start',
  instances: 'max',
  exec_mode: 'cluster',
  env: { NODE_ENV: 'production', PORT: 3000 }
}
```

---

## 🔥 Firewall et Sécurité

### Ports Autorisés
```bash
# Configuration UFW automatique
22/tcp   (SSH)
80/tcp   (HTTP - redirect vers HTTPS)
443/tcp  (HTTPS)
```

### Headers de Sécurité
```nginx
# Configuration Nginx automatique
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

---

## 🧪 Tests et Validation

### Tests Automatiques Inclus
Le script teste automatiquement :
- ✅ **Connectivité SSH** vers le VPS
- ✅ **Services** (Nginx, PostgreSQL, PM2)
- ✅ **Application locale** (http://localhost:3000)
- ✅ **HTTPS externe** (https://www.video-ia.net)
- ✅ **Base de données** (connexion et données)
- ✅ **APIs** (endpoints principaux)

### Tests Manuels Post-Déploiement
```bash
# Test complet du site
curl -I https://www.video-ia.net
curl -s https://www.video-ia.net/api/tools?limit=5 | jq '.'

# Test performance
curl -w "@curl-format.txt" -o /dev/null -s https://www.video-ia.net

# Test SSL
openssl s_client -connect www.video-ia.net:443 -servername www.video-ia.net
```

---

## 🔧 Maintenance et Monitoring

### Commandes Utiles
```bash
# Status des services
ssh root@46.202.129.104 'systemctl status nginx postgresql'
ssh root@46.202.129.104 'pm2 status'

# Logs en temps réel
ssh root@46.202.129.104 'pm2 logs video-ia-net'
ssh root@46.202.129.104 'tail -f /var/log/nginx/access.log'

# Restart application
ssh root@46.202.129.104 'pm2 restart video-ia-net'

# Restart Nginx
ssh root@46.202.129.104 'systemctl restart nginx'
```

### Monitoring Automatique
```bash
# Le script installe des checks automatiques
# Vérification toutes les 5 minutes via cron
# Logs dans /var/log/video-ia-monitor.log
```

---

## 🚨 Dépannage

### Problèmes Courants

#### 1. DNS Non Propagé
```bash
# Erreur: SSL fail, domain not reachable
# Solution: Attendre propagation DNS (24-48h max)

# Vérifier DNS
dig www.video-ia.net +short
nslookup www.video-ia.net
```

#### 2. Application Ne Répond Pas
```bash
# Vérifier PM2
ssh root@46.202.129.104 'pm2 status'
ssh root@46.202.129.104 'pm2 restart video-ia-net'

# Vérifier logs
ssh root@46.202.129.104 'pm2 logs video-ia-net --lines 50'
```

#### 3. Erreur Base de Données
```bash
# Tester connexion DB
PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -c "SELECT 1;"

# Re-migrer si nécessaire
npm run sync:to-prod
```

#### 4. SSL Expired/Invalid
```bash
# Renouveler SSL
ssh root@46.202.129.104 'certbot renew'
ssh root@46.202.129.104 'systemctl restart nginx'
```

### Restauration Complète
```bash
# En cas de problème majeur
ssh root@46.202.129.104

# Restart tout
systemctl restart postgresql nginx
pm2 restart all

# Ou redéploiement complet
npm run deploy:production
```

---

## 📊 Checklist Post-Déploiement

### ✅ Validation Complète
- [ ] **DNS configuré** et propagé
- [ ] **Site accessible** via https://www.video-ia.net
- [ ] **Redirect HTTP → HTTPS** fonctionnel
- [ ] **SSL valide** (cadenas vert)
- [ ] **API endpoints** répondent correctement
- [ ] **Base de données** peuplée (16K+ outils)
- [ ] **Recherche** fonctionne
- [ ] **Navigation multilingue** opérationnelle
- [ ] **Admin panel** accessible (si configuré)
- [ ] **Performance** satisfaisante (<2s loading)

### 🎯 URLs à Tester
- https://www.video-ia.net (homepage)
- https://www.video-ia.net/fr (français)
- https://www.video-ia.net/api/tools?limit=5 (API)
- https://www.video-ia.net/fr/categories (catégories)
- https://www.video-ia.net/fr/tools (outils)

---

## 🎉 Résumé Final

Après un déploiement réussi, vous aurez :

### 🌐 **Site Web Production**
- **URL :** https://www.video-ia.net
- **SSL :** Let's Encrypt (renouvellement auto)
- **Performance :** Clustering PM2 + Nginx
- **Sécurité :** Headers sécurisés + Firewall

### 🗄️ **Base de Données**
- **16,827 outils** en 7 langues
- **50+ catégories** traduites
- **PostgreSQL** optimisé
- **Backups** automatiques

### ⚙️ **Infrastructure**
- **VPS Ubuntu** configuré
- **Node.js 18** + Next.js 14
- **Nginx** reverse proxy
- **PM2** clustering
- **UFW** firewall

### 🔄 **Synchronisation**
- **GitHub Actions** CI/CD
- **Sync bidirectionnelle** WSL ↔ VPS
- **Déploiements** automatiques
- **Monitoring** intégré

---

**🚀 Commande de déploiement :**
```bash
npm run deploy:production
```

**🎯 Résultat :** Site complet en ligne à https://www.video-ia.net**