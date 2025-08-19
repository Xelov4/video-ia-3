/**
 * Post Publish/Unpublish API Routes - Admin Only
 *
 * Routes API pour publier/dépublier un post.
 *
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PostsService } from '@/src/lib/database/services/posts';
import { authOptions } from '@/src/lib/auth/auth-options';

/**
 * POST /api/admin/posts/[id]/publish
 * Publier un post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'ID de post invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le post existe
    const existingPost = await PostsService.getPostById(postId);
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post non trouvé' },
        { status: 404 }
      );
    }

    console.log('📢 Publishing post:', postId, 'slug:', existingPost.slug);

    const updatedPost = await PostsService.publishPost(postId);

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Post publié avec succès',
    });
  } catch (error) {
    console.error('❌ Error in POST /api/admin/posts/[id]/publish:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la publication du post',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/posts/[id]/publish
 * Dépublier un post (remettre en brouillon)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'ID de post invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le post existe
    const existingPost = await PostsService.getPostById(postId);
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post non trouvé' },
        { status: 404 }
      );
    }

    console.log('📝 Unpublishing post:', postId, 'slug:', existingPost.slug);

    const updatedPost = await PostsService.unpublishPost(postId);

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Post dépublié avec succès',
    });
  } catch (error) {
    console.error('❌ Error in DELETE /api/admin/posts/[id]/publish:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la dépublication du post',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
