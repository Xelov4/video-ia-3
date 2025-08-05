/**
 * API endpoint pour récupérer un outil par son slug
 * GET /api/tools/[slug] - Détails d'un outil spécifique
 */

import { NextRequest, NextResponse } from 'next/server';
import { ToolsService } from '@/src/lib/database/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Récupérer l'outil par son slug
    const tool = await ToolsService.getToolBySlug(slug);
    
    if (!tool) {
      return NextResponse.json(
        {
          success: false,
          error: 'Outil non trouvé',
          message: `Aucun outil trouvé avec le slug: ${slug}`
        },
        { status: 404 }
      );
    }
    
    // Incrémenter le compteur de vues
    await ToolsService.incrementViewCount(tool.id);
    
    return NextResponse.json({
      success: true,
      data: tool,
      message: 'Outil récupéré avec succès'
    });
    
  } catch (error) {
    console.error('Erreur API /api/tools/[slug]:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de l\'outil',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}