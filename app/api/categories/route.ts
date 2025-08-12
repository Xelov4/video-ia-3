/**
 * API Routes for Categories Management
 * 
 * Provides RESTful endpoints for managing and retrieving tool categories
 * from the directory database with comprehensive organization features.
 * 
 * Endpoints:
 * - GET /api/categories - List categories with filtering options
 * - POST /api/categories - Create new category (admin only)
 * 
 * Features:
 * - Featured categories filtering
 * - Tool count synchronization
 * - Performance optimization
 * - Type-safe responses
 * - Comprehensive error handling
 * 
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'
import { validateLanguageParam, validateLimitParam, I18N_HEADERS } from '@/src/lib/i18n/types'

/**
 * GET /api/categories
 * 
 * Retrieve categories with optional filtering and sorting.
 * Supports featured categories, tool count ordering, and search functionality.
 * 
 * Query Parameters:
 * - featured: Show only featured categories (true/false)
 * - limit: Maximum number of categories to return
 * - search: Search categories by name
 * - includeEmpty: Include categories with 0 tools (true/false, default: false)
 * 
 * @param request Next.js request object
 * @returns Categories list with metadata
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Validation sécurisée des paramètres
    const language = validateLanguageParam(searchParams.get('lang') || 'en')
    const featured = searchParams.get('featured') === 'true'
    const limit = searchParams.get('limit') ? validateLimitParam(searchParams.get('limit')!, 100) : undefined
    const search = searchParams.get('search') || undefined
    const includeEmpty = searchParams.get('includeEmpty') !== 'false' // Default to true
    const useCache = searchParams.get('cache') !== 'false'
    
    let result
    
    if (featured) {
      // Get featured categories
      const categories = await multilingualCategoriesService.getFeaturedCategories(language, limit || 8)
      result = {
        categories,
        meta: {
          language,
          totalCount: categories.length,
          fallbackCount: categories.filter(cat => cat.translationSource !== 'exact').length,
          cacheHit: false // Featured categories use their own cache
        }
      }
    } else if (search) {
      // Search categories by name
      const categories = await multilingualCategoriesService.searchCategories(search, language, limit || 50)
      result = {
        categories,
        meta: {
          language,
          totalCount: categories.length,
          fallbackCount: categories.filter(cat => cat.translationSource !== 'exact').length,
          cacheHit: false
        }
      }
    } else {
      // Get all categories
      result = await multilingualCategoriesService.getAllCategories(language, {
        includeEmpty,
        useCache,
        includeCounts: true
      })
      
      // Apply limit if specified
      if (limit && result.categories.length > limit) {
        result.categories = result.categories.slice(0, limit)
        result.meta.totalCount = result.categories.length
      }
    }
    
    // Calculate additional statistics
    const featuredCount = result.categories.filter(cat => cat.isFeatured).length
    const totalTools = result.categories.reduce((sum, cat) => sum + (cat.actualToolCount || 0), 0)
    
    // Headers informatifs
    const responseHeaders = new Headers()
    responseHeaders.set(I18N_HEADERS.LANGUAGE, result.meta.language)
    responseHeaders.set(I18N_HEADERS.FALLBACK_USED, result.meta.fallbackCount.toString())
    responseHeaders.set(I18N_HEADERS.CACHE_STATUS, result.meta.cacheHit ? 'HIT' : 'MISS')
    responseHeaders.set('Content-Type', 'application/json')
    
    const response = {
      success: true,
      data: result.categories,
      meta: {
        language: result.meta.language,
        totalCategories: result.meta.totalCount,
        featuredCount,
        totalTools,
        fallbackCount: result.meta.fallbackCount,
        cacheHit: result.meta.cacheHit,
        responseTime: Date.now() - startTime,
        filters: {
          featured,
          search,
          includeEmpty,
          limit
        },
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    }
    
    return NextResponse.json(response, {
      status: 200,
      headers: responseHeaders
    })
    
  } catch (error) {
    console.error('Error in GET /api/categories:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url
    })

    // Gestion spécifique des erreurs de validation
    if (error instanceof Error && (error as any).code) {
      const validationError = error as any
      return NextResponse.json(
        {
          success: false,
          error: validationError.message,
          code: validationError.code,
          field: validationError.field
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve categories',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories
 * 
 * Create a new category in the database.
 * Requires valid category data and proper authentication.
 * 
 * Request Body:
 * - name: Category name (required)
 * - slug: URL-friendly slug (optional, auto-generated)
 * - description: Category description
 * - iconName: Icon identifier for UI
 * - isFeatured: Whether category should be featured
 * 
 * @param request Next.js request object
 * @returns Created category data or error response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category name is required'
        },
        { status: 400 }
      )
    }
    
    // TODO: Implement createCategory in multilingualCategoriesService
    // const category = await multilingualCategoriesService.createCategory(body)
    
    return NextResponse.json({
      success: false,
      error: 'Create category not implemented yet',
      message: 'POST method not yet implemented'
    }, { status: 501 })
    
  } catch (error) {
    console.error('Error in POST /api/categories:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create category',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}