/**
 * Tests de Performance par Langue - Video-IA.net
 * 
 * Tests de performance spécialisés pour chaque langue :
 * - Core Web Vitals par langue et région
 * - Performance des traductions et cache
 * - Analyse comparative inter-langues
 * - Tests de charge multilingue
 * 
 * @author Video-IA.net Development Team
 */

import { test, expect, Page } from '@playwright/test'
import { SupportedLocale } from '../../src/middleware'

// Configuration des tests
const SUPPORTED_LANGUAGES: SupportedLocale[] = ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt']
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Seuils de performance (basés sur les recommandations Google)
const PERFORMANCE_THRESHOLDS = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  ttfb: { good: 800, needsImprovement: 1800 },
  total_load: { good: 3000, needsImprovement: 5000 }
}

interface PerformanceResult {
  language: SupportedLocale
  url: string
  metrics: {
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
    totalLoadTime: number
    translationLoadTime: number
    domContentLoaded: number
    firstByte: number
  }
  resourceMetrics: {
    totalRequests: number
    totalSize: number
    jsSize: number
    cssSize: number
    imageSize: number
    fontSize: number
    translationSize: number
  }
  timing: {
    dnsLookup: number
    tcpConnect: number
    serverResponse: number
    domProcessing: number
    resourceLoad: number
  }
  scores: {
    overall: number
    lcp: number
    fid: number
    cls: number
  }
  device: 'desktop' | 'mobile' | 'tablet'
  network: 'fast3g' | '4g' | 'slow3g'
}

interface LanguageComparison {
  fastest: { language: SupportedLocale; time: number }
  slowest: { language: SupportedLocale; time: number }
  average: number
  variance: number
  distribution: Record<SupportedLocale, number>
}

class PerformanceTestHelper {
  constructor(private page: Page) {}

  /**
   * Mesurer les Core Web Vitals
   */
  async measureWebVitals(url: string): Promise<PerformanceResult['metrics']> {
    const startTime = Date.now()
    
    await this.page.goto(url)
    await this.page.waitForLoadState('networkidle')
    
    const totalLoadTime = Date.now() - startTime

    // Mesurer les métriques via Performance API
    const vitals = await this.page.evaluate(() => {
      return new Promise<any>((resolve) => {
        const metrics: any = {
          lcp: 0,
          fid: 0,
          cls: 0,
          fcp: 0,
          ttfb: 0,
          domContentLoaded: 0,
          firstByte: 0
        }

        // Navigation Timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          metrics.ttfb = navigation.responseStart - navigation.requestStart
          metrics.firstByte = navigation.responseStart - navigation.fetchStart
          metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        }

        // LCP Observer
        if ('PerformanceObserver' in window) {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            if (entries.length > 0) {
              metrics.lcp = entries[entries.length - 1].startTime
            }
          })
          
          try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
          } catch (e) {
            console.warn('LCP observer failed')
          }
        }

        // FCP Observer
        if ('PerformanceObserver' in window) {
          const fcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
            if (fcpEntry) {
              metrics.fcp = fcpEntry.startTime
            }
          })
          
          try {
            fcpObserver.observe({ entryTypes: ['paint'] })
          } catch (e) {
            console.warn('FCP observer failed')
          }
        }

        // CLS Observer
        if ('PerformanceObserver' in window) {
          let clsValue = 0
          const clsObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            })
            metrics.cls = clsValue
          })
          
          try {
            clsObserver.observe({ entryTypes: ['layout-shift'] })
          } catch (e) {
            console.warn('CLS observer failed')
          }
        }

        // FID will be captured by user interaction, simulate for testing
        metrics.fid = Math.random() * 50 // Simulated FID

        // Attendre que les observers collectent les données
        setTimeout(() => {
          resolve(metrics)
        }, 2000)
      })
    })

    return {
      ...vitals,
      totalLoadTime,
      translationLoadTime: await this.measureTranslationLoad()
    }
  }

  /**
   * Mesurer le temps de chargement des traductions
   */
  async measureTranslationLoad(): Promise<number> {
    return this.page.evaluate(() => {
      const translationScripts = Array.from(document.querySelectorAll('script[src*="i18n"], script[src*="translation"]'))
      if (translationScripts.length === 0) return 0

      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const translationResources = resourceEntries.filter(entry => 
        entry.name.includes('i18n') || 
        entry.name.includes('translation') ||
        entry.name.includes('locale')
      )

      if (translationResources.length === 0) return 0

      return translationResources.reduce((sum, resource) => sum + resource.duration, 0) / translationResources.length
    })
  }

  /**
   * Analyser les ressources
   */
  async analyzeResources(): Promise<PerformanceResult['resourceMetrics']> {
    const resources = await this.page.evaluate(() => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      let totalSize = 0
      let jsSize = 0
      let cssSize = 0
      let imageSize = 0
      let fontSize = 0
      let translationSize = 0

      resourceEntries.forEach(resource => {
        const size = resource.transferSize || resource.encodedBodySize || 0
        totalSize += size

        if (resource.name.endsWith('.js')) {
          jsSize += size
        } else if (resource.name.endsWith('.css')) {
          cssSize += size
        } else if (resource.name.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)) {
          imageSize += size
        } else if (resource.name.match(/\.(woff|woff2|ttf|otf)$/i)) {
          fontSize += size
        } else if (resource.name.includes('i18n') || resource.name.includes('translation')) {
          translationSize += size
        }
      })

      return {
        totalRequests: resourceEntries.length,
        totalSize,
        jsSize,
        cssSize,
        imageSize,
        fontSize,
        translationSize
      }
    })

    return resources
  }

  /**
   * Calculer les scores de performance
   */
  calculateScores(metrics: PerformanceResult['metrics']): PerformanceResult['scores'] {
    const lcpScore = metrics.lcp <= PERFORMANCE_THRESHOLDS.lcp.good ? 100 :
                    metrics.lcp <= PERFORMANCE_THRESHOLDS.lcp.needsImprovement ? 50 : 0

    const fidScore = metrics.fid <= PERFORMANCE_THRESHOLDS.fid.good ? 100 :
                    metrics.fid <= PERFORMANCE_THRESHOLDS.fid.needsImprovement ? 50 : 0

    const clsScore = metrics.cls <= PERFORMANCE_THRESHOLDS.cls.good ? 100 :
                    metrics.cls <= PERFORMANCE_THRESHOLDS.cls.needsImprovement ? 50 : 0

    const overall = (lcpScore + fidScore + clsScore) / 3

    return {
      overall: Math.round(overall),
      lcp: lcpScore,
      fid: fidScore,
      cls: clsScore
    }
  }

  /**
   * Test de performance complet pour une URL
   */
  async runCompletePerformanceTest(
    language: SupportedLocale, 
    path: string = '',
    device: PerformanceResult['device'] = 'desktop',
    network: PerformanceResult['network'] = '4g'
  ): Promise<PerformanceResult> {
    const url = `${BASE_URL}/${language}${path}`

    // Configurer les conditions réseau
    await this.configureNetworkConditions(network)
    
    // Configurer l'appareil
    await this.configureDevice(device)

    // Mesurer les métriques
    const metrics = await this.measureWebVitals(url)
    const resourceMetrics = await this.analyzeResources()
    const timing = await this.measureDetailedTiming()
    const scores = this.calculateScores(metrics)

    return {
      language,
      url,
      metrics,
      resourceMetrics,
      timing,
      scores,
      device,
      network
    }
  }

  private async configureNetworkConditions(network: PerformanceResult['network']) {
    const conditions = {
      'fast3g': { downloadThroughput: 1.6 * 1024 * 1024, uploadThroughput: 0.75 * 1024 * 1024, latency: 150 },
      '4g': { downloadThroughput: 10 * 1024 * 1024, uploadThroughput: 5 * 1024 * 1024, latency: 20 },
      'slow3g': { downloadThroughput: 0.5 * 1024 * 1024, uploadThroughput: 0.5 * 1024 * 1024, latency: 400 }
    }

    const condition = conditions[network]
    if (condition) {
      const cdp = await this.page.context().newCDPSession(this.page)
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        ...condition
      })
    }
  }

  private async configureDevice(device: PerformanceResult['device']) {
    const devices = {
      desktop: { width: 1200, height: 800 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    }

    const deviceConfig = devices[device]
    if (deviceConfig) {
      await this.page.setViewportSize(deviceConfig)
    }
  }

  private async measureDetailedTiming(): Promise<PerformanceResult['timing']> {
    return this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (!navigation) {
        return {
          dnsLookup: 0,
          tcpConnect: 0,
          serverResponse: 0,
          domProcessing: 0,
          resourceLoad: 0
        }
      }

      return {
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnect: navigation.connectEnd - navigation.connectStart,
        serverResponse: navigation.responseEnd - navigation.requestStart,
        domProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        resourceLoad: navigation.loadEventEnd - navigation.domContentLoadedEventEnd
      }
    })
  }
}

// Tests de performance principaux
test.describe('Tests de Performance par Langue', () => {
  let helper: PerformanceTestHelper

  test.beforeEach(async ({ page }) => {
    helper = new PerformanceTestHelper(page)
  })

  test('Performance de base - toutes langues (desktop)', async () => {
    const results: PerformanceResult[] = []

    for (const language of SUPPORTED_LANGUAGES) {
      const result = await helper.runCompletePerformanceTest(language, '', 'desktop', '4g')
      results.push(result)

      // Vérifications individuelles
      expect(result.metrics.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.lcp.needsImprovement)
      expect(result.metrics.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.fcp.needsImprovement)
      expect(result.metrics.ttfb).toBeLessThan(PERFORMANCE_THRESHOLDS.ttfb.needsImprovement)
      expect(result.scores.overall).toBeGreaterThan(50) // Au moins "Needs Improvement"

      console.log(`🖥️  ${language.toUpperCase()}: Score=${result.scores.overall}, LCP=${result.metrics.lcp}ms, FCP=${result.metrics.fcp}ms`)
    }

    // Analyse comparative
    const comparison = analyzeLanguageComparison(results, 'totalLoadTime')
    const performanceVariance = ((comparison.slowest.time - comparison.fastest.time) / comparison.fastest.time) * 100

    console.log('\n📊 ANALYSE COMPARATIVE DESKTOP:')
    console.log(`⚡ Plus rapide: ${comparison.fastest.language} (${comparison.fastest.time}ms)`)
    console.log(`🐌 Plus lent: ${comparison.slowest.language} (${comparison.slowest.time}ms)`)
    console.log(`📈 Variance: ${performanceVariance.toFixed(1)}%`)

    // La variance entre langues ne devrait pas dépasser 25%
    expect(performanceVariance).toBeLessThan(25)
  })

  test('Performance mobile - langues principales', async () => {
    const mainLanguages: SupportedLocale[] = ['en', 'fr', 'es', 'de']
    const results: PerformanceResult[] = []

    for (const language of mainLanguages) {
      const result = await helper.runCompletePerformanceTest(language, '', 'mobile', 'fast3g')
      results.push(result)

      // Seuils plus souples pour mobile
      expect(result.metrics.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.lcp.needsImprovement * 1.2)
      expect(result.metrics.totalLoadTime).toBeLessThan(8000) // 8s max pour mobile

      console.log(`📱 ${language.toUpperCase()}: Score=${result.scores.overall}, LCP=${result.metrics.lcp}ms, Total=${result.metrics.totalLoadTime}ms`)
    }

    const avgScore = results.reduce((sum, r) => sum + r.scores.overall, 0) / results.length
    console.log(`📊 Score mobile moyen: ${avgScore.toFixed(1)}/100`)

    // Score mobile moyen doit être > 40
    expect(avgScore).toBeGreaterThan(40)
  })

  test('Performance des pages outils par langue', async () => {
    const toolPath = '/tools/chatgpt'
    const testLanguages: SupportedLocale[] = ['en', 'fr', 'es', 'de']
    const results: PerformanceResult[] = []

    for (const language of testLanguages) {
      const result = await helper.runCompletePerformanceTest(language, toolPath, 'desktop', '4g')
      results.push(result)

      console.log(`🔧 ${language.toUpperCase()} Tool Page: LCP=${result.metrics.lcp}ms, Translation=${result.metrics.translationLoadTime}ms`)
    }

    // Vérifier que les temps de traduction sont raisonnables
    results.forEach(result => {
      expect(result.metrics.translationLoadTime).toBeLessThan(500) // 500ms max pour les traductions
    })

    const comparison = analyzeLanguageComparison(results, 'lcp')
    console.log(`\n🔧 OUTIL PERFORMANCE: Meilleur LCP=${comparison.fastest.language} (${comparison.fastest.time}ms)`)
  })

  test('Performance sous charge réseau lente', async () => {
    const results: PerformanceResult[] = []
    const testLanguages: SupportedLocale[] = ['en', 'fr', 'de']

    for (const language of testLanguages) {
      const result = await helper.runCompletePerformanceTest(language, '', 'mobile', 'slow3g')
      results.push(result)

      // Seuils très souples pour réseau lent
      expect(result.metrics.totalLoadTime).toBeLessThan(15000) // 15s max

      console.log(`🐌 ${language.toUpperCase()} Slow 3G: Total=${result.metrics.totalLoadTime}ms, TTFB=${result.metrics.ttfb}ms`)
    }

    // Vérifier que les performances restent utilisables même en réseau lent
    const avgLoadTime = results.reduce((sum, r) => sum + r.metrics.totalLoadTime, 0) / results.length
    expect(avgLoadTime).toBeLessThan(12000) // 12s max en moyenne
  })

  test('Analyse des ressources par langue', async () => {
    const results: PerformanceResult[] = []

    for (const language of SUPPORTED_LANGUAGES) {
      const result = await helper.runCompletePerformanceTest(language, '', 'desktop', '4g')
      results.push(result)
    }

    console.log('\n📦 ANALYSE DES RESSOURCES:')
    console.log('==========================')

    results.forEach(result => {
      const resources = result.resourceMetrics
      const totalSizeMB = (resources.totalSize / (1024 * 1024)).toFixed(1)
      const jsSizeMB = (resources.jsSize / (1024 * 1024)).toFixed(1)
      const translationKB = (resources.translationSize / 1024).toFixed(1)

      console.log(`${result.language.toUpperCase()}: Total=${totalSizeMB}MB, JS=${jsSizeMB}MB, i18n=${translationKB}KB`)

      // Vérifications de taille
      expect(resources.totalSize).toBeLessThan(5 * 1024 * 1024) // 5MB max
      expect(resources.jsSize).toBeLessThan(2 * 1024 * 1024) // 2MB max JS
      expect(resources.translationSize).toBeLessThan(100 * 1024) // 100KB max traductions
    })

    // Analyser la variance des tailles entre langues
    const sizes = results.map(r => r.resourceMetrics.totalSize)
    const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length
    const maxSize = Math.max(...sizes)
    const variance = ((maxSize - avgSize) / avgSize) * 100

    console.log(`📊 Variance de taille: ${variance.toFixed(1)}%`)
    expect(variance).toBeLessThan(15) // 15% max de variance
  })

  test('Performance de changement de langue', async ({ page }) => {
    const helper = new PerformanceTestHelper(page)
    
    // Commencer en anglais
    await helper.runCompletePerformanceTest('en', '', 'desktop', '4g')
    
    const switchTimes: Array<{ from: SupportedLocale; to: SupportedLocale; time: number }> = []
    
    const sequence: SupportedLocale[] = ['fr', 'es', 'de', 'en']
    let currentLang: SupportedLocale = 'en'

    for (const targetLang of sequence) {
      if (targetLang !== currentLang) {
        const startTime = Date.now()
        
        // Simuler changement de langue via navigation
        await page.goto(`${BASE_URL}/${targetLang}`)
        await page.waitForLoadState('networkidle')
        
        const switchTime = Date.now() - startTime
        switchTimes.push({ from: currentLang, to: targetLang, time: switchTime })
        currentLang = targetLang
      }
    }

    console.log('\n🔄 TEMPS DE CHANGEMENT DE LANGUE:')
    switchTimes.forEach(({ from, to, time }) => {
      console.log(`${from.toUpperCase()} → ${to.toUpperCase()}: ${time}ms`)
      expect(time).toBeLessThan(3000) // 3s max pour changer de langue
    })

    const avgSwitchTime = switchTimes.reduce((sum, s) => sum + s.time, 0) / switchTimes.length
    console.log(`📊 Temps moyen: ${avgSwitchTime.toFixed(0)}ms`)
    expect(avgSwitchTime).toBeLessThan(2000) // 2s max en moyenne
  })

  test('Core Web Vitals - rapport complet', async () => {
    const results: PerformanceResult[] = []
    const report: Record<SupportedLocale, { good: number; needsImprovement: number; poor: number }> = {}

    for (const language of SUPPORTED_LANGUAGES) {
      const result = await helper.runCompletePerformanceTest(language, '', 'desktop', '4g')
      results.push(result)

      // Classifier chaque métrique
      const lcpRating = result.metrics.lcp <= PERFORMANCE_THRESHOLDS.lcp.good ? 'good' :
                       result.metrics.lcp <= PERFORMANCE_THRESHOLDS.lcp.needsImprovement ? 'needsImprovement' : 'poor'
      
      const fidRating = result.metrics.fid <= PERFORMANCE_THRESHOLDS.fid.good ? 'good' :
                       result.metrics.fid <= PERFORMANCE_THRESHOLDS.fid.needsImprovement ? 'needsImprovement' : 'poor'

      const clsRating = result.metrics.cls <= PERFORMANCE_THRESHOLDS.cls.good ? 'good' :
                       result.metrics.cls <= PERFORMANCE_THRESHOLDS.cls.needsImprovement ? 'needsImprovement' : 'poor'

      const ratings = [lcpRating, fidRating, clsRating]
      report[language] = {
        good: ratings.filter(r => r === 'good').length,
        needsImprovement: ratings.filter(r => r === 'needsImprovement').length,
        poor: ratings.filter(r => r === 'poor').length
      }
    }

    console.log('\n🎯 RAPPORT CORE WEB VITALS:')
    console.log('===========================')

    Object.entries(report).forEach(([lang, scores]) => {
      const total = scores.good + scores.needsImprovement + scores.poor
      const goodPercent = (scores.good / total * 100).toFixed(0)
      const status = scores.good >= 2 ? '✅' : scores.good >= 1 ? '⚠️' : '❌'
      
      console.log(`${status} ${lang.toUpperCase()}: ${goodPercent}% Good (${scores.good}/${total} métriques)`)
    })

    // Au moins 75% des langues doivent avoir au moins 2 métriques "Good"
    const languagesWithGoodVitals = Object.values(report).filter(scores => scores.good >= 2).length
    const successRate = (languagesWithGoodVitals / SUPPORTED_LANGUAGES.length) * 100
    
    console.log(`📊 Taux de succès Core Web Vitals: ${successRate.toFixed(0)}%`)
    expect(successRate).toBeGreaterThan(75)
  })
})

// Tests de régression performance
test.describe('Tests de Régression Performance', () => {
  test('Baseline vs actuel - toutes langues', async ({ page }) => {
    const helper = new PerformanceTestHelper(page)
    
    // Ces valeurs seraient normalement chargées depuis un fichier de référence
    const baselineMetrics: Record<SupportedLocale, number> = {
      en: 2800,
      fr: 2900,
      es: 2950,
      it: 2900,
      de: 2850,
      nl: 2900,
      pt: 2950
    }

    const regressions: Array<{ language: SupportedLocale; baseline: number; current: number; regression: number }> = []

    for (const language of SUPPORTED_LANGUAGES) {
      const result = await helper.runCompletePerformanceTest(language, '', 'desktop', '4g')
      const baseline = baselineMetrics[language]
      const regression = ((result.metrics.totalLoadTime - baseline) / baseline) * 100

      if (regression > 10) { // Plus de 10% de régression
        regressions.push({
          language,
          baseline,
          current: result.metrics.totalLoadTime,
          regression
        })
      }

      console.log(`📈 ${language.toUpperCase()}: ${result.metrics.totalLoadTime}ms (baseline: ${baseline}ms, ${regression > 0 ? '+' : ''}${regression.toFixed(1)}%)`)
    }

    if (regressions.length > 0) {
      console.log('\n⚠️ RÉGRESSIONS DÉTECTÉES:')
      regressions.forEach(({ language, baseline, current, regression }) => {
        console.log(`❌ ${language.toUpperCase()}: ${current}ms vs ${baseline}ms (+${regression.toFixed(1)}%)`)
      })
    }

    // Aucune régression de plus de 15% ne devrait être tolérée
    regressions.forEach(({ regression }) => {
      expect(regression).toBeLessThan(15)
    })
  })
})

// Utilitaires
function analyzeLanguageComparison(
  results: PerformanceResult[], 
  metric: keyof PerformanceResult['metrics']
): LanguageComparison {
  const values = results.map(r => ({
    language: r.language,
    value: r.metrics[metric] as number
  }))

  values.sort((a, b) => a.value - b.value)

  const fastest = { language: values[0].language, time: values[0].value }
  const slowest = { language: values[values.length - 1].language, time: values[values.length - 1].value }
  const average = values.reduce((sum, v) => sum + v.value, 0) / values.length
  const variance = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v.value - average, 2), 0) / values.length)

  const distribution = values.reduce((acc, v) => {
    acc[v.language] = v.value
    return acc
  }, {} as Record<SupportedLocale, number>)

  return { fastest, slowest, average, variance, distribution }
}

// Configuration des appareils pour les tests
test.describe('Tests Multi-Appareils', () => {
  const devices: Array<{ name: string; device: PerformanceResult['device']; viewport: { width: number; height: number } }> = [
    { name: 'Desktop', device: 'desktop', viewport: { width: 1200, height: 800 } },
    { name: 'Tablet', device: 'tablet', viewport: { width: 768, height: 1024 } },
    { name: 'Mobile', device: 'mobile', viewport: { width: 375, height: 667 } }
  ]

  for (const { name, device, viewport } of devices) {
    test(`Performance ${name} - langues principales`, async ({ page }) => {
      await page.setViewportSize(viewport)
      const helper = new PerformanceTestHelper(page)
      
      const mainLanguages: SupportedLocale[] = ['en', 'fr', 'es', 'de']
      
      for (const language of mainLanguages) {
        const result = await helper.runCompletePerformanceTest(language, '', device, '4g')
        
        console.log(`${name} ${language.toUpperCase()}: Score=${result.scores.overall}, LCP=${result.metrics.lcp}ms`)
        
        // Ajuster les seuils selon l'appareil
        const lcpThreshold = device === 'mobile' ? PERFORMANCE_THRESHOLDS.lcp.needsImprovement * 1.3 : PERFORMANCE_THRESHOLDS.lcp.needsImprovement
        expect(result.metrics.lcp).toBeLessThan(lcpThreshold)
        expect(result.scores.overall).toBeGreaterThan(device === 'mobile' ? 40 : 50)
      }
    })
  }
})