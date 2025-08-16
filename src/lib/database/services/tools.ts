/**
 * Tools Service - Prisma Implementation
 * 
 * Service de gestion des outils IA utilisant exclusivement Prisma ORM.
 * Remplace l'ancienne implémentation PostgreSQL directe.
 * 
 * @author Video-IA.net Development Team
 */

import { prisma } from '../client'
import { Tool, ToolTranslation, Prisma } from '@prisma/client'

export interface ToolsSearchParams {
  query?: string
  category?: string
  featured?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filter?: 'never_optimized' | 'needs_update' | 'all'
}

export interface PaginatedToolsResponse {
  tools: Tool[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ToolData {
  toolName: string
  toolCategory?: string
  toolLink?: string
  overview?: string
  toolDescription?: string
  targetAudience?: string
  keyFeatures?: string
  useCases?: string
  tags?: string
  imageUrl?: string
  slug?: string
  isActive?: boolean
  featured?: boolean
  qualityScore?: number
  metaTitle?: string
  metaDescription?: string
  seoKeywords?: string
}

export class ToolsService {
  /**
   * Rechercher des outils avec filtres et pagination
   */
  static async searchTools(params: ToolsSearchParams = {}): Promise<PaginatedToolsResponse> {
    const {
      query,
      category,
      featured,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filter = 'all'
    } = params

    // Construction des conditions WHERE
    const where: Prisma.ToolWhereInput = {
      isActive: true
    }

    if (category) {
      where.toolCategory = category
    }

    if (featured !== undefined) {
      where.featured = featured
    }

    if (query) {
      where.OR = [
        { toolName: { contains: query, mode: 'insensitive' } },
        { toolDescription: { contains: query, mode: 'insensitive' } },
        { overview: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (filter === 'never_optimized') {
      where.lastOptimizedAt = null
    } else if (filter === 'needs_update') {
      where.lastOptimizedAt = {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
      }
    }

    // Construction de l'ordre
    const orderBy: Prisma.ToolOrderByWithRelationInput = {}
    if (sortBy === 'name') {
      orderBy.toolName = sortOrder
    } else if (sortBy === 'quality_score') {
      orderBy.quality_score = sortOrder
    } else if (sortBy === 'view_count') {
      orderBy.viewCount = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Exécution des requêtes
    const [tools, totalCount] = await Promise.all([
      prisma.tool.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.tool.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return {
      tools,
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  }

  /**
   * Récupérer un outil par son ID
   */
  static async getToolById(id: number): Promise<Tool | null> {
    return prisma.tool.findUnique({
      where: { id, isActive: true }
    })
  }

  /**
   * Récupérer un outil par son slug
   */
  static async getToolBySlug(slug: string): Promise<Tool | null> {
    return prisma.tool.findUnique({
      where: { slug, isActive: true }
    })
  }

  /**
   * Récupérer les outils mis en avant
   */
  static async getFeaturedTools(limit: number = 6): Promise<Tool[]> {
    return prisma.tool.findMany({
      where: {
        isActive: true,
        featured: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })
  }

  /**
   * Récupérer les outils populaires
   */
  static async getPopularTools(limit: number = 10): Promise<Tool[]> {
    return prisma.tool.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { viewCount: 'desc' }
      ],
      take: limit
    })
  }

  /**
   * Récupérer tous les outils (pour generateStaticParams)
   */
  static async getAllTools(page: number = 1, limit: number = 1000): Promise<PaginatedToolsResponse> {
    const skip = (page - 1) * limit

    const [tools, totalCount] = await Promise.all([
      prisma.tool.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.tool.count({
        where: {
          isActive: true
        }
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return {
      tools,
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  }

  /**
   * Créer un nouvel outil
   */
  static async createTool(data: ToolData): Promise<Tool> {
    return prisma.tool.create({
      data: {
        toolName: data.toolName,
        toolCategory: data.toolCategory,
        toolLink: data.toolLink,
        overview: data.overview,
        toolDescription: data.toolDescription,
        targetAudience: data.targetAudience,
        keyFeatures: data.keyFeatures,
        useCases: data.useCases,
        tags: data.tags,
        imageUrl: data.imageUrl,
        slug: data.slug,
        isActive: data.isActive ?? true,
        featured: data.featured ?? false,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        seoKeywords: data.seoKeywords
      }
    })
  }

  /**
   * Mettre à jour un outil
   */
  static async updateTool(id: number, data: Partial<ToolData>): Promise<Tool> {
    return prisma.tool.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  /**
   * Supprimer un outil (soft delete)
   */
  static async deleteTool(id: number): Promise<Tool> {
    return prisma.tool.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })
  }

  /**
   * Incrémenter le compteur de vues
   */
  static async incrementViewCount(id: number): Promise<void> {
    await prisma.tool.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        },
        updatedAt: new Date()
      }
    })
  }

  /**
   * Incrémenter le compteur de clics
   */
  static async incrementClickCount(id: number): Promise<void> {
    await prisma.tool.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1
        },
        updatedAt: new Date()
      }
    })
  }

  /**
   * Obtenir les statistiques des outils
   */
  static async getToolStatistics(): Promise<{
    totalTools: number
    activeTools: number
    featuredTools: number
    totalViews: number
    totalClicks: number
  }> {
    const [
      totalTools,
      activeTools,
      featuredTools,
      aggregates
    ] = await Promise.all([
      prisma.tool.count(),
      prisma.tool.count({ where: { isActive: true } }),
      prisma.tool.count({ where: { isActive: true, featured: true } }),
      prisma.tool.aggregate({
        where: { isActive: true },
        _sum: {
          viewCount: true,
          clickCount: true
        }
      })
    ])

    return {
      totalTools,
      activeTools,
      featuredTools,
      totalViews: aggregates._sum.viewCount || 0,
      totalClicks: aggregates._sum.clickCount || 0
    }
  }

  /**
   * Récupérer les traductions d'un outil
   */
  static async getToolTranslations(toolId: number): Promise<ToolTranslation[]> {
    return prisma.toolTranslation.findMany({
      where: { toolId },
      include: {
        language: true
      }
    })
  }

  /**
   * Créer une traduction pour un outil
   */
  static async createToolTranslation(data: {
    toolId: number
    languageCode: string
    name: string
    overview?: string
    description?: string
    metaTitle?: string
    metaDescription?: string
    translationSource?: string
    humanReviewed?: boolean
  }): Promise<ToolTranslation> {
    return prisma.toolTranslation.create({
      data
    })
  }

  /**
   * Mettre à jour une traduction
   */
  static async updateToolTranslation(
    id: number,
    data: Partial<{
      name: string
      overview: string
      description: string
      metaTitle: string
      metaDescription: string
      translationSource: string
      humanReviewed: boolean
    }>
  ): Promise<ToolTranslation> {
    return prisma.toolTranslation.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  /**
   * Supprimer une traduction
   */
  static async deleteToolTranslation(id: number): Promise<ToolTranslation> {
    return prisma.toolTranslation.delete({
      where: { id }
    })
  }
}

// Export par défaut pour compatibilité
export const toolsService = ToolsService