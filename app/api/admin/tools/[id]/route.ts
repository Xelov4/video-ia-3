import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/database/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

// Validation schema pour les données d'outil
const toolSchema = z.object({
  tool_name: z.string().min(1),
  tool_category: z.string().optional(),
  tool_link: z.string().url().optional(),
  overview: z.string().optional(),
  tool_description: z.string().optional(),
  target_audience: z.string().optional(),
  key_features: z.string().optional(),
  use_cases: z.string().optional(),
  tags: z.string().optional(),
  image_url: z.string().url().optional().nullable(),
  slug: z.string(),
  is_active: z.boolean(),
  featured: z.boolean(),
  quality_score: z.number().min(0).max(100),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  seo_keywords: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tool = await prisma.tool.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        translations: true,
      },
    });

    if (!tool) {
      return NextResponse.json({ error: 'Outil non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tool });
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'outil" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = toolSchema.parse(body);

    const updatedTool = await prisma.tool.update({
      where: { id: parseInt(params.id) },
      data: validatedData,
    });

    return NextResponse.json({ success: true, tool: updatedTool });
  } catch (error) {
    console.error('Error updating tool:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'outil" },
      { status: 500 }
    );
  }
}
