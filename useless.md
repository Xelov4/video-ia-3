# 🧹 Audit de nettoyage - Technologies non utilisées

**Date:** 2025-01-15  
**Objectif:** Identifier et nettoyer toutes les technologies, dépendances et références obsolètes

## 🔴 PROBLÈMES CRITIQUES - À SUPPRIMER IMMÉDIATEMENT

### 1. Supabase (Migration vers PostgreSQL direct)
**Status:** ❌ OBSOLÈTE - Le projet utilise maintenant PostgreSQL direct

**Références trouvées:**
- `src/lib/database/supabase.ts` - **Fichier complet à supprimer**
- `@supabase/supabase-js` dans package.json - **Dépendance à supprimer**
- Variables env `.env.example`:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` 
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Impact:** 
- Confusion entre deux systèmes de base de données
- Code dupliqué (même interfaces dans supabase.ts et postgres.ts)
- Dépendance inutile (~2MB)

**Action:** 
1. Supprimer `src/lib/database/supabase.ts`
2. Supprimer `@supabase/supabase-js` du package.json
3. Nettoyer les variables d'environnement Supabase
4. Mettre à jour tsconfig.json (déjà exclu)

### 2. Prisma (Non utilisé activement)
**Status:** 🟡 PARTIELLEMENT UTILISÉ - Schéma existe mais ORM non utilisé

**Références trouvées:**
- `prisma/schema.prisma` - **Schéma défini mais non utilisé**
- `@prisma/client` et `prisma` dans package.json
- `@auth/prisma-adapter` - **Inutile car NextAuth utilise PostgreSQL direct**

**Impact:**
- Le projet utilise du SQL brut via pg, pas l'ORM Prisma
- L'adapter Prisma pour NextAuth n'est pas utilisé
- Confusion architecturale

**Action:**
- Option 1: Supprimer complètement Prisma si SQL brut préféré
- Option 2: Migrer vers Prisma ORM pour cohérence
- **Recommandation:** Supprimer car le code actuel fonctionne avec pg

### 3. Dépendances potentiellement inutilisées

#### `critters` (CSS optimization)
**Status:** ❌ NON UTILISÉ - Présent dans package.json mais aucune référence

#### `csv-parse` et `csv-stringify` 
**Status:** 🟡 USAGE LIMITÉ - Trouvé dans scripts/export seulement
- Si les scripts d'export ne sont plus utilisés, supprimer

#### `@auth/prisma-adapter`
**Status:** ❌ NON UTILISÉ - NextAuth utilise PostgreSQL direct

## 🟡 DÉPENDANCES À VÉRIFIER

### 1. Next.js et React (Versions récentes)
**Status:** ✅ UTILISÉ - Versions récentes
- `next: ^15.4.6` 
- `react: ^19.1.1`
- `react-dom: ^19.1.1`

### 2. Outils de développement actifs
**Status:** ✅ UTILISÉ
- `puppeteer: ^24.16.1` - **Utilisé** dans src/lib/scraper/core.ts
- `sharp: ^0.32.6` - **Utilisé** dans src/lib/performance/images.ts  
- `autoprefixer: ^10.4.21` - **Utilisé** dans postcss.config.js
- `use-debounce: ^10.0.5` - **Utilisé** dans hooks/useSearchFilters.ts
- `@google/genai: ^0.2.0` - **Utilisé** dans src/lib/ai/

### 3. Authentication Stack
**Status:** ✅ UTILISÉ mais architecture mixte
- `next-auth: ^4.24.11` - **Utilisé** pour admin
- `bcryptjs: ^3.0.2` - **Utilisé** pour hash des mots de passe

## 🔧 FICHIERS DE CONFIGURATION

### TypeScript Configuration
**Status:** ✅ PROPRE
- `tsconfig.json` exclut déjà `src/lib/database/supabase.ts`
- Configuration paths correcte

### Next.js Configuration  
**Status:** ✅ OPTIMISÉ
- Exclut puppeteer du bundle client
- Configuration images optimisée

## 📊 RÉSUMÉ DES VERSIONS

### Technologies principales (OK)
- Node.js modules: ESNext/ES2015
- TypeScript: ^5.0.0
- Next.js: ^15.4.6 (récent)
- React: ^19.1.1 (très récent)

### Base de données (PROBLÈME)
- PostgreSQL: ✅ Utilisé via `pg: ^8.11.0`
- Supabase: ❌ À supprimer
- Prisma: 🟡 À décider

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Phase 1: Nettoyage Supabase (URGENT)
```bash
# 1. Supprimer le fichier
rm src/lib/database/supabase.ts

# 2. Supprimer la dépendance
npm uninstall @supabase/supabase-js

# 3. Nettoyer .env.example (supprimer toutes les variables SUPABASE_*)
```

### Phase 2: Décision Prisma
```bash
# Option A: Supprimer Prisma
npm uninstall @prisma/client prisma @auth/prisma-adapter
rm -rf prisma/

# Option B: Migrer vers Prisma ORM (plus de travail)
# Garder le schéma, migrer les services PostgreSQL
```

### Phase 3: Nettoyage mineur
```bash
# Supprimer les dépendances inutiles
npm uninstall critters @auth/prisma-adapter

# Vérifier l'usage des CSV tools
# Si pas utilisés: npm uninstall csv-parse csv-stringify
```

## ⚠️ RISQUES ET PRÉCAUTIONS

1. **Supabase**: Vérifier qu'aucun import/référence cachée avant suppression
2. **Prisma**: S'assurer que le schéma ne sert pas de documentation
3. **CSV tools**: Vérifier si les scripts d'export sont encore nécessaires

## 📈 BÉNÉFICES ATTENDUS

- **Taille bundle:** -2MB+ (suppression Supabase)
- **Clarté code:** Architecture unifiée PostgreSQL
- **Maintenance:** Moins de dépendances à suivre
- **Performance:** Moins de code mort dans le bundle

---

**Note:** Audit réalisé automatiquement le 2025-01-15. Vérifier manuellement avant suppression définitive.