/**
 * Robots.txt Dynamique - SEO Multilingue
 * 
 * Génère un fichier robots.txt optimisé avec sitemaps
 * pour toutes les langues supportées.
 */

import { NextResponse } from 'next/server'
import { supportedLocales } from '@/middleware'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
    
    // Essayer de lire le contenu personnalisé depuis le fichier de configuration
    let robotsContent: string
    let lastModified: string
    let environment: string
    let crawlingAllowed: boolean
    
    try {
      const configPath = path.join(process.cwd(), 'config', 'robots.json')
      const configData = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(configData)
      
      robotsContent = config.content
      lastModified = config.lastModified
      environment = config.environment
      crawlingAllowed = true // Si on a un contenu personnalisé, on autorise l'indexation
    } catch (error) {
      // Fallback vers la génération automatique si le fichier n'existe pas
      const isProduction = process.env.NODE_ENV === 'production'
      crawlingAllowed = process.env.ALLOW_CRAWLING !== 'false'
      
      // Génération des sitemaps par langue
      const sitemapUrls = supportedLocales.map(locale => 
        `Sitemap: ${baseUrl}/sitemap-${locale}.xml`
      ).join('\n')
      
      // Sitemap principal (index)
      const mainSitemap = `Sitemap: ${baseUrl}/sitemap.xml`
      
      // Règles par environnement
      robotsContent = isProduction && crawlingAllowed ? `# Production robots.txt - Video-IA.net
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
      
      lastModified = new Date().toISOString()
      environment = isProduction ? 'production' : 'development'
    }
    
    return new NextResponse(robotsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': environment === 'production' 
          ? 'public, max-age=86400' // 24h en production
          : 'no-cache', // Pas de cache en dev
        'X-Robots-Environment': environment,
        'X-Crawling-Allowed': crawlingAllowed.toString(),
        'Last-Modified': lastModified
      }
    })
  } catch (error) {
    console.error('Erreur lors de la génération du robots.txt:', error)
    
    // Retourner un robots.txt d'erreur
    const errorContent = `# Error robots.txt - Video-IA.net
# An error occurred while generating the robots.txt file
# Please contact the administrator

User-agent: *
Disallow: /`
    
    return new NextResponse(errorContent, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Robots-Environment': 'error',
        'X-Crawling-Allowed': 'false'
      }
    })
  }
}

// Fonction pour sauvegarder le contenu du robots.txt
async function saveRobotsContent(content: string) {
  try {
    const configPath = path.join(process.cwd(), 'config', 'robots.json')
    
    // Lire la configuration actuelle
    let config
    try {
      const configData = await fs.readFile(configPath, 'utf-8')
      config = JSON.parse(configData)
    } catch (error) {
      // Si le fichier n'existe pas, créer une configuration par défaut
      config = {
        content: '',
        lastModified: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    }
    
    // Mettre à jour la configuration
    config.content = content
    config.lastModified = new Date().toISOString()
    
    // Sauvegarder dans le fichier
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
    
    return { success: true, message: 'Robots.txt sauvegardé avec succès' }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du fichier de configuration:', error)
    throw new Error('Erreur lors de la sauvegarde de la configuration')
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json()
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Le contenu est requis et doit être une chaîne de caractères' },
        { status: 400 }
      )
    }
    
    // Valider le contenu (vérifications basiques)
    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Le contenu est trop long (maximum 10000 caractères)' },
        { status: 400 }
      )
    }
    
    // Sauvegarder le contenu
    const result = await saveRobotsContent(content)
    
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du robots.txt:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'