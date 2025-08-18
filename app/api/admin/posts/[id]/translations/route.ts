/**
 * Post Translations API Routes - Admin Only
 * 
 * Routes API pour la gestion des traductions des posts.
 * Opérations : GET (toutes), POST (créer)
 * 
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PostTranslationsService, PostTranslationData } from '@/src/lib/database/services/posts'
import { authOptions } from '@/src/lib/auth/auth-options'

/**
 * GET /api/admin/posts/[id]/translations
 * Obtenir toutes les traductions d'un post
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

    console.log('🌐 Getting translations for post:', postId)

    const translations = await PostTranslationsService.getPostTranslations(postId)

    return NextResponse.json({
      success: true,
      translations: translations,
      message: `${translations.length} traductions trouvées`
    })

  } catch (error) {
    console.error('❌ Error in GET /api/admin/posts/[id]/translations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des traductions',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/posts/[id]/translations
 * Créer une nouvelle traduction pour un post
 */
export async function POST(
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

    const body = await request.json()
    
    // Validation des données requises
    if (!body.languageCode || !body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Les champs languageCode, title et content sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si la traduction existe déjà
    const existingTranslation = await PostTranslationsService.getPostTranslation(postId, body.languageCode)
    if (existingTranslation) {
      return NextResponse.json(
        { success: false, error: 'Une traduction existe déjà pour cette langue' },
        { status: 409 }
      )
    }

    const translationData: PostTranslationData = {
      languageCode: body.languageCode,
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || undefined,
      metaTitle: body.metaTitle || undefined,
      metaDescription: body.metaDescription || undefined,
      translationSource: body.translationSource || 'manual',
      humanReviewed: body.humanReviewed || false
    }

    console.log('📝 Creating translation for post:', postId, 'language:', body.languageCode)

    const translation = await PostTranslationsService.upsertPostTranslation(postId, translationData)

    return NextResponse.json({
      success: true,
      translation: translation,
      message: 'Traduction créée avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error in POST /api/admin/posts/[id]/translations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de la traduction',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}