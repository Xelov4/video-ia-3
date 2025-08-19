/**
 * Single Blog Post API Route - Public
 *
 * Route API publique pour récupérer un article spécifique du blog.
 *
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { PostsService } from '@/src/lib/database/services/posts';

/**
 * GET /api/blog/posts/[slug]
 * Récupérer un article spécifique par son slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'fr';

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug requis' },
        { status: 400 }
      );
    }

    console.log('📖 Getting blog post by slug:', slug, 'language:', language);

    // Récupérer l'article par slug
    const post = await PostsService.getPostBySlug(slug, language);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'article est publié
    if (post.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: 'Article non disponible' },
        { status: 404 }
      );
    }

    // Incrémenter le compteur de vues
    try {
      await PostsService.incrementViewCount(post.id);
    } catch (error) {
      console.warn('⚠️ Failed to increment view count:', error);
    }

    // Transformer les données pour le frontend
    const transformedPost = {
      ...post,
      translation:
        post.translations.find(t => t.languageCode === language) ||
        post.translations[0] ||
        {},
    };

    return NextResponse.json({
      success: true,
      data: transformedPost,
      message: 'Article récupéré avec succès',
    });
  } catch (error) {
    console.error('❌ Error in GET /api/blog/posts/[slug]:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération de l'article",
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
