# 🚀 Guide de Déploiement PostgreSQL pour Video-IA.net

## Vue d'ensemble

Ce guide vous accompagne pour migrer de Supabase vers PostgreSQL sur votre VPS Ubuntu, offrant un contrôle total et 0€ de coût.

## 📋 Prérequis

- VPS Ubuntu (20.04, 22.04, ou 24.04)
- Node.js 18+ et npm
- Accès root ou sudo
- Fichier CSV avec vos 16,827 outils IA

## 🎯 Déploiement Automatique (Recommandé)

### Option 1: Script de déploiement complet

```bash
# Rendre le script exécutable
chmod +x scripts/deploy-postgresql.sh

# Lancer le déploiement complet
./scripts/deploy-postgresql.sh
```

Le script automatise toutes les étapes :
1. ✅ Vérification des prérequis
2. ✅ Installation des dépendances
3. ✅ Installation PostgreSQL (si nécessaire)
4. ✅ Configuration des variables d'environnement
5. ✅ Création des tables
6. ✅ Migration des données CSV
7. ✅ Tests de connexion

### Option 2: Commandes npm

```bash
# Déploiement complet
npm run deploy:postgresql

# Ou étape par étape
npm run db:setup-postgresql    # Installation PostgreSQL
npm run db:configure           # Configuration variables
npm run db:create-tables       # Création tables
npm run migrate:csv           # Migration données
npm run db:test               # Test connexion
```

## 🔧 Déploiement Manuel

### Étape 1: Installation PostgreSQL

```bash
# Rendre le script exécutable
chmod +x scripts/setup-vps-database.sh

# Installer PostgreSQL
./scripts/setup-vps-database.sh
```

### Étape 2: Configuration des Variables d'Environnement

```bash
# Configurer les variables
./scripts/setup-env.sh
```

Le script vous demandera :
- **Host**: `localhost` (par défaut)
- **Port**: `5432` (par défaut)
- **Database**: `video_ia_net` (par défaut)
- **User**: `video_ia_user` (par défaut)
- **Password**: (à saisir)

### Étape 3: Création des Tables

```bash
# Créer les tables
PGPASSWORD='votre_mot_de_passe' psql -h localhost -p 5432 -U video_ia_user -d video_ia_net -f scripts/create-tables.sql
```

### Étape 4: Migration des Données

```bash
# Placer votre fichier CSV dans data/
cp votre_fichier.csv data/ai_tools.csv

# Migrer les données
npm run migrate:csv
```

### Étape 5: Test de Connexion

```bash
# Tester la connexion
npm run db:test
```

## 📊 Structure de la Base de Données

### Tables Créées

1. **`ai_tools`** - Outils IA (16,827 enregistrements)
   - `id`, `tool_name`, `tool_category`, `tool_link`
   - `overview`, `tool_description`, `target_audience`
   - `key_features`, `use_cases`, `tags`
   - `image_url`, `slug`, `is_active`, `featured`
   - `quality_score`, `view_count`, `click_count`, `favorite_count`
   - `created_at`, `updated_at`, `last_checked_at`

2. **`categories`** - Catégories d'outils
   - `id`, `name`, `slug`, `description`
   - `icon_name`, `tool_count`, `is_featured`

3. **`tags`** - Tags pour les outils
   - `id`, `name`, `slug`, `usage_count`

4. **`tool_tags`** - Liaison many-to-many outils-tags

### Index et Optimisations

- Index sur `slug`, `category`, `featured`, `active`
- Index sur `quality_score` (DESC) pour le tri
- Triggers automatiques pour `updated_at`
- Compteurs automatiques par catégorie

## 🔍 Vérification et Tests

### Test de Connexion Directe

```bash
# Connexion directe à PostgreSQL
PGPASSWORD='votre_mot_de_passe' psql -h localhost -p 5432 -U video_ia_user -d video_ia_net

# Requêtes de test
SELECT COUNT(*) FROM ai_tools;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM tags;
```

### Test de l'Application

```bash
# Démarrer l'application
npm run dev

# Tester les endpoints API
curl http://localhost:3000/api/tools
curl http://localhost:3000/api/categories
```

## 🛠️ Commandes Utiles

### Gestion PostgreSQL

```bash
# Redémarrer PostgreSQL
sudo systemctl restart postgresql

# Voir les logs
sudo journalctl -u postgresql -f

# Statut du service
sudo systemctl status postgresql
```

### Base de Données

```bash
# Sauvegarde
pg_dump -h localhost -U video_ia_user video_ia_net > backup.sql

# Restauration
psql -h localhost -U video_ia_user video_ia_net < backup.sql

# Statistiques
psql -h localhost -U video_ia_user video_ia_net -c "SELECT COUNT(*) FROM ai_tools;"
```

### Application

```bash
# Test de connexion
npm run db:test

# Migration des données
npm run migrate:csv

# Redémarrage complet
npm run deploy:postgresql
```

## 🔧 Configuration Avancée

### Variables d'Environnement

```bash
# .env.local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=video_ia_net
DB_USER=video_ia_user
DB_PASSWORD=votre_mot_de_passe
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Configuration PostgreSQL

```bash
# Éditer la configuration
sudo nano /etc/postgresql/*/main/postgresql.conf

# Paramètres recommandés
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
```

## 🚨 Dépannage

### Erreurs Communes

1. **Connexion refusée**
   ```bash
   # Vérifier que PostgreSQL tourne
   sudo systemctl status postgresql
   
   # Vérifier la configuration
   sudo nano /etc/postgresql/*/main/pg_hba.conf
   ```

2. **Mot de passe incorrect**
   ```bash
   # Réinitialiser le mot de passe
   sudo -u postgres psql
   ALTER USER video_ia_user PASSWORD 'nouveau_mot_de_passe';
   ```

3. **Tables non créées**
   ```bash
   # Recréer les tables
   npm run db:create-tables
   ```

4. **Migration échouée**
   ```bash
   # Vérifier le fichier CSV
   head -5 data/*.csv
   
   # Relancer la migration
   npm run migrate:csv
   ```

## 📈 Monitoring

### Statistiques de Base

```sql
-- Nombre d'outils par catégorie
SELECT tool_category, COUNT(*) as count 
FROM ai_tools 
GROUP BY tool_category 
ORDER BY count DESC;

-- Outils les plus populaires
SELECT tool_name, view_count, click_count 
FROM ai_tools 
ORDER BY view_count DESC 
LIMIT 10;

-- Tags les plus utilisés
SELECT name, usage_count 
FROM tags 
ORDER BY usage_count DESC 
LIMIT 20;
```

### Logs et Monitoring

```bash
# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log

# Logs application
npm run dev 2>&1 | tee app.log
```

## 🎉 Félicitations !

Votre base de données PostgreSQL est maintenant opérationnelle avec :
- ✅ 16,827 outils IA importés
- ✅ Catégories et tags organisés
- ✅ Index optimisés pour les performances
- ✅ Triggers automatiques
- ✅ API endpoints fonctionnels

**Prochaines étapes :**
1. Tester l'interface utilisateur
2. Optimiser les performances
3. Configurer les sauvegardes automatiques
4. Déployer en production

---

*Guide créé pour Video-IA.net - Migration Supabase → PostgreSQL* 