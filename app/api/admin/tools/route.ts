import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/database/client'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

// Validation schema pour les paramètres de requête
const querySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(20),
  sortBy: z.string().optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  minViews: z.coerce.number().optional()
})

export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupération et validation des paramètres
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validatedParams = querySchema.parse(params)

    // Construction de la requête Prisma
    const where = {
      AND: [
        // Recherche textuelle
        validatedParams.search ? {
          OR: [
            { toolName: { contains: validatedParams.search, mode: 'insensitive' } },
            { toolCategory: { contains: validatedParams.search, mode: 'insensitive' } },
            { overview: { contains: validatedParams.search, mode: 'insensitive' } }
          ]
        } : {},
        // Filtres
        validatedParams.category ? { toolCategory: validatedParams.category } : {},
        validatedParams.featured ? { featured: true } : {},
        validatedParams.active ? { isActive: true } : {},
        validatedParams.minViews ? { viewCount: { gte: validatedParams.minViews } } : {}
      ]
    }

    // Exécution des requêtes
    const [totalCount, tools] = await Promise.all([
      prisma.tool.count({ where }),
      prisma.tool.findMany({
        where,
        orderBy: { [validatedParams.sortBy]: validatedParams.sortOrder },
        skip: (validatedParams.page - 1) * validatedParams.pageSize,
        take: validatedParams.pageSize,
        select: {
          id: true,
          toolName: true,
          toolCategory: true,
          toolLink: true,
          imageUrl: true,
          overview: true,
          featured: true,
          isActive: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ])

    return NextResponse.json({
      tools: tools.map(tool => ({
        id: tool.id,
        toolName: tool.toolName,
        toolCategory: tool.toolCategory,
        toolLink: tool.toolLink,
        imageUrl: tool.imageUrl,
        overview: tool.overview,
        featured: tool.featured,
        isActive: tool.isActive,
        viewCount: tool.viewCount,
        createdAt: tool.createdAt,
        updatedAt: tool.updatedAt
      })),
      totalCount
    })

  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des outils' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await prisma.tool.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting tool:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'outil' },
      { status: 500 }
    )
  }
}