/**
 * API Routes for Individual Tool Management
 * 
 * Provides RESTful endpoints for managing individual tools
 * from the directory database with full CRUD operations.
 * 
 * Endpoints:
 * - GET /api/tools/[id] - Get specific tool details
 * - PUT /api/tools/[id] - Update tool information
 * - DELETE /api/tools/[id] - Delete tool
 * 
 * Features:
 * - Full tool data retrieval
 * - Comprehensive update capabilities
 * - Soft delete with data preservation
 * - Validation and error handling
 * - Type-safe responses
 * 
 * @author Video-IA.net Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { toolsService } from '@/src/lib/database/services/tools'

/**
 * GET /api/tools/[id]
 * 
 * Retrieve detailed information about a specific tool.
 * Returns complete tool data including all metadata and statistics.
 * 
 * @param request Next.js request object
 * @param params Route parameters containing tool ID
 * @returns Tool details or error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15 requires awaiting params
    const { id } = await params
    const toolId = parseInt(id)
    
    if (isNaN(toolId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tool ID'
        },
        { status: 400 }
      )
    }

    const tool = await toolsService.getToolById(toolId)
    
    if (!tool) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      tool
    })
    
  } catch (error) {
    console.error('Error in GET /api/tools/[id]:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve tool',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tools/[id]
 * 
 * Update tool information in the database.
 * Supports partial updates and validates data integrity.
 * 
 * Request Body:
 * - tool_name: Tool name
 * - tool_category: Category name
 * - tool_link: Tool URL
 * - overview: Short description
 * - tool_description: Full description
 * - target_audience: Target users
 * - key_features: Key features list
 * - use_cases: Use cases
 * - tags: Comma-separated tags
 * - image_url: Tool image URL
 * - slug: URL-friendly slug
 * - is_active: Active status
 * - featured: Featured status
 * - quality_score: Quality rating
 * - meta_title: SEO title
 * - meta_description: SEO description
 * - seo_keywords: SEO keywords
 * 
 * @param request Next.js request object
 * @param params Route parameters containing tool ID
 * @returns Updated tool data or error response
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15 requires awaiting params
    const { id } = await params
    const toolId = parseInt(id)
    
    if (isNaN(toolId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tool ID'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.tool_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool name is required'
        },
        { status: 400 }
      )
    }

    // Check if tool exists
    const existingTool = await toolsService.getToolById(toolId)
    if (!existingTool) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool not found'
        },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData = {
      tool_name: body.tool_name,
      tool_category: body.tool_category || existingTool.tool_category,
      tool_link: body.tool_link || existingTool.tool_link,
      overview: body.overview || existingTool.overview,
      tool_description: body.tool_description || existingTool.tool_description,
      target_audience: body.target_audience || existingTool.target_audience,
      key_features: body.key_features || existingTool.key_features,
      use_cases: body.use_cases || existingTool.use_cases,
      tags: body.tags || existingTool.tags,
      image_url: body.image_url || existingTool.image_url,
      slug: body.slug || existingTool.slug,
      is_active: body.is_active !== undefined ? body.is_active : existingTool.is_active,
      featured: body.featured !== undefined ? body.featured : existingTool.featured,
      quality_score: body.quality_score !== undefined ? body.quality_score : existingTool.quality_score,
      meta_title: body.meta_title || existingTool.meta_title,
      meta_description: body.meta_description || existingTool.meta_description,
      seo_keywords: body.seo_keywords || existingTool.seo_keywords,
      updated_at: new Date()
    }

    // Update tool
    const updatedTool = await toolsService.updateTool(toolId, updateData)
    
    if (!updatedTool) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update tool'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tool: updatedTool,
      message: 'Tool updated successfully'
    })
    
  } catch (error) {
    console.error('Error in PUT /api/tools/[id]:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update tool',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tools/[id]
 * 
 * Delete a tool from the database.
 * Implements soft delete by setting is_active to false
 * to preserve data integrity and allow recovery.
 * 
 * @param request Next.js request object
 * @param params Route parameters containing tool ID
 * @returns Success confirmation or error response
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15 requires awaiting params
    const { id } = await params
    const toolId = parseInt(id)
    
    if (isNaN(toolId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tool ID'
        },
        { status: 400 }
      )
    }

    // Check if tool exists
    const existingTool = await toolsService.getToolById(toolId)
    if (!existingTool) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool not found'
        },
        { status: 404 }
      )
    }

    // Soft delete by setting is_active to false
    const deletedTool = await toolsService.updateTool(toolId, {
      is_active: false
    })
    
    if (!deletedTool) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete tool'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tool deleted successfully',
      tool: deletedTool
    })
    
  } catch (error) {
    console.error('Error in DELETE /api/tools/[id]:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete tool',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 