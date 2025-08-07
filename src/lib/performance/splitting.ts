/**
 * Code Splitting et Bundle Optimization par Langue - Video-IA.net
 * 
 * Optimisation des bundles et lazy loading intelligent :
 * - Code splitting par langue et route
 * - Lazy loading contextualisé
 * - Bundle analysis et optimisation
 * - Prefetching intelligent
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { SupportedLocale } from '@/middleware'

// Types pour la gestion des bundles
export interface BundleConfig {
  language: SupportedLocale
  chunks: BundleChunk[]
  totalSize: number
  gzipSize: number
  loadPriority: 'high' | 'medium' | 'low'
  preloadStrategy: 'eager' | 'lazy' | 'auto'
}

export interface BundleChunk {
  name: string
  type: 'vendor' | 'page' | 'component' | 'translation' | 'utility'
  size: number
  gzipSize: number
  dependencies: string[]
  routes: string[]
  languages: SupportedLocale[]
  cacheable: boolean
}

export interface LoadingStrategy {
  immediate: string[]
  lazy: string[]
  preload: string[]
  prefetch: string[]
}

export interface PerformanceBudget {
  maxInitialBundle: number // KB
  maxChunkSize: number // KB
  maxTotalSize: number // KB
  criticalPath: number // KB
  firstLoad: number // KB
}

/**
 * Gestionnaire de code splitting et optimisation
 */
export class BundleOptimizer {
  private performanceBudget: PerformanceBudget
  private bundleConfigs: Map<SupportedLocale, BundleConfig> = new Map()

  constructor() {
    this.performanceBudget = {
      maxInitialBundle: 250, // 250KB
      maxChunkSize: 244, // Next.js default
      maxTotalSize: 1000, // 1MB
      criticalPath: 170, // 170KB
      firstLoad: 300 // 300KB
    }
    
    this.initializeBundleConfigs()
  }

  /**
   * Initialiser les configurations de bundles par langue
   */
  private initializeBundleConfigs() {
    const supportedLanguages: SupportedLocale[] = ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt']
    
    supportedLanguages.forEach(language => {
      this.bundleConfigs.set(language, this.createLanguageBundleConfig(language))
    })
  }

  /**
   * Créer configuration de bundle pour une langue
   */
  private createLanguageBundleConfig(language: SupportedLocale): BundleConfig {
    return {
      language,
      loadPriority: language === 'en' ? 'high' : 'medium',
      preloadStrategy: language === 'en' ? 'eager' : 'lazy',
      totalSize: 0,
      gzipSize: 0,
      chunks: [
        {
          name: `translations-${language}`,
          type: 'translation',
          size: this.estimateTranslationSize(language),
          gzipSize: this.estimateTranslationSize(language) * 0.3,
          dependencies: [],
          routes: ['*'],
          languages: [language],
          cacheable: true
        },
        {
          name: `pages-${language}`,
          type: 'page',
          size: 150,
          gzipSize: 45,
          dependencies: [`translations-${language}`],
          routes: [`/${language}/*`],
          languages: [language],
          cacheable: true
        },
        {
          name: `components-i18n-${language}`,
          type: 'component',
          size: 80,
          gzipSize: 24,
          dependencies: [`translations-${language}`],
          routes: [`/${language}/*`],
          languages: [language],
          cacheable: true
        }
      ]
    }
  }

  /**
   * Estimer la taille des traductions
   */
  private estimateTranslationSize(language: SupportedLocale): number {
    // Estimation basée sur le nombre de clés de traduction
    const estimatedKeys = 500
    const avgKeySize = language === 'de' ? 25 : 20 // Allemand plus verbeux
    return estimatedKeys * avgKeySize / 1024 // KB
  }

  /**
   * Générer stratégie de loading pour une page
   */
  generateLoadingStrategy(config: {
    route: string
    language: SupportedLocale
    userConnection?: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi'
    deviceMemory?: number
  }): LoadingStrategy {
    const { route, language, userConnection = '4g', deviceMemory = 4 } = config

    const strategy: LoadingStrategy = {
      immediate: [],
      lazy: [],
      preload: [],
      prefetch: []
    }

    // Ressources critiques toujours en immediate
    strategy.immediate.push(
      'runtime',
      'framework',
      'main',
      `translations-${language}`,
      `pages-${this.getPageChunkName(route)}`
    )

    // Adaptation selon la connexion
    if (userConnection === 'slow-2g' || userConnection === '2g') {
      // Connexion lente : minimal loading
      strategy.lazy.push(
        'components-secondary',
        'utils-advanced',
        'analytics'
      )
    } else if (userConnection === '4g' || userConnection === 'wifi') {
      // Connexion rapide : preload agressif
      strategy.preload.push(
        `components-i18n-${language}`,
        'search-components',
        'form-components'
      )
      
      strategy.prefetch.push(
        ...this.getPrefetchCandidates(route, language)
      )
    }

    // Adaptation selon la mémoire
    if (deviceMemory < 1) {
      // Mémoire faible : lazy loading agressif
      strategy.lazy.push(...strategy.preload)
      strategy.preload = []
      strategy.prefetch = []
    }

    return strategy
  }

  /**
   * Générer configuration Webpack pour Next.js
   */
  generateWebpackConfig(): any {
    return {
      optimization: {
        splitChunks: {
          cacheGroups: {
            // Vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              enforce: true
            },
            
            // Traductions par langue
            translations: {
              test: /[\\/]translations[\\/]/,
              name(module: any) {
                const language = this.extractLanguageFromPath(module.resource)
                return `translations-${language || 'common'}`
              },
              chunks: 'all',
              priority: 20,
              enforce: true
            },
            
            // Composants i18n
            i18nComponents: {
              test: /[\\/](components|hooks)[\\/].*i18n/,
              name: 'i18n-components',
              chunks: 'all',
              priority: 15,
              enforce: true
            },
            
            // Pages par langue
            pages: {
              test: /[\\/]app[\\/]\[lang\][\\/]/,
              name(module: any) {
                const pageName = this.extractPageName(module.resource)
                return `page-${pageName}`
              },
              chunks: 'all',
              priority: 12,
              minSize: 20000
            },
            
            // Utilitaires communs
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true
            }
          }
        }
      }
    }
  }

  /**
   * Créer composant de lazy loading intelligent
   */
  createLazyComponent(componentPath: string, options?: {
    fallback?: React.ComponentType
    preload?: boolean
    prefetch?: boolean
    language?: SupportedLocale
  }): string {
    const { fallback, preload, prefetch, language } = options || {}
    
    return `
import { lazy, Suspense } from 'react'
import { useI18n } from '@/src/lib/i18n/context'
import LoadingSpinner from '@/src/components/ui/LoadingSpinner'

// Lazy loading avec condition de langue
const LazyComponent = lazy(async () => {
  const { currentLanguage } = useI18n()
  
  // Précharger les traductions si nécessaire
  ${language ? `
  if (currentLanguage === '${language}') {
    await import('@/src/lib/i18n/translations/${language}')
  }
  ` : ''}
  
  return import('${componentPath}')
})

${preload ? `
// Précharger le composant
if (typeof window !== 'undefined') {
  import('${componentPath}')
}
` : ''}

${prefetch ? `
// Prefetch pour navigation future
if (typeof window !== 'undefined') {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'script'
  link.href = '${componentPath}'
  document.head.appendChild(link)
}
` : ''}

export default function Component(props) {
  return (
    <Suspense fallback={<${fallback ? 'CustomFallback' : 'LoadingSpinner size="md"'} />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}
    `.trim()
  }

  /**
   * Analyser les performances des bundles
   */
  analyzeBundlePerformance(): {
    summary: {
      totalSize: number
      gzipSize: number
      chunkCount: number
      budgetStatus: 'pass' | 'warning' | 'fail'
    }
    byLanguage: Record<SupportedLocale, BundleConfig>
    violations: Array<{
      type: 'size' | 'dependency' | 'loading'
      severity: 'error' | 'warning'
      message: string
      suggestion: string
    }>
    recommendations: string[]
  } {
    const violations: Array<{
      type: 'size' | 'dependency' | 'loading'
      severity: 'error' | 'warning'
      message: string
      suggestion: string
    }> = []
    
    const recommendations: string[] = []
    let totalSize = 0
    let totalGzipSize = 0
    let totalChunks = 0

    // Analyser chaque langue
    for (const [language, config] of this.bundleConfigs) {
      config.totalSize = config.chunks.reduce((sum, chunk) => sum + chunk.size, 0)
      config.gzipSize = config.chunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0)
      
      totalSize += config.totalSize
      totalGzipSize += config.gzipSize
      totalChunks += config.chunks.length

      // Vérifier les violations de budget
      if (config.totalSize > this.performanceBudget.maxTotalSize) {
        violations.push({
          type: 'size',
          severity: 'error',
          message: `Bundle ${language} trop volumineux: ${config.totalSize}KB > ${this.performanceBudget.maxTotalSize}KB`,
          suggestion: 'Optimiser le code splitting ou réduire les dépendances'
        })
      }

      // Vérifier les chunks individuels
      config.chunks.forEach(chunk => {
        if (chunk.size > this.performanceBudget.maxChunkSize) {
          violations.push({
            type: 'size',
            severity: 'warning',
            message: `Chunk ${chunk.name} trop volumineux: ${chunk.size}KB`,
            suggestion: 'Diviser le chunk en plus petites parties'
          })
        }
      })
    }

    // Recommandations générales
    if (totalSize > this.performanceBudget.maxTotalSize * 7) { // 7 langues
      recommendations.push('Implémenter un lazy loading plus agressif des langues')
    }
    
    if (violations.length > 0) {
      recommendations.push('Optimiser les bundles selon les violations détectées')
    }
    
    recommendations.push('Monitorer les métriques Core Web Vitals')
    recommendations.push('Configurer service worker pour cache stratégique')

    const budgetStatus = violations.some(v => v.severity === 'error') 
      ? 'fail' 
      : violations.length > 0 
        ? 'warning' 
        : 'pass'

    return {
      summary: {
        totalSize,
        gzipSize: totalGzipSize,
        chunkCount: totalChunks,
        budgetStatus
      },
      byLanguage: Object.fromEntries(this.bundleConfigs),
      violations,
      recommendations
    }
  }

  /**
   * Générer script de monitoring bundle
   */
  generateBundleMonitoringScript(): string {
    return `
// Bundle Performance Monitor
class BundleMonitor {
  constructor() {
    this.metrics = []
    this.observer = new PerformanceObserver(this.handlePerformanceEntry.bind(this))
    this.observer.observe({ entryTypes: ['resource', 'navigation'] })
  }

  handlePerformanceEntry(list) {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('/_next/static/chunks/')) {
        this.trackChunkLoad(entry)
      }
    }
  }

  trackChunkLoad(entry) {
    const metric = {
      name: this.extractChunkName(entry.name),
      size: entry.transferSize,
      loadTime: entry.responseEnd - entry.responseStart,
      timestamp: entry.responseEnd,
      cached: entry.transferSize === 0
    }
    
    this.metrics.push(metric)
    this.sendMetric(metric)
  }

  extractChunkName(url) {
    const match = url.match(/chunks\\/(.+?)\\./);
    return match ? match[1] : 'unknown'
  }

  sendMetric(metric) {
    // Envoyer vers système de monitoring
    if (window.gtag) {
      window.gtag('event', 'bundle_load', {
        chunk_name: metric.name,
        load_time: metric.loadTime,
        size: metric.size,
        cached: metric.cached
      })
    }
  }

  getReport() {
    const totalSize = this.metrics.reduce((sum, m) => sum + m.size, 0)
    const avgLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.length
    const cacheHitRate = this.metrics.filter(m => m.cached).length / this.metrics.length

    return {
      totalBundleSize: totalSize,
      averageLoadTime: avgLoadTime,
      cacheHitRate,
      chunkCount: this.metrics.length,
      timestamp: new Date()
    }
  }
}

// Initialiser le monitoring
const bundleMonitor = new BundleMonitor()

// Exposer globalement pour debug
window.__BUNDLE_MONITOR__ = bundleMonitor
    `.trim()
  }

  // Méthodes utilitaires privées
  private getPageChunkName(route: string): string {
    return route.replace(/^\/[a-z]{2}\//, '').replace(/\//g, '-') || 'home'
  }

  private getPrefetchCandidates(route: string, language: SupportedLocale): string[] {
    const candidates: string[] = []
    
    // Prefetch selon la page actuelle
    if (route.includes('tools')) {
      candidates.push('tool-detail-components', 'category-components')
    }
    
    if (route === `/${language}` || route === '/') {
      candidates.push('search-components', 'featured-tools')
    }
    
    return candidates
  }

  private extractLanguageFromPath(path: string): string | null {
    const match = path.match(/translations[\\/]([a-z]{2})[\\/]/)
    return match ? match[1] : null
  }

  private extractPageName(path: string): string {
    const match = path.match(/\[lang\][\\/](.+?)[\\/]/)
    return match ? match[1].replace(/[\\/]/g, '-') : 'unknown'
  }
}

/**
 * Instance singleton
 */
export const bundleOptimizer = new BundleOptimizer()

/**
 * Hook React pour bundle optimization
 */
export function useBundleOptimization() {
  return {
    generateLoadingStrategy: (config: Parameters<typeof bundleOptimizer.generateLoadingStrategy>[0]) =>
      bundleOptimizer.generateLoadingStrategy(config),
    
    analyzeBundlePerformance: () =>
      bundleOptimizer.analyzeBundlePerformance(),
    
    createLazyComponent: (componentPath: string, options?: Parameters<typeof bundleOptimizer.createLazyComponent>[1]) =>
      bundleOptimizer.createLazyComponent(componentPath, options)
  }
}