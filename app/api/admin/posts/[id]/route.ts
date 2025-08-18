/**
 * Post by ID API Routes - Admin Only
 * 
 * Routes API pour la gestion d'un post spécifique.
 * Opérations : GET, PUT, DELETE
 * 
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PostsService, PostData } from '@/src/lib/database/services/posts'
import { authOptions } from '@/src/lib/auth/auth-options'

/**
 * GET /api/admin/posts/[id]
 * Obtenir un post par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const postId = parseInt(resolvedParams.id)
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'ID de post invalide' },
        { status: 400 }
      )
    }

    console.log('📖 Getting post by ID:', postId)

    const post = await PostsService.getPostById(postId)
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      post: post,
      message: 'Post récupéré avec succès'
    })

  } catch (error) {
    console.error('❌ Error in GET /api/admin/posts/[id]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération du post',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/posts/[id]
 * Mettre à jour un post
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const postId = parseInt(resolvedParams.id)
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'ID de post invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le post existe
    const existingPost = await PostsService.getPostById(postId)
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post non trouvé' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Si le slug change, vérifier l'unicité
    if (body.slug && body.slug !== existingPost.slug) {
      const slugExists = await PostsService.getPostBySlug(body.slug)
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Un post avec ce slug existe déjà' },
          { status: 409 }
        )
      }
    }

    const updateData: Partial<PostData> = {
      ...(body.slug && { slug: body.slug }),
      ...(body.authorId && { authorId: body.authorId }),
      ...(body.status && { status: body.status }),
      ...(body.postType && { postType: body.postType }),
      ...(body.featuredImageUrl !== undefined && { featuredImageUrl: body.featuredImageUrl }),
      ...(body.publishedAt !== undefined && { 
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null 
      }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      ...(body.allowComments !== undefined && { allowComments: body.allowComments }),
      ...(body.readingTimeMinutes !== undefined && { readingTimeMinutes: body.readingTimeMinutes }),
      ...(body.categoryIds !== undefined && { categoryIds: body.categoryIds }),
      ...(body.tagIds !== undefined && { tagIds: body.tagIds })
    }

    console.log('✏️ Updating post:', postId, 'with data:', Object.keys(updateData))

    const updatedPost = await PostsService.updatePost(postId, updateData)

    // Récupérer le post complet avec les relations
    const fullPost = await PostsService.getPostById(postId)

    return NextResponse.json({
      success: true,
      post: fullPost,
      message: 'Post mis à jour avec succès'
    })

  } catch (error) {
    console.error('❌ Error in PUT /api/admin/posts/[id]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour du post',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/posts/[id]
 * Supprimer un post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const postId = parseInt(resolvedParams.id)
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'ID de post invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le post existe
    const existingPost = await PostsService.getPostById(postId)
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post non trouvé' },
        { status: 404 }
      )
    }

    console.log('🗑️ Deleting post:', postId, 'slug:', existingPost.slug)

    await PostsService.deletePost(postId)

    return NextResponse.json({
      success: true,
      message: 'Post supprimé avec succès'
    })

  } catch (error) {
    console.error('❌ Error in DELETE /api/admin/posts/[id]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression du post',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}