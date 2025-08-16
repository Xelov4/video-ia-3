/**
 * Main scraper service
 * Orchestrates the complete scraping and analysis workflow
 */

import { scrapeWebsite } from '@/src/lib/scraper/core';
import { analyzeWithGemini, analyzePricingWithGemini, analyzeAffiliateLinks, translateToFrench } from '@/src/lib/ai/analyzer';
import { 
  enhancedAnalyzeWithGemini, 
  enhancedPricingAnalysis, 
  enhancedAffiliateAnalysis, 
  enhancedFrenchTranslation 
} from '@/src/lib/ai/enhancedAnalyzer';
import { ToolAnalysis } from '@/src/types/analysis';

export class ScraperService {
  /**
   * Professional tool analysis workflow with enhanced AI processing
   */
  async analyzeProfessionalTool(url: string): Promise<ToolAnalysis> {
    console.log(`🚀 Starting professional analysis for: ${url}`);

    try {
      // Step 1: Enhanced website scraping
      console.log('📡 Step 1: Enhanced website scraping...');
      const scrapingData = await scrapeWebsite(url);
      console.log(`✅ Scraping completed: ${scrapingData.content.length} chars, ${scrapingData.features.length} features`);

      // Step 2: Professional AI analysis with enhanced prompts
      console.log('🧠 Step 2: Professional AI analysis...');
      const analysis = await enhancedAnalyzeWithGemini(scrapingData);
      console.log(`✅ Enhanced AI analysis completed: ${analysis.toolName} (${analysis.confidence}% confidence)`);

      // Step 3: Enhanced pricing analysis
      console.log('💰 Step 3: Enhanced pricing analysis...');
      const pricingDetails = await enhancedPricingAnalysis(scrapingData);
      analysis.pricingDetails = pricingDetails;
      console.log(`✅ Enhanced pricing analysis completed: ${pricingDetails.model}`);

      // Step 4: Enhanced affiliate program analysis
      console.log('🤝 Step 4: Enhanced affiliate analysis...');
      const affiliateInfo = await enhancedAffiliateAnalysis(scrapingData);
      analysis.affiliateInfo = affiliateInfo;
      console.log(`✅ Enhanced affiliate analysis completed: ${affiliateInfo.hasAffiliateProgram ? 'Program found' : 'No program'}`);

      // Step 5: Enhanced French translation with SEO optimization
      console.log('🇫🇷 Step 5: Enhanced French translation...');
      try {
        const frenchTranslation = await enhancedFrenchTranslation(analysis);
        analysis.translations = frenchTranslation;
        console.log('✅ Enhanced French translation completed');
      } catch (error) {
        console.log('⚠️ French translation failed, continuing without translation');
      }

      // Step 6: Quality assessment and scoring
      console.log('📊 Step 6: Quality assessment...');
      analysis.completenessScore = calculateCompletenessScore(analysis);
      console.log(`✅ Quality assessment completed: ${analysis.completenessScore}% complete`);

      console.log('🎉 Professional analysis complete!');
      console.log(`📊 Final results: ${analysis.toolName} - ${analysis.category} - ${analysis.confidence}% confidence`);
      
      return analysis;

    } catch (error) {
      console.error('Professional analysis error:', error);
      
      // Fallback to standard analysis if enhanced fails
      console.log('⚠️ Falling back to standard analysis workflow...');
      return this.analyzeToolWebsite(url);
    }
  }

  /**
   * Complete tool analysis workflow (original method)
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

/**
 * Calculate completeness score based on filled fields
 */
function calculateCompletenessScore(analysis: ToolAnalysis): number {
  const fields = [
    'toolName', 'primaryFunction', 'keyFeatures', 'targetAudience', 
    'pricingModel', 'category', 'description', 'metaTitle', 
    'metaDescription', 'tags', 'confidence'
  ];

  const optionalFields = [
    'socialLinks', 'contactInfo', 'logoUrl', 'pricingDetails',
    'affiliateInfo', 'translations', 'useCases', 'limitations',
    'integrations', 'languages', 'platforms', 'competitiveAdvantages'
  ];

  let completedRequired = 0;
  let completedOptional = 0;

  // Check required fields
  fields.forEach(field => {
    const value = (analysis as any)[field];
    if (value !== null && value !== undefined && value !== '' && 
        (Array.isArray(value) ? value.length > 0 : true)) {
      completedRequired++;
    }
  });

  // Check optional fields
  optionalFields.forEach(field => {
    const value = (analysis as any)[field];
    if (value !== null && value !== undefined && value !== '' && 
        (Array.isArray(value) ? value.length > 0 : true) &&
        (typeof value === 'object' ? Object.keys(value).length > 0 : true)) {
      completedOptional++;
    }
  });

  // Calculate weighted completeness (80% for required, 20% for optional)
  const requiredScore = (completedRequired / fields.length) * 80;
  const optionalScore = (completedOptional / optionalFields.length) * 20;
  
  return Math.round(requiredScore + optionalScore);
}