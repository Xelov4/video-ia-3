/**
 * Enhanced AI Analyzer with Professional Prompts
 * Ultra-optimized for high-quality, SEO-friendly content generation
 */

import { GoogleGenAI } from '@google/genai';
import { ScrapingResult } from '@/src/types/scraper';
import { ToolAnalysis, PricingDetails, AffiliateInfo, FrenchTranslation } from '@/src/types/analysis';
import { generateSlug, generateSEODescription, generatePricingSummary } from '@/src/utils/content';
import { 
  AI_TOOL_ANALYSIS_PROMPT,
  PRICING_ANALYSIS_PROMPT,
  AFFILIATE_ANALYSIS_PROMPT,
  FRENCH_TRANSLATION_PROMPT,
  CONTENT_OPTIMIZATION_PROMPT,
  QUALITY_ASSESSMENT_PROMPT,
  generateCategorySpecificPrompt,
  generateQualityRubric
} from './prompts';

// Get API key from environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY not found in environment variables.');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Enhanced model configuration with optimal settings
const PREMIUM_MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash',
  'gemini-1.5-pro-002',
  'gemini-1.5-pro',
  'gemini-1.5-flash'
];

interface ModelConfig {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'analysis': {
    temperature: 0.3,  // Lower for accuracy
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 4096
  },
  'creative': {
    temperature: 0.7,  // Higher for creativity
    topP: 0.9,
    topK: 50,
    maxOutputTokens: 4096
  },
  'translation': {
    temperature: 0.4,  // Balanced for natural translations
    topP: 0.85,
    topK: 45,
    maxOutputTokens: 3072
  }
};

async function executeWithRetry(
  prompt: string, 
  operation: string, 
  config: ModelConfig,
  maxRetries: number = 3
): Promise<string> {
  if (!ai) {
    throw new Error('No Gemini API available');
  }

  let lastError: Error | null = null;

  for (let modelIndex = 0; modelIndex < PREMIUM_MODELS.length; modelIndex++) {
    const model = PREMIUM_MODELS[modelIndex];
    
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        console.log(`🔄 Attempting ${operation} with ${model} (attempt ${retry + 1}/${maxRetries})`);
        
        const genModel = ai.models.generateContent({
          model: model,
          contents: prompt,
        });

        const result = await genModel;
        const text = result.text;
        
        if (!text) {
          throw new Error('No response text from Gemini API');
        }

        console.log(`✅ ${operation} successful with ${model} on attempt ${retry + 1}`);
        return text;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        console.log(`❌ ${operation} failed with ${model} (attempt ${retry + 1}): ${lastError.message}`);
        
        // Check if we should retry with the same model
        if (lastError.message.includes('overloaded') || 
            lastError.message.includes('503') || 
            lastError.message.includes('UNAVAILABLE') ||
            lastError.message.includes('rate limit')) {
          
          if (retry < maxRetries - 1) {
            const delay = Math.pow(2, retry) * 1000; // Exponential backoff
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // For other errors, try next model immediately
        break;
      }
    }
  }

  throw lastError || new Error(`All models failed for ${operation}`);
}

/**
 * Enhanced tool analysis with professional prompts and quality scoring
 */
export async function enhancedAnalyzeWithGemini(scrapingData: ScrapingResult): Promise<ToolAnalysis> {
  try {
    if (!ai) {
      console.log('No Gemini API key available, using fallback analysis');
      return enhancedFallbackAnalysis(scrapingData);
    }

    // Pre-process content for better analysis
    const processedContent = preprocessContent(scrapingData);
    
    // Detect likely category for specialized analysis
    const preliminaryCategory = detectPrimaryCategory(scrapingData);
    const categoryPrompt = generateCategorySpecificPrompt(preliminaryCategory, scrapingData);
    
    const fullPrompt = `${AI_TOOL_ANALYSIS_PROMPT}

**WEBSITE DATA TO ANALYZE:**
URL: ${scrapingData.url}
Title: ${scrapingData.title}
Description: ${scrapingData.description}
Content: ${processedContent.substring(0, 6000)}
Features Detected: ${scrapingData.features.slice(0, 10).join(', ')}
Pricing Mentions: ${scrapingData.pricing.slice(0, 5).join(', ')}
Social Links: ${Object.entries(scrapingData.socialLinks).filter(([_, url]) => url).map(([platform, url]) => `${platform}: ${url}`).join(', ')}
Contact Info: ${scrapingData.contactInfo.email || 'None'} | ${scrapingData.contactInfo.contactFormUrl || 'None'}
Logo: ${scrapingData.logoUrl || 'None detected'}

${categoryPrompt}

${generateQualityRubric(preliminaryCategory)}

**REQUIRED JSON RESPONSE:**
{
  "toolName": "Exact official tool name",
  "primaryFunction": "Specific, clear description of main purpose",
  "keyFeatures": ["Unique feature 1", "Unique feature 2", "Unique feature 3", "Unique feature 4", "Unique feature 5"],
  "targetAudience": ["Specific audience 1", "Specific audience 2", "Specific audience 3"],
  "pricingModel": "Free/Freemium/Paid/Subscription/Usage-based/Enterprise/Tiered",
  "category": "Choose from our taxonomy",
  "description": "800-1500 word HTML description with proper structure",
  "metaTitle": "50-60 chars including - Video-IA.net",
  "metaDescription": "150-160 chars with benefit + CTA",
  "tags": ["seo-tag1", "seo-tag2", "seo-tag3", "seo-tag4", "seo-tag5"],
  "confidence": 85,
  "dataCompleteness": 90,
  "recommendedActions": ["specific improvement 1", "specific improvement 2"],
  "qualityScore": 8.5,
  "competitiveAdvantages": ["advantage1", "advantage2", "advantage3"],
  "useCases": ["use case 1", "use case 2", "use case 3"],
  "limitations": ["limitation1", "limitation2"],
  "integrations": ["integration1", "integration2"],
  "languages": ["English", "Spanish"],
  "platforms": ["Web", "API", "Mobile"],
  "pricingDetails": {
    "model": "Subscription",
    "plans": [
      {
        "name": "Free",
        "price": "$0/month",
        "features": ["feature1", "feature2"],
        "billing": "monthly",
        "limits": "100 requests/month"
      }
    ],
    "freeTier": true,
    "paidPlans": true,
    "enterpriseAvailable": false,
    "pricingNotes": "Details about pricing"
  }
}`;

    const response = await executeWithRetry(
      fullPrompt, 
      'Enhanced AI analysis', 
      MODEL_CONFIGS.analysis
    );

    const analysis = parseAIResponse(response, scrapingData);
    
    // Post-process and validate
    const validatedAnalysis = validateAndEnhanceAnalysis(analysis, scrapingData);
    
    console.log(`✅ Enhanced analysis completed: ${validatedAnalysis.toolName} (${validatedAnalysis.confidence}% confidence)`);
    
    return validatedAnalysis;

  } catch (error) {
    console.error('Enhanced AI analysis error:', error);
    return enhancedFallbackAnalysis(scrapingData);
  }
}

/**
 * Enhanced pricing analysis with detailed extraction
 */
export async function enhancedPricingAnalysis(scrapingData: ScrapingResult): Promise<PricingDetails> {
  try {
    if (!ai) {
      return getEnhancedFallbackPricing(scrapingData);
    }

    const pricingContent = extractPricingContent(scrapingData);
    
    const fullPrompt = `${PRICING_ANALYSIS_PROMPT}

**PRICING CONTENT TO ANALYZE:**
${pricingContent}

**EXPECTED JSON STRUCTURE:**
{
  "model": "Free/Freemium/Paid/Subscription/Usage-based/Tiered/Enterprise",
  "plans": [
    {
      "name": "Plan Name",
      "price": "$X/month or Free or Contact Sales",
      "yearlyPrice": "$X/year (if available)",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "billing": "monthly/yearly/one-time/usage-based",
      "limits": "Specific usage limits",
      "popular": true/false,
      "description": "Brief plan description"
    }
  ],
  "freeTier": true/false,
  "freeTrialDays": 7,
  "paidPlans": true/false,
  "enterpriseAvailable": true/false,
  "annualDiscount": "20% off annual plans",
  "currencies": ["USD", "EUR"],
  "paymentMethods": ["Credit Card", "PayPal"],
  "refundPolicy": "30-day refund policy",
  "pricingNotes": "Additional important pricing information"
}`;

    const response = await executeWithRetry(
      fullPrompt,
      'Enhanced pricing analysis',
      MODEL_CONFIGS.analysis
    );

    const pricing = JSON.parse(response) as PricingDetails;
    return validatePricingDetails(pricing);

  } catch (error) {
    console.error('Enhanced pricing analysis error:', error);
    return getEnhancedFallbackPricing(scrapingData);
  }
}

/**
 * Enhanced affiliate program analysis
 */
export async function enhancedAffiliateAnalysis(scrapingData: ScrapingResult): Promise<AffiliateInfo> {
  try {
    if (!ai) {
      return getEnhancedFallbackAffiliate(scrapingData);
    }

    const affiliateContent = extractAffiliateContent(scrapingData);
    
    const fullPrompt = `${AFFILIATE_ANALYSIS_PROMPT}

**CONTENT TO ANALYZE:**
${affiliateContent}

**EXPECTED JSON STRUCTURE:**
{
  "affiliateProgramUrl": "Full URL to affiliate program page or null",
  "affiliateContactEmail": "Email for affiliate inquiries or null",
  "affiliateContactForm": "URL to affiliate contact form or null",
  "hasAffiliateProgram": true/false,
  "commissionRate": "X% or $X per sale (if mentioned)",
  "commissionStructure": "Description of how commissions work",
  "minimumPayout": "$X minimum payout threshold",
  "payoutMethods": ["PayPal", "Bank Transfer"],
  "cookieDuration": "30 days cookie duration",
  "restrictions": "Geographic or other restrictions",
  "benefits": ["Benefit 1", "Benefit 2"],
  "applicationProcess": "How to apply for the program",
  "notes": "Additional relevant information"
}`;

    const response = await executeWithRetry(
      fullPrompt,
      'Enhanced affiliate analysis',
      MODEL_CONFIGS.analysis
    );

    return JSON.parse(response) as AffiliateInfo;

  } catch (error) {
    console.error('Enhanced affiliate analysis error:', error);
    return getEnhancedFallbackAffiliate(scrapingData);
  }
}

/**
 * Enhanced French translation with SEO optimization
 */
export async function enhancedFrenchTranslation(analysis: ToolAnalysis): Promise<FrenchTranslation> {
  try {
    if (!ai) {
      return getEnhancedFallbackTranslation(analysis);
    }

    const fullPrompt = `${FRENCH_TRANSLATION_PROMPT}

**CONTENT TO TRANSLATE:**
Tool Name: ${analysis.toolName}
Primary Function: ${analysis.primaryFunction}
Key Features: ${analysis.keyFeatures.join(', ')}
Target Audience: ${analysis.targetAudience.join(', ')}
Description: ${analysis.description?.substring(0, 2000)}
Meta Title: ${analysis.metaTitle}
Meta Description: ${analysis.metaDescription}
Pricing Summary: ${analysis.pricingSummary}
Use Cases: ${analysis.useCases?.join(', ') || ''}

**FRENCH SEO KEYWORDS TO TARGET:**
- outils IA
- intelligence artificielle
- ${analysis.category.toLowerCase()}
- automatisation
- productivité

**EXPECTED JSON STRUCTURE:**
{
  "toolName": "${analysis.toolName}",
  "primaryFunction": "French translation optimized for search",
  "keyFeatures": ["Fonctionnalité 1", "Fonctionnalité 2", "Fonctionnalité 3", "Fonctionnalité 4", "Fonctionnalité 5"],
  "targetAudience": ["Public cible 1", "Public cible 2", "Public cible 3"],
  "description": "800+ word French HTML description with SEO optimization",
  "metaTitle": "French meta title - Video-IA.net",
  "metaDescription": "French meta description with French marketing conventions",
  "pricingSummary": "French pricing summary",
  "useCases": ["Cas d'usage 1", "Cas d'usage 2", "Cas d'usage 3"],
  "seoKeywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3"]
}`;

    const response = await executeWithRetry(
      fullPrompt,
      'Enhanced French translation',
      MODEL_CONFIGS.translation
    );

    return JSON.parse(response) as FrenchTranslation;

  } catch (error) {
    console.error('Enhanced French translation error:', error);
    return getEnhancedFallbackTranslation(analysis);
  }
}

/**
 * Helper functions
 */

function preprocessContent(scrapingData: ScrapingResult): string {
  // Remove excessive whitespace and normalize content
  return scrapingData.content
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

function detectPrimaryCategory(scrapingData: ScrapingResult): string {
  const content = scrapingData.content.toLowerCase();
  const title = scrapingData.title.toLowerCase();
  const combined = `${title} ${content}`;

  // Enhanced category detection logic
  const categories = {
    'Image Generation': ['image generat', 'ai art', 'create image', 'photo generat', 'dall-e', 'midjourney', 'stable diffusion'],
    'Video Generation': ['video generat', 'create video', 'ai video', 'video creation', 'animate', 'motion'],
    'Content Creation': ['content creat', 'blog writ', 'copywriting', 'article writ', 'content generat'],
    'AI Assistant': ['ai assistant', 'chatbot', 'virtual assistant', 'conversational ai', 'chat gpt'],
    'Developer Tools': ['developer', 'coding', 'programming', 'api', 'development', 'code generat'],
    'Data Analysis': ['data analys', 'analytics', 'business intelligence', 'data visual', 'reporting']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => combined.includes(keyword))) {
      return category;
    }
  }

  return 'AI Assistant';
}

function parseAIResponse(response: string, scrapingData: ScrapingResult): ToolAnalysis {
  try {
    const parsed = JSON.parse(response) as ToolAnalysis;
    
    // Add scraped data that AI might miss
    parsed.socialLinks = scrapingData.socialLinks;
    parsed.contactInfo = scrapingData.contactInfo;
    parsed.logoUrl = scrapingData.logoUrl;
    parsed.slug = generateSlug(parsed.toolName);
    
    return parsed;
  } catch (error) {
    throw new Error('Failed to parse AI response JSON');
  }
}

function validateAndEnhanceAnalysis(analysis: ToolAnalysis, scrapingData: ScrapingResult): ToolAnalysis {
  // Validate required fields
  if (!analysis.toolName || !analysis.primaryFunction || !analysis.category) {
    throw new Error('Missing required analysis fields');
  }

  // Enhance with fallback data if needed
  if (!analysis.description || analysis.description.length < 500) {
    analysis.description = generateEnhancedDescription(analysis, scrapingData);
  }

  if (!analysis.metaTitle || analysis.metaTitle.length > 60) {
    analysis.metaTitle = `${analysis.toolName} - ${analysis.category} Tool - Video-IA.net`;
  }

  if (!analysis.metaDescription || analysis.metaDescription.length > 160) {
    analysis.metaDescription = `Discover ${analysis.toolName}, the advanced ${analysis.category.toLowerCase()} tool. Transform your workflow with AI-powered features. Try free today!`;
  }

  // Ensure quality scores are reasonable
  analysis.confidence = Math.max(60, Math.min(100, analysis.confidence || 75));
  analysis.dataCompleteness = Math.max(50, Math.min(100, analysis.dataCompleteness || 70));

  return analysis;
}

function extractPricingContent(scrapingData: ScrapingResult): string {
  const pricingSection = scrapingData.content
    .split('\n')
    .filter(line => {
      const lower = line.toLowerCase();
      return lower.includes('price') || lower.includes('plan') || 
             lower.includes('$') || lower.includes('€') || 
             lower.includes('free') || lower.includes('premium');
    })
    .slice(0, 20)
    .join('\n');

  return `URL: ${scrapingData.url}
Title: ${scrapingData.title}
Pricing Info: ${scrapingData.pricing.join(', ')}
Relevant Content: ${pricingSection}`;
}

function extractAffiliateContent(scrapingData: ScrapingResult): string {
  const affiliateSection = scrapingData.content
    .split('\n')
    .filter(line => {
      const lower = line.toLowerCase();
      return lower.includes('affiliate') || lower.includes('partner') || 
             lower.includes('referral') || lower.includes('commission');
    })
    .slice(0, 10)
    .join('\n');

  return `URL: ${scrapingData.url}
Contact: ${scrapingData.contactInfo.email || 'None'}
Affiliate Content: ${affiliateSection}`;
}

function generateEnhancedDescription(analysis: ToolAnalysis, scrapingData: ScrapingResult): string {
  return `<h2>What is ${analysis.toolName}?</h2>
<p><strong>${analysis.toolName}</strong> is a cutting-edge ${analysis.category.toLowerCase()} tool that ${analysis.primaryFunction.toLowerCase()}. Designed for ${analysis.targetAudience.join(', ')}, this innovative platform leverages advanced artificial intelligence to deliver exceptional results.</p>

<h2>Key Features of ${analysis.toolName}</h2>
<ul>
${analysis.keyFeatures.map(feature => `<li><strong>${feature}</strong></li>`).join('')}
</ul>

<h2>Who Should Use ${analysis.toolName}?</h2>
<p>This powerful tool is perfect for ${analysis.targetAudience.join(', ')} who need reliable ${analysis.category.toLowerCase()} capabilities. Whether you're a professional or just getting started, ${analysis.toolName} provides the features you need to succeed.</p>

<h2>Getting Started</h2>
<p>Ready to transform your workflow with ${analysis.toolName}? Visit their website to explore the platform and discover how it can enhance your productivity today.</p>`;
}

// Enhanced fallback functions
function enhancedFallbackAnalysis(scrapingData: ScrapingResult): ToolAnalysis {
  const toolName = scrapingData.title || 'AI Tool';
  const category = detectPrimaryCategory(scrapingData);
  
  const pricingDetails = getEnhancedFallbackPricing(scrapingData);
  const affiliateInfo = getEnhancedFallbackAffiliate(scrapingData);
  
  return {
    toolName,
    slug: generateSlug(toolName),
    primaryFunction: `Advanced ${category.toLowerCase()} capabilities`,
    keyFeatures: scrapingData.features.slice(0, 5),
    targetAudience: ['Professionals', 'Businesses', 'Content Creators'],
    pricingModel: 'Freemium',
    category,
    description: generateEnhancedDescription({
      toolName,
      category,
      primaryFunction: `Advanced ${category.toLowerCase()} capabilities`,
      keyFeatures: scrapingData.features.slice(0, 5),
      targetAudience: ['Professionals', 'Businesses', 'Content Creators']
    } as ToolAnalysis, scrapingData),
    metaTitle: `${toolName} - ${category} Tool - Video-IA.net`,
    metaDescription: `Discover ${toolName}, the advanced ${category.toLowerCase()} tool. Transform your workflow with AI-powered features. Try free today!`,
    tags: ['AI', category.replace(' ', ''), 'Productivity', 'Innovation'],
    confidence: 65,
    dataCompleteness: 60,
    qualityScore: 6.5,
    recommendedActions: ['Verify tool features', 'Confirm pricing details', 'Test tool capabilities'],
    socialLinks: scrapingData.socialLinks,
    contactInfo: scrapingData.contactInfo,
    logoUrl: scrapingData.logoUrl,
    pricingDetails,
    pricingSummary: generatePricingSummary(pricingDetails),
    affiliateInfo
  };
}

function getEnhancedFallbackPricing(scrapingData: ScrapingResult): PricingDetails {
  const content = scrapingData.content.toLowerCase();
  let model = 'Freemium';
  
  if (content.includes('enterprise') && content.includes('custom')) {
    model = 'Enterprise';
  } else if (content.includes('subscription')) {
    model = 'Subscription';
  } else if (content.includes('usage') || content.includes('credit')) {
    model = 'Usage-based';
  }

  return {
    model,
    plans: [],
    freeTier: !content.includes('paid only'),
    paidPlans: content.includes('premium') || content.includes('pro'),
    enterpriseAvailable: content.includes('enterprise'),
    pricingNotes: 'Pricing details extracted from website analysis'
  };
}

function getEnhancedFallbackAffiliate(scrapingData: ScrapingResult): AffiliateInfo {
  const content = scrapingData.content.toLowerCase();
  const hasAffiliate = content.includes('affiliate') || content.includes('partner') || content.includes('referral');
  
  return {
    affiliateProgramUrl: undefined,
    affiliateContactEmail: scrapingData.contactInfo.email,
    affiliateContactForm: scrapingData.contactInfo.contactFormUrl,
    hasAffiliateProgram: hasAffiliate,
    notes: hasAffiliate ? 'Affiliate program indicators found' : 'No affiliate program detected'
  };
}

function getEnhancedFallbackTranslation(analysis: ToolAnalysis): FrenchTranslation {
  return {
    toolName: analysis.toolName,
    primaryFunction: `Outil ${analysis.category} alimenté par l'IA`,
    keyFeatures: analysis.keyFeatures,
    targetAudience: ['Créateurs de contenu', 'Professionnels', 'Entreprises'],
    description: analysis.description,
    metaTitle: `${analysis.toolName} - Outil IA ${analysis.category} - Video-IA.net`,
    metaDescription: `Découvrez ${analysis.toolName}, l'outil ${analysis.category.toLowerCase()} avancé. Transformez votre flux de travail avec l'IA. Essayez gratuitement !`,
    pricingSummary: analysis.pricingSummary
  };
}

function validatePricingDetails(pricing: PricingDetails): PricingDetails {
  if (!pricing.model) {
    pricing.model = 'Freemium';
  }
  if (typeof pricing.freeTier !== 'boolean') {
    pricing.freeTier = true;
  }
  if (typeof pricing.paidPlans !== 'boolean') {
    pricing.paidPlans = true;
  }
  return pricing;
}