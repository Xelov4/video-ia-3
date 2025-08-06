import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Video-IA/i)
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText(/découvrez les meilleurs outils ia/i)
  })

  test('should display search functionality', async ({ page }) => {
    await page.goto('/')
    
    // Check for search input
    const searchInput = page.getByPlaceholder(/rechercher un outil/i)
    await expect(searchInput).toBeVisible()
    
    // Check for search button
    const searchButton = page.getByRole('button', { name: /rechercher/i })
    await expect(searchButton).toBeVisible()
  })

  test('should search for tools', async ({ page }) => {
    await page.goto('/')
    
    // Fill search input
    const searchInput = page.getByPlaceholder(/rechercher un outil/i)
    await searchInput.fill('video')
    
    // Click search button
    const searchButton = page.getByRole('button', { name: /rechercher/i })
    await searchButton.click()
    
    // Should navigate to tools page with search query
    await expect(page).toHaveURL(/\/tools.*q=video/)
  })

  test('should display featured categories', async ({ page }) => {
    await page.goto('/')
    
    // Check for categories section
    await expect(page.getByText(/catégories populaires/i)).toBeVisible()
  })

  test('should navigate to tools page', async ({ page }) => {
    await page.goto('/')
    
    // Click on tools link in navigation
    await page.getByRole('link', { name: /outils/i }).click()
    
    // Should be on tools page
    await expect(page).toHaveURL(/\/tools/)
    await expect(page).toHaveTitle(/Outils|Tools/)
  })

  test('should navigate to categories page', async ({ page }) => {
    await page.goto('/')
    
    // Click on categories link in navigation
    await page.getByRole('link', { name: /catégories/i }).click()
    
    // Should be on categories page
    await expect(page).toHaveURL(/\/categories/)
    await expect(page).toHaveTitle(/Catégories|Categories/)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check if mobile menu button is visible
    const menuButton = page.getByRole('button').first()
    await expect(menuButton).toBeVisible()
    
    // Check if main content is still visible
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should have proper SEO elements', async ({ page }) => {
    await page.goto('/')
    
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
    
    // Check for favicon
    const favicon = page.locator('link[rel="icon"]')
    await expect(favicon).toHaveAttribute('href', /.+/)
  })
})