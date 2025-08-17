import { NextRequest, NextResponse } from 'next/server';
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools';
import { validateLanguageParam } from '@/src/lib/i18n/types';
import { z } from 'zod';

// Schema for search parameters
const searchParamsSchema = z.object({
  lang: z.string().optional(),
  query: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(24),
  category: z.string().optional(),
  audience: z.string().optional(),
  useCase: z.string().optional(),
  minQualityScore: z.coerce.number().min(0).max(100).optional(),
  hasImageUrl: z.coerce.boolean().optional(),
  hasVideoUrl: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  priceRange: z.string().optional(),
  sortBy: z.enum(['relevance', 'name', 'created_at', 'view_count', 'quality_score']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Extract and validate parameters
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validationResult = searchParamsSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid parameters',
        details: validationResult.error.flatten()
      }, { status: 400 });
    }
    
    const { 
      lang,
      query, 
      page, 
      limit, 
      category, 
      audience, 
      useCase, 
      minQualityScore,
      hasImageUrl,
      hasVideoUrl,
      featured,
      priceRange,
      sortBy,
      sortOrder
    } = validationResult.data;
    
    // Execute search
    const result = await multilingualToolsService.searchTools({
      language: validateLanguageParam(lang),
      query,
      audience,
      useCase,
      category,
      filters: {
        minQualityScore,
        hasImageUrl,
        hasVideoUrl,
        featured,
        priceRange
      },
      sortBy,
      sortOrder,
      page,
      limit
    });
    
    // Return response
    return NextResponse.json({
      success: true,
      data: result.tools,
      meta: {
        queryTime: Date.now() - startTime,
        language: result.meta.language,
        fallbackCount: result.meta.fallbackCount,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Error searching tools:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to search tools',
      meta: {
        queryTime: Date.now() - startTime
      }
    }, { status: 500 });
  }
}
