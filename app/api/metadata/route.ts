/**
 * Metadata API Endpoint
 * Provides dynamic filter options for the universal search component
 */

import { NextRequest, NextResponse } from 'next/server'
import { CategoriesService } from '@/src/lib/database/services/categories'
import { prisma } from '@/src/lib/database/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const context = searchParams.get('context') || 'tools'
    const includeEmpty = searchParams.get('includeEmpty') === 'true'

    let metadata: any = {
      context,
      timestamp: new Date().toISOString()
    }

    switch (context) {
      case 'tools':
      case 'admin-tools':
        // Get categories with tool counts
        const categories = await CategoriesService.getAllCategories(!includeEmpty)
        
        // Get additional tool metadata
        const [toolStats, popularTags] = await Promise.all([
          prisma.tool.aggregate({
            where: { isActive: true },
            _count: { id: true },
            _min: { quality_score: true },
            _max: { quality_score: true }
          }),
          // Get top tags from tools
          prisma.$queryRaw`
            SELECT unnest(string_to_array(tags, ',')) as tag, COUNT(*) as count
            FROM tools 
            WHERE is_active = true AND tags IS NOT NULL AND tags != ''
            GROUP BY tag
            HAVING COUNT(*) >= 5
            ORDER BY count DESC
            LIMIT 20
          `
        ])

        metadata = {
          ...metadata,
          categories: categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            count: cat.actualToolCount || cat.toolCount || 0,
            emoji: cat.emoji,
            featured: cat.isFeatured
          })),
          tags: Array.isArray(popularTags) ? popularTags.map((t: any) => ({
            name: t.tag?.trim(),
            count: parseInt(t.count)
          })).filter(t => t.name && t.name.length > 0) : [],
          stats: {
            totalTools: toolStats._count.id || 0,
            minQualityScore: toolStats._min.quality_score || 0,
            maxQualityScore: toolStats._max.quality_score || 10
          },
          sortOptions: [
            { value: 'created_at', label: 'Date de création', default: true },
            { value: 'updated_at', label: 'Date de modification' },
            { value: 'view_count', label: 'Popularité' },
            { value: 'quality_score', label: 'Score qualité' },
            { value: 'tool_name', label: 'Nom A-Z' }
          ],
          filterOptions: {
            featured: [
              { value: '', label: 'Tous les outils' },
              { value: 'true', label: 'En vedette' },
              { value: 'false', label: 'Standards' }
            ],
            status: context === 'admin-tools' ? [
              { value: '', label: 'Tous les statuts' },
              { value: 'true', label: 'Actifs' },
              { value: 'false', label: 'Inactifs' }
            ] : [],
            qualityScore: [
              { value: '', label: 'Tous les scores' },
              { value: '8-10', label: 'Excellent (8-10)' },
              { value: '6-8', label: 'Bon (6-8)' },
              { value: '0-6', label: 'À améliorer (0-6)' }
            ]
          }
        }
        break

      case 'categories':
      case 'admin-categories':
        const allCategories = await CategoriesService.getAllCategories(includeEmpty)
        const categoryStats = await CategoriesService.getCategoryStatistics()

        metadata = {
          ...metadata,
          categories: allCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            count: cat.actualToolCount || cat.toolCount || 0,
            emoji: cat.emoji,
            featured: cat.isFeatured,
            hasTools: (cat.actualToolCount || cat.toolCount) > 0
          })),
          stats: categoryStats,
          sortOptions: [
            { value: 'toolCount', label: 'Nombre d\'outils', default: true },
            { value: 'name', label: 'Nom A-Z' },
            { value: 'createdAt', label: 'Date de création' }
          ],
          filterOptions: {
            featured: [
              { value: '', label: 'Toutes les catégories' },
              { value: 'true', label: 'En vedette' },
              { value: 'false', label: 'Standards' }
            ],
            hasTools: [
              { value: '', label: 'Toutes' },
              { value: 'true', label: 'Avec outils' },
              { value: 'false', label: 'Vides' }
            ],
            toolCount: [
              { value: '', label: 'Tous les nombres' },
              { value: '50+', label: '50+ outils' },
              { value: '20-50', label: '20-50 outils' },
              { value: '10-20', label: '10-20 outils' },
              { value: '1-10', label: '1-10 outils' },
              { value: '0', label: 'Aucun outil' }
            ]
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Context non supporté', supportedContexts: ['tools', 'admin-tools', 'categories', 'admin-categories'] },
          { status: 400 }
        )
    }

    // Cache headers for performance
    const response = NextResponse.json(metadata)
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
    
    return response

  } catch (error) {
    console.error('Error in metadata API:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des métadonnées',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}