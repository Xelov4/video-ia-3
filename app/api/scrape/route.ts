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
    const { url } = body;

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

    // Perform the analysis
    const analysis = await scraperService.analyzeToolWebsite(url);

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Scraper API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'Failed to analyze the provided URL'
      },
      { status: 500 }
    );
  }
}