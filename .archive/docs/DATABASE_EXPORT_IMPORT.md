# 📊 Système d'Export/Import de Base de Données

## 🎯 Vue d'ensemble

Ce système permet d'exporter et d'importer facilement les données de la base de données Video-IA.net. Il est conçu pour être réutilisable et sécurisé, avec des options de validation et de gestion des conflits.

## 🚀 Utilisation Rapide

### Export de la base de données
```bash
# Export complet
node scripts/database-manager.js export

# Backup avec description
node scripts/database-manager.js backup "avant-mise-a-jour"
```

### Import de données
```bash
# Import en mode upsert (recommandé)
node scripts/database-manager.js import database-export-2025-08-06.json upsert

# Import en mode remplacement complet
node scripts/database-manager.js import database-export-2025-08-06.json replace
```

## 📋 Commandes Disponibles

### 📤 Export/Import
- `export` - Créer un export complet de la base de données
- `import <fichier> [mode]` - Importer des données
- `backup [description]` - Créer un backup avec description
- `restore <fichier> [mode]` - Restaurer depuis un backup

### 📋 Gestion
- `list` - Lister tous les exports disponibles
- `template` - Créer un template d'import vide
- `validate <fichier>` - Valider un fichier d'export
- `clean` - Nettoyer les anciens exports

### 📊 Informations
- `stats` - Afficher les statistiques de la base de données
- `help` - Afficher l'aide

## 🔧 Modes d'Import

### 1. **insert** (par défaut)
- Insère seulement les nouveaux enregistrements
- Ignore les enregistrements existants
- **Utilisation** : Ajout de nouvelles données sans écraser l'existant

### 2. **update**
- Met à jour seulement les enregistrements existants
- Ignore les nouveaux enregistrements
- **Utilisation** : Mise à jour de données existantes

### 3. **upsert** (recommandé)
- Insère les nouveaux enregistrements
- Met à jour les enregistrements existants
- **Utilisation** : Synchronisation complète des données

### 4. **replace**
- Supprime toutes les données existantes
- Insère les nouvelles données
- **Utilisation** : Remplacement complet (⚠️ destructif)

## 📁 Structure des Fichiers

### Export Complet
```json
{
  "metadata": {
    "exportDate": "2025-08-06T14:08:39.822Z",
    "version": "1.0",
    "databaseName": "video_ia_net",
    "tables": ["admin_activity_log", "admin_sessions", "admin_users", "categories", "tags", "tools"]
  },
  "data": {
    "tools": {
      "structure": [
        {
          "column": "id",
          "type": "integer",
          "nullable": false,
          "default": "nextval('tools_id_seq'::regclass)"
        }
      ],
      "records": [
        {
          "id": 1,
          "toolName": "Example Tool",
          "toolCategory": "AI",
          "isActive": true
        }
      ],
      "count": 16763
    }
  }
}
```

### Template d'Import
```json
{
  "metadata": {
    "importDate": "2025-08-06T14:08:39.822Z",
    "version": "1.0",
    "source": "database-export-template",
    "description": "Template pour l'import de données"
  },
  "importConfig": {
    "mode": "insert",
    "skipExisting": true,
    "validateData": true,
    "batchSize": 100
  },
  "data": {
    "tools": {
      "structure": [...],
      "records": [
        {
          "id": 0,
          "toolName": "",
          "toolCategory": "",
          "isActive": false
        }
      ],
      "count": 1
    }
  }
}
```

## 🔄 Workflow Typique

### 1. **Sauvegarde avant modification**
```bash
node scripts/database-manager.js backup "avant-ajout-nouveaux-outils"
```

### 2. **Préparation des données**
- Modifier le template d'import ou créer un nouveau fichier JSON
- Respecter la structure des tables
- Valider les données

### 3. **Import des données**
```bash
# Validation préalable
node scripts/database-manager.js validate mes-nouvelles-donnees.json

# Import en mode upsert
node scripts/database-manager.js import mes-nouvelles-donnees.json upsert
```

### 4. **Vérification**
```bash
# Vérifier les statistiques
node scripts/database-manager.js stats

# Lister les exports
node scripts/database-manager.js list
```

## 🛡️ Sécurité et Validation

### Validation Automatique
- Vérification de la structure des tables
- Validation des types de données
- Contrôle des contraintes de clés primaires

### Gestion des Erreurs
- Rollback automatique en cas d'erreur
- Logs détaillés des opérations
- Statistiques d'import/export

### Sauvegarde Automatique
- Création de backups avant import
- Conservation des 10 derniers exports
- Nettoyage automatique des anciens fichiers

## 📊 Exemples d'Utilisation

### Ajout de nouveaux outils
```bash
# 1. Sauvegarde
node scripts/database-manager.js backup "avant-ajout-outils"

# 2. Préparer le fichier d'import (voir template)
# 3. Importer
node scripts/database-manager.js import nouveaux-outils.json upsert

# 4. Vérifier
node scripts/database-manager.js stats
```

### Mise à jour de catégories
```bash
# 1. Exporter les données actuelles
node scripts/database-manager.js export

# 2. Modifier le fichier exporté
# 3. Importer les modifications
node scripts/database-manager.js import categories-modifiees.json update
```

### Migration complète
```bash
# 1. Backup complet
node scripts/database-manager.js backup "avant-migration"

# 2. Import complet
node scripts/database-manager.js import migration-complete.json replace

# 3. Vérification
node scripts/database-manager.js stats
```

## 🔧 Configuration Avancée

### Variables d'Environnement
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=video_ia_net
DB_USER=video_ia_user
DB_PASSWORD=video123
```

### Options d'Import
```javascript
const config = {
  mode: 'upsert',           // Mode d'import
  skipExisting: true,       // Ignorer les existants
  validateData: true,       // Validation des données
  batchSize: 100           // Taille des lots
};
```

## 📈 Statistiques Actuelles

D'après le dernier export :
- **Tables** : 6 (admin_activity_log, admin_sessions, admin_users, categories, tags, tools)
- **Enregistrements totaux** : 16,904
- **Taille d'export** : ~27 MB
- **Outils actifs** : 16,763
- **Catégories** : 140

## 🚨 Points d'Attention

### ⚠️ Mode Replace
- **Destructif** : Supprime toutes les données existantes
- **Utiliser avec précaution** : Toujours faire un backup avant
- **Vérification** : Contrôler les données avant import

### 🔒 Sécurité
- Ne jamais commiter les fichiers d'export avec des données sensibles
- Utiliser des variables d'environnement pour les credentials
- Valider les données avant import

### 📊 Performance
- Les gros exports sont traités par lots de 1000 enregistrements
- Utiliser le mode `upsert` pour les mises à jour fréquentes
- Nettoyer régulièrement les anciens exports

## 🆘 Dépannage

### Erreurs Courantes

**Connexion refusée**
```bash
# Vérifier les variables d'environnement
echo $DB_HOST $DB_PORT $DB_NAME
```

**Fichier d'import invalide**
```bash
# Valider le fichier
node scripts/database-manager.js validate mon-fichier.json
```

**Erreur de structure**
```bash
# Vérifier la structure avec le template
node scripts/database-manager.js template
```

### Logs et Debug
```bash
# Activer les logs détaillés
DEBUG=* node scripts/database-manager.js export

# Vérifier les statistiques
node scripts/database-manager.js stats
```

---

**💡 Conseil** : Utilisez toujours le mode `upsert` pour les mises à jour régulières et faites des backups avant chaque opération importante ! 