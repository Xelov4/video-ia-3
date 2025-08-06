/**
 * Video-IA.net Tool Scraper API
 * Analyzes AI tools from URLs using web scraping and AI analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { ScraperService } from '@/src/services/scraper';

const scraperService = new ScraperService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, professional = false } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!scraperService.validateUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Choose analysis method based on professional flag
    const analysis = professional 
      ? await scraperService.analyzeProfessionalTool(url)
      : await scraperService.analyzeToolWebsite(url);

    return NextResponse.json({
      ...analysis,
      processingMode: professional ? 'professional' : 'standard',
      timestamp: new Date().toISOString(),
      version: '2.0'
    });

  } catch (error) {
    console.error('Scraper API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'Failed to analyze the provided URL',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}