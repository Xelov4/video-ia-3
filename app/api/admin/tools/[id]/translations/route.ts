import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/database/client'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

const translationSchema = z.object({
  languageCode: z.string(),
  name: z.string(),
  overview: z.string().optional(),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  translationSource: z.string(),
  qualityScore: z.number(),
  humanReviewed: z.boolean()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const translations = await prisma.toolTranslation.findMany({
      where: { tool_id: parseInt(resolvedParams.id) }
    })

    return NextResponse.json({ success: true, translations })

  } catch (error) {
    console.error('Error fetching translations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des traductions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = translationSchema.parse(body)

    const translation = await prisma.toolTranslation.create({
      data: {
        tool_id: parseInt(resolvedParams.id),
        language_code: validatedData.languageCode,
        name: validatedData.name,
        overview: validatedData.overview,
        description: validatedData.description,
        meta_title: validatedData.metaTitle,
        meta_description: validatedData.metaDescription,
        translation_source: validatedData.translationSource,
        quality_score: validatedData.qualityScore,
        human_reviewed: validatedData.humanReviewed
      }
    })

    return NextResponse.json({ success: true, translation })

  } catch (error) {
    console.error('Error creating translation:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.flatten() },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création de la traduction' },
      { status: 500 }
    )
  }
}
