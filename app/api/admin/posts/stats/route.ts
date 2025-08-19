/**
 * Posts Statistics API Routes - Admin Only
 *
 * Routes API pour obtenir les statistiques des posts.
 *
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PostsService } from '@/src/lib/database/services/posts';
import { authOptions } from '../../../auth/[...nextauth]/route';

/**
 * GET /api/admin/posts/stats
 * Obtenir les statistiques des posts
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    console.log('📊 Getting posts statistics');

    const stats = await PostsService.getPostsStats();

    return NextResponse.json({
      success: true,
      stats: stats,
      message: 'Statistiques récupérées avec succès',
    });
  } catch (error) {
    console.error('❌ Error in GET /api/admin/posts/stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
