/**
 * Video-IA.net Tool Scraper API
 * Analyzes AI tools from URLs using web scraping and AI analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { runFullAnalysis } from '@/src/services/scraper';

function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    if (!validateUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Always use the full professional analysis
    const analysis = await runFullAnalysis(url);

    return NextResponse.json({
      ...analysis,
      processingMode: 'professional',
      timestamp: new Date().toISOString(),
      version: '2.0',
    });
  } catch (error) {
    console.error('Scraper API error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'Failed to analyze the provided URL',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
