# Video-IA.net Scraper Tool Specification v2.1

## Overview
The Video-IA.net Scraper Tool is an intelligent web scraping and AI analysis system designed to extract, analyze, and structure information from AI tool websites. The tool provides comprehensive analysis including pricing, social media links, contact information, and SEO-optimized content generation.

## Core Objectives
1. **Intelligent Web Scraping**: Extract comprehensive data from AI tool websites
2. **AI-Powered Analysis**: Use Gemini 2.0 Flash for intelligent content analysis
3. **Visual Documentation**: Capture and store website screenshots
4. **Comprehensive Data**: Extract social links, contact info, and pricing details
5. **SEO-Optimized Content**: Generate structured, well-formatted content with proper titles and formatting
6. **Multi-language Support**: Translate content into multiple languages

## Database Schema

### Core Fields
- `id`: Primary key
- `url`: Scraped website URL
- `tool_name`: Extracted tool name
- `slug`: URL-friendly slug for routing
- `title`: Page title
- `description`: SEO-optimized HTML content (500+ words)
- `meta_title`: Always ends with " - Video-IA.net"
- `meta_description`: Clickbait with CTA
- `category`: AI tool category
- `pricing_model`: Free/Freemium/Paid/Subscription/Enterprise
- `pricing_details`: Short text with pricing numbers and best offer tips
- `confidence_score`: AI analysis confidence (0-100)
- `data_completeness`: Information coverage (0-100)
- `affiliate_link`: Affiliate program URL or contact information
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Enhanced Fields
- `contact_email`: Extracted email address
- `contact_form_url`: Contact form URL
- `support_url`: Support page URL
- `social_links`: JSONB field for comprehensive social media links including:
  - Professional Networks (LinkedIn, Xing)
  - Social Media Platforms (Twitter, Facebook, Instagram, TikTok, Snapchat, Pinterest, Reddit)
  - Video Platforms (YouTube, Vimeo, Twitch, Dailymotion)
  - Developer Platforms (GitHub, GitLab, Bitbucket, Stack Overflow, Devpost)
  - Business Platforms (Crunchbase, AngelList, Product Hunt)
  - Professional Communities (Discord, Slack, Telegram, WhatsApp)
  - Content Platforms (Medium, Substack, Behance, Dribbble)
  - Regional Platforms (Weibo, WeChat, QQ, VK, Odnoklassniki)
  - Specialized Platforms (Mastodon, Bluesky, Threads, Tumblr)
  - Additional Platforms (Flickr, DeviantArt, ArtStation, SoundCloud, Spotify, App Stores)
- `pricing_details`: JSONB field for structured pricing data
- `free_tier_available`: Boolean
- `paid_plans_available`: Boolean
- `screenshot_url`: Local screenshot file path
- `translations`: JSONB field for multi-language content (FR initially)
- `affiliate_program_url`: Direct affiliate program link
- `affiliate_contact_email`: Contact email for affiliate inquiries

## Content Structure Requirements

### HTML Content Formatting
The generated content must follow this structure:

```html
<h2>What is [Tool Name]?</h2>
<p>Comprehensive introduction paragraph...</p>

<h3>Key Features</h3>
<ul>
  <li><strong>Feature 1:</strong> Description</li>
  <li><strong>Feature 2:</strong> Description</li>
</ul>

<h3>Use Cases</h3>
<p>Detailed use case descriptions...</p>

<h3>Target Audience</h3>
<p>Audience description with <strong>bold emphasis</strong>...</p>

<h3>Pricing Information</h3>
<p>Pricing details with <strong>bold pricing</strong>...</p>

<h3>Why Choose [Tool Name]?</h3>
<p>Conclusion with <strong>key benefits</strong>...</p>
```

### Content Guidelines
- **Minimum 500 words** for comprehensive coverage
- **Proper H2/H3 hierarchy** for SEO optimization
- **Strategic bold usage** for key terms and benefits
- **Clear section titles** that are descriptive and engaging
- **Professional tone** with technical accuracy
- **Call-to-action elements** in conclusion

## Pricing Analysis Specifications

### Enhanced Pricing Analysis
The pricing analysis must handle malformed JSON responses and provide robust fallback mechanisms:

```typescript
interface PricingAnalysisSpecs {
  prompt: string;
  jsonValidation: boolean;
  fallbackStrategy: 'text-based' | 'pattern-matching';
  errorHandling: 'graceful-degradation';
  outputFormat: {
    model: string;
    plans: PricingPlan[];
    freeTier: boolean;
    paidPlans: boolean;
    enterpriseAvailable: boolean;
    pricingNotes: string;
  };
}
```

### Pricing Analysis Workflow
1. **Primary Analysis**: Gemini 2.0 Flash with structured prompt
2. **JSON Validation**: Robust parsing with error handling
3. **Fallback Analysis**: Text-based pattern matching
4. **Data Enrichment**: Combine multiple sources for accuracy

## Technology Stack

### Core Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Web Scraping**: Puppeteer, Cheerio
- **AI Integration**: Google Gemini AI (gemini-2.0-flash)
- **Image Processing**: Sharp, Local file storage
- **HTTP Client**: Axios

### Dependencies
- `@google/genai`: Latest Gemini SDK
- `puppeteer`: Headless browser automation
- `cheerio`: DOM parsing
- `fs`: Local file system operations
- `social-media-detector`: Enhanced social link detection

## Workflow Architecture

### Scraping Engine Interface
```typescript
interface ScrapingEngine {
  scrapeWebsite(url: string): Promise<ScrapingResult>;
  extractSocialLinks(content: string): SocialLinks;
  extractContactInfo(content: string): ContactInfo;
  captureScreenshot(url: string): Promise<string>;
  analyzePricing(content: string): Promise<PricingDetails>;
}
```

### Enhanced Gemini AI Integration
```typescript
interface GeminiIntegration {
  analyzeContent(content: string): Promise<ToolAnalysis>;
  generateSEOContent(toolData: ToolData): Promise<SEOContent>;
  analyzePricing(content: string): Promise<PricingAnalysis>;
  translateContent(content: string, targetLanguage: string): Promise<TranslationResult>;
  generateSlug(toolName: string): Promise<string>;
  analyzeAffiliateLinks(content: string): Promise<AffiliateInfo>;
}
```

### Content Generation Interface
```typescript
interface ContentGenerator {
  generateStructuredHTML(toolData: ToolData): string;
  applyFormattingRules(content: string): string;
  validateHTMLStructure(content: string): boolean;
  optimizeForSEO(content: string): string;
  generatePricingSummary(pricingData: PricingDetails): string;
  generateSlug(toolName: string): string;
}
```

### Translation Interface
```typescript
interface TranslationEngine {
  translateToFrench(content: ToolAnalysis): Promise<FrenchTranslation>;
  validateTranslation(original: string, translated: string): boolean;
  maintainHTMLStructure(translatedContent: string): string;
}
```

## Quality Assurance

### Content Validation
- **HTML Structure**: Valid H2/H3 hierarchy
- **Word Count**: Minimum 500 words
- **Bold Usage**: Strategic emphasis on key terms
- **SEO Compliance**: Meta title/description optimization
- **Readability**: Clear, professional tone

### Pricing Analysis Validation
- **JSON Parsing**: Robust error handling
- **Data Completeness**: Required fields validation
- **Fallback Mechanism**: Graceful degradation
- **Accuracy**: Cross-reference with scraped data

### Performance Targets
- **Scraping Time**: < 60 seconds
- **AI Analysis**: < 30 seconds
- **Content Generation**: < 15 seconds
- **Pricing Analysis**: < 20 seconds
- **Screenshot Capture**: < 10 seconds
- **HTML Validation**: < 5 seconds

## Roadmap

### Phase 1: Core Enhancement (Current)
- ✅ Enhanced pricing analysis with robust JSON handling
- ✅ Improved content structure with proper formatting
- ✅ Strategic bold usage and clear section titles
- ✅ Better error handling for all analysis functions

### Phase 2: Advanced Features
- Multi-language translation workflow
- Advanced analytics dashboard
- Batch processing capabilities
- Real-time monitoring

## Success Metrics

### Content Quality
- **Structure Compliance**: 100% proper H2/H3 hierarchy
- **Formatting Quality**: Strategic bold usage in 90%+ content
- **Readability Score**: Professional tone maintained
- **SEO Optimization**: Meta tags properly formatted

### Pricing Analysis
- **JSON Parsing Success**: 95%+ successful parsing
- **Fallback Effectiveness**: Graceful degradation when needed
- **Data Accuracy**: Cross-validated pricing information
- **Error Recovery**: Robust error handling

### Technical Performance
- **Response Time**: < 60 seconds total processing
- **Error Rate**: < 5% failed analyses
- **Content Quality**: Professional, well-structured output
- **User Satisfaction**: Clear, readable content presentation 