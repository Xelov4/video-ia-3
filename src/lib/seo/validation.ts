/**
 * Système de Validation SEO et Google Search Console - Video-IA.net
 * 
 * Validation automatique et monitoring SEO multilingue :
 * - Validation hreflang Google Search Console
 * - Tests automatisés SEO par langue
 * - Monitoring des erreurs d'indexation
 * - Rapports de performance SEO
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { SupportedLocale } from '@/middleware'
import { HreflangLink } from './hreflang'

// Types pour la validation SEO
export interface SeoValidationResult {
  isValid: boolean
  score: number
  errors: SeoError[]
  warnings: SeoWarning[]
  recommendations: SeoRecommendation[]
  metrics: SeoMetrics
}

export interface SeoError {
  type: 'hreflang' | 'canonical' | 'meta' | 'structured_data' | 'performance'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  element?: string
  fix?: string
}

export interface SeoWarning {
  type: string
  message: string
  impact: 'high' | 'medium' | 'low'
  recommendation?: string
}

export interface SeoRecommendation {
  category: 'content' | 'technical' | 'mobile' | 'performance'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  implementation: string
}

export interface SeoMetrics {
  titleLength: number
  descriptionLength: number
  headingsCount: Record<string, number>
  imageCount: number
  imagesWithAlt: number
  internalLinks: number
  externalLinks: number
  pageSize: number
  loadTime?: number
  mobileScore?: number
  desktopScore?: number
}

export interface HreflangValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  recommendations: string[]
  crossValidation: Record<string, boolean>
}

/**
 * Classe principale pour la validation SEO
 */
export class SeoValidator {
  private baseUrl: string

  constructor() {
    this.baseUrl = this.detectBaseUrl()
  }

  private detectBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return 'https://video-ia.net'
  }

  /**
   * Valider complètement une page
   */
  async validatePage(config: {
    url: string
    language: SupportedLocale
    expectedTitle: string
    expectedDescription: string
    hreflangLinks?: HreflangLink[]
    checkContent?: boolean
  }): Promise<SeoValidationResult> {
    const { url, language, expectedTitle, expectedDescription, hreflangLinks, checkContent = true } = config

    const errors: SeoError[] = []
    const warnings: SeoWarning[] = []
    const recommendations: SeoRecommendation[] = []
    let metrics: SeoMetrics = {
      titleLength: 0,
      descriptionLength: 0,
      headingsCount: {},
      imageCount: 0,
      imagesWithAlt: 0,
      internalLinks: 0,
      externalLinks: 0,
      pageSize: 0
    }

    try {
      // Simuler la récupération de la page (en production, utiliser un vrai crawler)
      const pageData = await this.fetchPageData(url)
      metrics = this.calculateMetrics(pageData)

      // Validation du titre
      this.validateTitle(pageData.title, expectedTitle, errors, warnings)

      // Validation de la description
      this.validateDescription(pageData.description, expectedDescription, errors, warnings)

      // Validation hreflang
      if (hreflangLinks) {
        const hreflangValidation = await this.validateHreflangImplementation(hreflangLinks, url)
        if (!hreflangValidation.isValid) {
          errors.push(...hreflangValidation.errors.map(error => ({
            type: 'hreflang' as const,
            severity: 'high' as const,
            message: error,
            fix: 'Corriger les liens hreflang selon les spécifications Google'
          })))
        }
      }

      // Validation du contenu (si activée)
      if (checkContent) {
        this.validateContent(pageData, language, warnings, recommendations)
      }

      // Validation technique
      this.validateTechnical(pageData, errors, warnings, recommendations)

      // Calcul du score SEO
      const score = this.calculateSeoScore(errors, warnings, metrics)

      return {
        isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
        score,
        errors,
        warnings,
        recommendations,
        metrics
      }

    } catch (error) {
      errors.push({
        type: 'performance',
        severity: 'critical',
        message: `Failed to validate page: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fix: 'Vérifier que la page est accessible'
      })

      return {
        isValid: false,
        score: 0,
        errors,
        warnings,
        recommendations,
        metrics
      }
    }
  }

  /**
   * Valider l'implémentation hreflang
   */
  async validateHreflangImplementation(
    hreflangLinks: HreflangLink[],
    currentUrl: string
  ): Promise<HreflangValidation> {
    const errors: string[] = []
    const warnings: string[] = []
    const recommendations: string[] = []
    const crossValidation: Record<string, boolean> = {}

    // Validation basique des liens hreflang
    const hasXDefault = hreflangLinks.some(link => link.hreflang === 'x-default')
    if (!hasXDefault) {
      errors.push('Missing x-default hreflang link')
    }

    // Vérifier les doublons
    const hreflangs = hreflangLinks.map(link => link.hreflang)
    const uniqueHreflangs = new Set(hreflangs)
    if (hreflangs.length !== uniqueHreflangs.size) {
      errors.push('Duplicate hreflang values detected')
    }

    // Validation croisée (vérifier que chaque page référence bien les autres)
    for (const link of hreflangLinks) {
      if (link.href === currentUrl) continue

      try {
        // En production, faire un vrai appel HTTP
        const crossValidationResult = await this.validateCrossHreflang(link.href, currentUrl)
        crossValidation[link.hreflang] = crossValidationResult
        
        if (!crossValidationResult) {
          warnings.push(`Page ${link.href} ne référence pas correctement ${currentUrl}`)
        }
      } catch (error) {
        errors.push(`Cannot validate cross-reference for ${link.href}: ${error}`)
      }
    }

    // Recommandations
    if (warnings.length > 0) {
      recommendations.push('Vérifier que toutes les pages référencées implémentent correctement hreflang')
    }

    if (hreflangLinks.length < 3) {
      recommendations.push('Considérer ajouter plus de langues pour maximiser la portée internationale')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
      crossValidation
    }
  }

  /**
   * Simuler la récupération des données de page
   */
  private async fetchPageData(url: string): Promise<{
    title: string
    description: string
    content: string
    headings: Record<string, string[]>
    images: Array<{ src: string; alt?: string }>
    links: Array<{ href: string; text: string; internal: boolean }>
    hreflangLinks: HreflangLink[]
    canonicalUrl?: string
    pageSize: number
  }> {
    // Simulation - en production, utiliser un vrai crawler
    return {
      title: 'Page Title',
      description: 'Page description',
      content: 'Page content...',
      headings: {
        h1: ['Main Title'],
        h2: ['Section 1', 'Section 2'],
        h3: ['Subsection 1', 'Subsection 2']
      },
      images: [
        { src: '/image1.jpg', alt: 'Alt text 1' },
        { src: '/image2.jpg' }
      ],
      links: [
        { href: '/internal-link', text: 'Internal Link', internal: true },
        { href: 'https://external.com', text: 'External Link', internal: false }
      ],
      hreflangLinks: [],
      canonicalUrl: url,
      pageSize: 1024 * 50 // 50KB
    }
  }

  /**
   * Valider le titre
   */
  private validateTitle(title: string, expected: string, errors: SeoError[], warnings: SeoWarning[]) {
    if (!title) {
      errors.push({
        type: 'meta',
        severity: 'critical',
        message: 'Page title is missing',
        element: '<title>',
        fix: 'Add a descriptive title tag'
      })
      return
    }

    if (title.length < 30) {
      warnings.push({
        type: 'title_length',
        message: 'Title is too short (less than 30 characters)',
        impact: 'medium',
        recommendation: 'Expand title to 50-60 characters for better SEO'
      })
    }

    if (title.length > 60) {
      warnings.push({
        type: 'title_length',
        message: 'Title is too long (more than 60 characters)',
        impact: 'medium',
        recommendation: 'Shorten title to avoid truncation in search results'
      })
    }

    if (expected && title !== expected) {
      warnings.push({
        type: 'title_mismatch',
        message: 'Title does not match expected value',
        impact: 'low',
        recommendation: 'Ensure title matches planned content'
      })
    }
  }

  /**
   * Valider la description
   */
  private validateDescription(description: string, expected: string, errors: SeoError[], warnings: SeoWarning[]) {
    if (!description) {
      errors.push({
        type: 'meta',
        severity: 'high',
        message: 'Meta description is missing',
        element: '<meta name="description">',
        fix: 'Add a compelling meta description'
      })
      return
    }

    if (description.length < 120) {
      warnings.push({
        type: 'description_length',
        message: 'Meta description is too short (less than 120 characters)',
        impact: 'medium',
        recommendation: 'Expand description to 150-160 characters'
      })
    }

    if (description.length > 160) {
      warnings.push({
        type: 'description_length',
        message: 'Meta description is too long (more than 160 characters)',
        impact: 'medium',
        recommendation: 'Shorten description to avoid truncation'
      })
    }
  }

  /**
   * Valider le contenu
   */
  private validateContent(
    pageData: any,
    language: SupportedLocale,
    warnings: SeoWarning[],
    recommendations: SeoRecommendation[]
  ) {
    // Vérifier la structure des headings
    if (!pageData.headings.h1 || pageData.headings.h1.length === 0) {
      warnings.push({
        type: 'headings',
        message: 'Missing H1 heading',
        impact: 'high',
        recommendation: 'Add exactly one H1 heading per page'
      })
    }

    if (pageData.headings.h1 && pageData.headings.h1.length > 1) {
      warnings.push({
        type: 'headings', 
        message: 'Multiple H1 headings found',
        impact: 'medium',
        recommendation: 'Use only one H1 per page'
      })
    }

    // Vérifier les images
    const imagesWithoutAlt = pageData.images.filter((img: any) => !img.alt).length
    if (imagesWithoutAlt > 0) {
      warnings.push({
        type: 'accessibility',
        message: `${imagesWithoutAlt} images missing alt text`,
        impact: 'medium',
        recommendation: 'Add descriptive alt text to all images'
      })
    }

    // Recommandations de contenu
    if (pageData.content.length < 300) {
      recommendations.push({
        category: 'content',
        priority: 'high',
        title: 'Content too short',
        description: 'Page content is less than 300 words',
        implementation: 'Expand content to at least 300-500 words for better SEO'
      })
    }
  }

  /**
   * Validation technique
   */
  private validateTechnical(
    pageData: any,
    errors: SeoError[],
    warnings: SeoWarning[],
    recommendations: SeoRecommendation[]
  ) {
    // Vérifier la canonical
    if (!pageData.canonicalUrl) {
      errors.push({
        type: 'canonical',
        severity: 'medium',
        message: 'Missing canonical URL',
        element: '<link rel="canonical">',
        fix: 'Add canonical URL to prevent duplicate content issues'
      })
    }

    // Vérifier la taille de page
    if (pageData.pageSize > 3 * 1024 * 1024) { // 3MB
      warnings.push({
        type: 'performance',
        message: 'Page size is very large (>3MB)',
        impact: 'high',
        recommendation: 'Optimize images and minify resources'
      })
    }

    // Recommandations de performance
    recommendations.push({
      category: 'performance',
      priority: 'medium',
      title: 'Enable compression',
      description: 'Enable gzip/brotli compression for better loading times',
      implementation: 'Configure server compression for text resources'
    })
  }

  /**
   * Calculer les métriques
   */
  private calculateMetrics(pageData: any): SeoMetrics {
    const headingsCount: Record<string, number> = {}
    
    for (const [level, headings] of Object.entries(pageData.headings) as [string, string[]][]) {
      headingsCount[level] = headings.length
    }

    return {
      titleLength: pageData.title.length,
      descriptionLength: pageData.description.length,
      headingsCount,
      imageCount: pageData.images.length,
      imagesWithAlt: pageData.images.filter((img: any) => img.alt).length,
      internalLinks: pageData.links.filter((link: any) => link.internal).length,
      externalLinks: pageData.links.filter((link: any) => !link.internal).length,
      pageSize: pageData.pageSize
    }
  }

  /**
   * Calculer le score SEO
   */
  private calculateSeoScore(errors: SeoError[], warnings: SeoWarning[], metrics: SeoMetrics): number {
    let score = 100

    // Pénalités pour les erreurs
    for (const error of errors) {
      switch (error.severity) {
        case 'critical':
          score -= 25
          break
        case 'high':
          score -= 15
          break
        case 'medium':
          score -= 8
          break
        case 'low':
          score -= 3
          break
      }
    }

    // Pénalités pour les warnings
    for (const warning of warnings) {
      switch (warning.impact) {
        case 'high':
          score -= 10
          break
        case 'medium':
          score -= 5
          break
        case 'low':
          score -= 2
          break
      }
    }

    // Bonus pour les bonnes pratiques
    if (metrics.titleLength >= 30 && metrics.titleLength <= 60) {
      score += 5
    }

    if (metrics.descriptionLength >= 120 && metrics.descriptionLength <= 160) {
      score += 5
    }

    if (metrics.imagesWithAlt === metrics.imageCount && metrics.imageCount > 0) {
      score += 5
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Validation croisée hreflang (simulation)
   */
  private async validateCrossHreflang(targetUrl: string, expectedBackReference: string): Promise<boolean> {
    // Simulation - en production, faire un vrai appel HTTP et parser les hreflang
    try {
      // Simuler délai réseau
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Simuler validation réussie dans 90% des cas
      return Math.random() > 0.1
    } catch {
      return false
    }
  }

  /**
   * Générer un rapport de validation complet
   */
  generateValidationReport(results: SeoValidationResult[]): {
    summary: {
      totalPages: number
      validPages: number
      averageScore: number
      criticalErrors: number
      highErrors: number
    }
    errors: SeoError[]
    recommendations: SeoRecommendation[]
  } {
    const summary = {
      totalPages: results.length,
      validPages: results.filter(r => r.isValid).length,
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      criticalErrors: results.reduce((sum, r) => sum + r.errors.filter(e => e.severity === 'critical').length, 0),
      highErrors: results.reduce((sum, r) => sum + r.errors.filter(e => e.severity === 'high').length, 0)
    }

    const allErrors = results.flatMap(r => r.errors)
    const allRecommendations = results.flatMap(r => r.recommendations)

    // Déduplication des recommandations
    const uniqueRecommendations = Array.from(
      new Map(allRecommendations.map(r => [r.title, r])).values()
    )

    return {
      summary,
      errors: allErrors,
      recommendations: uniqueRecommendations
    }
  }
}

/**
 * Instance singleton
 */
export const seoValidator = new SeoValidator()

/**
 * Hook React pour la validation SEO
 */
export function useSeoValidation() {
  return {
    validatePage: (config: Parameters<typeof seoValidator.validatePage>[0]) =>
      seoValidator.validatePage(config),
    
    validateHreflangImplementation: (hreflangLinks: HreflangLink[], currentUrl: string) =>
      seoValidator.validateHreflangImplementation(hreflangLinks, currentUrl),
    
    generateValidationReport: (results: SeoValidationResult[]) =>
      seoValidator.generateValidationReport(results)
  }
}