/**
 * Service Multilingue pour Catégories
 * 
 * Gère les catégories avec traductions automatiques, fallbacks et cache.
 * Optimisé pour performance avec pré-chargement des traductions populaires.
 * 
 * @author Video-IA.net Development Team
 */

import { prisma } from '../client'
import { Category, CategoryTranslation, Prisma } from '@prisma/client'
import { SupportedLanguage } from './multilingual-tools'
import { getCategoryEmoji, getCategoryEmojiString } from '../../services/emojiMapping'

export interface CategoryWithTranslation extends Category {
  // Champs traduits
  displayName: string
  displayDescription: string | null
  
  // Métadonnées
  resolvedLanguage: SupportedLanguage
  translationSource: 'exact' | 'fallback' | 'original'
  emoji?: string
  actualToolCount?: number
}

export interface CategoriesResponse {
  categories: CategoryWithTranslation[]
  meta: {
    language: SupportedLanguage
    totalCount: number
    fallbackCount: number
    cacheHit: boolean
  }
}

class MultilingualCategoriesService {
  private readonly VALID_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'it', 'es', 'de', 'nl', 'pt']
  private readonly DEFAULT_LANGUAGE: SupportedLanguage = 'en'
  private readonly CACHE_TTL = 600000 // 10 minutes pour catégories (moins volatiles)
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
   * Validation du code langue
   */
  private validateLanguage(language: string): language is SupportedLanguage {
    return this.VALID_LANGUAGES.includes(language as SupportedLanguage)
  }

  /**
   * Récupérer toutes les catégories avec traductions
   */
  async getAllCategories(
    language: SupportedLanguage,
    options: {
      includeEmpty?: boolean
      useCache?: boolean
      includeCounts?: boolean
    } = {}
  ): Promise<CategoriesResponse> {
    try {
      const { includeEmpty = false, useCache = true, includeCounts = true } = options

      if (!this.validateLanguage(language)) {
        throw new Error(`Invalid language code: ${language}`)
      }

      // Cache check
      const cacheKey = `categories:all:${language}:${includeEmpty}:${includeCounts}`
      if (useCache) {
        const cached = this.getCachedData<CategoriesResponse>(cacheKey)
        if (cached) {
          cached.meta.cacheHit = true
          return cached
        }
      }

      // Requête avec traductions
      const categories = await prisma.category.findMany({
        ...(includeEmpty ? {} : { where: { toolCount: { gt: 0 } } }),
        include: {
          translations: {
            where: {
              languageCode: {
                in: [language, this.DEFAULT_LANGUAGE]
              }
            }
          }
        },
        orderBy: [
          { toolCount: 'desc' },
          { name: 'asc' }
        ]
      })

      let fallbackCount = 0
      
      // Calcul optimisé des tool counts en batch (1 seule requête)
      let toolCountsMap: Record<string, number> = {}
      if (includeCounts) {
        const toolCounts = await prisma.tool.groupBy({
          by: ['toolCategory'],
          where: {
            isActive: true,
            toolCategory: {
              in: categories.map(cat => cat.name)
            }
          },
          _count: {
            id: true
          }
        })
        
        toolCountsMap = Object.fromEntries(
          toolCounts.map(tc => [tc.toolCategory, tc._count.id])
        )
      }

      // Traitement avec fallbacks (sans requêtes individuelles)
      const processedCategories: CategoryWithTranslation[] = categories.map(category => {
        const requestedTranslation = category.translations.find(t => t.languageCode === language)
        const fallbackTranslation = category.translations.find(t => t.languageCode === this.DEFAULT_LANGUAGE)
        
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

        // Utilisation du count optimisé ou fallback vers category.toolCount
        const actualToolCount = includeCounts ? 
          (toolCountsMap[category.name] ?? (category.toolCount || 0)) : 
          (category.toolCount || 0)

        return {
          ...category,
          displayName: resolvedTranslation?.name || category.name,
          displayDescription: resolvedTranslation?.description || category.description,
          resolvedLanguage,
          translationSource,
          emoji: getCategoryEmojiString(category.name),
          actualToolCount
        }
      })

      const result: CategoriesResponse = {
        categories: processedCategories,
        meta: {
          language,
          totalCount: processedCategories.length,
          fallbackCount,
          cacheHit: false
        }
      }

      // Cache du résultat
      if (useCache) {
        this.setCachedData(cacheKey, result)
      }

      return result

    } catch (error) {
      console.error('Error in getAllCategories:', error)
      throw error
    }
  }

  /**
   * Récupérer catégories en vedette
   */
  async getFeaturedCategories(language: SupportedLanguage, limit: number = 6): Promise<CategoryWithTranslation[]> {
    try {
      const cacheKey = `categories:featured:${language}:${limit}`
      const cached = this.getCachedData<CategoryWithTranslation[]>(cacheKey)
      if (cached) {
        return cached
      }

      const categories = await prisma.category.findMany({
        where: { isFeatured: true },
        include: {
          translations: {
            where: {
              languageCode: {
                in: [language, this.DEFAULT_LANGUAGE]
              }
            }
          }
        },
        orderBy: [
          { toolCount: 'desc' },
          { name: 'asc' }
        ],
        take: limit
      })

      const processedCategories = categories.map(category => {
        const requestedTranslation = category.translations.find(t => t.languageCode === language)
        const fallbackTranslation = category.translations.find(t => t.languageCode === this.DEFAULT_LANGUAGE)
        
        let resolvedTranslation = requestedTranslation || fallbackTranslation
        const translationSource: 'exact' | 'fallback' | 'original' = 
          requestedTranslation ? 'exact' : fallbackTranslation ? 'fallback' : 'original'

        return {
          ...category,
          displayName: resolvedTranslation?.name || category.name,
          displayDescription: resolvedTranslation?.description || category.description,
          resolvedLanguage: requestedTranslation ? language : this.DEFAULT_LANGUAGE,
          translationSource,
          emoji: getCategoryEmojiString(category.name),
          actualToolCount: category.toolCount || 0
        }
      })

      this.setCachedData(cacheKey, processedCategories)
      return processedCategories

    } catch (error) {
      console.error('Error getting featured categories:', error)
      return []
    }
  }

  /**
   * Récupérer catégorie par slug
   */
  async getCategoryBySlug(slug: string, language: SupportedLanguage): Promise<CategoryWithTranslation | null> {
    try {
      const category = await prisma.category.findUnique({
        where: { slug },
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

      if (!category) {
        return null
      }

      const requestedTranslation = category.translations.find(t => t.languageCode === language)
      const fallbackTranslation = category.translations.find(t => t.languageCode === this.DEFAULT_LANGUAGE)
      
      let resolvedTranslation = requestedTranslation || fallbackTranslation
      const translationSource: 'exact' | 'fallback' | 'original' = 
        requestedTranslation ? 'exact' : fallbackTranslation ? 'fallback' : 'original'

      // Compter les outils actifs dans cette catégorie
      const actualToolCount = await prisma.tool.count({
        where: {
          toolCategory: category.name,
          isActive: true
        }
      })

      return {
        ...category,
        displayName: resolvedTranslation?.name || category.name,
        displayDescription: resolvedTranslation?.description || category.description,
        resolvedLanguage: requestedTranslation ? language : this.DEFAULT_LANGUAGE,
        translationSource,
        emoji: getCategoryEmojiString(category.name),
        actualToolCount
      }

    } catch (error) {
      console.error('Error getting category by slug:', error)
      return null
    }
  }

  /**
   * Récupérer top catégories par nombre d'outils
   */
  async getTopCategories(language: SupportedLanguage, limit: number = 10): Promise<CategoryWithTranslation[]> {
    try {
      const result = await this.getAllCategories(language, {
        includeEmpty: false,
        useCache: true,
        includeCounts: true
      })

      return result.categories
        .sort((a, b) => (b.actualToolCount || 0) - (a.actualToolCount || 0))
        .slice(0, limit)

    } catch (error) {
      console.error('Error getting top categories:', error)
      return []
    }
  }

  /**
   * Recherche de catégories par nom
   */
  async searchCategories(
    query: string,
    language: SupportedLanguage,
    limit: number = 20
  ): Promise<CategoryWithTranslation[]> {
    try {
      if (!query || query.length < 2) {
        return []
      }

      const categories = await prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            {
              translations: {
                some: {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                  ]
                }
              }
            }
          ]
        },
        include: {
          translations: {
            where: {
              languageCode: {
                in: [language, this.DEFAULT_LANGUAGE]
              }
            }
          }
        },
        take: limit,
        orderBy: { toolCount: 'desc' }
      })

      return categories.map(category => {
        const requestedTranslation = category.translations.find(t => t.languageCode === language)
        const fallbackTranslation = category.translations.find(t => t.languageCode === this.DEFAULT_LANGUAGE)
        
        let resolvedTranslation = requestedTranslation || fallbackTranslation
        const translationSource: 'exact' | 'fallback' | 'original' = 
          requestedTranslation ? 'exact' : fallbackTranslation ? 'fallback' : 'original'

        return {
          ...category,
          displayName: resolvedTranslation?.name || category.name,
          displayDescription: resolvedTranslation?.description || category.description,
          resolvedLanguage: requestedTranslation ? language : this.DEFAULT_LANGUAGE,
          translationSource,
          emoji: getCategoryEmojiString(category.name),
          actualToolCount: category.toolCount || 0
        }
      })

    } catch (error) {
      console.error('Error searching categories:', error)
      return []
    }
  }

  /**
   * Nettoyer le cache
   */
  clearCache() {
    this.cache.clear()
    console.log('Categories cache cleared')
  }

  /**
   * Statistiques du service
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      supportedLanguages: this.VALID_LANGUAGES,
      cacheTTL: this.CACHE_TTL
    }
  }
}

// Instance singleton
export const multilingualCategoriesService = new MultilingualCategoriesService()
export default MultilingualCategoriesService