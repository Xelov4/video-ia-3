# Documentation Complète de VideoIA.net

## 📋 Table des Matières
1. [Introduction](#introduction)
2. [Architecture Technique](#architecture-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Base de Données](#base-de-données)
5. [Internationalisation](#internationalisation)
6. [Composants Principaux](#composants-principaux)
7. [Services](#services)
8. [API Routes](#api-routes)
9. [Déploiement](#déploiement)
10. [Problèmes Connus et Solutions](#problèmes-connus-et-solutions)
11. [Maintenance](#maintenance)

## Introduction

VideoIA.net est un répertoire complet d'outils d'intelligence artificielle spécialisé dans la création vidéo, le contenu, l'automatisation et plus encore. Le site présente plus de 16 765 outils IA organisés en 140 catégories et traduits en 7 langues.

### Objectifs du Projet
- Fournir un catalogue complet et à jour des outils IA
- Offrir une expérience utilisateur multilingue fluide
- Permettre une recherche et un filtrage avancés des outils
- Présenter des informations détaillées sur chaque outil

## Architecture Technique

### Stack Technologique
- **Frontend**: Next.js 15 avec App Router
- **Backend**: API Routes Next.js
- **Base de Données**: PostgreSQL 16.9
- **ORM**: Prisma
- **Styles**: TailwindCSS
- **Authentification**: NextAuth
- **Internationalisation**: i18n natif de Next.js avec middleware
- **Hébergement**: Serveur Ubuntu local

### Diagramme d'Architecture
```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Client Browser  | <-> |  Next.js Server  | <-> |  PostgreSQL DB   |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
                               |
                               v
                         +------------------+
                         |                  |
                         |  File System     |
                         |  (images, etc.)  |
                         |                  |
                         +------------------+
```

## Structure du Projet

```
video-ia.net/
├── app/                      # App Router structure
│   ├── [lang]/               # Routes multilingues
│   │   ├── page.tsx          # Page d'accueil
│   │   ├── categories/       # Pages des catégories
│   │   ├── tools/            # Pages des outils
│   │   └── layout.tsx        # Layout principal
│   ├── admin/                # Interface d'administration
│   └── api/                  # Routes API
├── prisma/                   # Configuration Prisma
│   └── schema.prisma         # Schéma de base de données
├── public/                   # Assets statiques
├── src/
│   ├── components/           # Composants React
│   │   ├── layout/           # Composants de mise en page
│   │   ├── tools/            # Composants liés aux outils
│   │   └── ui/               # Composants UI réutilisables
│   ├── hooks/                # Hooks personnalisés
│   └── lib/                  # Bibliothèques et utilitaires
│       ├── auth/             # Configuration d'authentification
│       ├── database/         # Services de base de données
│       │   ├── client.ts     # Client Prisma
│       │   └── services/     # Services d'accès aux données
│       ├── i18n/             # Configuration internationalisation
│       └── services/         # Services métier
├── middleware.ts             # Middleware Next.js (i18n, auth)
├── next.config.js            # Configuration Next.js
└── package.json              # Dépendances npm
```

## Base de Données

### Configuration
- **Nom de la BD**: `video_ia_net`
- **Utilisateur**: `video_ia_user`
- **Mot de passe**: `video123`
- **Hôte**: `localhost`
- **Port**: `5432`

### Schéma Principal
La base de données contient plusieurs tables principales :

#### Tools
Table principale contenant les 16 765 outils IA.

```prisma
model Tool {
  id                String            @id @default(uuid())
  name              String            @db.VarChar(255)
  slug              String            @unique @db.VarChar(255)
  description       String?           @db.Text
  overview          String?           @db.Text
  url               String            @db.VarChar(255)
  image_url         String?           @db.VarChar(255)
  video_url         String?           @db.VarChar(255)
  tool_category     String?           @db.VarChar(100)
  pricing_type      String?           @db.VarChar(50)
  pricing_url       String?           @db.VarChar(255)
  target_audience   String?           @db.Text
  use_cases         String?           @db.Text
  key_features      String?           @db.Text
  tags              String?           @db.Text
  quality_score     Decimal?          @db.Decimal(3, 1)
  view_count        Int               @default(0)
  is_active         Boolean           @default(true)
  is_featured       Boolean           @default(false)
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt
  translations      ToolTranslation[]
}
```

#### Categories
Table des 140 catégories d'outils.

```prisma
model Category {
  id           String                @id @default(uuid())
  name         String                @db.VarChar(100)
  slug         String                @unique @db.VarChar(100)
  description  String?               @db.Text
  icon_name    String?               @db.VarChar(50)
  tool_count   Int                   @default(0)
  is_featured  Boolean               @default(false)
  created_at   DateTime              @default(now())
  translations CategoryTranslation[]
}
```

#### Traductions
Tables pour stocker les traductions des outils et catégories.

```prisma
model ToolTranslation {
  id               String   @id @default(uuid())
  tool_id          String
  language_code    String   @db.VarChar(5)
  name             String   @db.VarChar(255)
  overview         String?  @db.Text
  description      String?  @db.Text
  meta_title       String?  @db.VarChar(255)
  meta_description String?  @db.Text
  translation_source String? @db.VarChar(50)
  quality_score    Decimal? @db.Decimal(3, 1)
  human_reviewed   Boolean  @default(false)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  tool             Tool     @relation(fields: [tool_id], references: [id], onDelete: Cascade)

  @@unique([tool_id, language_code])
}

model CategoryTranslation {
  id               String   @id @default(uuid())
  category_id      String
  language_code    String   @db.VarChar(5)
  name             String   @db.VarChar(100)
  description      String?  @db.Text
  translation_source String? @db.VarChar(50)
  quality_score    Decimal? @db.Decimal(3, 1)
  human_reviewed   Boolean  @default(false)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  category         Category @relation(fields: [category_id], references: [id], onDelete: Cascade)

  @@unique([category_id, language_code])
}
```

### Accès à la Base de Données
L'accès à la base de données se fait via Prisma ORM. Le client Prisma est initialisé dans `src/lib/database/client.ts` :

```typescript
import { PrismaClient } from '@prisma/client'

// Singleton pattern pour éviter les connexions multiples
declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
```

## Internationalisation

### Langues Supportées
- Anglais (en) - langue par défaut
- Français (fr)
- Italien (it)
- Espagnol (es)
- Allemand (de)
- Néerlandais (nl)
- Portugais (pt)

### Configuration
L'internationalisation est gérée par un middleware Next.js qui intercepte les requêtes et redirige vers la langue appropriée. La configuration se trouve dans `middleware.ts`.

Les types et constantes i18n sont centralisés dans `src/lib/i18n/types.ts` :

```typescript
export type SupportedLanguage = 'en' | 'fr' | 'it' | 'es' | 'de' | 'nl' | 'pt'
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'it', 'es', 'de', 'nl', 'pt']
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'
```

Un contexte React est fourni dans `src/lib/i18n/context.tsx` pour accéder à la langue courante dans les composants client.

## Composants Principaux

### Layout
- `ModernHeader.tsx` - En-tête du site avec menu de navigation et mega menu
- `Footer.tsx` - Pied de page avec liens et informations légales

### Outils
- `ToolCard.tsx` - Carte affichant un outil IA
- `ToolsGrid.tsx` - Grille d'outils avec pagination
- `ToolList.tsx` - Affichage des outils en mode liste
- `AdvancedFilters.tsx` - Filtres de recherche avancés

### Pages
- `app/[lang]/page.tsx` - Page d'accueil
- `app/[lang]/tools/page.tsx` - Page de recherche d'outils
- `app/[lang]/tools/[slug]/page.tsx` - Page détaillée d'un outil
- `app/[lang]/categories/page.tsx` - Page listant toutes les catégories
- `app/[lang]/categories/[slug]/page.tsx` - Page d'une catégorie spécifique

## Services

### Services de Base de Données
- `src/lib/database/services/tools.ts` - Service CRUD pour les outils
- `src/lib/database/services/categories.ts` - Service CRUD pour les catégories
- `src/lib/database/services/multilingual-tools.ts` - Service pour les outils multilingues
- `src/lib/database/services/multilingual-categories.ts` - Service pour les catégories multilingues

### Services Métier
- `src/lib/services/dataExtraction.ts` - Extraction de données structurées (audiences, cas d'usage)
- `src/lib/services/emojiMapping.ts` - Mapping des catégories vers des emojis

## API Routes

### Routes Principales
- `/api/tools` - CRUD des outils
- `/api/categories` - CRUD des catégories
- `/api/data-extraction` - Extraction de données (audiences, cas d'usage)
- `/api/search` - Recherche avancée d'outils

### Format de Réponse Standard
Toutes les API renvoient des réponses au format suivant :

```typescript
{
  success: boolean,
  data: any,
  error?: string,
  meta?: {
    queryTime?: number,
    language?: string,
    fallbackCount?: number
  }
}
```

## Déploiement

### Prérequis
- Node.js 18+
- PostgreSQL 16+
- npm ou yarn

### Installation
1. Cloner le dépôt
2. Installer les dépendances : `npm install`
3. Configurer les variables d'environnement dans `.env.local`
4. Exécuter les migrations Prisma : `npx prisma migrate deploy`
5. Générer le client Prisma : `npx prisma generate`
6. Construire l'application : `npm run build`
7. Démarrer le serveur : `npm start`

### Script de Déploiement
Un script de déploiement est disponible dans `scripts/deploy.sh`. Il effectue les opérations suivantes :
- Mise à jour des dépendances
- Vérification des types
- Validation du linter
- Vérification de la configuration
- Validation des migrations Prisma
- Construction de l'application
- Redémarrage du serveur

## Problèmes Connus et Solutions

### Erreurs Courantes

1. **Erreur: Cannot access 'ITEMS_PER_PAGE' before initialization**
   - **Solution**: La variable ITEMS_PER_PAGE doit être déclarée avant son utilisation dans le fichier `app/[lang]/tools/ToolsPageClient.tsx`.

2. **Erreur: Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.**
   - **Solution**: Utiliser la fonction `serializePrismaObject` dans `src/lib/utils/prismaHelpers.ts` pour convertir les objets Decimal en nombres JavaScript.

3. **Erreurs 404 pour les icônes et favicons**
   - **Solution**: Créer les fichiers manquants dans `public/` et `public/images/`.

4. **Problèmes de dépendances circulaires dans les hooks React**
   - **Solution**: Utiliser des useEffects séparés et éviter les dépendances circulaires dans les fonctions de rappel.

## Maintenance

### Mise à Jour des Données
Les données des outils peuvent être mises à jour via l'interface d'administration ou par importation de fichiers CSV/JSON. Les scripts d'importation se trouvent dans le dossier `scripts/`.

### Backup de la Base de Données
Il est recommandé de faire des sauvegardes régulières de la base de données :
```bash
pg_dump -U video_ia_user -d video_ia_net > backup_$(date +%Y%m%d).sql
```

### Monitoring
Le monitoring des performances peut être effectué avec les outils suivants :
- Vercel Analytics (si déployé sur Vercel)
- New Relic ou Datadog pour le monitoring serveur
- Sentry pour le suivi des erreurs

### Logs
Les logs de l'application sont disponibles dans :
- Console du navigateur pour les erreurs côté client
- Logs du serveur Next.js pour les erreurs côté serveur
- Logs PostgreSQL pour les erreurs de base de données

---

## Ressources Additionnelles
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation TailwindCSS](https://tailwindcss.com/docs)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)

---

*Ce document a été créé pour faciliter la maintenance et le développement continu de VideoIA.net. Pour toute question supplémentaire, veuillez contacter l'équipe de développement.*
