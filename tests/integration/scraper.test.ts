import { describe, it, expect, jest } from '@jest/globals'

// Mock external dependencies
jest.mock('puppeteer', () => ({
  launch: jest.fn(() => Promise.resolve({
    newPage: jest.fn(() => Promise.resolve({
      goto: jest.fn(() => Promise.resolve()),
      content: jest.fn(() => Promise.resolve('<html><head><title>Test</title></head><body><h1>Test Site</h1></body></html>')),
      screenshot: jest.fn(() => Promise.resolve(Buffer.from('fake-screenshot'))),
      close: jest.fn(() => Promise.resolve()),
    })),
    close: jest.fn(() => Promise.resolve()),
  })),
}))

jest.mock('@google/genai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(() => Promise.resolve({
        response: {
          text: jest.fn(() => JSON.stringify({
            toolName: "Test Tool",
            toolDescription: "A test tool for testing purposes",
            toolCategory: "testing",
            pricingModel: "Free",
            keyFeatures: ["Feature 1", "Feature 2"],
            targetAudience: "Developers"
          }))
        }
      }))
    }))
  }))
}))

describe('Scraper Integration', () => {
  describe('scrapeWebsite function', () => {
    it('should scrape a website and return structured data', async () => {
      const { scrapeWebsite } = await import('../../src/lib/scraper/core')
      
      const result = await scrapeWebsite('https://example.com')
      
      expect(result).toHaveProperty('success', true)
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('toolName')
      expect(result.data).toHaveProperty('toolDescription')
      expect(result.data).toHaveProperty('toolCategory')
      expect(result.data).toHaveProperty('toolLink', 'https://example.com')
    }, 30000)

    it('should handle invalid URLs gracefully', async () => {
      const { scrapeWebsite } = await import('../../src/lib/scraper/core')
      
      const result = await scrapeWebsite('not-a-valid-url')
      
      expect(result).toHaveProperty('success', false)
      expect(result).toHaveProperty('error')
    })

    it('should handle network errors gracefully', async () => {
      const { scrapeWebsite } = await import('../../src/lib/scraper/core')
      
      // Mock puppeteer to throw an error
      const puppeteer = require('puppeteer')
      puppeteer.launch.mockImplementationOnce(() => {
        throw new Error('Network error')
      })
      
      const result = await scrapeWebsite('https://example.com')
      
      expect(result).toHaveProperty('success', false)
      expect(result).toHaveProperty('error')
      expect(result.error).toContain('Network error')
    })

    it('should extract screenshots when requested', async () => {
      const { scrapeWebsite } = await import('../../src/lib/scraper/core')
      
      const result = await scrapeWebsite('https://example.com', { 
        includeScreenshot: true 
      })
      
      if (result.success && result.data.screenshot) {
        expect(result.data.screenshot).toBeTruthy()
        expect(typeof result.data.screenshot).toBe('string')
      }
    }, 30000)
  })

  describe('AI Analysis Integration', () => {
    it('should analyze content with AI and return structured data', async () => {
      const mockHtml = `
        <html>
          <head><title>Amazing Video Editor</title></head>
          <body>
            <h1>Amazing Video Editor</h1>
            <p>The best video editing tool for professionals</p>
            <div>Features: Cut, Trim, Effects</div>
          </body>
        </html>
      `
      
      const { analyzeWithAI } = await import('../../src/lib/scraper/core')
      
      const result = await analyzeWithAI(mockHtml, 'https://example.com')
      
      expect(result).toHaveProperty('toolName')
      expect(result).toHaveProperty('toolDescription')
      expect(result).toHaveProperty('toolCategory')
      expect(result).toHaveProperty('toolLink', 'https://example.com')
      
      expect(typeof result.toolName).toBe('string')
      expect(result.toolName.length).toBeGreaterThan(0)
    })

    it('should handle AI analysis errors gracefully', async () => {
      // Mock AI to throw an error
      const mockGenAI = require('@google/genai').GoogleGenerativeAI
      mockGenAI.mockImplementationOnce(() => ({
        getGenerativeModel: () => ({
          generateContent: () => Promise.reject(new Error('AI service unavailable'))
        })
      }))
      
      const { analyzeWithAI } = await import('../../src/lib/scraper/core')
      
      try {
        await analyzeWithAI('<html><body>Test</body></html>', 'https://example.com')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('AI service unavailable')
      }
    })
  })

  describe('Data Validation', () => {
    it('should validate scraped data structure', async () => {
      const { validateScrapedData } = await import('../../src/lib/scraper/core')
      
      const validData = {
        toolName: 'Test Tool',
        toolDescription: 'A test tool',
        toolCategory: 'testing',
        toolLink: 'https://example.com',
        pricingModel: 'Free',
        keyFeatures: ['Feature 1'],
        targetAudience: 'Developers'
      }
      
      const isValid = validateScrapedData(validData)
      expect(isValid).toBe(true)
    })

    it('should reject invalid data structure', async () => {
      const { validateScrapedData } = await import('../../src/lib/scraper/core')
      
      const invalidData = {
        toolName: '', // Empty name should be invalid
        toolDescription: 'A test tool',
        toolCategory: 'testing'
        // Missing required fields
      }
      
      const isValid = validateScrapedData(invalidData)
      expect(isValid).toBe(false)
    })
  })
})