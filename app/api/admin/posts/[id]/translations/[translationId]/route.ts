/**
 * Specific Post Translation API Routes - Admin Only
 * 
 * Routes API pour la gestion d'une traduction spécifique d'un post.
 * Opérations : GET, PUT, DELETE
 * 
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PostTranslationsService, PostTranslationData } from '@/src/lib/database/services/posts'
import { authOptions } from '@/src/lib/auth/auth-options'

/**
 * GET /api/admin/posts/[id]/translations/[translationId]
 * Obtenir une traduction spécifique par language code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; translationId: string }> }
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
    const languageCode = resolvedParams.translationId
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'ID de post invalide' },
        { status: 400 }
      )
    }

    console.log('🌐 Getting translation for post:', postId, 'language:', languageCode)

    const translation = await PostTranslationsService.getPostTranslation(postId, languageCode)
    
    if (!translation) {
      return NextResponse.json(
        { success: false, error: 'Traduction non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      translation: translation,
      message: 'Traduction récupérée avec succès'
    })

  } catch (error) {
    console.error('❌ Error in GET /api/admin/posts/[id]/translations/[translationId]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération de la traduction',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/posts/[id]/translations/[translationId]
 * Mettre à jour une traduction spécifique
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; translationId: string }> }
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
    const languageCode = resolvedParams.translationId
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'ID de post invalide' },
        { status: 400 }
      )
    }

    // Vérifier que la traduction existe
    const existingTranslation = await PostTranslationsService.getPostTranslation(postId, languageCode)
    if (!existingTranslation) {
      return NextResponse.json(
        { success: false, error: 'Traduction non trouvée' },
        { status: 404 }
      )
    }

    const body = await request.json()

    const translationData: PostTranslationData = {
      languageCode: languageCode,
      title: body.title || existingTranslation.title,
      content: body.content || existingTranslation.content,
      excerpt: body.excerpt !== undefined ? body.excerpt : existingTranslation.excerpt,
      metaTitle: body.metaTitle !== undefined ? body.metaTitle : existingTranslation.metaTitle,
      metaDescription: body.metaDescription !== undefined ? body.metaDescription : existingTranslation.metaDescription,
      translationSource: body.translationSource || existingTranslation.translationSource,
      humanReviewed: body.humanReviewed !== undefined ? body.humanReviewed : existingTranslation.humanReviewed
    }

    console.log('✏️ Updating translation for post:', postId, 'language:', languageCode)

    const updatedTranslation = await PostTranslationsService.upsertPostTranslation(postId, translationData)

    return NextResponse.json({
      success: true,
      translation: updatedTranslation,
      message: 'Traduction mise à jour avec succès'
    })

  } catch (error) {
    console.error('❌ Error in PUT /api/admin/posts/[id]/translations/[translationId]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour de la traduction',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/posts/[id]/translations/[translationId]
 * Supprimer une traduction spécifique
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; translationId: string }> }
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
    const languageCode = resolvedParams.translationId
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'ID de post invalide' },
        { status: 400 }
      )
    }

    // Vérifier que la traduction existe
    const existingTranslation = await PostTranslationsService.getPostTranslation(postId, languageCode)
    if (!existingTranslation) {
      return NextResponse.json(
        { success: false, error: 'Traduction non trouvée' },
        { status: 404 }
      )
    }

    console.log('🗑️ Deleting translation for post:', postId, 'language:', languageCode)

    await PostTranslationsService.deletePostTranslation(postId, languageCode)

    return NextResponse.json({
      success: true,
      message: 'Traduction supprimée avec succès'
    })

  } catch (error) {
    console.error('❌ Error in DELETE /api/admin/posts/[id]/translations/[translationId]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression de la traduction',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}