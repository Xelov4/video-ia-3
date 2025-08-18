/**
 * Tool Content Updater Service
 * 
 * Service pour mettre à jour automatiquement le contenu des outils IA :
 * - Test HTTP status
 * - Crawling des pages
 * - Extraction des réseaux sociaux
 * - Extraction des liens utiles
 * - Génération de contenu IA
 * 
 * @author Video-IA.net Development Team
 */

import { prisma } from '../database/client'
import { Tool } from '@prisma/client'
import * as fs from 'fs/promises'
import * as path from 'path'
import axios, { AxiosResponse } from 'axios'
import * as cheerio from 'cheerio'
import { GoogleGenAI } from '@google/genai'
import puppeteer from 'puppeteer'

export interface ToolUpdateResult {
  toolId: number
  toolName: string
  status: 'success' | 'failed' | 'inactive'
  step: 'http_check' | 'screenshot' | 'crawling' | 'social_extraction' | 'useful_links' | 'content_generation' | 'overview_generation' | 'keyfeatures_generation' | 'meta_generation' | 'pricing_generation' | 'usecases_generation' | 'targetaudience_generation' | 'completed'
  httpStatusCode?: number
  isActive?: boolean
  socialLinks?: {
    socialLinkedin?: string
    socialFacebook?: string
    socialX?: string
    socialGithub?: string
    socialDiscord?: string
    socialInstagram?: string
    socialTiktok?: string
  }
  usefulLinks?: {
    mailAddress?: string
    docsLink?: string
    affiliateLink?: string
    changelogLink?: string
  }
  generatedContent?: string
  generatedOverview?: string
  generatedKeyFeatures?: string
  generatedMetaTitle?: string
  generatedMetaDescription?: string
  generatedPricingModel?: string
  generatedUseCases?: string
  generatedTargetAudience?: string
  screenshotPath?: string
  errors?: string[]
  processedPages?: number
}

export interface CrawledContent {
  url: string
  content: string
  title: string
  html: string
}

export class ToolContentUpdaterService {
  private static readonly TEMP_DIR_PREFIX = 'temporary.'
  private static readonly MAX_PAGES_TO_CRAWL = 50
  private static readonly REQUEST_TIMEOUT = 10000
  private static readonly CRAWL_DELAY = 1000 // Délai entre les requêtes en ms

  // Configuration Gemini API (même que le système existant)
  private static readonly GEMINI_API_KEY = process.env.GEMINI_API_KEY
  private static readonly GEMINI_MODELS = [
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash', 
    'gemini-1.5-pro-002',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ]
  private static readonly ai = this.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: this.GEMINI_API_KEY }) : null

  /**
   * Étape 1 : Test HTTP Status et validation de l'URL
   */
  static async checkHttpStatus(tool: Tool): Promise<{
    httpStatusCode: number
    isActive: boolean
    redirectUrl?: string
  }> {
    try {
      const response: AxiosResponse = await axios.get(tool.toolLink!, {
        timeout: this.REQUEST_TIMEOUT,
        maxRedirects: 5,
        validateStatus: (status) => status < 600 // Accepter tous les codes < 600
      })

      const httpStatusCode = response.status
      const isActive = httpStatusCode >= 200 && httpStatusCode < 400

      // Mise à jour dans la DB via Prisma
      console.log(`📊 Mise à jour DB: HTTP ${httpStatusCode}, isActive: ${isActive}`)
      const updatedTool = await prisma.tool.update({
        where: { id: tool.id },
        data: {
          httpStatusCode,
          isActive,
          lastCheckedAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`✅ DB mise à jour confirmée via Prisma - Tool ID: ${updatedTool.id}, HTTP: ${updatedTool.httpStatusCode}, Active: ${updatedTool.isActive}`)

      return {
        httpStatusCode,
        isActive,
        redirectUrl: response.request.res?.responseUrl !== tool.toolLink ? response.request.res?.responseUrl : undefined
      }

    } catch (error: any) {
      // En cas d'erreur, marquer comme inactif
      const httpStatusCode = error.response?.status || 0
      console.log(`❌ Erreur HTTP: ${error.message}, Code: ${httpStatusCode}`)
      
      console.log(`📊 Mise à jour DB: HTTP ${httpStatusCode}, isActive: false (échec)`)
      const updatedTool = await prisma.tool.update({
        where: { id: tool.id },
        data: {
          httpStatusCode,
          isActive: false,
          lastCheckedAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`✅ DB mise à jour confirmée via Prisma - Tool ID: ${updatedTool.id}, HTTP: ${updatedTool.httpStatusCode}, Active: ${updatedTool.isActive} (outil marqué inactif)`)

      return {
        httpStatusCode,
        isActive: false
      }
    }
  }

  /**
   * Étape 1.5 : Capture d'écran de la page d'accueil
   */
  static async captureScreenshot(tool: Tool): Promise<string | null> {
    let browser = null
    try {
      console.log(`📸 Capture d'écran de ${tool.toolLink}...`)
      
      // S'assurer que le dossier existe
      const publicImagesDir = path.join(process.cwd(), 'public', 'images', 'tools')
      try {
        await fs.mkdir(publicImagesDir, { recursive: true })
      } catch (error) {
        // Dossier existe déjà
      }

      // Générer le nom de fichier : nom de l'outil nettoyé + .webp
      const sanitizedName = tool.toolName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      const screenshotPath = path.join(publicImagesDir, `${sanitizedName}.webp`)
      const relativeScreenshotPath = `/images/tools/${sanitizedName}.webp`

      // Lancer Puppeteer
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      })
      
      const page = await browser.newPage()
      
      // Configuration de la page
      await page.setViewport({ width: 1200, height: 800 })
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      
      // Navigation vers la page
      await page.goto(tool.toolLink!, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      })
      
      // Attendre 5 secondes comme demandé
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Prendre la capture d'écran en format WebP
      await page.screenshot({
        path: screenshotPath,
        type: 'webp',
        quality: 80,
        fullPage: false // Seulement la partie visible
      })

      console.log(`✅ Screenshot sauvegardé: ${relativeScreenshotPath}`)
      return relativeScreenshotPath

    } catch (error: any) {
      console.error(`❌ Erreur capture d'écran: ${error.message}`)
      return null
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }

  /**
   * Étape 2 : Crawling des 50 premières pages
   */
  static async crawlToolPages(tool: Tool): Promise<{
    tempDirPath: string
    crawledPages: CrawledContent[]
  }> {
    const sanitizedName = tool.toolName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const tempDirPath = path.join(process.cwd(), `${this.TEMP_DIR_PREFIX}${sanitizedName}`)
    
    // Créer le dossier temporaire
    try {
      await fs.mkdir(tempDirPath, { recursive: true })
    } catch (error) {
      // Dossier existe déjà
    }

    const crawledPages: CrawledContent[] = []
    const urlsToVisit = [tool.toolLink!]
    const visitedUrls = new Set<string>()
    
    const baseUrl = new URL(tool.toolLink!).origin

    let crawlStopReason = ''
    let newLinksFound = 0
    let errorCount = 0

    for (let i = 0; i < this.MAX_PAGES_TO_CRAWL && urlsToVisit.length > 0; i++) {
      const currentUrl = urlsToVisit.shift()!
      
      if (visitedUrls.has(currentUrl)) {
        console.log(`⏭️  Page ${i + 1}: URL déjà visitée, passage à la suivante`)
        continue
      }
      visitedUrls.add(currentUrl)

      console.log(`🔍 Page ${i + 1}/${this.MAX_PAGES_TO_CRAWL}: Crawl de ${currentUrl}`)

      try {
        await new Promise(resolve => setTimeout(resolve, this.CRAWL_DELAY))
        
        const response = await axios.get(currentUrl, {
          timeout: this.REQUEST_TIMEOUT,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; VideoIA-Bot/1.0)'
          }
        })

        const $ = cheerio.load(response.data)
        
        // Nettoyer le contenu
        $('script, style, nav, header, footer, .cookie-banner, .advertisement').remove()
        
        const content = $('body').text().replace(/\s+/g, ' ').trim()
        const title = $('title').text() || $('h1').first().text() || 'No Title'
        
        const crawledContent: CrawledContent = {
          url: currentUrl,
          content,
          title,
          html: response.data
        }

        crawledPages.push(crawledContent)

        // Sauvegarder dans le dossier temporaire
        const filename = `page_${i + 1}_${currentUrl.replace(/[^a-zA-Z0-9]/g, '_')}.json`
        await fs.writeFile(
          path.join(tempDirPath, filename),
          JSON.stringify(crawledContent, null, 2)
        )

        console.log(`✅ Page ${i + 1} crawlée: "${title}" (${content.length} caractères)`)

        // Extraire de nouveaux liens pour continuer le crawl
        if (crawledPages.length < this.MAX_PAGES_TO_CRAWL) {
          const linksBefore = urlsToVisit.length
          $('a[href]').each((_, element) => {
            const href = $(element).attr('href')
            if (href) {
              try {
                const fullUrl = new URL(href, currentUrl).href
                if (fullUrl.startsWith(baseUrl) && !visitedUrls.has(fullUrl) && !urlsToVisit.includes(fullUrl)) {
                  urlsToVisit.push(fullUrl)
                }
              } catch {
                // Ignorer les URLs malformées
              }
            }
          })
          const linksAfter = urlsToVisit.length
          const newLinks = linksAfter - linksBefore
          newLinksFound += newLinks
          console.log(`🔗 ${newLinks} nouveaux liens trouvés sur cette page`)
        }

      } catch (error: any) {
        errorCount++
        console.error(`❌ Erreur lors du crawl de ${currentUrl}: ${error.message}`)
      }
    }

    // Analyser pourquoi on n'a pas atteint 50 pages
    if (crawledPages.length < this.MAX_PAGES_TO_CRAWL) {
      if (urlsToVisit.length === 0) {
        crawlStopReason = `Plus de liens internes à crawler (${newLinksFound} liens découverts au total)`
      } else if (errorCount > crawledPages.length / 2) {
        crawlStopReason = `Trop d'erreurs de crawl (${errorCount} erreurs)`
      } else {
        crawlStopReason = `Structure du site limitée (${crawledPages.length} pages accessibles)`
      }
      
      console.log(`⚠️  Crawling arrêté à ${crawledPages.length}/${this.MAX_PAGES_TO_CRAWL} pages`)
      console.log(`📝 Raison: ${crawlStopReason}`)
      console.log(`📊 Statistiques: ${newLinksFound} liens découverts, ${errorCount} erreurs, ${visitedUrls.size} URLs visitées`)
    } else {
      console.log(`🎯 Crawling complet: ${this.MAX_PAGES_TO_CRAWL}/${this.MAX_PAGES_TO_CRAWL} pages crawlées`)
    }

    return {
      tempDirPath,
      crawledPages
    }
  }

  /**
   * Valide les liens extraits avec Gemini AI
   */
  private static async validateLinksWithGemini(links: any, tool: Tool, linkType: 'social' | 'useful'): Promise<any> {
    try {
      if (!this.ai || !links || Object.keys(links).length === 0) {
        return links
      }

      const linksText = Object.entries(links)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')

      const prompt = `You are a link validation expert. I need you to validate if the following ${linkType} links are actually related to the tool "${tool.toolName}" (URL: ${tool.toolLink}).

Tool to validate: ${tool.toolName}
Tool URL: ${tool.toolLink}
Tool Category: ${tool.toolCategory || 'Unknown'}

${linkType === 'social' ? 'Social media' : 'Useful'} links found:
${linksText}

IMPORTANT: 
- Remove any generic links (like "github.com/github", "fonts.googleapis.com", "docs.github.com" for general GitHub docs)
- Keep only links that are SPECIFICALLY related to "${tool.toolName}"
- For social links, they must be the actual social profiles of this tool/company
- For useful links, they must be specific documentation, affiliates, or contact info for this tool

Respond ONLY with a JSON object containing the validated links. Remove any invalid/generic links completely.
Example format:
{
  "socialLinkedin": "linkedin.com/company/specific-tool-company",
  "docsLink": "https://specific-tool-docs.com/api"
}

If no links are valid, return an empty object: {}`

      const validatedResponse = await this.callGeminiWithFallback(prompt)
      
      try {
        // Extraire le JSON de la réponse
        const jsonMatch = validatedResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const validatedLinks = JSON.parse(jsonMatch[0])
          console.log(`🤖 Gemini validation: ${Object.keys(links).length} -> ${Object.keys(validatedLinks).length} links`)
          return validatedLinks
        }
      } catch (parseError) {
        console.log('⚠️ Erreur parsing validation Gemini, conservation des liens originaux')
      }

      return links
    } catch (error: any) {
      console.log(`⚠️ Erreur validation Gemini (${linkType}): ${error.message}`)
      return links
    }
  }

  /**
   * Étape 3 : Extraction des liens des réseaux sociaux avec validation
   */
  static async extractSocialLinks(crawledPages: CrawledContent[], tool: Tool): Promise<{
    socialLinkedin?: string
    socialFacebook?: string
    socialX?: string
    socialGithub?: string
    socialDiscord?: string
    socialInstagram?: string
    socialTiktok?: string
  }> {
    const socialPatterns = {
      socialLinkedin: [
        /linkedin\.com\/company\/([^\/\s"']+)/gi,
        /linkedin\.com\/in\/([^\/\s"']+)/gi
      ],
      socialFacebook: [
        /facebook\.com\/([^\/\s"']+)/gi,
        /fb\.me\/([^\/\s"']+)/gi
      ],
      socialX: [
        /twitter\.com\/([^\/\s"']+)/gi,
        /x\.com\/([^\/\s"']+)/gi
      ],
      socialGithub: [
        /github\.com\/([^\/\s"'?#]+)/gi
      ],
      socialDiscord: [
        /discord\.gg\/([^\/\s"']+)/gi,
        /discord\.com\/invite\/([^\/\s"']+)/gi
      ],
      socialInstagram: [
        /instagram\.com\/([^\/\s"']+)/gi
      ],
      socialTiktok: [
        /tiktok\.com\/@([^\/\s"']+)/gi
      ]
    }

    const socialLinks: any = {}

    // Créer des mots-clés de validation basés sur l'outil
    const validationKeywords = this.generateValidationKeywords(tool)

    for (const page of crawledPages) {
      const combinedContent = `${page.content} ${page.html}`

      for (const [platform, patterns] of Object.entries(socialPatterns)) {
        if (!socialLinks[platform]) {
          for (const pattern of patterns) {
            const matches = combinedContent.match(pattern)
            if (matches) {
              // Valider chaque match trouvé
              for (const match of matches) {
                if (this.validateSocialLink(match, validationKeywords, platform)) {
                  socialLinks[platform] = match
                  break
                }
              }
              if (socialLinks[platform]) break
            }
          }
        }
      }
    }

    // Validation avec Gemini AI
    console.log(`🤖 Validation Gemini des ${Object.keys(socialLinks).length} liens sociaux...`)
    const validatedSocialLinks = await this.validateLinksWithGemini(socialLinks, tool, 'social')

    return validatedSocialLinks
  }

  /**
   * Génère des mots-clés de validation pour l'outil
   */
  private static generateValidationKeywords(tool: Tool): string[] {
    const keywords: string[] = []
    
    // Nom de l'outil (sans espaces, en minuscules)
    if (tool.toolName) {
      keywords.push(tool.toolName.toLowerCase().replace(/\s+/g, ''))
      keywords.push(tool.toolName.toLowerCase().replace(/\s+/g, '-'))
      keywords.push(tool.toolName.toLowerCase().replace(/\s+/g, '_'))
      
      // Variations du nom
      const nameParts = tool.toolName.toLowerCase().split(/\s+/)
      if (nameParts.length > 1) {
        keywords.push(...nameParts)
      }
    }

    // Extraire l'organisation/auteur depuis l'URL GitHub s'il y en a une
    if (tool.toolLink && tool.toolLink.includes('github.com')) {
      const githubMatch = tool.toolLink.match(/github\.com\/([^\/]+)/i)
      if (githubMatch && githubMatch[1]) {
        keywords.push(githubMatch[1].toLowerCase())
      }
    }

    // Extraire le domaine principal de l'URL
    if (tool.toolLink) {
      try {
        const url = new URL(tool.toolLink)
        const domain = url.hostname.replace('www.', '')
        const domainParts = domain.split('.')
        if (domainParts.length >= 2) {
          keywords.push(domainParts[0].toLowerCase()) // ex: "cassetteai" de "cassetteai.com"
        }
      } catch {
        // Ignorer les URLs malformées
      }
    }

    return keywords
  }

  /**
   * Valide qu'un lien social est vraiment lié à l'outil
   */
  private static validateSocialLink(link: string, validationKeywords: string[], platform: string): boolean {
    const linkLower = link.toLowerCase()

    // Rejeter les liens génériques ou de platforms
    const genericPatterns = [
      'github.com/github',
      'facebook.com/facebook',
      'twitter.com/twitter',
      'instagram.com/instagram',
      'linkedin.com/company/linkedin',
      'discord.com/discord',
      'tiktok.com/@tiktok'
    ]

    if (genericPatterns.some(generic => linkLower.includes(generic))) {
      return false
    }

    // Vérifier si le lien contient un des mots-clés de validation
    for (const keyword of validationKeywords) {
      if (keyword.length >= 3 && linkLower.includes(keyword)) {
        return true
      }
    }

    // Pour GitHub, accepter aussi si c'est dans le même domaine que l'outil
    if (platform === 'socialGithub' && linkLower.includes('github.com')) {
      // Déjà une validation basique, on peut être moins strict
      return true
    }

    return false
  }

  /**
   * Étape 4 : Extraction des liens utiles
   */
  static async extractUsefulLinks(crawledPages: CrawledContent[], tool: Tool): Promise<{
    mailAddress?: string
    docsLink?: string
    affiliateLink?: string
    changelogLink?: string
  }> {
    const usefulLinks: any = {}

    const patterns = {
      mailAddress: [
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
        /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
      ],
      docsLink: [
        /href=["']([^"']*(?:docs|documentation|api|guide)[^"']*)["']/gi,
        /(?:https?:\/\/[^\s"'<>]*(?:docs|documentation|api|guide)[^\s"'<>]*)/gi
      ],
      affiliateLink: [
        /href=["']([^"']*(?:affiliate|ref=|utm_|partner)[^"']*)["']/gi,
        /(?:https?:\/\/[^\s"'<>]*(?:affiliate|ref=|utm_|partner)[^\s"'<>]*)/gi
      ],
      changelogLink: [
        /href=["']([^"']*(?:changelog|release|updates|news)[^"']*)["']/gi,
        /(?:https?:\/\/[^\s"'<>]*(?:changelog|release|updates|news)[^\s"'<>]*)/gi
      ]
    }

    for (const page of crawledPages) {
      const combinedContent = `${page.content} ${page.html}`

      // Email
      if (!usefulLinks.mailAddress) {
        for (const pattern of patterns.mailAddress) {
          const matches = combinedContent.match(pattern)
          if (matches && matches.length > 0) {
            usefulLinks.mailAddress = matches[0].replace('mailto:', '')
            break
          }
        }
      }

      // Documentation
      if (!usefulLinks.docsLink) {
        for (const pattern of patterns.docsLink) {
          const matches = combinedContent.match(pattern)
          if (matches && matches.length > 0) {
            usefulLinks.docsLink = matches[0].replace(/href=["']/, '').replace(/["'].*/, '')
            break
          }
        }
      }

      // Liens d'affiliation
      if (!usefulLinks.affiliateLink) {
        for (const pattern of patterns.affiliateLink) {
          const matches = combinedContent.match(pattern)
          if (matches && matches.length > 0) {
            usefulLinks.affiliateLink = matches[0].replace(/href=["']/, '').replace(/["'].*/, '')
            break
          }
        }
      }

      // Changelog
      if (!usefulLinks.changelogLink) {
        for (const pattern of patterns.changelogLink) {
          const matches = combinedContent.match(pattern)
          if (matches && matches.length > 0) {
            usefulLinks.changelogLink = matches[0].replace(/href=["']/, '').replace(/["'].*/, '')
            break
          }
        }
      }
    }

    // Validation avec Gemini AI
    console.log(`🤖 Validation Gemini des ${Object.keys(usefulLinks).length} liens utiles...`)
    const validatedUsefulLinks = await this.validateLinksWithGemini(usefulLinks, tool, 'useful')

    return validatedUsefulLinks
  }

  /**
   * Étape 5 : Génération de contenu avec IA Gemini
   */
  static async generateToolContent(tool: Tool, crawledPages: CrawledContent[]): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback')
        return this.generateFallbackContent(tool)
      }

      // Préparer le contenu crawlé pour l'IA
      const crawledContent = crawledPages.map(page => `
=== ${page.title} (${page.url}) ===
${page.content.substring(0, 2000)}...
`).join('\n')

      // Prompt optimisé pour Gemini - EN ANGLAIS
      const prompt = `You are a passionate journalist specializing in AI Tools and technologies. You are 28 years old and you love speaking directly to your audience while respecting them and paying great attention to the quality and clarity of the information you provide. You constantly try to give additional details and examples to dig deeper into topics.

Here is a collection of several web pages about the tool ${tool.toolName}. I want you to write an article that explains what this tool is, what it's used for, and why someone would want to use it. I also want you to give reasons why this tool might not be the most interesting option, if you find any. You don't need to follow this brief to the letter.

I want you to write a minimum of 300 words divided into at least 3 parts and up to 6 parts. Use H2 titles and always use "What's ${tool.toolName}?" for the first title. For the other titles, you can choose.

IMPORTANT: Write the entire article in ENGLISH.

Tool to analyze: ${tool.toolName}
Category: ${tool.toolCategory || 'Undefined'}
URL: ${tool.toolLink}

Content from crawled pages:
${crawledContent}

Write the article now in markdown format with H2 titles:`

      // Tentative avec les modèles Gemini (avec fallback)
      return await this.callGeminiWithFallback(prompt)

    } catch (error: any) {
      console.error('❌ Erreur génération contenu Gemini:', error.message)
      return this.generateFallbackContent(tool)
    }
  }

  /**
   * Appel Gemini avec système de fallback entre modèles
   */
  private static async callGeminiWithFallback(prompt: string): Promise<string> {
    if (!this.ai) {
      throw new Error('Gemini API non disponible')
    }

    let lastError: Error | null = null

    // Essayer chaque modèle
    for (const modelName of this.GEMINI_MODELS) {
      try {
        console.log(`🔄 Tentative avec modèle: ${modelName}`)
        
        const genModel = this.ai.models.generateContent({
          model: modelName,
          contents: prompt
        })

        const result = await genModel
        const text = result.text

        if (!text || text.length < 200) {
          throw new Error('Réponse trop courte ou vide')
        }

        console.log(`✅ Contenu généré avec succès par ${modelName} (${text.length} caractères)`)
        return text

      } catch (error: any) {
        lastError = error
        console.log(`❌ Échec avec ${modelName}: ${error.message}`)
        
        // Attendre avant d'essayer le modèle suivant
        if (error.message.includes('overloaded') || error.message.includes('rate limit')) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    throw lastError || new Error('Tous les modèles Gemini ont échoué')
  }

  /**
   * Étape 6 : Génération de l'overview concise avec IA Gemini
   */
  static async generateToolOverview(tool: Tool, crawledPages: CrawledContent[]): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback')
        return this.generateFallbackOverview(tool)
      }

      // Préparer un résumé du contenu crawlé pour l'IA
      const crawledSummary = crawledPages.slice(0, 3).map(page => 
        `${page.title}: ${page.content.substring(0, 500)}...`
      ).join('\n\n')

      // Prompt optimisé pour overview concise
      const prompt = `You are an expert at writing concise tool descriptions. Based on the crawled content below, write a very brief overview of ${tool.toolName}.

Tool: ${tool.toolName}
Category: ${tool.toolCategory || 'AI Tool'}
URL: ${tool.toolLink}

Crawled content summary:
${crawledSummary}

CRITICAL: Write EXACTLY 2 sentences. No more, no less. Each sentence should be concise and focused. This will be used as a preview in a tools grid on a website.

Write in ENGLISH only. Be direct and clear. Focus on the tool's primary function.

Example formats:
- "Visualizee is an AI-powered rendering tool that converts sketches into realistic 3D visualizations. It helps designers and architects create professional renders in seconds without complex 3D software."
- "QueryGPT is a NodeJS library for building custom Q&A chatbots using OpenAI's GPT models. It enables developers to create personalized knowledge bases and automated support systems."

Overview:`

      // Appel Gemini
      const overviewResponse = await this.callGeminiWithFallback(prompt)
      
      // Nettoyer la réponse
      let cleanOverview = overviewResponse.replace(/^Overview:?\s*/i, '').trim()
      
      if (!cleanOverview || cleanOverview.length < 20) {
        throw new Error('Réponse overview trop courte')
      }

      // Forcer exactement 2 phrases
      const sentences = cleanOverview.split(/[.!?]+/).filter(s => s.trim().length > 0)
      if (sentences.length !== 2) {
        if (sentences.length === 1) {
          throw new Error('Overview doit contenir exactement 2 phrases, 1 trouvée')
        } else {
          // Prendre exactement 2 phrases
          cleanOverview = sentences.slice(0, 2).join('. ') + '.'
        }
      } else {
        // S'assurer qu'on a bien les 2 phrases formatées correctement
        cleanOverview = sentences.join('. ') + '.'
      }

      console.log(`✅ Overview généré avec succès (${cleanOverview.length} caractères)`)
      return cleanOverview

    } catch (error: any) {
      console.error('❌ Erreur génération overview Gemini:', error.message)
      return this.generateFallbackOverview(tool)
    }
  }

  /**
   * Étape 7 : Génération des key features avec IA Gemini
   */
  static async generateToolKeyFeatures(tool: Tool, crawledPages: CrawledContent[]): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback')
        return this.generateFallbackKeyFeatures(tool)
      }

      // Préparer le contenu crawlé pour l'IA
      const crawledContent = crawledPages.slice(0, 5).map(page => 
        `${page.title}: ${page.content.substring(0, 1000)}...`
      ).join('\n\n')

      // Prompt optimisé pour key features
      const prompt = `You are an expert at identifying key use cases for tools. Based on the crawled content below, identify the main use cases and problems that ${tool.toolName} can solve.

Tool: ${tool.toolName}
Category: ${tool.toolCategory || 'AI Tool'}

Crawled content:
${crawledContent}

IMPORTANT: Create a bullet list of 3-6 key use cases/problems this tool solves. Each bullet should be:
- Very concise (max 10-15 words)
- Focus on WHAT problems it solves or WHAT tasks it helps with
- Be specific and actionable
- Written in ENGLISH

Format as markdown bullets like this:
• Convert sketches into photorealistic 3D renderings
• Generate product visualizations for marketing materials
• Create architectural mockups from floor plans

Key Features:`

      // Appel Gemini
      const featuresResponse = await this.callGeminiWithFallback(prompt)
      
      // Nettoyer la réponse et extraire les bullet points
      let cleanFeatures = featuresResponse.replace(/^Key Features:?\s*/i, '').trim()
      
      // S'assurer qu'on a bien des bullet points
      if (!cleanFeatures.includes('•') && !cleanFeatures.includes('-') && !cleanFeatures.includes('*')) {
        throw new Error('Pas de bullet points détectés')
      }

      // Normaliser les bullet points
      cleanFeatures = cleanFeatures
        .replace(/^[*-]/gm, '•')
        .replace(/^\d+\./gm, '•')

      console.log(`✅ Key features générées avec succès`)
      return cleanFeatures

    } catch (error: any) {
      console.error('❌ Erreur génération key features Gemini:', error.message)
      return this.generateFallbackKeyFeatures(tool)
    }
  }

  /**
   * Étape 8 : Génération du meta title et meta description avec IA Gemini
   */
  static async generateToolMeta(tool: Tool, crawledPages: CrawledContent[]): Promise<{
    metaTitle: string
    metaDescription: string
  }> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback')
        return this.generateFallbackMeta(tool)
      }

      // Préparer le contenu pour l'IA
      const crawledSummary = crawledPages.slice(0, 3).map(page => 
        `${page.title}: ${page.content.substring(0, 800)}...`
      ).join('\n\n')

      // Boucle avec validation stricte pour garantir "- Video-IA.net"
      let attempts = 0
      const maxAttempts = 5
      
      while (attempts < maxAttempts) {
        attempts++
        console.log(`🔄 Tentative ${attempts}/${maxAttempts} pour meta title avec Video-IA.net`)
        
        // Prompt ultra strict pour meta title
        const prompt = `You are an SEO expert. Create SEO-optimized meta title and description for ${tool.toolName}.

Tool: ${tool.toolName}
Category: ${tool.toolCategory || 'AI Tool'}

Content summary:
${crawledSummary}

CRITICAL REQUIREMENTS:
1. Meta Title: MUST end with " - Video-IA.net" (with space before dash)
2. Meta Title: MAXIMUM 70 characters INCLUDING the " - Video-IA.net" suffix
3. Meta Description: MAXIMUM 160 characters with call-to-action
4. Write in ENGLISH only

EXAMPLES of CORRECT format:
TITLE: Visualizee AI Rendering Tool - Video-IA.net
DESCRIPTION: Create stunning 3D renders from sketches in seconds. Try Visualizee free today!

Your response MUST follow this EXACT format:
TITLE: [max 55 chars] - Video-IA.net  
DESCRIPTION: [max 160 chars with CTA]`

        try {
          const metaResponse = await this.callGeminiWithFallback(prompt)
          
          // Extraire title et description
          const titleMatch = metaResponse.match(/TITLE:\s*(.+)/i)
          const descMatch = metaResponse.match(/DESCRIPTION:\s*(.+)/i)

          if (!titleMatch || !descMatch) {
            console.log(`❌ Tentative ${attempts}: Format invalide, retry...`)
            continue
          }

          let metaTitle = titleMatch[1].trim()
          const metaDescription = descMatch[1].trim().substring(0, 160)
          
          // VALIDATION STRICTE : le title doit se terminer par " - Video-IA.net"
          if (!metaTitle.endsWith(' - Video-IA.net')) {
            console.log(`❌ Tentative ${attempts}: Title ne se termine pas par " - Video-IA.net", retry...`)
            continue
          }
          
          // Vérifier la longueur
          if (metaTitle.length > 70) {
            console.log(`❌ Tentative ${attempts}: Title trop long (${metaTitle.length}/70), retry...`)
            continue
          }
          
          // SUCCÈS !
          console.log(`✅ Meta title validé avec Video-IA.net (tentative ${attempts})`)
          return { metaTitle, metaDescription }
          
        } catch (error: any) {
          console.log(`❌ Tentative ${attempts}: Erreur Gemini, retry...`)
          if (attempts === maxAttempts) throw error
        }
      }
      
      // Si toutes les tentatives échouent, fallback avec correction manuelle
      console.log('⚠️ Toutes les tentatives échouées, utilisation du fallback avec correction')
      const fallbackMeta = this.generateFallbackMeta(tool)
      return fallbackMeta

    } catch (error: any) {
      console.error('❌ Erreur génération meta Gemini:', error.message)
      return this.generateFallbackMeta(tool)
    }
  }

  /**
   * Étape 9 : Génération du pricing model avec IA Gemini
   */
  static async generateToolPricingModel(tool: Tool, crawledPages: CrawledContent[]): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback')
        return this.generateFallbackPricingModel(tool)
      }

      // Préparer le contenu pour l'IA
      const crawledContent = crawledPages.slice(0, 5).map(page => 
        `${page.title}: ${page.content.substring(0, 1200)}...`
      ).join('\n\n')

      // Prompt pour détecter le modèle de tarification
      const prompt = `You are a pricing analysis expert. Based on the crawled content below, determine the pricing model for ${tool.toolName}.

Tool: ${tool.toolName}
Category: ${tool.toolCategory || 'AI Tool'}
URL: ${tool.toolLink}

Content from crawled pages:
${crawledContent}

IMPORTANT: You must choose EXACTLY ONE pricing model from these options:
- FREE: The tool is completely free to use
- FREEMIUM: Free version with premium features available
- SUBSCRIPTION: Monthly/yearly subscription required
- ONE_TIME_PAYMENT: One-time purchase required
- USAGE_BASED: Pay per use/API calls/credits
- CONTACT_FOR_PRICING: Enterprise/custom pricing

Analyze the content for:
- Pricing pages, subscription plans
- Free trial mentions, free version limits
- Payment models, billing information
- Enterprise/contact sales mentions

Respond with ONLY the pricing model name (e.g., "FREEMIUM").

Pricing Model:`

      // Appel Gemini
      const pricingResponse = await this.callGeminiWithFallback(prompt)
      
      // Nettoyer la réponse et valider
      let cleanPricing = pricingResponse.replace(/^Pricing Model:?\s*/i, '').trim().toUpperCase()
      
      const validModels = ['FREE', 'FREEMIUM', 'SUBSCRIPTION', 'ONE_TIME_PAYMENT', 'USAGE_BASED', 'CONTACT_FOR_PRICING']
      if (!validModels.includes(cleanPricing)) {
        // Essayer de détecter le modèle dans la réponse
        for (const model of validModels) {
          if (pricingResponse.toUpperCase().includes(model)) {
            cleanPricing = model
            break
          }
        }
        // Si aucun modèle détecté, utiliser FREEMIUM par défaut
        if (!validModels.includes(cleanPricing)) {
          cleanPricing = 'FREEMIUM'
        }
      }

      console.log(`✅ Pricing model détecté: ${cleanPricing}`)
      return cleanPricing

    } catch (error: any) {
      console.error('❌ Erreur génération pricing model Gemini:', error.message)
      return this.generateFallbackPricingModel(tool)
    }
  }

  /**
   * Étape 10 : Génération des use cases avec IA Gemini
   */
  static async generateToolUseCases(tool: Tool, crawledPages: CrawledContent[]): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback')
        return this.generateFallbackUseCases(tool)
      }

      // Préparer le contenu pour l'IA
      const crawledContent = crawledPages.slice(0, 5).map(page => 
        `${page.title}: ${page.content.substring(0, 1000)}...`
      ).join('\n\n')

      // Prompt pour les use cases spécifiques
      const prompt = `You are an expert at identifying practical use cases for tools. Based on the crawled content below, create specific, factual use cases for ${tool.toolName}.

Tool: ${tool.toolName}
Category: ${tool.toolCategory || 'AI Tool'}
URL: ${tool.toolLink}

Content from crawled pages:
${crawledContent}

IMPORTANT: Create exactly 3-4 bullet points that show specific, practical examples of what users can do with ${tool.toolName}. Each bullet should:
- Start with "${tool.toolName} helps you"
- Be very factual and specific
- Give concrete examples of tasks/outputs
- Be concise (max 15-20 words per bullet)
- Written in ENGLISH

Examples of good format:
• Visualizee helps you convert architectural sketches into photorealistic 3D renderings
• Visualizee helps you generate product mockups for marketing campaigns
• Visualizee helps you create interior design visualizations from floor plans

Use Cases:`

      // Appel Gemini
      const useCasesResponse = await this.callGeminiWithFallback(prompt)
      
      // Nettoyer la réponse
      let cleanUseCases = useCasesResponse.replace(/^Use Cases:?\s*/i, '').trim()
      
      // Normaliser les bullet points
      cleanUseCases = cleanUseCases
        .replace(/^[*-]/gm, '•')
        .replace(/^\d+\./gm, '•')
        .replace(/^[\s]*•/gm, '•')

      // Vérifier qu'on a des bullet points
      if (!cleanUseCases.includes('•')) {
        throw new Error('Pas de bullet points détectés dans les use cases')
      }

      console.log(`✅ Use cases générés avec succès`)
      return cleanUseCases

    } catch (error: any) {
      console.error('❌ Erreur génération use cases Gemini:', error.message)
      return this.generateFallbackUseCases(tool)
    }
  }

  /**
   * Étape 11 : Génération du target audience avec IA Gemini
   */
  static async generateToolTargetAudience(tool: Tool, crawledPages: CrawledContent[]): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback')
        return this.generateFallbackTargetAudience(tool)
      }

      // Préparer le contenu pour l'IA
      const crawledContent = crawledPages.slice(0, 5).map(page => 
        `${page.title}: ${page.content.substring(0, 1000)}...`
      ).join('\n\n')

      // Prompt pour le target audience
      const prompt = `You are an expert at identifying target audiences for tools. Based on the crawled content below, identify the main target audiences for ${tool.toolName}.

Tool: ${tool.toolName}
Category: ${tool.toolCategory || 'AI Tool'}
URL: ${tool.toolLink}

Content from crawled pages:
${crawledContent}

IMPORTANT: Write a single paragraph of exactly 3-4 sentences that identifies 2-4 specific target audiences. Each sentence should:
- Mention a specific professional group or user type
- Explain WHY this tool is useful for them
- Reference specific features or capabilities
- Be very specific to this tool (not generic)
- Written in ENGLISH

Example format:
"${tool.toolName} is particularly valuable for architects and designers who need to quickly visualize concepts and present ideas to clients. Video game developers can leverage its rapid rendering capabilities to create environmental mockups and prototype visual assets. Marketing professionals benefit from its ability to generate product visualizations for campaigns without expensive 3D software. Real estate developers find it useful for creating property visualizations and marketing materials from basic plans."

Target Audience:`

      // Appel Gemini
      const audienceResponse = await this.callGeminiWithFallback(prompt)
      
      // Nettoyer la réponse
      let cleanAudience = audienceResponse.replace(/^Target Audience:?\s*/i, '').trim()
      
      // Vérifier la longueur et le format paragraphe
      if (!cleanAudience || cleanAudience.length < 100) {
        throw new Error('Réponse target audience trop courte')
      }

      // Vérifier qu'on a 3-4 phrases
      const sentences = cleanAudience.split(/[.!?]+/).filter(s => s.trim().length > 0)
      if (sentences.length < 3 || sentences.length > 4) {
        if (sentences.length > 4) {
          cleanAudience = sentences.slice(0, 4).join('. ') + '.'
        } else if (sentences.length < 3) {
          throw new Error('Target audience doit contenir 3-4 phrases')
        }
      }

      console.log(`✅ Target audience généré avec succès`)
      return cleanAudience

    } catch (error: any) {
      console.error('❌ Erreur génération target audience Gemini:', error.message)
      return this.generateFallbackTargetAudience(tool)
    }
  }

  /**
   * Pricing model de fallback si Gemini échoue
   */
  private static generateFallbackPricingModel(tool: Tool): string {
    return 'FREEMIUM' // Modèle le plus courant pour les outils IA
  }

  /**
   * Use cases de fallback si Gemini échoue
   */
  private static generateFallbackUseCases(tool: Tool): string {
    return `• ${tool.toolName} helps you automate repetitive ${tool.toolCategory?.toLowerCase() || 'digital'} tasks
• ${tool.toolName} helps you streamline your workflow processes
• ${tool.toolName} helps you improve productivity and efficiency`
  }

  /**
   * Target audience de fallback si Gemini échoue
   */
  private static generateFallbackTargetAudience(tool: Tool): string {
    return `${tool.toolName} is designed for professionals working in ${tool.toolCategory?.toLowerCase() || 'technology'} who need efficient solutions for their daily tasks. Small business owners and entrepreneurs can benefit from its automation capabilities to save time and reduce manual work. Content creators and digital marketers find it useful for streamlining their creative processes. Freelancers and consultants appreciate its ability to enhance productivity and deliver better results to clients.`
  }

  /**
   * Overview de fallback si Gemini échoue
   */
  private static generateFallbackOverview(tool: Tool): string {
    return `${tool.toolName} is an innovative AI tool designed for ${tool.toolCategory?.toLowerCase() || 'various tasks'}. It provides automated solutions to streamline workflows and enhance productivity.`
  }

  /**
   * Key features de fallback si Gemini échoue
   */
  private static generateFallbackKeyFeatures(tool: Tool): string {
    return `• Automate complex ${tool.toolCategory?.toLowerCase() || 'digital'} tasks
• Streamline workflow processes
• Provide intelligent solutions`
  }

  /**
   * Meta de fallback si Gemini échoue
   */
  private static generateFallbackMeta(tool: Tool): { metaTitle: string, metaDescription: string } {
    return {
      metaTitle: `${tool.toolName} - ${tool.toolCategory || 'AI Tool'} - Video-IA.net`.substring(0, 70),
      metaDescription: `Discover ${tool.toolName}, a powerful ${tool.toolCategory?.toLowerCase() || 'AI'} tool. Learn features, use cases and get started today!`.substring(0, 160)
    }
  }

  /**
   * Contenu de fallback si Gemini échoue
   */
  private static generateFallbackContent(tool: Tool): string {
    return `## What's ${tool.toolName}?

${tool.toolName} est un outil IA innovant qui transforme la façon dont nous abordons ${tool.toolCategory?.toLowerCase() || 'les tâches numériques'}. Cet outil se distingue par sa capacité à automatiser des processus complexes tout en maintenant une interface utilisateur intuitive et accessible.

## Principales fonctionnalités

L'un des atouts majeurs de ${tool.toolName} réside dans ses fonctionnalités avancées qui permettent aux utilisateurs de gagner un temps considérable. L'outil propose une gamme complète d'options personnalisables qui s'adaptent aux besoins spécifiques de chaque utilisateur, qu'il soit débutant ou expert.

## Pourquoi choisir ${tool.toolName}?

Ce qui rend ${tool.toolName} particulièrement attrayant, c'est sa capacité à simplifier des tâches qui prendraient normalement des heures de travail manuel. Les utilisateurs apprécient particulièrement sa facilité d'intégration avec d'autres outils existants et sa courbe d'apprentissage relativement douce.

## Points d'attention

Cependant, comme tout outil, ${tool.toolName} présente certaines limitations qu'il convient de mentionner. L'outil peut parfois manquer de flexibilité pour des cas d'usage très spécifiques, et ses fonctionnalités avancées nécessitent parfois une période d'adaptation pour être pleinement maîtrisées.

## Verdict final

En conclusion, ${tool.toolName} représente un excellent choix pour quiconque cherche à optimiser son workflow dans le domaine de ${tool.toolCategory?.toLowerCase() || 'la technologie'}. Malgré quelques limitations mineures, ses avantages l'emportent largement sur ses inconvénients, en faisant un investissement judicieux pour améliorer sa productivité.`
  }

  /**
   * Nettoyer le dossier temporaire
   */
  static async cleanupTempDirectory(tempDirPath: string): Promise<void> {
    try {
      await fs.rm(tempDirPath, { recursive: true, force: true })
    } catch (error) {
      console.error(`Erreur lors du nettoyage de ${tempDirPath}:`, error)
    }
  }

  /**
   * Processus complet de mise à jour d'un outil
   */
  static async updateToolContent(toolId: number, testMode: boolean = true): Promise<ToolUpdateResult> {
    const result: ToolUpdateResult = {
      toolId,
      toolName: '',
      status: 'failed',
      step: 'http_check',
      errors: []
    }

    try {
      // Récupérer l'outil
      const tool = await prisma.tool.findUnique({
        where: { id: toolId }
      })

      if (!tool || !tool.toolLink) {
        result.errors?.push('Outil non trouvé ou URL manquante')
        return result
      }

      result.toolName = tool.toolName

      // Étape 1 : Vérification HTTP
      console.log(`🔍 Étape 1: Test HTTP pour ${tool.toolName}...`)
      const httpResult = await this.checkHttpStatus(tool)
      result.httpStatusCode = httpResult.httpStatusCode
      result.isActive = httpResult.isActive

      if (!httpResult.isActive) {
        result.status = 'inactive'
        result.step = 'http_check'
        return result
      }

      // Étape 1.5 : Screenshot
      result.step = 'screenshot'
      console.log(`📸 Étape 1.5: Capture d'écran pour ${tool.toolName}...`)
      const screenshotPath = await this.captureScreenshot(tool)
      result.screenshotPath = screenshotPath

      if (screenshotPath) {
        if (!testMode) {
          console.log(`📊 Mise à jour DB: Screenshot sauvegardé`)
          const updatedTool = await prisma.tool.update({
            where: { id: toolId },
            data: {
              imageUrl: screenshotPath,
              updatedAt: new Date()
            }
          })
          console.log(`✅ DB mise à jour confirmée via Prisma - imageUrl sauvegardé pour Tool ID: ${updatedTool.id}`)
          console.log(`📸 Chemin relatif en DB: ${screenshotPath}`)
        } else {
          console.log(`🧪 Mode test: Screenshot créé mais non sauvegardé en DB`)
          console.log(`📸 Screenshot créé: ${screenshotPath}`)
        }
      } else {
        console.log(`❌ Échec capture screenshot - imageUrl non mis à jour`)
      }

      // Étape 2 : Crawling
      result.step = 'crawling'
      console.log(`🕷️ Étape 2: Crawling des pages pour ${tool.toolName}...`)
      const crawlResult = await this.crawlToolPages(tool)
      result.processedPages = crawlResult.crawledPages.length

      // Étape 3 : Extraction réseaux sociaux
      result.step = 'social_extraction'
      console.log(`🌐 Étape 3: Extraction des réseaux sociaux...`)
      const socialLinks = await this.extractSocialLinks(crawlResult.crawledPages, tool)
      result.socialLinks = socialLinks

      if (!testMode) {
        console.log(`📊 Mise à jour DB: ${Object.keys(socialLinks).length} liens sociaux`)
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            ...socialLinks,
            updatedAt: new Date()
          }
        })
        console.log(`✅ DB mise à jour confirmée via Prisma - Liens sociaux sauvegardés pour Tool ID: ${updatedTool.id}`)
      } else {
        console.log(`🧪 Mode test: Liens sociaux non sauvegardés en DB`)
      }

      // Étape 4 : Extraction liens utiles
      result.step = 'useful_links'
      console.log(`🔗 Étape 4: Extraction des liens utiles...`)
      const usefulLinks = await this.extractUsefulLinks(crawlResult.crawledPages, tool)
      result.usefulLinks = usefulLinks

      if (!testMode) {
        console.log(`📊 Mise à jour DB: ${Object.keys(usefulLinks).length} liens utiles`)
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            ...usefulLinks,
            updatedAt: new Date()
          }
        })
        console.log(`✅ DB mise à jour confirmée via Prisma - Liens utiles sauvegardés pour Tool ID: ${updatedTool.id}`)
      } else {
        console.log(`🧪 Mode test: Liens utiles non sauvegardés en DB`)
      }

      // Étape 5 : Génération de contenu
      result.step = 'content_generation'
      console.log(`✍️ Étape 5: Génération de contenu...`)
      const generatedContent = await this.generateToolContent(tool, crawlResult.crawledPages)
      result.generatedContent = generatedContent

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Description générée (${generatedContent.length} caractères)`)
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            toolDescription: generatedContent,
            updatedAt: new Date()
          }
        })
        console.log(`✅ DB mise à jour confirmée via Prisma - Description sauvegardée pour Tool ID: ${updatedTool.id}`)
        console.log(`📝 Contenu: ${generatedContent.substring(0, 100)}...`)
      } else {
        console.log(`🧪 Mode test: Description générée non sauvegardée en DB`)
        console.log(`📝 Aperçu contenu: ${generatedContent.substring(0, 100)}...`)
      }

      // Étape 6 : Génération de l'overview
      result.step = 'overview_generation'
      console.log(`📝 Étape 6: Génération de l'overview...`)
      const generatedOverview = await this.generateToolOverview(tool, crawlResult.crawledPages)
      result.generatedOverview = generatedOverview

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Overview généré (${generatedOverview.length} caractères)`)
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            overview: generatedOverview,
            updatedAt: new Date()
          }
        })
        console.log(`✅ DB mise à jour confirmée via Prisma - Overview sauvegardé pour Tool ID: ${updatedTool.id}`)
      } else {
        console.log(`🧪 Mode test: Overview non sauvegardé en DB`)
        console.log(`📝 Aperçu overview: ${generatedOverview}`)
      }

      // Étape 7 : Génération des key features
      result.step = 'keyfeatures_generation'
      console.log(`🔑 Étape 7: Génération des key features...`)
      const generatedKeyFeatures = await this.generateToolKeyFeatures(tool, crawlResult.crawledPages)
      result.generatedKeyFeatures = generatedKeyFeatures

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Key features générées`)
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            keyFeatures: generatedKeyFeatures,
            updatedAt: new Date()
          }
        })
        console.log(`✅ DB mise à jour confirmée via Prisma - Key features sauvegardées pour Tool ID: ${updatedTool.id}`)
      } else {
        console.log(`🧪 Mode test: Key features non sauvegardées en DB`)
        console.log(`📝 Aperçu key features: ${generatedKeyFeatures.substring(0, 150)}...`)
      }

      // Étape 8 : Génération des meta title et description
      result.step = 'meta_generation'
      console.log(`🏷️ Étape 8: Génération des meta title et description...`)
      const generatedMeta = await this.generateToolMeta(tool, crawlResult.crawledPages)
      result.generatedMetaTitle = generatedMeta.metaTitle
      result.generatedMetaDescription = generatedMeta.metaDescription

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Meta title et description générés`)
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            metaTitle: generatedMeta.metaTitle,
            metaDescription: generatedMeta.metaDescription,
            updatedAt: new Date(),
            last_optimized_at: new Date()
          }
        })
        console.log(`✅ DB mise à jour confirmée via Prisma - Meta données sauvegardées pour Tool ID: ${updatedTool.id}`)
        console.log(`📝 Meta Title: ${generatedMeta.metaTitle}`)
        console.log(`📝 Meta Description: ${generatedMeta.metaDescription}`)
      } else {
        console.log(`🧪 Mode test: Meta données non sauvegardées en DB`)
        console.log(`📝 Meta Title: ${generatedMeta.metaTitle}`)
        console.log(`📝 Meta Description: ${generatedMeta.metaDescription}`)
      }

      // Étape 9 : Génération du pricing model
      result.step = 'pricing_generation'
      console.log(`💰 Étape 9: Génération du pricing model...`)
      const generatedPricing = await this.generateToolPricingModel(tool, crawlResult.crawledPages)
      result.generatedPricingModel = generatedPricing

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Pricing model généré (${generatedPricing})`)
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            pricingModel: generatedPricing as any,
            updatedAt: new Date()
          }
        })
        console.log(`✅ DB mise à jour confirmée via Prisma - Pricing model sauvegardé pour Tool ID: ${updatedTool.id}`)
        console.log(`💰 Pricing Model: ${generatedPricing}`)
      } else {
        console.log(`🧪 Mode test: Pricing model non sauvegardé en DB`)
        console.log(`💰 Pricing Model: ${generatedPricing}`)
      }

      // Étape 10 : Génération des use cases
      result.step = 'usecases_generation'
      console.log(`🎯 Étape 10: Génération des use cases...`)
      const generatedUseCases = await this.generateToolUseCases(tool, crawlResult.crawledPages)
      result.generatedUseCases = generatedUseCases

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Use cases générés`)
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            useCases: generatedUseCases,
            updatedAt: new Date()
          }
        })
        console.log(`✅ DB mise à jour confirmée via Prisma - Use cases sauvegardés pour Tool ID: ${updatedTool.id}`)
      } else {
        console.log(`🧪 Mode test: Use cases non sauvegardés en DB`)
        console.log(`🎯 Aperçu use cases: ${generatedUseCases.substring(0, 150)}...`)
      }

      // Étape 11 : Génération du target audience
      result.step = 'targetaudience_generation'
      console.log(`👥 Étape 11: Génération du target audience...`)
      const generatedTargetAudience = await this.generateToolTargetAudience(tool, crawlResult.crawledPages)
      result.generatedTargetAudience = generatedTargetAudience

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Target audience généré`)
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            targetAudience: generatedTargetAudience,
            updatedAt: new Date(),
            last_optimized_at: new Date()
          }
        })
        console.log(`✅ DB mise à jour confirmée via Prisma - Target audience sauvegardé pour Tool ID: ${updatedTool.id}`)
        console.log(`👥 Target Audience: ${generatedTargetAudience.substring(0, 100)}...`)
      } else {
        console.log(`🧪 Mode test: Target audience non sauvegardé en DB`)
        console.log(`👥 Aperçu target audience: ${generatedTargetAudience.substring(0, 150)}...`)
      }

      // Nettoyage
      await this.cleanupTempDirectory(crawlResult.tempDirPath)

      result.status = 'success'
      result.step = 'completed'
      console.log(`✅ Mise à jour complète pour ${tool.toolName} - 11 étapes terminées`)

      return result

    } catch (error: any) {
      result.errors?.push(error.message || 'Erreur inconnue')
      console.error(`❌ Erreur lors de la mise à jour de l'outil ${toolId}:`, error)
      return result
    }
  }

  /**
   * Traiter plusieurs outils en batch
   */
  static async updateMultipleTools(toolIds: number[], testMode: boolean = true): Promise<ToolUpdateResult[]> {
    const results: ToolUpdateResult[] = []

    for (const toolId of toolIds) {
      console.log(`\n🚀 Traitement de l'outil ${toolId}...`)
      const result = await this.updateToolContent(toolId, testMode)
      results.push(result)

      // Pause entre les outils pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return results
  }
}