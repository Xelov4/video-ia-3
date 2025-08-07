# 🚀 GitHub Actions Déploiement - video-ia.net

Documentation des workflows GitHub Actions pour le déploiement et la synchronisation automatique.

---

## 📁 Workflows disponibles

### 1. 🚀 [Deploy to Production](../.github/workflows/deploy.yml)

**Déclenchement**:
- Push automatique sur `main`
- Déclenchement manuel via GitHub UI

**Options manuelles**:
- `skip_build`: Déployer sans rebuild
- `restart_only`: Redémarrage PM2 seulement

**Étapes**:
1. Checkout du code
2. Setup Node.js + cache npm
3. Installation des dépendances
4. Type checking
5. Build de l'application
6. Déploiement SSH sur VPS
7. Restart PM2 avec health check
8. Notification du statut

### 2. 🔄 [Sync Database DEV → PROD](../.github/workflows/sync-to-prod.yml)

**Usage**: Manual via GitHub Actions UI

**Paramètres**:
```yaml
sync_mode: 'full' | 'tools' | 'categories' | 'translations' | 'selective'
tables_to_sync: 'tools,categories,tool_translations,category_translations'
dry_run: true | false
preserve_analytics: true | false
backup_before_sync: true | false
```

**Étapes**:
1. Validation des connexions DB
2. Comptage des enregistrements
3. Vérifications de sécurité
4. Backup de production (optionnel)
5. Exécution de la synchronisation
6. Validation post-sync

### 3. 📥 [Sync Database PROD → DEV](../.github/workflows/sync-from-prod.yml)

**Usage**: Récupération des données de production

**Paramètres**:
```yaml
sync_mode: 'content_only' | 'full' | 'tools_only' | 'categories_only' | 'translations_only' | 'selective'
preserve_dev_data: true | false
```

**Spécialités**:
- Merge intelligent des analytics
- Préservation des données DEV spécifiques
- Mode `content_only` recommandé

### 4. 📅 [Scheduled Database Sync](../.github/workflows/scheduled-sync.yml)

**Programmation automatique**:
- **Daily**: 2h00 UTC - Sync légère DEV → PROD
- **Weekly**: Dimanche 4h00 UTC - Sync bidirectionnelle complète
- **Emergency**: Déclenchement manuel avec validation renforcée

**Types de sync**:
- `daily`: Sync incrémentale du contenu
- `weekly`: Sync complète avec backups
- `emergency`: Validation et backup complets

---

## 🔧 Configuration requise

### GitHub Secrets

Configurez ces secrets dans **Settings > Secrets and Variables > Actions**:

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

# Development Database
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
DEV_DB_NAME=video_ia_net
DEV_DB_USER=video_ia_user
DEV_DB_PASSWORD=video123
```

### Variables d'environnement VPS

Le fichier `.env.production` sur le VPS doit contenir:

```bash
DATABASE_URL=postgresql://video_ia_user:Buzzerbeater23@localhost:5432/video_ia_net
NODE_ENV=production
NEXTAUTH_URL=https://www.video-ia.net
```

---

## 🎯 Usage des workflows

### Déploiement automatique

**Push sur main**:
```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
# → Déploiement automatique déclenché
```

**Déploiement manuel**:
1. Aller dans **Actions** > **Deploy to Production**
2. Cliquer sur **Run workflow**
3. Choisir les options si nécessaire
4. Lancer avec **Run workflow**

### Synchronisation manuelle

**DEV → PROD** (déployer du contenu):
1. **Actions** > **Sync Database DEV → PROD**
2. Configurer les paramètres:
   - Mode: `tools` pour les nouveaux outils
   - Dry run: `true` pour tester d'abord
   - Preserve analytics: `true`
3. Vérifier les résultats dans les logs

**PROD → DEV** (récupérer les analytics):
1. **Actions** > **Sync Database PROD → DEV**
2. Mode recommandé: `content_only`
3. Preserve dev data: `true`

### Surveillance des syncs programmés

Les syncs automatiques s'exécutent selon la planification. Surveillance via:
- **Actions** tab pour voir l'historique
- **Summary** de chaque run pour les statistiques
- Notifications par email en cas d'échec

---

## 📊 Monitoring et logs

### Informations disponibles

Chaque workflow fournit:
- **Summary**: Statistiques de la synchronisation
- **Logs détaillés**: Pour chaque étape
- **Artifacts**: Rapports de sync (si générés)

### Exemples de summary

```markdown
## 🔄 Database Sync Summary
- **Direction**: DEV → PROD
- **Mode**: tools
- **Dry Run**: false
- **Status**: success
- **DEV Tools**: 16,765
- **PROD Tools (before)**: 16,234
- **Time**: 2024-01-15T10:30:00Z
```

### Surveillance des erreurs

En cas d'échec:
1. Consulter les logs détaillés du workflow
2. Vérifier la connectivité aux bases de données
3. Utiliser les scripts locaux pour diagnostiquer:
   ```bash
   npm run sync:analyze
   npm run validate:databases
   ```

---

## 🔒 Sécurité et bonnes pratiques

### Validation automatique

Tous les workflows incluent:
- Validation des connexions DB
- Comptage des enregistrements pré/post
- Vérification de l'intégrité des données
- Rollback automatique en cas d'erreur

### Backups automatiques

- Backup de production avant sync importante
- Conservation des backups pendant 7 jours
- Possibilité de restauration manuelle

### Stratégies de sync sûres

```yaml
# Recommandé pour la production
sync_mode: 'tools'           # Spécifique
dry_run: true                # Test d'abord
preserve_analytics: true     # Garde les stats
backup_before_sync: true     # Sécurité
```

---

## 🆘 Dépannage

### Workflow échoue

1. **Vérifier les secrets GitHub**: Tous les secrets sont-ils configurés ?
2. **Connectivité VPS**: Le VPS répond-il sur SSH ?
3. **Base de données**: Les connexions DB sont-elles valides ?

### Base de données inaccessible

```bash
# Test local
PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -c "SELECT 1;"

# Via workflow (check logs)
# La validation des connexions échoue-t-elle ?
```

### Synchronisation interrompue

1. Les **backups automatiques** sont dans `/var/backups/video-ia-net/`
2. Utiliser les **scripts locaux** pour diagnostiquer:
   ```bash
   npm run sync:analyze -- --verbose
   ```
3. **Restaurer** si nécessaire depuis backup

### PM2 ne redémarre pas

SSH sur le VPS et diagnostiquer:
```bash
pm2 status
pm2 logs video-ia-net --lines 50
pm2 restart video-ia-net --update-env
```

---

## 🚀 Workflows personnalisés

### Créer un nouveau workflow

1. Créer `.github/workflows/my-workflow.yml`
2. Utiliser les scripts existants:
   ```yaml
   - name: Custom Sync
     run: |
       npm ci
       npm run sync:to-prod -- --mode=selective --tables="tools" --dry-run
   ```

### Déclencher un workflow depuis un autre

```yaml
- name: Trigger Deployment
  uses: benc-uk/workflow-dispatch@v1
  with:
    workflow: Deploy to Production
    token: ${{ secrets.GITHUB_TOKEN }}
    inputs: '{"skip_build": "true"}'
```

---

## 📈 Statistiques et performance

### Métriques surveillées

- **Temps de déploiement**: Généralement < 2 minutes
- **Taille des syncs**: Enregistrements traités par seconde
- **Taux de succès**: Pourcentage de workflows réussis
- **Fréquence**: Déploiements par jour/semaine

### Optimisations possibles

- **Cache npm**: Activé dans tous les workflows
- **Parallel jobs**: Utilisé pour les validations multiples  
- **Incremental sync**: Mode intelligent pour les grosses bases

---

**✅ Votre système CI/CD est maintenant opérationnel avec GitHub Actions !**

Pour une utilisation complète, consultez le [guide de déploiement complet](../DEPLOYMENT_CI_CD_GUIDE.md).