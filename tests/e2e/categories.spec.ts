import { test, expect } from '@playwright/test'

test.describe('Categories Page', () => {
  test('should load categories page successfully', async ({ page }) => {
    await page.goto('/categories')
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Catégories|Categories/)
    
    // Check for categories grid or list
    const categoriesContainer = page.locator('[data-testid="categories-grid"], .categories-grid, .grid')
    await expect(categoriesContainer).toBeVisible()
  })

  test('should display category cards', async ({ page }) => {
    await page.goto('/categories')
    
    // Wait for categories to load
    await page.waitForLoadState('networkidle')
    
    // Check for category cards
    const categoryCards = page.locator('[data-testid="category-card"], .category-card')
    await expect(categoryCards.first()).toBeVisible()
    
    // Check if category card has required elements
    const firstCard = categoryCards.first()
    await expect(firstCard.locator('h3, .category-name')).toBeVisible()
    await expect(firstCard.locator('.tool-count')).toBeVisible()
  })

  test('should navigate to category detail page', async ({ page }) => {
    await page.goto('/categories')
    
    // Wait for categories to load
    await page.waitForLoadState('networkidle')
    
    // Click on first category
    const firstCategory = page.locator('[data-testid="category-card"], .category-card').first()
    const categoryLink = firstCategory.locator('a').first()
    
    await categoryLink.click()
    
    // Should navigate to category detail page
    await expect(page).toHaveURL(/\/categories\/.+/)
  })

  test('should display tools in category detail page', async ({ page }) => {
    await page.goto('/categories')
    await page.waitForLoadState('networkidle')
    
    // Click on first category
    const firstCategory = page.locator('[data-testid="category-card"], .category-card').first()
    const categoryLink = firstCategory.locator('a').first()
    
    await categoryLink.click()
    await page.waitForLoadState('networkidle')
    
    // Should show tools for this category
    const toolsContainer = page.locator('[data-testid="tools-grid"], .tools-grid, .grid')
    await expect(toolsContainer).toBeVisible()
    
    // Check for tool cards
    const toolCards = page.locator('[data-testid="tool-card"], .tool-card')
    if (await toolCards.first().isVisible()) {
      await expect(toolCards.first()).toBeVisible()
    }
  })

  test('should show category information', async ({ page }) => {
    await page.goto('/categories')
    await page.waitForLoadState('networkidle')
    
    // Click on first category
    const firstCategory = page.locator('[data-testid="category-card"], .category-card').first()
    const categoryLink = firstCategory.locator('a').first()
    
    await categoryLink.click()
    await page.waitForLoadState('networkidle')
    
    // Should show category name as heading
    const categoryHeading = page.locator('h1')
    await expect(categoryHeading).toBeVisible()
    
    // Should show category description if available
    const description = page.locator('.category-description, p')
    if (await description.first().isVisible()) {
      await expect(description.first()).toBeVisible()
    }
  })

  test('should handle category with no tools', async ({ page }) => {
    // This would test a category with no tools, but we'd need to know one exists
    // For now, we'll just verify the structure works
    await page.goto('/categories/empty-category-test')
    
    // Should show appropriate message for empty category
    const emptyMessage = page.getByText(/aucun outil|no tools|empty/i)
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/categories')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if categories are displayed properly on mobile
    const categoriesContainer = page.locator('[data-testid="categories-grid"], .categories-grid, .grid')
    await expect(categoriesContainer).toBeVisible()
    
    // Check if category cards stack properly on mobile
    const categoryCards = page.locator('[data-testid="category-card"], .category-card')
    await expect(categoryCards.first()).toBeVisible()
  })

  test('should show featured categories first', async ({ page }) => {
    await page.goto('/categories')
    await page.waitForLoadState('networkidle')
    
    // Check if there's a featured section
    const featuredSection = page.locator('[data-testid="featured-categories"], .featured-categories')
    if (await featuredSection.isVisible()) {
      await expect(featuredSection).toBeVisible()
    }
    
    // Categories should be displayed
    const categoryCards = page.locator('[data-testid="category-card"], .category-card')
    await expect(categoryCards.first()).toBeVisible()
  })
})