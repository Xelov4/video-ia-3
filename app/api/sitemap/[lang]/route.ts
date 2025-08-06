/**
 * Sitemap Dynamique par Langue - SEO Multilingue
 * 
 * Génère des sitemaps optimisés pour chaque langue avec
 * toutes les pages, outils et catégories traduites.
 */

import { NextRequest, NextResponse } from 'next/server'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/middleware'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'

// Interface pour entrée sitemap
interface SitemapEntry {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  alternates?: { [key: string]: string }
}

/**
 * Génération XML sitemap
 */
function generateSitemapXML(entries: SitemapEntry[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  
  const urlEntries = entries.map(entry => {
    const alternateLinks = entry.alternates 
      ? Object.entries(entry.alternates)
          .map(([lang, url]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />`)
          .join('\n')
      : ''

    return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
${alternateLinks}
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`
}

/**
 * Construction des URLs alternatives pour hreflang
 */
function buildAlternateUrls(basePath: string): { [key: string]: string } {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const alternates: { [key: string]: string } = {}
  
  SUPPORTED_LOCALES.forEach(locale => {
    if (locale === 'en') {
      alternates[locale] = `${baseUrl}${basePath}`
      alternates['x-default'] = `${baseUrl}${basePath}` // Langue par défaut
    } else {
      alternates[locale] = `${baseUrl}/${locale}${basePath}`
    }
  })
  
  return alternates
}

/**
 * GET /api/sitemap/[lang]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string } }
) {
  const lang = params.lang as SupportedLocale
  
  // Validation langue
  if (!SUPPORTED_LOCALES.includes(lang)) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 404 })
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
    const langPrefix = lang === 'en' ? '' : `/${lang}`
    const currentDate = new Date().toISOString()
    
    const sitemapEntries: SitemapEntry[] = []
    
    // 1. Pages principales
    const mainPages = [
      { path: '', priority: 1.0, changeFreq: 'daily' as const },
      { path: '/tools', priority: 0.9, changeFreq: 'daily' as const },
      { path: '/categories', priority: 0.8, changeFreq: 'weekly' as const }
    ]
    
    mainPages.forEach(page => {
      sitemapEntries.push({
        url: `${baseUrl}${langPrefix}${page.path}`,
        lastModified: currentDate,
        changeFrequency: page.changeFreq,
        priority: page.priority,
        alternates: buildAlternateUrls(page.path)
      })
    })
    
    // 2. Récupération des données en parallèle pour performance
    const [toolsResult, categoriesResult] = await Promise.all([
      // Récupération par batches pour éviter timeout
      multilingualToolsService.searchTools({
        language: lang,
        limit: 1000, // Premier batch
        useCache: false // Données fraîches pour sitemap
      }),
      
      multilingualCategoriesService.getAllCategories(lang, {
        includeEmpty: false,
        useCache: false
      })
    ])
    
    // 3. Pages d'outils
    toolsResult.tools.forEach(tool => {
      const toolSlug = tool.slug || tool.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      sitemapEntries.push({
        url: `${baseUrl}${langPrefix}/tools/${toolSlug}`,
        lastModified: tool.updatedAt?.toISOString() || tool.createdAt?.toISOString() || currentDate,
        changeFrequency: 'weekly',
        priority: tool.featured ? 0.8 : 0.6,
        alternates: buildAlternateUrls(`/tools/${toolSlug}`)
      })
    })
    
    // 4. Si plus d'outils disponibles, récupérer les suivants
    if (toolsResult.pagination.hasNextPage) {
      let page = 2
      while (page <= Math.min(toolsResult.pagination.totalPages, 10)) { // Limite à 10 pages max pour éviter timeout
        try {
          const moreTools = await multilingualToolsService.searchTools({
            language: lang,
            page,
            limit: 1000,
            useCache: false
          })
          
          moreTools.tools.forEach(tool => {
            const toolSlug = tool.slug || tool.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            
            sitemapEntries.push({
              url: `${baseUrl}${langPrefix}/tools/${toolSlug}`,
              lastModified: tool.updatedAt?.toISOString() || tool.createdAt?.toISOString() || currentDate,
              changeFrequency: 'weekly',
              priority: tool.featured ? 0.8 : 0.6,
              alternates: buildAlternateUrls(`/tools/${toolSlug}`)
            })
          })
          
          page++
          
          if (!moreTools.pagination.hasNextPage) break
          
        } catch (error) {
          console.error(`Error fetching tools page ${page}:`, error)
          break
        }
      }
    }
    
    // 5. Pages de catégories avec filtres
    categoriesResult.categories.forEach(category => {
      // Page principale de catégorie
      const categoryPath = `/tools?category=${encodeURIComponent(category.name)}`
      
      sitemapEntries.push({
        url: `${baseUrl}${langPrefix}${categoryPath}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: category.isFeatured ? 0.7 : 0.5,
        alternates: buildAlternateUrls(categoryPath)
      })
    })
    
    // 6. Génération du XML final
    const sitemapXML = generateSitemapXML(sitemapEntries)
    
    // 7. Headers pour cache et SEO
    const response = new NextResponse(sitemapXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400', // Cache 1h public, 24h CDN
        'Last-Modified': currentDate,
        'X-Sitemap-Language': lang,
        'X-Sitemap-Entries': sitemapEntries.length.toString()
      }
    })
    
    return response
    
  } catch (error) {
    console.error(`Sitemap generation error for ${lang}:`, error)
    
    return NextResponse.json(
      { 
        error: 'Sitemap generation failed',
        language: lang,
        timestamp: new Date().toISOString()
      }, 
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    )
  }
}

/**
 * Gestion de la méthode HEAD pour checks de disponibilité
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: { lang: string } }
) {
  const lang = params.lang as SupportedLocale
  
  if (!SUPPORTED_LOCALES.includes(lang)) {
    return new NextResponse(null, { status: 404 })
  }
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Sitemap-Language': lang
    }
  })
}

/**
 * Configuration de la route pour toutes les langues
 */
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidation toutes les heures