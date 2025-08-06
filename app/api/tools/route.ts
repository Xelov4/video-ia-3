/**
 * Multilingual Tools API Route
 * Handles CRUD operations for tools with full i18n support
 */

import { NextRequest, NextResponse } from 'next/server';
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools';
import { validateLanguageParam, validatePageParam, validateLimitParam, I18N_HEADERS } from '@/src/lib/i18n/types';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Validation sécurisée des paramètres
    const language = validateLanguageParam(searchParams.get('lang') || 'en');
    const page = validatePageParam(searchParams.get('page') || '1');
    const limit = validateLimitParam(searchParams.get('limit') || '20', 50); // Max 50 pour API
    
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : 
                     searchParams.get('featured') === 'false' ? false : undefined;
    const sortBy = searchParams.get('sortBy') as 'name' | 'created_at' | 'view_count' | 'quality_score' || 'created_at';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const useCache = searchParams.get('cache') !== 'false'; // Cache activé par défaut

    // Appel du service multilingue
    const result = await multilingualToolsService.searchTools({
      language,
      query: search,
      category,
      featured,
      page,
      limit,
      sortBy,
      sortOrder,
      useCache
    });

    // Headers informatifs pour debugging
    const responseHeaders = new Headers();
    responseHeaders.set(I18N_HEADERS.LANGUAGE, result.meta.language);
    responseHeaders.set(I18N_HEADERS.FALLBACK_USED, result.meta.fallbackCount.toString());
    responseHeaders.set(I18N_HEADERS.CACHE_STATUS, result.meta.cacheHit ? 'HIT' : 'MISS');
    responseHeaders.set('Content-Type', 'application/json');

    const response = {
      success: true,
      data: result.tools,
      pagination: result.pagination,
      meta: {
        language: result.meta.language,
        fallbackCount: result.meta.fallbackCount,
        responseTime: Date.now() - startTime,
        cacheHit: result.meta.cacheHit,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: responseHeaders 
    });

  } catch (error) {
    console.error('Multilingual Tools API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url
    });

    // Gestion spécifique des erreurs de validation
    if (error instanceof Error && (error as any).code) {
      const validationError = error as any;
      return NextResponse.json(
        {
          success: false,
          error: validationError.message,
          code: validationError.code,
          field: validationError.field
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}