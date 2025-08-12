/**
 * Système Hreflang Avancé - Video-IA.net
 * 
 * Génération automatique des balises hreflang pour SEO multilingue :
 * - Validation conforme Google Search Console
 * - Détection automatique des pages traduites
 * - Génération de sitemaps avec hreflang
 * - Monitoring et validation des liens
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { SupportedLocale, supportedLocales, defaultLocale } from '@/middleware'

// Configuration des domaines et régions
const DOMAIN_CONFIG = {
  production: 'https://video-ia.net',
  staging: 'https://staging.video-ia.net',
  development: 'http://localhost:3000'
} as const

// Mapping langue vers région pour hreflang
const LOCALE_REGION_MAP: Record<SupportedLocale, string> = {
  'en': 'en-US',
  'fr': 'fr-FR', 
  'es': 'es-ES',
  'it': 'it-IT',
  'de': 'de-DE',
  'nl': 'nl-NL',
  'pt': 'pt-PT'
}

// Types pour le système hreflang
export interface HreflangLink {
  hreflang: string
  href: string
  rel: 'alternate'
}

export interface CanonicalInfo {
  url: string
  language: SupportedLocale
  isDefault: boolean
}

export interface SeoMetadata {
  title: string
  description: string
  keywords?: string[]
  openGraph: {
    title: string
    description: string
    image?: string
    type: 'website' | 'article'
    locale: string
    alternateLocales: string[]
  }
  twitter: {
    card: 'summary_large_image'
    title: string
    description: string
    image?: string
  }
  hreflang: HreflangLink[]
  canonical: CanonicalInfo
  robots: string
}

/**
 * Classe principale pour la gestion Hreflang
 */
export class HreflangManager {
  private baseUrl: string
  private environment: 'production' | 'staging' | 'development'

  constructor() {
    this.environment = this.detectEnvironment()
    this.baseUrl = DOMAIN_CONFIG[this.environment]
  }

  /**
   * Détecter l'environnement d'exécution
   */
  private detectEnvironment(): 'production' | 'staging' | 'development' {
    if (typeof window === 'undefined') return 'development'
    
    const hostname = window.location.hostname
    if (hostname === 'video-ia.net') return 'production'
    if (hostname.includes('staging')) return 'staging'
    return 'development'
  }

  /**
   * Générer les liens hreflang pour une page
   */
  generateHreflangLinks(
    basePath: string, 
    currentLanguage: SupportedLocale,
    availableLanguages?: SupportedLocale[]
  ): HreflangLink[] {
    const languages = availableLanguages || supportedLocales
    const hreflangLinks: HreflangLink[] = []

    // Générer les liens pour chaque langue disponible
    for (const language of languages) {
      const localizedPath = this.buildLocalizedPath(basePath, language)
      const fullUrl = `${this.baseUrl}${localizedPath}`

      hreflangLinks.push({
        hreflang: LOCALE_REGION_MAP[language],
        href: fullUrl,
        rel: 'alternate'
      })
    }

    // Ajouter le lien x-default (langue par défaut)
    const defaultPath = this.buildLocalizedPath(basePath, defaultLocale)
    hreflangLinks.push({
      hreflang: 'x-default',
      href: `${this.baseUrl}${defaultPath}`,
      rel: 'alternate'
    })

    return hreflangLinks
  }

  /**
   * Construire le chemin localisé
   */
  private buildLocalizedPath(basePath: string, language: SupportedLocale): string {
    // Nettoyer le basePath
    let cleanPath = basePath.startsWith('/') ? basePath : `/${basePath}`
    
    // Retirer préfixe de langue existant
    for (const lang of supportedLocales) {
      if (cleanPath.startsWith(`/${lang}/`) || cleanPath === `/${lang}`) {
        cleanPath = cleanPath.substring(`/${lang}`.length) || '/'
        break
      }
    }

    // Ajouter préfixe pour langue non-défaut
    if (language !== defaultLocale) {
      return `/${language}${cleanPath}`
    }
    
    return cleanPath
  }

  /**
   * Générer l'URL canonique
   */
  generateCanonical(basePath: string, language: SupportedLocale): CanonicalInfo {
    const localizedPath = this.buildLocalizedPath(basePath, language)
    const canonicalUrl = `${this.baseUrl}${localizedPath}`

    return {
      url: canonicalUrl,
      language,
      isDefault: language === defaultLocale
    }
  }

  /**
   * Générer métadonnées SEO complètes
   */
  generateSeoMetadata(config: {
    basePath: string
    currentLanguage: SupportedLocale
    title: string
    description: string
    keywords?: string[]
    image?: string
    type?: 'website' | 'article'
    availableLanguages?: SupportedLocale[]
  }): SeoMetadata {
    const {
      basePath,
      currentLanguage,
      title,
      description,
      keywords,
      image,
      type = 'website',
      availableLanguages
    } = config

    const hreflangLinks = this.generateHreflangLinks(basePath, currentLanguage, availableLanguages)
    const canonical = this.generateCanonical(basePath, currentLanguage)

    // Générer les locales alternatives pour Open Graph
    const alternateLocales = (availableLanguages || supportedLocales)
      .filter(lang => lang !== currentLanguage)
      .map(lang => LOCALE_REGION_MAP[lang])

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        image,
        type,
        locale: LOCALE_REGION_MAP[currentLanguage],
        alternateLocales
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image
      },
      hreflang: hreflangLinks,
      canonical,
      robots: this.generateRobotsDirective(currentLanguage)
    }
  }

  /**
   * Générer la directive robots
   */
  private generateRobotsDirective(language: SupportedLocale): string {
    // En développement, ne pas indexer
    if (this.environment === 'development') {
      return 'noindex, nofollow'
    }

    // En staging, indexer seulement l'anglais
    if (this.environment === 'staging') {
      return language === defaultLocale ? 'index, follow' : 'noindex, follow'
    }

    // En production, indexer toutes les langues
    return 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  }

  /**
   * Valider la cohérence des liens hreflang
   */
  validateHreflangLinks(links: HreflangLink[]): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Vérifier la présence du x-default
    const hasXDefault = links.some(link => link.hreflang === 'x-default')
    if (!hasXDefault) {
      errors.push('Missing x-default hreflang link')
    }

    // Vérifier les doublons
    const hreflangs = links.map(link => link.hreflang)
    const uniqueHreflangs = new Set(hreflangs)
    if (hreflangs.length !== uniqueHreflangs.size) {
      errors.push('Duplicate hreflang values found')
    }

    // Vérifier la cohérence des URLs
    const baseUrls = new Set()
    for (const link of links) {
      try {
        const url = new URL(link.href)
        baseUrls.add(url.origin)
      } catch {
        errors.push(`Invalid URL format: ${link.href}`)
      }
    }

    if (baseUrls.size > 1) {
      warnings.push('Multiple domains detected in hreflang links')
    }

    // Vérifier que toutes les langues supportées sont présentes
    const supportedHreflangs = new Set(Object.values(LOCALE_REGION_MAP))
    const presentHreflangs = new Set(
      links.filter(link => link.hreflang !== 'x-default').map(link => link.hreflang)
    )
    
    for (const hreflang of supportedHreflangs) {
      if (!presentHreflangs.has(hreflang)) {
        warnings.push(`Missing hreflang for supported language: ${hreflang}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Générer le sitemap XML avec hreflang
   */
  generateSitemapEntry(config: {
    basePath: string
    availableLanguages: SupportedLocale[]
    lastModified?: Date
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority?: number
  }): string {
    const { basePath, availableLanguages, lastModified, changeFrequency = 'weekly', priority = 0.8 } = config
    
    let xml = '  <url>\n'
    
    // URL principale (langue par défaut)
    const defaultUrl = `${this.baseUrl}${this.buildLocalizedPath(basePath, defaultLocale)}`
    xml += `    <loc>${defaultUrl}</loc>\n`
    
    if (lastModified) {
      xml += `    <lastmod>${lastModified.toISOString()}</lastmod>\n`
    }
    
    xml += `    <changefreq>${changeFrequency}</changefreq>\n`
    xml += `    <priority>${priority}</priority>\n`
    
    // Ajouter les liens hreflang
    for (const language of availableLanguages) {
      const localizedUrl = `${this.baseUrl}${this.buildLocalizedPath(basePath, language)}`
      xml += `    <xhtml:link rel="alternate" hreflang="${LOCALE_REGION_MAP[language]}" href="${localizedUrl}" />\n`
    }
    
    // Ajouter x-default
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}" />\n`
    xml += '  </url>\n'
    
    return xml
  }
}

/**
 * Instance singleton
 */
export const hreflangManager = new HreflangManager()

/**
 * Hook React pour l'utilisation du système hreflang
 */
export function useHreflang() {
  return {
    generateHreflangLinks: (basePath: string, currentLanguage: SupportedLocale, availableLanguages?: SupportedLocale[]) => 
      hreflangManager.generateHreflangLinks(basePath, currentLanguage, availableLanguages),
    
    generateCanonical: (basePath: string, language: SupportedLocale) => 
      hreflangManager.generateCanonical(basePath, language),
    
    generateSeoMetadata: (config: Parameters<typeof hreflangManager.generateSeoMetadata>[0]) => 
      hreflangManager.generateSeoMetadata(config),
    
    validateHreflangLinks: (links: HreflangLink[]) => 
      hreflangManager.validateHreflangLinks(links)
  }
}

/**
 * Utilitaires pour Next.js metadata API
 */
export function generateNextMetadata(seoMetadata: SeoMetadata): any {
  return {
    title: seoMetadata.title,
    description: seoMetadata.description,
    keywords: seoMetadata.keywords,
    
    alternates: {
      canonical: seoMetadata.canonical.url,
      languages: Object.fromEntries(
        seoMetadata.hreflang
          .filter(link => link.hreflang !== 'x-default')
          .map(link => [link.hreflang, link.href])
      )
    },
    
    openGraph: {
      title: seoMetadata.openGraph.title,
      description: seoMetadata.openGraph.description,
      images: seoMetadata.openGraph.image ? [seoMetadata.openGraph.image] : undefined,
      type: seoMetadata.openGraph.type,
      locale: seoMetadata.openGraph.locale,
      alternateLocale: seoMetadata.openGraph.alternateLocales
    },
    
    twitter: {
      card: seoMetadata.twitter.card,
      title: seoMetadata.twitter.title,
      description: seoMetadata.twitter.description,
      images: seoMetadata.twitter.image ? [seoMetadata.twitter.image] : undefined
    },
    
    robots: seoMetadata.robots
  }
}