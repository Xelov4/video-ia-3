/**
 * Système Open Graph Multilingue Avancé - Video-IA.net
 * 
 * Optimisation Open Graph et Twitter Cards par langue :
 * - Images localisées automatiques
 * - Métadonnées contextuelles par page
 * - Support Twitter Cards avancées
 * - Génération d'images dynamiques
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { SupportedLocale, defaultLocale } from '@/middleware'

// Types pour Open Graph
export interface OpenGraphConfig {
  title: string
  description: string
  type: 'website' | 'article' | 'product' | 'profile'
  url: string
  image?: OpenGraphImage
  locale: string
  alternateLocales: string[]
  siteName: string
  determiner?: 'a' | 'an' | 'the' | 'auto'
  ttl?: number
}

export interface OpenGraphImage {
  url: string
  secureUrl?: string
  width: number
  height: number
  alt: string
  type?: string
}

export interface TwitterCardConfig {
  card: 'summary' | 'summary_large_image' | 'app' | 'player'
  site: string
  creator?: string
  title: string
  description: string
  image?: string
  imageAlt?: string
}

export interface SocialMetadata {
  openGraph: OpenGraphConfig
  twitter: TwitterCardConfig
  additionalMeta: Record<string, string>
}

/**
 * Classe principale pour Open Graph et réseaux sociaux
 */
export class OpenGraphManager {
  private baseUrl: string
  private defaultImages: Record<SupportedLocale, string>
  private localeMapping: Record<SupportedLocale, string>
  private translations: Record<string, Record<SupportedLocale, string>>

  constructor() {
    this.baseUrl = this.detectBaseUrl()
    
    // Images par défaut par langue
    this.defaultImages = {
      en: '/images/og/default-en.jpg',
      fr: '/images/og/default-fr.jpg', 
      es: '/images/og/default-es.jpg',
      it: '/images/og/default-it.jpg',
      de: '/images/og/default-de.jpg',
      nl: '/images/og/default-nl.jpg',
      pt: '/images/og/default-pt.jpg'
    }

    // Mapping des locales
    this.localeMapping = {
      en: 'en_US',
      fr: 'fr_FR',
      es: 'es_ES', 
      it: 'it_IT',
      de: 'de_DE',
      nl: 'nl_NL',
      pt: 'pt_PT'
    }

    // Traductions pour métadonnées par défaut
    this.translations = {
      siteName: {
        en: 'Video-IA.net - AI Tools Directory',
        fr: 'Video-IA.net - Annuaire d\'Outils IA', 
        es: 'Video-IA.net - Directorio de Herramientas IA',
        it: 'Video-IA.net - Directory Strumenti IA',
        de: 'Video-IA.net - KI-Tools Verzeichnis',
        nl: 'Video-IA.net - AI-Tools Directory',
        pt: 'Video-IA.net - Diretório de Ferramentas IA'
      },
      defaultDescription: {
        en: 'Discover the best AI tools for video, creativity, productivity and business. Expert reviews and comparisons.',
        fr: 'Découvrez les meilleurs outils IA pour vidéo, créativité, productivité et business. Avis et comparaisons d\'experts.',
        es: 'Descubre las mejores herramientas IA para video, creatividad, productividad y negocio. Reseñas y comparaciones expertas.',
        it: 'Scopri i migliori strumenti IA per video, creatività, produttività e business. Recensioni e confronti di esperti.',
        de: 'Entdecken Sie die besten KI-Tools für Video, Kreativität, Produktivität und Business. Expertenbewertungen und Vergleiche.',
        nl: 'Ontdek de beste AI-tools voor video, creativiteit, productiviteit en business. Expertreviews en vergelijkingen.',
        pt: 'Descubra as melhores ferramentas IA para vídeo, criatividade, produtividade e negócios. Avaliações e comparações de especialistas.'
      },
      twitterCreator: {
        en: '@videoianet',
        fr: '@videoianet',
        es: '@videoianet',
        it: '@videoianet', 
        de: '@videoianet',
        nl: '@videoianet',
        pt: '@videoianet'
      }
    }
  }

  private detectBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return 'https://video-ia.net'
  }

  private translate(key: string, language: SupportedLocale): string {
    return this.translations[key]?.[language] || this.translations[key]?.[defaultLocale] || key
  }

  /**
   * Générer Open Graph pour la page d'accueil
   */
  generateHomepageOG(
    language: SupportedLocale,
    availableLanguages: SupportedLocale[] = []
  ): OpenGraphConfig {
    const alternateLocales = availableLanguages
      .filter(lang => lang !== language)
      .map(lang => this.localeMapping[lang])

    return {
      title: this.translate('siteName', language),
      description: this.translate('defaultDescription', language),
      type: 'website',
      url: this.buildLocalizedUrl('/', language),
      locale: this.localeMapping[language],
      alternateLocales,
      siteName: this.translate('siteName', language),
      image: {
        url: `${this.baseUrl}${this.defaultImages[language]}`,
        secureUrl: `${this.baseUrl}${this.defaultImages[language]}`,
        width: 1200,
        height: 630,
        alt: this.translate('siteName', language),
        type: 'image/jpeg'
      }
    }
  }

  /**
   * Générer Open Graph pour un outil
   */
  generateToolOG(config: {
    toolName: string
    toolDescription: string
    toolCategory: string
    toolImage?: string
    language: SupportedLocale
    basePath: string
    availableLanguages?: SupportedLocale[]
  }): OpenGraphConfig {
    const { toolName, toolDescription, toolCategory, toolImage, language, basePath, availableLanguages = [] } = config

    const alternateLocales = availableLanguages
      .filter(lang => lang !== language)
      .map(lang => this.localeMapping[lang])

    // Générer image personnalisée ou utiliser par défaut
    const imageUrl = toolImage || 
      this.generateToolImageUrl(toolName, toolCategory, language) ||
      `${this.baseUrl}${this.defaultImages[language]}`

    return {
      title: `${toolName} - ${this.translate('siteName', language)}`,
      description: toolDescription || `Découvrez ${toolName}, un outil IA innovant pour ${toolCategory}`,
      type: 'product',
      url: this.buildLocalizedUrl(basePath, language),
      locale: this.localeMapping[language],
      alternateLocales,
      siteName: this.translate('siteName', language),
      image: {
        url: imageUrl,
        secureUrl: imageUrl,
        width: 1200,
        height: 630,
        alt: `${toolName} - ${toolCategory} AI Tool`,
        type: 'image/jpeg'
      }
    }
  }

  /**
   * Générer Open Graph pour une catégorie
   */
  generateCategoryOG(config: {
    categoryName: string
    categoryDescription: string
    toolsCount: number
    language: SupportedLocale
    basePath: string
    availableLanguages?: SupportedLocale[]
  }): OpenGraphConfig {
    const { categoryName, categoryDescription, toolsCount, language, basePath, availableLanguages = [] } = config

    const alternateLocales = availableLanguages
      .filter(lang => lang !== language)
      .map(lang => this.localeMapping[lang])

    const title = `${categoryName} - ${toolsCount} outils IA - ${this.translate('siteName', language)}`
    const description = categoryDescription || `Découvrez ${toolsCount} outils IA pour ${categoryName}`

    return {
      title,
      description,
      type: 'website',
      url: this.buildLocalizedUrl(basePath, language),
      locale: this.localeMapping[language],
      alternateLocales,
      siteName: this.translate('siteName', language),
      image: {
        url: this.generateCategoryImageUrl(categoryName, language),
        secureUrl: this.generateCategoryImageUrl(categoryName, language),
        width: 1200,
        height: 630,
        alt: `${categoryName} AI Tools Category`,
        type: 'image/jpeg'
      }
    }
  }

  /**
   * Générer Twitter Card
   */
  generateTwitterCard(openGraphConfig: OpenGraphConfig): TwitterCardConfig {
    return {
      card: 'summary_large_image',
      site: '@videoianet',
      creator: '@videoianet',
      title: openGraphConfig.title,
      description: openGraphConfig.description,
      image: openGraphConfig.image?.url,
      imageAlt: openGraphConfig.image?.alt
    }
  }

  /**
   * Générer métadonnées sociales complètes
   */
  generateSocialMetadata(config: {
    title: string
    description: string
    type: OpenGraphConfig['type']
    basePath: string
    language: SupportedLocale
    availableLanguages?: SupportedLocale[]
    customImage?: string
    additionalMeta?: Record<string, string>
  }): SocialMetadata {
    const { title, description, type, basePath, language, availableLanguages = [], customImage, additionalMeta = {} } = config

    const alternateLocales = availableLanguages
      .filter(lang => lang !== language)
      .map(lang => this.localeMapping[lang])

    const imageUrl = customImage || `${this.baseUrl}${this.defaultImages[language]}`

    const openGraph: OpenGraphConfig = {
      title,
      description,
      type,
      url: this.buildLocalizedUrl(basePath, language),
      locale: this.localeMapping[language],
      alternateLocales,
      siteName: this.translate('siteName', language),
      image: {
        url: imageUrl,
        secureUrl: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
        type: 'image/jpeg'
      }
    }

    const twitter = this.generateTwitterCard(openGraph)

    return {
      openGraph,
      twitter,
      additionalMeta: {
        ...additionalMeta,
        'theme-color': '#0066cc',
        'msapplication-TileColor': '#0066cc',
        'application-name': this.translate('siteName', language)
      }
    }
  }

  /**
   * Construire URL localisée
   */
  private buildLocalizedUrl(path: string, language: SupportedLocale): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    
    if (language === defaultLocale) {
      return `${this.baseUrl}${cleanPath}`
    }
    
    return `${this.baseUrl}/${language}${cleanPath}`
  }

  /**
   * Générer URL d'image pour un outil
   */
  private generateToolImageUrl(toolName: string, category: string, language: SupportedLocale): string {
    const slug = toolName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    return `${this.baseUrl}/api/og/tool?name=${encodeURIComponent(toolName)}&category=${encodeURIComponent(category)}&lang=${language}&slug=${slug}`
  }

  /**
   * Générer URL d'image pour une catégorie
   */
  private generateCategoryImageUrl(categoryName: string, language: SupportedLocale): string {
    return `${this.baseUrl}/api/og/category?name=${encodeURIComponent(categoryName)}&lang=${language}`
  }

  /**
   * Valider la configuration Open Graph
   */
  validateOpenGraph(config: OpenGraphConfig): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Validations obligatoires
    if (!config.title) errors.push('Title is required')
    if (!config.description) errors.push('Description is required')
    if (!config.url) errors.push('URL is required')
    if (!config.type) errors.push('Type is required')

    // Validations recommandées
    if (config.title.length > 60) warnings.push('Title should be 60 characters or less for optimal display')
    if (config.description.length > 160) warnings.push('Description should be 160 characters or less')
    if (config.description.length < 50) warnings.push('Description should be at least 50 characters')

    // Validation image
    if (config.image) {
      if (config.image.width < 1200) warnings.push('Image width should be at least 1200px for best quality')
      if (config.image.height < 630) warnings.push('Image height should be at least 630px for best quality')
      if (!config.image.alt) warnings.push('Image alt text is recommended for accessibility')
    }

    // Validation URL
    try {
      new URL(config.url)
    } catch {
      errors.push('Invalid URL format')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Générer les balises HTML meta
   */
  generateMetaTags(socialMetadata: SocialMetadata): string {
    const { openGraph, twitter, additionalMeta } = socialMetadata
    let tags = ''

    // Open Graph tags
    tags += `<meta property="og:title" content="${this.escapeHtml(openGraph.title)}" />\n`
    tags += `<meta property="og:description" content="${this.escapeHtml(openGraph.description)}" />\n`
    tags += `<meta property="og:type" content="${openGraph.type}" />\n`
    tags += `<meta property="og:url" content="${openGraph.url}" />\n`
    tags += `<meta property="og:locale" content="${openGraph.locale}" />\n`
    tags += `<meta property="og:site_name" content="${this.escapeHtml(openGraph.siteName)}" />\n`

    if (openGraph.image) {
      tags += `<meta property="og:image" content="${openGraph.image.url}" />\n`
      tags += `<meta property="og:image:secure_url" content="${openGraph.image.secureUrl || openGraph.image.url}" />\n`
      tags += `<meta property="og:image:width" content="${openGraph.image.width}" />\n`
      tags += `<meta property="og:image:height" content="${openGraph.image.height}" />\n`
      tags += `<meta property="og:image:alt" content="${this.escapeHtml(openGraph.image.alt)}" />\n`
      if (openGraph.image.type) {
        tags += `<meta property="og:image:type" content="${openGraph.image.type}" />\n`
      }
    }

    // Alternate locales
    for (const locale of openGraph.alternateLocales) {
      tags += `<meta property="og:locale:alternate" content="${locale}" />\n`
    }

    // Twitter tags
    tags += `<meta name="twitter:card" content="${twitter.card}" />\n`
    tags += `<meta name="twitter:site" content="${twitter.site}" />\n`
    tags += `<meta name="twitter:title" content="${this.escapeHtml(twitter.title)}" />\n`
    tags += `<meta name="twitter:description" content="${this.escapeHtml(twitter.description)}" />\n`
    
    if (twitter.creator) {
      tags += `<meta name="twitter:creator" content="${twitter.creator}" />\n`
    }
    
    if (twitter.image) {
      tags += `<meta name="twitter:image" content="${twitter.image}" />\n`
    }
    
    if (twitter.imageAlt) {
      tags += `<meta name="twitter:image:alt" content="${this.escapeHtml(twitter.imageAlt)}" />\n`
    }

    // Additional meta tags
    for (const [name, content] of Object.entries(additionalMeta)) {
      tags += `<meta name="${name}" content="${this.escapeHtml(content)}" />\n`
    }

    return tags
  }

  /**
   * Échapper les caractères HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

/**
 * Instance singleton
 */
export const openGraphManager = new OpenGraphManager()

/**
 * Hook React pour Open Graph
 */
export function useOpenGraph() {
  return {
    generateHomepageOG: (language: SupportedLocale, availableLanguages?: SupportedLocale[]) =>
      openGraphManager.generateHomepageOG(language, availableLanguages),
    
    generateToolOG: (config: Parameters<typeof openGraphManager.generateToolOG>[0]) =>
      openGraphManager.generateToolOG(config),
    
    generateCategoryOG: (config: Parameters<typeof openGraphManager.generateCategoryOG>[0]) =>
      openGraphManager.generateCategoryOG(config),
    
    generateSocialMetadata: (config: Parameters<typeof openGraphManager.generateSocialMetadata>[0]) =>
      openGraphManager.generateSocialMetadata(config),
    
    validateOpenGraph: (config: OpenGraphConfig) =>
      openGraphManager.validateOpenGraph(config),
    
    generateMetaTags: (metadata: SocialMetadata) =>
      openGraphManager.generateMetaTags(metadata)
  }
}