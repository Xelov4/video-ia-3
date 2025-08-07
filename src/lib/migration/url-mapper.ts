/**
 * Système de Mapping URLs Legacy - Video-IA.net
 * 
 * Mapping et migration des anciennes URLs vers le nouveau format multilingue :
 * - Détection automatique des patterns legacy
 * - Mapping intelligent vers nouvelles URLs
 * - Support des redirections 301/302
 * - Préservation du SEO juice
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { SupportedLocale, DEFAULT_LOCALE } from '@/middleware'

// Types pour le mapping d'URLs
export interface UrlMapping {
  legacyUrl: string
  newUrl: string
  status: 301 | 302 | 308
  language: SupportedLocale
  preserveQuery: boolean
  permanent: boolean
  reason: string
}

export interface MigrationRule {
  pattern: RegExp | string
  replacement: string | ((match: RegExpMatchArray) => string)
  languages: SupportedLocale[]
  priority: number
  conditions?: MigrationCondition[]
}

export interface MigrationCondition {
  type: 'header' | 'query' | 'cookie' | 'user-agent'
  key: string
  value: string | RegExp
  operator: 'equals' | 'contains' | 'matches'
}

export interface MigrationStats {
  totalMappings: number
  byLanguage: Record<SupportedLocale, number>
  byStatus: Record<number, number>
  successRate: number
  commonPatterns: Array<{
    pattern: string
    count: number
    examples: string[]
  }>
}

/**
 * Gestionnaire de mapping d'URLs legacy
 */
export class UrlMapper {
  private mappingRules: MigrationRule[]
  private urlMappings: Map<string, UrlMapping> = new Map()
  private patternCache: Map<string, string> = new Map()

  constructor() {
    this.mappingRules = this.initializeMappingRules()
    this.loadExistingMappings()
  }

  /**
   * Initialiser les règles de mapping
   */
  private initializeMappingRules(): MigrationRule[] {
    return [
      // Mapping pages principales
      {
        pattern: /^\/tools\/?$/,
        replacement: '/{lang}/tools',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        priority: 100
      },
      
      // Mapping outils individuels
      {
        pattern: /^\/tool\/([^\/]+)\/?$/,
        replacement: '/{lang}/tools/$1',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        priority: 90
      },
      
      // Mapping catégories (ancien format)
      {
        pattern: /^\/category\/([^\/]+)\/?$/,
        replacement: '/{lang}/categories/$1',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        priority: 80
      },
      
      // Mapping avec ID numérique
      {
        pattern: /^\/tools?\/(\d+)\/?$/,
        replacement: (match) => {
          // Logique pour convertir ID en slug
          const toolId = match[1]
          return this.convertIdToSlug(toolId)
        },
        languages: ['en'],
        priority: 70
      },
      
      // Mapping pages legacy
      {
        pattern: /^\/ai-tools\/?$/,
        replacement: '/{lang}/tools',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        priority: 60
      },
      
      // Mapping recherche
      {
        pattern: /^\/search\/?$/,
        replacement: '/{lang}/search',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        priority: 50
      },
      
      // Mapping blog/articles
      {
        pattern: /^\/blog\/([^\/]+)\/?$/,
        replacement: '/{lang}/blog/$1',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        priority: 40
      },
      
      // Mapping tags
      {
        pattern: /^\/tag\/([^\/]+)\/?$/,
        replacement: '/{lang}/tags/$1',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        priority: 30
      },
      
      // Mapping API legacy
      {
        pattern: /^\/api\/v1\/(.+)$/,
        replacement: '/api/v2/$1',
        languages: ['en'],
        priority: 20
      },
      
      // Mapping pages statiques
      {
        pattern: /^\/about\/?$/,
        replacement: '/{lang}/about',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        priority: 10
      },
      
      {
        pattern: /^\/contact\/?$/,
        replacement: '/{lang}/contact',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        priority: 10
      },
      
      {
        pattern: /^\/privacy\/?$/,
        replacement: '/{lang}/privacy',
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        priority: 10
      }
    ]
  }

  /**
   * Charger les mappings existants depuis la base de données
   */
  private async loadExistingMappings() {
    // Simulation - en production, charger depuis la DB
    const existingMappings = [
      {
        legacyUrl: '/tool/chatgpt',
        newUrl: '/en/tools/chatgpt',
        status: 301 as const,
        language: 'en' as const,
        preserveQuery: true,
        permanent: true,
        reason: 'URL structure migration'
      },
      {
        legacyUrl: '/category/video-generation',
        newUrl: '/en/categories/video-generation',
        status: 301 as const,
        language: 'en' as const,
        preserveQuery: true,
        permanent: true,
        reason: 'Category URL migration'
      }
    ]

    existingMappings.forEach(mapping => {
      this.urlMappings.set(mapping.legacyUrl, mapping)
    })
  }

  /**
   * Mapper une URL legacy vers le nouveau format
   */
  mapUrl(legacyUrl: string, context?: {
    language?: SupportedLocale
    userAgent?: string
    headers?: Record<string, string>
    query?: Record<string, string>
  }): UrlMapping | null {
    const { language = DEFAULT_LOCALE, userAgent, headers, query } = context || {}

    // Vérifier cache direct
    const cachedMapping = this.urlMappings.get(legacyUrl)
    if (cachedMapping) {
      return cachedMapping
    }

    // Nettoyer l'URL
    const cleanUrl = this.normalizeUrl(legacyUrl)
    const cachedCleanMapping = this.urlMappings.get(cleanUrl)
    if (cachedCleanMapping) {
      return cachedCleanMapping
    }

    // Appliquer les règles de mapping
    for (const rule of this.mappingRules.sort((a, b) => b.priority - a.priority)) {
      const mapping = this.applyRule(cleanUrl, rule, language, { userAgent, headers, query })
      if (mapping) {
        // Mettre en cache
        this.urlMappings.set(legacyUrl, mapping)
        if (cleanUrl !== legacyUrl) {
          this.urlMappings.set(cleanUrl, mapping)
        }
        return mapping
      }
    }

    return null
  }

  /**
   * Appliquer une règle de mapping
   */
  private applyRule(
    url: string,
    rule: MigrationRule,
    language: SupportedLocale,
    context: { userAgent?: string; headers?: Record<string, string>; query?: Record<string, string> }
  ): UrlMapping | null {
    const { pattern, replacement, languages, conditions } = rule

    // Vérifier si la langue est supportée par cette règle
    if (!languages.includes(language)) {
      return null
    }

    // Vérifier les conditions additionnelles
    if (conditions && !this.checkConditions(conditions, context)) {
      return null
    }

    // Appliquer le pattern
    let match: RegExpMatchArray | null = null
    if (pattern instanceof RegExp) {
      match = url.match(pattern)
    } else {
      if (url === pattern) {
        match = [url]
      }
    }

    if (!match) {
      return null
    }

    // Générer la nouvelle URL
    let newUrl: string
    if (typeof replacement === 'function') {
      newUrl = replacement(match)
    } else {
      newUrl = replacement
      // Remplacer les captures du pattern
      match.forEach((capture, index) => {
        newUrl = newUrl.replace(new RegExp(`\\$${index}`, 'g'), capture)
      })
    }

    // Remplacer le placeholder {lang}
    if (language !== DEFAULT_LOCALE) {
      newUrl = newUrl.replace('{lang}', language)
    } else {
      newUrl = newUrl.replace('/{lang}', '')
    }

    // Déterminer le type de redirection
    const status = this.determineRedirectStatus(rule, url)
    const permanent = status === 301 || status === 308

    return {
      legacyUrl: url,
      newUrl,
      status,
      language,
      preserveQuery: true,
      permanent,
      reason: `Pattern mapping: ${pattern.toString()}`
    }
  }

  /**
   * Vérifier les conditions de mapping
   */
  private checkConditions(
    conditions: MigrationCondition[],
    context: { userAgent?: string; headers?: Record<string, string>; query?: Record<string, string> }
  ): boolean {
    return conditions.every(condition => {
      const { type, key, value, operator } = condition
      let testValue: string | undefined

      switch (type) {
        case 'header':
          testValue = context.headers?.[key.toLowerCase()]
          break
        case 'user-agent':
          testValue = context.userAgent
          break
        case 'query':
          testValue = context.query?.[key]
          break
        default:
          return false
      }

      if (!testValue) {
        return false
      }

      switch (operator) {
        case 'equals':
          return testValue === value
        case 'contains':
          return testValue.includes(value.toString())
        case 'matches':
          if (value instanceof RegExp) {
            return value.test(testValue)
          }
          return new RegExp(value.toString()).test(testValue)
        default:
          return false
      }
    })
  }

  /**
   * Générer des mappings en masse depuis une liste d'URLs
   */
  async generateBulkMappings(urls: string[]): Promise<{
    mappings: UrlMapping[]
    unmappedUrls: string[]
    statistics: MigrationStats
  }> {
    const mappings: UrlMapping[] = []
    const unmappedUrls: string[] = []
    const stats: MigrationStats = {
      totalMappings: 0,
      byLanguage: {} as Record<SupportedLocale, number>,
      byStatus: {},
      successRate: 0,
      commonPatterns: []
    }

    // Traitement par batch pour optimiser les performances
    const batchSize = 100
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      
      for (const url of batch) {
        const mapping = this.mapUrl(url)
        if (mapping) {
          mappings.push(mapping)
          
          // Statistiques
          stats.byLanguage[mapping.language] = (stats.byLanguage[mapping.language] || 0) + 1
          stats.byStatus[mapping.status] = (stats.byStatus[mapping.status] || 0) + 1
        } else {
          unmappedUrls.push(url)
        }
      }
    }

    stats.totalMappings = mappings.length
    stats.successRate = (mappings.length / urls.length) * 100
    stats.commonPatterns = this.analyzePatterns(mappings)

    return { mappings, unmappedUrls, statistics: stats }
  }

  /**
   * Exporter les mappings pour configuration serveur
   */
  exportServerConfig(format: 'nginx' | 'apache' | 'nextjs' | 'cloudflare'): string {
    const mappings = Array.from(this.urlMappings.values())

    switch (format) {
      case 'nginx':
        return this.generateNginxConfig(mappings)
      case 'apache':
        return this.generateApacheConfig(mappings)
      case 'nextjs':
        return this.generateNextjsConfig(mappings)
      case 'cloudflare':
        return this.generateCloudflareConfig(mappings)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Générer configuration Next.js
   */
  private generateNextjsConfig(mappings: UrlMapping[]): string {
    const redirects = mappings.map(mapping => ({
      source: mapping.legacyUrl,
      destination: mapping.newUrl,
      permanent: mapping.permanent
    }))

    return `
// next.config.js - Redirects configuration
module.exports = {
  async redirects() {
    return ${JSON.stringify(redirects, null, 2)}
  }
}
    `.trim()
  }

  /**
   * Générer configuration Nginx
   */
  private generateNginxConfig(mappings: UrlMapping[]): string {
    let config = '# Nginx redirects configuration\n\n'
    
    mappings.forEach(mapping => {
      const status = mapping.permanent ? '301' : '302'
      config += `rewrite ^${this.escapeNginxRegex(mapping.legacyUrl)}$ ${mapping.newUrl} ${status};\n`
    })

    return config
  }

  /**
   * Générer configuration Apache
   */
  private generateApacheConfig(mappings: UrlMapping[]): string {
    let config = '# Apache .htaccess redirects\n\n'
    
    mappings.forEach(mapping => {
      const flag = mapping.permanent ? 'R=301' : 'R=302'
      config += `RewriteRule ^${this.escapeApacheRegex(mapping.legacyUrl)}$ ${mapping.newUrl} [${flag},L]\n`
    })

    return config
  }

  /**
   * Générer configuration Cloudflare Workers
   */
  private generateCloudflareConfig(mappings: UrlMapping[]): string {
    const mappingsObj = Object.fromEntries(
      mappings.map(m => [m.legacyUrl, { url: m.newUrl, status: m.status }])
    )

    return `
// Cloudflare Workers redirect configuration
const URL_MAPPINGS = ${JSON.stringify(mappingsObj, null, 2)}

addEventListener('fetch', event => {
  event.respondWith(handleRedirects(event.request))
})

async function handleRedirects(request) {
  const url = new URL(request.url)
  const mapping = URL_MAPPINGS[url.pathname]
  
  if (mapping) {
    return Response.redirect(mapping.url, mapping.status)
  }
  
  return fetch(request)
}
    `.trim()
  }

  // Méthodes utilitaires privées
  private normalizeUrl(url: string): string {
    return url
      .toLowerCase()
      .replace(/\/+$/, '') // Retirer trailing slashes
      .replace(/\/+/g, '/') // Normaliser multiple slashes
  }

  private convertIdToSlug(id: string): string {
    // Simulation - en production, requête DB pour convertir ID en slug
    const mockSlugs: Record<string, string> = {
      '1': 'chatgpt',
      '2': 'midjourney',
      '3': 'stable-diffusion'
    }
    return mockSlugs[id] || `tool-${id}`
  }

  private determineRedirectStatus(rule: MigrationRule, url: string): 301 | 302 | 308 {
    // Règles de priorité élevée → redirect permanent
    if (rule.priority >= 80) return 301
    
    // URLs avec ID → redirect permanent pour SEO
    if (url.includes('/tools/') && /\/\d+/.test(url)) return 301
    
    // Autres cas → redirect temporaire
    return 302
  }

  private analyzePatterns(mappings: UrlMapping[]): Array<{
    pattern: string
    count: number
    examples: string[]
  }> {
    const patterns: Map<string, { count: number; examples: string[] }> = new Map()

    mappings.forEach(mapping => {
      const pattern = this.extractPattern(mapping.legacyUrl)
      if (!patterns.has(pattern)) {
        patterns.set(pattern, { count: 0, examples: [] })
      }
      
      const data = patterns.get(pattern)!
      data.count++
      if (data.examples.length < 3) {
        data.examples.push(mapping.legacyUrl)
      }
    })

    return Array.from(patterns.entries())
      .map(([pattern, data]) => ({ pattern, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private extractPattern(url: string): string {
    return url
      .replace(/\/\d+/g, '/{id}')
      .replace(/\/[a-z]+-[a-z-]+/g, '/{slug}')
      .replace(/\?.*$/, '')
  }

  private escapeNginxRegex(pattern: string): string {
    return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  private escapeApacheRegex(pattern: string): string {
    return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

/**
 * Instance singleton
 */
export const urlMapper = new UrlMapper()

/**
 * Hook React pour URL mapping
 */
export function useUrlMapping() {
  return {
    mapUrl: (legacyUrl: string, context?: Parameters<typeof urlMapper.mapUrl>[1]) =>
      urlMapper.mapUrl(legacyUrl, context),
    
    generateBulkMappings: (urls: string[]) =>
      urlMapper.generateBulkMappings(urls),
    
    exportServerConfig: (format: Parameters<typeof urlMapper.exportServerConfig>[0]) =>
      urlMapper.exportServerConfig(format)
  }
}