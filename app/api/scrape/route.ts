import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA'
})

interface ScrapingResult {
  url: string
  title: string
  content: string
  metadata: {
    description: string
    keywords: string[]
    ogTitle: string
    ogDescription: string
  }
  socialLinks: SocialLinks
  contactInfo: ContactInfo
  pricing: string[]
  features: string[]
  screenshotUrl?: string
}

interface SocialLinks {
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  github?: string
  youtube?: string
  tiktok?: string
  discord?: string
  telegram?: string
  reddit?: string
}

interface ContactInfo {
  email?: string
  contactFormUrl?: string
  supportUrl?: string
  phone?: string
  address?: string
}

interface ToolAnalysis {
  toolName: string
  slug: string
  primaryFunction: string
  keyFeatures: string[]
  targetAudience: string[]
  pricingModel: string
  category: string
  description: string
  metaTitle: string
  metaDescription: string
  tags: string[]
  confidence: number
  dataCompleteness: number
  recommendedActions: string[]
  socialLinks: SocialLinks
  contactInfo: ContactInfo
  pricingDetails: PricingDetails
  pricingSummary: string
  affiliateInfo: AffiliateInfo
  translations?: FrenchTranslation
}

interface PricingDetails {
  model: string
  plans: PricingPlan[]
  freeTier: boolean
  paidPlans: boolean
  enterpriseAvailable: boolean
  pricingNotes: string
}

interface PricingPlan {
  name: string
  price: string
  features: string[]
  billing: 'monthly' | 'yearly' | 'one-time'
}

interface AffiliateInfo {
  affiliateProgramUrl?: string
  affiliateContactEmail?: string
  affiliateContactForm?: string
  hasAffiliateProgram: boolean
  notes: string
}

interface FrenchTranslation {
  toolName: string
  primaryFunction: string
  keyFeatures: string[]
  targetAudience: string[]
  description: string
  metaTitle: string
  metaDescription: string
  pricingSummary: string
}

async function scrapeWebsite(url: string): Promise<ScrapingResult> {
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    
    // Set user agent to avoid blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // Navigate to URL
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })

    // Wait for content to load
    await page.waitForTimeout(3000)

    // Capture screenshot
    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png'
    })

    // Save screenshot locally
    const screenshotUrl = await saveScreenshot(screenshot, url)

    // Extract content
    const content = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, nav, footer, header')
      scripts.forEach(el => el.remove())

      // Get main content
      const mainContent = document.querySelector('main') || 
                         document.querySelector('#main') || 
                         document.querySelector('.main') ||
                         document.body

      return {
        title: document.title,
        content: mainContent.innerText,
        html: mainContent.innerHTML
      }
    })

    // Extract metadata
    const metadata = await page.evaluate(() => {
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
      const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || ''
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || ''
      const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || ''

      return {
        description: metaDescription,
        keywords: metaKeywords.split(',').map(k => k.trim()).filter(k => k),
        ogTitle,
        ogDescription
      }
    })

    // Extract social links
    const socialLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href]')
      const social: any = {}
      
      links.forEach(link => {
        const href = link.getAttribute('href')
        if (!href) return

        if (href.includes('linkedin.com')) social.linkedin = href
        if (href.includes('twitter.com') || href.includes('x.com')) social.twitter = href
        if (href.includes('facebook.com') || href.includes('fb.com')) social.facebook = href
        if (href.includes('instagram.com')) social.instagram = href
        if (href.includes('github.com')) social.github = href
        if (href.includes('youtube.com') || href.includes('youtu.be')) social.youtube = href
        if (href.includes('tiktok.com')) social.tiktok = href
        if (href.includes('discord.gg') || href.includes('discord.com')) social.discord = href
        if (href.includes('t.me')) social.telegram = href
        if (href.includes('reddit.com')) social.reddit = href
      })

      return social
    })

    // Extract contact information
    const contactInfo = await page.evaluate(() => {
      const contact: any = {}
      
      // Find contact form
      const contactLinks = document.querySelectorAll('a[href*="contact"], a[href*="support"], a[href*="help"]')
      contactLinks.forEach(link => {
        const href = link.getAttribute('href')
        if (href?.includes('contact')) contact.contactFormUrl = href
        if (href?.includes('support') || href?.includes('help')) contact.supportUrl = href
      })

      // Find email addresses
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
      const emails = document.body.innerText.match(emailRegex)
      if (emails && emails.length > 0) {
        contact.email = emails[0]
      }

      // Find phone numbers
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
      const phones = document.body.innerText.match(phoneRegex)
      if (phones && phones.length > 0) {
        contact.phone = phones[0]
      }

      return contact
    })

    await browser.close()

    // Use cheerio for additional parsing
    const $ = cheerio.load(content.html)
    
    // Extract pricing information
    const pricingElements = $('*:contains("$"), *:contains("pricing"), *:contains("price"), *:contains("free"), *:contains("paid")')
    const pricing: string[] = []
    pricingElements.each((i, el) => {
      const text = $(el).text().trim()
      if (text.length < 100 && (text.includes('$') || text.toLowerCase().includes('pricing'))) {
        pricing.push(text)
      }
    })

    // Extract features
    const features: string[] = []
    $('li, p, div').each((i, el) => {
      const text = $(el).text().trim()
      if (text.length > 10 && text.length < 200 && 
          (text.includes('feature') || text.includes('function') || text.includes('capability'))) {
        features.push(text)
      }
    })

    return {
      url,
      title: content.title,
      content: content.content,
      metadata,
      socialLinks,
      contactInfo,
      pricing: pricing.slice(0, 10),
      features: features.slice(0, 20),
      screenshotUrl
    }

  } catch (error) {
    console.error('Scraping error:', error)
    throw new Error(`Failed to scrape website: ${error}`)
  }
}

async function saveScreenshot(screenshot: Buffer, url: string): Promise<string> {
  try {
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots')
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const urlSlug = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
    const filename = `screenshot_${urlSlug}_${timestamp}.png`
    const filepath = path.join(screenshotsDir, filename)

    // Save screenshot to file
    fs.writeFileSync(filepath, screenshot)

    // Return public URL
    return `/screenshots/${filename}`
  } catch (error) {
    console.error('Screenshot save error:', error)
    return ''
  }
}

function analyzeWithFallback(scrapingData: ScrapingResult): ToolAnalysis {
  // Extract tool name from title or URL
  const toolName = scrapingData.title || scrapingData.url.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'Unknown Tool'
  
  // Determine category based on content analysis
  const content = scrapingData.content.toLowerCase()
  let category = 'AI Assistant'
  if (content.includes('image') || content.includes('photo') || content.includes('picture')) {
    category = 'Image Generation'
  } else if (content.includes('video') || content.includes('movie')) {
    category = 'Video Generation'
  } else if (content.includes('audio') || content.includes('music') || content.includes('sound')) {
    category = 'Audio Generation'
  } else if (content.includes('text') || content.includes('writing') || content.includes('content')) {
    category = 'Content Creation'
  } else if (content.includes('data') || content.includes('analytics')) {
    category = 'Data Analysis'
  }

  // Determine pricing model
  let pricingModel = 'Free'
  if (content.includes('subscription') || content.includes('monthly') || content.includes('yearly')) {
    pricingModel = 'Subscription'
  } else if (content.includes('paid') || content.includes('premium')) {
    pricingModel = 'Paid'
  } else if (content.includes('freemium')) {
    pricingModel = 'Freemium'
  }

  // Extract key features
  const keyFeatures = scrapingData.features.slice(0, 5).map(f => f.substring(0, 100))

  // Generate SEO-optimized description
  const description = generateSEODescription(toolName, category, keyFeatures, pricingModel)

  // Generate meta title and description
  const metaTitle = `${toolName} - AI ${category} Tool - Video-IA.net`
  const metaDescription = `Transform your workflow with ${toolName}, the leading AI ${category.toLowerCase()} tool. Boost productivity by 300% with intelligent features. Try it free today!`

  // Generate tags
  const tags = ['AI', category.replace(' ', ''), 'Automation', 'Productivity']

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
    confidence: 60, // Lower confidence for fallback analysis
    dataCompleteness: 70,
    recommendedActions: ['Verify tool name and features', 'Check pricing details', 'Confirm target audience'],
    socialLinks: scrapingData.socialLinks,
    contactInfo: scrapingData.contactInfo,
    pricingDetails: {
      model: pricingModel,
      plans: [],
      freeTier: pricingModel === 'Free',
      paidPlans: pricingModel !== 'Free',
      enterpriseAvailable: false,
      pricingNotes: 'Pricing information extracted from website content'
    },
    pricingSummary: generatePricingSummary({
      model: pricingModel,
      plans: [],
      freeTier: pricingModel === 'Free',
      paidPlans: pricingModel !== 'Free',
      enterpriseAvailable: false,
      pricingNotes: 'Pricing information extracted from website content'
    }),
    affiliateInfo: {
      affiliateProgramUrl: undefined,
      affiliateContactEmail: scrapingData.contactInfo.email,
      affiliateContactForm: scrapingData.contactInfo.contactFormUrl,
      hasAffiliateProgram: false,
      notes: 'No affiliate program detected in fallback analysis'
    }
  }
}

function generateSlug(toolName: string): string {
  return toolName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function generatePricingSummary(pricingDetails: PricingDetails): string {
  const { model, plans, freeTier, paidPlans, enterpriseAvailable } = pricingDetails
  
  let summary = `${model} pricing model. `
  
  if (freeTier) {
    summary += "Free tier available. "
  }
  
  if (paidPlans && plans.length > 0) {
    const prices = plans.map(p => p.price).filter(p => p && p !== 'Free')
    if (prices.length > 0) {
      summary += `Paid plans start from ${prices[0]}. `
    }
  }
  
  if (enterpriseAvailable) {
    summary += "Enterprise plans available. "
  }
  
  summary += "💡 Tip: Start with the free tier to test features, then upgrade based on your needs."
  
  return summary
}

function generateSEODescription(toolName: string, category: string, features: string[], pricingModel: string): string {
  return `
<h2>What is ${toolName}?</h2>
<p>${toolName} is a cutting-edge AI-powered ${category.toLowerCase()} tool designed to revolutionize how professionals and creators work. This innovative platform leverages advanced artificial intelligence to deliver exceptional results, making it the go-to solution for anyone looking to enhance their ${category.toLowerCase()} capabilities.</p>

<h3>Key Features & Capabilities</h3>
<ul>
${features.slice(0, 5).map(feature => `<li>${feature}</li>`).join('\n')}
<li>Advanced AI Algorithms: Superior results through machine learning</li>
<li>User-Friendly Interface: Seamless workflow for all skill levels</li>
<li>Real-Time Processing: Instant feedback and results</li>
<li>Professional Quality: Enterprise-grade output and reliability</li>
</ul>

<h3>Use Cases & Applications</h3>
<p>${toolName} is perfect for content creators, marketing professionals, businesses, and individuals who want to streamline their ${category.toLowerCase()} processes. Whether you're a beginner or an expert, this tool provides the capabilities you need to succeed in today's competitive digital landscape.</p>

<h3>Target Audience & Users</h3>
<p>This powerful tool is designed for content creators, marketing professionals, small businesses, enterprises, and anyone looking to leverage AI technology for enhanced ${category.toLowerCase()} capabilities. With its intuitive interface and powerful features, ${toolName} makes advanced AI technology accessible to users of all skill levels.</p>

<h3>Pricing & Plans</h3>
<p>${toolName} offers a ${pricingModel.toLowerCase()} pricing model that makes advanced AI technology accessible to everyone. Whether you're just starting out or running a large enterprise, there's a plan that fits your needs and budget.</p>

<h3>Why Choose ${toolName}?</h3>
<p>With its advanced AI technology, user-friendly interface, and comprehensive feature set, ${toolName} stands out as the premier choice for ${category.toLowerCase()}. Experience the future of AI-powered tools and transform your workflow today!</p>
  `.trim()
}

async function analyzeAffiliateLinks(scrapingData: ScrapingResult): Promise<AffiliateInfo> {
  try {
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
`

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    })

    const text = response.text
    if (!text) {
      throw new Error('No response text from Gemini API')
    }

    // Clean the response text
    let cleanedText = text.trim()
    cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '')
    
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse affiliate response as JSON')
    }

    const affiliateInfo = JSON.parse(jsonMatch[0]) as AffiliateInfo
    return affiliateInfo

  } catch (error) {
    console.error('Affiliate analysis error:', error)
    
    // Fallback affiliate analysis
    const content = scrapingData.content.toLowerCase()
    const hasAffiliate = content.includes('affiliate') || content.includes('partner') || content.includes('referral')
    
    return {
      affiliateProgramUrl: undefined,
      affiliateContactEmail: scrapingData.contactInfo.email,
      affiliateContactForm: scrapingData.contactInfo.contactFormUrl,
      hasAffiliateProgram: hasAffiliate,
      notes: hasAffiliate ? 'Potential affiliate program detected' : 'No affiliate program found'
    }
  }
}

async function analyzePricingWithGemini(scrapingData: ScrapingResult): Promise<PricingDetails> {
  try {
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
`

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    })

    const text = response.text
    if (!text) {
      throw new Error('No response text from Gemini API')
    }

    // Clean the response text
    let cleanedText = text.trim()
    
    // Remove any markdown formatting
    cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '')
    
    // Find JSON object
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse pricing response as JSON')
    }

    let pricing: PricingDetails
    try {
      pricing = JSON.parse(jsonMatch[0]) as PricingDetails
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('Invalid JSON structure in pricing response')
    }

    // Validate required fields
    if (!pricing.model || typeof pricing.freeTier !== 'boolean' || typeof pricing.paidPlans !== 'boolean') {
      throw new Error('Missing required fields in pricing response')
    }

    return pricing

  } catch (error) {
    console.error('Pricing analysis error:', error)
    
    // Enhanced fallback pricing analysis
    const content = scrapingData.content.toLowerCase()
    let model = 'Free'
    let freeTier = true
    let paidPlans = false
    let enterpriseAvailable = false

    if (content.includes('subscription') || content.includes('monthly') || content.includes('yearly')) {
      model = 'Subscription'
      paidPlans = true
    } else if (content.includes('paid') || content.includes('premium')) {
      model = 'Paid'
      paidPlans = true
    } else if (content.includes('freemium')) {
      model = 'Freemium'
      paidPlans = true
    }

    if (content.includes('enterprise')) {
      enterpriseAvailable = true
    }

    return {
      model,
      plans: [],
      freeTier,
      paidPlans,
      enterpriseAvailable,
      pricingNotes: 'Pricing information extracted from website content using fallback analysis'
    }
  }
}

async function analyzeWithGemini(scrapingData: ScrapingResult): Promise<ToolAnalysis> {
  try {
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
`

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    })

    const text = response.text
    if (!text) {
      throw new Error('No response text from Gemini API')
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON')
    }

    const analysis = JSON.parse(jsonMatch[0]) as ToolAnalysis

    // Validate required fields
    if (!analysis.toolName || !analysis.primaryFunction || !analysis.category) {
      throw new Error('AI analysis missing required fields')
    }

    // Add social links and contact info
    analysis.socialLinks = scrapingData.socialLinks
    analysis.contactInfo = scrapingData.contactInfo

    // Generate slug and pricing summary
    analysis.slug = generateSlug(analysis.toolName)
    
    // Handle missing pricingDetails
    if (!analysis.pricingDetails) {
      analysis.pricingDetails = {
        model: analysis.pricingModel || 'Unknown',
        plans: [],
        freeTier: false,
        paidPlans: false,
        enterpriseAvailable: false,
        pricingNotes: 'Pricing information not available'
      }
    }
    
    analysis.pricingSummary = generatePricingSummary(analysis.pricingDetails)

    return analysis

  } catch (error) {
    console.error('AI analysis error:', error)
    
    // Check if it's a rate limit error
    if (error instanceof Error && error.message.includes('429')) {
      console.log('Rate limit hit, using fallback analysis')
      return analyzeWithFallback(scrapingData)
    }
    
    throw new Error(`Failed to analyze content: ${error}`)
  }
}

async function translateToFrench(analysis: ToolAnalysis): Promise<FrenchTranslation> {
  try {
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
`

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    })

    const text = response.text
    if (!text) {
      throw new Error('No response text from Gemini API for translation')
    }

    // Clean the response text
    let cleanedText = text.trim()
    cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '')
    
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse translation response as JSON')
    }

    const translation = JSON.parse(jsonMatch[0]) as FrenchTranslation
    return translation

  } catch (error) {
    console.error('Translation error:', error)
    
    // Return basic French translation as fallback
    return {
      toolName: analysis.toolName,
      primaryFunction: `Outil IA pour ${analysis.category.toLowerCase()}`,
      keyFeatures: analysis.keyFeatures,
      targetAudience: ['Créateurs de contenu', 'Professionnels', 'Entreprises'],
      description: analysis.description,
      metaTitle: `${analysis.toolName} - Outil IA ${analysis.category} - Video-IA.net`,
      metaDescription: `Transformez votre flux de travail avec ${analysis.toolName}, l'outil IA ${analysis.category.toLowerCase()} de pointe.`,
      pricingSummary: analysis.pricingSummary
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    console.log(`Starting analysis for: ${url}`)

    // Step 1: Scrape the website
    const scrapingData = await scrapeWebsite(url)
    console.log('Scraping completed')

    // Step 2: Analyze pricing
    const pricingDetails = await analyzePricingWithGemini(scrapingData)
    console.log('Pricing analysis completed')

    // Step 3: Analyze affiliate links
    const affiliateInfo = await analyzeAffiliateLinks(scrapingData)
    console.log('Affiliate analysis completed')

    // Step 4: Try AI analysis, fallback to basic analysis if rate limited
    let analysis: ToolAnalysis
    try {
      analysis = await analyzeWithGemini(scrapingData)
      console.log('AI analysis completed')
    } catch (error) {
      console.log('AI analysis failed, using fallback')
      analysis = analyzeWithFallback(scrapingData)
    }

    // Add pricing details and affiliate info to analysis
    analysis.pricingDetails = pricingDetails
    analysis.affiliateInfo = affiliateInfo

    // Step 5: Generate French translation
    try {
      const frenchTranslation = await translateToFrench(analysis)
      analysis.translations = frenchTranslation
      console.log('French translation completed')
    } catch (error) {
      console.log('Translation failed, continuing without translation')
    }

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
} 