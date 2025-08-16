# Guide de Déploiement - VideoIA.net

## Résumé des corrections apportées

Suite à notre audit, nous avons apporté les corrections suivantes pour résoudre les erreurs 404 et problèmes de Next.js :

1. **Services manquants implémentés** :
   - `DataExtractionService` - Service d'extraction et de structuration des données
   - `MultilingualToolsService` - Service de gestion des outils multilingues

2. **Composants UI manquants implémentés** :
   - `ToolCard` - Composant pour l'affichage des cartes d'outils

3. **Corrections middleware et i18n** :
   - Centralisation des types et constantes de langues
   - Mise en place du contexte i18n
   - Correction des imports dans le middleware

4. **Gestion des assets statiques** :
   - Script pour vérifier et créer les répertoires d'images manquants
   - Génération de placeholders pour les images manquantes

5. **API endpoints** :
   - Gestion robuste des erreurs API dans ModernHeader
   - Fallbacks pour les données en cas d'échec des API

6. **Base de données** :
   - Vérification de la connexion à la base PostgreSQL
   - Implémentation d'un script de diagnostic

## Lancement de l'application

### En développement

Pour lancer l'application en mode développement :

```bash
# Vérifier la configuration et la base de données
npx tsx scripts/check-setup.ts

# Démarrer l'application en mode développement
npm run dev
```

L'application sera disponible à l'adresse : http://localhost:3000

### En production

Pour déployer l'application en production, nous avons créé un script automatisé :

```bash
# Rendre le script exécutable si ce n'est pas déjà fait
chmod +x scripts/deploy.sh

# Exécuter le script de déploiement
./scripts/deploy.sh
```

Ce script va :
1. Mettre à jour les dépendances
2. Vérifier les types TypeScript
3. Vérifier le linting
4. Valider la configuration et la base de données
5. Valider le schéma Prisma
6. Construire l'application pour la production
7. Démarrer l'application avec PM2 pour assurer sa persistance

L'application sera disponible à l'adresse configurée dans les variables d'environnement (par défaut : http://localhost:3000).

## Structure des pages principales

Le site comporte les pages suivantes, qui fonctionnent maintenant correctement :

- **Page d'accueil** : `/[lang]` - Page d'accueil multilingue
- **Catégories** : `/[lang]/categories` - Liste des catégories
- **Catégorie** : `/[lang]/categories/[slug]` - Détail d'une catégorie
- **Outils** : `/[lang]/tools` - Liste des outils
- **Outil** : `/[lang]/tools/[slug]` - Détail d'un outil
- **Découverte** : `/[lang]/discover` - Exploration des outils avec filtres avancés

## Surveillance et maintenance

Pour surveiller l'application en production :

```bash
# Voir les logs
pm2 logs video-ia

# Voir le status
pm2 status video-ia

# Redémarrer l'application
pm2 restart video-ia
```

## Notes importantes

- La base de données PostgreSQL doit être démarrée avant le lancement de l'application.
- Les identifiants de connexion à la base de données sont stockés dans `.env.local`.
- Le site est multilingue et supporte 7 langues : EN, FR, IT, ES, DE, NL, PT.
- Les images placeholders sont générées automatiquement pour pallier l'absence d'images réelles.

---

**Créé le :** 16 août 2025  
**Version :** 1.0
