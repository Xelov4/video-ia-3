/**
 * API Route for Tool Analysis
 * 
 * Analyzes and updates specific tools from the database using AI analysis
 * Integrates with ScraperService for intelligent content analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { toolsService } from '@/src/lib/database/services/tools';
import { ScraperService } from '@/src/services/scraper';

const scraperService = new ScraperService();

/**
 * POST /api/tools/[id]/analyze
 * 
 * Analyzes a specific tool from the database and optionally updates its fields
 * 
 * Request Body:
 * - fields: Array of field names to update (optional)
 * - updateOptions: Additional options for the update process
 * 
 * @param request Next.js request object
 * @param params Route parameters containing tool ID
 * @returns Analysis results and update confirmation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15 requires awaiting params
    const { id } = await params;
    const toolId = parseInt(id);
    
    if (isNaN(toolId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tool ID'
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { fields = [], updateOptions = {} } = body;

    // Get tool from database
    const tool = await toolsService.getToolById(toolId);
    
    if (!tool) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool not found'
        },
        { status: 404 }
      );
    }

    // Validate tool has a valid URL
    if (!tool.tool_link || !scraperService.validateUrl(tool.tool_link)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool does not have a valid URL for analysis'
        },
        { status: 400 }
      );
    }

    // Perform AI analysis using professional mode by default
    const analysis = await scraperService.analyzeProfessionalTool(tool.tool_link);

    // Prepare update data based on requested fields or use all fields if none specified
    const fieldsToUpdate = fields.length > 0 ? fields : [
      'tool_name',
      'tool_category', 
      'overview',
      'tool_description',
      'target_audience',
      'key_features',
      'tags',
      'meta_title',
      'meta_description',
      'seo_keywords'
    ];

    const updateData: any = {};
    const updatedFields: string[] = [];

    // Map analysis results to database fields
    for (const field of fieldsToUpdate) {
      switch (field) {
        case 'tool_name':
          if (analysis.toolName && analysis.toolName !== tool.tool_name) {
            updateData.tool_name = analysis.toolName;
            updatedFields.push('tool_name');
          }
          break;
        case 'tool_category':
          if (analysis.category && analysis.category !== tool.tool_category) {
            updateData.tool_category = analysis.category;
            updatedFields.push('tool_category');
          }
          break;
        case 'overview':
          if (analysis.primaryFunction && analysis.primaryFunction !== tool.overview) {
            updateData.overview = analysis.primaryFunction;
            updatedFields.push('overview');
          }
          break;
        case 'tool_description':
          if (analysis.description && analysis.description !== tool.tool_description) {
            updateData.tool_description = analysis.description;
            updatedFields.push('tool_description');
          }
          break;
        case 'target_audience':
          if (analysis.targetAudience && analysis.targetAudience.length > 0) {
            const audienceString = analysis.targetAudience.join(', ');
            if (audienceString !== tool.target_audience) {
              updateData.target_audience = audienceString;
              updatedFields.push('target_audience');
            }
          }
          break;
        case 'key_features':
          if (analysis.keyFeatures && analysis.keyFeatures.length > 0) {
            const featuresString = analysis.keyFeatures.join(', ');
            if (featuresString !== tool.key_features) {
              updateData.key_features = featuresString;
              updatedFields.push('key_features');
            }
          }
          break;
        case 'tags':
          if (analysis.tags && analysis.tags.length > 0) {
            const tagsString = analysis.tags.join(', ');
            if (tagsString !== tool.tags) {
              updateData.tags = tagsString;
              updatedFields.push('tags');
            }
          }
          break;
        case 'meta_title':
          if (analysis.metaTitle && analysis.metaTitle !== tool.meta_title) {
            updateData.meta_title = analysis.metaTitle;
            updatedFields.push('meta_title');
          }
          break;
        case 'meta_description':
          if (analysis.metaDescription && analysis.metaDescription !== tool.meta_description) {
            updateData.meta_description = analysis.metaDescription;
            updatedFields.push('meta_description');
          }
          break;
        case 'seo_keywords':
          if (analysis.tags && analysis.tags.length > 0) {
            const keywordsString = analysis.tags.join(', ');
            if (keywordsString !== tool.seo_keywords) {
              updateData.seo_keywords = keywordsString;
              updatedFields.push('seo_keywords');
            }
          }
          break;
      }
    }

    // Update last_checked_at timestamp
    updateData.last_checked_at = new Date();

    // Update last_optimized_at if requested
    if (updateOptions.updateOptimizedAt) {
      updateData.last_optimized_at = new Date();
    }

    // Update tool in database if there are changes
    let updatedTool = tool;
    if (Object.keys(updateData).length > 0) {
      updatedTool = await toolsService.updateTool(toolId, updateData);
    }

    // Return analysis results and update information
    return NextResponse.json({
      success: true,
      data: {
        analysis,
        tool: updatedTool,
        updatedFields,
        hasChanges: updatedFields.length > 0,
        processingMode: 'professional',
        timestamp: new Date().toISOString()
      },
      message: updatedFields.length > 0 
        ? `Tool analyzed and ${updatedFields.length} fields updated successfully`
        : 'Tool analyzed successfully, no updates needed'
    });

  } catch (error) {
    console.error('Error in POST /api/tools/[id]/analyze:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze tool',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}