# Tests

Ce dossier contient tous les scripts de test pour le projet video-ia.net.

## 📁 Structure

```
tests/
├── database/          # Tests de base de données
│   └── test-db-connection.js
└── api/              # Tests d'API
    ├── test-api.js
    └── test-api-curl.sh
```

## 🧪 Tests de Base de Données

### `test-db-connection.js`
Script de diagnostic complet pour la connexion PostgreSQL.

**Usage :**
```bash
node tests/database/test-db-connection.js
```

**Fonctionnalités :**
- Test de connexion PostgreSQL
- Vérification des variables d'environnement
- Diagnostic des problèmes d'authentification
- Test avec psql

## 🚀 Tests d'API

### `test-api.js`
Script Node.js complet pour tester toutes les API.

**Usage :**
```bash
node tests/api/test-api.js
```

**Fonctionnalités :**
- Test de toutes les API endpoints
- Affichage coloré des résultats
- Gestion des erreurs
- Tests de pagination et filtres

### `test-api-curl.sh`
Script bash avec curl pour tests rapides.

**Usage :**
```bash
./tests/api/test-api-curl.sh
```

**Fonctionnalités :**
- Tests rapides avec curl
- Affichage coloré
- Tests de tous les endpoints

## 🔧 Exécution des Tests

```bash
# Test de base de données
node tests/database/test-db-connection.js

# Test des API (Node.js)
node tests/api/test-api.js

# Test des API (curl)
./tests/api/test-api-curl.sh
``` 