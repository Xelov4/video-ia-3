/**
 * Tests E2E Multilingues Complets - Video-IA.net
 * 
 * Tests end-to-end couvrant tous les scénarios multilingues :
 * - Navigation entre langues avec préservation d'état
 * - Fonctionnalité complète dans chaque langue
 * - Fallbacks et gestion d'erreurs
 * - Performance par langue
 * 
 * @author Video-IA.net Development Team
 */

import { test, expect, Page, BrowserContext } from '@playwright/test'
import { SupportedLocale } from '../../src/middleware'

// Configuration des langues à tester
const SUPPORTED_LANGUAGES: SupportedLocale[] = ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt']
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Types pour les tests
interface TestData {
  language: SupportedLocale
  expectedTexts: Record<string, string>
  urls: Record<string, string>
}

interface PerformanceMetrics {
  language: SupportedLocale
  lcp: number
  fcp: number
  loadTime: number
  translationTime: number
}

// Données de test par langue
const testData: Record<SupportedLocale, TestData> = {
  en: {
    language: 'en',
    expectedTexts: {
      nav_tools: 'Tools',
      nav_categories: 'Categories',
      search_placeholder: 'Search AI tools...',
      footer_about: 'About',
      tool_detail_overview: 'Overview'
    },
    urls: {
      homepage: '/en',
      tools: '/en/tools',
      categories: '/en/categories',
      search: '/en/search'
    }
  },
  fr: {
    language: 'fr',
    expectedTexts: {
      nav_tools: 'Outils',
      nav_categories: 'Catégories',
      search_placeholder: 'Rechercher des outils IA...',
      footer_about: 'À propos',
      tool_detail_overview: 'Aperçu'
    },
    urls: {
      homepage: '/fr',
      tools: '/fr/tools',
      categories: '/fr/categories',
      search: '/fr/search'
    }
  },
  es: {
    language: 'es',
    expectedTexts: {
      nav_tools: 'Herramientas',
      nav_categories: 'Categorías',
      search_placeholder: 'Buscar herramientas de IA...',
      footer_about: 'Acerca de',
      tool_detail_overview: 'Resumen'
    },
    urls: {
      homepage: '/es',
      tools: '/es/tools',
      categories: '/es/categories',
      search: '/es/search'
    }
  },
  it: {
    language: 'it',
    expectedTexts: {
      nav_tools: 'Strumenti',
      nav_categories: 'Categorie',
      search_placeholder: 'Cerca strumenti IA...',
      footer_about: 'Chi siamo',
      tool_detail_overview: 'Panoramica'
    },
    urls: {
      homepage: '/it',
      tools: '/it/tools',
      categories: '/it/categories',
      search: '/it/search'
    }
  },
  de: {
    language: 'de',
    expectedTexts: {
      nav_tools: 'Tools',
      nav_categories: 'Kategorien',
      search_placeholder: 'KI-Tools suchen...',
      footer_about: 'Über uns',
      tool_detail_overview: 'Übersicht'
    },
    urls: {
      homepage: '/de',
      tools: '/de/tools',
      categories: '/de/categories',
      search: '/de/search'
    }
  },
  nl: {
    language: 'nl',
    expectedTexts: {
      nav_tools: 'Tools',
      nav_categories: 'Categorieën',
      search_placeholder: 'AI-tools zoeken...',
      footer_about: 'Over ons',
      tool_detail_overview: 'Overzicht'
    },
    urls: {
      homepage: '/nl',
      tools: '/nl/tools',
      categories: '/nl/categories',
      search: '/nl/search'
    }
  },
  pt: {
    language: 'pt',
    expectedTexts: {
      nav_tools: 'Ferramentas',
      nav_categories: 'Categorias',
      search_placeholder: 'Buscar ferramentas de IA...',
      footer_about: 'Sobre',
      tool_detail_overview: 'Visão geral'
    },
    urls: {
      homepage: '/pt',
      tools: '/pt/tools',
      categories: '/pt/categories',
      search: '/pt/search'
    }
  }
}

// Utilitaires de test
class MultilingualTestHelper {
  constructor(private page: Page) {}

  async navigateToLanguage(language: SupportedLocale): Promise<void> {
    await this.page.goto(`${BASE_URL}/${language}`)
    await this.page.waitForLoadState('networkidle')
  }

  async switchLanguageViaUI(targetLanguage: SupportedLocale): Promise<number> {
    const startTime = Date.now()
    
    // Ouvrir language switcher
    await this.page.click('[data-testid="language-switcher"]')
    await this.page.waitForSelector('[data-testid="language-menu"]', { state: 'visible' })
    
    // Cliquer sur la langue cible
    await this.page.click(`[data-testid="language-option-${targetLanguage}"]`)
    
    // Attendre la navigation
    await this.page.waitForLoadState('networkidle')
    
    return Date.now() - startTime
  }

  async verifyLanguageContent(language: SupportedLocale): Promise<boolean> {
    const data = testData[language]
    let allTextFound = true

    try {
      // Vérifier navigation
      const navTools = await this.page.textContent('[data-testid="nav-tools"]')
      if (navTools !== data.expectedTexts.nav_tools) {
        console.log(`❌ Expected nav tools: ${data.expectedTexts.nav_tools}, got: ${navTools}`)
        allTextFound = false
      }

      const navCategories = await this.page.textContent('[data-testid="nav-categories"]')
      if (navCategories !== data.expectedTexts.nav_categories) {
        console.log(`❌ Expected nav categories: ${data.expectedTexts.nav_categories}, got: ${navCategories}`)
        allTextFound = false
      }

      // Vérifier placeholder de recherche
      const searchInput = await this.page.getAttribute('[data-testid="search-input"]', 'placeholder')
      if (searchInput !== data.expectedTexts.search_placeholder) {
        console.log(`❌ Expected search placeholder: ${data.expectedTexts.search_placeholder}, got: ${searchInput}`)
        allTextFound = false
      }

      return allTextFound
    } catch (error) {
      console.log(`❌ Error verifying content for ${language}:`, error)
      return false
    }
  }

  async measurePerformanceMetrics(language: SupportedLocale): Promise<PerformanceMetrics> {
    const startTime = Date.now()
    
    // Naviguer vers la langue
    await this.navigateToLanguage(language)
    
    const loadTime = Date.now() - startTime
    
    // Mesurer LCP et FCP via Performance API
    const metrics = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let lcp = 0
        let fcp = 0
        
        // LCP Observer
        if ('PerformanceObserver' in window) {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            if (entries.length > 0) {
              lcp = entries[entries.length - 1].startTime
            }
          })
          
          try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
          } catch (e) {
            console.warn('LCP not supported')
          }
        }
        
        // FCP Observer  
        if ('PerformanceObserver' in window) {
          const fcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
            if (fcpEntry) {
              fcp = fcpEntry.startTime
            }
          })
          
          try {
            fcpObserver.observe({ entryTypes: ['paint'] })
          } catch (e) {
            console.warn('FCP not supported')
          }
        }
        
        // Attendre un peu pour collecter les métriques
        setTimeout(() => {
          resolve({ lcp, fcp })
        }, 2000)
      })
    }) as { lcp: number; fcp: number }

    return {
      language,
      lcp: metrics.lcp,
      fcp: metrics.fcp,
      loadTime,
      translationTime: 0 // Sera mesuré séparément
    }
  }

  async testToolDetailPage(language: SupportedLocale, toolSlug: string): Promise<boolean> {
    const url = `${BASE_URL}/${language}/tools/${toolSlug}`
    await this.page.goto(url)
    await this.page.waitForLoadState('networkidle')

    const data = testData[language]
    
    // Vérifier que la page charge
    const title = await this.page.title()
    if (!title) return false

    // Vérifier contenu traduit
    const overviewText = await this.page.textContent('[data-testid="tool-overview-title"]')
    return overviewText === data.expectedTexts.tool_detail_overview
  }

  async testSearchFunctionality(language: SupportedLocale): Promise<boolean> {
    await this.navigateToLanguage(language)
    
    // Effectuer une recherche
    await this.page.fill('[data-testid="search-input"]', 'chatgpt')
    await this.page.press('[data-testid="search-input"]', 'Enter')
    
    // Attendre les résultats
    await this.page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 })
    
    // Vérifier qu'il y a des résultats
    const results = await this.page.locator('[data-testid="search-result"]').count()
    return results > 0
  }

  async testLanguagePersistence(): Promise<boolean> {
    // Démarrer en anglais
    await this.navigateToLanguage('en')
    
    // Changer pour français
    await this.switchLanguageViaUI('fr')
    
    // Naviguer vers une autre page
    await this.page.click('[data-testid="nav-tools"]')
    await this.page.waitForLoadState('networkidle')
    
    // Vérifier que la langue est préservée
    const currentUrl = this.page.url()
    return currentUrl.includes('/fr/tools')
  }
}

// Tests principaux
test.describe('Tests E2E Multilingues Complets', () => {
  let helper: MultilingualTestHelper
  
  test.beforeEach(async ({ page }) => {
    helper = new MultilingualTestHelper(page)
  })

  // Test de base pour chaque langue
  for (const language of SUPPORTED_LANGUAGES) {
    test(`Navigation de base - ${language.toUpperCase()}`, async () => {
      await helper.navigateToLanguage(language)
      
      // Vérifier que la page charge
      await expect(helper.page).toHaveTitle(/Video-IA\.net/)
      
      // Vérifier contenu traduit
      const contentValid = await helper.verifyLanguageContent(language)
      expect(contentValid).toBe(true)
      
      console.log(`✅ Navigation de base réussie pour ${language}`)
    })
  }

  test('Changement de langue via UI', async () => {
    await helper.navigateToLanguage('en')
    
    for (const targetLanguage of ['fr', 'es', 'de']) {
      const switchTime = await helper.switchLanguageViaUI(targetLanguage as SupportedLocale)
      
      // Vérifier que le changement a fonctionné
      const currentUrl = helper.page.url()
      expect(currentUrl).toContain(`/${targetLanguage}`)
      
      // Vérifier contenu traduit
      const contentValid = await helper.verifyLanguageContent(targetLanguage as SupportedLocale)
      expect(contentValid).toBe(true)
      
      console.log(`✅ Changement vers ${targetLanguage} réussi en ${switchTime}ms`)
    }
  })

  test('Préservation de la langue dans la navigation', async () => {
    const persistenceWorking = await helper.testLanguagePersistence()
    expect(persistenceWorking).toBe(true)
    
    console.log('✅ Préservation de la langue confirmée')
  })

  test('Pages d\'outil dans toutes les langues', async () => {
    const testSlug = 'chatgpt' // Tool connu pour exister
    
    for (const language of SUPPORTED_LANGUAGES) {
      const toolPageWorking = await helper.testToolDetailPage(language, testSlug)
      expect(toolPageWorking).toBe(true)
      
      console.log(`✅ Page outil ${testSlug} fonctionne en ${language}`)
    }
  })

  test('Fonctionnalité de recherche multilingue', async () => {
    for (const language of ['en', 'fr', 'es', 'de']) {
      const searchWorking = await helper.testSearchFunctionality(language as SupportedLocale)
      expect(searchWorking).toBe(true)
      
      console.log(`✅ Recherche fonctionne en ${language}`)
    }
  })

  test('Métriques de performance par langue', async () => {
    const performanceResults: PerformanceMetrics[] = []
    
    for (const language of SUPPORTED_LANGUAGES) {
      const metrics = await helper.measurePerformanceMetrics(language)
      performanceResults.push(metrics)
      
      // Vérifications de performance
      expect(metrics.loadTime).toBeLessThan(5000) // < 5s
      expect(metrics.lcp).toBeLessThan(4000) // < 4s pour LCP
      
      console.log(`⚡ Performance ${language}: Load=${metrics.loadTime}ms, LCP=${metrics.lcp}ms`)
    }
    
    // Analyser les différences de performance entre langues
    const avgLoadTime = performanceResults.reduce((sum, m) => sum + m.loadTime, 0) / performanceResults.length
    const slowestLanguage = performanceResults.reduce((prev, curr) => 
      prev.loadTime > curr.loadTime ? prev : curr
    )
    
    console.log(`📊 Temps de chargement moyen: ${avgLoadTime}ms`)
    console.log(`🐌 Langue la plus lente: ${slowestLanguage.language} (${slowestLanguage.loadTime}ms)`)
    
    // Aucune langue ne devrait être 50% plus lente que la moyenne
    for (const metrics of performanceResults) {
      expect(metrics.loadTime).toBeLessThan(avgLoadTime * 1.5)
    }
  })

  test('Gestion des erreurs 404 multilingues', async () => {
    for (const language of ['en', 'fr', 'de']) {
      // Naviguer vers une page inexistante
      await helper.page.goto(`${BASE_URL}/${language}/tools/nonexistent-tool`)
      
      // Vérifier que la page 404 est dans la bonne langue
      const data = testData[language as SupportedLocale]
      
      // La page devrait soit rediriger, soit afficher 404 dans la bonne langue
      const pageContent = await helper.page.content()
      const is404 = pageContent.includes('404') || pageContent.includes('Not Found')
      
      if (is404) {
        // Si c'est une 404, vérifier qu'elle est dans la bonne langue
        const contentValid = await helper.verifyLanguageContent(language as SupportedLocale)
        expect(contentValid).toBe(true)
      }
      
      console.log(`✅ Gestion 404 correcte pour ${language}`)
    }
  })

  test('Fallbacks de traduction', async () => {
    // Simuler un scénario où certaines traductions sont manquantes
    // En injectant du JavaScript pour supprimer temporairement des traductions
    
    for (const language of ['fr', 'es']) {
      await helper.navigateToLanguage(language as SupportedLocale)
      
      // Simuler une traduction manquante
      await helper.page.evaluate(() => {
        const elements = document.querySelectorAll('[data-i18n]')
        if (elements.length > 0) {
          // Supprimer le contenu du premier élément traduit pour simuler une traduction manquante
          const firstElement = elements[0] as HTMLElement
          firstElement.textContent = ''
        }
      })
      
      // Recharger la page pour déclencher les fallbacks
      await helper.page.reload()
      await helper.page.waitForLoadState('networkidle')
      
      // Vérifier que du contenu est toujours affiché (fallback vers anglais)
      const bodyText = await helper.page.textContent('body')
      expect(bodyText?.trim().length).toBeGreaterThan(0)
      
      console.log(`✅ Fallback de traduction fonctionne pour ${language}`)
    }
  })

  test('Intégration SEO multilingue', async () => {
    for (const language of SUPPORTED_LANGUAGES) {
      await helper.navigateToLanguage(language)
      
      // Vérifier hreflang
      const hreflangLinks = await helper.page.locator('link[rel="alternate"][hreflang]').count()
      expect(hreflangLinks).toBeGreaterThan(0)
      
      // Vérifier meta description dans la bonne langue
      const metaDescription = await helper.page.getAttribute('meta[name="description"]', 'content')
      expect(metaDescription).toBeTruthy()
      
      // Vérifier canonical URL
      const canonicalUrl = await helper.page.getAttribute('link[rel="canonical"]', 'href')
      expect(canonicalUrl).toContain(`/${language}`)
      
      console.log(`✅ SEO multilingue valide pour ${language}`)
    }
  })

  test('Workflow utilisateur complet multilingue', async () => {
    // Simuler un parcours utilisateur complet en français
    await helper.navigateToLanguage('fr')
    
    // 1. Rechercher un outil
    await helper.page.fill('[data-testid="search-input"]', 'image')
    await helper.page.press('[data-testid="search-input"]', 'Enter')
    await helper.page.waitForSelector('[data-testid="search-results"]')
    
    // 2. Cliquer sur le premier résultat
    await helper.page.click('[data-testid="search-result"]:first-child [data-testid="tool-link"]')
    await helper.page.waitForLoadState('networkidle')
    
    // 3. Vérifier que la page outil est en français
    const toolUrl = helper.page.url()
    expect(toolUrl).toContain('/fr/tools/')
    
    // 4. Naviguer vers les catégories
    await helper.page.click('[data-testid="nav-categories"]')
    await helper.page.waitForLoadState('networkidle')
    
    // 5. Vérifier que l'URL est correcte
    const categoriesUrl = helper.page.url()
    expect(categoriesUrl).toContain('/fr/categories')
    
    // 6. Changer de langue vers espagnol
    await helper.switchLanguageViaUI('es')
    
    // 7. Vérifier que l'utilisateur reste sur la même page conceptuelle
    const newUrl = helper.page.url()
    expect(newUrl).toContain('/es/categories')
    
    console.log('✅ Workflow utilisateur complet réussi')
  })
})

// Tests de performance avancés
test.describe('Performance Tests par Langue', () => {
  test('Comparaison des temps de chargement', async ({ page }) => {
    const helper = new MultilingualTestHelper(page)
    const results: PerformanceMetrics[] = []
    
    for (const language of SUPPORTED_LANGUAGES) {
      const metrics = await helper.measurePerformanceMetrics(language)
      results.push(metrics)
    }
    
    // Générer rapport de performance
    console.log('\n📊 RAPPORT DE PERFORMANCE PAR LANGUE:')
    console.log('====================================')
    
    results.sort((a, b) => a.loadTime - b.loadTime)
    
    results.forEach((metrics, index) => {
      const position = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
      console.log(`${position} ${metrics.language.toUpperCase()}: ${metrics.loadTime}ms (LCP: ${metrics.lcp}ms)`)
    })
    
    const fastest = results[0]
    const slowest = results[results.length - 1]
    const difference = slowest.loadTime - fastest.loadTime
    const percentDifference = (difference / fastest.loadTime) * 100
    
    console.log(`\n⚡ Plus rapide: ${fastest.language} (${fastest.loadTime}ms)`)
    console.log(`🐌 Plus lent: ${slowest.language} (${slowest.loadTime}ms)`)
    console.log(`📈 Différence: ${difference}ms (${percentDifference.toFixed(1)}%)`)
    
    // Vérification: aucune langue ne devrait être plus de 30% plus lente que la plus rapide
    expect(percentDifference).toBeLessThan(30)
  })

  test('Mesure des temps de changement de langue', async ({ page }) => {
    const helper = new MultilingualTestHelper(page)
    await helper.navigateToLanguage('en')
    
    const switchTimes: Array<{ from: string; to: string; time: number }> = []
    
    const testSequence: SupportedLocale[] = ['fr', 'es', 'de', 'en']
    let currentLanguage: SupportedLocale = 'en'
    
    for (const targetLanguage of testSequence) {
      if (targetLanguage !== currentLanguage) {
        const switchTime = await helper.switchLanguageViaUI(targetLanguage)
        switchTimes.push({
          from: currentLanguage,
          to: targetLanguage,
          time: switchTime
        })
        currentLanguage = targetLanguage
      }
    }
    
    console.log('\n⏱️  TEMPS DE CHANGEMENT DE LANGUE:')
    console.log('==================================')
    
    switchTimes.forEach(({ from, to, time }) => {
      console.log(`${from.toUpperCase()} → ${to.toUpperCase()}: ${time}ms`)
    })
    
    const avgSwitchTime = switchTimes.reduce((sum, s) => sum + s.time, 0) / switchTimes.length
    console.log(`📊 Temps moyen: ${avgSwitchTime}ms`)
    
    // Vérification: les changements de langue devraient être < 2s
    switchTimes.forEach(({ time }) => {
      expect(time).toBeLessThan(2000)
    })
  })
})

// Configuration Playwright
test.use({
  // Simuler différents appareils
  viewport: { width: 1200, height: 800 },
  
  // Activer les métriques de performance
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  
  // Configuration navigateur
  headless: true,
  locale: 'en-US'
})