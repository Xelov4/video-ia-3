# Système d'Administration de VideoIA.net

*Date de dernière mise à jour : 16 août 2025*

## Table des Matières
1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Générale](#architecture-générale)
3. [Pages d'Administration](#pages-dadministration)
4. [Composants d'Administration](#composants-dadministration)
5. [Gestion des Données](#gestion-des-données)
6. [Système d'Import/Export](#système-dimportexport)
7. [Sécurité et Authentification](#sécurité-et-authentification)
8. [API d'Administration](#api-dadministration)
9. [Interface Utilisateur](#interface-utilisateur)
10. [Bonnes Pratiques](#bonnes-pratiques)

## Vue d'Ensemble

Le système d'administration de VideoIA.net est une interface complète permettant aux administrateurs de gérer l'ensemble du contenu du site. Il comprend la gestion des outils IA, des catégories, des audiences cibles, et des traductions multilingues.

### Fonctionnalités Principales
- **Dashboard** : Vue d'ensemble avec statistiques et métriques
- **Gestion des Outils** : CRUD complet avec support multilingue
- **Gestion des Catégories** : Administration des catégories d'outils
- **Gestion des Audiences** : Administration des audiences cibles
- **DB Management** : Import/Export des données et consultation brute
- **Système de Filtrage** : Recherche et filtrage avancé sur tous les tableaux
- **Éditeur de Texte Riche** : Édition des contenus avec support multimédia

## Architecture Générale

### Structure des Dossiers
```
app/
├── admin/                    # Routes d'administration
│   ├── layout.tsx           # Layout principal admin
│   ├── page.tsx             # Dashboard (/admin)
│   ├── tools/               # Gestion des outils
│   │   ├── page.tsx         # Liste des outils (/admin/tools)
│   │   └── [id]/            # Édition d'un outil
│   │       └── page.tsx     # Page d'édition (/admin/tools/[id])
│   ├── categories/          # Gestion des catégories
│   │   ├── page.tsx         # Liste des catégories (/admin/categories)
│   │   └── [id]/            # Édition d'une catégorie
│   │       └── page.tsx     # Page d'édition (/admin/categories/[id])
│   ├── audiences/           # Gestion des audiences
│   │   ├── page.tsx         # Liste des audiences (/admin/audiences)
│   │   └── [id]/            # Édition d'une audience
│   │       └── page.tsx     # Page d'édition (/admin/audiences/[id])
│   └── db-management/       # Gestion de la base de données
│       └── page.tsx         # Page DB Management (/admin/db-management)
├── api/                     # API d'administration
│   └── admin/               # Endpoints protégés
│       ├── tools/           # API CRUD des outils
│       ├── categories/      # API CRUD des catégories
│       ├── audiences/       # API CRUD des audiences
│       └── import-export/   # API d'import/export
└── src/
    └── components/
        └── admin/           # Composants d'administration
            ├── dashboard/    # Composants du dashboard
            ├── tables/       # Composants de tableaux
            ├── forms/        # Composants de formulaires
            ├── editors/      # Éditeurs de texte riche
            └── filters/      # Composants de filtrage
```

### Authentification et Sécurité
- **Middleware d'authentification** : Protection de toutes les routes admin
- **Rôle administrateur** : Vérification des permissions
- **Session sécurisée** : Gestion des tokens JWT
- **Rate limiting** : Protection contre les abus

## Pages d'Administration

### 1. Dashboard (`/admin`)

**Fichier** : `app/admin/page.tsx`

**Fonctionnalités** :
- Vue d'ensemble des statistiques du site
- Métriques en temps réel
- Graphiques de performance
- Alertes et notifications
- Accès rapide aux fonctionnalités principales

**Composants** :
- `AdminDashboard` : Composant principal
- `StatsCards` : Cartes de statistiques
- `PerformanceChart` : Graphiques de performance
- `RecentActivity` : Activité récente
- `QuickActions` : Actions rapides

**Données affichées** :
- Nombre total d'outils
- Nombre de catégories
- Nombre d'utilisateurs
- Trafic du site
- Outils les plus populaires
- Traductions en attente de validation

### 2. Gestion des Outils (`/admin/tools`)

**Fichier** : `app/admin/tools/page.tsx`

**Fonctionnalités** :
- Tableau complet de tous les outils
- Système de filtrage avancé
- Recherche en temps réel
- Tri par colonnes
- Pagination
- Actions en lot (suppression, activation/désactivation)

**Composants** :
- `ToolsTable` : Tableau principal des outils
- `ToolsFilters` : Filtres de recherche
- `ToolsSearch` : Barre de recherche
- `BulkActions` : Actions en lot
- `Pagination` : Navigation des pages

**Colonnes du tableau** :
- ID
- Nom
- Slug
- Catégorie
- Score de qualité
- Nombre de vues
- Statut (actif/inactif)
- Mis en avant
- Date de création
- Actions (modifier, supprimer)

**Système de filtrage** :
- Par catégorie
- Par statut
- Par score de qualité
- Par date de création
- Par nombre de vues
- Par statut de traduction

### 3. Édition d'un Outil (`/admin/tools/[id]`)

**Fichier** : `app/admin/tools/[id]/page.tsx`

**Fonctionnalités** :
- Formulaire d'édition complet
- Onglets pour les différentes sections
- Support multilingue avec onglets de traduction
- Éditeur de texte riche
- Gestion des médias (images, vidéos)
- Validation en temps réel
- Sauvegarde automatique

**Structure des onglets** :
1. **Informations Générales**
   - Nom, slug, description
   - URL, catégorie, audience
   - Prix, fonctionnalités
   - Tags et métadonnées

2. **Traductions** (un onglet par langue)
   - Nom traduit
   - Description traduite
   - Aperçu traduit
   - Métadonnées SEO

3. **Médias**
   - Images de l'outil
   - Vidéos de démonstration
   - Logos et icônes

4. **Statistiques**
   - Nombre de vues
   - Score de qualité
   - Historique des modifications

**Composants** :
- `ToolEditForm` : Formulaire principal
- `TabNavigation` : Navigation des onglets
- `TranslationTabs` : Onglets de traduction
- `RichTextEditor` : Éditeur de texte riche
- `MediaManager` : Gestionnaire de médias
- `FormValidation` : Validation des formulaires

### 4. Gestion des Catégories (`/admin/categories`)

**Fichier** : `app/admin/categories/page.tsx`

**Fonctionnalités** :
- Tableau de toutes les catégories
- Statistiques par catégorie
- Filtrage et recherche
- Actions en lot

**Colonnes du tableau** :
- ID
- Nom
- Slug
- Description
- Nombre d'outils
- Icône
- Mis en avant
- Date de création
- Actions

**Statistiques affichées** :
- Nombre total d'outils par catégorie
- Pourcentage de la base totale
- Outils les plus populaires
- Traductions disponibles

### 5. Édition d'une Catégorie (`/admin/categories/[id]`)

**Fichier** : `app/admin/categories/[id]/page.tsx`

**Fonctionnalités** :
- Formulaire d'édition de catégorie
- Gestion des traductions
- Sélection d'icône
- Paramètres de mise en avant

**Composants** :
- `CategoryEditForm` : Formulaire d'édition
- `IconSelector` : Sélecteur d'icônes
- `TranslationFields` : Champs de traduction

### 6. Gestion des Audiences (`/admin/audiences`)

**Fichier** : `app/admin/audiences/page.tsx`

**Fonctionnalités** :
- Tableau des audiences cibles
- Statistiques d'utilisation
- Gestion des relations avec les outils

**Structure similaire** aux catégories avec :
- Tableau de données
- Filtrage et recherche
- Actions CRUD
- Page d'édition dédiée

### 7. DB Management (`/admin/db-management`)

**Fichier** : `app/admin/db-management/page.tsx`

**Fonctionnalités** :
- Consultation brute des données
- Export des données
- Import de données
- Gestion des sauvegardes
- Monitoring de la base

**Composants** :
- `DatabaseViewer` : Visualiseur de données
- `ExportManager` : Gestionnaire d'export
- `ImportManager` : Gestionnaire d'import
- `BackupManager` : Gestionnaire de sauvegardes

## Composants d'Administration

### Composants de Tableaux

#### `AdminTable` (basé sur shadcn/ui table)
**Emplacement** : `src/components/admin/tables/AdminTable.tsx`

**Fonctionnalités** :
- Tableau générique réutilisable basé sur le composant `table` de shadcn/ui
- Tri par colonnes avec icônes de direction
- Pagination intégrée avec le composant `pagination`
- Sélection multiple avec `checkbox`
- Actions en lot avec `dropdown-menu`
- Responsive design avec `scroll-area`
- États de chargement avec `skeleton`

**Props** :
```typescript
interface AdminTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  onRowSelect?: (selectedRows: T[]) => void
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  pagination?: PaginationConfig
  loading?: boolean
  emptyMessage?: string
}
```

**Implémentation avec shadcn/ui** :
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
```

#### `DataTable` (basé sur shadcn/ui table + command)
**Emplacement** : `src/components/admin/tables/DataTable.tsx`

**Fonctionnalités** :
- Tableau de données avec filtrage avancé
- Recherche en temps réel avec le composant `command`
- Export des données avec `button` et `dropdown-menu`
- Personnalisation des colonnes
- Filtrage avec `select` et `input`

### Composants de Filtrage

#### `AdvancedFilters` (basé sur shadcn/ui form + input + select)
**Emplacement** : `src/components/admin/filters/AdvancedFilters.tsx`

**Fonctionnalités** :
- Filtres multiples avec `form` et `field`
- Recherche textuelle avec `input` et `textarea`
- Filtres par date avec `calendar` et `popover`
- Filtres par statut avec `select` et `radio-group`
- Filtres par catégorie avec `checkbox` et `toggle-group`
- Sauvegarde des filtres avec `button` et `tooltip`

**Composants shadcn/ui utilisés** :
```tsx
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
```

#### `SearchBar` (basé sur shadcn/ui command + input)
**Emplacement** : `src/components/admin/filters/SearchBar.tsx`

**Fonctionnalités** :
- Recherche en temps réel avec `command`
- Suggestions automatiques avec `command-list`
- Historique des recherches avec `command-item`
- Filtres de recherche avec `input` et `select`

### Composants de Formulaires

#### `AdminForm` (basé sur shadcn/ui form + input + textarea)
**Emplacement** : `src/components/admin/forms/AdminForm.tsx`

**Fonctionnalités** :
- Formulaire générique avec `form` et `form-field`
- Validation automatique avec `form-message`
- Gestion des erreurs avec `alert` et `alert-dialog`
- Sauvegarde automatique avec `button` et `progress`
- Support multilingue avec `tabs` et `select`

**Composants shadcn/ui utilisés** :
```tsx
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
```

#### `RichTextEditor` (basé sur shadcn/ui textarea + button + toolbar)
**Emplacement** : `src/components/admin/editors/RichTextEditor.tsx`

**Fonctionnalités** :
- Éditeur WYSIWYG avec `textarea` et `input`
- Support des liens avec `input` et `button`
- Insertion d'images avec `input` et `aspect-ratio`
- Insertion de vidéos avec `input` et `video`
- Formatage du texte avec `toggle-group` et `button`
- Support multilingue avec `tabs`

**Composants shadcn/ui utilisés** :
```tsx
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toggle, ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
```

### Composants de Navigation

#### `AdminSidebar` (basé sur shadcn/ui sidebar + navigation-menu)
**Emplacement** : `src/components/admin/navigation/AdminSidebar.tsx`

**Fonctionnalités** :
- Navigation principale avec `sidebar`
- Sous-menus avec `navigation-menu`
- Indicateurs de statut avec `badge`
- Accès rapide avec `button` et `tooltip`

**Composants shadcn/ui utilisés** :
```tsx
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuLabel, SidebarMenuSeparator, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubLabel, SidebarMenuSubSeparator, SidebarMenuSubTrigger, SidebarMenuTrigger } from "@/components/ui/sidebar"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport } from "@/components/ui/navigation-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
```

#### `Breadcrumbs` (basé sur shadcn/ui breadcrumb)
**Emplacement** : `src/components/admin/navigation/Breadcrumbs.tsx`

**Fonctionnalités** :
- Navigation hiérarchique avec `breadcrumb`
- Liens de retour avec `button`
- Contexte de navigation avec `separator`

**Composants shadcn/ui utilisés** :
```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
```

### Composants de Dashboard

#### `StatsCards` (basé sur shadcn/ui card + badge + progress)
**Emplacement** : `src/components/admin/dashboard/StatsCards.tsx`

**Fonctionnalités** :
- Cartes de statistiques avec `card`
- Indicateurs de statut avec `badge`
- Barres de progression avec `progress`
- Icônes et métriques avec `avatar`

**Composants shadcn/ui utilisés** :
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
```

#### `PerformanceChart` (basé sur shadcn/ui chart + card)
**Emplacement** : `src/components/admin/dashboard/PerformanceChart.tsx`

**Fonctionnalités** :
- Graphiques de performance avec `chart`
- Conteneurs avec `card`
- Légendes avec `badge`

**Composants shadcn/ui utilisés** :
```tsx
import { Chart, ChartContainer, ChartDescription, ChartHeader, ChartLegend, ChartTitle, ChartTooltip, ChartTooltipContent, ChartTooltipTrigger } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
```

#### `RecentActivity` (basé sur shadcn/ui card + avatar + badge)
**Emplacement** : `src/components/admin/dashboard/RecentActivity.tsx`

**Fonctionnalités** :
- Activité récente avec `card`
- Avatars utilisateurs avec `avatar`
- Statuts avec `badge`
- Séparateurs avec `separator`

**Composants shadcn/ui utilisés** :
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
```

#### `QuickActions` (basé sur shadcn/ui button + card + tooltip)
**Emplacement** : `src/components/admin/dashboard/QuickActions.tsx`

**Fonctionnalités** :
- Actions rapides avec `button`
- Conteneurs avec `card`
- Infobulles avec `tooltip`
- Icônes avec `button`

**Composants shadcn/ui utilisés** :
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
```

### Composants de Gestion des Médias

#### `MediaManager` (basé sur shadcn/ui card + input + button + aspect-ratio)
**Emplacement** : `src/components/admin/media/MediaManager.tsx`

**Fonctionnalités** :
- Gestion des médias avec `card`
- Upload avec `input` et `button`
- Prévisualisation avec `aspect-ratio`
- Galerie avec `carousel`
- Actions avec `dropdown-menu`

**Composants shadcn/ui utilisés** :
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
```

### Composants de Gestion des Données

#### `ImportExportManager` (basé sur shadcn/ui card + button + progress + alert)
**Emplacement** : `src/components/admin/import-export/ImportExportManager.tsx`

**Fonctionnalités** :
- Interface d'import/export avec `card`
- Boutons d'action avec `button`
- Barres de progression avec `progress`
- Alertes avec `alert`
- Notifications avec `sonner`

**Composants shadcn/ui utilisés** :
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Toaster } from "@/components/ui/sonner"
```

#### `DatabaseViewer` (basé sur shadcn/ui table + card + input + select)
**Emplacement** : `src/components/admin/db-management/DatabaseViewer.tsx`

**Fonctionnalités** :
- Visualiseur de données avec `table`
- Conteneurs avec `card`
- Filtres avec `input` et `select`
- Pagination avec `pagination`
- Actions avec `button`

**Composants shadcn/ui utilisés** :
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
```

### Composants de Validation et Feedback

#### `FormValidation` (basé sur shadcn/ui form + alert + badge)
**Emplacement** : `src/components/admin/forms/FormValidation.tsx`

**Fonctionnalités** :
- Validation des formulaires avec `form`
- Messages d'erreur avec `alert`
- Indicateurs de statut avec `badge`
- Notifications avec `sonner`

**Composants shadcn/ui utilisés** :
```tsx
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/sonner"
```

### Composants de Sélection et Interface

#### `IconSelector` (basé sur shadcn/ui select + button + popover)
**Emplacement** : `src/components/admin/forms/IconSelector.tsx`

**Fonctionnalités** :
- Sélection d'icônes avec `select`
- Boutons de sélection avec `button`
- Popup de sélection avec `popover`
- Grille d'icônes avec `grid`

**Composants shadcn/ui utilisés** :
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
```

#### `TranslationFields` (basé sur shadcn/ui tabs + input + textarea + select)
**Emplacement** : `src/components/admin/forms/TranslationFields.tsx`

**Fonctionnalités** :
- Champs de traduction avec `tabs`
- Saisie de texte avec `input` et `textarea`
- Sélection de langue avec `select`
- Validation avec `form`

**Composants shadcn/ui utilisés** :
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
```

### Composants d'Interface Avancée

#### `ResizablePanels` (basé sur shadcn/ui resizable)
**Emplacement** : `src/components/admin/interface/ResizablePanels.tsx`

**Fonctionnalités** :
- Panneaux redimensionnables avec `resizable`
- Interface flexible pour l'édition
- Gestion de l'espace d'écran

**Composants shadcn/ui utilisés** :
```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
```

#### `CollapsibleSections` (basé sur shadcn/ui collapsible)
**Emplacement** : `src/components/admin/interface/CollapsibleSections.tsx`

**Fonctionnalités** :
- Sections pliables avec `collapsible`
- Interface organisée
- Économie d'espace

**Composants shadcn/ui utilisés** :
```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
```

#### `HoverCards` (basé sur shadcn/ui hover-card)
**Emplacement** : `src/components/admin/interface/HoverCards.tsx`

**Fonctionnalités** :
- Cartes au survol avec `hover-card`
- Informations contextuelles
- Interface intuitive

**Composants shadcn/ui utilisés** :
```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
```

### Composants de Notifications et Feedback

#### `NotificationSystem` (basé sur shadcn/ui sonner + alert + toast)
**Emplacement** : `src/components/admin/notifications/NotificationSystem.tsx`

**Fonctionnalités** :
- Système de notifications avec `sonner`
- Alertes avec `alert`
- Toast notifications
- Gestion des erreurs

**Composants shadcn/ui utilisés** :
```tsx
import { Toaster } from "@/components/ui/sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
```

### Composants de Gestion des Sessions

#### `SessionManager` (basé sur shadcn/ui avatar + dropdown-menu + button)
**Emplacement** : `src/components/admin/session/SessionManager.tsx`

**Fonctionnalités** :
- Gestion des sessions avec `avatar`
- Menu utilisateur avec `dropdown-menu`
- Actions de session avec `button`
- Statut de connexion

**Composants shadcn/ui utilisés** :
```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
```

## Gestion des Données

### Services d'Administration

#### `AdminToolsService`
**Emplacement** : `src/lib/database/services/admin-tools.ts`

**Fonctionnalités** :
- CRUD complet des outils
- Gestion des traductions
- Validation des données
- Gestion des médias

#### `AdminCategoriesService`
**Emplacement** : `src/lib/database/services/admin-categories.ts`

**Fonctionnalités** :
- CRUD des catégories
- Gestion des traductions
- Statistiques des catégories

#### `AdminAudiencesService`
**Emplacement** : `src/lib/database/services/admin-audiences.ts`

**Fonctionnalités** :
- CRUD des audiences
- Relations avec les outils
- Statistiques d'utilisation

### Validation des Données

#### Schémas Zod
**Emplacement** : `src/lib/validation/admin-schemas.ts`

**Schémas définis** :
- `ToolCreateSchema` : Création d'outil
- `ToolUpdateSchema` : Mise à jour d'outil
- `CategorySchema` : Schéma de catégorie
- `AudienceSchema` : Schéma d'audience
- `TranslationSchema` : Schéma de traduction

### Gestion des Médias

#### `MediaService`
**Emplacement** : `src/lib/services/media.ts`

**Fonctionnalités** :
- Upload d'images
- Upload de vidéos
- Redimensionnement automatique
- Optimisation des fichiers
- Gestion du stockage

## Système d'Import/Export

### Export des Données

#### Formats Supportés
- **CSV** : Format principal pour l'import/export
- **JSON** : Export pour sauvegarde
- **Excel** : Export pour analyse

#### Fonctionnalités d'Export
- Export sélectif par table
- Export avec filtres
- Export des traductions
- Export des relations
- Export des métadonnées

### Import des Données

#### Validation des Imports
- Validation des schémas
- Vérification des relations
- Gestion des doublons
- Validation des traductions

#### Gestion des Erreurs
- Rapport d'erreurs détaillé
- Rollback en cas d'échec
- Logs d'import
- Validation pré-import

### Composants d'Import/Export

#### `ImportExportManager`
**Emplacement** : `src/components/admin/import-export/ImportExportManager.tsx`

**Fonctionnalités** :
- Interface d'import/export
- Gestion des fichiers
- Suivi des opérations
- Rapports de résultats

## Sécurité et Authentification

### Middleware d'Authentification

#### `AdminAuthMiddleware`
**Emplacement** : `src/lib/auth/adminMiddleware.ts`

**Fonctionnalités** :
- Vérification des tokens JWT
- Validation des rôles
- Protection des routes
- Gestion des sessions

### Gestion des Permissions

#### Rôles et Permissions
- **Super Admin** : Accès complet
- **Admin** : Gestion du contenu
- **Editor** : Édition limitée
- **Viewer** : Lecture seule

### Sécurité des Données

#### Protection contre les Attaques
- Validation des entrées
- Protection CSRF
- Rate limiting
- Sanitisation des données

## API d'Administration

### Endpoints Principaux

#### `/api/admin/tools`
- `GET` : Liste des outils avec filtres
- `POST` : Création d'un outil
- `PUT` : Mise à jour d'un outil
- `DELETE` : Suppression d'un outil

#### `/api/admin/categories`
- `GET` : Liste des catégories
- `POST` : Création d'une catégorie
- `PUT` : Mise à jour d'une catégorie
- `DELETE` : Suppression d'une catégorie

#### `/api/admin/audiences`
- `GET` : Liste des audiences
- `POST` : Création d'une audience
- `PUT` : Mise à jour d'une audience
- `DELETE` : Suppression d'une audience

#### `/api/admin/import-export`
- `POST /export` : Export des données
- `POST /import` : Import des données
- `GET /templates` : Modèles d'import

### Validation et Sécurité

#### Middleware de Sécurité
- Authentification obligatoire
- Validation des rôles
- Rate limiting
- Logging des actions

## Interface Utilisateur

### Design System basé sur shadcn/ui

#### Composants UI Intégrés
- **46 composants shadcn/ui** intégrés dans le système d'administration
- **Thème cohérent** avec le reste du site VideoIA.net
- **Responsive design** pour tous les écrans (mobile, tablet, desktop)
- **Accessibilité** conforme aux standards WCAG 2.1 AA
- **Performance** optimisée avec lazy loading et memoization

#### Palette de Couleurs shadcn/ui
- **Primaire** : Bleu (#3B82F6) - Boutons, liens, éléments d'accent
- **Secondaire** : Gris (#6B7280) - Texte secondaire, bordures
- **Succès** : Vert (#10B981) - Actions réussies, indicateurs positifs
- **Avertissement** : Orange (#F59E0B) - Alertes, actions nécessitant attention
- **Erreur** : Rouge (#EF4444) - Erreurs, actions destructives
- **Neutre** : Blanc/Noir - Arrière-plans, texte principal

#### Système de Composants shadcn/ui

##### **Composants de Base (Priorité 1)**
- **`button`** - Tous les boutons d'action (primaire, secondaire, outline, ghost)
- **`input`** - Champs de saisie texte, recherche, formulaires
- **`textarea`** - Zones de texte long, descriptions, contenus
- **`label`** - Étiquettes de formulaire, accessibilité
- **`card`** - Conteneurs pour toutes les informations, statistiques
- **`table`** - Tableaux de données, listes, grilles

##### **Composants de Navigation (Priorité 1)**
- **`sidebar`** - Navigation principale de l'administration
- **`breadcrumb`** - Navigation hiérarchique, fil d'Ariane
- **`navigation-menu`** - Menus de navigation avec sous-menus
- **`tabs`** - Onglets pour l'édition d'outils, traductions
- **`pagination`** - Navigation des pages, pagination des tableaux

##### **Composants de Formulaire (Priorité 1)**
- **`form`** - Formulaires avec validation Zod, gestion des erreurs
- **`select`** - Menus déroulants, sélection de catégories/langues
- **`checkbox`** - Cases à cocher, sélection multiple
- **`radio-group`** - Boutons radio, choix exclusifs
- **`switch`** - Interrupteurs, activation/désactivation
- **`toggle`** - Boutons bascule, états binaires

##### **Composants de Données (Priorité 2)**
- **`badge`** - Étiquettes, statuts, indicateurs
- **`avatar`** - Images de profil, icônes utilisateurs
- **`progress`** - Barres de progression, indicateurs de chargement
- **`skeleton`** - Placeholders de chargement, états vides
- **`chart`** - Graphiques, visualisations de données

##### **Composants d'Interaction (Priorité 2)**
- **`dialog`** - Modales, confirmations, formulaires popup
- **`alert-dialog`** - Dialogues d'alerte, confirmations destructives
- **`popover`** - Popups contextuels, informations supplémentaires
- **`tooltip`** - Infobulles, aide contextuelle
- **`dropdown-menu`** - Menus contextuels, actions rapides
- **`hover-card`** - Cartes au survol, aperçus

##### **Composants Avancés (Priorité 3)**
- **`command`** - Interface de commande, recherche avancée
- **`calendar`** - Sélecteur de dates, filtres temporels
- **`carousel`** - Galeries d'images, médias
- **`resizable`** - Panneaux redimensionnables, interface flexible
- **`collapsible`** - Sections pliables, organisation du contenu
- **`aspect-ratio`** - Ratios d'aspect, images responsives

##### **Composants de Feedback (Priorité 2)**
- **`alert`** - Messages d'information, avertissements, erreurs
- **`sonner`** - Notifications toast, feedback utilisateur
- **`toast`** - Notifications temporaires, confirmations

#### Implémentation des Composants

##### **Structure des Imports**
```tsx
// Exemple d'import pour un composant admin
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
```

##### **Utilisation dans les Composants Admin**
```tsx
// Exemple de composant StatsCard utilisant shadcn/ui
export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {change > 0 ? '+' : ''}{change}% par rapport au mois dernier
        </p>
      </CardContent>
    </Card>
  )
}
```

##### **Thème et Personnalisation**
```tsx
// Configuration du thème dans tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... autres couleurs
      }
    }
  }
}
```

### Responsive Design

#### Breakpoints
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

#### Adaptations
- Navigation mobile avec hamburger
- Tableaux scrollables sur mobile
- Formulaires adaptés aux petits écrans
- Actions contextuelles

## Bonnes Pratiques

### Performance

#### Optimisations
- **Lazy loading** des composants
- **Memoization** des calculs coûteux
- **Pagination** des données
- **Cache** des requêtes fréquentes

#### Monitoring
- **Core Web Vitals** : LCP, FID, CLS
- **Performance des requêtes** : Temps de réponse
- **Utilisation mémoire** : Gestion des composants

### Accessibilité

#### Standards
- **WCAG 2.1 AA** : Conformité complète
- **Navigation clavier** : Support complet
- **Lecteurs d'écran** : Compatibilité
- **Contraste** : Ratios appropriés

### Tests

#### Stratégie de Test
- **Tests unitaires** : Composants et services
- **Tests d'intégration** : API et base de données
- **Tests E2E** : Parcours utilisateur complets
- **Tests de performance** : Charge et stress

#### Outils de Test
- **Jest** : Tests unitaires
- **Testing Library** : Tests de composants
- **Playwright** : Tests E2E
- **Lighthouse** : Tests de performance

### Maintenance

#### Code Quality
- **ESLint** : Linting strict
- **Prettier** : Formatage automatique
- **TypeScript** : Typage strict
- **Husky** : Hooks pre-commit

#### Documentation
- **JSDoc** : Documentation des composants
- **Storybook** : Documentation des composants UI
- **README** : Guide d'utilisation
- **Changelog** : Historique des versions

## Exemples d'Implémentation Pratiques

### Dashboard Principal

#### Implémentation du Dashboard
```tsx
// app/admin/page.tsx
import { StatsCards } from '@/src/components/admin/dashboard/StatsCards'
import { PerformanceChart } from '@/src/components/admin/dashboard/PerformanceChart'
import { RecentActivity } from '@/src/components/admin/dashboard/RecentActivity'
import { QuickActions } from '@/src/components/admin/dashboard/QuickActions'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCards />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PerformanceChart />
        <RecentActivity />
      </div>
      
      <QuickActions />
    </div>
  )
}
```

### Tableau des Outils

#### Implémentation du Tableau
```tsx
// src/components/admin/tables/ToolsTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ToolsTable({ tools, onEdit, onDelete }: ToolsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map((tool) => (
          <TableRow key={tool.id}>
            <TableCell>{tool.name}</TableCell>
            <TableCell>{tool.category}</TableCell>
            <TableCell>{tool.quality_score}</TableCell>
            <TableCell>
              <Badge variant={tool.is_active ? "default" : "secondary"}>
                {tool.is_active ? "Actif" : "Inactif"}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEdit(tool.id)}>
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(tool.id)}>
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Formulaire d'Édition d'Outil

#### Implémentation du Formulaire
```tsx
// src/components/admin/forms/ToolEditForm.tsx
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ToolEditForm({ tool, onSubmit }: ToolEditFormProps) {
  const form = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: tool
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">Informations Générales</TabsTrigger>
            <TabsTrigger value="translations">Traductions</TabsTrigger>
            <TabsTrigger value="media">Médias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informations de Base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'outil</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="translations">
            <TranslationTabs tool={tool} />
          </TabsContent>
          
          <TabsContent value="media">
            <MediaManager tool={tool} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button type="submit">Sauvegarder</Button>
          <Button type="button" variant="outline">Annuler</Button>
        </div>
      </form>
    </Form>
  )
}
```

### Système de Filtrage

#### Implémentation des Filtres
```tsx
// src/components/admin/filters/AdvancedFilters.tsx
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: filters
  })

  return (
    <Form {...form}>
      <form className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recherche</FormLabel>
              <FormControl>
                <Input placeholder="Rechercher..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={field.value?.includes('active')}
                  onCheckedChange={(checked) => {
                    const current = field.value || []
                    if (checked) {
                      field.onChange([...current, 'active'])
                    } else {
                      field.onChange(current.filter(v => v !== 'active'))
                    }
                  }}
                />
                <label htmlFor="active">Actif</label>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Appliquer les filtres
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

### Gestion des Médias

#### Implémentation du Gestionnaire de Médias
```tsx
// src/components/admin/media/MediaManager.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function MediaManager({ tool, onMediaChange }: MediaManagerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Médias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Image principale</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'main')}
            />
            {tool.image_url && (
              <AspectRatio ratio={16 / 9} className="mt-2">
                <img
                  src={tool.image_url}
                  alt={tool.name}
                  className="rounded-md object-cover"
                />
              </AspectRatio>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium">Vidéo de démonstration</label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoUpload(e)}
            />
            {tool.video_url && (
              <video
                src={tool.video_url}
                controls
                className="w-full mt-2 rounded-md"
              />
            )}
          </div>
        </div>
        
        {tool.media && tool.media.length > 0 && (
          <div>
            <label className="text-sm font-medium">Galerie d'images</label>
            <Carousel className="w-full max-w-xs">
              <CarouselContent>
                {tool.media.map((media, index) => (
                  <CarouselItem key={index}>
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <img
                          src={media.url}
                          alt={media.alt}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### Système d'Import/Export

#### Implémentation de l'Import/Export
```tsx
// src/components/admin/import-export/ImportExportManager.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ImportExportManager() {
  const [importProgress, setImportProgress] = useState(0)
  const [exportProgress, setExportProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'importing' | 'exporting' | 'error'>('idle')

  const handleImport = async (file: File) => {
    setStatus('importing')
    setImportProgress(0)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/admin/import-export/import', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        setStatus('idle')
        toast.success('Import réussi !')
      } else {
        throw new Error('Erreur lors de l\'import')
      }
    } catch (error) {
      setStatus('error')
      toast.error('Erreur lors de l\'import')
    }
  }

  const handleExport = async (format: string) => {
    setStatus('exporting')
    setExportProgress(0)
    
    try {
      const response = await fetch('/api/admin/import-export/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `export-${format}-${new Date().toISOString()}.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
        
        setStatus('idle')
        toast.success('Export réussi !')
      } else {
        throw new Error('Erreur lors de l\'export')
      }
    } catch (error) {
      setStatus('error')
      toast.error('Erreur lors de l\'export')
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Import de Données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept=".csv,.json,.xlsx"
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
          />
          
          {status === 'importing' && (
            <div className="space-y-2">
              <Progress value={importProgress} />
              <p className="text-sm text-muted-foreground">
                Import en cours... {importProgress}%
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <Alert>
              <AlertDescription>
                Une erreur s'est produite lors de l'import
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Export de Données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={handleExport}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
            </SelectContent>
          </Select>
          
          {status === 'exporting' && (
            <div className="space-y-2">
              <Progress value={exportProgress} />
              <p className="text-sm text-muted-foreground">
                Export en cours... {exportProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

*Cette documentation est maintenue par l'équipe de développement VideoIA.net. Pour toute question ou suggestion concernant le système d'administration, veuillez contacter l'équipe technique.*
