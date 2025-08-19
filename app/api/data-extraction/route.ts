/**
 * Data Extraction API
 *
 * API pour récupérer les données extraites (audiences, use cases, features, tags)
 * Utilisé par le frontend pour construire les nouvelles pages et filtres
 */

import { NextRequest, NextResponse } from 'next/server';
import { DataExtractionService } from '@/src/lib/services/dataExtraction';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'audiences' | 'use-cases' | 'features' | 'tags' | 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    let result: any = {};

    switch (type) {
      case 'audiences':
        result.audiences = await DataExtractionService.extractUniqueAudiences();
        if (limit > 0) result.audiences = result.audiences.slice(0, limit);
        break;

      case 'use-cases':
        result.useCases = await DataExtractionService.extractUseCases();
        if (limit > 0) result.useCases = result.useCases.slice(0, limit);
        break;

      case 'features':
        result.features = await DataExtractionService.extractFeatures();
        if (limit > 0) result.features = result.features.slice(0, limit);
        break;

      case 'tags':
        result.tags = await DataExtractionService.extractCleanTags();
        if (limit > 0) result.tags = result.tags.slice(0, limit);
        break;

      case 'all':
      default:
        result = await DataExtractionService.extractAllData();
        break;
    }

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        type: type || 'all',
        limit,
        responseTime,
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Data extraction API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract data',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
