/**
 * Admin Tools API
 * Simple API endpoint for fetching tools with pagination and filters
 */

import { NextRequest, NextResponse } from 'next/server'
import { toolsService } from '@/src/lib/database/services/tools'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 50 // 50 tools per page as requested
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const featured = searchParams.get('featured')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Parse featured parameter
    let featuredFilter: boolean | undefined
    if (featured === 'true') featuredFilter = true
    else if (featured === 'false') featuredFilter = false

    // Fetch tools from database
    const result = await toolsService.searchTools({
      query: search,
      category,
      featured: featuredFilter,
      page,
      limit,
      sortBy,
      sortOrder
    })

    return NextResponse.json({
      tools: result.tools,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage
      }
    })

  } catch (error) {
    console.error('Error in admin tools API:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des outils',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
