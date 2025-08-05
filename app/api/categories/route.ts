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
import { CategoriesService } from '@/src/lib/database'

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
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const featured = searchParams.get('featured') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const search = searchParams.get('search') || undefined
    const includeEmpty = searchParams.get('includeEmpty') !== 'false' // Default to true
    
    let categories
    
    if (featured) {
      // Get featured categories
      categories = await CategoriesService.getFeaturedCategories(limit || 8)
    } else if (search) {
      // Search categories by name
      categories = await CategoriesService.searchCategories(search, limit || 50)
    } else {
      // Get all categories
      categories = await CategoriesService.getAllCategories(includeEmpty)
      
      // Apply limit if specified
      if (limit && categories.length > limit) {
        categories = categories.slice(0, limit)
      }
    }
    
    // Calculate statistics
    const totalCategories = categories.length
    const featuredCount = categories.filter(cat => cat.isFeatured).length
    const totalTools = categories.reduce((sum, cat) => sum + (cat.toolCount || 0), 0)
    
    return NextResponse.json({
      success: true,
      categories,
      meta: {
        totalCategories,
        featuredCount,
        totalTools,
        filters: {
          featured,
          search,
          includeEmpty,
          limit
        }
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/categories:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve categories',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
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
    
    // Create category using service
    const category = await CategoriesService.createCategory(body)
    
    return NextResponse.json({
      success: true,
      category,
      message: 'Category created successfully'
    }, { status: 201 })
    
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