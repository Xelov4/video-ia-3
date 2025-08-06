/**
 * Languages API Route
 * 
 * Provides information about supported languages, their status,
 * and configuration for the multilingual system.
 * 
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { LANGUAGES_CONFIG, SUPPORTED_LANGUAGES, ENABLED_LANGUAGES } from '@/src/lib/i18n/types'
import { prisma } from '@/src/lib/database/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/languages
 * 
 * Returns list of supported languages with their configuration
 * and translation statistics.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('stats') !== 'false'
    const enabledOnly = searchParams.get('enabled') === 'true'
    
    let languages = enabledOnly ? ENABLED_LANGUAGES : SUPPORTED_LANGUAGES
    
    const result = await Promise.all(
      languages.map(async (langCode) => {
        const config = LANGUAGES_CONFIG[langCode]
        
        let stats = null
        if (includeStats) {
          try {
            // Récupérer statistiques des traductions
            const [toolTranslations, categoryTranslations] = await Promise.all([
              prisma.toolTranslation.count({
                where: { languageCode: langCode }
              }),
              prisma.categoryTranslation.count({
                where: { languageCode: langCode }
              })
            ])
            
            // Calculer le taux de couverture
            const [totalTools, totalCategories] = await Promise.all([
              prisma.tool.count({ where: { isActive: true } }),
              prisma.category.count()
            ])
            
            const toolCoverage = totalTools > 0 ? (toolTranslations / totalTools * 100) : 0
            const categoryCoverage = totalCategories > 0 ? (categoryTranslations / totalCategories * 100) : 0
            
            stats = {
              toolTranslations,
              categoryTranslations,
              toolCoverage: Math.round(toolCoverage * 100) / 100,
              categoryCoverage: Math.round(categoryCoverage * 100) / 100,
              overallCoverage: Math.round(((toolCoverage + categoryCoverage) / 2) * 100) / 100
            }
          } catch (error) {
            console.error(`Error getting stats for language ${langCode}:`, error)
            stats = {
              toolTranslations: 0,
              categoryTranslations: 0,
              toolCoverage: 0,
              categoryCoverage: 0,
              overallCoverage: 0,
              error: 'Stats unavailable'
            }
          }
        }
        
        return {
          ...config,
          stats
        }
      })
    )
    
    // Trier par sortOrder
    result.sort((a, b) => a.sortOrder - b.sortOrder)
    
    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        totalLanguages: result.length,
        enabledLanguages: result.filter(lang => lang.enabled).length,
        includeStats,
        enabledOnly,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/languages:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve languages',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/languages
 * 
 * Admin endpoint to update language configuration.
 * Currently returns 501 - feature not implemented yet.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Language configuration updates not implemented yet',
      timestamp: new Date().toISOString()
    },
    { status: 501 }
  )
}