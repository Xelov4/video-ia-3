/**
 * Système Schema.org Multilingue - Video-IA.net
 *
 * Génération automatique de structured data pour SEO :
 * - Schema.org conformes pour outils IA
 * - Multilingue avec fallbacks intelligents
 * - Support Organisation, WebSite, BreadcrumbList
 * - Validation JSON-LD automatique
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { SupportedLocale, defaultLocale } from '@/middleware';

// Types pour Schema.org
export interface BaseSchema {
  '@context': 'https://schema.org';
  '@type': string;
}

export interface OrganizationSchema extends BaseSchema {
  '@type': 'Organization';
  name: string;
  description: string;
  url: string;
  logo: {
    '@type': 'ImageObject';
    url: string;
    width: number;
    height: number;
  };
  contactPoint: {
    '@type': 'ContactPoint';
    contactType: 'customer service';
    email?: string;
    url?: string;
  };
  sameAs: string[];
  foundingDate: string;
  founders: Array<{
    '@type': 'Person';
    name: string;
  }>;
}

export interface WebSiteSchema extends BaseSchema {
  '@type': 'WebSite';
  name: string;
  description: string;
  url: string;
  potentialAction: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
  };
  inLanguage: string[];
}

export interface SoftwareApplicationSchema extends BaseSchema {
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  url: string;
  image?: string;
  applicationCategory:
    | 'BusinessApplication'
    | 'MultimediaApplication'
    | 'DesignApplication'
    | 'DeveloperApplication';
  operatingSystem: string[];
  price: number | string;
  priceCurrency?: string;
  offers?: {
    '@type': 'Offer';
    price: number | string;
    priceCurrency: string;
    availability: string;
  };
  author?: {
    '@type': 'Organization' | 'Person';
    name: string;
  };
  datePublished?: string;
  dateModified?: string;
  version?: string;
  downloadUrl?: string;
  screenshot?: string[];
  featureList?: string[];
  requirements?: string;
  softwareHelp?: {
    '@type': 'CreativeWork';
    url: string;
  };
  applicationSubCategory?: string;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
  inLanguage: string[];
}

export interface BreadcrumbListSchema extends BaseSchema {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export interface CollectionPageSchema extends BaseSchema {
  '@type': 'CollectionPage';
  name: string;
  description: string;
  url: string;
  mainEntity: {
    '@type': 'ItemList';
    numberOfItems: number;
    itemListElement: Array<{
      '@type': 'ListItem';
      position: number;
      item: SoftwareApplicationSchema;
    }>;
  };
  breadcrumb: BreadcrumbListSchema;
  inLanguage: string;
}

/**
 * Classe principale pour la génération Schema.org
 */
export class SchemaGenerator {
  private baseUrl: string;
  private translations: Record<string, Record<SupportedLocale, string>>;

  constructor() {
    this.baseUrl = this.detectBaseUrl();
    this.translations = {
      siteName: {
        en: 'Video-IA.net - AI Tools Directory',
        fr: "Video-IA.net - Annuaire d'Outils IA",
        es: 'Video-IA.net - Directorio de Herramientas IA',
        it: 'Video-IA.net - Directory Strumenti IA',
        de: 'Video-IA.net - KI-Tools Verzeichnis',
        nl: 'Video-IA.net - AI-Tools Directory',
        pt: 'Video-IA.net - Diretório de Ferramentas IA',
      },
      siteDescription: {
        en: 'Discover the best AI tools for video, creativity, productivity and business. Comprehensive directory with reviews, comparisons and expert recommendations.',
        fr: "Découvrez les meilleurs outils IA pour vidéo, créativité, productivité et business. Annuaire complet avec avis, comparaisons et recommandations d'experts.",
        es: 'Descubre las mejores herramientas IA para video, creatividad, productividad y negocio. Directorio completo con reseñas, comparaciones y recomendaciones expertas.',
        it: 'Scopri i migliori strumenti IA per video, creatività, produttività e business. Directory completa con recensioni, confronti e raccomandazioni di esperti.',
        de: 'Entdecken Sie die besten KI-Tools für Video, Kreativität, Produktivität und Business. Umfassendes Verzeichnis mit Bewertungen, Vergleichen und Expertenempfehlungen.',
        nl: 'Ontdek de beste AI-tools voor video, creativiteit, productiviteit en business. Uitgebreide directory met reviews, vergelijkingen en expertaanbevelingen.',
        pt: 'Descubra as melhores ferramentas IA para vídeo, criatividade, produtividade e negócios. Diretório abrangente com avaliações, comparações e recomendações de especialistas.',
      },
      organizationDescription: {
        en: 'Video-IA.net is the leading platform for discovering and comparing AI tools for video creation, business automation, creative workflows, and productivity enhancement.',
        fr: 'Video-IA.net est la plateforme leader pour découvrir et comparer les outils IA pour création vidéo, automatisation business, workflows créatifs et amélioration de la productivité.',
        es: 'Video-IA.net es la plataforma líder para descubrir y comparar herramientas IA para creación de video, automatización empresarial, flujos de trabajo creativos y mejora de productividad.',
        it: 'Video-IA.net è la piattaforma leader per scoprire e confrontare strumenti IA per creazione video, automazione aziendale, flussi di lavoro creativi e miglioramento della produttività.',
        de: 'Video-IA.net ist die führende Plattform zum Entdecken und Vergleichen von KI-Tools für Videoerstellung, Business-Automatisierung, kreative Workflows und Produktivitätssteigerung.',
        nl: 'Video-IA.net is het toonaangevende platform voor het ontdekken en vergelijken van AI-tools voor videocreatie, bedrijfsautomatisering, creatieve workflows en productiviteitsverbetering.',
        pt: 'Video-IA.net é a plataforma líder para descobrir e comparar ferramentas IA para criação de vídeo, automação empresarial, fluxos de trabalho criativos e melhoria da produtividade.',
      },
    };
  }

  private detectBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://video-ia.net';
  }

  private translate(key: string, language: SupportedLocale): string {
    return (
      this.translations[key]?.[language] ||
      this.translations[key]?.[defaultLocale] ||
      key
    );
  }

  /**
   * Générer le schema Organisation
   */
  generateOrganizationSchema(language: SupportedLocale): OrganizationSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.translate('siteName', language),
      description: this.translate('organizationDescription', language),
      url: this.baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${this.baseUrl}/images/logo-512x512.png`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        url: `${this.baseUrl}/contact`,
      },
      sameAs: [
        'https://twitter.com/videoianet',
        'https://www.linkedin.com/company/video-ia-net',
        'https://github.com/video-ia-net',
      ],
      foundingDate: '2024-01-01',
      founders: [
        {
          '@type': 'Person',
          name: 'Video-IA.net Team',
        },
      ],
    };
  }

  /**
   * Générer le schema WebSite
   */
  generateWebSiteSchema(
    language: SupportedLocale,
    availableLanguages: SupportedLocale[]
  ): WebSiteSchema {
    const languageCodes = availableLanguages.map(lang => {
      const mapping: Record<SupportedLocale, string> = {
        en: 'en-US',
        fr: 'fr-FR',
        es: 'es-ES',
        it: 'it-IT',
        de: 'de-DE',
        nl: 'nl-NL',
        pt: 'pt-PT',
      };
      return mapping[lang];
    });

    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.translate('siteName', language),
      description: this.translate('siteDescription', language),
      url: this.baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.baseUrl}/${language === defaultLocale ? '' : language + '/'}search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'Organization',
        name: this.translate('siteName', language),
      },
      inLanguage: languageCodes,
    };
  }

  /**
   * Générer le schema pour un outil IA
   */
  generateToolSchema(config: {
    tool: {
      id: number;
      toolName: string;
      overview: string;
      toolDescription?: string;
      toolLink: string;
      imageUrl?: string;
      toolCategory: string;
      createdAt: Date;
      updatedAt: Date;
    };
    language: SupportedLocale;
    availableLanguages: SupportedLocale[];
    basePath: string;
  }): SoftwareApplicationSchema {
    const { tool, language, availableLanguages, basePath } = config;

    const languageCodes = availableLanguages.map(lang => {
      const mapping: Record<SupportedLocale, string> = {
        en: 'en-US',
        fr: 'fr-FR',
        es: 'es-ES',
        it: 'it-IT',
        de: 'de-DE',
        nl: 'nl-NL',
        pt: 'pt-PT',
      };
      return mapping[lang];
    });

    const categoryMapping: Record<
      string,
      SoftwareApplicationSchema['applicationCategory']
    > = {
      'Video Generation': 'MultimediaApplication',
      'Image Generation': 'MultimediaApplication',
      'Audio Generation': 'MultimediaApplication',
      'Code Generation': 'DeveloperApplication',
      Writing: 'BusinessApplication',
      Productivity: 'BusinessApplication',
      Design: 'DesignApplication',
      Marketing: 'BusinessApplication',
      Business: 'BusinessApplication',
    };

    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.toolName,
      description:
        tool.overview || tool.toolDescription || `${tool.toolName} - AI Tool`,
      url: `${this.baseUrl}${basePath}`,
      image:
        tool.imageUrl ||
        `${this.baseUrl}/images/tools/${tool.toolName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      applicationCategory: categoryMapping[tool.toolCategory] || 'BusinessApplication',
      operatingSystem: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
      price: '0',
      priceCurrency: 'USD',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      author: {
        '@type': 'Organization',
        name: this.translate('siteName', language),
      },
      datePublished: tool.createdAt.toISOString(),
      dateModified: tool.updatedAt.toISOString(),
      downloadUrl: tool.toolLink,
      applicationSubCategory: tool.toolCategory,
      inLanguage: languageCodes,
    };
  }

  /**
   * Générer le schema BreadcrumbList
   */
  generateBreadcrumbSchema(
    breadcrumbs: Array<{ name: string; url: string }>
  ): BreadcrumbListSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        item: breadcrumb.url,
      })),
    };
  }

  /**
   * Générer le schema pour une page de collection (catégorie)
   */
  generateCollectionPageSchema(config: {
    categoryName: string;
    categoryDescription: string;
    tools: Array<{
      id: number;
      toolName: string;
      overview: string;
      toolCategory: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    language: SupportedLocale;
    basePath: string;
    breadcrumbs: Array<{ name: string; url: string }>;
  }): CollectionPageSchema {
    const {
      categoryName,
      categoryDescription,
      tools,
      language,
      basePath,
      breadcrumbs,
    } = config;

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: categoryName,
      description: categoryDescription,
      url: `${this.baseUrl}${basePath}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: tools.length,
        itemListElement: tools.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: this.generateToolSchema({
            tool: {
              ...tool,
              toolDescription: tool.overview,
              toolLink: `${this.baseUrl}/${language === defaultLocale ? '' : language + '/'}tools/${tool.toolName.toLowerCase().replace(/\s+/g, '-')}`,
              imageUrl: undefined,
              updatedAt: tool.updatedAt,
            },
            language,
            availableLanguages: [language],
            basePath: `/${language === defaultLocale ? '' : language + '/'}tools/${tool.toolName.toLowerCase().replace(/\s+/g, '-')}`,
          }),
        })),
      },
      breadcrumb: this.generateBreadcrumbSchema(breadcrumbs),
      inLanguage:
        language === defaultLocale ? 'en-US' : `${language}-${language.toUpperCase()}`,
    };
  }

  /**
   * Combiner plusieurs schemas en JSON-LD
   */
  combineSchemas(schemas: BaseSchema[]): string {
    return JSON.stringify(schemas, null, 2);
  }

  /**
   * Valider un schema JSON-LD
   */
  validateSchema(schema: BaseSchema): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Vérifications basiques
    if (!schema['@context']) {
      errors.push('Missing @context property');
    }

    if (!schema['@type']) {
      errors.push('Missing @type property');
    }

    if (schema['@context'] !== 'https://schema.org') {
      errors.push('Invalid @context value, should be "https://schema.org"');
    }

    // Vérifications spécifiques par type
    if (schema['@type'] === 'Organization') {
      const orgSchema = schema as OrganizationSchema;
      if (!orgSchema.name) errors.push('Organization missing name');
      if (!orgSchema.url) errors.push('Organization missing url');
    }

    if (schema['@type'] === 'SoftwareApplication') {
      const appSchema = schema as SoftwareApplicationSchema;
      if (!appSchema.name) errors.push('SoftwareApplication missing name');
      if (!appSchema.description)
        errors.push('SoftwareApplication missing description');
      if (!appSchema.url) errors.push('SoftwareApplication missing url');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Instance singleton
 */
export const schemaGenerator = new SchemaGenerator();

/**
 * Hook React pour l'utilisation des schemas
 */
export function useSchema() {
  return {
    generateOrganizationSchema: (language: SupportedLocale) =>
      schemaGenerator.generateOrganizationSchema(language),

    generateWebSiteSchema: (
      language: SupportedLocale,
      availableLanguages: SupportedLocale[]
    ) => schemaGenerator.generateWebSiteSchema(language, availableLanguages),

    generateToolSchema: (
      config: Parameters<typeof schemaGenerator.generateToolSchema>[0]
    ) => schemaGenerator.generateToolSchema(config),

    generateBreadcrumbSchema: (
      breadcrumbs: Parameters<typeof schemaGenerator.generateBreadcrumbSchema>[0]
    ) => schemaGenerator.generateBreadcrumbSchema(breadcrumbs),

    generateCollectionPageSchema: (
      config: Parameters<typeof schemaGenerator.generateCollectionPageSchema>[0]
    ) => schemaGenerator.generateCollectionPageSchema(config),

    combineSchemas: (schemas: BaseSchema[]) => schemaGenerator.combineSchemas(schemas),

    validateSchema: (schema: BaseSchema) => schemaGenerator.validateSchema(schema),
  };
}
