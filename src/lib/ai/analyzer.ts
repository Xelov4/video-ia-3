/**
 * AI Analysis functionality using Google Gemini
 * Handles tool analysis, pricing analysis, and affiliate detection
 */

import { GoogleGenAI } from '@google/genai';
import { ScrapingResult } from '@/src/types/scraper';
import {
  ToolAnalysis,
  PricingDetails,
  AffiliateInfo,
  FrenchTranslation,
} from '@/src/types/analysis';
import {
  generateSlug,
  generateSEODescription,
  generatePricingSummary,
} from '@/src/utils/content';

// Get API key from environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn(
    '⚠️ GEMINI_API_KEY not found in environment variables. AI analysis will use fallback mode.'
  );
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Model fallback system
const MODELS = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-lite'];

async function tryWithModels(prompt: string, operation: string): Promise<any> {
  if (!ai) {
    throw new Error('No Gemini API available');
  }

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    try {
      console.log(`🔄 Trying ${operation} with ${model}...`);

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response text from Gemini API');
      }

      console.log(`✅ ${operation} successful with ${model}`);
      return text;
    } catch (error) {
      console.log(
        `❌ ${operation} failed with ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      // If this is the last model, throw the error
      if (i === MODELS.length - 1) {
        throw error;
      }

      // If it's an overload error, try the next model
      if (
        error instanceof Error &&
        (error.message.includes('overloaded') ||
          error.message.includes('503') ||
          error.message.includes('UNAVAILABLE') ||
          error.message.includes('rate limit'))
      ) {
        console.log(`🔄 Model ${model} is overloaded, trying next model...`);
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }
}

export async function analyzeWithGemini(
  scrapingData: ScrapingResult
): Promise<ToolAnalysis> {
  try {
    if (!ai) {
      console.log('No Gemini API key available, using fallback analysis');
      return analyzeWithFallback(scrapingData);
    }

    const prompt = `
Analyze the following website content for an AI tool and provide structured information:

Website: ${scrapingData.url}
Title: ${scrapingData.title}
Content: ${scrapingData.content.substring(0, 4000)}
Metadata: ${JSON.stringify(scrapingData.metadata)}
Pricing Info: ${scrapingData.pricing.join(', ')}
Features: ${scrapingData.features.join(', ')}

Please provide a comprehensive analysis and return the response as a valid JSON object with the following structure:

{
  "toolName": "The name of the tool",
  "primaryFunction": "A clear description of what this tool does",
  "keyFeatures": ["feature1", "feature2", "feature3", "feature4", "feature5"],
  "targetAudience": ["audience1", "audience2", "audience3"],
  "pricingModel": "Free/Freemium/Paid/Subscription/Enterprise",
  "category": "AI Assistant/Content Creation/Image Generation/Video Generation/Audio Generation/Data Analysis/etc",
  "description": "A detailed SEO-optimized description (500-1000 words) with proper HTML structure including H2/H3 tags and strategic bold usage",
  "metaTitle": "SEO-optimized title (50-60 characters) - Video-IA.net",
  "metaDescription": "SEO-optimized description (150-160 characters) with clickbait and CTA",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "confidence": 85,
  "dataCompleteness": 90,
  "recommendedActions": ["action1", "action2"],
  "pricingDetails": {
    "model": "Free/Freemium/Paid/Subscription/Enterprise",
    "plans": [],
    "freeTier": true/false,
    "paidPlans": true/false,
    "enterpriseAvailable": true/false,
    "pricingNotes": "Brief notes about pricing"
  }
}

Important guidelines:
- Be specific and accurate in the analysis
- Use the actual tool name from the website
- Categorize appropriately based on the tool's primary function
- Generate realistic confidence and completeness scores
- Provide actionable recommendations if data is incomplete
- Ensure the description is comprehensive and SEO-friendly with proper HTML structure
- Use H2 tags for main sections and H3 tags for subsections
- Apply strategic bold formatting for key terms and benefits
- Keep meta title and description within character limits
- Use relevant tags for searchability
- Meta title must end with " - Video-IA.net"
- Meta description should be clickbait with call-to-action
- Description should be minimum 500 words with clear structure
`;

    const text = await tryWithModels(prompt, 'AI analysis');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }

    const analysis = JSON.parse(jsonMatch[0]) as ToolAnalysis;

    if (!analysis.toolName || !analysis.primaryFunction || !analysis.category) {
      throw new Error('AI analysis missing required fields');
    }

    analysis.socialLinks = scrapingData.socialLinks;
    analysis.contactInfo = scrapingData.contactInfo;
    analysis.logoUrl = scrapingData.logoUrl;
    analysis.slug = generateSlug(analysis.toolName);

    if (!analysis.pricingDetails) {
      analysis.pricingDetails = {
        model: analysis.pricingModel || 'Unknown',
        plans: [],
        freeTier: false,
        paidPlans: false,
        enterpriseAvailable: false,
        pricingNotes: 'Pricing information not available',
      };
    }

    analysis.pricingSummary = generatePricingSummary(analysis.pricingDetails);

    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.log('Rate limit hit, using fallback analysis');
      } else if (
        error.message.includes('API key') ||
        error.message.includes('authentication')
      ) {
        console.log('API key issue, using fallback analysis');
      } else if (error.message.includes('quota') || error.message.includes('billing')) {
        console.log('Quota exceeded, using fallback analysis');
      } else if (
        error.message.includes('overloaded') ||
        error.message.includes('503')
      ) {
        console.log('All models overloaded, using fallback analysis');
      } else {
        console.log('Unknown AI error, using fallback analysis');
      }
    }

    return analyzeWithFallback(scrapingData);
  }
}

export function analyzeWithFallback(scrapingData: ScrapingResult): ToolAnalysis {
  const toolName =
    scrapingData.title ||
    scrapingData.url
      .split('/')
      .pop()
      ?.replace(/[^a-zA-Z0-9]/g, '') ||
    'Unknown Tool';

  const content = scrapingData.content.toLowerCase();
  let category = 'AI Assistant';
  if (
    content.includes('image') ||
    content.includes('photo') ||
    content.includes('picture')
  ) {
    category = 'Image Generation';
  } else if (content.includes('video') || content.includes('movie')) {
    category = 'Video Generation';
  } else if (
    content.includes('audio') ||
    content.includes('music') ||
    content.includes('sound')
  ) {
    category = 'Audio Generation';
  } else if (
    content.includes('text') ||
    content.includes('writing') ||
    content.includes('content')
  ) {
    category = 'Content Creation';
  } else if (content.includes('data') || content.includes('analytics')) {
    category = 'Data Analysis';
  }

  let pricingModel = 'Free';
  if (
    content.includes('subscription') ||
    content.includes('monthly') ||
    content.includes('yearly')
  ) {
    pricingModel = 'Subscription';
  } else if (content.includes('paid') || content.includes('premium')) {
    pricingModel = 'Paid';
  } else if (content.includes('freemium')) {
    pricingModel = 'Freemium';
  }

  const keyFeatures = scrapingData.features.slice(0, 5).map(f => f.substring(0, 100));
  const description = generateSEODescription(
    toolName,
    category,
    keyFeatures,
    pricingModel
  );
  const metaTitle = `${toolName} - AI ${category} Tool - Video-IA.net`;
  const metaDescription = `Transform your workflow with ${toolName}, the leading AI ${category.toLowerCase()} tool. Boost productivity by 300% with intelligent features. Try it free today!`;
  const tags = ['AI', category.replace(' ', ''), 'Automation', 'Productivity'];

  return {
    toolName,
    slug: generateSlug(toolName),
    primaryFunction: `AI-powered ${category.toLowerCase()}`,
    keyFeatures,
    targetAudience: ['Content creators', 'Professionals', 'Businesses'],
    pricingModel,
    category,
    description,
    metaTitle,
    metaDescription,
    tags,
    confidence: 60,
    dataCompleteness: 70,
    recommendedActions: [
      'Verify tool name and features',
      'Check pricing details',
      'Confirm target audience',
    ],
    socialLinks: scrapingData.socialLinks,
    contactInfo: scrapingData.contactInfo,
    logoUrl: scrapingData.logoUrl,
    pricingDetails: {
      model: pricingModel,
      plans: [],
      freeTier: pricingModel === 'Free',
      paidPlans: pricingModel !== 'Free',
      enterpriseAvailable: false,
      pricingNotes: 'Pricing information extracted from website content',
    },
    pricingSummary: generatePricingSummary({
      model: pricingModel,
      plans: [],
      freeTier: pricingModel === 'Free',
      paidPlans: pricingModel !== 'Free',
      enterpriseAvailable: false,
      pricingNotes: 'Pricing information extracted from website content',
    }),
    affiliateInfo: {
      affiliateProgramUrl: undefined,
      affiliateContactEmail: scrapingData.contactInfo.email,
      affiliateContactForm: scrapingData.contactInfo.contactFormUrl,
      hasAffiliateProgram: false,
      notes: 'No affiliate program detected in fallback analysis',
    },
  };
}

export async function analyzePricingWithGemini(
  scrapingData: ScrapingResult
): Promise<PricingDetails> {
  try {
    if (!ai) {
      console.log('No Gemini API key available, using fallback pricing analysis');
      return getFallbackPricing(scrapingData);
    }

    const prompt = `
Analyze the following website content for pricing information and return ONLY a valid JSON object:

Website: ${scrapingData.url}
Content: ${scrapingData.content.substring(0, 2000)}
Pricing mentions: ${scrapingData.pricing.join(', ')}

Return ONLY this JSON structure with no additional text:

{
  "model": "Free/Freemium/Paid/Subscription/Enterprise",
  "plans": [
    {
      "name": "Plan name",
      "price": "Price (e.g., $10/month, Free, Contact sales)",
      "features": ["Feature 1", "Feature 2"],
      "billing": "monthly/yearly/one-time"
    }
  ],
  "freeTier": true,
  "paidPlans": false,
  "enterpriseAvailable": false,
  "pricingNotes": "Additional pricing information"
}
`;

    const text = await tryWithModels(prompt, 'Pricing analysis');

    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '');

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse pricing response as JSON');
    }

    let pricing: PricingDetails;
    try {
      pricing = JSON.parse(jsonMatch[0]) as PricingDetails;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON structure in pricing response');
    }

    if (
      !pricing.model ||
      typeof pricing.freeTier !== 'boolean' ||
      typeof pricing.paidPlans !== 'boolean'
    ) {
      throw new Error('Missing required fields in pricing response');
    }

    return pricing;
  } catch (error) {
    console.error('Pricing analysis error:', error);
    return getFallbackPricing(scrapingData);
  }
}

function getFallbackPricing(scrapingData: ScrapingResult): PricingDetails {
  const content = scrapingData.content.toLowerCase();
  let model = 'Free';
  const freeTier = true;
  let paidPlans = false;
  let enterpriseAvailable = false;

  if (
    content.includes('subscription') ||
    content.includes('monthly') ||
    content.includes('yearly')
  ) {
    model = 'Subscription';
    paidPlans = true;
  } else if (content.includes('paid') || content.includes('premium')) {
    model = 'Paid';
    paidPlans = true;
  } else if (content.includes('freemium')) {
    model = 'Freemium';
    paidPlans = true;
  }

  if (content.includes('enterprise')) {
    enterpriseAvailable = true;
  }

  return {
    model,
    plans: [],
    freeTier,
    paidPlans,
    enterpriseAvailable,
    pricingNotes:
      'Pricing information extracted from website content using fallback analysis',
  };
}

export async function analyzeAffiliateLinks(
  scrapingData: ScrapingResult
): Promise<AffiliateInfo> {
  try {
    if (!ai) {
      console.log('No Gemini API key available, using fallback affiliate analysis');
      return getFallbackAffiliate(scrapingData);
    }

    const prompt = `
Analyze the following website content for affiliate program information:

Website: ${scrapingData.url}
Content: ${scrapingData.content.substring(0, 2000)}

Look for:
1. Affiliate program pages or links
2. Partner program information
3. Contact information for affiliate inquiries
4. Any mention of affiliate partnerships

Return ONLY this JSON structure:

{
  "affiliateProgramUrl": "URL if found, otherwise null",
  "affiliateContactEmail": "Email if found, otherwise null", 
  "affiliateContactForm": "Contact form URL if found, otherwise null",
  "hasAffiliateProgram": true/false,
  "notes": "Brief description of what was found"
}
`;

    const text = await tryWithModels(prompt, 'Affiliate analysis');

    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '');

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse affiliate response as JSON');
    }

    const affiliateInfo = JSON.parse(jsonMatch[0]) as AffiliateInfo;
    return affiliateInfo;
  } catch (error) {
    console.error('Affiliate analysis error:', error);
    return getFallbackAffiliate(scrapingData);
  }
}

function getFallbackAffiliate(scrapingData: ScrapingResult): AffiliateInfo {
  const content = scrapingData.content.toLowerCase();
  const hasAffiliate =
    content.includes('affiliate') ||
    content.includes('partner') ||
    content.includes('referral');

  return {
    affiliateProgramUrl: undefined,
    affiliateContactEmail: scrapingData.contactInfo.email,
    affiliateContactForm: scrapingData.contactInfo.contactFormUrl,
    hasAffiliateProgram: hasAffiliate,
    notes: hasAffiliate
      ? 'Potential affiliate program detected'
      : 'No affiliate program found',
  };
}

export async function translateToFrench(
  analysis: ToolAnalysis
): Promise<FrenchTranslation> {
  try {
    if (!ai) {
      console.log('No Gemini API key available, using fallback translation');
      return getFallbackTranslation(analysis);
    }

    const prompt = `
Translate the following AI tool analysis to French. Maintain the HTML structure and formatting:

Tool Name: ${analysis.toolName}
Primary Function: ${analysis.primaryFunction}
Key Features: ${analysis.keyFeatures.join(', ')}
Target Audience: ${analysis.targetAudience.join(', ')}
Description: ${analysis.description}
Meta Title: ${analysis.metaTitle}
Meta Description: ${analysis.metaDescription}
Pricing Summary: ${analysis.pricingSummary}

Return ONLY this JSON structure with French translations:

{
  "toolName": "French tool name",
  "primaryFunction": "French primary function",
  "keyFeatures": ["French feature 1", "French feature 2", "French feature 3", "French feature 4", "French feature 5"],
  "targetAudience": ["French audience 1", "French audience 2", "French audience 3"],
  "description": "French HTML description with <h2> and <h3> tags and <strong> formatting",
  "metaTitle": "French meta title - Video-IA.net",
  "metaDescription": "French meta description with clickbait",
  "pricingSummary": "French pricing summary"
}
`;

    const text = await tryWithModels(prompt, 'Translation');

    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '');

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse translation response as JSON');
    }

    const translation = JSON.parse(jsonMatch[0]) as FrenchTranslation;
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return getFallbackTranslation(analysis);
  }
}

function getFallbackTranslation(analysis: ToolAnalysis): FrenchTranslation {
  return {
    toolName: analysis.toolName,
    primaryFunction: `Outil IA pour ${analysis.category.toLowerCase()}`,
    keyFeatures: analysis.keyFeatures,
    targetAudience: ['Créateurs de contenu', 'Professionnels', 'Entreprises'],
    description: analysis.description,
    metaTitle: `${analysis.toolName} - Outil IA ${analysis.category} - Video-IA.net`,
    metaDescription: `Transformez votre flux de travail avec ${analysis.toolName}, l'outil IA ${analysis.category.toLowerCase()} de pointe.`,
    pricingSummary: analysis.pricingSummary,
  };
}
