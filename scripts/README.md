# Scripts d'Exportation de Base de Données

Ce dossier contient les scripts pour exporter toutes les données de votre base de données PostgreSQL pour utilisation dans d'autres projets.

## 📁 Fichiers Disponibles

- `export-database.js` - Script Node.js utilisant Prisma
- `export-database.py` - Script Python utilisant psycopg2
- `config-db.py` - Script de configuration pour détecter les paramètres de connexion
- `README.md` - Ce fichier

## 🚀 Utilisation Rapide

### 1. Configuration (Recommandé)

D'abord, configurez la connexion à votre base de données :

```bash
py scripts/config-db.py
```

Ce script va :
- Lire votre fichier `.env` pour détecter les paramètres
- Tester la connexion à la base de données
- Créer un fichier de configuration `db_config.json`

### 2. Exportation des Données

#### Avec Python (Recommandé)
```bash
# Export complet (JSON + SQL + CSV)
py scripts/export-database.py

# Export JSON seulement
py scripts/export-database.py --format json

# Export SQL seulement
py scripts/export-database.py --format sql

# Export CSV seulement
py scripts/export-database.py --format csv
```

#### Avec Node.js
```bash
# Export complet
node scripts/export-database.js
```

## 📊 Formats d'Export

### JSON
- Format structuré avec toutes les données
- Inclut les relations entre les tables
- Facile à utiliser dans d'autres projets JavaScript/Python

### SQL
- Instructions INSERT pour restaurer les données
- Compatible avec PostgreSQL
- Inclut la réinitialisation des séquences

### CSV
- Un fichier CSV par table
- Compatible avec Excel, Google Sheets, etc.
- Format universel pour l'analyse de données

## 📂 Structure des Exports

Les fichiers d'export sont créés dans le dossier `data-exports/` :

```
data-exports/
├── database-export-20241201_143022.json
├── database-export-20241201_143022.sql
└── csv-export-20241201_143022/
    ├── languages.csv
    ├── categories.csv
    ├── tags.csv
    ├── tools.csv
    ├── tool_translations.csv
    └── category_translations.csv
```

## 🔧 Prérequis

### Pour Python
```bash
pip install psycopg2-binary
```

### Pour Node.js
```bash
npm install
```

## 📋 Tables Exportées

- **languages** - Langues supportées
- **categories** - Catégories d'outils
- **tags** - Tags pour le filtrage
- **tools** - Outils IA avec métadonnées
- **tool_translations** - Traductions des outils
- **category_translations** - Traductions des catégories

## 🎯 Utilisation dans d'Autres Projets

### Import JSON en Python
```python
import json

with open('data-exports/database-export-20241201_143022.json', 'r') as f:
    data = json.load(f)

# Accéder aux données
tools = data['tables']['tools']
categories = data['tables']['categories']
```

### Import SQL
```sql
-- Exécuter le fichier SQL dans votre nouvelle base de données
\i data-exports/database-export-20241201_143022.sql
```

### Import CSV
```python
import pandas as pd

# Lire les données CSV
tools_df = pd.read_csv('data-exports/csv-export-20241201_143022/tools.csv')
categories_df = pd.read_csv('data-exports/csv-export-20241201_143022/categories.csv')
```

## 🔍 Dépannage

### Erreur de Connexion
1. Vérifiez que PostgreSQL est en cours d'exécution
2. Vérifiez les paramètres de connexion dans `.env`
3. Utilisez `py scripts/config-db.py` pour diagnostiquer

### Erreur de Module
```bash
# Pour Python
pip install psycopg2-binary

# Pour Node.js
npm install
```

### Erreur de Permissions
- Vérifiez que l'utilisateur a les droits de lecture sur toutes les tables
- Vérifiez que le dossier `data-exports/` est accessible en écriture

## 📝 Notes

- Les exports incluent toutes les données avec leurs relations
- Les timestamps sont préservés
- Les caractères spéciaux sont correctement échappés
- Les séquences sont réinitialisées pour éviter les conflits d'ID

## 🤝 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur
2. Utilisez le script de configuration pour diagnostiquer
3. Vérifiez que votre base de données est accessible 