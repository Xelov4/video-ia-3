# ⚡ Quick Start Déploiement - video-ia.net

Guide rapide pour déployer video-ia.net en production avec CI/CD automatique.

---

## 🚀 Déploiement en 4 étapes (30 minutes)

### 1️⃣ Configuration GitHub Secrets (5 min)

Dans votre repo GitHub > **Settings** > **Secrets and Variables** > **Actions**, ajoutez:

```bash
VPS_HOST=46.202.129.104
VPS_USER=root
VPS_PASSWORD=Buzzerbeater23

PROD_DATABASE_URL=postgresql://video_ia_user:Buzzerbeater23@localhost:5432/video_ia_net
PROD_DB_HOST=localhost
PROD_DB_PASSWORD=Buzzerbeater23

DEV_DB_PASSWORD=video123
```

### 2️⃣ Setup VPS automatique (10 min)

```bash
# Rendre executable
chmod +x scripts/deploy/setup-vps-complete.sh

# Setup complet du VPS (Node.js, PostgreSQL, PM2, Nginx)
./scripts/deploy/setup-vps-complete.sh
```

### 3️⃣ Migration initiale des données (10 min)

```bash
# Migration one-shot: DEV → PROD
npm run deploy:migrate-initial
```

### 4️⃣ Déploiement et test (5 min)

```bash
# Push pour déclencher le déploiement automatique
git add .
git commit -m "feat: setup production deployment"
git push origin main

# Ou déploiement manuel via GitHub Actions UI
```

**✅ C'est tout ! Votre site est maintenant live sur https://www.video-ia.net**

---

## 🔄 Usage quotidien

### Déploiement automatique
- **Push sur `main`** → Déploiement automatique
- **Health check** automatique post-déploiement
- **PM2 restart** avec zero-downtime

### Synchronisation des données

```bash
# Interface interactive complète
npm run sync:dashboard

# Commandes rapides
npm run sync:analyze              # Analyser les différences
npm run sync:to-prod -- --dry-run # Sync DEV → PROD (test)
npm run sync:from-prod            # Sync PROD → DEV
```

### Monitoring

```bash
# Status des services
pm2 status

# Logs en temps réel  
pm2 logs video-ia-net

# Health check
curl https://www.video-ia.net/api/tools?limit=1
```

---

## 📱 Interface de contrôle

### Dashboard interactif

```bash
npm run sync:dashboard
```

```
╔════════════════════════════════════════════════════════════╗
║              📊 VIDEO-IA.NET SYNC DASHBOARD               ║
╠════════════════════════════════════════════════════════════╣
║  Gestion intelligente de la synchronisation des données   ║
╚════════════════════════════════════════════════════════════╝

🎯 OPTIONS DISPONIBLES:

1️⃣  📊 Analyser les bases de données
2️⃣  🔄 Synchroniser DEV → PROD
3️⃣  📥 Synchroniser PROD → DEV
4️⃣  📈 Afficher l'historique des syncs
5️⃣  🔍 Mode diagnostic avancé
```

---

## 🎯 Workflows GitHub Actions

### 1. Déploiement automatique
- **Trigger**: Push sur `main` ou manuel
- **Actions**: Build → Deploy → Restart PM2 → Health Check

### 2. Sync DEV → PROD
- **Trigger**: Manuel via GitHub UI
- **Options**: Mode (full/tools/categories), dry-run, backup
- **Sécurité**: Validation pré/post sync

### 3. Sync PROD → DEV
- **Trigger**: Manuel via GitHub UI
- **Smart merge**: Préserve les analytics DEV + contenu PROD
- **Mode recommandé**: `content_only`

### 4. Sync programmé
- **Daily** (2h00 UTC): Sync légère DEV → PROD
- **Weekly** (Dimanche 4h00): Sync bidirectionnelle complète

---

## 🔧 Configuration avancée

### Variables d'environnement

#### Développement
```bash
DATABASE_URL=postgresql://video_ia_user:video123@localhost:5432/video_ia_net
NODE_ENV=development
```

#### Production (sur VPS)
```bash
DATABASE_URL=postgresql://video_ia_user:Buzzerbeater23@localhost:5432/video_ia_net
NODE_ENV=production
NEXTAUTH_URL=https://www.video-ia.net
```

### SSL automatique

```bash
# Après vérification du DNS
sudo certbot --nginx -d www.video-ia.net -d video-ia.net
```

---

## 🆘 Troubleshooting rapide

### Problème de déploiement
```bash
# Vérifier les logs GitHub Actions
# Ou restart manuel:
ssh root@46.202.129.104
pm2 restart video-ia-net
```

### Base de données
```bash
# Test de connexion
npm run sync:analyze

# Backup d'urgence
pg_dump postgresql://video_ia_user:Buzzerbeater23@46.202.129.104:5432/video_ia_net > backup.sql
```

### Application inaccessible
```bash
# Health check
curl https://www.video-ia.net/api/tools?limit=1

# Restart services
ssh root@46.202.129.104 "pm2 restart video-ia-net && sudo systemctl restart nginx"
```

---

## 📊 Architecture finale

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   DEV (WSL)     │    │  GitHub Actions │    │   PROD (VPS)     │
│   localhost     │◄──►│                 │◄──►│  46.202.129.104  │
│                 │    │  - Deploy       │    │                  │
│  16K+ tools     │    │  - Sync DEV→PROD│    │   16K+ tools     │
│  324MB DB       │    │  - Sync PROD→DEV│    │   324MB DB       │
│  Next.js dev    │    │  - Scheduled    │    │   PM2 + Nginx    │
└─────────────────┘    └─────────────────┘    └──────────────────┘
                                ▲
                                │
                    📊 Interactive Dashboard
                      npm run sync:dashboard
```

---

## ✅ Checklist finale

- [ ] VPS configuré avec tous les services
- [ ] GitHub Secrets configurés
- [ ] Base de données migrée (16K+ outils)
- [ ] SSL configuré pour https://www.video-ia.net
- [ ] Déploiement automatique fonctionnel
- [ ] Synchronisation bidirectionnelle testée
- [ ] Monitoring et backups actifs

---

## 🎉 Prochaines étapes

1. **Tester le déploiement**: Push un petit changement et vérifier le déploiement automatique
2. **Configurer SSL**: `sudo certbot --nginx -d www.video-ia.net`
3. **Planifier les syncs**: Utiliser les syncs programmés ou manuels selon besoins
4. **Monitoring**: Configurer alertes email/Slack pour les erreurs

**🌐 Votre site est maintenant live avec CI/CD complet !**

Pour plus de détails, consultez [DEPLOYMENT_CI_CD_GUIDE.md](DEPLOYMENT_CI_CD_GUIDE.md)