/**
 * API Route for Automatic Translation
 * Provides AI-powered translation functionality for tool content
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

interface RouteContext {
  params: { id: string }
}

/**
 * POST /api/tools/[id]/translations/auto-translate
 * Generate automatic translation using AI
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
    const { targetLanguage, baseData } = body

    if (!targetLanguage || !baseData) {
      return NextResponse.json({ 
        error: 'Target language and base data are required' 
      }, { status: 400 })
    }

    // Validate target language
    const supportedLanguages = ['fr', 'it', 'es', 'de', 'nl', 'pt']
    if (!supportedLanguages.includes(targetLanguage)) {
      return NextResponse.json({ 
        error: 'Unsupported target language' 
      }, { status: 400 })
    }

    // Generate translation using AI (mock implementation for now)
    const translatedContent = await generateTranslation(baseData, targetLanguage)

    // Create or update translation in database
    const translation = await upsertTranslation({
      toolId,
      languageCode: targetLanguage,
      name: translatedContent.name,
      overview: translatedContent.overview,
      description: translatedContent.description,
      metaTitle: translatedContent.metaTitle,
      metaDescription: translatedContent.metaDescription,
      translationSource: 'ai',
      qualityScore: translatedContent.qualityScore,
      humanReviewed: false
    })

    return NextResponse.json({
      success: true,
      translation,
      message: `Translation generated successfully for ${targetLanguage.toUpperCase()}`
    })

  } catch (error: any) {
    console.error('Error generating automatic translation:', error)
    return NextResponse.json(
      { error: 'Translation generation failed' },
      { status: 500 }
    )
  }
}

/**
 * Generate translation using AI (mock implementation)
 * In a real implementation, this would call an AI translation service
 */
async function generateTranslation(baseData: any, targetLanguage: string) {
  // Mock translation logic
  // In production, this would integrate with services like:
  // - Google Translate API
  // - DeepL API  
  // - OpenAI API
  // - Azure Translator
  
  const languageMap: Record<string, string> = {
    'fr': 'French',
    'it': 'Italian', 
    'es': 'Spanish',
    'de': 'German',
    'nl': 'Dutch',
    'pt': 'Portuguese'
  }

  const languageName = languageMap[targetLanguage] || targetLanguage

  // Simple mock translation (add language suffix)
  const mockTranslation = {
    name: `${baseData.name} (${languageName})`,
    overview: baseData.overview ? `${baseData.overview} [Traduit automatiquement en ${languageName}]` : '',
    description: baseData.description ? `${baseData.description} [Version ${languageName} générée automatiquement]` : '',
    metaTitle: baseData.metaTitle ? `${baseData.metaTitle} - ${languageName}` : '',
    metaDescription: baseData.metaDescription ? `${baseData.metaDescription} (${languageName})` : '',
    qualityScore: 7.5 // AI translations get a decent score
  }

  // In a real implementation, you would:
  // 1. Call translation API with proper prompts
  // 2. Handle rate limiting and errors
  // 3. Implement quality scoring based on confidence
  // 4. Add context-aware translation for technical terms
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return mockTranslation
}

/**
 * Create or update translation (upsert)
 */
async function upsertTranslation(data: {
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
  
  // Check if translation already exists
  const existingQuery = `
    SELECT id FROM tool_translations 
    WHERE tool_id = $1 AND language_code = $2
  `
  const existing = await pool.query(existingQuery, [data.toolId, data.languageCode])
  
  if (existing.rows.length > 0) {
    // Update existing translation
    const updateQuery = `
      UPDATE tool_translations SET
        name = $3,
        overview = $4,
        description = $5,
        meta_title = $6,
        meta_description = $7,
        translation_source = $8,
        quality_score = $9,
        human_reviewed = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE tool_id = $1 AND language_code = $2
      RETURNING 
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
    
    const result = await pool.query(updateQuery, values)
    return result.rows[0]
    
  } else {
    // Create new translation
    const insertQuery = `
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
      RETURNING 
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
    
    const result = await pool.query(insertQuery, values)
    return result.rows[0]
  }
}