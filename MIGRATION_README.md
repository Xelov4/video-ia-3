# Migration: Suppression du qualityScore

## Résumé
Cette migration supprime complètement le système de score de qualité (`qualityScore`) de l'application.

## Colonnes supprimées
- `tools.quality_score` (INT)
- `tool_translations.quality_score` (DECIMAL)
- `category_translations.quality_score` (DECIMAL)

## Fichiers modifiés

### Schéma Prisma
- `prisma/schema.prisma` - Suppression des champs qualityScore

### Types TypeScript
- `src/types/analysis.ts` - Suppression de qualityScore de ToolAnalysis
- `src/types/search.ts` - Suppression de qualityScore de FilterState

### Composants Admin
- `src/components/admin/TranslationForm.tsx` - Suppression de l'interface et des champs qualityScore
- `src/components/admin/LanguageSection.tsx` - Suppression des champs qualityScore
- `src/components/admin/AdminSearchFilters.tsx` - Suppression des filtres par score de qualité
- `src/components/admin/AdminToolsContent.tsx` - Suppression du tri et filtrage par score
- `src/components/admin/LanguageTabs.tsx` - Suppression des badges de qualité

### Services
- `src/services/scraper.ts` - Suppression de la fonction calculateQualityScore et des références

### Pages
- `app/scraper/page.tsx` - Suppression de l'affichage du score de qualité

## Migration SQL
Le fichier `prisma/migrations/remove_quality_score.sql` contient les commandes SQL pour supprimer les colonnes.

## Exécution de la migration

### Option 1: Via Prisma (recommandé)
```bash
npx prisma migrate dev --name remove_quality_score
```

### Option 2: SQL manuel
```bash
# Se connecter à la base de données PostgreSQL
psql -h localhost -U postgres -d postgres

# Exécuter le fichier de migration
\i prisma/migrations/remove_quality_score.sql
```

## Vérification
Après la migration, vérifiez que :
1. Les colonnes quality_score ont été supprimées des tables
2. L'application se lance sans erreurs
3. Les composants admin fonctionnent correctement
4. Plus d'erreurs "Decimal objects are not supported"

## Impact
- ✅ Résout le problème de sérialisation des objets Decimal
- ✅ Simplifie l'interface admin
- ✅ Supprime la complexité du calcul de score
- ❌ Perte de la fonctionnalité de scoring de qualité
- ❌ Suppression des filtres par qualité

## Rollback
Si nécessaire, vous pouvez restaurer les colonnes en créant une migration inverse avec les commandes ALTER TABLE ADD COLUMN.
