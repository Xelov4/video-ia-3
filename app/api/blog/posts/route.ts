/**
 * Blog Posts API Routes - Public
 *
 * Routes API publiques pour récupérer les articles du blog.
 *
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { PostsService } from '@/src/lib/database/services/posts';

/**
 * GET /api/blog/posts
 * Récupérer la liste des articles publiés du blog
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;
    const featured = searchParams.get('featured') === 'true';
    const language = searchParams.get('lang') || 'fr';

    console.log('📖 Getting published blog posts', {
      page,
      limit,
      category,
      tag,
      search,
      featured,
      language,
    });

    // Récupérer seulement les articles publiés
    const result = await PostsService.searchPosts({
      query: search,
      status: 'PUBLISHED', // Seulement les articles publiés
      postType: undefined,
      categorySlug: category,
      tagSlug: tag,
      isFeatured: featured ? true : undefined,
      language,
      page,
      limit,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });

    // Transformer les données pour le frontend
    const transformedPosts = result.posts.map(post => ({
      ...post,
      translation:
        post.translations.find(t => t.languageCode === language) ||
        post.translations[0] ||
        {},
    }));

    return NextResponse.json({
      success: true,
      data: transformedPosts,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.totalCount,
        totalPages: result.totalPages,
      },
      message: 'Articles récupérés avec succès',
    });
  } catch (error) {
    console.error('❌ Error in GET /api/blog/posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des articles',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
