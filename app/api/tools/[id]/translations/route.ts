/**
 * API Routes for Tool Translations Management
 * Handles CRUD operations for multilingual tool content using Prisma ORM
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth/auth-options';
import { ToolsService } from '@/src/lib/database/services/tools';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tools/[id]/translations
 * Fetch all translations for a specific tool
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const toolId = parseInt(id);
    if (isNaN(toolId)) {
      return NextResponse.json({ error: 'Invalid tool ID' }, { status: 400 });
    }

    const translations = await ToolsService.getToolTranslations(toolId);

    return NextResponse.json({
      success: true,
      translations,
      count: translations.length,
    });
  } catch (error) {
    console.error('Error fetching tool translations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/tools/[id]/translations
 * Create a new translation for a tool
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const toolId = parseInt(id);
    if (isNaN(toolId)) {
      return NextResponse.json({ error: 'Invalid tool ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      languageCode,
      name,
      overview,
      description,
      metaTitle,
      metaDescription,
      translationSource = 'human',
      humanReviewed = false,
    } = body;

    if (!languageCode || !name) {
      return NextResponse.json(
        {
          error: 'Language code and name are required',
        },
        { status: 400 }
      );
    }

    // Check if translation already exists
    const existing = await ToolsService.getToolTranslation(toolId, languageCode);
    if (existing) {
      // If it exists, update it instead of creating a new one
      const updatedTranslation = await ToolsService.updateToolTranslation(existing.id, {
        name: name.trim(),
        overview: overview?.trim() || '',
        description: description?.trim() || '',
        metaTitle: metaTitle?.trim() || '',
        metaDescription: metaDescription?.trim() || '',
        translationSource,
        humanReviewed: Boolean(humanReviewed),
      });

      return NextResponse.json({
        success: true,
        translation: updatedTranslation,
        message: 'Translation updated successfully',
      });
    }

    const createdTranslation = await ToolsService.createToolTranslation({
      toolId,
      languageCode,
      name: name.trim(),
      overview: overview?.trim() || '',
      description: description?.trim() || '',
      metaTitle: metaTitle?.trim() || '',
      metaDescription: metaDescription?.trim() || '',
      translationSource,
      humanReviewed: Boolean(humanReviewed),
    });

    return NextResponse.json(
      {
        success: true,
        translation: createdTranslation,
        message: 'Translation created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating tool translation:', error);

    if (error.code === 'P2002') {
      // Prisma unique constraint violation
      return NextResponse.json(
        {
          error: 'Translation already exists for this language',
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
