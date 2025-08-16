/**
 * Types pour le composant de recherche et filtrage universel
 */

export interface FilterOption {
  value: string
  label: string
  count?: number
  emoji?: string
  default?: boolean
  disabled?: boolean
}

export interface SortOption {
  value: string
  label: string
  default?: boolean
}

export interface FilterConfig {
  id: string
  type: 'select' | 'multiselect' | 'toggle' | 'range' | 'search' | 'tags'
  label: string
  placeholder?: string
  options: FilterOption[]
  defaultValue?: any
  visible?: boolean
  required?: boolean
  searchable?: boolean
  clearable?: boolean
}

export interface SearchFiltersMetadata {
  context: string
  timestamp: string
  categories?: FilterOption[]
  tags?: FilterOption[]
  sortOptions: SortOption[]
  filterOptions: Record<string, FilterOption[]>
  stats?: {
    totalTools?: number
    totalCategories?: number
    minQualityScore?: number
    maxQualityScore?: number
    averageToolsPerCategory?: number
    featuredCategories?: number
    emptyCategoriesCount?: number
  }
}

export interface FilterState {
  search: string
  category: string
  tags: string[]
  featured: string
  status: string
  toolCount: string
  hasTools: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page?: string
  [key: string]: string | string[] | undefined
}

export interface SearchFiltersConfig {
  context: 'tools' | 'admin-tools' | 'categories' | 'admin-categories'
  apiEndpoint?: string
  searchPlaceholder: string
  showSearch: boolean
  showSort: boolean
  showFilters: boolean
  showMobileToggle: boolean
  showResultsCount: boolean
  showClearAll: boolean
  enableUrlSync: boolean
  enableLocalStorage: boolean
  debounceMs: number
  filters: FilterConfig[]
  onFiltersChange: (filters: FilterState) => void
  onReset?: () => void
  customActions?: React.ReactNode
}

export interface SearchFiltersProps {
  config: SearchFiltersConfig
  metadata?: SearchFiltersMetadata
  loading?: boolean
  error?: string
  className?: string
  compact?: boolean
}

export interface UseSearchFiltersOptions {
  context: SearchFiltersConfig['context']
  initialFilters?: Partial<FilterState>
  enableUrlSync?: boolean
  enableLocalStorage?: boolean
  debounceMs?: number
  onFiltersChange?: (filters: FilterState) => void
}

export interface UseSearchFiltersReturn {
  // État des filtres
  filters: FilterState
  
  // Métadonnées (catégories, options, etc.)
  metadata: SearchFiltersMetadata | null
  
  // États de chargement
  loading: boolean
  error: string | null
  
  // Actions
  updateFilter: (key: keyof FilterState, value: string | string[]) => void
  updateFilters: (updates: Partial<FilterState>) => void
  resetFilters: () => void
  applyFilters: () => void
  
  // URL et localStorage sync
  syncToUrl: () => void
  loadFromUrl: () => void
  clearUrl: () => void
  
  // Métadonnées actions
  refreshMetadata: () => Promise<void>
  
  // Filtres actifs count
  activeFiltersCount: number
}

export interface SearchResultsInfo {
  total: number
  showing: number
  page: number
  hasMore: boolean
  query?: string
  appliedFilters?: string[]
}