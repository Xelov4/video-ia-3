/**
 * API Routes for Individual Tool Translation Management
 * Handles update and delete operations for specific translations
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth/auth-options'
import { ToolsService } from '@/src/lib/database/services/tools'

interface RouteContext {
  params: Promise<{ 
    id: string; 
    translationId: string 
  }>
}

/**
 * PUT /api/tools/[id]/translations/[translationId]
 * Update an existing translation for a tool
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, translationId } = await params
    const toolId = parseInt(id)
    const transId = parseInt(translationId)

    if (isNaN(toolId) || isNaN(transId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      id: bodyId,
      toolId: bodyToolId,
      languageCode,
      createdAt,
      updatedAt,
      language, // <-- On extrait et ignore l'objet "language"
      ...updateData
    } = body

    const updatedTranslation = await ToolsService.updateToolTranslation(transId, updateData)

    return NextResponse.json({
      success: true,
      translation: updatedTranslation,
      message: 'Translation updated successfully'
    })

  } catch (error: any) {
    const { translationId } = await params
    console.error(`Error updating translation ${translationId}:`, error)
    
    if (error.code === 'P2025') { // Prisma record not found
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tools/[id]/translations/[translationId]
 * Delete a translation
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Next.js 15 requires awaiting params
    const { translationId: translationIdParam } = await params
    const translationId = parseInt(translationIdParam)
    
    if (isNaN(translationId)) {
      return NextResponse.json({ error: 'Invalid translation ID' }, { status: 400 })
    }

    // Check if translation exists and get language code
    const translation = await fetchToolTranslation(translationId)
    if (!translation) {
      return NextResponse.json({ 
        error: 'Translation not found' 
      }, { status: 404 })
    }

    // Prevent deletion of base language (English)
    if (translation.languageCode === 'en') {
      return NextResponse.json({ 
        error: 'Cannot delete base language translation' 
      }, { status: 403 })
    }

    // Delete translation
    await deleteToolTranslation(translationId)

    return NextResponse.json({
      success: true,
      message: 'Translation deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting tool translation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to update a translation
 */
async function updateToolTranslation(translationId: number, data: {
  name: string
  overview: string
  description: string
  metaTitle: string
  metaDescription: string
  translationSource: string
  qualityScore: number
  humanReviewed: boolean
}) {
  const { getPool } = await import('@/src/lib/database/postgres')
  const pool = getPool()
  
  const query = `
    UPDATE tool_translations SET
      name = $2,
      overview = $3,
      description = $4,
      meta_title = $5,
      meta_description = $6,
      translation_source = $7,
      quality_score = $8,
      human_reviewed = $9,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id
  `
  
  const values = [
    translationId,
    data.name,
    data.overview,
    data.description,
    data.metaTitle,
    data.metaDescription,
    data.translationSource,
    data.qualityScore,
    data.humanReviewed
  ]
  
  const result = await pool.query(query, values)
  
  if (result.rowCount === 0) {
    throw new Error('Translation not found')
  }
  
  return result.rows[0].id
}

/**
 * Helper function to fetch a single translation
 */
async function fetchToolTranslation(translationId: number) {
  const { getPool } = await import('@/src/lib/database/postgres')
  const pool = getPool()
  
  const query = `
    SELECT 
      id,
      tool_id as "toolId",
      language_code as "languageCode", 
      name,
      overview,
      description,
      meta_title as "metaTitle",
      meta_description as "metaDescription",
      translation_source as "translationSource",
      quality_score as "qualityScore",
      human_reviewed as "humanReviewed",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM tool_translations 
    WHERE id = $1
  `
  
  const result = await pool.query(query, [translationId])
  return result.rows[0]
}

/**
 * Helper function to delete a translation
 */
async function deleteToolTranslation(translationId: number) {
  const { getPool } = await import('@/src/lib/database/postgres')
  const pool = getPool()
  
  const query = `DELETE FROM tool_translations WHERE id = $1`
  const result = await pool.query(query, [translationId])
  
  if (result.rowCount === 0) {
    throw new Error('Translation not found')
  }
  
  return true
}