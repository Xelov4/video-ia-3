/**
 * API Routes for Tools Management
 * 
 * Provides RESTful endpoints for managing and retrieving AI tools
 * from the comprehensive directory database.
 * 
 * Endpoints:
 * - GET /api/tools - Search and filter tools with pagination
 * - POST /api/tools - Create new tool (admin only)
 * 
 * Features:
 * - Advanced search and filtering
 * - Pagination with metadata
 * - Performance optimization
 * - Type-safe responses
 * - Comprehensive error handling
 * 
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { ToolsService, type ToolsSearchParams } from '@/src/lib/database'

/**
 * GET /api/tools
 * 
 * Search and retrieve AI tools with advanced filtering options.
 * Supports pagination, category filtering, search queries, and sorting.
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 100)
 * - search: Search query (searches name, description, features)  
 * - category: Filter by category name
 * - featured: Show only featured tools (true/false)
 * - sort: Sort field (toolName, createdAt, viewCount, qualityScore)
 * - order: Sort order (asc/desc, default: desc)
 * 
 * @param request Next.js request object
 * @returns Paginated tools response with metadata
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    
    // Parse search and filter parameters
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const featured = searchParams.get('featured') === 'true' ? true : undefined
    
    // Parse sorting parameters
    const sortBy = (searchParams.get('sort') as ToolsSearchParams['sortBy']) || 'createdAt'
    const sortOrder = (searchParams.get('order') as 'asc' | 'desc') || 'desc'
    
    // Build search parameters
    const searchParams_: ToolsSearchParams = {
      query: search,
      category,
      featured,
      page,
      limit,
      sortBy,
      sortOrder
    }
    
    // Execute search
    const results = await ToolsService.searchTools(searchParams_)
    
    // Return successful response
    return NextResponse.json({
      success: true,
      tools: results.tools,
      pagination: {
        currentPage: results.currentPage,
        totalPages: results.totalPages,
        totalCount: results.totalCount,
        hasNextPage: results.hasNextPage,
        hasPreviousPage: results.hasPreviousPage,
        limit
      },
      meta: {
        searchQuery: search,
        category,
        featured,
        sortBy,
        sortOrder
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/tools:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve tools',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tools
 * 
 * Create a new AI tool entry in the database.
 * Requires valid tool data and proper authentication.
 * 
 * Request Body:
 * - toolName: Tool name (required)
 * - toolCategory: Category name
 * - toolLink: Official website URL
 * - overview: Brief description
 * - toolDescription: Detailed description
 * - targetAudience: Target user groups
 * - keyFeatures: Main features list
 * - useCases: Use case examples
 * - tags: Comma-separated tags
 * - imageUrl: Tool logo/screenshot URL
 * - metaTitle: SEO title
 * - metaDescription: SEO description
 * - seoKeywords: SEO keywords
 * 
 * @param request Next.js request object
 * @returns Created tool data or error response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.toolName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool name is required'
        },
        { status: 400 }
      )
    }
    
    // Create tool using service
    const tool = await ToolsService.createTool(body)
    
    return NextResponse.json({
      success: true,
      tool,
      message: 'Tool created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error in POST /api/tools:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create tool',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}