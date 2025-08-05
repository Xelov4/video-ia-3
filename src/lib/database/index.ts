/**
 * Database Services Index
 * 
 * Central export point for all database services and utilities.
 * Provides unified access to the complete database layer with
 * type safety and comprehensive functionality.
 * 
 * Services:
 * - ToolsService: AI tools management with search, analytics, CRUD
 * - CategoriesService: Category management with hierarchical support
 * - TagsService: Tag management with usage tracking and cleanup
 * - Database client: Prisma client with connection management
 * 
 * Features:
 * - Type-safe database operations
 * - Performance-optimized queries
 * - Comprehensive error handling
 * - Analytics and statistics
 * - SEO optimization support
 * - Admin interface integration
 * 
 * @author Video-IA.net Development Team
 */

// Core database client
export { prisma, checkDatabaseConnection, disconnectDatabase } from './client'

// Service classes
export { ToolsService } from './services/tools'
export { CategoriesService } from './services/categories'
export { TagsService } from './services/tags'

// Type exports
export type {
  ToolsSearchParams,
  PaginatedToolsResponse,
  ToolData
} from './services/tools'

export type {
  CategoryWithStats,
  CategoryData
} from './services/categories'

export type {
  TagWithStats,
  TagData,
  TagCloudItem
} from './services/tags'

// Re-export Prisma types
export type { Tool, Category, Tag } from '@prisma/client'

/**
 * Database Utilities
 * 
 * Helper functions for common database operations
 * and maintenance tasks.
 */
export class DatabaseUtils {
  /**
   * Synchronize all counts and statistics
   * 
   * Updates all count fields across the database for
   * data consistency. Should be run periodically.
   * 
   * @returns Summary of synchronization results
   */
  static async synchronizeAllCounts(): Promise<{
    categoriesUpdated: number
    tagsUpdated: number
    unusedTagsDeleted: number
  }> {
    try {
      const { CategoriesService } = await import('./services/categories')
      const { TagsService } = await import('./services/tags')

      const [
        updatedCategories,
        updatedTags,
        deletedTags
      ] = await Promise.all([
        CategoriesService.synchronizeAllToolCounts(),
        TagsService.synchronizeAllUsageCounts(),
        TagsService.cleanupUnusedTags()
      ])

      return {
        categoriesUpdated: updatedCategories.length,
        tagsUpdated: updatedTags.length,
        unusedTagsDeleted: deletedTags
      }
    } catch (error) {
      console.error('Error synchronizing database counts:', error)
      throw new Error('Failed to synchronize database counts')
    }
  }

  /**
   * Get comprehensive database statistics
   * 
   * Retrieves statistics from all database entities
   * for admin dashboard and monitoring.
   * 
   * @returns Complete database statistics
   */
  static async getDatabaseStatistics(): Promise<{
    tools: any
    categories: any
    tags: any
    system: {
      connected: boolean
      totalRecords: number
      lastSynchronized: Date
    }
  }> {
    try {
      const { ToolsService } = await import('./services/tools')
      const { CategoriesService } = await import('./services/categories')
      const { TagsService } = await import('./services/tags')
      const { checkDatabaseConnection } = await import('./client')

      const [
        toolStats,
        categoryStats,
        tagStats,
        connectionStatus
      ] = await Promise.all([
        ToolsService.getToolStatistics(),
        CategoriesService.getCategoryStatistics(),
        TagsService.getTagStatistics(),
        checkDatabaseConnection()
      ])

      const totalRecords = toolStats.totalTools + 
                          categoryStats.totalCategories + 
                          tagStats.totalTags

      return {
        tools: toolStats,
        categories: categoryStats,
        tags: tagStats,
        system: {
          connected: connectionStatus.connected,
          totalRecords,
          lastSynchronized: new Date()
        }
      }
    } catch (error) {
      console.error('Error getting database statistics:', error)
      throw new Error('Failed to retrieve database statistics')
    }
  }

  /**
   * Health check for all database services
   * 
   * Verifies that all database services are functioning
   * correctly. Used for monitoring and debugging.
   * 
   * @returns Health check results
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    services: {
      database: boolean
      tools: boolean
      categories: boolean
      tags: boolean
    }
    errors: string[]
  }> {
    const errors: string[] = []
    const services = {
      database: false,
      tools: false,
      categories: false,
      tags: false
    }

    try {
      // Test database connection
      const { checkDatabaseConnection } = await import('./client')
      const connectionStatus = await checkDatabaseConnection()
      services.database = connectionStatus.connected
      
      if (!connectionStatus.connected) {
        errors.push(`Database connection failed: ${connectionStatus.error}`)
      }
    } catch (error) {
      errors.push('Database service error')
    }

    try {
      // Test tools service
      const { ToolsService } = await import('./services/tools')
      await ToolsService.searchTools({ limit: 1 })
      services.tools = true
    } catch (error) {
      errors.push('Tools service error')
    }

    try {
      // Test categories service
      const { CategoriesService } = await import('./services/categories')
      await CategoriesService.getAllCategories()
      services.categories = true
    } catch (error) {
      errors.push('Categories service error')
    }

    try {
      // Test tags service
      const { TagsService } = await import('./services/tags')
      await TagsService.getAllTags()
      services.tags = true
    } catch (error) {
      errors.push('Tags service error')
    }

    // Determine overall status
    const healthyServices = Object.values(services).filter(Boolean).length
    const totalServices = Object.keys(services).length

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (healthyServices === 0) {
      status = 'unhealthy'
    } else if (healthyServices < totalServices) {
      status = 'degraded'
    }

    return {
      status,
      services,
      errors
    }
  }
}

/**
 * Database initialization and setup
 * 
 * Ensures database is properly initialized and ready for use.
 * Should be called during application startup.
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    const { checkDatabaseConnection } = await import('./client')
    const status = await checkDatabaseConnection()
    
    if (!status.connected) {
      console.error('Database initialization failed:', status.error)
      return false
    }

    console.log('✅ Database initialized successfully')
    console.log(`📊 Database stats: ${status.stats?.toolCount} tools, ${status.stats?.categoryCount} categories, ${status.stats?.tagCount} tags`)
    
    return true
  } catch (error) {
    console.error('Database initialization error:', error)
    return false
  }
}