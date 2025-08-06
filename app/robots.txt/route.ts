/**
 * Robots.txt Generator
 * SEO-optimized robots.txt with sitemap references
 */

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  
  const robotsTxt = `# Video-IA.net Robots.txt
# AI Tools Directory - SEO Optimized

User-agent: *
Allow: /

# Allow search engines to access all content
Allow: /tools
Allow: /categories
Allow: /api/
Allow: /_next/static/

# Prevent indexing of admin areas
Disallow: /admin
Disallow: /admin/*
Disallow: /scraper

# Prevent indexing of API routes (except structured data)
Disallow: /api/auth/
Disallow: /api/scrape

# Sitemaps
Sitemap: ${baseUrl}/sitemap-index.xml
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-tools.xml
Sitemap: ${baseUrl}/sitemap-categories.xml
Sitemap: ${baseUrl}/sitemap-blog.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Host directive (optional)
Host: ${baseUrl}`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  })
}