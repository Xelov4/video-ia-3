# 🚀 Guide de Déploiement Rapide - Video-IA.net

## ⚡ Déploiement Express (30 minutes)

### 1. Créer un Projet Supabase (5 min)

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte / Se connecter
3. **"New Project"**
   - Nom: `video-ia-net`
   - Région: `Europe West (Ireland)`
   - Database Password: **NOTER LE MOT DE PASSE** 
4. Attendre que le projet soit prêt (~3 min)

### 2. Configuration Locale (5 min)

```bash
# Cloner les dépendances
npm install

# Copier et configurer l'environnement
cp .env.example .env.local
```

**Éditer `.env.local`** avec les infos Supabase :
```env
# Aller dans Settings > API de votre projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Aller dans Settings > Database
DB_HOST=db.your-project.supabase.co
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password

# Optionnel (pour le scraper legacy)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Setup Base de Données (10 min)

```bash
# Setup automatique du schéma
npm run db:setup

# Migration des 16,827 outils CSV
npm run migrate:csv
```

**⏳ La migration prendra ~5-8 minutes**

### 4. Test Local (2 min)

```bash
# Lancer l'app localement
npm run dev
```

Visiter http://localhost:3000 → **Vous devriez voir les outils !**

### 5. Déploiement Vercel (8 min)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Questions Vercel:
# - Link to existing project? No
# - Project name: video-ia-net 
# - Directory: ./ (défaut)
# - Override settings? No
```

**Configuration Vercel** :
1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Cliquer sur votre projet `video-ia-net`
3. **Settings > Environment Variables**
4. Ajouter toutes les variables de `.env.local`
5. **Redeploy** le projet

---

## ✅ Checklist de Validation

### Base de Données
- [ ] Connexion Supabase OK
- [ ] Tables créées (ai_tools, categories, tags, tool_tags)
- [ ] 16,827 outils importés
- [ ] Catégories extraites (~50+)
- [ ] Tags extraits (~200+)

### API Endpoints
- [ ] `GET /api/tools` → Liste des outils
- [ ] `GET /api/tools/[slug]` → Détail d'un outil  
- [ ] `GET /api/categories` → Liste des catégories

### Tests Rapides
```bash
# Test API local
curl http://localhost:3000/api/tools?per_page=5

# Test API production
curl https://your-app.vercel.app/api/tools?per_page=5
```

---

## 🛠️ Commandes Utiles

```bash
# Reset complet de la DB
npm run db:reset

# Vérification des types
npm run type-check

# Build de production
npm run build

# Statistiques de migration
tail -f migration.log
```

---

## 📊 Monitoring Post-Déploiement

### Supabase Dashboard
- **Database > Tables** : Vérifier les compteurs
- **API > Logs** : Surveiller les requêtes
- **Auth > Users** : Gestion future des utilisateurs

### Vercel Dashboard  
- **Functions** : Performance des API routes
- **Analytics** : Trafic et performance
- **Speed Insights** : Core Web Vitals

---

## 🚨 Résolution de Problèmes

### Migration CSV Échoue
```bash
# Vérifier la connexion
psql "postgresql://postgres:password@db.project.supabase.co:5432/postgres" -c "SELECT version();"

# Reset et retry
npm run db:reset
```

### API Endpoints 500
- Vérifier les variables d'environnement Vercel
- Vérifier les logs dans Vercel Functions
- Tester la connexion Supabase

### Performance Lente
- Activer les index dans Supabase SQL Editor
- Vérifier la région Supabase (EU pour la France)
- Optimiser les requêtes dans les logs

---

## 🎯 Prochaines Étapes

Une fois le MVP déployé :

1. **Interface Utilisateur** : Créer les pages de listing
2. **Recherche** : Implémenter la recherche full-text
3. **SEO** : Générer les pages statiques
4. **Admin Panel** : Interface de gestion
5. **Performance** : Cache et optimisations

---

**🎉 Votre MVP est prêt ! Vous avez maintenant 16,827 outils IA disponibles via API.**