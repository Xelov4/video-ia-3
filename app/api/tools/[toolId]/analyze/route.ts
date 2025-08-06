/**
 * Tool Analysis API Route
 * Analyzes and updates a specific tool from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { toolsService } from '@/src/lib/database/services/tools';
import { ScraperService } from '@/src/services/scraper';

const scraperService = new ScraperService();

export async function POST(
  request: NextRequest,
  { params }: { params: { toolId: string } }
) {
  try {
    const toolId = parseInt(params.toolId);
    if (isNaN(toolId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tool ID' },
        { status: 400 }
      );
    }

    // Get the tool from database
    const tool = await toolsService.getToolById(toolId);
    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Get request body for update options
    const body = await request.json();
    const updateOptions = body.updateOptions || {};
    const fieldsToUpdate = body.fields || [];

    // Analyze the tool's website
    console.log(`🚀 Starting analysis for tool: ${tool.tool_name} (ID: ${toolId})`);
    
    const analysis = await scraperService.analyzeToolWebsite(tool.tool_link);
    console.log(`✅ Analysis completed for: ${analysis.toolName}`);

    // Convert analysis to database format
    const updateData = toolsService.convertAnalysisToDatabase(analysis);

    // Filter fields to update based on request
    let finalUpdateData: Record<string, any> = {};
    
    if (fieldsToUpdate.length > 0) {
      // Update only specified fields
      fieldsToUpdate.forEach((field: string) => {
        if (updateData && typeof updateData === 'object' && field in updateData) {
          finalUpdateData[field] = updateData[field as keyof typeof updateData];
        }
      });
    } else {
      // Update all fields
      finalUpdateData = updateData;
    }

    // Update the tool in database
    const updatedTool = await toolsService.updateToolFields(toolId, finalUpdateData, updateOptions.updateOptimizedAt);
    console.log(`✅ Tool updated in database: ${updatedTool.tool_name}`);

    return NextResponse.json({
      success: true,
      message: 'Tool analyzed and updated successfully',
      data: {
        tool: updatedTool,
        analysis: analysis,
        updatedFields: Object.keys(finalUpdateData)
      }
    });

  } catch (error) {
    console.error('Tool analysis API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 