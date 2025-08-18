/**
 * Main scraper service
 * Orchestrates the complete scraping and analysis workflow
 */

import { scrapeWebsite } from '@/src/lib/scraper/core';
import { 
  enhancedAnalyzeWithGemini, 
  enhancedPricingAnalysis, 
  enhancedAffiliateAnalysis, 
  enhancedFrenchTranslation 
} from '@/src/lib/ai/enhancedAnalyzer';
import { ToolAnalysis } from '@/src/types/analysis';

/**
 * Professional tool analysis workflow with enhanced AI processing
 */
export async function runFullAnalysis(url: string): Promise<ToolAnalysis> {
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
    throw error; // Re-throw the error to be caught by the API route
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
        (typeof value === 'object' ? Object.keys(value).length > 0 : true)) {
      completedOptional++;
    }
  });

  // Calculate weighted completeness (80% for required, 20% for optional)
  const requiredScore = (completedRequired / fields.length) * 80;
  const optionalScore = (completedOptional / optionalFields.length) * 20;
  
  return Math.round(requiredScore + optionalScore);
}