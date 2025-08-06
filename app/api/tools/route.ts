/**
 * Tools API Route
 * Handles CRUD operations for tools in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { toolsService } from '@/src/lib/database/services/tools';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const filterParam = searchParams.get('filter');
    const filter = (filterParam === 'never_optimized' || filterParam === 'needs_update' || filterParam === 'all') 
      ? filterParam as 'never_optimized' | 'needs_update' | 'all'
      : undefined;

    let result;

    if (search || filter) {
      result = await toolsService.searchTools({
        query: search,
        category,
        page,
        limit,
        filter
      });
    } else {
      const getAllResult = await toolsService.getAllTools(page, limit, category);
      result = {
        tools: getAllResult.tools,
        totalCount: getAllResult.total,
        totalPages: Math.ceil(getAllResult.total / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(getAllResult.total / limit),
        hasPreviousPage: page > 1,
        hasMore: page < Math.ceil(getAllResult.total / limit)
      };
    }

    return NextResponse.json({
      success: true,
      data: result.tools,
      pagination: {
        page,
        limit,
        total: result.totalCount,
        totalPages: result.totalPages
      }
    });

  } catch (error) {
    console.error('Tools API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}