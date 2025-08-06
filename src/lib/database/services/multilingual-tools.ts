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
  translationQuality: number
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
  page?: number
  limit?: number
  sortBy?: 'name' | 'created_at' | 'view_count' | 'quality_score'
  sortOrder?: 'asc' | 'desc'
  useCache?: boolean
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
  private cache = new Map<string, { data: any; expires: number }>()
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
   * Nettoyage automatique du cache
   */
  private cleanExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (value.expires < now) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Gestion du cache avec TTL
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && cached.expires > Date.now()) {
      this.metrics.cacheHits++
      return cached.data as T
    }
    return null
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.CACHE_TTL
    })
    
    // Nettoyage périodique
    if (this.cache.size > 1000) {
      this.cleanExpiredCache()
    }
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
              { languageCode: language === this.DEFAULT_LANGUAGE ? 'asc' : 'desc' },
              { qualityScore: 'desc' }
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
        translationQuality: resolvedTranslation?.qualityScore.toNumber() || 0,
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
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc',
        useCache = true
      } = params

      // Validation des paramètres
      if (!this.validateLanguage(language)) {
        throw new ValidationError(`Invalid language code: ${language}`)
      }

      if (page < 1 || limit < 1 || limit > 100) {
        throw new ValidationError('Invalid pagination parameters')
      }

      // Cache key pour la requête complète
      const cacheKey = `search:${JSON.stringify(params)}`
      if (useCache) {
        const cached = this.getCachedData<PaginatedToolsResponse>(cacheKey)
        if (cached) {
          return cached
        }
      }

      // Construction des filtres Prisma
      const where: Prisma.ToolWhereInput = {
        isActive: true,
        ...(category && { toolCategory: category }),
        ...(featured !== undefined && { featured }),
        ...(query && {
          OR: [
            { toolName: { contains: query, mode: 'insensitive' } },
            { overview: { contains: query, mode: 'insensitive' } },
            { toolDescription: { contains: query, mode: 'insensitive' } },
            {
              translations: {
                some: {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { overview: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
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
                { languageCode: language === this.DEFAULT_LANGUAGE ? 'asc' : 'desc' },
                { qualityScore: 'desc' }
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
          translationQuality: resolvedTranslation?.qualityScore.toNumber() || 0,
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
          cacheHit: false,
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
   * Récupérer les métriques du service
   */
  getMetrics() {
    const cacheHitRate = this.metrics.queries > 0 ? 
      (this.metrics.cacheHits / this.metrics.queries * 100).toFixed(2) : '0'
    
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate: `${cacheHitRate}%`,
      fallbackRate: this.metrics.queries > 0 ? 
        (this.metrics.fallbacks / this.metrics.queries * 100).toFixed(2) + '%' : '0%'
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
   * Health check du service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, boolean>
    metrics: any
  }> {
    const checks = {
      database: false,
      translations: false,
      cache: true
    }

    try {
      // Test connexion DB
      await prisma.tool.findFirst({ where: { isActive: true } })
      checks.database = true

      // Test traductions
      const translationCount = await prisma.toolTranslation.count()
      checks.translations = translationCount > 0

    } catch (error) {
      console.error('Health check failed:', error)
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
      metrics: this.getMetrics()
    }
  }
}

// Instance singleton
export const multilingualToolsService = new MultilingualToolsService()
export default MultilingualToolsService