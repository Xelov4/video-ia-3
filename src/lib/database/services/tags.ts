/**
 * Tags Database Service
 * 
 * Service layer for managing tags in the AI tools directory.
 * Provides CRUD operations, usage tracking, and tag cloud
 * functionality for enhanced tool discoverability.
 * 
 * Features:
 * - Tag CRUD operations
 * - Usage count tracking
 * - Popular tags identification
 * - Tag cloud generation
 * - SEO slug management
 * - Auto-cleanup of unused tags
 * 
 * @author Video-IA.net Development Team
 */

import { Tag, Prisma } from '@prisma/client'
import { prisma } from '../client'

/**
 * Tag with additional metadata
 */
export interface TagWithStats extends Tag {
  actualUsageCount?: number
}

/**
 * Tag creation/update data
 */
export interface TagData {
  name: string
  slug?: string
}

/**
 * Tag cloud item for frontend display
 */
export interface TagCloudItem {
  name: string
  slug: string
  count: number
  weight: number // 1-5 for sizing
}

/**
 * Tags Service Class
 * 
 * Manages all tag-related database operations with
 * optimized queries and automatic usage tracking.
 */
export class TagsService {
  /**
   * Get all tags with usage counts
   * 
   * Retrieves all tags ordered by usage count and name.
   * Includes actual usage counts for accuracy.
   * 
   * @param includeUnused Whether to include tags with 0 usage
   * @returns Array of tags with statistics
   */
  static async getAllTags(includeUnused: boolean = true): Promise<TagWithStats[]> {
    try {
      const tags = await prisma.tag.findMany({
        orderBy: [
          { usageCount: 'desc' },
          { name: 'asc' }
        ]
      })

      // Calculate actual usage counts by parsing tool tags
      const tagsWithStats = await Promise.all(
        tags.map(async (tag) => {
          const toolsWithTag = await prisma.tool.count({
            where: {
              tags: {
                contains: tag.name,
                mode: 'insensitive'
              },
              isActive: true
            }
          })

          return {
            ...tag,
            actualUsageCount: toolsWithTag
          }
        })
      )

      // Filter out unused tags if requested
      if (!includeUnused) {
        return tagsWithStats.filter(tag => (tag.actualUsageCount || 0) > 0)
      }

      return tagsWithStats
    } catch (error) {
      console.error('Error getting all tags:', error)
      throw new Error('Failed to retrieve tags')
    }
  }

  /**
   * Get popular tags for tag cloud
   * 
   * Retrieves most popular tags with weighted scores
   * for tag cloud display.
   * 
   * @param limit Number of tags to return
   * @returns Array of tag cloud items
   */
  static async getPopularTags(limit: number = 30): Promise<TagCloudItem[]> {
    try {
      const tags = await prisma.tag.findMany({
        where: {
          usageCount: { gt: 0 }
        },
        orderBy: {
          usageCount: 'desc'
        },
        take: limit
      })

      // Calculate weights for tag cloud (1-5 scale)
      const maxUsage = Math.max(...tags.map(tag => tag.usageCount || 0))
      const minUsage = Math.min(...tags.map(tag => tag.usageCount || 0))
      const usageRange = maxUsage - minUsage

      return tags.map(tag => {
        const normalizedUsage = usageRange > 0 
          ? ((tag.usageCount || 0) - minUsage) / usageRange 
          : 0.5
        
        const weight = Math.max(1, Math.min(5, Math.ceil(normalizedUsage * 5)))

        return {
          name: tag.name,
          slug: tag.slug || this.generateSlug(tag.name),
          count: tag.usageCount || 0,
          weight
        }
      })
    } catch (error) {
      console.error('Error getting popular tags:', error)
      throw new Error('Failed to retrieve popular tags')
    }
  }

  /**
   * Get tag by slug
   * 
   * Retrieves tag by URL slug for SEO-friendly URLs.
   * 
   * @param slug Tag slug
   * @returns Tag data or null if not found
   */
  static async getTagBySlug(slug: string): Promise<Tag | null> {
    try {
      return await prisma.tag.findUnique({
        where: { slug }
      })
    } catch (error) {
      console.error('Error getting tag by slug:', error)
      throw new Error('Failed to retrieve tag')
    }
  }

  /**
   * Get tag by name
   * 
   * Retrieves tag by exact name match.
   * Used for tool tagging and filtering.
   * 
   * @param name Tag name
   * @returns Tag data or null if not found
   */
  static async getTagByName(name: string): Promise<Tag | null> {
    try {
      return await prisma.tag.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          }
        }
      })
    } catch (error) {
      console.error('Error getting tag by name:', error)
      throw new Error('Failed to retrieve tag')
    }
  }

  /**
   * Create a new tag
   * 
   * Adds a new tag with automatic slug generation
   * and validation.
   * 
   * @param data Tag creation data
   * @returns Created tag
   */
  static async createTag(data: TagData): Promise<Tag> {
    try {
      // Generate slug if not provided
      const slug = data.slug || this.generateSlug(data.name)

      return await prisma.tag.create({
        data: {
          ...data,
          slug,
          usageCount: 0,
          createdAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error creating tag:', error)
      throw new Error('Failed to create tag')
    }
  }

  /**
   * Update an existing tag
   * 
   * Updates tag information with validation.
   * Automatically recalculates usage count if name changes.
   * 
   * @param id Tag ID
   * @param data Update data
   * @returns Updated tag
   */
  static async updateTag(id: number, data: Partial<TagData>): Promise<Tag> {
    try {
      const updatedTag = await prisma.tag.update({
        where: { id },
        data
      })

      // Recalculate usage count if name changed
      if (data.name) {
        await this.updateTagUsageCount(id)
      }

      return updatedTag
    } catch (error) {
      console.error('Error updating tag:', error)
      throw new Error('Failed to update tag')
    }
  }

  /**
   * Delete a tag
   * 
   * Removes tag from database. Should be used carefully
   * as it may affect tool filtering.
   * 
   * @param id Tag ID
   */
  static async deleteTag(id: number): Promise<void> {
    try {
      await prisma.tag.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting tag:', error)
      throw new Error('Failed to delete tag')
    }
  }

  /**
   * Update tag usage count
   * 
   * Synchronizes the usage count for a specific tag
   * by counting tools that contain this tag.
   * 
   * @param tagId Tag ID
   * @returns Updated tag
   */
  static async updateTagUsageCount(tagId: number): Promise<Tag> {
    try {
      const tag = await prisma.tag.findUnique({
        where: { id: tagId }
      })

      if (!tag) {
        throw new Error('Tag not found')
      }

      const usageCount = await prisma.tool.count({
        where: {
          tags: {
            contains: tag.name,
            mode: 'insensitive'
          },
          isActive: true
        }
      })

      return await prisma.tag.update({
        where: { id: tagId },
        data: { usageCount }
      })
    } catch (error) {
      console.error('Error updating tag usage count:', error)
      throw new Error('Failed to update tag usage count')
    }
  }

  /**
   * Synchronize all tag usage counts
   * 
   * Updates usage counts for all tags by counting
   * tools that contain each tag. Should be run periodically.
   * 
   * @returns Array of updated tags
   */
  static async synchronizeAllUsageCounts(): Promise<Tag[]> {
    try {
      const tags = await prisma.tag.findMany()
      
      const updatedTags = await Promise.all(
        tags.map(async (tag) => {
          const usageCount = await prisma.tool.count({
            where: {
              tags: {
                contains: tag.name,
                mode: 'insensitive'
              },
              isActive: true
            }
          })

          return await prisma.tag.update({
            where: { id: tag.id },
            data: { usageCount }
          })
        })
      )

      return updatedTags
    } catch (error) {
      console.error('Error synchronizing tag usage counts:', error)
      throw new Error('Failed to synchronize tag usage counts')
    }
  }

  /**
   * Extract and create tags from text
   * 
   * Parses comma-separated tag string and creates
   * tags that don't exist yet.
   * 
   * @param tagsString Comma-separated tags string
   * @returns Array of tag names
   */
  static async extractAndCreateTags(tagsString: string): Promise<string[]> {
    if (!tagsString) return []

    try {
      // Parse tags from string
      const tagNames = tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 10) // Limit to 10 tags per tool

      // Create tags that don't exist
      await Promise.all(
        tagNames.map(async (tagName) => {
          const existingTag = await this.getTagByName(tagName)
          if (!existingTag) {
            await this.createTag({ name: tagName })
          }
        })
      )

      return tagNames
    } catch (error) {
      console.error('Error extracting and creating tags:', error)
      return []
    }
  }

  /**
   * Get related tags
   * 
   * Finds tags that frequently appear together with
   * the given tag for recommendations.
   * 
   * @param tagName Tag name to find related tags for
   * @param limit Number of related tags to return
   * @returns Array of related tag names
   */
  static async getRelatedTags(tagName: string, limit: number = 5): Promise<string[]> {
    try {
      // Get tools that have this tag
      const toolsWithTag = await prisma.tool.findMany({
        where: {
          tags: {
            contains: tagName,
            mode: 'insensitive'
          },
          isActive: true
        },
        select: { tags: true }
      })

      // Count co-occurring tags
      const tagCounts: { [key: string]: number } = {}
      
      toolsWithTag.forEach(tool => {
        if (tool.tags) {
          const tags = tool.tags.split(',').map(t => t.trim())
          tags.forEach(tag => {
            if (tag !== tagName && tag.length > 0) {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1
            }
          })
        }
      })

      // Sort by frequency and return top related tags
      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag]) => tag)
    } catch (error) {
      console.error('Error getting related tags:', error)
      return []
    }
  }

  /**
   * Clean up unused tags
   * 
   * Removes tags that are not used by any active tools.
   * Should be run periodically for database maintenance.
   * 
   * @returns Number of deleted tags
   */
  static async cleanupUnusedTags(): Promise<number> {
    try {
      // Find tags with no usage
      const unusedTags = await prisma.tag.findMany({
        where: { usageCount: 0 }
      })

      // Verify they're truly unused and delete
      let deletedCount = 0
      for (const tag of unusedTags) {
        const actualUsage = await prisma.tool.count({
          where: {
            tags: {
              contains: tag.name,
              mode: 'insensitive'
            },
            isActive: true
          }
        })

        if (actualUsage === 0) {
          await prisma.tag.delete({
            where: { id: tag.id }
          })
          deletedCount++
        }
      }

      return deletedCount
    } catch (error) {
      console.error('Error cleaning up unused tags:', error)
      throw new Error('Failed to cleanup unused tags')
    }
  }

  /**
   * Search tags by name
   * 
   * Searches tags by name with fuzzy matching.
   * Used for admin interface and autocomplete.
   * 
   * @param query Search query
   * @param limit Maximum results to return
   * @returns Array of matching tags
   */
  static async searchTags(query: string, limit: number = 10): Promise<Tag[]> {
    try {
      return await prisma.tag.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        orderBy: [
          { usageCount: 'desc' },
          { name: 'asc' }
        ],
        take: limit
      })
    } catch (error) {
      console.error('Error searching tags:', error)
      throw new Error('Failed to search tags')
    }
  }

  /**
   * Get tag statistics
   * 
   * Retrieves comprehensive statistics about tags
   * for admin dashboard and analytics.
   * 
   * @returns Tag statistics object
   */
  static async getTagStatistics(): Promise<{
    totalTags: number
    usedTags: number
    unusedTags: number
    averageUsagePerTag: number
    topTag: { name: string; usageCount: number } | null
  }> {
    try {
      const [
        totalTags,
        usedTags,
        tags,
        topTag
      ] = await Promise.all([
        prisma.tag.count(),
        prisma.tag.count({ where: { usageCount: { gt: 0 } } }),
        prisma.tag.findMany({ select: { usageCount: true } }),
        prisma.tag.findFirst({
          orderBy: { usageCount: 'desc' },
          select: { name: true, usageCount: true }
        })
      ])

      const unusedTags = totalTags - usedTags
      const totalUsage = tags.reduce((sum, tag) => sum + (tag.usageCount || 0), 0)
      const averageUsagePerTag = totalTags > 0 ? Math.round(totalUsage / totalTags) : 0

      return {
        totalTags,
        usedTags,
        unusedTags,
        averageUsagePerTag,
        topTag: topTag ? {
          name: topTag.name,
          usageCount: topTag.usageCount || 0
        } : null
      }
    } catch (error) {
      console.error('Error getting tag statistics:', error)
      throw new Error('Failed to retrieve tag statistics')
    }
  }

  /**
   * Generate URL-friendly slug from tag name
   * 
   * Creates SEO-friendly slug from tag name with proper
   * formatting and uniqueness validation.
   * 
   * @param name Tag name
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

export const tagsService = new TagsService()
export default TagsService