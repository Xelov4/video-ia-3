# Documentation Complète de la Base de Données VideoIA.net

*Date de dernière mise à jour : 16 août 2025*

## Table des Matières
1. [Vue d'Ensemble](#vue-densemble)
2. [Configuration et Accès](#configuration-et-accès)
3. [Schéma Détaillé](#schéma-détaillé)
4. [Relations entre Tables](#relations-entre-tables)
5. [Indexes et Optimisations](#indexes-et-optimisations)
6. [Requêtes Courantes](#requêtes-courantes)
7. [Migrations et Évolution](#migrations-et-évolution)
8. [Backup et Restauration](#backup-et-restauration)
9. [Bonnes Pratiques](#bonnes-pratiques)

## Vue d'Ensemble

La base de données de VideoIA.net est une base PostgreSQL relationnelle qui stocke l'ensemble des données du répertoire d'outils IA. Elle est conçue pour gérer efficacement :
- Un grand volume d'outils IA (16 765+ entrées)
- Un système de catégorisation (140+ catégories)
- Un support multilingue complet (7 langues)
- Des métriques et statistiques d'utilisation

L'accès à la base de données se fait exclusivement via l'ORM Prisma, qui fournit une interface typée et sécurisée.

## Configuration et Accès

### Informations de Connexion
- **SGBD** : PostgreSQL 16.9
- **Hôte** : `localhost`
- **Port** : `5432`
- **Nom de la BD** : `video_ia_net`
- **Utilisateur** : `video_ia_user`
- **Mot de passe** : `video123`

### Configuration dans le Projet
La configuration de connexion est définie dans le fichier `.env.local` à la racine du projet :

```env
# PostgreSQL Connection
DATABASE_URL="postgresql://video_ia_user:video123@localhost:5432/video_ia_net?schema=public"
```

### Client Prisma
L'instance du client Prisma est initialisée comme un singleton dans le fichier `/src/lib/database/client.ts` :

```typescript
import { PrismaClient } from '@prisma/client'

// Éviter les instances multiples en développement avec le hot-reloading
declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
```

## Schéma Détaillé

Le schéma complet de la base de données est défini dans le fichier `/prisma/schema.prisma`. Voici une description détaillée des tables principales :

### Table `Tool`
Stocke les informations de base sur chaque outil IA.

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

#### Champs Importants
- `id` : Identifiant unique UUID
- `slug` : Identifiant URL-friendly unique (utilisé dans les URLs)
- `tool_category` : Référence à la catégorie (stockée comme string pour flexibilité)
- `target_audience`, `use_cases`, `key_features`, `tags` : Champs texte structurés stockés au format JSON
- `quality_score` : Score de qualité de l'outil (0.0 à 10.0)
- `is_active` : Indique si l'outil est visible sur le site
- `is_featured` : Indique si l'outil est mis en avant

### Table `ToolTranslation`
Stocke les traductions pour chaque outil dans différentes langues.

```prisma
model ToolTranslation {
  id                String   @id @default(uuid())
  tool_id           String
  language_code     String   @db.VarChar(5)
  name              String   @db.VarChar(255)
  overview          String?  @db.Text
  description       String?  @db.Text
  meta_title        String?  @db.VarChar(255)
  meta_description  String?  @db.Text
  translation_source String? @db.VarChar(50)
  quality_score     Decimal? @db.Decimal(3, 1)
  human_reviewed    Boolean  @default(false)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  tool              Tool     @relation(fields: [tool_id], references: [id], onDelete: Cascade)

  @@unique([tool_id, language_code])
}
```

#### Champs Importants
- `tool_id` et `language_code` : Clé composite unique
- `translation_source` : Source de la traduction (ex: 'human', 'machine', 'hybrid')
- `quality_score` : Score de qualité de la traduction
- `human_reviewed` : Indique si la traduction a été révisée par un humain

### Table `Category`
Stocke les catégories d'outils IA.

```prisma
model Category {
  id            String                @id @default(uuid())
  name          String                @db.VarChar(100)
  slug          String                @unique @db.VarChar(100)
  description   String?               @db.Text
  icon_name     String?               @db.VarChar(50)
  tool_count    Int                   @default(0)
  is_featured   Boolean               @default(false)
  created_at    DateTime              @default(now())
  translations  CategoryTranslation[]
}
```

#### Champs Importants
- `slug` : Identifiant URL-friendly unique
- `icon_name` : Nom de l'icône associée à la catégorie
- `tool_count` : Nombre d'outils dans cette catégorie (dénormalisé pour performance)

### Table `CategoryTranslation`
Stocke les traductions pour chaque catégorie.

```prisma
model CategoryTranslation {
  id                String   @id @default(uuid())
  category_id       String
  language_code     String   @db.VarChar(5)
  name              String   @db.VarChar(100)
  description       String?  @db.Text
  translation_source String? @db.VarChar(50)
  quality_score     Decimal? @db.Decimal(3, 1)
  human_reviewed    Boolean  @default(false)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  category          Category @relation(fields: [category_id], references: [id], onDelete: Cascade)

  @@unique([category_id, language_code])
}
```

### Table `User`
Stocke les informations des utilisateurs (principalement administrateurs).

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  name            String?
  password_hash   String?
  role            String    @default("user")
  is_active       Boolean   @default(true)
  last_login      DateTime?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
}
```

### Table `View`
Enregistre les vues des outils pour les statistiques.

```prisma
model View {
  id          String   @id @default(uuid())
  tool_id     String
  session_id  String?
  user_id     String?
  ip_hash     String?
  user_agent  String?
  referrer    String?
  created_at  DateTime @default(now())

  @@index([tool_id])
  @@index([created_at])
}
```

## Relations entre Tables

Le schéma de base de données utilise plusieurs relations importantes :

### Relation Tool - ToolTranslation
- Relation one-to-many : Un outil peut avoir plusieurs traductions
- Contrainte de clé étrangère avec suppression en cascade
- Définition Prisma : `tool Tool @relation(fields: [tool_id], references: [id], onDelete: Cascade)`

### Relation Category - CategoryTranslation
- Relation one-to-many : Une catégorie peut avoir plusieurs traductions
- Contrainte de clé étrangère avec suppression en cascade
- Définition Prisma : `category Category @relation(fields: [category_id], references: [id], onDelete: Cascade)`

### Relation Tool - Category
- Relation implicite via le champ `tool_category` dans la table `Tool`
- Cette relation est intentionnellement non contrainte pour plus de flexibilité
- La cohérence est maintenue au niveau de l'application

## Indexes et Optimisations

Le schéma inclut plusieurs indexes pour optimiser les requêtes fréquentes :

### Indexes Primaires
- Index primaire sur `id` pour toutes les tables
- Index unique sur `slug` pour `Tool` et `Category`
- Index composite unique sur `[tool_id, language_code]` pour `ToolTranslation`
- Index composite unique sur `[category_id, language_code]` pour `CategoryTranslation`

### Indexes Secondaires
- Index sur `tool_category` dans `Tool` pour accélérer les filtres par catégorie
- Index sur `is_featured` dans `Tool` pour les requêtes d'outils mis en avant
- Index sur `created_at` dans `Tool` pour le tri chronologique
- Index sur `quality_score` dans `Tool` pour le tri par qualité
- Index sur `view_count` dans `Tool` pour le tri par popularité

### Optimisations de Schéma
1. **Dénormalisation Stratégique** :
   - Le champ `tool_count` dans `Category` est dénormalisé pour éviter les requêtes COUNT coûteuses
   - Cette valeur est mise à jour via des triggers PostgreSQL ou au niveau de l'application

2. **Types de Données Optimisés** :
   - Utilisation de `VarChar` avec longueur limitée pour les champs courts
   - Utilisation de `Text` pour les contenus longs
   - Utilisation de `Decimal(3,1)` pour les scores de qualité (précision fixe)

3. **Partitionnement** :
   - La table `View` est partitionnée par mois pour optimiser les requêtes de statistiques
   - Configuration dans `/prisma/migrations/*/up.sql`

## Requêtes Courantes

Voici les requêtes Prisma les plus couramment utilisées dans l'application :

### Récupération d'un Outil avec Traductions

```typescript
// Fichier: /src/lib/database/services/multilingual-tools.ts
async function getToolBySlug(slug: string, lang: SupportedLanguage): Promise<ToolWithTranslation | null> {
  const tool = await prisma.tool.findUnique({
    where: { 
      slug,
      is_active: true
    },
    include: {
      translations: {
        where: {
          language_code: {
            in: [lang, DEFAULT_LANGUAGE]
          }
        }
      }
    }
  })
  
  if (!tool) return null
  
  // Traitement des traductions et fallback
  return processToolTranslations(tool, lang)
}
```

### Recherche d'Outils avec Filtres

```typescript
// Fichier: /src/lib/database/services/multilingual-tools.ts
async function searchTools(params: ToolsSearchParams): Promise<PaginatedToolsResult> {
  const { 
    language, 
    query, 
    category, 
    page = 1, 
    limit = 24,
    sortBy = 'created_at',
    sortOrder = 'desc',
    filters = {}
  } = params
  
  const where: Prisma.ToolWhereInput = {
    is_active: true,
    ...(category && { tool_category: category }),
    ...(filters.minQualityScore && { quality_score: { gte: filters.minQualityScore } }),
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { translations: { 
          some: { 
            language_code: language,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          } 
        }}
      ]
    })
  }
  
  // Comptage total pour pagination
  const totalCount = await prisma.tool.count({ where })
  
  // Récupération des outils avec pagination et tri
  const tools = await prisma.tool.findMany({
    where,
    include: {
      translations: {
        where: {
          language_code: {
            in: [language, DEFAULT_LANGUAGE]
          }
        }
      }
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    skip: (page - 1) * limit,
    take: limit
  })
  
  // Traitement des traductions
  const processedTools = tools.map(tool => processToolTranslations(tool, language))
  
  return {
    tools: processedTools,
    pagination: {
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1
    }
  }
}
```

### Mise à Jour du Compteur de Vues

```typescript
// Fichier: /src/lib/database/services/tools.ts
async function incrementViewCount(toolId: string): Promise<void> {
  await prisma.tool.update({
    where: { id: toolId },
    data: {
      view_count: {
        increment: 1
      }
    }
  })
  
  // Enregistrement de la vue dans la table View
  await prisma.view.create({
    data: {
      tool_id: toolId,
      session_id: session.id,
      ip_hash: hashIp(request.ip),
      user_agent: request.headers['user-agent']?.substring(0, 255),
      referrer: request.headers.referer?.substring(0, 255)
    }
  })
}
```

## Migrations et Évolution

Le schéma de la base de données évolue via le système de migrations de Prisma.

### Structure des Migrations
Les migrations sont stockées dans le dossier `/prisma/migrations/` avec la structure suivante :
- `20250601120000_initial_schema/` - Migration initiale
- `20250615143000_add_view_tracking/` - Ajout du suivi des vues
- `20250701090000_optimize_indexes/` - Optimisation des indexes

Chaque dossier de migration contient :
- `migration.sql` - Script SQL de migration
- `README.md` - Description des changements (optionnel)

### Création d'une Migration
Pour créer une nouvelle migration après modification du schéma :

```bash
npx prisma migrate dev --name nom_de_la_migration
```

### Application des Migrations
En production, les migrations sont appliquées avec :

```bash
npx prisma migrate deploy
```

Ce script est intégré dans le processus de déploiement (`/scripts/deploy.sh`).

## Backup et Restauration

### Procédure de Backup
Les backups de la base de données sont effectués quotidiennement via un cron job sur le serveur :

```bash
# Fichier: /etc/cron.daily/backup-videoia-db
#!/bin/bash
BACKUP_DIR="/var/backups/video-ia-net"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/video_ia_net_backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR
pg_dump -U video_ia_user -d video_ia_net > $BACKUP_FILE
gzip $BACKUP_FILE

# Rotation des backups (garde les 30 derniers jours)
find $BACKUP_DIR -name "*.sql.gz" -type f -mtime +30 -delete
```

### Procédure de Restauration
Pour restaurer une base de données à partir d'un backup :

```bash
# 1. Décompresser le backup si nécessaire
gunzip video_ia_net_backup_20250812.sql.gz

# 2. Restaurer la base de données
psql -U video_ia_user -d video_ia_net < video_ia_net_backup_20250812.sql
```

Un script de restauration est disponible dans `/scripts/restore-db.sh`.

## Bonnes Pratiques

### Accès à la Base de Données
1. **Toujours utiliser les services** :
   - Ne jamais accéder directement au client Prisma depuis les composants
   - Utiliser les services dans `/src/lib/database/services/`

2. **Transactions pour les opérations multiples** :
   ```typescript
   await prisma.$transaction(async (tx) => {
     // Opérations multiples avec le même client tx
     const tool = await tx.tool.create({ data: toolData })
     await tx.toolTranslation.create({ data: { ...translationData, tool_id: tool.id } })
   })
   ```

3. **Sérialisation des objets Decimal** :
   - Toujours utiliser `serializePrismaObject` avant de passer des données aux composants client
   ```typescript
   import { serializePrismaObject } from '@/src/lib/utils/prismaHelpers'
   
   const tools = await prisma.tool.findMany()
   return serializePrismaObject(tools)
   ```

### Optimisation des Requêtes
1. **Sélection des champs** :
   - Sélectionner uniquement les champs nécessaires pour réduire la taille des données
   ```typescript
   const tools = await prisma.tool.findMany({
     select: {
       id: true,
       name: true,
       slug: true,
       image_url: true
     }
   })
   ```

2. **Pagination** :
   - Toujours paginer les résultats (max 24-50 items par page)
   ```typescript
   const tools = await prisma.tool.findMany({
     skip: (page - 1) * limit,
     take: limit
   })
   ```

3. **Éviter les requêtes N+1** :
   - Utiliser `include` pour charger les relations en une seule requête
   ```typescript
   const tools = await prisma.tool.findMany({
     include: {
       translations: true
     }
   })
   ```

### Sécurité
1. **Validation des entrées** :
   - Valider toutes les entrées utilisateur avec Zod avant de les utiliser dans les requêtes
   ```typescript
   const toolSchema = z.object({
     name: z.string().min(3).max(255),
     slug: z.string().regex(/^[a-z0-9-]+$/),
     // ...
   })
   
   const validatedData = toolSchema.parse(inputData)
   ```

2. **Pas de SQL brut** :
   - Éviter `$queryRaw` sauf si absolument nécessaire
   - Si nécessaire, utiliser des paramètres préparés

3. **Contrôle d'accès** :
   - Vérifier les permissions avant toute opération de modification
   ```typescript
   if (!isAdmin(user)) {
     throw new Error('Unauthorized')
   }
   ```

---

*Cette documentation est maintenue par l'équipe de développement VideoIA.net. Pour toute question ou suggestion concernant la base de données, veuillez contacter l'équipe technique.*
