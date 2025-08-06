import { describe, it, expect, beforeAll } from '@jest/globals'
import { CategoriesService } from '../../src/lib/database'

describe('CategoriesService', () => {
  beforeAll(async () => {
    // Ensure database connection
    const { checkDatabaseConnection } = await import('../../src/lib/database')
    const status = await checkDatabaseConnection()
    if (!status.connected) {
      throw new Error('Database not connected')
    }
  })

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const categories = await CategoriesService.getAllCategories()
      
      expect(Array.isArray(categories)).toBe(true)
      expect(categories.length).toBeGreaterThan(0)
      
      categories.forEach(category => {
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('slug')
        expect(category).toHaveProperty('description')
        expect(category).toHaveProperty('tool_count')
        expect(category).toHaveProperty('is_featured')
        expect(category).toHaveProperty('created_at')
        
        expect(typeof category.id).toBe('number')
        expect(typeof category.name).toBe('string')
        expect(typeof category.slug).toBe('string')
        expect(typeof category.tool_count).toBe('number')
        expect(typeof category.is_featured).toBe('boolean')
        expect(category.created_at).toBeInstanceOf(Date)
      })
    })

    it('should return categories sorted by tool count descending', async () => {
      const categories = await CategoriesService.getAllCategories()
      
      if (categories.length > 1) {
        for (let i = 0; i < categories.length - 1; i++) {
          expect(categories[i].tool_count).toBeGreaterThanOrEqual(
            categories[i + 1].tool_count
          )
        }
      }
    })
  })

  describe('getFeaturedCategories', () => {
    it('should return only featured categories', async () => {
      const featuredCategories = await CategoriesService.getFeaturedCategories()
      
      expect(Array.isArray(featuredCategories)).toBe(true)
      
      featuredCategories.forEach(category => {
        expect(category.is_featured).toBe(true)
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('slug')
      })
    })

    it('should respect the limit parameter', async () => {
      const limit = 3
      const featuredCategories = await CategoriesService.getFeaturedCategories(limit)
      
      expect(featuredCategories.length).toBeLessThanOrEqual(limit)
    })
  })

  describe('getCategoryBySlug', () => {
    it('should return category by slug', async () => {
      // First get a category to test with
      const allCategories = await CategoriesService.getAllCategories()
      
      if (allCategories.length > 0) {
        const testCategory = allCategories[0]
        const foundCategory = await CategoriesService.getCategoryBySlug(testCategory.slug)
        
        expect(foundCategory).not.toBeNull()
        expect(foundCategory?.id).toBe(testCategory.id)
        expect(foundCategory?.slug).toBe(testCategory.slug)
        expect(foundCategory?.name).toBe(testCategory.name)
      }
    })

    it('should return null for non-existent slug', async () => {
      const nonExistentCategory = await CategoriesService.getCategoryBySlug('non-existent-slug-123')
      
      expect(nonExistentCategory).toBeNull()
    })

    it('should handle empty slug gracefully', async () => {
      const emptySlugResult = await CategoriesService.getCategoryBySlug('')
      
      expect(emptySlugResult).toBeNull()
    })
  })

  describe('Category data integrity', () => {
    it('should have valid slugs for all categories', async () => {
      const categories = await CategoriesService.getAllCategories()
      
      categories.forEach(category => {
        expect(category.slug).toBeTruthy()
        expect(category.slug.length).toBeGreaterThan(0)
        expect(category.slug).toMatch(/^[a-z0-9-]+$/) // slug format validation
      })
    })

    it('should have non-negative tool counts', async () => {
      const categories = await CategoriesService.getAllCategories()
      
      categories.forEach(category => {
        expect(category.tool_count).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have unique slugs', async () => {
      const categories = await CategoriesService.getAllCategories()
      const slugs = categories.map(cat => cat.slug)
      const uniqueSlugs = [...new Set(slugs)]
      
      expect(slugs.length).toBe(uniqueSlugs.length)
    })
  })
})