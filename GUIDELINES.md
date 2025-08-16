# Guidelines et Règles de Développement - VideoIA.net

Ce document définit les règles et bonnes pratiques à respecter pour tous les développeurs et product owners travaillant sur le projet VideoIA.net.

## 📋 Table des Matières
1. [Architecture et Structure](#architecture-et-structure)
2. [Conventions de Code](#conventions-de-code)
3. [Internationalisation (i18n)](#internationalisation-i18n)
4. [Base de Données](#base-de-données)
5. [Performance](#performance)
6. [UI/UX](#uiux)
7. [Sécurité](#sécurité)
8. [Workflow Git](#workflow-git)
9. [Déploiement](#déploiement)
10. [Documentation](#documentation)
11. [Pour les Product Owners](#pour-les-product-owners)

## Architecture et Structure

### Règles Fondamentales
1. **Respecter l'architecture App Router de Next.js** - Ne pas mélanger avec Pages Router
2. **Séparation des préoccupations** - Maintenir la séparation entre UI, logique métier et accès aux données
3. **Composants Server vs Client** - Utiliser `'use client'` uniquement quand nécessaire
4. **Structure des dossiers** - Respecter la structure existante :
   - `app/[lang]/` pour les routes multilingues
   - `src/components/` pour les composants réutilisables
   - `src/lib/` pour les services et utilitaires

### Bonnes Pratiques
- Privilégier les composants serveur par défaut pour optimiser les performances
- Utiliser les Server Components pour le chargement initial des données
- Limiter l'utilisation des Client Components aux parties interactives
- Créer des hooks personnalisés pour la logique réutilisable

## Conventions de Code

### Règles Fondamentales
1. **TypeScript strict** - Utiliser le typage strict et éviter `any`
2. **Nommage explicite** - Utiliser des noms descriptifs pour les variables, fonctions et composants
3. **Commentaires** - Documenter les fonctions complexes et les composants avec JSDoc
4. **Formatage** - Respecter la configuration ESLint et Prettier du projet

### Bonnes Pratiques
- Préfixer les composants client avec `Client` (ex: `ToolsPageClient.tsx`)
- Utiliser des interfaces pour les props des composants
- Éviter les dépendances circulaires entre les hooks et fonctions
- Déclarer les constantes avant leur utilisation (éviter les erreurs comme avec `ITEMS_PER_PAGE`)
- Utiliser des fonctions pures quand possible

## Internationalisation (i18n)

### Règles Fondamentales
1. **Toujours utiliser le paramètre `lang`** - Toutes les pages et composants doivent supporter le paramètre `lang`
2. **Ne jamais hardcoder de texte** - Utiliser des conditions basées sur `lang` pour les textes
3. **Respecter les 7 langues supportées** - `en`, `fr`, `it`, `es`, `de`, `nl`, `pt`
4. **Utiliser les types centralisés** - Importer `SupportedLanguage` depuis `src/lib/i18n/types.ts`

### Bonnes Pratiques
- Utiliser le contexte i18n pour les composants clients
- Implémenter des fallbacks pour les traductions manquantes
- Tester l'interface dans toutes les langues avant de déployer

## Base de Données

### Règles Fondamentales
1. **Toujours utiliser Prisma** - Ne pas faire de requêtes SQL directes
2. **Sérialiser les objets Decimal** - Utiliser `serializePrismaObject` pour éviter les erreurs de sérialisation
3. **Respecter le schéma existant** - Ne pas modifier les tables principales sans consultation
4. **Utiliser les services existants** - Étendre les services dans `src/lib/database/services/` au lieu de créer de nouvelles couches d'accès

### Bonnes Pratiques
- Utiliser les transactions pour les opérations multiples
- Implémenter un système de cache pour les requêtes fréquentes
- Éviter les requêtes N+1 en utilisant `include` de Prisma
- Créer des migrations pour toute modification du schéma

## Performance

### Règles Fondamentales
1. **Optimiser les images** - Utiliser le composant `next/image` avec des tailles appropriées
2. **Limiter les requêtes API** - Regrouper les requêtes et utiliser le cache
3. **Pagination** - Implémenter la pagination pour toutes les listes d'outils (max 24 par page)
4. **Lazy loading** - Utiliser le chargement différé pour les composants lourds

### Bonnes Pratiques
- Utiliser React.memo pour les composants qui ne changent pas souvent
- Optimiser les re-rendus avec useMemo et useCallback
- Préférer getStaticProps/getServerSideProps pour le chargement initial des données
- Implémenter un système de cache côté serveur pour les données fréquemment accédées

## UI/UX

### Règles Fondamentales
1. **Utiliser TailwindCSS** - Ne pas ajouter de CSS personnalisé sauf si nécessaire
2. **Respecter les composants UI** - Utiliser les composants de `src/components/ui/`
3. **Responsive design** - Toutes les pages doivent être parfaitement responsives
4. **Accessibilité** - Respecter les normes WCAG 2.1 niveau AA

### Bonnes Pratiques
- Utiliser des variables CSS pour les couleurs et espacements
- Tester sur différents appareils et navigateurs
- Implémenter des états de chargement pour améliorer l'UX
- Utiliser des animations subtiles pour les transitions

## Sécurité

### Règles Fondamentales
1. **Validation des entrées** - Toujours valider les entrées utilisateur côté serveur
2. **Protection CSRF** - Utiliser les tokens CSRF pour les formulaires
3. **Pas de secrets dans le code** - Utiliser les variables d'environnement pour les secrets
4. **Sanitisation des données** - Échapper les données affichées pour éviter les XSS

### Bonnes Pratiques
- Implémenter une politique de Content-Security-Policy
- Utiliser HTTPS uniquement
- Mettre à jour régulièrement les dépendances
- Limiter les permissions des utilisateurs au strict nécessaire

## Workflow Git

### Règles Fondamentales
1. **Branches de fonctionnalités** - Créer une branche par fonctionnalité ou correction
2. **Commits atomiques** - Faire des commits petits et cohérents
3. **Messages de commit descriptifs** - Utiliser des préfixes comme `feat:`, `fix:`, `docs:`, etc.
4. **Pull requests** - Toutes les modifications doivent passer par des pull requests
5. **Ne jamais commit de fichiers volumineux** - Respecter le .gitignore

### Bonnes Pratiques
- Faire des code reviews pour toutes les pull requests
- Utiliser des émojis dans les messages de commit pour plus de clarté
- Maintenir un changelog des modifications importantes
- Utiliser des branches de release pour les déploiements en production

## Déploiement

### Règles Fondamentales
1. **Tester avant de déployer** - Exécuter tous les tests avant chaque déploiement
2. **Utiliser le script de déploiement** - Toujours utiliser `scripts/deploy.sh`
3. **Vérifier la configuration** - Exécuter `scripts/check-setup.ts` avant le déploiement
4. **Sauvegarder la base de données** - Faire une sauvegarde avant les migrations importantes

### Bonnes Pratiques
- Implémenter un déploiement continu pour la branche dev
- Utiliser des environnements de staging pour tester les nouvelles fonctionnalités
- Monitorer les performances après le déploiement
- Avoir un plan de rollback en cas de problème

## Documentation

### Règles Fondamentales
1. **Documenter les nouvelles fonctionnalités** - Mettre à jour la documentation pour chaque nouvelle fonctionnalité
2. **Documenter les API** - Toutes les routes API doivent être documentées
3. **Maintenir les fichiers README** - Mettre à jour les README quand nécessaire
4. **Documenter les problèmes connus** - Ajouter les problèmes connus et leurs solutions

### Bonnes Pratiques
- Utiliser des diagrammes pour expliquer les concepts complexes
- Documenter les décisions d'architecture importantes
- Maintenir un journal des changements de l'API
- Créer des guides pour les cas d'utilisation courants

## Pour les Product Owners

### Règles Fondamentales
1. **Respecter la roadmap** - Suivre le plan d'architecture défini dans ARCHITECTURE_MASTER_PLAN.md
2. **Prioriser la stabilité** - Privilégier la correction des bugs avant l'ajout de nouvelles fonctionnalités
3. **Considérer l'impact multilingue** - Toute nouvelle fonctionnalité doit être compatible avec les 7 langues
4. **Respecter les contraintes techniques** - Consulter l'équipe technique avant de promettre des fonctionnalités

### Bonnes Pratiques
- Définir clairement les critères d'acceptation pour chaque fonctionnalité
- Impliquer les développeurs dès la phase de conception
- Planifier des sprints de refactoring réguliers
- Recueillir et analyser les retours utilisateurs pour guider les priorités

---

## Checklist avant de soumettre du code

- [ ] Le code respecte les conventions de style du projet
- [ ] Les types TypeScript sont correctement définis
- [ ] Les composants sont correctement séparés en Server/Client
- [ ] L'internationalisation est correctement implémentée
- [ ] Les objets Decimal sont sérialisés avant d'être passés aux composants client
- [ ] Les performances ont été optimisées (pagination, lazy loading, etc.)
- [ ] Le code est testé dans toutes les langues supportées
- [ ] La documentation a été mise à jour
- [ ] Aucun secret n'est exposé dans le code
- [ ] Les fichiers volumineux sont exclus du dépôt Git

---

Ces guidelines sont évolutives et peuvent être mises à jour selon les besoins du projet. Tous les membres de l'équipe sont encouragés à proposer des améliorations à ce document.
