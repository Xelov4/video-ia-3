/**
 * Tools Database Service
 * 
 * Comprehensive service layer for AI tools data management.
 * Provides type-safe CRUD operations, advanced search, filtering,
 * and analytics tracking for the tools directory.
 * 
 * Features:
 * - Advanced search with full-text capabilities
 * - Category-based filtering
 * - Pagination with performance optimization
 * - Analytics tracking (views, clicks, favorites)
 * - SEO metadata management
 * - Content management operations
 * 
 * @author Video-IA.net Development Team
 */

import { Tool, Prisma } from '@prisma/client'
import { prisma } from '../client'

/**
 * Search and filtering parameters for tools
 */
export interface ToolsSearchParams {
  query?: string
  category?: string
  featured?: boolean
  isActive?: boolean
  tags?: string[]
  page?: number
  limit?: number
  sortBy?: 'toolName' | 'createdAt' | 'updatedAt' | 'viewCount' | 'qualityScore'
  sortOrder?: 'asc' | 'desc'
  excludeId?: number
}

/**
 * Paginated tools response
 */
export interface PaginatedToolsResponse {
  tools: Tool[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  hasMore: boolean
}

/**
 * Tool creation/update data
 */
export interface ToolData {
  toolName: string
  slug?: string
  toolCategory?: string
  toolLink?: string
  overview?: string
  toolDescription?: string
  targetAudience?: string
  keyFeatures?: string
  useCases?: string
  tags?: string
  imageUrl?: string
  isActive?: boolean
  featured?: boolean
  qualityScore?: number
  metaTitle?: string
  metaDescription?: string
  seoKeywords?: string
}

/**
 * Tools Service Class
 * 
 * Encapsulates all database operations for AI tools.
 * Provides high-level methods for common operations while
 * maintaining performance and type safety.
 */
export class ToolsService {
  /**
   * Search and filter tools with advanced options
   * 
   * Supports full-text search, category filtering, pagination,
   * and sorting. Optimized for performance with database indexes.
   * 
   * @param params Search and filtering parameters
   * @returns Paginated tools response with metadata
   */
  static async searchTools(params: ToolsSearchParams = {}): Promise<PaginatedToolsResponse> {
    const {
      query,
      category,
      featured,
      isActive = true,
      tags = [],
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      excludeId
    } = params

    // Build where clause dynamically
    const where: Prisma.ToolWhereInput = {
      isActive,
      ...(featured !== undefined && { featured }),
      ...(category && { toolCategory: { contains: category, mode: 'insensitive' } }),
      ...(excludeId && { id: { not: excludeId } }),
      ...(query && {
        OR: [
          { toolName: { contains: query, mode: 'insensitive' } },
          { overview: { contains: query, mode: 'insensitive' } },
          { toolDescription: { contains: query, mode: 'insensitive' } },
          { keyFeatures: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } }
        ]
      }),
      ...(tags.length > 0 && {
        OR: tags.map(tag => ({
          tags: { contains: tag, mode: 'insensitive' }
        }))
      })
    }

    // Build order by clause
    const orderBy: Prisma.ToolOrderByWithRelationInput = {
      [sortBy]: sortOrder
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    try {
      // Execute queries in parallel for performance
      const [tools, totalCount] = await Promise.all([
        prisma.tool.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.tool.count({ where })
      ])

      const totalPages = Math.ceil(totalCount / limit)

      return {
        tools,
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        hasMore: page < totalPages
      }
    } catch (error) {
      console.error('Error searching tools:', error)
      throw new Error('Failed to search tools')
    }
  }

  /**
   * Get a single tool by ID with analytics tracking
   * 
   * Retrieves tool details and optionally increments view count
   * for analytics tracking.
   * 
   * @param id Tool ID
   * @param incrementView Whether to increment view count
   * @returns Tool data or null if not found
   */
  static async getToolById(id: number, incrementView: boolean = false): Promise<Tool | null> {
    try {
      const tool = await prisma.tool.findUnique({
        where: { id }
      })

      // Increment view count if requested
      if (tool && incrementView) {
        await prisma.tool.update({
          where: { id },
          data: { viewCount: { increment: 1 } }
        })
        
        // Return updated tool with new view count
        return { ...tool, viewCount: (tool.viewCount || 0) + 1 }
      }

      return tool
    } catch (error) {
      console.error('Error getting tool by ID:', error)
      throw new Error('Failed to retrieve tool')
    }
  }

  /**
   * Get a tool by slug with SEO optimization
   * 
   * Retrieves tool by URL slug for SEO-friendly URLs.
   * Automatically increments view count for analytics.
   * 
   * @param slug Tool slug
   * @returns Tool data or null if not found
   */
  static async getToolBySlug(slug: string): Promise<Tool | null> {
    try {
      const tool = await prisma.tool.findUnique({
        where: { slug }
      })

      // Increment view count for public access
      if (tool) {
        await prisma.tool.update({
          where: { slug },
          data: { viewCount: { increment: 1 } }
        })
        
        return { ...tool, viewCount: (tool.viewCount || 0) + 1 }
      }

      return tool
    } catch (error) {
      console.error('Error getting tool by slug:', error)
      throw new Error('Failed to retrieve tool')
    }
  }

  /**
   * Get featured tools for homepage display
   * 
   * Retrieves high-quality featured tools for prominent display
   * on the homepage and marketing materials.
   * 
   * @param limit Number of tools to return
   * @returns Array of featured tools
   */
  static async getFeaturedTools(limit: number = 8): Promise<Tool[]> {
    try {
      return await prisma.tool.findMany({
        where: {
          featured: true,
          isActive: true
        },
        orderBy: [
          { qualityScore: 'desc' },
          { viewCount: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      })
    } catch (error) {
      console.error('Error getting featured tools:', error)
      throw new Error('Failed to retrieve featured tools')
    }
  }

  /**
   * Get tools by category with pagination
   * 
   * Retrieves tools filtered by category with pagination support.
   * Used for category-specific directory pages.
   * 
   * @param category Category name
   * @param page Page number
   * @param limit Items per page
   * @returns Paginated category tools
   */
  static async getToolsByCategory(
    category: string, 
    page: number = 1, 
    limit: number = 12
  ): Promise<PaginatedToolsResponse> {
    return this.searchTools({
      category,
      page,
      limit,
      sortBy: 'viewCount',
      sortOrder: 'desc'
    })
  }

  /**
   * Get popular tools based on engagement metrics
   * 
   * Retrieves tools with high engagement (views, clicks, favorites)
   * for trending/popular sections.
   * 
   * @param limit Number of tools to return
   * @param timeframe Optional time constraint
   * @returns Array of popular tools
   */
  static async getPopularTools(limit: number = 10): Promise<Tool[]> {
    try {
      return await prisma.tool.findMany({
        where: {
          isActive: true
        },
        orderBy: [
          { viewCount: 'desc' },
          { clickCount: 'desc' },
          { favoriteCount: 'desc' },
          { qualityScore: 'desc' }
        ],
        take: limit
      })
    } catch (error) {
      console.error('Error getting popular tools:', error)
      throw new Error('Failed to retrieve popular tools')
    }
  }

  /**
   * Create a new tool
   * 
   * Adds a new AI tool to the directory with full validation
   * and automatic slug generation.
   * 
   * @param data Tool creation data
   * @returns Created tool
   */
  static async createTool(data: ToolData): Promise<Tool> {
    try {
      // Generate slug if not provided
      const slug = data.slug || this.generateSlug(data.toolName)

      return await prisma.tool.create({
        data: {
          ...data,
          slug,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastCheckedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error creating tool:', error)
      throw new Error('Failed to create tool')
    }
  }

  /**
   * Update an existing tool
   * 
   * Updates tool information with validation and automatic
   * timestamp management.
   * 
   * @param id Tool ID
   * @param data Update data
   * @returns Updated tool
   */
  static async updateTool(id: number, data: Partial<ToolData>): Promise<Tool> {
    try {
      return await prisma.tool.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error updating tool:', error)
      throw new Error('Failed to update tool')
    }
  }

  /**
   * Delete a tool (soft delete by setting inactive)
   * 
   * Performs soft delete by setting isActive to false.
   * Preserves data for analytics and potential recovery.
   * 
   * @param id Tool ID
   * @returns Updated tool
   */
  static async deleteTool(id: number): Promise<Tool> {
    try {
      return await prisma.tool.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error deleting tool:', error)
      throw new Error('Failed to delete tool')
    }
  }

  /**
   * Track tool click for analytics
   * 
   * Increments click count when users visit tool's external link.
   * Used for engagement analytics and popular tool detection.
   * 
   * @param id Tool ID
   */
  static async trackToolClick(id: number): Promise<void> {
    try {
      await prisma.tool.update({
        where: { id },
        data: {
          clickCount: { increment: 1 }
        }
      })
    } catch (error) {
      console.error('Error tracking tool click:', error)
      // Don't throw error for analytics tracking
    }
  }

  /**
   * Toggle tool favorite status
   * 
   * Manages tool favorite count for user engagement features.
   * 
   * @param id Tool ID
   * @param increment Whether to increment (true) or decrement (false)
   */
  static async toggleToolFavorite(id: number, increment: boolean): Promise<void> {
    try {
      await prisma.tool.update({
        where: { id },
        data: {
          favoriteCount: { increment: increment ? 1 : -1 }
        }
      })
    } catch (error) {
      console.error('Error toggling tool favorite:', error)
      // Don't throw error for analytics tracking
    }
  }

  /**
   * Get tool statistics for admin dashboard
   * 
   * Retrieves comprehensive statistics about tools in the system.
   * Used for admin dashboard and analytics.
   * 
   * @returns Tool statistics object
   */
  static async getToolStatistics(): Promise<{
    totalTools: number
    activeTools: number
    featuredTools: number
    categoriesCount: number
    averageQualityScore: number
    totalViews: number
    totalClicks: number
  }> {
    try {
      const [
        totalTools,
        activeTools,
        featuredTools,
        categories,
        avgQuality,
        viewStats,
        clickStats
      ] = await Promise.all([
        prisma.tool.count(),
        prisma.tool.count({ where: { isActive: true } }),
        prisma.tool.count({ where: { featured: true, isActive: true } }),
        prisma.tool.groupBy({
          by: ['toolCategory'],
          where: { isActive: true, toolCategory: { not: null } }
        }),
        prisma.tool.aggregate({
          where: { isActive: true },
          _avg: { qualityScore: true }
        }),
        prisma.tool.aggregate({
          where: { isActive: true },
          _sum: { viewCount: true }
        }),
        prisma.tool.aggregate({
          where: { isActive: true },
          _sum: { clickCount: true }
        })
      ])

      return {
        totalTools,
        activeTools,
        featuredTools,
        categoriesCount: categories.length,
        averageQualityScore: Math.round(avgQuality._avg.qualityScore || 0),
        totalViews: viewStats._sum.viewCount || 0,
        totalClicks: clickStats._sum.clickCount || 0
      }
    } catch (error) {
      console.error('Error getting tool statistics:', error)
      throw new Error('Failed to retrieve tool statistics')
    }
  }

  /**
   * Increment view count for a tool
   * 
   * Tracks tool views for analytics. Non-blocking operation
   * that handles errors gracefully.
   * 
   * @param toolId Tool ID or slug
   * @returns Updated tool or null if error
   */
  static async incrementViewCount(toolId: number | string): Promise<Tool | null> {
    try {
      const whereClause = typeof toolId === 'string' 
        ? { slug: toolId }
        : { id: toolId }

      return await prisma.tool.update({
        where: whereClause,
        data: {
          viewCount: {
            increment: 1
          }
        }
      })
    } catch (error) {
      console.error('Error incrementing view count:', error)
      // Return null for non-blocking behavior
      return null
    }
  }

  /**
   * Increment click count for a tool
   * 
   * Tracks tool clicks for analytics. Non-blocking operation
   * that handles errors gracefully.
   * 
   * @param toolId Tool ID or slug
   * @returns Updated tool or null if error
   */
  static async incrementClickCount(toolId: number | string): Promise<Tool | null> {
    try {
      const whereClause = typeof toolId === 'string' 
        ? { slug: toolId }
        : { id: toolId }

      return await prisma.tool.update({
        where: whereClause,
        data: {
          clickCount: {
            increment: 1
          }
        }
      })
    } catch (error) {
      console.error('Error incrementing click count:', error)
      // Return null for non-blocking behavior
      return null
    }
  }

  /**
   * Generate URL-friendly slug from tool name
   * 
   * Creates SEO-friendly slug from tool name with proper formatting
   * and uniqueness validation.
   * 
   * @param name Tool name
   * @returns Generated slug
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)
  }
}

export default ToolsService