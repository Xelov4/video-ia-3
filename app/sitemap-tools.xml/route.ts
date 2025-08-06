/**
 * Tools Sitemap Generator
 * Dedicated sitemap for all AI tools
 * Optimized for search engines with proper priorities and frequencies
 */

import { toolsService } from '@/src/lib/database/services/tools'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  
  try {
    // Get all tools with pagination to handle large datasets
    const toolsResult = await toolsService.searchTools({ 
      limit: 50000,
      sortBy: 'updated_at',
      sortOrder: 'desc'
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${toolsResult.tools.map(tool => {
  const lastModified = tool.updated_at ? new Date(tool.updated_at) : new Date(tool.created_at || new Date())
  const priority = tool.featured ? 0.9 : (tool.quality_score && tool.quality_score >= 8 ? 0.8 : 0.7)
  
  return `  <url>
    <loc>${baseUrl}/tools/${tool.slug || tool.id}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${tool.image_url ? `
    <image:image>
      <image:loc>${tool.image_url}</image:loc>
      <image:title>${tool.tool_name}</image:title>
      <image:caption>${tool.overview || tool.tool_description?.substring(0, 200) || tool.tool_name}</image:caption>
    </image:image>` : ''}
  </url>`
}).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
    
  } catch (error) {
    console.error('Error generating tools sitemap:', error)
    
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/tools</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
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