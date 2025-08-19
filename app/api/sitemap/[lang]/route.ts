/**
 * Sitemap Dynamique par Langue - SEO Multilingue
 *
 * Génère des sitemaps optimisés pour chaque langue avec
 * toutes les pages, outils et catégories traduites.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SupportedLocale, supportedLocales } from '@/middleware';
import { toolsService } from '@/src/lib/database/services/tools';
import { CategoriesService } from '@/src/lib/database/services/categories';

// Interface pour entrée sitemap
interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority: number;
  alternates?: { [key: string]: string };
}

/**
 * Génération XML sitemap
 */
function generateSitemapXML(entries: SitemapEntry[]): string {
  const _baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net';

  const urlEntries = entries
    .map(entry => {
      const alternateLinks = entry.alternates
        ? Object.entries(entry.alternates)
            .map(
              ([lang, url]) =>
                `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />`
            )
            .join('\n')
        : '';

      return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
${alternateLinks}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
}

/**
 * Construction des URLs alternatives pour hreflang
 */
function buildAlternateUrls(basePath: string): { [key: string]: string } {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net';
  const alternates: { [key: string]: string } = {};

  supportedLocales.forEach(locale => {
    if (locale === 'en') {
      alternates[locale] = `${baseUrl}${basePath}`;
      alternates['x-default'] = `${baseUrl}${basePath}`; // Langue par défaut
    } else {
      alternates[locale] = `${baseUrl}/${locale}${basePath}`;
    }
  });

  return alternates;
}

/**
 * Récupération des données avec fallbacks robustes
 */
async function getSitemapData(lang: SupportedLocale) {
  try {
    // Récupération parallèle des données avec fallbacks
    const [toolsResult, categories] = await Promise.all([
      toolsService
        .searchTools({
          limit: 5000, // Limite raisonnable pour éviter timeout
        })
        .catch(() => ({
          tools: [],
          pagination: { totalPages: 0, hasNextPage: false },
        })),
      CategoriesService.getAllCategories().catch(() => []),
    ]);

    return {
      tools: toolsResult.tools || [],
      categories: categories || [],
      success: true,
    };
  } catch (error) {
    console.error(`Error fetching sitemap data for ${lang}:`, error);
    return {
      tools: [],
      categories: [],
      success: false,
    };
  }
}

/**
 * GET /api/sitemap/[lang]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  const lang = params.lang as SupportedLocale;

  // Validation langue
  if (!supportedLocales.includes(lang)) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 404 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net';
    const langPrefix = lang === 'en' ? '' : `/${lang}`;
    const currentDate = new Date().toISOString();

    const sitemapEntries: SitemapEntry[] = [];

    // 1. Pages principales
    const mainPages = [
      { path: '', priority: 1.0, changeFreq: 'daily' as const },
      { path: '/tools', priority: 0.9, changeFreq: 'daily' as const },
      { path: '/categories', priority: 0.8, changeFreq: 'weekly' as const },
      { path: '/about', priority: 0.6, changeFreq: 'monthly' as const },
    ];

    mainPages.forEach(page => {
      sitemapEntries.push({
        url: `${baseUrl}${langPrefix}${page.path}`,
        lastModified: currentDate,
        changeFrequency: page.changeFreq,
        priority: page.priority,
        alternates: buildAlternateUrls(page.path),
      });
    });

    // 2. Récupération des données
    const { tools, categories, success } = await getSitemapData(lang);

    if (!success) {
      console.warn(`⚠️ Using fallback data for ${lang} sitemap`);
    }

    // 3. Pages d'outils (limitées pour performance)
    tools.slice(0, 1000).forEach(tool => {
      const toolSlug = tool.slug || tool.id;
      const lastModified = tool.updated_at
        ? new Date(tool.updated_at).toISOString()
        : tool.created_at
          ? new Date(tool.created_at).toISOString()
          : currentDate;

      const basePriority = tool.featured ? 0.8 : 0.6;
      const langMultiplier = lang === 'en' ? 1 : 0.8; // Adjust priority for English
      sitemapEntries.push({
        url: `${baseUrl}${langPrefix}/t/${toolSlug}`,
        lastModified: lastModified,
        changeFrequency: 'weekly',
        priority: basePriority * langMultiplier,
        alternates: buildAlternateUrls(`/t/${toolSlug}`),
      });
    });

    // 4. Pages de catégories
    categories.forEach(category => {
      sitemapEntries.push({
        url: `${baseUrl}${langPrefix}/categories/${category.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: buildAlternateUrls(`/categories/${category.slug}`),
      });
    });

    // 5. Génération du XML final
    const sitemapXML = generateSitemapXML(sitemapEntries);

    // 6. Headers pour cache et SEO
    const response = new NextResponse(sitemapXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400', // Cache 1h public, 24h CDN
        'Last-Modified': currentDate,
        'X-Sitemap-Language': lang,
        'X-Sitemap-Entries': sitemapEntries.length.toString(),
      },
    });

    console.log(`✅ Sitemap generated for ${lang}: ${sitemapEntries.length} entries`);
    return response;
  } catch (error) {
    console.error(`❌ Sitemap generation error for ${lang}:`, error);

    // Fallback minimal pour cette langue
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net';
    const langPrefix = lang === 'en' ? '' : `/${lang}`;
    const currentDate = new Date().toISOString();

    const fallbackEntries: SitemapEntry[] = [
      {
        url: `${baseUrl}${langPrefix}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 1.0,
        alternates: buildAlternateUrls(''),
      },
      {
        url: `${baseUrl}${langPrefix}/tools`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9,
        alternates: buildAlternateUrls('/tools'),
      },
      {
        url: `${baseUrl}${langPrefix}/categories`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: buildAlternateUrls('/categories'),
      },
    ];

    const fallbackXML = generateSitemapXML(fallbackEntries);

    return new NextResponse(fallbackXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache court pour fallback
        'Last-Modified': currentDate,
        'X-Sitemap-Language': lang,
        'X-Sitemap-Entries': fallbackEntries.length.toString(),
        'X-Sitemap-Fallback': 'true',
      },
    });
  }
}

/**
 * Gestion de la méthode HEAD pour checks de disponibilité
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  const lang = params.lang as SupportedLocale;

  if (!supportedLocales.includes(lang)) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Sitemap-Language': lang,
    },
  });
}

/**
 * Configuration de la route pour toutes les langues
 */
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidation toutes les heures
