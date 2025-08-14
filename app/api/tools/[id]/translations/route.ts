/**
 * API Routes for Tool Translations Management
 * Handles CRUD operations for multilingual tool content
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ToolsService } from '@/src/lib/database/services/tools'

interface RouteContext {
  params: { id: string }
}

/**
 * GET /api/tools/[id]/translations
 * Fetch all translations for a specific tool
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Next.js 15 requires awaiting params
    const { id } = await params
    const toolId = parseInt(id)
    if (isNaN(toolId)) {
      return NextResponse.json({ error: 'Invalid tool ID' }, { status: 400 })
    }

    // Fetch translations from database
    const translations = await fetchToolTranslations(toolId)

    return NextResponse.json({
      success: true,
      translations,
      count: translations.length
    })

  } catch (error) {
    console.error('Error fetching tool translations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tools/[id]/translations  
 * Create a new translation for a tool
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Next.js 15 requires awaiting params
    const { id } = await params
    const toolId = parseInt(id)
    if (isNaN(toolId)) {
      return NextResponse.json({ error: 'Invalid tool ID' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      languageCode, 
      name, 
      overview, 
      description, 
      metaTitle, 
      metaDescription,
      translationSource = 'human',
      qualityScore = 0,
      humanReviewed = false
    } = body

    // Validate required fields
    if (!languageCode || !name) {
      return NextResponse.json({ 
        error: 'Language code and name are required' 
      }, { status: 400 })
    }

    // Create translation in database
    const translationId = await createToolTranslation({
      toolId,
      languageCode,
      name: name.trim(),
      overview: overview?.trim() || '',
      description: description?.trim() || '',
      metaTitle: metaTitle?.trim() || '',
      metaDescription: metaDescription?.trim() || '',
      translationSource,
      qualityScore: Math.max(0, Math.min(10, parseFloat(qualityScore) || 0)),
      humanReviewed: Boolean(humanReviewed)
    })

    // Fetch the created translation
    const createdTranslation = await fetchToolTranslation(translationId)

    return NextResponse.json({
      success: true,
      translation: createdTranslation,
      message: 'Translation created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating tool translation:', error)
    
    if (error.message?.includes('duplicate') || error.code === '23505') {
      return NextResponse.json({ 
        error: 'Translation already exists for this language' 
      }, { status: 409 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to fetch all translations for a tool
 */
async function fetchToolTranslations(toolId: number) {
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
    WHERE tool_id = $1
    ORDER BY 
      CASE language_code 
        WHEN 'en' THEN 1 
        ELSE 2 
      END, 
      language_code ASC
  `
  
  const result = await pool.query(query, [toolId])
  return result.rows
}

/**
 * Helper function to create a new translation
 */
async function createToolTranslation(data: {
  toolId: number
  languageCode: string
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
    INSERT INTO tool_translations (
      tool_id, 
      language_code, 
      name, 
      overview, 
      description, 
      meta_title, 
      meta_description,
      translation_source,
      quality_score,
      human_reviewed
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
  `
  
  const values = [
    data.toolId,
    data.languageCode,
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