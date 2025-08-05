/**
 * Main scraper service
 * Orchestrates the complete scraping and analysis workflow
 */

import { scrapeWebsite } from '@/src/lib/scraper/core';
import { analyzeWithGemini, analyzePricingWithGemini, analyzeAffiliateLinks, translateToFrench } from '@/src/lib/ai/analyzer';
import { ToolAnalysis } from '@/src/types/analysis';

export class ScraperService {
  /**
   * Complete tool analysis workflow
   */
  async analyzeToolWebsite(url: string): Promise<ToolAnalysis> {
    console.log(`🚀 Starting analysis for: ${url}`);

    // Step 1: Scrape the website
    console.log('📡 Step 1: Scraping website content...');
    const scrapingData = await scrapeWebsite(url);
    console.log('✅ Scraping completed successfully');
    console.log(`📊 Extracted data: ${scrapingData.content.length} characters, ${scrapingData.features.length} features, ${scrapingData.pricing.length} pricing mentions`);

    // Step 2: Analyze pricing
    console.log('💰 Step 2: Analyzing pricing information...');
    const pricingDetails = await analyzePricingWithGemini(scrapingData);
    console.log('✅ Pricing analysis completed');
    console.log(`📊 Pricing model: ${pricingDetails.model}, Free tier: ${pricingDetails.freeTier}, Paid plans: ${pricingDetails.paidPlans}`);

    // Step 3: Analyze affiliate links
    console.log('🤝 Step 3: Analyzing affiliate programs...');
    const affiliateInfo = await analyzeAffiliateLinks(scrapingData);
    console.log('✅ Affiliate analysis completed');
    console.log(`📊 Has affiliate program: ${affiliateInfo.hasAffiliateProgram}`);

    // Step 4: Try AI analysis, fallback to basic analysis if rate limited
    console.log('🧠 Step 4: Performing AI analysis...');
    let analysis: ToolAnalysis;
    try {
      analysis = await analyzeWithGemini(scrapingData);
      console.log('✅ AI analysis completed successfully');
      console.log(`📊 Tool identified: ${analysis.toolName}, Category: ${analysis.category}, Confidence: ${analysis.confidence}%`);
    } catch (error) {
      console.log('⚠️ AI analysis failed, using fallback analysis');
      const { analyzeWithFallback } = await import('@/src/lib/ai/analyzer');
      analysis = analyzeWithFallback(scrapingData);
      console.log('✅ Fallback analysis completed');
    }

    // Add pricing details and affiliate info to analysis
    analysis.pricingDetails = pricingDetails;
    analysis.affiliateInfo = affiliateInfo;

    // Step 5: Generate French translation
    console.log('🇫🇷 Step 5: Generating French translation...');
    try {
      const frenchTranslation = await translateToFrench(analysis);
      analysis.translations = frenchTranslation;
      console.log('✅ French translation completed');
    } catch (error) {
      console.log('⚠️ Translation failed, continuing without translation');
    }

    console.log('🎉 Analysis complete!');
    console.log(`📊 Final results: ${analysis.toolName} - ${analysis.category} - ${analysis.confidence}% confidence`);
    return analysis;
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}