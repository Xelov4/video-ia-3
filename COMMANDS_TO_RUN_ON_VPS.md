# 🚀 Commandes à Exécuter sur le VPS

Copiez-collez ces commandes une par une sur votre VPS.

## 1. Installation des dépendances système

```bash
# Mise à jour et installation Node.js 18
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs postgresql postgresql-contrib nginx certbot python3-certbot-nginx git
npm install -g pm2
```

## 2. Configuration PostgreSQL

```bash
# Démarrage PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Configuration utilisateur et base
sudo -u postgres psql << 'EOF'
CREATE USER video_ia_user WITH PASSWORD 'Buzzerbeater23';
CREATE DATABASE video_ia_net OWNER video_ia_user;
GRANT ALL PRIVILEGES ON DATABASE video_ia_net TO video_ia_user;
\c video_ia_net
GRANT ALL ON SCHEMA public TO video_ia_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO video_ia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO video_ia_user;
\q
EOF
```

## 3. Clone et setup de l'application

```bash
# Clone du repository (CHANGEZ L'URL)
cd /var/www
git clone https://github.com/VOTRE_USERNAME/video-ia.net.git
cd video-ia.net

# Installation et build
npm ci --production
npm run build
```

## 4. Configuration environnement

```bash
# Création du fichier .env.production
cat > .env.production << 'EOF'
DATABASE_URL=postgresql://video_ia_user:Buzzerbeater23@localhost:5432/video_ia_net
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://www.video-ia.net
NEXT_TELEMETRY_DISABLED=1
EOF
```

## 5. Démarrage avec PM2

```bash
# Démarrage de l'application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd
```

## 6. Configuration Nginx

```bash
# Configuration du site
cat > /etc/nginx/sites-available/video-ia.net << 'EOF'
server {
    listen 80;
    server_name www.video-ia.net video-ia.net;
    
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
}
EOF

# Activation du site
ln -sf /etc/nginx/sites-available/video-ia.net /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## 7. Tests

```bash
# Vérification que tout fonctionne
pm2 status
curl http://localhost:3000
```

## 8. SSL (après vérification DNS)

```bash
# Configuration Let's Encrypt
certbot --nginx -d www.video-ia.net -d video-ia.net
```

## 9. Migration de la base (depuis votre machine locale)

Sur votre machine locale (pas sur le VPS) :

```bash
npm run deploy:migrate-initial
```