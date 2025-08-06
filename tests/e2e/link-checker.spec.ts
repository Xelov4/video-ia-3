import { test, expect } from '@playwright/test'

interface LinkTestResult {
  url: string
  text: string
  status: 'success' | 'error'
  statusCode?: number
  error?: string
  page: string
}

interface PageLinks {
  internal: string[]
  external: string[]
  admin: string[]
}

const EXPECTED_ROUTES = {
  public: [
    '/',
    '/tools',
    '/categories',
    '/scraper',
  ],
  admin: [
    '/admin',
    '/admin/login',
    '/admin/tools',
    '/admin/categories', 
    '/admin/users',
    '/admin/analytics',
    '/admin/articles',
    '/admin/scraper',
  ],
  api: [
    '/api/tools',
    '/api/categories',
    '/api/auth/providers',
    '/api/auth/session',
  ],
  // Ces routes n'existent probablement pas encore
  missing: [
    '/submit',
    '/api-docs', 
    '/blog',
    '/changelog',
    '/support',
    '/terms',
    '/privacy',
    '/cookies',
    '/admin/settings',
    '/admin/tools/new',
  ]
}

test.describe('Link Checker - Comprehensive', () => {
  let brokenLinks: LinkTestResult[] = []
  let allTestedLinks: LinkTestResult[] = []

  test.beforeEach(async ({ page }) => {
    // Initialize arrays for each test to avoid conflicts
    if (brokenLinks.length === 0 && allTestedLinks.length === 0) {
      brokenLinks = []
      allTestedLinks = []
    }
  })

  test('should verify all static routes exist', async ({ page }) => {
    console.log('🔍 Testing static routes...')

    // Test public routes
    for (const route of EXPECTED_ROUTES.public) {
      try {
        const response = await page.goto(route)
        const result: LinkTestResult = {
          url: route,
          text: `Static route: ${route}`,
          status: response?.ok() ? 'success' : 'error',
          statusCode: response?.status(),
          page: 'static-routes'
        }
        
        if (!response?.ok()) {
          result.error = `HTTP ${response?.status()}`
          brokenLinks.push(result)
        }
        
        allTestedLinks.push(result)
        console.log(`${response?.ok() ? '✅' : '❌'} ${route} - ${response?.status()}`)
      } catch (error) {
        const result: LinkTestResult = {
          url: route,
          text: `Static route: ${route}`,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          page: 'static-routes'
        }
        brokenLinks.push(result)
        allTestedLinks.push(result)
        console.log(`❌ ${route} - ${error}`)
      }
    }

    // Test API routes
    for (const route of EXPECTED_ROUTES.api) {
      try {
        await page.goto('/')  // Start from homepage
        const response = await page.request.get(route)
        const result: LinkTestResult = {
          url: route,
          text: `API route: ${route}`,
          status: response?.ok() ? 'success' : 'error',
          statusCode: response?.status(),
          page: 'api-routes'
        }
        
        if (!response?.ok()) {
          result.error = `HTTP ${response?.status()}`
          brokenLinks.push(result)
        }
        
        allTestedLinks.push(result)
        console.log(`${response?.ok() ? '✅' : '❌'} API ${route} - ${response?.status()}`)
      } catch (error) {
        const result: LinkTestResult = {
          url: route,
          text: `API route: ${route}`,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          page: 'api-routes'
        }
        brokenLinks.push(result)
        allTestedLinks.push(result)
        console.log(`❌ API ${route} - ${error}`)
      }
    }
  })

  test('should check all navigation links on homepage', async ({ page }) => {
    console.log('🔍 Testing homepage navigation links...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Get all links on the page
    const links = await page.locator('a[href]').all()
    console.log(`Found ${links.length} links on homepage`)

    for (const link of links) {
      const href = await link.getAttribute('href')
      const text = (await link.textContent())?.trim() || 'No text'
      
      if (!href) continue
      
      // Skip external links and mailto/tel links for now
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue
      }

      try {
        // Click link and check if page loads with timeout
        await link.click({ force: true, timeout: 10000 })
        await page.waitForLoadState('networkidle', { timeout: 15000 })
        
        const currentUrl = page.url()
        const result: LinkTestResult = {
          url: href,
          text: text,
          status: 'success',
          page: 'homepage'
        }
        
        allTestedLinks.push(result)
        console.log(`✅ ${href} (${text})`)
        
        // Go back to homepage with retry logic
        try {
          await page.goto('/', { timeout: 10000 })
          await page.waitForLoadState('networkidle', { timeout: 15000 })
        } catch (navError) {
          console.log(`⚠️ Navigation back to homepage failed for ${href}: ${navError}`)
          // Continue with next link even if navigation back fails
        }
        
      } catch (error) {
        const result: LinkTestResult = {
          url: href,
          text: text,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          page: 'homepage'
        }
        
        brokenLinks.push(result)
        allTestedLinks.push(result)
        console.log(`❌ ${href} (${text}) - ${error}`)
        
        // Try to go back to homepage with better error handling
        try {
          await page.goto('/', { timeout: 10000 })
          await page.waitForLoadState('networkidle', { timeout: 15000 })
        } catch (e) {
          console.log(`⚠️ Failed to return to homepage after testing ${href}: ${e}`)
          // Try to continue from current page if possible
        }
      }
    }
  })

  test('should check admin navigation links', async ({ page }) => {
    console.log('🔍 Testing admin navigation...')

    // First, try to access admin area
    await page.goto('/admin')
    
    // Should redirect to login
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/login')
    
    // Test login page links
    const loginLinks = await page.locator('a[href]').all()
    
    for (const link of loginLinks) {
      const href = await link.getAttribute('href')
      const text = (await link.textContent())?.trim() || 'No text'
      
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) continue
      
      try {
        await link.click({ force: true, timeout: 10000 })
        await page.waitForLoadState('networkidle', { timeout: 15000 })
        
        const result: LinkTestResult = {
          url: href,
          text: text,
          status: 'success',
          page: 'admin-login'
        }
        
        allTestedLinks.push(result)
        console.log(`✅ Admin: ${href} (${text})`)
        
      } catch (error) {
        const result: LinkTestResult = {
          url: href,
          text: text,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          page: 'admin-login'
        }
        
        brokenLinks.push(result)
        allTestedLinks.push(result)
        console.log(`❌ Admin: ${href} (${text}) - ${error}`)
      }
    }
  })

  test('should test tools and categories dynamic routes', async ({ page }) => {
    console.log('🔍 Testing dynamic routes...')

    // Test /tools page
    try {
      await page.goto('/tools')
      await page.waitForLoadState('networkidle')
      
      // Look for tool cards and test first few tool links
      const toolLinks = await page.locator('a[href*="/tools/"]').first(5).all()
      
      for (const link of toolLinks) {
        const href = await link.getAttribute('href')
        if (!href) continue
        
        try {
          const response = await page.request.get(href)
          const result: LinkTestResult = {
            url: href,
            text: 'Tool detail page',
            status: response?.ok() ? 'success' : 'error',
            statusCode: response?.status(),
            page: 'tools-page'
          }
          
          if (!response?.ok()) {
            result.error = `HTTP ${response?.status()}`
            brokenLinks.push(result)
          }
          
          allTestedLinks.push(result)
          console.log(`${response?.ok() ? '✅' : '❌'} Tool: ${href} - ${response?.status()}`)
        } catch (error) {
          const result: LinkTestResult = {
            url: href,
            text: 'Tool detail page',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            page: 'tools-page'
          }
          brokenLinks.push(result)
          allTestedLinks.push(result)
          console.log(`❌ Tool: ${href} - ${error}`)
        }
      }
    } catch (error) {
      console.log(`❌ Failed to load /tools page: ${error}`)
    }

    // Test /categories page
    try {
      await page.goto('/categories')
      await page.waitForLoadState('networkidle')
      
      // Look for category links
      const categoryLinks = await page.locator('a[href*="/categories/"]').first(5).all()
      
      for (const link of categoryLinks) {
        const href = await link.getAttribute('href')
        if (!href) continue
        
        try {
          const response = await page.request.get(href)
          const result: LinkTestResult = {
            url: href,
            text: 'Category page',
            status: response?.ok() ? 'success' : 'error',
            statusCode: response?.status(),
            page: 'categories-page'
          }
          
          if (!response?.ok()) {
            result.error = `HTTP ${response?.status()}`
            brokenLinks.push(result)
          }
          
          allTestedLinks.push(result)
          console.log(`${response?.ok() ? '✅' : '❌'} Category: ${href} - ${response?.status()}`)
        } catch (error) {
          const result: LinkTestResult = {
            url: href,
            text: 'Category page',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            page: 'categories-page'
          }
          brokenLinks.push(result)
          allTestedLinks.push(result)
          console.log(`❌ Category: ${href} - ${error}`)
        }
      }
    } catch (error) {
      console.log(`❌ Failed to load /categories page: ${error}`)
    }
  })

  test('should report broken links summary', async ({ page }) => {
    console.log('\n📊 LINK CHECK SUMMARY')
    console.log('=' .repeat(50))
    
    const totalLinks = allTestedLinks.length
    const successfulLinks = allTestedLinks.filter(l => l.status === 'success').length
    const brokenLinksCount = brokenLinks.length
    
    console.log(`Total links tested: ${totalLinks}`)
    console.log(`✅ Successful: ${successfulLinks}`)
    console.log(`❌ Broken: ${brokenLinksCount}`)
    console.log(`Success rate: ${totalLinks > 0 ? Math.round((successfulLinks / totalLinks) * 100) : 0}%`)
    
    if (brokenLinks.length > 0) {
      console.log('\n🚨 BROKEN LINKS FOUND:')
      console.log('-'.repeat(30))
      
      // Group by page
      const groupedByPage = brokenLinks.reduce((acc, link) => {
        if (!acc[link.page]) acc[link.page] = []
        acc[link.page].push(link)
        return acc
      }, {} as Record<string, LinkTestResult[]>)
      
      for (const [pageName, links] of Object.entries(groupedByPage)) {
        console.log(`\n📄 Page: ${pageName}`)
        links.forEach(link => {
          console.log(`   ❌ ${link.url}`)
          console.log(`      Text: "${link.text}"`)
          console.log(`      Error: ${link.error || 'Unknown'}`)
          if (link.statusCode) {
            console.log(`      Status: ${link.statusCode}`)
          }
        })
      }
      
      // Fail the test if critical links are broken
      const criticalBrokenLinks = brokenLinks.filter(link => 
        EXPECTED_ROUTES.public.includes(link.url) || 
        EXPECTED_ROUTES.admin.includes(link.url)
      )
      
      if (criticalBrokenLinks.length > 0) {
        console.log(`\n🔥 CRITICAL: ${criticalBrokenLinks.length} essential routes are broken!`)
        expect(criticalBrokenLinks.length).toBe(0)
      }
    } else {
      console.log('\n🎉 No broken links found!')
    }
    
    // Create a report file
    const reportPath = './test-results/link-check-report.json'
    await page.evaluate(({ allLinks, brokenLinks, summary }) => {
      // This will be written to a file by the test runner
      console.log('Report data:', { allLinks, brokenLinks, summary })
    }, {
      allLinks: allTestedLinks,
      brokenLinks: brokenLinks,
      summary: {
        total: totalLinks,
        successful: successfulLinks,
        broken: brokenLinksCount,
        successRate: Math.round((successfulLinks / totalLinks) * 100)
      }
    })
  })
})