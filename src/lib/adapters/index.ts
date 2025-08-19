/**
 * Adaptateurs pour harmoniser les conventions de nommage
 * Phase 1.2 : Transition safe entre snake_case (DB) et camelCase (App)
 */

import type { 
  Category, 
  Tool,
  ApiResponse
} from '../../types/unified';

import { 
  parseUnknownAsString,
  parseUnknownAsNumber,
  parseUnknownAsBoolean
} from '../../types/unified';

// ============================================================================
// CATEGORY ADAPTERS
// ============================================================================

/**
 * Adaptateur principal pour catégories
 * Gère les inconsistances tool_count vs toolCount
 */
export const adaptCategoryResponse = (raw: Record<string, unknown>): Category => {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid category data');
  }

  const data = raw as Record<string, unknown>;

  // Gestion intelligente du comptage d'outils
  const toolCount = 
    parseUnknownAsNumber(data.toolCount) ||
    parseUnknownAsNumber(data.tool_count) ||
    parseUnknownAsNumber(data.actualToolCount) ||
    0;

  return {
    id: parseUnknownAsNumber(data.id),
    name: parseUnknownAsString(data.name),
    slug: data.slug ? parseUnknownAsString(data.slug) : '',
    description: data.description ? parseUnknownAsString(data.description) : '',
    toolCount,
    actualToolCount: toolCount,
    displayName: parseUnknownAsString(data.displayName || data.name),
    displayDescription: data.displayDescription ? 
      parseUnknownAsString(data.displayDescription) : 
      (data.description ? parseUnknownAsString(data.description) : ''),
    iconName: data.iconName ? parseUnknownAsString(data.iconName) : undefined,
    emoji: data.emoji ? parseUnknownAsString(data.emoji) : undefined,
    isPopular: parseUnknownAsBoolean(data.isPopular),
  };
};

/**
 * Adaptateur de masse pour tableau de catégories
 */
export const adaptCategoriesArray = (rawArray: Record<string, unknown>[]): Category[] => {
  if (!Array.isArray(rawArray)) {
    console.warn('adaptCategoriesArray: Input is not an array', rawArray);
    return [];
  }

  return rawArray
    .map(item => {
      try {
        return adaptCategoryResponse(item);
      } catch (error) {
        console.warn('adaptCategoriesArray: Failed to adapt category', item, error);
        return null;
      }
    })
    .filter((category): category is Category => category !== null);
};

// ============================================================================
// TOOL ADAPTERS
// ============================================================================

/**
 * Adaptateur principal pour outils
 * Gère les inconsistances de nommage des propriétés
 */
export const adaptToolResponse = (raw: Record<string, unknown>): Tool => {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid tool data');
  }

  const data = raw as Record<string, unknown>;

  // Mapping des propriétés avec fallbacks
  const toolName = parseUnknownAsString(
    data.toolName || data.tool_name || data.displayName || data.name
  );
  
  const toolCategory = parseUnknownAsString(
    data.toolCategory || data.tool_category || data.category
  );

  const toolDescription = data.toolDescription || data.tool_description || data.description;
  const toolOverview = data.toolOverview || data.tool_overview || data.overview;
  const toolLink = data.toolLink || data.tool_link || data.url;
  const imageUrl = data.imageUrl || data.image_url || data.screenshot_url;

  return {
    id: parseUnknownAsNumber(data.id),
    slug: parseUnknownAsString(data.slug),
    toolName,
    toolCategory,
    toolDescription: toolDescription ? parseUnknownAsString(toolDescription) : null,
    toolOverview: toolOverview ? parseUnknownAsString(toolOverview) : null,
    toolLink: toolLink ? parseUnknownAsString(toolLink) : null,
    imageUrl: imageUrl ? parseUnknownAsString(imageUrl) : null,
    isActive: parseUnknownAsBoolean(data.isActive ?? data.is_active, true),
    featured: parseUnknownAsBoolean(data.featured),
    createdAt: parseUnknownAsString(data.createdAt || data.created_at) || new Date().toISOString(),
    
    // Champs calculés pour l'affichage
    displayName: parseUnknownAsString(data.displayName || toolName),
    displayDescription: toolDescription ? parseUnknownAsString(toolDescription) : '',
    displayOverview: toolOverview ? parseUnknownAsString(toolOverview) : '',
    
    // Aliases pour compatibilité
    category: toolCategory,
    overview: toolOverview ? parseUnknownAsString(toolOverview) : undefined,
    description: toolDescription ? parseUnknownAsString(toolDescription) : undefined,
    
    // Métadonnées optionnelles
    isNew: data.isNew ? parseUnknownAsBoolean(data.isNew) : undefined,
    qualityScore: data.qualityScore ? parseUnknownAsNumber(data.qualityScore) : undefined,
    views: data.views ? parseUnknownAsNumber(data.views) : undefined,
    likes: data.likes ? parseUnknownAsNumber(data.likes) : undefined,
    pricing: data.pricing as Tool['pricing'],
    tags: Array.isArray(data.tags) ? data.tags.map(tag => parseUnknownAsString(tag)) : undefined,
    lastUpdated: data.lastUpdated ? parseUnknownAsString(data.lastUpdated) : undefined,
  };
};

/**
 * Adaptateur de masse pour tableau d'outils
 */
export const adaptToolsArray = (rawArray: Record<string, unknown>[]): Tool[] => {
  if (!Array.isArray(rawArray)) {
    console.warn('adaptToolsArray: Input is not an array', rawArray);
    return [];
  }

  return rawArray
    .map(item => {
      try {
        return adaptToolResponse(item);
      } catch (error) {
        console.warn('adaptToolsArray: Failed to adapt tool', item, error);
        return null;
      }
    })
    .filter((tool): tool is Tool => tool !== null);
};

// ============================================================================
// API RESPONSE ADAPTERS
// ============================================================================

/**
 * Adaptateur pour réponses API avec catégories
 */
export const adaptCategoriesApiResponse = (response: unknown): ApiResponse<Category[]> => {
  if (!response || typeof response !== 'object') {
    return {
      success: false,
      data: [],
      error: 'Invalid API response'
    };
  }

  const data = response as Record<string, unknown>;

  // Si la réponse contient directement les catégories
  if (Array.isArray(data)) {
    return {
      success: true,
      data: adaptCategoriesArray(data)
    };
  }

  // Si c'est une réponse API structurée
  if (data.success && Array.isArray(data.data)) {
    return {
      success: true,
      data: adaptCategoriesArray(data.data as unknown[]),
      pagination: data.pagination as any
    };
  }

  // Si les catégories sont dans un autre champ
  if (Array.isArray(data.categories)) {
    return {
      success: true,
      data: adaptCategoriesArray(data.categories as unknown[])
    };
  }

  return {
    success: false,
    data: [],
    error: 'No categories found in response'
  };
};

/**
 * Adaptateur pour réponses API avec outils
 */
export const adaptToolsApiResponse = (response: unknown): ApiResponse<Tool[]> => {
  if (!response || typeof response !== 'object') {
    return {
      success: false,
      data: [],
      error: 'Invalid API response'
    };
  }

  const data = response as Record<string, unknown>;

  // Si la réponse contient directement les outils
  if (Array.isArray(data)) {
    return {
      success: true,
      data: adaptToolsArray(data)
    };
  }

  // Si c'est une réponse API structurée
  if (data.success && Array.isArray(data.data)) {
    return {
      success: true,
      data: adaptToolsArray(data.data as unknown[]),
      pagination: data.pagination as any
    };
  }

  // Si les outils sont dans un autre champ
  if (Array.isArray(data.tools)) {
    return {
      success: true,
      data: adaptToolsArray(data.tools as unknown[])
    };
  }

  return {
    success: false,
    data: [],
    error: 'No tools found in response'
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Fonction utilitaire pour parser les réponses d'API inconnues
 */
export const safeParseApiResponse = <T = unknown>(
  response: unknown,
  adapter?: (data: unknown) => T
): ApiResponse<T> => {
  try {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format');
    }

    const data = response as Record<string, unknown>;

    // Vérifier si c'est déjà une réponse API structurée
    if ('success' in data && typeof data.success === 'boolean') {
      return {
        success: data.success,
        data: adapter && data.data ? adapter(data.data) : (data.data as T),
        error: data.error ? parseUnknownAsString(data.error) : '',
        pagination: data.pagination as ApiResponse['pagination']
      };
    }

    // Sinon, traiter comme des données directes
    return {
      success: true,
      data: adapter ? adapter(response) : (response as T)
    };
  } catch (error) {
    return {
      success: false,
      data: [] as unknown as T,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
};

/**
 * Validation et transformation des paramètres de recherche
 */
export const adaptSearchParams = (params: Record<string, unknown>): Record<string, unknown> => {
  return {
    query: params.query ? parseUnknownAsString(params.query) : undefined,
    category: params.category ? parseUnknownAsString(params.category) : undefined,
    tags: Array.isArray(params.tags) ? 
      params.tags.map(tag => parseUnknownAsString(tag)) : undefined,
    featured: params.featured !== undefined ? 
      parseUnknownAsBoolean(params.featured) : undefined,
    page: params.page ? parseUnknownAsNumber(params.page, 1) : 1,
    limit: params.limit ? parseUnknownAsNumber(params.limit, 24) : 24,
    sortBy: params.sortBy ? parseUnknownAsString(params.sortBy) : undefined,
    sortOrder: params.sortOrder === 'desc' ? 'desc' : 'asc',
    lang: params.lang ? parseUnknownAsString(params.lang) : undefined,
  };
};