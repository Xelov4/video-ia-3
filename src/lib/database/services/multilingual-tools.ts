/**
 * Service Multilingue Ultra-Robuste pour Outils IA
 * 
 * Fournit une interface type-safe pour accéder aux données multilingues
 * avec fallbacks hiérarchiques, cache optimisé et gestion d'erreurs complète.
 * 
 * Architecture:
 * - Fallbacks: Langue demandée → EN → Données originales
 * - Cache stratifié par langue pour performance
 * - Validation stricte des paramètres d'entrée
 * - Monitoring et métriques intégrés
 * 
 * @author Video-IA.net Development Team
 */

import { prisma } from '../client'
import { Tool, ToolTranslation, Language, Prisma } from '@prisma/client'
import { multilingualCategoriesService } from './multilingual-categories'

// Types de base
export type SupportedLanguage = 'en' | 'fr' | 'it' | 'es' | 'de' | 'nl' | 'pt'

export interface ToolWithTranslation extends Tool {
  // Champs traduits avec fallback
  displayName: string
  displayOverview: string | null
  displayDescription: string | null
  displayMetaTitle: string | null
  displayMetaDescription: string | null
  
  // Métadonnées de traduction
  resolvedLanguage: SupportedLanguage
  translationSource: 'exact' | 'fallback' | 'original'
  isTranslated: boolean
}

export interface PaginatedToolsResponse {
  tools: ToolWithTranslation[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  meta: {
    language: SupportedLanguage
    fallbackCount: number
    cacheHit: boolean
    responseTime: number
  }
}

export interface ToolsSearchParams {
  language: SupportedLanguage
  query?: string
  category?: string
  featured?: boolean
  audience?: string
  useCase?: string
  feature?: string
  tags?: string[]
  page?: number
  limit?: number
  sortBy?: 'name' | 'created_at' | 'view_count' | 'quality_score' | 'relevance'
  sortOrder?: 'asc' | 'desc'
  useCache?: boolean
  filters?: {
    minQualityScore?: number
    hasImageUrl?: boolean
    hasVideoUrl?: boolean
    updatedSince?: Date
    excludeIds?: number[]
  }
}

// Validation et utilitaires
class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

class MultilingualToolsService {
  private readonly VALID_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'it', 'es', 'de', 'nl', 'pt']
  private readonly DEFAULT_LANGUAGE: SupportedLanguage = 'en'
  private readonly CACHE_TTL = 300000 // 5 minutes
  private readonly MAX_CACHE_SIZE = 2000 // Limite mémoire
  private readonly CACHE_CLEANUP_THRESHOLD = 1500 // Seuil nettoyage
  
  private cache = new Map<string, { data: any; expires: number; accessCount: number; lastAccess: number }>()
  private cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    cleanups: 0
  }
  private metrics = {
    queries: 0,
    cacheHits: 0,
    fallbacks: 0,
    errors: 0
  }

  /**
   * Validation stricte du code langue
   */
  private validateLanguage(language: string): language is SupportedLanguage {
    return this.VALID_LANGUAGES.includes(language as SupportedLanguage)
  }


  /**
   * Stratégie d'invalidation cache intelligente LRU + TTL
   */
  private cleanExpiredCache(force = false) {
    const now = Date.now()
    const shouldClean = force || this.cache.size > this.CACHE_CLEANUP_THRESHOLD
    
    if (shouldClean) {
      this.cacheStats.cleanups++
      const entries = Array.from(this.cache.entries())
      
      // 1. Supprimer les entrées expirées
      const expired = entries.filter(([_, value]) => value.expires < now)
      expired.forEach(([key]) => {
        this.cache.delete(key)
        this.cacheStats.evictions++
      })
      
      // 2. Si toujours trop plein, utiliser LRU
      if (this.cache.size > this.MAX_CACHE_SIZE) {
        const remaining = Array.from(this.cache.entries())
        remaining
          .sort(([,a], [,b]) => a.lastAccess - b.lastAccess) // Plus ancien d'abord
          .slice(0, this.cache.size - this.MAX_CACHE_SIZE)
          .forEach(([key]) => {
            this.cache.delete(key)
            this.cacheStats.evictions++
          })
      }
    }
  }

  /**
   * Invalidation sélective par pattern
   */
  private invalidateByPattern(pattern: RegExp | string) {
    let count = 0
    for (const [key] of this.cache.entries()) {
      if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    console.log(`Cache invalidation: ${count} entries removed for pattern: ${pattern}`)
    return count
  }

  /**
   * Génération de clé cache stable (ordre déterministe)
   */
  private generateStableCacheKey(prefix: string, params: any): string {
    const sortedParams = this.sortObjectKeys(params)
    return `${prefix}:${this.stableStringify(sortedParams)}`
  }

  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(item => this.sortObjectKeys(item))
    
    const sorted: any = {}
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = this.sortObjectKeys(obj[key])
    })
    return sorted
  }

  private stableStringify(obj: any): string {
    try {
      return JSON.stringify(obj)
    } catch (error) {
      console.warn('Cache key serialization failed:', error)
      return `fallback:${Date.now()}:${Math.random()}`
    }
  }

  /**
   * Gestion du cache avec TTL et statistiques avancées
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && cached.expires > Date.now()) {
      // Update access statistics
      cached.accessCount++
      cached.lastAccess = Date.now()
      this.cache.set(key, cached)
      
      this.metrics.cacheHits++
      this.cacheStats.hits++
      return cached.data as T
    }
    
    this.cacheStats.misses++
    return null
  }

  private setCachedData<T>(key: string, data: T): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      expires: now + this.CACHE_TTL,
      accessCount: 1,
      lastAccess: now
    })
    
    this.cacheStats.sets++
    
    // Nettoyage périodique intelligent
    this.cleanExpiredCache()
  }

  /**
   * Log des fallbacks pour monitoring
   */
  private logFallback(toolId: number, requestedLang: string, resolvedLang: string, source: string) {
    this.metrics.fallbacks++
    console.warn(`Translation fallback: tool=${toolId}, requested=${requestedLang}, resolved=${resolvedLang}, source=${source}`)
  }

  /**
   * Récupérer un outil avec traductions et fallbacks
   */
  async getToolWithTranslation(
    toolId: number,
    language: SupportedLanguage,
    options: { useCache?: boolean } = {}
  ): Promise<ToolWithTranslation | null> {
    const startTime = Date.now()
    this.metrics.queries++

    try {
      // Validation
      if (!this.validateLanguage(language)) {
        throw new ValidationError(`Invalid language code: ${language}`)
      }

      // Cache check
      const cacheKey = `tool:${toolId}:${language}`
      if (options.useCache !== false) {
        const cached = this.getCachedData<ToolWithTranslation>(cacheKey)
        if (cached) {
          return cached
        }
      }

      // Requête avec fallbacks optimisée
      const toolWithTranslations = await prisma.tool.findUnique({
        where: {
          id: toolId,
          isActive: true
        },
        include: {
          translations: {
            where: {
              languageCode: {
                in: [language, this.DEFAULT_LANGUAGE]
              }
            },
            orderBy: [
              { languageCode: language === this.DEFAULT_LANGUAGE ? 'asc' : 'desc' }
            ]
          }
        }
      })

      if (!toolWithTranslations) {
        return null
      }

      // Résolution des traductions avec fallbacks
      const requestedTranslation = toolWithTranslations.translations.find(t => t.languageCode === language)
      const fallbackTranslation = toolWithTranslations.translations.find(t => t.languageCode === this.DEFAULT_LANGUAGE)
      
      let resolvedTranslation = requestedTranslation
      let translationSource: 'exact' | 'fallback' | 'original' = 'exact'
      let resolvedLanguage = language

      if (!requestedTranslation) {
        if (fallbackTranslation) {
          resolvedTranslation = fallbackTranslation
          translationSource = 'fallback'
          resolvedLanguage = this.DEFAULT_LANGUAGE
          this.logFallback(toolId, language, this.DEFAULT_LANGUAGE, 'translation_missing')
        } else {
          translationSource = 'original'
          this.logFallback(toolId, language, 'original', 'no_translations')
        }
      }

      // Construction du résultat enrichi
      const result: ToolWithTranslation = {
        ...toolWithTranslations,
        // Champs traduits avec fallback intelligent
        displayName: resolvedTranslation?.name || toolWithTranslations.toolName,
        displayOverview: resolvedTranslation?.overview || toolWithTranslations.overview,
        displayDescription: resolvedTranslation?.description || toolWithTranslations.toolDescription,
        displayMetaTitle: resolvedTranslation?.metaTitle || toolWithTranslations.metaTitle,
        displayMetaDescription: resolvedTranslation?.metaDescription || toolWithTranslations.metaDescription,
        
        // Métadonnées de traduction
        resolvedLanguage,
        translationSource,
        isTranslated: !!resolvedTranslation
      }

      // Cache du résultat
      if (options.useCache !== false) {
        this.setCachedData(cacheKey, result)
      }

      return result

    } catch (error) {
      this.metrics.errors++
      console.error('Error in getToolWithTranslation:', error)
      throw error
    }
  }

  /**
   * Recherche d'outils multilingue avec pagination avancée
   */
  async searchTools(params: ToolsSearchParams): Promise<PaginatedToolsResponse> {
    const startTime = Date.now()
    this.metrics.queries++

    try {
      const {
        language,
        query,
        category,
        featured,
        audience,
        useCase,
        feature,
        tags,
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc',
        useCache = true,
        filters = {}
      } = params

      // Validation des paramètres
      if (!this.validateLanguage(language)) {
        throw new ValidationError(`Invalid language code: ${language}`)
      }

      if (page < 1 || limit < 1 || limit > 100) {
        throw new ValidationError('Invalid pagination parameters')
      }

      // Cache key stable pour la requête complète
      const cacheKey = this.generateStableCacheKey('search', params)
      let cacheHit = false
      if (useCache) {
        const cached = this.getCachedData<PaginatedToolsResponse>(cacheKey)
        if (cached) {
          cached.meta.cacheHit = true
          return cached
        }
      }

      // Construction des filtres Prisma avec nouvelles capacités
      const where: Prisma.ToolWhereInput = {
        isActive: true,
        ...(category && { toolCategory: category }),
        ...(featured !== undefined && { featured }),
        
        // Filtres par données extraites
        ...(audience && {
          targetAudience: { contains: audience, mode: Prisma.QueryMode.insensitive }
        }),
        ...(useCase && {
          useCases: { contains: useCase, mode: Prisma.QueryMode.insensitive }
        }),
        ...(feature && {
          keyFeatures: { contains: feature, mode: Prisma.QueryMode.insensitive }
        }),
        
        
        
        // Filtres par tags
        ...(tags && tags.length > 0 && {
          OR: tags.map(tag => ({
            tags: { contains: tag, mode: Prisma.QueryMode.insensitive }
          }))
        }),
        
        // Filtres avancés
        ...(filters.minQualityScore && { 
          qualityScore: { gte: filters.minQualityScore } 
        }),
        ...(filters.hasImageUrl && { 
          imageUrl: { 
            AND: [
              { not: null },
              { not: '' }
            ]
          }
        }),
        ...(filters.hasVideoUrl && { 
          videoUrl: { 
            AND: [
              { not: null },
              { not: '' }
            ]
          }
        }),
        ...(filters.updatedSince && { 
          updatedAt: { gte: filters.updatedSince } 
        }),
        ...(filters.excludeIds && filters.excludeIds.length > 0 && {
          id: { notIn: filters.excludeIds }
        }),
        
        // Recherche textuelle étendue
        ...(query && {
          OR: [
            { toolName: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { overview: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { toolDescription: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { targetAudience: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { useCases: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { keyFeatures: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { tags: { contains: query, mode: Prisma.QueryMode.insensitive } },
            {
              translations: {
                some: {
                  OR: [
                    { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { overview: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: query, mode: Prisma.QueryMode.insensitive } }
                  ]
                }
              }
            }
          ]
        })
      }

      // Ordre de tri intelligent
      const orderBy: Prisma.ToolOrderByWithRelationInput = {}
      switch (sortBy) {
        case 'name':
          orderBy.toolName = sortOrder
          break
        case 'view_count':
          orderBy.viewCount = sortOrder
          break
        case 'quality_score':
          orderBy.qualityScore = sortOrder
          break
        default:
          orderBy.createdAt = sortOrder
      }

      // Requêtes parallèles pour performance
      const [tools, totalCount] = await Promise.all([
        prisma.tool.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            translations: {
              where: {
                languageCode: {
                  in: [language, this.DEFAULT_LANGUAGE]
                }
              },
              orderBy: [
                { languageCode: language === this.DEFAULT_LANGUAGE ? 'asc' : 'desc' }
              ]
            }
          }
        }),
        prisma.tool.count({ where })
      ])

      // Traitement des résultats avec fallbacks
      let fallbackCount = 0
      const processedTools: ToolWithTranslation[] = tools.map(tool => {
        const requestedTranslation = tool.translations.find(t => t.languageCode === language)
        const fallbackTranslation = tool.translations.find(t => t.languageCode === this.DEFAULT_LANGUAGE)
        
        let resolvedTranslation = requestedTranslation
        let translationSource: 'exact' | 'fallback' | 'original' = 'exact'
        let resolvedLanguage = language

        if (!requestedTranslation) {
          fallbackCount++
          if (fallbackTranslation) {
            resolvedTranslation = fallbackTranslation
            translationSource = 'fallback'
            resolvedLanguage = this.DEFAULT_LANGUAGE
          } else {
            translationSource = 'original'
          }
        }

        return {
          ...tool,
          displayName: resolvedTranslation?.name || tool.toolName,
          displayOverview: resolvedTranslation?.overview || tool.overview,
          displayDescription: resolvedTranslation?.description || tool.toolDescription,
          displayMetaTitle: resolvedTranslation?.metaTitle || tool.metaTitle,
          displayMetaDescription: resolvedTranslation?.metaDescription || tool.metaDescription,
          resolvedLanguage,
          translationSource,
          isTranslated: !!resolvedTranslation
        }
      })

      // Construction de la réponse
      const totalPages = Math.ceil(totalCount / limit)
      const responseTime = Date.now() - startTime

      const result: PaginatedToolsResponse = {
        tools: processedTools,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        meta: {
          language,
          fallbackCount,
          cacheHit,
          responseTime
        }
      }

      // Cache du résultat
      if (useCache) {
        this.setCachedData(cacheKey, result)
      }

      return result

    } catch (error) {
      this.metrics.errors++
      console.error('Error in searchTools:', error)
      throw error
    }
  }

  /**
   * Récupérer les outils en vedette par langue
   */
  async getFeaturedTools(language: SupportedLanguage, limit: number = 8): Promise<ToolWithTranslation[]> {
    try {
      const result = await this.searchTools({
        language,
        featured: true,
        limit,
        sortBy: 'view_count',
        sortOrder: 'desc'
      })
      return result.tools
    } catch (error) {
      console.error('Error getting featured tools:', error)
      return []
    }
  }

  /**
   * Récupérer outils par catégorie avec traductions
   */
  async getToolsByCategory(
    category: string,
    language: SupportedLanguage,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedToolsResponse> {
    return this.searchTools({
      language,
      category,
      page,
      limit,
      sortBy: 'view_count',
      sortOrder: 'desc'
    })
  }

  /**
   * Métriques avancées avec diagnostics performance
   */
  getMetrics() {
    const totalCacheOps = this.cacheStats.hits + this.cacheStats.misses
    const cacheHitRate = totalCacheOps > 0 ? 
      (this.cacheStats.hits / totalCacheOps * 100).toFixed(2) : '0'
    
    return {
      // Métriques existantes
      ...this.metrics,
      
      // Statistiques cache détaillées
      cache: {
        size: this.cache.size,
        maxSize: this.MAX_CACHE_SIZE,
        hitRate: `${cacheHitRate}%`,
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        sets: this.cacheStats.sets,
        evictions: this.cacheStats.evictions,
        cleanups: this.cacheStats.cleanups
      },
      
      // Ratios calculés
      fallbackRate: this.metrics.queries > 0 ? 
        (this.metrics.fallbacks / this.metrics.queries * 100).toFixed(2) + '%' : '0%',
      errorRate: this.metrics.queries > 0 ? 
        (this.metrics.errors / this.metrics.queries * 100).toFixed(2) + '%' : '0%',
      
      // Diagnostics
      health: {
        cacheEfficiency: parseFloat(cacheHitRate),
        memoryPressure: (this.cache.size / this.MAX_CACHE_SIZE * 100).toFixed(1) + '%',
        status: this.getHealthStatus()
      }
    }
  }

  private getHealthStatus(): 'healthy' | 'warning' | 'critical' {
    const hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses || 1)
    const errorRate = this.metrics.errors / (this.metrics.queries || 1)
    const memoryUsage = this.cache.size / this.MAX_CACHE_SIZE
    
    if (errorRate > 0.1 || hitRate < 0.3) return 'critical'
    if (errorRate > 0.05 || hitRate < 0.6 || memoryUsage > 0.8) return 'warning'
    return 'healthy'
  }

  /**
   * Monitoring en temps réel
   */
  public async getPerformanceReport(): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    metrics: any
    recommendations: string[]
  }> {
    const metrics = this.getMetrics()
    const recommendations: string[] = []
    
    if (metrics.cache.hitRate && parseFloat(metrics.cache.hitRate) < 60) {
      recommendations.push('Low cache hit rate - consider increasing TTL or cache warming')
    }
    
    if (parseFloat(metrics.errorRate.replace('%', '')) > 5) {
      recommendations.push('High error rate detected - check database connectivity')
    }
    
    if (this.cache.size > this.CACHE_CLEANUP_THRESHOLD) {
      recommendations.push('Cache size approaching limit - consider memory optimization')
    }
    
    return {
      status: metrics.health.status,
      metrics,
      recommendations
    }
  }

  /**
   * API publique d'invalidation cache
   */
  public invalidateCache(pattern?: string | RegExp) {
    if (pattern) {
      return this.invalidateByPattern(pattern)
    } else {
      const size = this.cache.size
      this.cache.clear()
      console.log(`Full cache invalidation: ${size} entries removed`)
      return size
    }
  }

  /**
   * Nettoyer le cache manuellement
   */
  clearCache() {
    this.cache.clear()
    console.log('Cache cleared')
  }

  /**
   * Cache warming strategique pour performance optimale
   */
  public async warmCache(options: {
    languages?: SupportedLanguage[]
    popularTools?: number
    categories?: boolean
  } = {}): Promise<{
    warmedItems: number
    duration: number
    errors: string[]
  }> {
    const startTime = Date.now()
    let warmedItems = 0
    const errors: string[] = []
    
    const languages = options.languages || ['en', 'fr']
    const popularToolsLimit = options.popularTools || 20
    
    try {
      console.log(`🔥 Starting cache warming for languages: ${languages.join(', ')}`)
      
      // 1. Pre-charger outils populaires
      for (const language of languages) {
        try {
          const popularTools = await this.searchTools({
            language,
            limit: popularToolsLimit,
            sortBy: 'view_count',
            sortOrder: 'desc',
            useCache: false // Force fresh data
          })
          
          // Cache chaque outil individuellement
          for (const tool of popularTools.tools.slice(0, Math.min(10, popularTools.tools.length))) {
            await this.getToolWithTranslation(tool.id, language, { useCache: false })
            warmedItems++
          }
          
          warmedItems++ // Pour la recherche elle-même
          
        } catch (error) {
          errors.push(`Tools warming failed for ${language}: ${error}`)
        }
      }
      
      // 2. Pre-charger catégories si demandé
      if (options.categories) {
        for (const language of languages) {
          try {
            await multilingualCategoriesService.getAllCategories(language, { 
              useCache: false,
              includeCounts: true 
            })
            warmedItems++
          } catch (error) {
            errors.push(`Categories warming failed for ${language}: ${error}`)
          }
        }
      }
      
    } catch (error) {
      errors.push(`Cache warming general error: ${error}`)
    }
    
    const duration = Date.now() - startTime
    console.log(`🔥 Cache warming completed: ${warmedItems} items in ${duration}ms`)
    
    return { warmedItems, duration, errors }
  }

  /**
   * Health check avancé avec diagnostics cache
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, boolean>
    metrics: any
    diagnostics: string[]
  }> {
    const checks = {
      database: false,
      translations: false,
      cache: true,
      performance: false
    }
    
    const diagnostics: string[] = []

    try {
      // Test connexion DB avec timing
      const dbStart = Date.now()
      await prisma.tool.findFirst({ where: { isActive: true } })
      const dbTime = Date.now() - dbStart
      checks.database = true
      
      if (dbTime > 100) {
        diagnostics.push(`Database response slow: ${dbTime}ms`)
      }

      // Test traductions
      const translationCount = await prisma.toolTranslation.count()
      checks.translations = translationCount > 0
      
      // Test performance cache
      const metrics = this.getMetrics()
      const hitRate = parseFloat(metrics.cache.hitRate?.replace('%', '') || '0')
      checks.performance = hitRate >= 50
      
      if (hitRate < 30) {
        diagnostics.push(`Critical cache hit rate: ${hitRate}%`)
      } else if (hitRate < 60) {
        diagnostics.push(`Low cache hit rate: ${hitRate}%`)
      }

    } catch (error) {
      console.error('Health check failed:', error)
      diagnostics.push(`Health check error: ${error}`)
    }

    const healthyChecks = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.keys(checks).length
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (healthyChecks === 0) {
      status = 'unhealthy'
    } else if (healthyChecks < totalChecks) {
      status = 'degraded'
    }

    return {
      status,
      checks,
      metrics: this.getMetrics(),
      diagnostics
    }
  }

  /**
   * NOUVELLES MÉTHODES POUR ARCHITECTURE DATA-DRIVEN
   */

  /**
   * Récupérer outils par audience spécifique
   */
  async getToolsByAudience(
    audience: string,
    language: SupportedLanguage,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedToolsResponse> {
    return this.searchTools({
      language,
      audience,
      page,
      limit,
      sortBy: 'view_count',
      sortOrder: 'desc'
    })
  }

  /**
   * Récupérer outils par cas d'usage
   */
  async getToolsByUseCase(
    useCase: string,
    language: SupportedLanguage,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedToolsResponse> {
    return this.searchTools({
      language,
      useCase,
      page,
      limit,
      sortBy: 'quality_score',
      sortOrder: 'desc'
    })
  }

  /**
   * Récupérer outils par fonctionnalité
   */
  async getToolsByFeature(
    feature: string,
    language: SupportedLanguage,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedToolsResponse> {
    return this.searchTools({
      language,
      feature,
      page,
      limit,
      sortBy: 'view_count',
      sortOrder: 'desc'
    })
  }

  /**
   * Recherche avec filtres combinés pour discovery page
   */
  async getDiscoveryTools(
    language: SupportedLanguage,
    filters: {
      categories?: string[]
      audiences?: string[]
      useCases?: string[]
          minQualityScore?: number
    } = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedToolsResponse> {
    // Construire filtres combinés
    const searchParams: ToolsSearchParams = {
      language,
      page,
      limit,
      sortBy: 'quality_score',
      sortOrder: 'desc',
      filters: {
        minQualityScore: filters.minQualityScore || 5.0
      }
    }

    // Si plusieurs catégories, audiences, etc., on utilise une approche OR
    if (filters.categories?.length || filters.audiences?.length || filters.useCases?.length) {
      // Pour des filtres multiples, on va faire une requête plus complexe
      const where: Prisma.ToolWhereInput = {
        isActive: true,
        ...(filters.minQualityScore && { 
          qualityScore: { gte: filters.minQualityScore } 
        }),
        AND: [
          // Catégories (OR)
          ...(filters.categories?.length ? [{
            OR: filters.categories.map(cat => ({
              toolCategory: cat
            }))
          }] : []),
          
          // Audiences (OR)
          ...(filters.audiences?.length ? [{
            OR: filters.audiences.map(aud => ({
              targetAudience: { contains: aud, mode: Prisma.QueryMode.insensitive }
            }))
          }] : []),
          
          // Use Cases (OR)
          ...(filters.useCases?.length ? [{
            OR: filters.useCases.map(uc => ({
              useCases: { contains: uc, mode: Prisma.QueryMode.insensitive }
            }))
          }] : []),
          
          
        ]
      }

      // Requête personnalisée avec filtres combinés
      const [tools, totalCount] = await Promise.all([
        prisma.tool.findMany({
          where,
          orderBy: { qualityScore: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            translations: {
              where: {
                languageCode: {
                  in: [language, this.DEFAULT_LANGUAGE]
                }
              },
              orderBy: [
                { languageCode: language === this.DEFAULT_LANGUAGE ? 'asc' : 'desc' }
              ]
            }
          }
        }),
        prisma.tool.count({ where })
      ])

      // Traiter les résultats avec traductions
      const processedTools: ToolWithTranslation[] = tools.map(tool => {
        const requestedTranslation = tool.translations.find((t: any) => t.languageCode === language)
        const fallbackTranslation = tool.translations.find((t: any) => t.languageCode === this.DEFAULT_LANGUAGE)
        
        let resolvedTranslation = requestedTranslation
        let translationSource: 'exact' | 'fallback' | 'original' = 'exact'
        let resolvedLanguage = language

        if (!requestedTranslation) {
          if (fallbackTranslation) {
            resolvedTranslation = fallbackTranslation
            translationSource = 'fallback'
            resolvedLanguage = this.DEFAULT_LANGUAGE
          } else {
            translationSource = 'original'
          }
        }

        return {
          ...tool,
          displayName: resolvedTranslation?.name || tool.toolName,
          displayOverview: resolvedTranslation?.overview || tool.overview,
          displayDescription: resolvedTranslation?.description || tool.toolDescription,
          displayMetaTitle: resolvedTranslation?.metaTitle || tool.metaTitle,
          displayMetaDescription: resolvedTranslation?.metaDescription || tool.metaDescription,
          resolvedLanguage,
          translationSource,
          isTranslated: !!resolvedTranslation
        }
      })

      const totalPages = Math.ceil(totalCount / limit)

      return {
        tools: processedTools,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        meta: {
          language,
          fallbackCount: processedTools.filter(t => t.translationSource === 'fallback').length,
          cacheHit: false,
          responseTime: Date.now()
        }
      }
    }

    // Fallback vers searchTools standard
    return this.searchTools(searchParams)
  }

  /**
   * Obtenir suggestions intelligentes basées sur l'activité
   */
  async getRecommendedTools(
    language: SupportedLanguage,
    basedOn: {
      viewedTools?: number[]
      searchQuery?: string
      userAudience?: string
      preferredCategories?: string[]
    },
    limit: number = 10
  ): Promise<ToolWithTranslation[]> {
    const { viewedTools = [], userAudience, preferredCategories = [] } = basedOn

    const recommendations: ToolWithTranslation[] = []

    try {
      // 1. Outils similaires basés sur les vues
      if (viewedTools.length > 0) {
        const similarTools = await this.searchTools({
          language,
          limit: Math.ceil(limit / 2),
          filters: {
            excludeIds: viewedTools
          },
          sortBy: 'view_count',
          sortOrder: 'desc'
        })
        recommendations.push(...similarTools.tools)
      }

      // 2. Outils populaires dans les catégories préférées
      if (preferredCategories.length > 0) {
        for (const category of preferredCategories.slice(0, 2)) {
          const categoryTools = await this.getToolsByCategory(
            category,
            language,
            1,
            Math.ceil(limit / 4)
          )
          recommendations.push(
            ...categoryTools.tools.filter(tool => 
              !viewedTools.includes(tool.id) &&
              !recommendations.some(r => r.id === tool.id)
            )
          )
        }
      }

      // 3. Outils par audience si spécifiée
      if (userAudience) {
        const audienceTools = await this.getToolsByAudience(
          userAudience,
          language,
          1,
          Math.ceil(limit / 3)
        )
        recommendations.push(
          ...audienceTools.tools.filter(tool => 
            !viewedTools.includes(tool.id) &&
            !recommendations.some(r => r.id === tool.id)
          )
        )
      }

      // 4. Compléter avec outils trending si nécessaire
      if (recommendations.length < limit) {
        const trending = await this.getFeaturedTools(
          language,
          limit - recommendations.length
        )
        recommendations.push(
          ...trending.filter(tool => 
            !viewedTools.includes(tool.id) &&
            !recommendations.some(r => r.id === tool.id)
          )
        )
      }

      // Limiter et randomiser légèrement l'ordre
      return recommendations
        .slice(0, limit)
        .sort(() => Math.random() - 0.5)

    } catch (error) {
      console.error('Error getting recommendations:', error)
      // Fallback vers outils featured
      return this.getFeaturedTools(language, limit)
    }
  }
}

// Instance singleton
export const multilingualToolsService = new MultilingualToolsService()
export default MultilingualToolsService