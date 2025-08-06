/**
 * Dynamic Sitemap Generator
 * Generates comprehensive sitemap.xml for SEO optimization
 * Includes all static pages, dynamic routes, tools, and categories
 */

import { MetadataRoute } from 'next'
import { toolsService } from '@/src/lib/database/services/tools'
import { CategoriesService } from '@/src/lib/database/services/categories'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  
  try {
    // Get all tools and categories
    const [toolsResult, categories] = await Promise.all([
      toolsService.searchTools({ limit: 50000 }).catch(() => ({ tools: [] })),
      CategoriesService.getAllCategories().catch(() => [])
    ])

    const sitemap: MetadataRoute.Sitemap = [
      // Static pages
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/tools`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      
      // Category pages
      ...categories.map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      })),
      
      // Tool pages
      ...toolsResult.tools.map((tool) => ({
        url: `${baseUrl}/tools/${tool.slug || tool.id}`,
        lastModified: tool.updated_at ? new Date(tool.updated_at) : new Date(tool.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: tool.featured ? 0.8 : 0.6,
      }))
    ]

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified instanceof Date ? item.lastModified.toISOString() : new Date(item.lastModified || new Date()).toISOString()}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback minimal sitemap
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>${baseUrl}/tools</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/categories</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`

    return new Response(fallbackXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    })
  }
}