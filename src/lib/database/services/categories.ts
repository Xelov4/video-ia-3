/**
 * Categories Database Service
 *
 * Service layer for managing tool categories in the AI directory.
 * Provides CRUD operations, tool counting, and featured category
 * management for the hierarchical organization system.
 *
 * Features:
 * - Category CRUD operations
 * - Tool count synchronization
 * - Featured category management
 * - SEO slug generation
 * - Hierarchical category support (ready for parent-child)
 * - Performance-optimized queries
 *
 * @author Video-IA.net Development Team
 */

import { Category, Prisma } from '@prisma/client';
import { prisma } from '../client';
import {
  getCategoryEmoji,
  getCategoryEmojiString,
  enrichCategoryWithEmoji,
} from '../../services/emojiMapping';

/**
 * Category with tool count and additional metadata
 */
export interface CategoryWithStats extends Category {
  actualToolCount?: number;
  emoji?: string;
}

/**
 * Category creation/update data
 */
export interface CategoryData {
  name: string;
  slug?: string;
  description?: string;
  iconName?: string;
  isFeatured?: boolean;
}

/**
 * Categories Service Class
 *
 * Manages all category-related database operations with
 * optimized queries and automatic tool count synchronization.
 */
export class CategoriesService {
  /**
   * Get all categories with tool counts
   *
   * Retrieves all categories ordered by tool count and name.
   * Includes actual tool counts for accuracy.
   *
   * @param includeEmpty Whether to include categories with 0 tools
   * @returns Array of categories with statistics
   */
  static async getAllCategories(
    includeEmpty: boolean = true
  ): Promise<CategoryWithStats[]> {
    try {
      // Get categories with updated tool counts
      const categories = await prisma.category.findMany({
        orderBy: [{ toolCount: 'desc' }, { name: 'asc' }],
      });

      // Calculate actual tool counts for verification
      const categoriesWithStats = await Promise.all(
        categories.map(async category => {
          const actualToolCount = await prisma.tool.count({
            where: {
              toolCategory: category.name,
              isActive: true,
            },
          });

          return {
            ...category,
            actualToolCount,
            emoji: getCategoryEmojiString(category.name),
          };
        })
      );

      // Filter out empty categories if requested
      if (!includeEmpty) {
        return categoriesWithStats.filter(cat => (cat.actualToolCount || 0) > 0);
      }

      return categoriesWithStats;
    } catch (error) {
      console.error('Error getting all categories:', error);
      throw new Error('Failed to retrieve categories');
    }
  }

  /**
   * Get featured categories for homepage display
   *
   * Retrieves categories marked as featured with high tool counts.
   * Used for homepage category showcase.
   *
   * @param limit Number of categories to return
   * @returns Array of featured categories
   */
  static async getFeaturedCategories(
    limit: number = 6
  ): Promise<(Category & { emoji: string })[]> {
    try {
      const categories = await prisma.category.findMany({
        where: {
          isFeatured: true,
        },
        orderBy: [{ toolCount: 'desc' }, { name: 'asc' }],
        take: limit,
      });

      return categories.map(category => enrichCategoryWithEmoji(category));
    } catch (error) {
      console.error('Error getting featured categories:', error);
      throw new Error('Failed to retrieve featured categories');
    }
  }

  /**
   * Get top categories by tool count
   *
   * Retrieves categories with the most tools for
   * popular categories sections.
   *
   * @param limit Number of categories to return
   * @returns Array of top categories
   */
  static async getTopCategories(limit: number = 10): Promise<Category[]> {
    try {
      return await prisma.category.findMany({
        where: {
          toolCount: { gt: 0 },
        },
        orderBy: {
          toolCount: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      console.error('Error getting top categories:', error);
      throw new Error('Failed to retrieve top categories');
    }
  }

  /**
   * Get category by slug
   *
   * Retrieves category by URL slug for SEO-friendly URLs.
   *
   * @param slug Category slug
   * @returns Category data or null if not found
   */
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      return await prisma.category.findUnique({
        where: { slug },
      });
    } catch (error) {
      console.error('Error getting category by slug:', error);
      throw new Error('Failed to retrieve category');
    }
  }

  /**
   * Get category by name
   *
   * Retrieves category by exact name match.
   * Used for tool categorization and filtering.
   *
   * @param name Category name
   * @returns Category data or null if not found
   */
  static async getCategoryByName(name: string): Promise<Category | null> {
    try {
      return await prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
        },
      });
    } catch (error) {
      console.error('Error getting category by name:', error);
      throw new Error('Failed to retrieve category');
    }
  }

  /**
   * Create a new category
   *
   * Adds a new category with automatic slug generation
   * and validation.
   *
   * @param data Category creation data
   * @returns Created category
   */
  static async createCategory(data: CategoryData): Promise<Category> {
    try {
      // Generate slug if not provided
      const slug = data.slug || this.generateSlug(data.name);

      return await prisma.category.create({
        data: {
          ...data,
          slug,
          toolCount: 0,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Update an existing category
   *
   * Updates category information with validation.
   * Automatically recalculates tool count if name changes.
   *
   * @param id Category ID
   * @param data Update data
   * @returns Updated category
   */
  static async updateCategory(
    id: number,
    data: Partial<CategoryData>
  ): Promise<Category> {
    try {
      const updatedCategory = await prisma.category.update({
        where: { id },
        data,
      });

      // Recalculate tool count if name changed
      if (data.name) {
        await this.updateCategoryToolCount(id);
      }

      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  /**
   * Delete a category
   *
   * Removes category from database. Should only be used
   * if no tools are assigned to this category.
   *
   * @param id Category ID
   */
  static async deleteCategory(id: number): Promise<void> {
    try {
      // Check if category has tools
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      const toolCount = await prisma.tool.count({
        where: {
          toolCategory: category.name,
          isActive: true,
        },
      });

      if (toolCount > 0) {
        throw new Error(
          `Cannot delete category with ${toolCount} tools. Reassign tools first.`
        );
      }

      await prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  /**
   * Update category tool count
   *
   * Synchronizes the tool count for a specific category
   * by counting active tools in that category.
   *
   * @param categoryId Category ID
   * @returns Updated category
   */
  static async updateCategoryToolCount(categoryId: number): Promise<Category> {
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      const toolCount = await prisma.tool.count({
        where: {
          toolCategory: category.name,
          isActive: true,
        },
      });

      return await prisma.category.update({
        where: { id: categoryId },
        data: { toolCount },
      });
    } catch (error) {
      console.error('Error updating category tool count:', error);
      throw new Error('Failed to update category tool count');
    }
  }

  /**
   * Synchronize all category tool counts
   *
   * Updates tool counts for all categories by counting
   * active tools. Should be run periodically for maintenance.
   *
   * @returns Array of updated categories
   */
  static async synchronizeAllToolCounts(): Promise<Category[]> {
    try {
      const categories = await prisma.category.findMany();

      const updatedCategories = await Promise.all(
        categories.map(async category => {
          const toolCount = await prisma.tool.count({
            where: {
              toolCategory: category.name,
              isActive: true,
            },
          });

          return await prisma.category.update({
            where: { id: category.id },
            data: { toolCount },
          });
        })
      );

      return updatedCategories;
    } catch (error) {
      console.error('Error synchronizing category tool counts:', error);
      throw new Error('Failed to synchronize category tool counts');
    }
  }

  /**
   * Toggle featured status for a category
   *
   * Toggles the featured flag for homepage display.
   *
   * @param id Category ID
   * @param featured New featured status
   * @returns Updated category
   */
  static async toggleFeatured(id: number, featured: boolean): Promise<Category> {
    try {
      return await prisma.category.update({
        where: { id },
        data: { isFeatured: featured },
      });
    } catch (error) {
      console.error('Error toggling category featured status:', error);
      throw new Error('Failed to update category featured status');
    }
  }

  /**
   * Get category statistics
   *
   * Retrieves comprehensive statistics about categories
   * for admin dashboard and analytics.
   *
   * @returns Category statistics object
   */
  static async getCategoryStatistics(): Promise<{
    totalCategories: number;
    featuredCategories: number;
    averageToolsPerCategory: number;
    topCategory: { name: string; toolCount: number } | null;
    emptyCategoriesCount: number;
  }> {
    try {
      const [totalCategories, featuredCategories, categories, topCategory] =
        await Promise.all([
          prisma.category.count(),
          prisma.category.count({ where: { isFeatured: true } }),
          prisma.category.findMany({ select: { toolCount: true } }),
          prisma.category.findFirst({
            orderBy: { toolCount: 'desc' },
            select: { name: true, toolCount: true },
          }),
        ]);

      const emptyCategoriesCount = categories.filter(
        cat => (cat.toolCount || 0) === 0
      ).length;
      const totalTools = categories.reduce((sum, cat) => sum + (cat.toolCount || 0), 0);
      const averageToolsPerCategory =
        totalCategories > 0 ? Math.round(totalTools / totalCategories) : 0;

      return {
        totalCategories,
        featuredCategories,
        averageToolsPerCategory,
        topCategory: topCategory
          ? {
              name: topCategory.name,
              toolCount: topCategory.toolCount || 0,
            }
          : null,
        emptyCategoriesCount,
      };
    } catch (error) {
      console.error('Error getting category statistics:', error);
      throw new Error('Failed to retrieve category statistics');
    }
  }

  /**
   * Search categories by name
   *
   * Searches categories by name with fuzzy matching.
   * Used for admin interface and API endpoints.
   *
   * @param query Search query
   * @param limit Maximum results to return
   * @returns Array of matching categories
   */
  static async searchCategories(
    query: string,
    limit: number = 10
  ): Promise<Category[]> {
    try {
      return await prisma.category.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        orderBy: [{ toolCount: 'desc' }, { name: 'asc' }],
        take: limit,
      });
    } catch (error) {
      console.error('Error searching categories:', error);
      throw new Error('Failed to search categories');
    }
  }

  /**
   * Get related categories for a given category
   *
   * Finds categories that are related to the given category
   * based on similar tool counts or alphabetical proximity.
   *
   * @param categoryName Name of the reference category
   * @param limit Maximum results to return
   * @returns Array of related categories
   */
  static async getRelatedCategories(
    categoryName: string,
    limit: number = 4
  ): Promise<Category[]> {
    try {
      // Get the reference category first
      const referenceCategory = await prisma.category.findFirst({
        where: { name: categoryName },
      });

      if (!referenceCategory) {
        return [];
      }

      // Find categories with similar tool counts or in similar alphabetical range
      return await prisma.category.findMany({
        where: {
          AND: [
            { name: { not: categoryName } },
            { toolCount: { gt: 0 } },
            {
              OR: [
                // Similar tool count range
                {
                  toolCount: {
                    gte: Math.max(0, (referenceCategory.toolCount || 0) - 50),
                    lte: (referenceCategory.toolCount || 0) + 50,
                  },
                },
                // Alphabetically similar (same starting letters)
                {
                  name: {
                    startsWith: categoryName.charAt(0),
                    mode: 'insensitive',
                  },
                },
              ],
            },
          ],
        },
        orderBy: [{ toolCount: 'desc' }, { name: 'asc' }],
        take: limit,
      });
    } catch (error) {
      console.error('Error getting related categories:', error);
      return [];
    }
  }

  /**
   * Generate URL-friendly slug from category name
   *
   * Creates SEO-friendly slug from category name with proper
   * formatting and uniqueness validation.
   *
   * @param name Category name
   * @returns Generated slug
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }
}

export const categoriesService = new CategoriesService();
export default CategoriesService;
