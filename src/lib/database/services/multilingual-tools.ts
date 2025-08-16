/**
 * Multilingual Tools Service
 * 
 * Service for managing tools with multilingual support, translations,
 * and advanced search features.
 * 
 * @author Video-IA.net Development Team
 */

import { prisma } from '../client'
import { Tool, ToolTranslation, Prisma } from '@prisma/client'
import { serializePrismaObject } from '../../utils/prismaHelpers'

export type SupportedLanguage = 'en' | 'fr' | 'it' | 'es' | 'de' | 'nl' | 'pt'

export interface ToolWithTranslation extends Tool {
  // Translated fields
  displayName: string
  displayDescription: string | null
  displayOverview: string | null
  
  // Metadata
  resolvedLanguage: SupportedLanguage
  translationSource: 'exact' | 'fallback' | 'original'
  translationQuality?: number
}

export interface ToolsSearchParams {
  language: SupportedLanguage
  query?: string
  category?: string
  featured?: boolean
  tags?: string[]
  minQualityScore?: number
  page?: number
  limit?: number
  sortBy?: 'name' | 'created_at' | 'view_count' | 'quality_score'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedToolsResult {
  tools: ToolWithTranslation[]
  pagination: {
    totalCount: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  meta?: {
    queryTime?: number
    language?: string
    fallbackCount?: number
  }
}

class MultilingualToolsService {
  private readonly VALID_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'it', 'es', 'de', 'nl', 'pt']
  private readonly DEFAULT_LANGUAGE: SupportedLanguage = 'en'
  private readonly CACHE_TTL = 300000 // 5 minutes
  private cache = new Map<string, { data: any; expires: number }>()

  /**
   * Cache management
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.data as T
    }
    return null
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.CACHE_TTL
    })
  }

  /**
   * Language validation
   */
  private validateLanguage(language: string): language is SupportedLanguage {
    return this.VALID_LANGUAGES.includes(language as SupportedLanguage)
  }

  /**
   * Search tools with multilingual support and advanced filtering
   */
  async searchTools(params: ToolsSearchParams): Promise<PaginatedToolsResult> {
    try {
      const startTime = Date.now()
      
      const {
        language,
        query,
        category,
        featured,
        tags,
        minQualityScore,
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = params

      if (!this.validateLanguage(language)) {
        throw new Error(`Invalid language code: ${language}`)
      }

      // Cache key based on search parameters
      const cacheKey = `tools:search:${language}:${query || ''}:${category || ''}:${featured || false}:${JSON.stringify(tags || [])}:${minQualityScore || 0}:${page}:${limit}:${sortBy}:${sortOrder}`
      
      const cachedResult = this.getCachedData<PaginatedToolsResult>(cacheKey)
      if (cachedResult) {
        return {
          ...cachedResult,
          meta: {
            ...cachedResult.meta,
            queryTime: 0,  // From cache
          }
        }
      }

      // Build WHERE conditions
      const where: Prisma.ToolWhereInput = {
        isActive: true
      }

      if (category) {
        where.toolCategory = {
          equals: category,
          mode: 'insensitive'
        }
        
        // Also try with slug
        if (!where.OR) {
          where.OR = []
        }
        where.OR.push({
          slug: {
            equals: category,
            mode: 'insensitive'
          }
        })
      }

      if (featured !== undefined) {
        where.featured = featured
      }

      if (minQualityScore) {
        where.qualityScore = {
          gte: minQualityScore
        }
      }

      if (tags && tags.length > 0) {
        where.tags = {
          contains: tags[0],  // Simple implementation - could be enhanced
          mode: 'insensitive'
        }
      }

      if (query) {
        if (!where.OR) {
          where.OR = []
        }
        
        where.OR.push(
          { toolName: { contains: query, mode: 'insensitive' } },
          { toolDescription: { contains: query, mode: 'insensitive' } },
          { overview: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } }
        )
      }

      // Build ORDER BY
      const orderBy: Prisma.ToolOrderByWithRelationInput = {}
      if (sortBy === 'name') {
        orderBy.toolName = sortOrder
      } else if (sortBy === 'view_count') {
        orderBy.viewCount = sortOrder
      } else if (sortBy === 'quality_score') {
        orderBy.qualityScore = sortOrder
      } else {
        orderBy.createdAt = sortOrder
      }

      // Execute database queries
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
              }
            }
          }
        }),
        prisma.tool.count({ where })
      ])

      // Process tools with translations
      let fallbackCount = 0
      const processedTools: ToolWithTranslation[] = tools.map(tool => {
        const requestedTranslation = tool.translations?.find(t => t.languageCode === language)
        const fallbackTranslation = tool.translations?.find(t => t.languageCode === this.DEFAULT_LANGUAGE)
        
        let translationSource: 'exact' | 'fallback' | 'original' = 'original'
        let resolvedLanguage: SupportedLanguage = language
        let translationQuality: number | undefined = undefined

        // Determine display values based on available translations
        let displayName = tool.toolName
        let displayDescription = tool.toolDescription
        let displayOverview = tool.overview

        if (requestedTranslation) {
          // Use requested language translation
          displayName = requestedTranslation.name
          displayDescription = requestedTranslation.description
          displayOverview = requestedTranslation.overview
          translationSource = 'exact'
          translationQuality = requestedTranslation.quality_score?.toNumber()
        } else if (fallbackTranslation && language !== this.DEFAULT_LANGUAGE) {
          // Use fallback (usually English) translation
          displayName = fallbackTranslation.name
          displayDescription = fallbackTranslation.description
          displayOverview = fallbackTranslation.overview
          translationSource = 'fallback'
          translationQuality = fallbackTranslation.quality_score?.toNumber()
          resolvedLanguage = this.DEFAULT_LANGUAGE
          fallbackCount++
        }

        return {
          ...tool,
          displayName,
          displayDescription,
          displayOverview,
          resolvedLanguage,
          translationSource,
          translationQuality,
          translations: undefined  // Remove raw translations from result
        }
      })

      // Calculate pagination
      const totalPages = Math.ceil(totalCount / limit)
      const result: PaginatedToolsResult = {
        tools: processedTools,
        pagination: {
          totalCount,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        meta: {
          queryTime: Date.now() - startTime,
          language,
          fallbackCount
        }
      }

      // Sérialiser les objets Prisma avant mise en cache et retour
      const serializedResult = serializePrismaObject(result)
      
      // Cache the result
      this.setCachedData(cacheKey, serializedResult)

      return serializedResult
    } catch (error) {
      console.error('Error in searchTools:', error)
      throw new Error(`Failed to search tools: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get tool by slug with multilingual support
   */
  async getToolBySlug(slug: string, language: SupportedLanguage): Promise<ToolWithTranslation | null> {
    try {
      if (!this.validateLanguage(language)) {
        throw new Error(`Invalid language code: ${language}`)
      }

      // Try to get from cache
      const cacheKey = `tool:${slug}:${language}`
      const cached = this.getCachedData<ToolWithTranslation>(cacheKey)
      if (cached) {
        return cached
      }

      // Get tool with translations
      const tool = await prisma.tool.findUnique({
        where: { 
          slug, 
          isActive: true 
        },
        include: {
          translations: {
            where: {
              languageCode: {
                in: [language, this.DEFAULT_LANGUAGE]
              }
            }
          }
        }
      })

      if (!tool) {
        return null
      }

      // Process translations
      const requestedTranslation = tool.translations?.find(t => t.languageCode === language)
      const fallbackTranslation = tool.translations?.find(t => t.languageCode === this.DEFAULT_LANGUAGE)
      
      let translationSource: 'exact' | 'fallback' | 'original' = 'original'
      let resolvedLanguage: SupportedLanguage = language
      let translationQuality: number | undefined = undefined

      let displayName = tool.toolName
      let displayDescription = tool.toolDescription
      let displayOverview = tool.overview

      if (requestedTranslation) {
        displayName = requestedTranslation.name
        displayDescription = requestedTranslation.description
        displayOverview = requestedTranslation.overview
        translationSource = 'exact'
        translationQuality = requestedTranslation.quality_score?.toNumber()
      } else if (fallbackTranslation && language !== this.DEFAULT_LANGUAGE) {
        displayName = fallbackTranslation.name
        displayDescription = fallbackTranslation.description
        displayOverview = fallbackTranslation.overview
        translationSource = 'fallback'
        translationQuality = fallbackTranslation.quality_score?.toNumber()
        resolvedLanguage = this.DEFAULT_LANGUAGE
      }

      const result: ToolWithTranslation = {
        ...tool,
        displayName,
        displayDescription,
        displayOverview,
        resolvedLanguage,
        translationSource,
        translationQuality,
        translations: undefined  // Remove raw translations
      }

      // Sérialiser les objets Prisma avant mise en cache et retour
      const serializedResult = serializePrismaObject(result)
      
      // Cache the result
      this.setCachedData(cacheKey, serializedResult)

      return serializedResult
    } catch (error) {
      console.error('Error in getToolBySlug:', error)
      return null
    }
  }

  /**
   * Get featured tools with multilingual support
   */
  async getFeaturedTools(language: SupportedLanguage, limit: number = 6): Promise<ToolWithTranslation[]> {
    try {
      if (!this.validateLanguage(language)) {
        throw new Error(`Invalid language code: ${language}`)
      }

      // Try to get from cache
      const cacheKey = `tools:featured:${language}:${limit}`
      const cached = this.getCachedData<ToolWithTranslation[]>(cacheKey)
      if (cached) {
        return cached
      }

      // Get featured tools with translations
      const tools = await prisma.tool.findMany({
        where: {
          isActive: true,
          featured: true
        },
        take: limit,
        orderBy: [
          { quality_score: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          translations: {
            where: {
              languageCode: {
                in: [language, this.DEFAULT_LANGUAGE]
              }
            }
          }
        }
      })

      // Process translations
      const processedTools = tools.map(tool => {
        const requestedTranslation = tool.translations?.find(t => t.languageCode === language)
        const fallbackTranslation = tool.translations?.find(t => t.languageCode === this.DEFAULT_LANGUAGE)
        
        let translationSource: 'exact' | 'fallback' | 'original' = 'original'
        let resolvedLanguage: SupportedLanguage = language

        let displayName = tool.toolName
        let displayDescription = tool.toolDescription
        let displayOverview = tool.overview

        if (requestedTranslation) {
          displayName = requestedTranslation.name
          displayDescription = requestedTranslation.description
          displayOverview = requestedTranslation.overview
          translationSource = 'exact'
        } else if (fallbackTranslation && language !== this.DEFAULT_LANGUAGE) {
          displayName = fallbackTranslation.name
          displayDescription = fallbackTranslation.description
          displayOverview = fallbackTranslation.overview
          translationSource = 'fallback'
          resolvedLanguage = this.DEFAULT_LANGUAGE
        }

        return {
          ...tool,
          displayName,
          displayDescription,
          displayOverview,
          resolvedLanguage,
          translationSource,
          translations: undefined
        }
      })

      // Sérialiser les objets Prisma avant mise en cache et retour
      const serializedTools = serializePrismaObject(processedTools)
      
      // Cache the result
      this.setCachedData(cacheKey, serializedTools)

      return serializedTools
    } catch (error) {
      console.error('Error in getFeaturedTools:', error)
      return []
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    console.log('Multilingual tools cache cleared')
  }
}

// Singleton instance
export const multilingualToolsService = new MultilingualToolsService()
export default MultilingualToolsService