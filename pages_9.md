# Video-IA.net - Documentation complète des pages

## Structure générale

Le site utilise **Next.js 15** avec **App Router** et un système multilingue basé sur des segments dynamiques `[lang]`. L'architecture suit une approche moderne avec des composants React, TypeScript et Tailwind CSS.

---

## Pages principales

### 1. **Page d'accueil** - `app/[lang]/page.tsx`
- **Route**: `/`, `/fr`, `/en`, `/es`, etc.
- **Fonctionnalité**: Page d'accueil multilingue avec outils vedettes
- **Composants utilisés**: 
  - `HeroSection` - Section héro avec présentation
  - `FeaturedTools` - Grille d'outils mis en avant
  - `StatsSection` - Statistiques globales du site
- **Services**: `multilingualToolsService.getFeaturedTools()`
- **SEO**: Métadonnées dynamiques par langue, Open Graph, Twitter Cards

### 2. **Liste des outils** - `app/[lang]/tools/page.tsx`
- **Route**: `/tools`, `/fr/tools`, `/en/tools`
- **Fonctionnalité**: Liste paginée des outils IA avec recherche et filtres
- **Composants utilisés**:
  - `ToolsGrid` - Grille responsive d'outils avec pagination
  - `SearchBar` - Barre de recherche avancée
  - `FilterPanel` - Panneau de filtres par catégorie
- **Services**: `multilingualToolsService.searchTools()`
- **Fonctionnalités**:
  - Recherche textuelle par nom/description
  - Filtrage par catégorie et statut (featured)
  - Tri par date, popularité, score qualité
  - Pagination avec état dans l'URL

### 3. **Détail d'un outil** - `app/tools/[slug]/page.tsx`
- **Route**: `/tools/[slug]` (ex: `/tools/chatgpt`)
- **Fonctionnalité**: Page détaillée d'un outil IA spécifique
- **Composants utilisés**:
  - Fiche technique complète avec image, description, fonctionnalités
  - Statistiques d'engagement (vues, clics, favoris)
  - Section outils similaires
  - Breadcrumbs de navigation
- **Services**: 
  - `toolsService.getToolBySlug()`
  - `toolsService.incrementViewCount()`
- **Fonctionnalités**:
  - Suivi automatique des vues
  - Affichage du score qualité et badges (Premium, Featured)
  - Métadonnées SEO optimisées
  - Boutons d'action (Visiter, Favoris)

### 4. **Page catégorie** - `app/categories/[slug]/page.tsx`
- **Route**: `/categories/[slug]` (ex: `/categories/chatbots`)
- **Fonctionnalité**: Liste des outils d'une catégorie spécifique
- **Composants utilisés**:
  - `ToolsGrid` avec filtrage par catégorie
  - En-tête avec informations de la catégorie
  - Breadcrumbs contextuels
- **Services**: 
  - `CategoriesService.getCategoryBySlug()`
  - `multilingualToolsService.searchTools()`
- **Fonctionnalités**:
  - Recherche dans la catégorie
  - Statistiques de la catégorie
  - Suggestions de catégories similaires

---

## Panel d'administration

### 5. **Tableau de bord admin** - `app/admin/page.tsx`
- **Route**: `/admin`
- **Fonctionnalité**: Dashboard administrateur avec statistiques
- **Protection**: Authentification NextAuth requise
- **Composants utilisés**:
  - `StatsCards` - Cartes de statistiques globales
  - `RecentActivity` - Activité récente
  - `QuickActions` - Actions rapides d'administration
- **Services**: 
  - `toolsService.getToolStatistics()`
  - `CategoriesService.getAllCategories()`
- **Fonctionnalités**:
  - Vue d'ensemble des métriques (outils, vues, clics)
  - Graphiques de performance
  - Liens rapides vers les sections d'administration

### 6. **Connexion admin** - `app/admin/login/page.tsx`
- **Route**: `/admin/login`
- **Fonctionnalité**: Interface d'authentification administrateur
- **Composants utilisés**:
  - Formulaire de connexion avec validation
  - Toggle de visibilité mot de passe
  - Messages d'erreur contextuels
- **Authentification**: NextAuth avec provider 'credentials'
- **Fonctionnalités**:
  - Validation côté client et serveur
  - Redirection après connexion réussie
  - Affichage des identifiants par défaut (dev)

### 7. **Gestion des outils** - `app/admin/tools/page.tsx`
- **Route**: `/admin/tools`
- **Fonctionnalité**: CRUD complet des outils IA
- **Protection**: Session admin requise
- **Composants utilisés**:
  - Tableau de données avec tri et pagination
  - Actions en lot (activation/désactivation)
  - Modales de confirmation
- **Services**: API `/api/tools` pour CRUD operations
- **Fonctionnalités**:
  - Recherche et filtrage avancés
  - Export des données
  - Gestion du statut et de la visibilité

### 8. **Édition d'outil** - `app/admin/tools/[id]/edit/page.tsx`
- **Route**: `/admin/tools/[id]/edit`
- **Fonctionnalité**: Formulaire d'édition complet d'un outil
- **Protection**: Session admin requise
- **Composants utilisés**:
  - Formulaire multi-sections avec validation
  - Upload d'images
  - Aperçu en temps réel
- **Services**: API `/api/tools/[id]` pour mise à jour
- **Sections du formulaire**:
  - Informations générales (nom, catégorie, URL)
  - Contenu (description, fonctionnalités, cas d'usage)
  - SEO (méta-titre, description, mots-clés)
  - Statut et visibilité

### 9. **Gestion des utilisateurs** - `app/admin/users/page.tsx`
- **Route**: `/admin/users`
- **Fonctionnalité**: Administration des utilisateurs admin
- **Protection**: Session super_admin requise
- **Composants utilisés**:
  - Tableau des utilisateurs avec rôles
  - Indicateurs de statut et dernière connexion
- **Fonctionnalités**:
  - Gestion des rôles et permissions
  - Historique des connexions
  - Activation/désactivation des comptes

---

## Outils de développement

### 10. **Interface de scraping** - `app/scraper/page.tsx`
- **Route**: `/scraper`
- **Fonctionnalité**: Interface avancée d'analyse automatique d'outils IA
- **Composants utilisés**:
  - Interface à onglets multi-modes
  - Logs en temps réel avec auto-scroll
  - Barres de progression pour traitement en lot
- **Services**: API `/api/scrape` pour analyse
- **Modes de fonctionnement**:
  - **URL Directe**: Analyse d'un URL externe
  - **Base de Données**: Mise à jour d'outils existants
  - **Traitement en Lot**: Optimisation massive d'outils
- **Fonctionnalités avancées**:
  - Mode professionnel avec prompts optimisés
  - Sélection granulaire des champs à mettre à jour
  - Filtrage par statut d'optimisation
  - Logs détaillés avec horodatage et codes couleur
  - Métriques de qualité et complétude

---

## Composants layout

### 11. **Layout principal** - `app/[lang]/layout.tsx`
- **Fonctionnalité**: Layout racine avec configuration multilingue
- **Composants utilisés**:
  - `Header` - Navigation principale avec sélecteur de langue
  - `Footer` - Pied de page avec liens légaux
  - `Providers` - Contextes globaux (NextAuth, Theme)
- **Configuration**:
  - Polices Google (Inter, JetBrains Mono)
  - Métadonnées SEO globales
  - Structure HTML5 sémantique

### 12. **Layout admin** - `app/admin/layout.tsx`
- **Fonctionnalité**: Layout spécifique à l'administration
- **Protection**: Middleware d'authentification
- **Composants utilisés**:
  - `AdminSidebar` - Navigation latérale administrative
  - `AdminHeader` - En-tête avec info utilisateur
  - Protection de routes avec redirection

---

## Pages d'erreur et spécialisées

### 13. **Page 404** - `app/not-found.tsx`
- **Fonctionnalité**: Gestion d'erreur 404 personnalisée
- **Composants**: Interface moderne avec suggestions de navigation

### 14. **Sitemap XML** - `app/sitemap.ts`
- **Route**: `/sitemap.xml`
- **Fonctionnalité**: Génération automatique du sitemap
- **Services**: Récupération des outils et catégories actifs
- **Configuration**:
  - URLs multilingues pour tous les outils
  - Fréquences de mise à jour appropriées
  - Priorités SEO optimisées

### 15. **Robots.txt** - `app/robots.ts`
- **Route**: `/robots.txt`
- **Fonctionnalité**: Configuration des crawlers
- **Directives**:
  - Allow: pages publiques
  - Disallow: admin, API, pages privées
  - Référence au sitemap

---

## API Routes

### 16. **API Tools** - `app/api/tools/route.ts`
- **Endpoints**: GET, POST `/api/tools`
- **Fonctionnalité**: CRUD des outils via API REST
- **Authentification**: JWT pour opérations sensibles

### 17. **API Tool individuel** - `app/api/tools/[id]/route.ts`
- **Endpoints**: GET, PUT, DELETE `/api/tools/[id]`
- **Fonctionnalité**: Opérations sur un outil spécifique

### 18. **API Scraping** - `app/api/scrape/route.ts`
- **Endpoint**: POST `/api/scrape`
- **Fonctionnalité**: Interface d'analyse automatique
- **Services**: Intégration avec services d'analyse IA

### 19. **API Analyse outil** - `app/api/tools/[id]/analyze/route.ts`
- **Endpoint**: POST `/api/tools/[id]/analyze`
- **Fonctionnalité**: Analyse et mise à jour d'un outil existant
- **Features**: Analyse sélective des champs, scoring qualité

---

## Architecture technique

### Services de base de données
- **`multilingualToolsService`**: Gestion multilingue des outils
- **`toolsService`**: Opérations CRUD standards 
- **`CategoriesService`**: Gestion des catégories
- **`DatabaseService`**: Couche d'abstraction PostgreSQL

### Composants UI réutilisables
- **`ToolsGrid`**: Grille responsive avec pagination
- **`ToolCard`**: Carte d'outil standardisée
- **`SearchBar`**: Composant de recherche avancée
- **`Pagination`**: Navigation entre pages
- **`LoadingSpinner`**: Indicateurs de chargement

### Types TypeScript
- **`Tool`**: Interface complète d'un outil IA
- **`Category`**: Structure des catégories
- **`ToolAnalysis`**: Résultats d'analyse automatique
- **`SearchParams`**: Paramètres de recherche et filtrage

### Authentification
- **NextAuth.js**: Système d'authentification
- **Providers**: Credentials, potentiellement OAuth
- **Middleware**: Protection des routes admin

---

## Performance et SEO

### Optimisations
- **Images**: Next.js Image avec optimisation automatique
- **Fonts**: Google Fonts avec preload
- **Static Generation**: Pages statiques quand possible
- **Dynamic Routes**: Génération à la demande

### SEO Features  
- **Métadonnées dynamiques**: Par page et langue
- **Open Graph**: Images et descriptions optimisées
- **Schema.org**: Markup structured data
- **Multilingue**: Support hreflang automatique

### Monitoring
- **Analytics**: Suivi des performances
- **Error Tracking**: Monitoring des erreurs
- **Performance**: Métriques Core Web Vitals

---

## Technologies utilisées

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TypeScript 5.9
- **Styling**: Tailwind CSS 3.4
- **Base de données**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Icons**: Heroicons
- **Deployment**: Architecture production prête

Cette architecture modulaire permet une maintenance facile et une scalabilité optimale pour la plateforme Video-IA.net.