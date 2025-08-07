/**
 * Système CDN et Distribution Globale - Video-IA.net
 * 
 * Optimisation performance multilingue avec distribution globale :
 * - Configuration CDN par région/langue
 * - Cache strategies intelligent
 * - Edge computing pour l'i18n
 * - Monitoring performance globale
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { SupportedLocale } from '@/middleware'

// Configuration des régions CDN
export interface CdnRegion {
  code: string
  name: string
  countries: string[]
  languages: SupportedLocale[]
  primaryLanguage: SupportedLocale
  endpoint: string
  cacheTtl: number
}

export interface CdnConfig {
  provider: 'cloudflare' | 'aws' | 'cloudfront' | 'fastly'
  regions: CdnRegion[]
  defaultRegion: string
  cacheRules: CacheRule[]
  purgeStrategy: 'immediate' | 'scheduled' | 'lazy'
}

export interface CacheRule {
  pattern: string | RegExp
  ttl: number
  conditions: string[]
  headers: Record<string, string>
  edgeRules?: string[]
}

export interface PerformanceMetrics {
  region: string
  language: SupportedLocale
  loadTime: number
  ttfb: number
  cls: number
  fid: number
  lcp: number
  cacheHitRate: number
  bandwidth: number
  timestamp: Date
}

/**
 * Gestionnaire CDN et performance globale
 */
export class CdnManager {
  private config: CdnConfig
  private metricsStore: PerformanceMetrics[] = []

  constructor() {
    this.config = this.generateCdnConfig()
  }

  /**
   * Générer configuration CDN optimale
   */
  private generateCdnConfig(): CdnConfig {
    return {
      provider: 'cloudflare',
      defaultRegion: 'us-east',
      purgeStrategy: 'immediate',
      regions: [
        {
          code: 'us-east',
          name: 'North America East',
          countries: ['US', 'CA'],
          languages: ['en'],
          primaryLanguage: 'en',
          endpoint: 'https://us-east.video-ia.net',
          cacheTtl: 3600
        },
        {
          code: 'eu-west',
          name: 'Europe West',
          countries: ['FR', 'DE', 'NL', 'BE'],
          languages: ['fr', 'de', 'nl'],
          primaryLanguage: 'fr',
          endpoint: 'https://eu-west.video-ia.net',
          cacheTtl: 3600
        },
        {
          code: 'eu-south',
          name: 'Europe South',
          countries: ['IT', 'ES', 'PT'],
          languages: ['it', 'es', 'pt'],
          primaryLanguage: 'es',
          endpoint: 'https://eu-south.video-ia.net',
          cacheTtl: 3600
        },
        {
          code: 'asia-pacific',
          name: 'Asia Pacific',
          countries: ['JP', 'KR', 'SG', 'AU'],
          languages: ['en'],
          primaryLanguage: 'en',
          endpoint: 'https://ap.video-ia.net',
          cacheTtl: 7200
        }
      ],
      cacheRules: [
        {
          pattern: /\.(js|css|woff2|woff)$/,
          ttl: 31536000, // 1 year
          conditions: ['static-assets'],
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Vary': 'Accept-Encoding'
          },
          edgeRules: ['compress', 'minify']
        },
        {
          pattern: /\.(jpg|jpeg|png|webp|avif|svg)$/,
          ttl: 604800, // 1 week
          conditions: ['images'],
          headers: {
            'Cache-Control': 'public, max-age=604800',
            'Vary': 'Accept, Accept-Encoding'
          },
          edgeRules: ['compress', 'webp-conversion', 'resize-responsive']
        },
        {
          pattern: '/api/tools',
          ttl: 300, // 5 minutes
          conditions: ['api-data'],
          headers: {
            'Cache-Control': 'public, max-age=300, s-maxage=600',
            'Vary': 'Accept-Language, Accept-Encoding'
          },
          edgeRules: ['language-cache']
        },
        {
          pattern: /^\/[a-z]{2}\/.*$/,
          ttl: 1800, // 30 minutes
          conditions: ['localized-pages'],
          headers: {
            'Cache-Control': 'public, max-age=1800, s-maxage=3600',
            'Vary': 'Accept-Language, Accept-Encoding'
          },
          edgeRules: ['language-detection', 'hreflang-injection']
        }
      ]
    }
  }

  /**
   * Détecter la région optimale pour un utilisateur
   */
  detectOptimalRegion(userLocation?: { country?: string; language?: SupportedLocale }): CdnRegion {
    if (!userLocation) {
      return this.config.regions.find(r => r.code === this.config.defaultRegion) || this.config.regions[0]
    }

    // Prioriser par pays
    if (userLocation.country) {
      const regionByCountry = this.config.regions.find(region => 
        region.countries.includes(userLocation.country!)
      )
      if (regionByCountry) return regionByCountry
    }

    // Prioriser par langue
    if (userLocation.language) {
      const regionByLanguage = this.config.regions.find(region =>
        region.languages.includes(userLocation.language!)
      )
      if (regionByLanguage) return regionByLanguage
    }

    // Fallback vers région par défaut
    return this.config.regions.find(r => r.code === this.config.defaultRegion) || this.config.regions[0]
  }

  /**
   * Générer URL CDN optimisée
   */
  generateCdnUrl(
    assetPath: string, 
    options?: {
      region?: string
      language?: SupportedLocale
      transformations?: string[]
    }
  ): string {
    const { region, language, transformations = [] } = options || {}

    // Déterminer la région
    let targetRegion: CdnRegion
    if (region) {
      targetRegion = this.config.regions.find(r => r.code === region) || this.config.regions[0]
    } else {
      targetRegion = this.detectOptimalRegion({ language })
    }

    // Construire l'URL de base
    let cdnUrl = `${targetRegion.endpoint}${assetPath.startsWith('/') ? '' : '/'}${assetPath}`

    // Ajouter transformations pour les images
    if (transformations.length > 0 && this.isImageAsset(assetPath)) {
      const params = new URLSearchParams()
      transformations.forEach(transform => {
        params.append('t', transform)
      })
      cdnUrl += `?${params.toString()}`
    }

    return cdnUrl
  }

  /**
   * Générer configuration Cloudflare Workers
   */
  generateCloudflareWorkerScript(): string {
    return `
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const userLanguage = detectLanguage(request)
  const userCountry = request.cf.country
  
  // Redirection intelligente selon la langue/région
  if (shouldRedirectForLanguage(url, userLanguage, userCountry)) {
    const redirectUrl = buildLocalizedUrl(url, userLanguage)
    return Response.redirect(redirectUrl, 302)
  }
  
  // Cache par langue avec edge-side includes
  const cacheKey = generateCacheKey(request, userLanguage)
  const cache = caches.default
  
  let response = await cache.match(cacheKey)
  if (!response) {
    response = await fetchFromOrigin(request)
    
    // Injection hreflang côté edge
    if (isHtmlResponse(response)) {
      response = await injectHreflangTags(response, url, userLanguage)
    }
    
    // Configuration cache selon les règles
    const cacheRule = getCacheRule(url.pathname)
    if (cacheRule) {
      response = new Response(response.body, {
        ...response,
        headers: {
          ...response.headers,
          ...cacheRule.headers
        }
      })
      
      event.waitUntil(cache.put(cacheKey, response.clone()))
    }
  }
  
  return response
}

function detectLanguage(request) {
  // Ordre de priorité : URL > Cookie > Accept-Language
  const url = new URL(request.url)
  const pathLang = url.pathname.match(/^\/([a-z]{2})\//)
  if (pathLang) return pathLang[1]
  
  const cookie = request.headers.get('Cookie')
  const langCookie = cookie?.match(/preferred-language=([a-z]{2})/)
  if (langCookie) return langCookie[1]
  
  const acceptLang = request.headers.get('Accept-Language')
  if (acceptLang) {
    const supportedLangs = ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt']
    for (const lang of supportedLangs) {
      if (acceptLang.includes(lang)) return lang
    }
  }
  
  return 'en'
}

function generateCacheKey(request, language) {
  const url = new URL(request.url)
  const device = request.headers.get('CF-Device-Type') || 'desktop'
  return \`\${url.pathname}_\${language}_\${device}\`
}

async function injectHreflangTags(response, url, currentLang) {
  const html = await response.text()
  const baseUrl = \`\${url.protocol}//\${url.hostname}\`
  
  const hreflangTags = [
    '<link rel="alternate" hreflang="en" href="' + baseUrl + url.pathname.replace(/^\/[a-z]{2}\//, '/') + '" />',
    '<link rel="alternate" hreflang="fr" href="' + baseUrl + '/fr' + url.pathname.replace(/^\/[a-z]{2}\//, '/') + '" />',
    '<link rel="alternate" hreflang="es" href="' + baseUrl + '/es' + url.pathname.replace(/^\/[a-z]{2}\//, '/') + '" />',
    '<link rel="alternate" hreflang="it" href="' + baseUrl + '/it' + url.pathname.replace(/^\/[a-z]{2}\//, '/') + '" />',
    '<link rel="alternate" hreflang="de" href="' + baseUrl + '/de' + url.pathname.replace(/^\/[a-z]{2}\//, '/') + '" />',
    '<link rel="alternate" hreflang="nl" href="' + baseUrl + '/nl' + url.pathname.replace(/^\/[a-z]{2}\//, '/') + '" />',
    '<link rel="alternate" hreflang="pt" href="' + baseUrl + '/pt' + url.pathname.replace(/^\/[a-z]{2}\//, '/') + '" />',
    '<link rel="alternate" hreflang="x-default" href="' + baseUrl + url.pathname.replace(/^\/[a-z]{2}\//, '/') + '" />'
  ].join('\\n  ')
  
  const modifiedHtml = html.replace('</head>', \`  \${hreflangTags}\\n</head>\`)
  
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  })
}
    `.trim()
  }

  /**
   * Optimiser les ressources statiques
   */
  optimizeStaticAssets(): {
    cssOptimization: string[]
    jsOptimization: string[]
    imageOptimization: string[]
  } {
    return {
      cssOptimization: [
        'minification',
        'critical-css-inlining',
        'unused-css-removal',
        'gzip-compression',
        'brotli-compression'
      ],
      jsOptimization: [
        'code-splitting-by-language',
        'tree-shaking',
        'minification',
        'bundle-analysis',
        'lazy-loading'
      ],
      imageOptimization: [
        'webp-conversion',
        'avif-support',
        'responsive-sizes',
        'lazy-loading',
        'placeholder-blur'
      ]
    }
  }

  /**
   * Mesurer les performances par région
   */
  async measurePerformance(
    region: string, 
    language: SupportedLocale, 
    testUrls: string[]
  ): Promise<PerformanceMetrics> {
    // Simulation des métriques de performance
    const baseLatency = this.getRegionBaseLatency(region)
    
    return {
      region,
      language,
      loadTime: baseLatency + Math.random() * 500,
      ttfb: baseLatency * 0.3,
      cls: Math.random() * 0.1,
      fid: Math.random() * 100,
      lcp: baseLatency + Math.random() * 1000,
      cacheHitRate: 0.85 + Math.random() * 0.1,
      bandwidth: 50 + Math.random() * 100, // Mbps
      timestamp: new Date()
    }
  }

  /**
   * Générer rapport de performance globale
   */
  generatePerformanceReport(): {
    globalMetrics: {
      averageLoadTime: number
      globalCacheHitRate: number
      worstPerformingRegions: string[]
      bestPerformingRegions: string[]
    }
    byRegion: Record<string, PerformanceMetrics[]>
    recommendations: string[]
  } {
    const byRegion = this.groupMetricsByRegion()
    
    const globalMetrics = {
      averageLoadTime: this.calculateAverageMetric('loadTime'),
      globalCacheHitRate: this.calculateAverageMetric('cacheHitRate'),
      worstPerformingRegions: this.getWorstPerformingRegions(3),
      bestPerformingRegions: this.getBestPerformingRegions(3)
    }

    const recommendations = this.generateRecommendations(globalMetrics, byRegion)

    return {
      globalMetrics,
      byRegion,
      recommendations
    }
  }

  /**
   * Configuration Next.js pour optimisation
   */
  generateNextJsConfig(): any {
    return {
      experimental: {
        optimizeCss: true,
        optimizeServerReact: true
      },
      compress: false, // Handled by CDN
      poweredByHeader: false,
      
      images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000, // 1 year
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      },

      async headers() {
        return [
          {
            source: '/api/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=300, s-maxage=600'
              },
              {
                key: 'Vary',
                value: 'Accept-Language, Accept-Encoding'
              }
            ]
          },
          {
            source: '/:path*',
            headers: [
              {
                key: 'X-DNS-Prefetch-Control',
                value: 'on'
              },
              {
                key: 'X-Frame-Options',
                value: 'SAMEORIGIN'
              },
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff'
              }
            ]
          }
        ]
      },

      async redirects() {
        return [
          // Legacy URL redirects will be handled by migration system
        ]
      },

      webpack: (config: any, { dev, isServer }: any) => {
        // Optimisations webpack
        if (!dev && !isServer) {
          config.optimization.splitChunks.cacheGroups = {
            ...config.optimization.splitChunks.cacheGroups,
            i18n: {
              name: 'i18n',
              test: /[\\/]i18n[\\/]/,
              chunks: 'all',
              enforce: true
            },
            translations: {
              name: 'translations',
              test: /[\\/]translations[\\/]/,
              chunks: 'all',
              enforce: true
            }
          }
        }
        
        return config
      }
    }
  }

  // Méthodes utilitaires privées
  private isImageAsset(path: string): boolean {
    return /\.(jpg|jpeg|png|webp|avif|svg)$/i.test(path)
  }

  private getRegionBaseLatency(region: string): number {
    const latencies: Record<string, number> = {
      'us-east': 50,
      'eu-west': 80,
      'eu-south': 90,
      'asia-pacific': 120
    }
    return latencies[region] || 100
  }

  private groupMetricsByRegion(): Record<string, PerformanceMetrics[]> {
    return this.metricsStore.reduce((acc, metric) => {
      if (!acc[metric.region]) acc[metric.region] = []
      acc[metric.region].push(metric)
      return acc
    }, {} as Record<string, PerformanceMetrics[]>)
  }

  private calculateAverageMetric(metricName: keyof PerformanceMetrics): number {
    if (this.metricsStore.length === 0) return 0
    
    const sum = this.metricsStore.reduce((acc, metric) => {
      const value = metric[metricName]
      return acc + (typeof value === 'number' ? value : 0)
    }, 0)
    
    return sum / this.metricsStore.length
  }

  private getWorstPerformingRegions(count: number): string[] {
    const byRegion = this.groupMetricsByRegion()
    
    return Object.entries(byRegion)
      .map(([region, metrics]) => ({
        region,
        avgLoadTime: metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length
      }))
      .sort((a, b) => b.avgLoadTime - a.avgLoadTime)
      .slice(0, count)
      .map(item => item.region)
  }

  private getBestPerformingRegions(count: number): string[] {
    const byRegion = this.groupMetricsByRegion()
    
    return Object.entries(byRegion)
      .map(([region, metrics]) => ({
        region,
        avgLoadTime: metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length
      }))
      .sort((a, b) => a.avgLoadTime - b.avgLoadTime)
      .slice(0, count)
      .map(item => item.region)
  }

  private generateRecommendations(globalMetrics: any, byRegion: any): string[] {
    const recommendations: string[] = []
    
    if (globalMetrics.averageLoadTime > 2000) {
      recommendations.push('Optimiser les temps de chargement globaux (>2s)')
    }
    
    if (globalMetrics.globalCacheHitRate < 0.8) {
      recommendations.push('Améliorer le taux de cache hit (<80%)')
    }
    
    if (globalMetrics.worstPerformingRegions.length > 0) {
      recommendations.push(`Optimiser les régions : ${globalMetrics.worstPerformingRegions.join(', ')}`)
    }
    
    return recommendations
  }
}

/**
 * Instance singleton
 */
export const cdnManager = new CdnManager()

/**
 * Hook React pour CDN et performance
 */
export function useCdn() {
  return {
    generateCdnUrl: (assetPath: string, options?: Parameters<typeof cdnManager.generateCdnUrl>[1]) =>
      cdnManager.generateCdnUrl(assetPath, options),
    
    detectOptimalRegion: (userLocation?: Parameters<typeof cdnManager.detectOptimalRegion>[0]) =>
      cdnManager.detectOptimalRegion(userLocation),
    
    measurePerformance: (region: string, language: SupportedLocale, testUrls: string[]) =>
      cdnManager.measurePerformance(region, language, testUrls),
    
    generatePerformanceReport: () =>
      cdnManager.generatePerformanceReport()
  }
}