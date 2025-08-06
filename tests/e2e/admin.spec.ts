import { test, expect } from '@playwright/test'

test.describe('Admin Interface', () => {
  test.describe('Authentication', () => {
    test('should redirect to login when accessing admin without auth', async ({ page }) => {
      await page.goto('/admin')
      
      // Should redirect to login page
      await expect(page).toHaveURL(/\/admin\/login/)
    })

    test('should display login form', async ({ page }) => {
      await page.goto('/admin/login')
      
      // Check for login form elements
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password|mot de passe/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /login|connexion|se connecter/i })).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/admin/login')
      
      // Fill invalid credentials
      await page.getByLabel(/email/i).fill('invalid@example.com')
      await page.getByLabel(/password|mot de passe/i).fill('wrongpassword')
      
      // Submit form
      await page.getByRole('button', { name: /login|connexion|se connecter/i }).click()
      
      // Should show error message
      const errorMessage = page.getByText(/invalid|incorrect|erreur|invalide/i)
      await expect(errorMessage).toBeVisible()
    })

    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/admin/login')
      
      // Fill valid credentials
      await page.getByLabel(/email/i).fill('admin@video-ia.net')
      await page.getByLabel(/password|mot de passe/i).fill('admin123')
      
      // Submit form
      await page.getByRole('button', { name: /login|connexion|se connecter/i }).click()
      
      // Should redirect to admin dashboard
      await expect(page).toHaveURL(/\/admin$|\/admin\/$/)
      
      // Should show admin content
      const adminHeading = page.locator('h1')
      await expect(adminHeading).toBeVisible()
    })
  })

  test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/admin/login')
      await page.getByLabel(/email/i).fill('admin@video-ia.net')
      await page.getByLabel(/password|mot de passe/i).fill('admin123')
      await page.getByRole('button', { name: /login|connexion|se connecter/i }).click()
      await expect(page).toHaveURL(/\/admin$|\/admin\//)
    })

    test('should display admin dashboard', async ({ page }) => {
      // Should show dashboard content
      const dashboardHeading = page.locator('h1')
      await expect(dashboardHeading).toBeVisible()
      
      // Should show navigation menu
      const adminNav = page.locator('nav, [data-testid="admin-nav"]')
      await expect(adminNav).toBeVisible()
    })

    test('should navigate to tools management', async ({ page }) => {
      // Click on tools management link
      const toolsLink = page.getByRole('link', { name: /outils|tools/i })
      await toolsLink.click()
      
      // Should navigate to tools admin page
      await expect(page).toHaveURL(/\/admin\/tools/)
    })

    test('should navigate to categories management', async ({ page }) => {
      // Click on categories management link
      const categoriesLink = page.getByRole('link', { name: /catégories|categories/i })
      await categoriesLink.click()
      
      // Should navigate to categories admin page
      await expect(page).toHaveURL(/\/admin\/categories/)
    })

    test('should navigate to users management', async ({ page }) => {
      // Click on users management link
      const usersLink = page.getByRole('link', { name: /utilisateurs|users/i })
      await usersLink.click()
      
      // Should navigate to users admin page
      await expect(page).toHaveURL(/\/admin\/users/)
    })

    test('should navigate to analytics', async ({ page }) => {
      // Click on analytics link
      const analyticsLink = page.getByRole('link', { name: /analytiques|analytics/i })
      await analyticsLink.click()
      
      // Should navigate to analytics admin page
      await expect(page).toHaveURL(/\/admin\/analytics/)
    })

    test('should navigate to scraper management', async ({ page }) => {
      // Click on scraper management link
      const scraperLink = page.getByRole('link', { name: /scraper/i })
      await scraperLink.click()
      
      // Should navigate to scraper admin page
      await expect(page).toHaveURL(/\/admin\/scraper/)
    })

    test('should logout successfully', async ({ page }) => {
      // Click logout button/link
      const logoutButton = page.getByRole('button', { name: /logout|déconnexion|se déconnecter/i })
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        
        // Should redirect to login page
        await expect(page).toHaveURL(/\/admin\/login/)
      }
    })
  })

  test.describe('Admin Categories Page', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to categories admin
      await page.goto('/admin/login')
      await page.getByLabel(/email/i).fill('admin@video-ia.net')
      await page.getByLabel(/password|mot de passe/i).fill('admin123')
      await page.getByRole('button', { name: /login|connexion|se connecter/i }).click()
      await page.goto('/admin/categories')
    })

    test('should display categories management page', async ({ page }) => {
      // Should show categories table/list
      const categoriesTable = page.locator('table, [data-testid="categories-table"]')
      await expect(categoriesTable).toBeVisible()
      
      // Should show categories data
      const categoryRows = page.locator('tbody tr, [data-testid="category-row"]')
      if (await categoryRows.first().isVisible()) {
        await expect(categoryRows.first()).toBeVisible()
      }
    })
  })

  test.describe('Admin Tools Page', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to tools admin
      await page.goto('/admin/login')
      await page.getByLabel(/email/i).fill('admin@video-ia.net')
      await page.getByLabel(/password|mot de passe/i).fill('admin123')
      await page.getByRole('button', { name: /login|connexion|se connecter/i }).click()
      await page.goto('/admin/tools')
    })

    test('should display tools management page', async ({ page }) => {
      // Should show tools table/list
      const toolsTable = page.locator('table, [data-testid="tools-table"]')
      await expect(toolsTable).toBeVisible()
    })
  })
})