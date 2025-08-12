/**
 * Robots.txt Dynamique - SEO Multilingue
 * 
 * Génère un fichier robots.txt optimisé avec sitemaps
 * pour toutes les langues supportées.
 */

import { NextResponse } from 'next/server'
import { supportedLocales } from '@/middleware'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  
  // Configuration robots par environnement
  const isProduction = process.env.NODE_ENV === 'production'
  const allowCrawling = process.env.ALLOW_CRAWLING !== 'false'
  
  // Génération des sitemaps par langue
  const sitemapUrls = supportedLocales.map(locale => 
    `Sitemap: ${baseUrl}/sitemap-${locale}.xml`
  ).join('\n')
  
  // Sitemap principal (index)
  const mainSitemap = `Sitemap: ${baseUrl}/sitemap.xml`
  
  // Règles par environnement
  const robotsRules = isProduction && allowCrawling ? `# Production robots.txt - Video-IA.net
# Allow all crawlers access to all content

User-agent: *
Allow: /

# Specific rules for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

# Block admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /.*\\.json$

# Allow specific API routes for SEO
Allow: /api/sitemap/
Allow: /api/robots

# Multilingual sitemaps
${sitemapUrls}
${mainSitemap}

# Additional directives
Host: ${baseUrl}
` : `# Development/Staging robots.txt - Video-IA.net
# Prevent indexing in non-production environments

User-agent: *
Disallow: /

# Still provide sitemaps for testing
${sitemapUrls}
${mainSitemap}
`

  return new NextResponse(robotsRules, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': isProduction 
        ? 'public, max-age=86400' // 24h en production
        : 'no-cache', // Pas de cache en dev
      'X-Robots-Environment': isProduction ? 'production' : 'development',
      'X-Crawling-Allowed': allowCrawling.toString()
    }
  })
}

export const dynamic = 'force-dynamic'