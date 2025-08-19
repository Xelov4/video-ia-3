/**
 * Types unifiés pour résoudre les incohérences entre DB et application
 * Phase 1.1 : Types de base consolidés
 */

import type { LanguageCode } from '../lib/database/types';

// ============================================================================
// API RESPONSE TYPES - Remplacement des `any`
// ============================================================================

/**
 * Structure de réponse API standardisée
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  pagination?: {
    totalCount: number;
    page: number;
    limit: number;
    hasMore: boolean;
    totalPages?: number;
  };
}

/**
 * Structure d'erreur API standardisée
 */
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Union type pour les réponses API
 */
export type ApiResult<T = unknown> = ApiResponse<T> | ApiError;

// ============================================================================
// DATABASE vs APPLICATION ADAPTERS
// ============================================================================

/**
 * Interface pour les catégories avec harmonisation des noms
 */
export interface CategoryBase {
  id: number;
  name: string;
  slug: string;
  description: string;
}

/**
 * Catégorie avec comptage d'outils (DB response avec snake_case)
 */
export interface CategoryWithCount extends CategoryBase {
  tool_count: number; // DB response
  toolCount?: never; // Exclusion mutuelle
}

/**
 * Catégorie adaptée pour l'application (camelCase)
 */
export interface Category extends CategoryBase {
  toolCount: number; // Application usage
  tool_count?: never; // Exclusion mutuelle
  actualToolCount?: number;
  displayName: string;
  displayDescription: string;
  iconName?: string;
  emoji?: string;
  isPopular?: boolean;
}

/**
 * Adaptateur pour transformer les réponses DB en format application
 */
export const adaptCategory = (raw: CategoryWithCount | Category | any): Category => {
  // Si c'est déjà au bon format
  if ('toolCount' in raw && typeof raw.toolCount === 'number') {
    return raw as Category;
  }

  // Si c'est une réponse DB avec snake_case
  const toolCount = raw.tool_count || raw.toolCount || raw.actualToolCount || 0;
  
  return {
    id: raw.id || 0,
    name: raw.name || '',
    slug: raw.slug || null,
    description: raw.description || null,
    toolCount,
    actualToolCount: toolCount,
    displayName: raw.displayName || raw.name || '',
    displayDescription: raw.displayDescription || raw.description || null,
    iconName: raw.iconName || undefined,
    emoji: raw.emoji || undefined,
    isPopular: raw.isPopular || false,
  };
};

// ============================================================================
// TOOL TYPES UNIFIÉS
// ============================================================================

/**
 * Interface de base pour un outil
 */
export interface ToolBase {
  id: number;
  slug: string;
  toolName: string;
  toolCategory: string;
  toolDescription: string | null;
  toolOverview: string | null;
  toolLink: string | null;
  imageUrl: string | null;
  isActive: boolean;
  featured: boolean;
  createdAt: Date | string;
}

/**
 * Outil avec traductions pour l'application
 */
export interface Tool extends ToolBase {
  displayName: string;
  displayDescription: string;
  displayOverview: string;
  category: string; // Alias pour toolCategory
  overview?: string; // Alias pour displayOverview
  description?: string; // Alias pour displayDescription
  
  // Métadonnées optionnelles
  isNew?: boolean;
  qualityScore?: number;
  views?: number;
  likes?: number;
  pricing?: 'free' | 'freemium' | 'paid' | 'enterprise';
  tags?: string[];
  lastUpdated?: string;
}

/**
 * Adaptateur pour transformer les réponses d'outils
 */
export const adaptTool = (raw: any): Tool => {
  return {
    id: raw.id || 0,
    slug: raw.slug || '',
    toolName: raw.toolName || raw.tool_name || '',
    toolCategory: raw.toolCategory || raw.tool_category || '',
    toolDescription: raw.toolDescription || raw.tool_description || null,
    toolOverview: raw.toolOverview || raw.tool_overview || null,
    toolLink: raw.toolLink || raw.tool_link || null,
    imageUrl: raw.imageUrl || raw.image_url || null,
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    featured: Boolean(raw.featured ?? false),
    createdAt: raw.createdAt || raw.created_at || new Date(),
    
    // Champs calculés
    displayName: raw.displayName || raw.toolName || raw.tool_name || '',
    displayDescription: raw.displayDescription || raw.toolDescription || raw.tool_description || null,
    displayOverview: raw.displayOverview || raw.toolOverview || raw.tool_overview || null,
    
    // Aliases
    category: raw.toolCategory || raw.tool_category || '',
    overview: raw.displayOverview || raw.toolOverview || raw.tool_overview || null,
    description: raw.displayDescription || raw.toolDescription || raw.tool_description || null,
    
    // Métadonnées optionnelles
    isNew: raw.isNew,
    qualityScore: raw.qualityScore,
    views: raw.views,
    likes: raw.likes,
    pricing: raw.pricing,
    tags: raw.tags,
    lastUpdated: raw.lastUpdated,
  };
};

// ============================================================================
// SEARCH & PAGINATION TYPES
// ============================================================================

/**
 * Paramètres de recherche standardisés
 */
export interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'featured' | 'quality_score' | 'view_count';
  sortOrder?: 'asc' | 'desc';
  lang?: LanguageCode;
}

/**
 * Résultats de recherche avec pagination
 */
export interface SearchResults<T = unknown> {
  data: T[];
  pagination: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================================================
// TYPE GUARDS - Pour validation runtime
// ============================================================================

/**
 * Vérifie si un objet est une réponse API valide
 */
export const isApiResponse = (obj: unknown): obj is ApiResponse => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'success' in obj &&
    typeof (obj as any).success === 'boolean'
  );
};

/**
 * Vérifie si un objet est une catégorie valide
 */
export const isCategory = (obj: unknown): obj is Category => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    ('toolCount' in obj || 'tool_count' in obj)
  );
};

/**
 * Vérifie si un objet est un outil valide
 */
export const isTool = (obj: unknown): obj is Tool => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'toolName' in obj
  );
};

// ============================================================================
// UTILITY TYPES - Pour parsing sécurisé
// ============================================================================

/**
 * Parse une valeur inconnue en string avec fallback
 */
export const parseUnknownAsString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

/**
 * Parse une valeur inconnue en number avec fallback
 */
export const parseUnknownAsNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Parse une valeur inconnue en boolean avec fallback
 */
export const parseUnknownAsBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return fallback;
};

// ============================================================================
// COMPONENT PROPS TYPES - Standardisation
// ============================================================================

/**
 * Props communes pour les composants avec traductions
 */
export interface BaseComponentProps {
  lang: LanguageCode;
  className?: string;
}

/**
 * Props pour les composants avec données chargées
 */
export interface DataComponentProps<T = unknown> extends BaseComponentProps {
  data: T;
  loading?: boolean;
  error?: string | null;
}

/**
 * Props pour les composants de listing
 */
export interface ListingComponentProps<T = unknown> extends DataComponentProps<T[]> {
  totalCount?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onItemClick?: (item: T) => void;
}

// ============================================================================
// TRANSLATION TYPES
// ============================================================================

/**
 * Objet de traductions par langue
 */
export type TranslationObject = Record<LanguageCode, Record<string, string>>;

/**
 * Fonction de traduction avec type safety
 */
export interface TranslationFunction {
  (key: string, params?: Record<string, string | number>): string;
}