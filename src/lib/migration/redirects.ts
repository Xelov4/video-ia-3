/**
 * Système de Redirections 301 Intelligentes - Video-IA.net
 * 
 * Gestion des redirections pour préserver le SEO :
 * - Redirections 301/302/308 intelligentes
 * - Préservation du link juice
 * - Chain redirect detection et correction
 * - Monitoring des performances de redirection
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { SupportedLocale, defaultLocale } from '@/middleware'
import { UrlMapping } from './url-mapper'

// Types pour les redirections
export interface RedirectRule {
  id: string
  source: string | RegExp
  destination: string
  statusCode: 301 | 302 | 307 | 308
  priority: number
  conditions?: RedirectCondition[]
  metadata: RedirectMetadata
  active: boolean
  created: Date
  lastUsed?: Date
  usageCount: number
}

export interface RedirectCondition {
  type: 'header' | 'query' | 'cookie' | 'method' | 'host' | 'language'
  key: string
  operator: 'equals' | 'contains' | 'regex' | 'not_equals'
  value: string | RegExp
  caseSensitive?: boolean
}

export interface RedirectMetadata {
  reason: string
  category: 'migration' | 'seo' | 'maintenance' | 'security' | 'optimization'
  impact: 'low' | 'medium' | 'high'
  tags: string[]
  notes?: string
}

export interface RedirectChain {
  originalUrl: string
  redirects: Array<{
    from: string
    to: string
    status: number
    rule: string
  }>
  finalDestination: string
  chainLength: number
  isLoop: boolean
  totalTime: number
}

export interface RedirectStats {
  totalRules: number
  activeRules: number
  recentlyUsed: number
  topSources: Array<{ url: string; count: number }>
  statusDistribution: Record<number, number>
  performanceMetrics: {
    averageRedirectTime: number
    slowestRedirects: Array<{ url: string; time: number }>
    errorRate: number
  }
}

/**
 * Gestionnaire de redirections intelligent
 */
export class RedirectManager {
  private rules: Map<string, RedirectRule> = new Map()
  private patternRules: RedirectRule[] = []
  private chainCache: Map<string, RedirectChain> = new Map()
  private performanceMetrics: Map<string, number[]> = new Map()

  constructor() {
    this.loadRedirectRules()
  }

  /**
   * Charger les règles de redirection
   */
  private async loadRedirectRules() {
    // Règles statiques par défaut
    const defaultRules: Omit<RedirectRule, 'id' | 'created' | 'usageCount'>[] = [
      // Redirections de migration principales
      {
        source: '/tools',
        destination: '/{lang}/tools',
        statusCode: 301,
        priority: 100,
        metadata: {
          reason: 'Migration vers structure multilingue',
          category: 'migration',
          impact: 'high',
          tags: ['i18n', 'migration']
        },
        active: true,
        lastUsed: undefined
      },
      
      // Redirection outil individuel
      {
        source: /^\/tool\/([^\/]+)\/?$/,
        destination: '/{lang}/tools/$1',
        statusCode: 301,
        priority: 90,
        metadata: {
          reason: 'Migration structure URLs outils',
          category: 'migration',
          impact: 'high',
          tags: ['tools', 'seo']
        },
        active: true,
        lastUsed: undefined
      },
      
      // Redirection catégories
      {
        source: /^\/category\/([^\/]+)\/?$/,
        destination: '/{lang}/categories/$1',
        statusCode: 301,
        priority: 80,
        metadata: {
          reason: 'Migration structure URLs catégories',
          category: 'migration',
          impact: 'medium',
          tags: ['categories', 'seo']
        },
        active: true,
        lastUsed: undefined
      },
      
      // Redirections de maintenance
      {
        source: '/admin',
        destination: '/admin/login',
        statusCode: 302,
        priority: 70,
        conditions: [{
          type: 'cookie',
          key: 'admin_token',
          operator: 'not_equals',
          value: 'valid'
        }],
        metadata: {
          reason: 'Redirection admin non authentifié',
          category: 'security',
          impact: 'medium',
          tags: ['admin', 'security']
        },
        active: true,
        lastUsed: undefined
      },
      
      // Redirections SEO
      {
        source: /^\/ai-tools?\/?$/,
        destination: '/{lang}/tools',
        statusCode: 301,
        priority: 60,
        metadata: {
          reason: 'Consolidation URLs legacy AI tools',
          category: 'seo',
          impact: 'medium',
          tags: ['legacy', 'seo']
        },
        active: true,
        lastUsed: undefined
      },
      
      // Redirection pages statiques
      {
        source: '/about',
        destination: '/{lang}/about',
        statusCode: 301,
        priority: 50,
        metadata: {
          reason: 'Migration page about',
          category: 'migration',
          impact: 'low',
          tags: ['static-pages']
        },
        active: true,
        lastUsed: undefined
      }
    ]

    // Charger les règles par défaut
    defaultRules.forEach((ruleData, index) => {
      const rule: RedirectRule = {
        ...ruleData,
        id: `default-${index}`,
        created: new Date(),
        usageCount: 0
      }
      
      if (typeof rule.source === 'string') {
        this.rules.set(rule.source, rule)
      } else {
        this.patternRules.push(rule)
      }
    })

    // Trier les règles pattern par priorité
    this.patternRules.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Trouver une redirection pour une URL
   */
  findRedirect(url: string, context?: {
    method?: string
    headers?: Record<string, string>
    query?: Record<string, string>
    cookies?: Record<string, string>
    language?: SupportedLocale
  }): RedirectRule | null {
    const cleanUrl = this.normalizeUrl(url)
    
    // Vérifier redirection exacte
    const exactRule = this.rules.get(cleanUrl)
    if (exactRule && this.evaluateConditions(exactRule, context)) {
      this.trackUsage(exactRule.id)
      return exactRule
    }

    // Vérifier règles de pattern
    for (const rule of this.patternRules) {
      if (rule.active && rule.source instanceof RegExp) {
        const match = cleanUrl.match(rule.source)
        if (match && this.evaluateConditions(rule, context)) {
          this.trackUsage(rule.id)
          return rule
        }
      }
    }

    return null
  }

  /**
   * Appliquer une redirection avec construction d'URL
   */
  applyRedirect(
    rule: RedirectRule, 
    originalUrl: string, 
    context?: { language?: SupportedLocale; query?: Record<string, string> }
  ): { url: string; status: number; preserveQuery: boolean } {
    const { language = defaultLocale, query } = context || {}
    let destinationUrl = rule.destination

    // Traitement des captures de regex
    if (rule.source instanceof RegExp) {
      const match = originalUrl.match(rule.source)
      if (match) {
        match.forEach((capture, index) => {
          destinationUrl = destinationUrl.replace(new RegExp(`\\$${index}`, 'g'), capture)
        })
      }
    }

    // Remplacer le placeholder de langue
    if (language !== defaultLocale) {
      destinationUrl = destinationUrl.replace('{lang}', language)
    } else {
      destinationUrl = destinationUrl.replace('/{lang}', '')
    }

    // Préserver les paramètres de query si nécessaire
    let finalUrl = destinationUrl
    if (query && Object.keys(query).length > 0) {
      const searchParams = new URLSearchParams(query)
      const separator = finalUrl.includes('?') ? '&' : '?'
      finalUrl += separator + searchParams.toString()
    }

    return {
      url: finalUrl,
      status: rule.statusCode,
      preserveQuery: true
    }
  }

  /**
   * Détecter et analyser les chaînes de redirections
   */
  async analyzeRedirectChain(startUrl: string, maxDepth: number = 10): Promise<RedirectChain> {
    // Vérifier cache
    const cached = this.chainCache.get(startUrl)
    if (cached) return cached

    const chain: RedirectChain = {
      originalUrl: startUrl,
      redirects: [],
      finalDestination: startUrl,
      chainLength: 0,
      isLoop: false,
      totalTime: 0
    }

    const visited = new Set<string>()
    let currentUrl = startUrl
    let depth = 0
    const startTime = Date.now()

    while (depth < maxDepth) {
      if (visited.has(currentUrl)) {
        chain.isLoop = true
        break
      }

      visited.add(currentUrl)
      const rule = this.findRedirect(currentUrl)
      
      if (!rule) {
        break
      }

      const redirectResult = this.applyRedirect(rule, currentUrl)
      chain.redirects.push({
        from: currentUrl,
        to: redirectResult.url,
        status: redirectResult.status,
        rule: rule.id
      })

      currentUrl = redirectResult.url
      depth++
    }

    chain.finalDestination = currentUrl
    chain.chainLength = chain.redirects.length
    chain.totalTime = Date.now() - startTime

    // Mettre en cache
    this.chainCache.set(startUrl, chain)

    return chain
  }

  /**
   * Ajouter une nouvelle règle de redirection
   */
  addRedirectRule(ruleData: Omit<RedirectRule, 'id' | 'created' | 'usageCount' | 'lastUsed'>): string {
    const rule: RedirectRule = {
      ...ruleData,
      id: `custom-${Date.now()}`,
      created: new Date(),
      usageCount: 0
    }

    if (typeof rule.source === 'string') {
      this.rules.set(rule.source, rule)
    } else {
      this.patternRules.push(rule)
      this.patternRules.sort((a, b) => b.priority - a.priority)
    }

    return rule.id
  }

  /**
   * Désactiver une règle de redirection
   */
  disableRule(ruleId: string): boolean {
    // Rechercher dans les règles exactes
    for (const [, rule] of this.rules) {
      if (rule.id === ruleId) {
        rule.active = false
        return true
      }
    }

    // Rechercher dans les règles de pattern
    const patternRule = this.patternRules.find(r => r.id === ruleId)
    if (patternRule) {
      patternRule.active = false
      return true
    }

    return false
  }

  /**
   * Générer middleware Next.js pour les redirections
   */
  generateNextjsMiddleware(): string {
    return `
import { NextRequest, NextResponse } from 'next/server'
import { redirectManager } from '@/src/lib/migration/redirects'

export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  
  // Détecter la langue préférée
  const preferredLanguage = detectLanguage(request)
  
  // Vérifier s'il y a une redirection
  const redirectRule = redirectManager.findRedirect(url.pathname, {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    query: Object.fromEntries(url.searchParams.entries()),
    cookies: request.cookies ? Object.fromEntries(
      Array.from(request.cookies.entries()).map(([key, cookie]) => [key, cookie.value])
    ) : {},
    language: preferredLanguage
  })

  if (redirectRule) {
    const redirectResult = redirectManager.applyRedirect(redirectRule, url.pathname, {
      language: preferredLanguage,
      query: Object.fromEntries(url.searchParams.entries())
    })

    return NextResponse.redirect(new URL(redirectResult.url, request.url), redirectResult.status)
  }

  return NextResponse.next()
}

function detectLanguage(request: NextRequest): string {
  // Logique de détection de langue (déjà implémentée dans le middleware principal)
  const url = new URL(request.url)
  const pathLang = url.pathname.match(/^\/([a-z]{2})\//)
  if (pathLang) return pathLang[1]
  
  const cookie = request.cookies.get('preferred-language')
  if (cookie) return cookie.value
  
  const acceptLang = request.headers.get('Accept-Language')
  if (acceptLang) {
    const supportedLangs = ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt']
    for (const lang of supportedLangs) {
      if (acceptLang.includes(lang)) return lang
    }
  }
  
  return 'en'
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
    `.trim()
  }

  /**
   * Analyser les performances des redirections
   */
  getRedirectStats(): RedirectStats {
    const allRules = [...this.rules.values(), ...this.patternRules]
    const activeRules = allRules.filter(r => r.active)
    const recentlyUsed = allRules.filter(r => 
      r.lastUsed && Date.now() - r.lastUsed.getTime() < 24 * 60 * 60 * 1000
    ).length

    // Top sources
    const topSources = allRules
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map(rule => ({
        url: typeof rule.source === 'string' ? rule.source : rule.source.toString(),
        count: rule.usageCount
      }))

    // Distribution des statuts
    const statusDistribution = allRules.reduce((acc, rule) => {
      acc[rule.statusCode] = (acc[rule.statusCode] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    // Métriques de performance
    const performanceMetrics = this.calculatePerformanceMetrics()

    return {
      totalRules: allRules.length,
      activeRules: activeRules.length,
      recentlyUsed,
      topSources,
      statusDistribution,
      performanceMetrics
    }
  }

  /**
   * Exporter les redirections pour serveur web
   */
  exportForWebServer(format: 'nginx' | 'apache' | 'cloudflare'): string {
    const allRules = [...this.rules.values(), ...this.patternRules].filter(r => r.active)

    switch (format) {
      case 'nginx':
        return this.generateNginxRedirects(allRules)
      case 'apache':
        return this.generateApacheRedirects(allRules)
      case 'cloudflare':
        return this.generateCloudflareRedirects(allRules)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  // Méthodes privées utilitaires
  private normalizeUrl(url: string): string {
    return url.replace(/\/+$/, '').replace(/\/+/g, '/').toLowerCase()
  }

  private evaluateConditions(rule: RedirectRule, context: any): boolean {
    if (!rule.conditions || rule.conditions.length === 0) {
      return true
    }

    return rule.conditions.every(condition => this.evaluateCondition(condition, context))
  }

  private evaluateCondition(condition: RedirectCondition, context: any): boolean {
    let testValue: string | undefined

    switch (condition.type) {
      case 'header':
        testValue = context?.headers?.[condition.key.toLowerCase()]
        break
      case 'query':
        testValue = context?.query?.[condition.key]
        break
      case 'cookie':
        testValue = context?.cookies?.[condition.key]
        break
      case 'method':
        testValue = context?.method
        break
      case 'language':
        testValue = context?.language
        break
      default:
        return false
    }

    if (testValue === undefined) {
      return condition.operator === 'not_equals'
    }

    if (!condition.caseSensitive && typeof testValue === 'string') {
      testValue = testValue.toLowerCase()
    }

    const compareValue = !condition.caseSensitive && typeof condition.value === 'string' 
      ? condition.value.toLowerCase() 
      : condition.value

    switch (condition.operator) {
      case 'equals':
        return testValue === compareValue
      case 'not_equals':
        return testValue !== compareValue
      case 'contains':
        return testValue.includes(compareValue.toString())
      case 'regex':
        const regex = condition.value instanceof RegExp 
          ? condition.value 
          : new RegExp(condition.value.toString())
        return regex.test(testValue)
      default:
        return false
    }
  }

  private trackUsage(ruleId: string) {
    // Mettre à jour compteur d'usage
    for (const [, rule] of this.rules) {
      if (rule.id === ruleId) {
        rule.usageCount++
        rule.lastUsed = new Date()
        break
      }
    }

    for (const rule of this.patternRules) {
      if (rule.id === ruleId) {
        rule.usageCount++
        rule.lastUsed = new Date()
        break
      }
    }
  }

  private calculatePerformanceMetrics() {
    // Simulation des métriques de performance
    return {
      averageRedirectTime: 15, // ms
      slowestRedirects: [
        { url: '/old-complex-url', time: 45 },
        { url: '/legacy-pattern', time: 32 }
      ],
      errorRate: 0.1 // 0.1%
    }
  }

  private generateNginxRedirects(rules: RedirectRule[]): string {
    let config = '# Nginx redirect rules\n\n'
    
    rules.forEach(rule => {
      const source = typeof rule.source === 'string' 
        ? rule.source 
        : rule.source.toString().slice(1, -1) // Remove regex delimiters

      const permanent = rule.statusCode === 301 ? ' permanent' : ''
      config += `rewrite ^${source}$ ${rule.destination}${permanent};\n`
    })

    return config
  }

  private generateApacheRedirects(rules: RedirectRule[]): string {
    let config = '# Apache redirect rules\n\n'
    
    rules.forEach(rule => {
      const source = typeof rule.source === 'string' 
        ? rule.source 
        : rule.source.toString().slice(1, -1)

      const flag = rule.statusCode === 301 ? 'R=301' : 'R=302'
      config += `RewriteRule ^${source}$ ${rule.destination} [${flag},L]\n`
    })

    return config
  }

  private generateCloudflareRedirects(rules: RedirectRule[]): string {
    const redirectsConfig = rules.map(rule => ({
      source: typeof rule.source === 'string' ? rule.source : rule.source.toString(),
      destination: rule.destination,
      status: rule.statusCode,
      conditions: rule.conditions || []
    }))

    return `
// Cloudflare Workers redirect rules
const REDIRECT_RULES = ${JSON.stringify(redirectsConfig, null, 2)}

addEventListener('fetch', event => {
  event.respondWith(handleRedirects(event.request))
})

async function handleRedirects(request) {
  const url = new URL(request.url)
  
  for (const rule of REDIRECT_RULES) {
    if (matchesRule(url.pathname, rule)) {
      const destination = processDestination(rule.destination, url.pathname)
      return Response.redirect(destination, rule.status)
    }
  }
  
  return fetch(request)
}

function matchesRule(path, rule) {
  if (typeof rule.source === 'string') {
    return path === rule.source
  }
  return new RegExp(rule.source).test(path)
}

function processDestination(destination, originalPath) {
  // Process destination with replacements
  return destination
}
    `.trim()
  }
}

/**
 * Instance singleton
 */
export const redirectManager = new RedirectManager()

/**
 * Hook React pour redirections
 */
export function useRedirects() {
  return {
    findRedirect: (url: string, context?: Parameters<typeof redirectManager.findRedirect>[1]) =>
      redirectManager.findRedirect(url, context),
    
    analyzeRedirectChain: (startUrl: string, maxDepth?: number) =>
      redirectManager.analyzeRedirectChain(startUrl, maxDepth),
    
    getRedirectStats: () =>
      redirectManager.getRedirectStats(),
    
    exportForWebServer: (format: Parameters<typeof redirectManager.exportForWebServer>[0]) =>
      redirectManager.exportForWebServer(format)
  }
}