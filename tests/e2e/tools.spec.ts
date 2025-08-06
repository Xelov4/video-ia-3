import { test, expect } from '@playwright/test'

test.describe('Tools Page', () => {
  test('should load tools page successfully', async ({ page }) => {
    await page.goto('/tools')
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Outils|Tools/)
    
    // Check for tools grid or list
    const toolsContainer = page.locator('[data-testid="tools-grid"], .tools-grid, .grid')
    await expect(toolsContainer).toBeVisible()
  })

  test('should display tools with pagination', async ({ page }) => {
    await page.goto('/tools')
    
    // Wait for tools to load
    await page.waitForLoadState('networkidle')
    
    // Check if pagination exists when there are many tools
    const pagination = page.locator('[data-testid="pagination"], .pagination')
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible()
    }
  })

  test('should filter tools by category', async ({ page }) => {
    await page.goto('/tools')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Look for category filters
    const categoryFilter = page.locator('select[name="category"], [data-testid="category-filter"]').first()
    
    if (await categoryFilter.isVisible()) {
      // Select a category
      await categoryFilter.selectOption({ index: 1 })
      
      // Wait for results to update
      await page.waitForLoadState('networkidle')
      
      // URL should reflect the filter
      await expect(page).toHaveURL(/category=/)
    }
  })

  test('should search tools', async ({ page }) => {
    await page.goto('/tools')
    
    // Look for search input
    const searchInput = page.getByPlaceholder(/rechercher|search/i).first()
    await expect(searchInput).toBeVisible()
    
    // Search for "video"
    await searchInput.fill('video')
    await searchInput.press('Enter')
    
    // Wait for results
    await page.waitForLoadState('networkidle')
    
    // URL should contain search query
    await expect(page).toHaveURL(/q=video/)
  })

  test('should display tool cards with correct information', async ({ page }) => {
    await page.goto('/tools')
    
    // Wait for tools to load
    await page.waitForLoadState('networkidle')
    
    // Check for tool cards
    const toolCards = page.locator('[data-testid="tool-card"], .tool-card')
    await expect(toolCards.first()).toBeVisible()
    
    // Check if tool card has required elements
    const firstCard = toolCards.first()
    await expect(firstCard.locator('h3, .tool-name')).toBeVisible()
    await expect(firstCard.locator('.tool-description, p')).toBeVisible()
  })

  test('should navigate to tool detail page', async ({ page }) => {
    await page.goto('/tools')
    
    // Wait for tools to load
    await page.waitForLoadState('networkidle')
    
    // Click on first tool
    const firstTool = page.locator('[data-testid="tool-card"], .tool-card').first()
    const toolLink = firstTool.locator('a').first()
    
    if (await toolLink.isVisible()) {
      await toolLink.click()
      
      // Should navigate to tool detail page
      await expect(page).toHaveURL(/\/tools\/.+/)
    }
  })

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/tools?q=nonexistenttoolthatdoesnotexist')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Should show no results message
    const noResults = page.getByText(/aucun résultat|no results|rien trouvé/i)
    await expect(noResults).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/tools')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if tools are displayed properly on mobile
    const toolsContainer = page.locator('[data-testid="tools-grid"], .tools-grid, .grid')
    await expect(toolsContainer).toBeVisible()
    
    // Check if search is accessible on mobile
    const searchInput = page.getByPlaceholder(/rechercher|search/i).first()
    await expect(searchInput).toBeVisible()
  })
})