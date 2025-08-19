# Configuration ESLint + Prettier pour VideoIA.net

Ce document explique comment utiliser ESLint et Prettier ensemble dans le projet VideoIA.net.

## 🚀 Installation et Configuration

### Packages Installés

- `eslint` - Linter principal
- `eslint-config-next` - Configuration ESLint pour Next.js
- `prettier` - Formateur de code
- `eslint-config-prettier` - Désactive les règles ESLint qui entrent en conflit avec Prettier
- `eslint-plugin-prettier` - Intègre Prettier dans ESLint
- `husky` - Git hooks
- `lint-staged` - Exécute les linters sur les fichiers modifiés

### Fichiers de Configuration

#### `.eslintrc.json`
Configuration ESLint qui étend Next.js et intègre Prettier :
```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "prettier"
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "no-unused-vars": "warn",
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

#### `.prettierrc`
Configuration Prettier avec des règles adaptées à Next.js/React :
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

#### `.prettierignore`
Liste des fichiers et dossiers à ignorer par Prettier.

## 📝 Scripts NPM Disponibles

### Formatage
```bash
# Formater tous les fichiers
npm run format

# Vérifier le formatage sans modifier
npm run format:check
```

### Linting
```bash
# Linter le code
npm run lint

# Linter et corriger automatiquement
npm run lint:fix
```

### Vérifications Complètes
```bash
# Vérifier la qualité du code (lint + format + types)
npm run code-quality

# Vérifier les types TypeScript
npm run type-check
```

## 🔧 Intégration avec VS Code

### Extensions Recommandées
- `esbenp.prettier-vscode` - Support Prettier
- `dbaeumer.vscode-eslint` - Support ESLint
- `bradlc.vscode-tailwindcss` - Support Tailwind CSS

### Configuration VS Code
Le fichier `.vscode/settings.json` configure :
- Formatage automatique à la sauvegarde
- Prettier comme formateur par défaut
- Correction automatique ESLint à la sauvegarde
- Validation ESLint pour JS/TS/JSX/TSX

## 🪝 Git Hooks avec Husky

### Hook Pre-commit
Avant chaque commit, `lint-staged` exécute automatiquement :
- Prettier sur tous les fichiers modifiés
- ESLint avec auto-correction sur les fichiers JS/TS/JSX/TSX

### Configuration lint-staged
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

## 🎯 Workflow Recommandé

### 1. Développement Quotidien
```bash
# 1. Écrire du code
# 2. Sauvegarder (VS Code formate automatiquement)
# 3. Commiter (Husky exécute lint-staged automatiquement)
git add .
git commit -m "feat: nouvelle fonctionnalité"
```

### 2. Vérification Manuelle
```bash
# Vérifier le formatage
npm run format:check

# Vérifier le linting
npm run lint

# Formater et linter tout le projet
npm run format
npm run lint:fix
```

### 3. Avant un Push
```bash
# Vérification complète
npm run code-quality
```

## ⚠️ Résolution des Problèmes Courants

### Conflits ESLint/Prettier
Si vous rencontrez des conflits :
1. Vérifiez que `eslint-config-prettier` est dans les extends
2. Assurez-vous que `prettier/prettier` est dans les règles
3. Redémarrez VS Code

### Erreurs de Formatage
```bash
# Forcer le formatage de tous les fichiers
npm run format

# Vérifier les fichiers problématiques
npm run format:check
```

### Erreurs de Linting
```bash
# Corriger automatiquement les erreurs corrigeables
npm run lint:fix

# Voir toutes les erreurs
npm run lint
```

## 🔍 Règles ESLint Personnalisées

### Règles Actuelles
- `prettier/prettier`: Erreur si le code n'est pas formaté selon Prettier
- `no-unused-vars`: Warning pour les variables non utilisées
- `no-console`: Warning pour les console.log (à éviter en production)
- `@typescript-eslint/no-explicit-any`: Warning pour l'utilisation de `any`
- `react-hooks/exhaustive-deps`: Warning pour les dépendances manquantes des hooks

### Personnalisation
Pour modifier les règles, éditez `.eslintrc.json` :
```json
{
  "rules": {
    "no-console": "off",        // Désactiver la règle
    "no-console": "error",      // Changer en erreur
    "no-console": "warn"        // Changer en warning
  }
}
```

## 📚 Ressources

- [Documentation ESLint](https://eslint.org/)
- [Documentation Prettier](https://prettier.io/)
- [Configuration Next.js ESLint](https://nextjs.org/docs/basic-features/eslint)
- [Husky Git Hooks](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)

## 🤝 Contribution

Pour contribuer au projet :
1. Assurez-vous que votre code passe `npm run code-quality`
2. Utilisez les hooks Git pour maintenir la qualité
3. Respectez les règles de formatage et de linting

---

*Cette configuration garantit un code cohérent et de haute qualité pour VideoIA.net.*
