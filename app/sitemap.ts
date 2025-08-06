/**
 * Sitemap Index Principal - SEO Multilingue
 * 
 * Génère un sitemap index qui référence tous les sitemaps
 * par langue pour optimisation SEO maximale.
 */

import { MetadataRoute } from 'next'
import { SUPPORTED_LOCALES } from '@/middleware'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const currentDate = new Date()
  
  // Entrées principales multilingues
  const mainEntries: MetadataRoute.Sitemap = []
  
  // Pour chaque langue, ajouter les pages principales
  SUPPORTED_LOCALES.forEach(locale => {
    const langPrefix = locale === 'en' ? '' : `/${locale}`
    const priority = locale === 'en' ? 1.0 : 0.9 // Priorité légèrement plus élevée pour EN
    
    // Homepage
    mainEntries.push({
      url: `${baseUrl}${langPrefix}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: priority
    })
    
    // Pages principales
    const mainPages = [
      { path: '/tools', priority: 0.9, freq: 'daily' as const },
      { path: '/categories', priority: 0.8, freq: 'weekly' as const }
    ]
    
    mainPages.forEach(page => {
      mainEntries.push({
        url: `${baseUrl}${langPrefix}${page.path}`,
        lastModified: currentDate,
        changeFrequency: page.freq,
        priority: page.priority * (locale === 'en' ? 1.0 : 0.95)
      })
    })
  })
  
  return mainEntries
}

/**
 * Export de la configuration pour Next.js
 */
export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24h