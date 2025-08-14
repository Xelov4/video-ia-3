/**
 * Configurations pour le composant universel de recherche et filtrage
 * Définit les paramètres selon le contexte d'utilisation
 */

import type { SearchFiltersConfig } from '@/src/types/search'

// Configuration pour la page publique des outils
export const toolsPageConfig = (onFiltersChange: (filters: any) => void): SearchFiltersConfig => ({
  context: 'tools',
  searchPlaceholder: 'Rechercher des outils IA...',
  showSearch: true,
  showSort: true,
  showFilters: true,
  showMobileToggle: true,
  showResultsCount: true,
  showClearAll: true,
  enableUrlSync: true,
  enableLocalStorage: true,
  debounceMs: 300,
  filters: [
    {
      id: 'category',
      type: 'select',
      label: 'Catégorie',
      placeholder: 'Toutes les catégories',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    },
    {
      id: 'featured',
      type: 'select',
      label: 'Type',
      placeholder: 'Tous les outils',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    },
    {
      id: 'qualityScore',
      type: 'select',
      label: 'Qualité',
      placeholder: 'Tous les scores',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    }
  ],
  onFiltersChange
})

// Configuration pour la page d'administration des outils
export const adminToolsPageConfig = (onFiltersChange: (filters: any) => void): SearchFiltersConfig => ({
  context: 'admin-tools',
  searchPlaceholder: 'Rechercher dans les outils...',
  showSearch: true,
  showSort: true,
  showFilters: true,
  showMobileToggle: false,
  showResultsCount: true,
  showClearAll: true,
  enableUrlSync: true,
  enableLocalStorage: true,
  debounceMs: 300,
  filters: [
    {
      id: 'category',
      type: 'select',
      label: 'Catégorie',
      placeholder: 'Toutes les catégories',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    },
    {
      id: 'status',
      type: 'select',
      label: 'Statut',
      placeholder: 'Tous les statuts',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    },
    {
      id: 'featured',
      type: 'select',
      label: 'Vedette',
      placeholder: 'Tous les outils',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    },
    {
      id: 'qualityScore',
      type: 'select',
      label: 'Score qualité',
      placeholder: 'Tous les scores',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    }
  ],
  onFiltersChange
})

// Configuration pour la page publique des catégories
export const categoriesPageConfig = (onFiltersChange: (filters: any) => void): SearchFiltersConfig => ({
  context: 'categories',
  searchPlaceholder: 'Rechercher des catégories...',
  showSearch: true,
  showSort: true,
  showFilters: true,
  showMobileToggle: true,
  showResultsCount: true,
  showClearAll: true,
  enableUrlSync: true,
  enableLocalStorage: true,
  debounceMs: 300,
  filters: [
    {
      id: 'featured',
      type: 'select',
      label: 'Type',
      placeholder: 'Toutes les catégories',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    },
    {
      id: 'hasTools',
      type: 'select',
      label: 'Contenu',
      placeholder: 'Toutes',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    },
    {
      id: 'toolCount',
      type: 'select',
      label: 'Nombre d\'outils',
      placeholder: 'Tous les nombres',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    }
  ],
  onFiltersChange
})

// Configuration pour la page d'administration des catégories
export const adminCategoriesPageConfig = (onFiltersChange: (filters: any) => void): SearchFiltersConfig => ({
  context: 'admin-categories',
  searchPlaceholder: 'Rechercher dans les catégories...',
  showSearch: true,
  showSort: true,
  showFilters: true,
  showMobileToggle: true,
  showResultsCount: true,
  showClearAll: true,
  enableUrlSync: true,
  enableLocalStorage: true,
  debounceMs: 300,
  filters: [
    {
      id: 'featured',
      type: 'select',
      label: 'Vedette',
      placeholder: 'Toutes les catégories',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    },
    {
      id: 'hasTools',
      type: 'select',
      label: 'Contenu',
      placeholder: 'Toutes',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    },
    {
      id: 'toolCount',
      type: 'select',
      label: 'Nombre d\'outils',
      placeholder: 'Tous les nombres',
      options: [], // Rempli dynamiquement par l'API
      visible: true,
      clearable: true
    }
  ],
  onFiltersChange
})

// Configuration compacte pour les widgets ou sidebars
export const compactSearchConfig = (
  context: 'tools' | 'categories',
  onFiltersChange: (filters: any) => void
): SearchFiltersConfig => ({
  context,
  searchPlaceholder: context === 'tools' ? 'Rechercher...' : 'Rechercher catégories...',
  showSearch: true,
  showSort: false,
  showFilters: true,
  showMobileToggle: false,
  showResultsCount: false,
  showClearAll: true,
  enableUrlSync: false,
  enableLocalStorage: false,
  debounceMs: 200,
  filters: [
    {
      id: 'category',
      type: 'select',
      label: 'Catégorie',
      placeholder: 'Toutes',
      options: [],
      visible: context === 'tools',
      clearable: true
    },
    {
      id: 'featured',
      type: 'select',
      label: 'Type',
      placeholder: 'Tous',
      options: [],
      visible: true,
      clearable: true
    }
  ],
  onFiltersChange
})

// Fonction utilitaire pour obtenir une configuration selon le contexte
export function getSearchFiltersConfig(
  page: 'tools' | 'admin-tools' | 'categories' | 'admin-categories' | 'compact',
  context: 'tools' | 'categories' = 'tools',
  onFiltersChange: (filters: any) => void
): SearchFiltersConfig {
  switch (page) {
    case 'tools':
      return toolsPageConfig(onFiltersChange)
    
    case 'admin-tools':
      return adminToolsPageConfig(onFiltersChange)
    
    case 'categories':
      return categoriesPageConfig(onFiltersChange)
    
    case 'admin-categories':
      return adminCategoriesPageConfig(onFiltersChange)
    
    case 'compact':
      return compactSearchConfig(context, onFiltersChange)
    
    default:
      return toolsPageConfig(onFiltersChange)
  }
}

export default {
  toolsPageConfig,
  adminToolsPageConfig,
  categoriesPageConfig,
  adminCategoriesPageConfig,
  compactSearchConfig,
  getSearchFiltersConfig
}