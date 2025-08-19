/**
 * Posts API Routes - Admin Only
 *
 * Routes API pour la gestion des posts/articles dans l'interface admin.
 * Toutes les opérations CRUD et de recherche.
 *
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PostsService, PostData } from '@/src/lib/database/services/posts';
import { authOptions } from '@/src/lib/auth/auth-options';
import { prisma } from '@/src/lib/database/client';

/**
 * GET /api/admin/posts
 * Rechercher et lister les posts avec pagination et filtres
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

    const { searchParams } = new URL(request.url);

    // Paramètres de recherche
    const params = {
      query: searchParams.get('query') || searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      postType: (searchParams.get('postType') as any) || undefined,
      featured: searchParams.get('featured')
        ? searchParams.get('featured') === 'true'
        : undefined,
      authorId: searchParams.get('authorId')
        ? parseInt(searchParams.get('authorId')!)
        : undefined,
      language: searchParams.get('language') || 'fr', // Support multilingue
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(
        searchParams.get('limit') || searchParams.get('pageSize') || '20'
      ),
      sortBy:
        searchParams.get('sortBy') || searchParams.get('sortOrder') || 'updatedAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    console.log('📊 Searching posts with params:', params);

    const result = await PostsService.searchPosts(params);

    return NextResponse.json({
      success: true,
      data: result,
      message: `${result.totalCount} posts trouvés`,
    });
  } catch (error) {
    console.error('❌ Error in GET /api/admin/posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la recherche des posts',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/posts
 * Créer un nouveau post
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation des données requises
    if (!body.slug) {
      return NextResponse.json(
        { success: false, error: 'Le champ slug est requis' },
        { status: 400 }
      );
    }

    // Récupérer l'ID de l'utilisateur depuis la session
    const adminUser = await prisma.admin_users.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur admin non trouvé' },
        { status: 404 }
      );
    }

    // Vérification de l'unicité du slug
    const existingPost = await PostsService.getPostBySlug(body.slug);
    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'Un post avec ce slug existe déjà' },
        { status: 409 }
      );
    }

    const postData: PostData = {
      slug: body.slug,
      authorId: adminUser.id,
      status: body.status || 'DRAFT',
      postType: body.postType || 'ARTICLE',
      featuredImageUrl: body.featuredImageUrl || undefined,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      isFeatured: body.isFeatured || false,
      allowComments: body.allowComments !== undefined ? body.allowComments : true,
      readingTimeMinutes: body.readingTimeMinutes || undefined,
      categoryIds: body.categoryIds || [],
      tagIds: body.tagIds || [],
    };

    console.log('📝 Creating post:', {
      slug: postData.slug,
      authorId: postData.authorId,
    });

    const post = await PostsService.createPost(postData);

    // Récupérer le post complet avec les relations
    const fullPost = await PostsService.getPostById(post.id);

    return NextResponse.json(
      {
        success: true,
        post: fullPost,
        message: 'Post créé avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error in POST /api/admin/posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création du post',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
