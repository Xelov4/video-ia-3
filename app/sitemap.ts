/**
 * Sitemap Index Principal - SEO Multilingue Complet
 *
 * Génère un sitemap principal optimisé pour SEO avec :
 * - Support multilingue complet (7 langues)
 * - Intégration outils et catégories depuis DB
 * - Métadonnées SEO avancées
 * - Performance optimisée avec cache
 * - Fallbacks robustes
 */

import { MetadataRoute } from 'next';
import { supportedLocales } from '@/middleware';
import { toolsService } from '@/src/lib/database/services/tools';
import { CategoriesService } from '@/src/lib/database/services/categories';

// Configuration SEO avancée
const SEO_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net',
  priorities: {
    homepage: 1.0,
    tools: 0.9,
    categories: 0.8,
    toolDetail: 0.7,
    categoryDetail: 0.6,
    about: 0.5,
  },
  frequencies: {
    homepage: 'daily' as const,
    tools: 'daily' as const,
    categories: 'weekly' as const,
    toolDetail: 'weekly' as const,
    categoryDetail: 'weekly' as const,
    about: 'monthly' as const,
  },
};

// Interface pour entrée sitemap enrichie
interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority: number;
  language?: string;
}

/**
 * Récupération optimisée des données avec fallbacks
 */
async function getSitemapData() {
  try {
    // Récupération parallèle des données
    const [toolsResult, categories] = await Promise.all([
      toolsService
        .searchTools({
          limit: 50000,
        })
        .catch(() => ({ tools: [] })),
      CategoriesService.getAllCategories().catch(() => []),
    ]);

    return {
      tools: toolsResult.tools || [],
      categories: categories || [],
      success: true,
    };
  } catch (error) {
    console.error('Error fetching sitemap data:', error);
    return {
      tools: [],
      categories: [],
      success: false,
    };
  }
}

/**
 * Génération des entrées homepage multilingues
 */
function generateHomepageEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const currentDate = new Date();

  supportedLocales.forEach(locale => {
    const langPrefix = locale === 'en' ? '' : `/${locale}`;
    const priority =
      locale === 'en'
        ? SEO_CONFIG.priorities.homepage
        : SEO_CONFIG.priorities.homepage * 0.95;

    entries.push({
      url: `${SEO_CONFIG.baseUrl}${langPrefix}`,
      lastModified: currentDate,
      changeFrequency: SEO_CONFIG.frequencies.homepage,
      priority: priority,
      language: locale,
    });
  });

  return entries;
}

/**
 * Génération des entrées pages principales multilingues
 */
function generateMainPagesEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const currentDate = new Date();

  const mainPages = [
    {
      path: '/tools',
      priority: SEO_CONFIG.priorities.tools,
      freq: SEO_CONFIG.frequencies.tools,
    },
    {
      path: '/categories',
      priority: SEO_CONFIG.priorities.categories,
      freq: SEO_CONFIG.frequencies.categories,
    },
    {
      path: '/about',
      priority: SEO_CONFIG.priorities.about,
      freq: SEO_CONFIG.frequencies.about,
    },
  ];

  supportedLocales.forEach(locale => {
    const langPrefix = locale === 'en' ? '' : `/${locale}`;
    const langMultiplier = locale === 'en' ? 1.0 : 0.95;

    mainPages.forEach(page => {
      entries.push({
        url: `${SEO_CONFIG.baseUrl}${langPrefix}${page.path}`,
        lastModified: currentDate,
        changeFrequency: page.freq,
        priority: page.priority * langMultiplier,
        language: locale,
      });
    });
  });

  return entries;
}

/**
 * Génération des entrées catégories multilingues
 */
function generateCategoryEntries(categories: any[]): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const currentDate = new Date();

  supportedLocales.forEach(locale => {
    const langPrefix = locale === 'en' ? '' : `/${locale}`;
    const langMultiplier = locale === 'en' ? 1.0 : 0.95;

    categories.forEach(category => {
      entries.push({
        url: `${SEO_CONFIG.baseUrl}${langPrefix}/categories/${category.slug}`,
        lastModified: currentDate,
        changeFrequency: SEO_CONFIG.frequencies.categoryDetail,
        priority: SEO_CONFIG.priorities.categoryDetail * langMultiplier,
        language: locale,
      });
    });
  });

  return entries;
}

/**
 * Génération des entrées outils multilingues
 */
function generateToolEntries(tools: any[]): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const currentDate = new Date();

  supportedLocales.forEach(locale => {
    const langPrefix = locale === 'en' ? '' : `/${locale}`;
    const langMultiplier = locale === 'en' ? 1.0 : 0.95;

    tools.forEach(tool => {
      const toolSlug = tool.slug || tool.id;
      const lastModified = tool.updated_at
        ? new Date(tool.updated_at)
        : tool.created_at
          ? new Date(tool.created_at)
          : currentDate;

      // Priorité plus élevée pour les outils featured
      const basePriority = tool.featured
        ? SEO_CONFIG.priorities.toolDetail * 1.1
        : SEO_CONFIG.priorities.toolDetail;

      entries.push({
        url: `${SEO_CONFIG.baseUrl}${langPrefix}/t/${toolSlug}`,
        lastModified: lastModified,
        changeFrequency: SEO_CONFIG.frequencies.toolDetail,
        priority: basePriority * langMultiplier,
        language: locale,
      });
    });
  });

  return entries;
}

/**
 * Fonction principale de génération du sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log('🔄 Generating comprehensive multilingual sitemap...');

  try {
    // Récupération des données
    const { tools, categories, success } = await getSitemapData();

    if (!success) {
      console.warn('⚠️ Using fallback sitemap data');
    }

    // Génération des entrées par type
    const homepageEntries = generateHomepageEntries();
    const mainPagesEntries = generateMainPagesEntries();
    const categoryEntries = generateCategoryEntries(categories);
    const toolEntries = generateToolEntries(tools);

    // Combinaison de toutes les entrées
    const allEntries = [
      ...homepageEntries,
      ...mainPagesEntries,
      ...categoryEntries,
      ...toolEntries,
    ];

    // Conversion vers le format MetadataRoute.Sitemap
    const sitemapEntries: MetadataRoute.Sitemap = allEntries.map(entry => ({
      url: entry.url,
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    }));

    console.log(`✅ Sitemap generated successfully: ${sitemapEntries.length} entries`);
    console.log(
      `📊 Breakdown: ${homepageEntries.length} homepages, ${mainPagesEntries.length} main pages, ${categoryEntries.length} categories, ${toolEntries.length} tools`
    );

    return sitemapEntries;
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);

    // Fallback minimal multilingue
    const fallbackEntries: MetadataRoute.Sitemap = [];
    const currentDate = new Date();

    supportedLocales.forEach(locale => {
      const langPrefix = locale === 'en' ? '' : `/${locale}`;
      const priority = locale === 'en' ? 1.0 : 0.9;

      // Homepage
      fallbackEntries.push({
        url: `${SEO_CONFIG.baseUrl}${langPrefix}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: priority,
      });

      // Pages principales
      fallbackEntries.push({
        url: `${SEO_CONFIG.baseUrl}${langPrefix}/tools`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9 * priority,
      });

      fallbackEntries.push({
        url: `${SEO_CONFIG.baseUrl}${langPrefix}/categories`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8 * priority,
      });
    });

    console.log(`🔄 Using fallback sitemap: ${fallbackEntries.length} entries`);
    return fallbackEntries;
  }
}

/**
 * Configuration Next.js pour performance optimale
 */
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 heure - équilibre fraîcheur/performance
