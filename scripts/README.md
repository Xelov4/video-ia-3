# Scripts

Ce dossier contient tous les scripts utilitaires pour le projet video-ia.net.

## 📁 Structure

```
scripts/
├── database/          # Scripts de base de données
│   ├── migrate-robust.js
│   └── migrate-simple.js
└── api/              # Scripts d'API (futur)
```

## 🗄️ Scripts de Base de Données

### `migrate-robust.js`
Script de migration principal pour importer les données CSV vers PostgreSQL.

**Usage :**
```bash
node scripts/database/migrate-robust.js
```

**Fonctionnalités :**
- Création des tables avec la structure appropriée
- Import de 16,763 outils depuis le CSV nettoyé
- Création automatique des catégories
- Gestion des caractères spéciaux
- Attribution des permissions
- Statistiques détaillées

**Prérequis :**
- Fichier `data/working_database_clean.csv` doit exister
- PostgreSQL configuré avec l'utilisateur `video_ia_user`

### `migrate-simple.js`
Version simplifiée du script de migration (version échouée).

**Usage :**
```bash
node scripts/database/migrate-simple.js
```

**Statut :** Version de test, non utilisée en production.

## 🔧 Exécution des Scripts

```bash
# Migration des données (recommandé)
node scripts/database/migrate-robust.js

# Test de migration (optionnel)
node scripts/database/migrate-simple.js
```

## 📊 Résultats Attendus

Après exécution de `migrate-robust.js` :
- ✅ 16,763 outils importés
- ✅ 140 catégories créées
- ✅ 0 erreur de migration
- ✅ Permissions configurées
- ✅ Index créés

## 🚨 Dépannage

Si la migration échoue :
1. Vérifier que PostgreSQL est en cours d'exécution
2. Vérifier les permissions de l'utilisateur `video_ia_user`
3. Vérifier que le fichier CSV existe
4. Exécuter `tests/database/test-db-connection.js` pour diagnostiquer 