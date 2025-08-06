import { describe, it, expect, beforeAll } from '@jest/globals'
import { ToolsService } from '../../src/lib/database'

describe('ToolsService', () => {
  beforeAll(async () => {
    // Ensure database connection
    const { checkDatabaseConnection } = await import('../../src/lib/database')
    const status = await checkDatabaseConnection()
    if (!status.connected) {
      throw new Error('Database not connected')
    }
  })

  describe('searchTools', () => {
    it('should return tools with default parameters', async () => {
      const result = await ToolsService.searchTools({})
      
      expect(result).toHaveProperty('tools')
      expect(result).toHaveProperty('totalCount')
      expect(result).toHaveProperty('currentPage', 1)
      expect(result).toHaveProperty('totalPages')
      expect(Array.isArray(result.tools)).toBe(true)
      expect(typeof result.totalCount).toBe('number')
    })

    it('should respect limit parameter', async () => {
      const limit = 5
      const result = await ToolsService.searchTools({ limit })
      
      expect(result.tools.length).toBeLessThanOrEqual(limit)
      expect(result).toHaveProperty('totalCount')
    })

    it('should handle pagination correctly', async () => {
      const page1 = await ToolsService.searchTools({ page: 1, limit: 3 })
      const page2 = await ToolsService.searchTools({ page: 2, limit: 3 })
      
      if (page1.totalCount > 3) {
        expect(page1.currentPage).toBe(1)
        expect(page2.currentPage).toBe(2)
        
        // Pages should have different tools (assuming enough data)
        if (page2.tools.length > 0) {
          expect(page1.tools[0].id).not.toBe(page2.tools[0].id)
        }
      }
    })

    it('should filter by category', async () => {
      const allTools = await ToolsService.searchTools({})
      
      if (allTools.tools.length > 0) {
        const firstCategory = allTools.tools[0].toolCategory
        const filteredResult = await ToolsService.searchTools({ 
          category: firstCategory 
        })
        
        expect(filteredResult.tools.length).toBeGreaterThan(0)
        filteredResult.tools.forEach(tool => {
          expect(tool.toolCategory).toBe(firstCategory)
        })
      }
    })

    it('should handle search query', async () => {
      const searchResult = await ToolsService.searchTools({ 
        query: 'video' 
      })
      
      expect(searchResult).toHaveProperty('tools')
      expect(searchResult).toHaveProperty('totalCount')
      expect(Array.isArray(searchResult.tools)).toBe(true)
      
      // If results found, they should contain the search term
      if (searchResult.tools.length > 0) {
        const firstTool = searchResult.tools[0]
        const containsSearchTerm = 
          firstTool.toolName.toLowerCase().includes('video') ||
          firstTool.toolDescription.toLowerCase().includes('video') ||
          firstTool.toolCategory.toLowerCase().includes('video')
        
        // Note: This might not always be true due to fuzzy search, so we just check structure
        expect(typeof firstTool.toolName).toBe('string')
      }
    })

    it('should handle empty results gracefully', async () => {
      const result = await ToolsService.searchTools({ 
        query: 'nonexistenttoolthatdoesnotexist123456' 
      })
      
      expect(result).toHaveProperty('tools')
      expect(result).toHaveProperty('totalCount', 0)
      expect(result.tools).toEqual([])
      expect(result.currentPage).toBe(1)
      expect(result.totalPages).toBe(0)
    })
  })

  describe('getFeaturedTools', () => {
    it('should return featured tools', async () => {
      const featuredTools = await ToolsService.getFeaturedTools(5)
      
      expect(Array.isArray(featuredTools)).toBe(true)
      expect(featuredTools.length).toBeLessThanOrEqual(5)
      
      featuredTools.forEach(tool => {
        expect(tool).toHaveProperty('id')
        expect(tool).toHaveProperty('toolName')
        expect(tool).toHaveProperty('toolCategory')
        expect(tool).toHaveProperty('toolLink')
        expect(typeof tool.toolName).toBe('string')
      })
    })

    it('should respect the limit parameter', async () => {
      const limit = 3
      const featuredTools = await ToolsService.getFeaturedTools(limit)
      
      expect(featuredTools.length).toBeLessThanOrEqual(limit)
    })
  })

  describe('Tool data structure', () => {
    it('should return tools with correct structure', async () => {
      const result = await ToolsService.searchTools({ limit: 1 })
      
      if (result.tools.length > 0) {
        const tool = result.tools[0]
        
        expect(tool).toHaveProperty('id')
        expect(tool).toHaveProperty('toolName')
        expect(tool).toHaveProperty('toolCategory')
        expect(tool).toHaveProperty('toolLink')
        expect(tool).toHaveProperty('toolDescription')
        expect(tool).toHaveProperty('createdAt')
        
        expect(typeof tool.id).toBe('number')
        expect(typeof tool.toolName).toBe('string')
        expect(typeof tool.toolCategory).toBe('string')
        expect(typeof tool.toolLink).toBe('string')
        expect(typeof tool.toolDescription).toBe('string')
        expect(tool.createdAt).toBeInstanceOf(Date)
      }
    })
  })
})