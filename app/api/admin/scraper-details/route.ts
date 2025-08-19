import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/database/client';
import { generateSeo, translateContent } from '@/src/lib/ai/enhancedAnalyzer';
import { runFullAnalysis } from '@/src/services/scraper';

const analysisRequestSchema = z.object({
  toolId: z.number(),
  modules: z.array(z.enum(['full_scrape', 'seo', 'pricing', 'translate'])),
  translateConfig: z
    .object({
      sourceLang: z.string(),
      targetLangs: z.array(z.string()),
      instructions: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = analysisRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { toolId, modules, translateConfig } = validation.data;

    console.log('Received analysis request:', { toolId, modules, translateConfig });

    // Fetch the tool data from the database
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }

    const analysisResults: any = {};

    // Process each requested module
    for (const moduleType of modules) {
      if (moduleType === 'seo') {
        const seoData = await generateSeo({
          toolName: tool.toolName,
          primaryFunction: tool.toolDescription || '', // Assuming toolDescription as primary function
          keyFeatures: tool.keyFeatures
            ? tool.keyFeatures.split(',').map(k => k.trim())
            : [],
        });
        analysisResults.seo = seoData;
      }
      if (moduleType === 'full_scrape') {
        if (!tool.toolLink) {
          analysisResults.full_scrape = { error: "L'outil n'a pas d'URL associée." };
        } else {
          const fullAnalysisData = await runFullAnalysis(tool.toolLink);
          analysisResults.full_scrape = fullAnalysisData;
        }
      }
      if (moduleType === 'translate' && translateConfig) {
        const translations = [];
        for (const targetLang of translateConfig.targetLangs) {
          const translationData = await translateContent(
            {
              toolName: tool.toolName,
              primaryFunction: tool.toolDescription || '',
              description: tool.toolDescription || '',
              metaTitle: tool.metaTitle || '',
              metaDescription: tool.metaDescription || '',
            },
            { code: targetLang, name: targetLang } // Simple name mapping for now
          );
          translations.push({ language: targetLang, ...translationData });
        }
        analysisResults.translations = translations;
      }
      // Future modules will be handled here
    }

    return NextResponse.json({ success: true, results: analysisResults });
  } catch (error) {
    console.error('Error in analysis endpoint:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
