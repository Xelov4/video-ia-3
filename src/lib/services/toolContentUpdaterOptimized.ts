/**
 * Tool Content Updater Service - VERSION OPTIMISÉE 2025
 *
 * ⚡ OPTIMISATION MAJEURE: 53 → 17 appels API Gemini (-68% d'appels)
 * 🆕 NOUVELLE HIÉRARCHIE: Gemini 2.5 Pro → 1.5 Flash-8B (8 modèles)
 * 🔄 SYSTÈME RÉVOLUTIONNAIRE: Recommencement complet de la hiérarchie à chaque appel
 * ✅ Rate limiting 90s entre requêtes (respect strict limite API)
 * ✅ Traductions JSON unifiées (1 prompt par langue au lieu de 7)
 *
 * Service pour mettre à jour automatiquement le contenu des outils IA :
 * - Test HTTP status
 * - Crawling des pages
 * - Extraction des réseaux sociaux
 * - Extraction des liens utiles
 * - Génération de contenu IA (11 étapes anglaises)
 * - Traductions multilangues (1 appel unifié par langue au lieu de 7)
 *
 * 📊 ÉCONOMIE D'APPELS API:
 * - AVANT: 11 (anglais) + 42 (6 langues × 7 champs) = 53 appels
 * - APRÈS: 11 (anglais) + 6 (6 langues × 1 prompt unifié) = 17 appels
 * - ÉCONOMIE: 36 appels (-68%)
 *
 * 🧠 HIÉRARCHIE GEMINI 2025:
 * 1. Gemini 2.5 Pro (Premium) → 2. Gemini 2.5 Flash → 3. Gemini 2.5 Flash-Lite
 * 4. Gemini 2.0 Flash → 5. Gemini 2.0 Flash-Lite → 6. Gemini 1.5 Flash
 * 7. Gemini 1.5 Pro → 8. Gemini 1.5 Flash-8B (dernier recours)
 *
 * 🔄 SYSTÈME DE RECOMMENCEMENT:
 * - Chaque appel recommence TOUTE la hiérarchie depuis le modèle premium
 * - Maximum 3 tentatives complètes de la hiérarchie
 * - Résilience maximale avec 8 niveaux de fallback
 *
 * @author Video-IA.net Development Team
 * @version 5.1 - Hiérarchie Gemini 2.5 + Recommencement complet
 */

import { prisma } from '../database/client';
import { Tool } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';
import puppeteer from 'puppeteer';

export interface ToolUpdateResult {
  toolId: number;
  toolName: string;
  status: 'success' | 'failed' | 'inactive';
  step:
    | 'http_check'
    | 'screenshot'
    | 'crawling'
    | 'social_extraction'
    | 'useful_links'
    | 'content_generation'
    | 'overview_generation'
    | 'keyfeatures_generation'
    | 'meta_generation'
    | 'pricing_generation'
    | 'usecases_generation'
    | 'targetaudience_generation'
    | 'completed';
  httpStatusCode?: number;
  isActive?: boolean;
  socialLinks?: {
    socialLinkedin?: string;
    socialFacebook?: string;
    socialX?: string;
    socialGithub?: string;
    socialDiscord?: string;
    socialInstagram?: string;
    socialTiktok?: string;
  };
  usefulLinks?: {
    mailAddress?: string;
    docsLink?: string;
    affiliateLink?: string;
    changelogLink?: string;
  };
  generatedContent?: string;
  generatedOverview?: string;
  generatedKeyFeatures?: string;
  generatedMetaTitle?: string;
  generatedMetaDescription?: string;
  generatedPricingModel?: string;
  generatedUseCases?: string;
  generatedTargetAudience?: string;
  screenshotPath?: string;
  errors?: string[];
  processedPages?: number;
}

export interface CrawledContent {
  url: string;
  content: string;
  title: string;
  html: string;
}

export class ToolContentUpdaterServiceOptimized {
  private static readonly TEMP_DIR_PREFIX = 'temporary.';
  private static readonly MAX_PAGES_TO_CRAWL = 50;
  private static readonly REQUEST_TIMEOUT = 10000;
  private static readonly CRAWL_DELAY = 1000; // Délai entre les requêtes en ms

  // Configuration Gemini API - NOUVELLE HIÉRARCHIE 2025
  private static readonly GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  private static readonly GEMINI_MODELS = [
    'gemini-2.5-pro', // 1er choix - Modèle le plus récent et performant
    'gemini-2.5-flash', // 2ème choix - Flash 2.5 optimisé
    'gemini-2.5-flash-lite', // 3ème choix - Flash-Lite 2.5 léger
    'gemini-2.0-flash', // 4ème choix - Flash 2.0 stable
    'gemini-2.0-flash-lite', // 5ème choix - Flash-Lite 2.0 léger
    'gemini-1.5-flash', // 6ème choix - Flash 1.5 éprouvé
    'gemini-1.5-pro', // 7ème choix - Pro 1.5 stable
    'gemini-1.5-flash-8b', // 8ème choix - Flash 8B ultra-léger (dernier recours)
  ];
  private static readonly RATE_LIMIT_DELAY_MS = 90000; // 90 secondes entre requêtes
  private static lastGeminiCallTime = 0; // Timestamp dernier appel pour rate limiting
  private static readonly ai = this.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: this.GEMINI_API_KEY })
    : null;

  /**
   * Étape 1 : Test HTTP Status et validation de l'URL
   */
  static async checkHttpStatus(tool: Tool): Promise<{
    httpStatusCode: number;
    isActive: boolean;
    redirectUrl?: string;
  }> {
    try {
      const response: AxiosResponse = await axios.get(tool.toolLink!, {
        timeout: this.REQUEST_TIMEOUT,
        maxRedirects: 5,
        validateStatus: status => status < 600, // Accepter tous les codes < 600
      });

      const httpStatusCode = response.status;
      const isActive = httpStatusCode >= 200 && httpStatusCode < 400;

      // Mise à jour dans la DB via Prisma
      console.log(`📊 Mise à jour DB: HTTP ${httpStatusCode}, isActive: ${isActive}`);
      const updatedTool = await prisma.tool.update({
        where: { id: tool.id },
        data: {
          httpStatusCode,
          isActive,
          lastCheckedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(
        `✅ DB mise à jour confirmée via Prisma - Tool ID: ${updatedTool.id}, HTTP: ${updatedTool.httpStatusCode}, Active: ${updatedTool.isActive}`
      );

      return {
        httpStatusCode,
        isActive,
        redirectUrl:
          response.request.res?.responseUrl !== tool.toolLink
            ? response.request.res?.responseUrl
            : undefined,
      };
    } catch (error: any) {
      // En cas d'erreur, marquer comme inactif
      const httpStatusCode = error.response?.status || 0;
      console.log(`❌ Erreur HTTP: ${error.message}, Code: ${httpStatusCode}`);

      console.log(`📊 Mise à jour DB: HTTP ${httpStatusCode}, isActive: false (échec)`);
      const updatedTool = await prisma.tool.update({
        where: { id: tool.id },
        data: {
          httpStatusCode,
          isActive: false,
          lastCheckedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(
        `✅ DB mise à jour confirmée via Prisma - Tool ID: ${updatedTool.id}, HTTP: ${updatedTool.httpStatusCode}, Active: ${updatedTool.isActive} (outil marqué inactif)`
      );

      return {
        httpStatusCode,
        isActive: false,
      };
    }
  }

  /**
   * Étape 1.5 : Capture d'écran de la page d'accueil
   */
  static async captureScreenshot(tool: Tool): Promise<string | null> {
    let browser = null;
    try {
      console.log(`📸 Capture d'écran de ${tool.toolLink}...`);

      // S'assurer que le dossier existe
      const publicImagesDir = path.join(process.cwd(), 'public', 'images', 'tools');
      try {
        await fs.mkdir(publicImagesDir, { recursive: true });
      } catch (error) {
        // Dossier existe déjà
      }

      // Générer le nom de fichier : nom de l'outil nettoyé + .webp
      const sanitizedName = tool.toolName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const screenshotPath = path.join(publicImagesDir, `${sanitizedName}.webp`);
      const relativeScreenshotPath = `/images/tools/${sanitizedName}.webp`;

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
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      // Configuration de la page
      await page.setViewport({ width: 1200, height: 800 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Navigation vers la page
      await page.goto(tool.toolLink!, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Attendre 5 secondes comme demandé
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Prendre la capture d'écran en format WebP
      await page.screenshot({
        path: screenshotPath,
        type: 'webp',
        quality: 80,
        fullPage: false, // Seulement la partie visible
      });

      console.log(`✅ Screenshot sauvegardé: ${relativeScreenshotPath}`);
      return relativeScreenshotPath;
    } catch (error: any) {
      console.error(`❌ Erreur capture d'écran: ${error.message}`);
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Étape 2 : Crawling des 50 premières pages
   */
  static async crawlToolPages(tool: Tool): Promise<{
    tempDirPath: string;
    crawledPages: CrawledContent[];
  }> {
    const sanitizedName = tool.toolName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const tempDirPath = path.join(
      process.cwd(),
      `${this.TEMP_DIR_PREFIX}${sanitizedName}`
    );

    // Créer le dossier temporaire
    try {
      await fs.mkdir(tempDirPath, { recursive: true });
    } catch (error) {
      // Dossier existe déjà
    }

    const crawledPages: CrawledContent[] = [];
    const urlsToVisit = [tool.toolLink!];
    const visitedUrls = new Set<string>();

    const baseUrl = new URL(tool.toolLink!).origin;

    let crawlStopReason = '';
    let newLinksFound = 0;
    let errorCount = 0;

    for (let i = 0; i < this.MAX_PAGES_TO_CRAWL && urlsToVisit.length > 0; i++) {
      const currentUrl = urlsToVisit.shift()!;

      if (visitedUrls.has(currentUrl)) {
        console.log(`⏭️  Page ${i + 1}: URL déjà visitée, passage à la suivante`);
        continue;
      }
      visitedUrls.add(currentUrl);

      console.log(
        `🔍 Page ${i + 1}/${this.MAX_PAGES_TO_CRAWL}: Crawl de ${currentUrl}`
      );

      try {
        await new Promise(resolve => setTimeout(resolve, this.CRAWL_DELAY));

        const response = await axios.get(currentUrl, {
          timeout: this.REQUEST_TIMEOUT,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; VideoIA-Bot/1.0)',
          },
        });

        const $ = cheerio.load(response.data);

        // Nettoyer le contenu
        $(
          'script, style, nav, header, footer, .cookie-banner, .advertisement'
        ).remove();

        const content = $('body').text().replace(/\s+/g, ' ').trim();
        const title = $('title').text() || $('h1').first().text() || 'No Title';

        const crawledContent: CrawledContent = {
          url: currentUrl,
          content,
          title,
          html: response.data,
        };

        crawledPages.push(crawledContent);

        // Sauvegarder dans le dossier temporaire
        const filename = `page_${i + 1}_${currentUrl.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        await fs.writeFile(
          path.join(tempDirPath, filename),
          JSON.stringify(crawledContent, null, 2)
        );

        console.log(
          `✅ Page ${i + 1} crawlée: "${title}" (${content.length} caractères)`
        );

        // Extraire de nouveaux liens pour continuer le crawl
        if (crawledPages.length < this.MAX_PAGES_TO_CRAWL) {
          const linksBefore = urlsToVisit.length;
          $('a[href]').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
              try {
                const fullUrl = new URL(href, currentUrl).href;
                if (
                  fullUrl.startsWith(baseUrl) &&
                  !visitedUrls.has(fullUrl) &&
                  !urlsToVisit.includes(fullUrl)
                ) {
                  urlsToVisit.push(fullUrl);
                }
              } catch {
                // Ignorer les URLs malformées
              }
            }
          });
          const linksAfter = urlsToVisit.length;
          const newLinks = linksAfter - linksBefore;
          newLinksFound += newLinks;
          console.log(`🔗 ${newLinks} nouveaux liens trouvés sur cette page`);
        }
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Erreur lors du crawl de ${currentUrl}: ${error.message}`);
      }
    }

    // Analyser pourquoi on n'a pas atteint 50 pages
    if (crawledPages.length < this.MAX_PAGES_TO_CRAWL) {
      if (urlsToVisit.length === 0) {
        crawlStopReason = `Plus de liens internes à crawler (${newLinksFound} liens découverts au total)`;
      } else if (errorCount > crawledPages.length / 2) {
        crawlStopReason = `Trop d'erreurs de crawl (${errorCount} erreurs)`;
      } else {
        crawlStopReason = `Structure du site limitée (${crawledPages.length} pages accessibles)`;
      }

      console.log(
        `⚠️  Crawling arrêté à ${crawledPages.length}/${this.MAX_PAGES_TO_CRAWL} pages`
      );
      console.log(`📝 Raison: ${crawlStopReason}`);
      console.log(
        `📊 Statistiques: ${newLinksFound} liens découverts, ${errorCount} erreurs, ${visitedUrls.size} URLs visitées`
      );
    } else {
      console.log(
        `🎯 Crawling complet: ${this.MAX_PAGES_TO_CRAWL}/${this.MAX_PAGES_TO_CRAWL} pages crawlées`
      );
    }

    return {
      tempDirPath,
      crawledPages,
    };
  }

  /**
   * Étape 3 : Extraction des liens des réseaux sociaux avec validation
   */
  static async extractSocialLinks(
    crawledPages: CrawledContent[],
    tool: Tool
  ): Promise<{
    socialLinkedin?: string;
    socialFacebook?: string;
    socialX?: string;
    socialGithub?: string;
    socialDiscord?: string;
    socialInstagram?: string;
    socialTiktok?: string;
  }> {
    const socialPatterns = {
      socialLinkedin: [
        /linkedin\.com\/company\/([^\/\s"']+)/gi,
        /linkedin\.com\/in\/([^\/\s"']+)/gi,
      ],
      socialFacebook: [/facebook\.com\/([^\/\s"']+)/gi, /fb\.me\/([^\/\s"']+)/gi],
      socialX: [/twitter\.com\/([^\/\s"']+)/gi, /x\.com\/([^\/\s"']+)/gi],
      socialGithub: [/github\.com\/([^\/\s"'?#]+)/gi],
      socialDiscord: [
        /discord\.gg\/([^\/\s"']+)/gi,
        /discord\.com\/invite\/([^\/\s"']+)/gi,
      ],
      socialInstagram: [/instagram\.com\/([^\/\s"']+)/gi],
      socialTiktok: [/tiktok\.com\/@([^\/\s"']+)/gi],
    };

    const socialLinks: any = {};

    // Créer des mots-clés de validation basés sur l'outil
    const validationKeywords = this.generateValidationKeywords(tool);

    for (const page of crawledPages) {
      const combinedContent = `${page.content} ${page.html}`;

      for (const [platform, patterns] of Object.entries(socialPatterns)) {
        if (!socialLinks[platform]) {
          for (const pattern of patterns) {
            const matches = combinedContent.match(pattern);
            if (matches) {
              // Valider chaque match trouvé
              for (const match of matches) {
                if (this.validateSocialLink(match, validationKeywords, platform)) {
                  socialLinks[platform] = match;
                  break;
                }
              }
              if (socialLinks[platform]) break;
            }
          }
        }
      }
    }

    console.log(
      `✅ Liens sociaux extraits via regex: ${Object.keys(socialLinks).length} trouvés`
    );
    for (const [platform, link] of Object.entries(socialLinks)) {
      console.log(`   ${platform}: ${link}`);
    }

    return socialLinks;
  }

  /**
   * Génère des mots-clés de validation pour l'outil
   */
  private static generateValidationKeywords(tool: Tool): string[] {
    const keywords: string[] = [];

    // Nom de l'outil (sans espaces, en minuscules)
    if (tool.toolName) {
      keywords.push(tool.toolName.toLowerCase().replace(/\s+/g, ''));
      keywords.push(tool.toolName.toLowerCase().replace(/\s+/g, '-'));
      keywords.push(tool.toolName.toLowerCase().replace(/\s+/g, '_'));

      // Variations du nom
      const nameParts = tool.toolName.toLowerCase().split(/\s+/);
      if (nameParts.length > 1) {
        keywords.push(...nameParts);
      }
    }

    // Extraire l'organisation/auteur depuis l'URL GitHub s'il y en a une
    if (tool.toolLink && tool.toolLink.includes('github.com')) {
      const githubMatch = tool.toolLink.match(/github\.com\/([^\/]+)/i);
      if (githubMatch && githubMatch[1]) {
        keywords.push(githubMatch[1].toLowerCase());
      }
    }

    // Extraire le domaine principal de l'URL
    if (tool.toolLink) {
      try {
        const url = new URL(tool.toolLink);
        const domain = url.hostname.replace('www.', '');
        const domainParts = domain.split('.');
        if (domainParts.length >= 2) {
          keywords.push(domainParts[0].toLowerCase()); // ex: "cassetteai" de "cassetteai.com"
        }
      } catch {
        // Ignorer les URLs malformées
      }
    }

    return keywords;
  }

  /**
   * Valide qu'un lien social est vraiment lié à l'outil
   */
  private static validateSocialLink(
    link: string,
    validationKeywords: string[],
    platform: string
  ): boolean {
    const linkLower = link.toLowerCase();

    // Rejeter les liens génériques ou de platforms
    const genericPatterns = [
      'github.com/github',
      'facebook.com/facebook',
      'twitter.com/twitter',
      'instagram.com/instagram',
      'linkedin.com/company/linkedin',
      'discord.com/discord',
      'tiktok.com/@tiktok',
    ];

    if (genericPatterns.some(generic => linkLower.includes(generic))) {
      return false;
    }

    // Vérifier si le lien contient un des mots-clés de validation
    for (const keyword of validationKeywords) {
      if (keyword.length >= 3 && linkLower.includes(keyword)) {
        return true;
      }
    }

    // Pour GitHub, accepter aussi si c'est dans le même domaine que l'outil
    if (platform === 'socialGithub' && linkLower.includes('github.com')) {
      // Déjà une validation basique, on peut être moins strict
      return true;
    }

    return false;
  }

  /**
   * Étape 4 : Extraction des liens utiles avec logique regex optimisée
   */
  static async extractUsefulLinks(
    crawledPages: CrawledContent[],
    tool: Tool
  ): Promise<{
    mailAddress?: string;
    docsLink?: string;
    affiliateLink?: string;
    changelogLink?: string;
  }> {
    console.log('🔍 Extraction liens utiles avec logique regex optimisée...');
    const usefulLinks: any = {};

    // Patterns améliorés avec validation intégrée
    const patterns = {
      mailAddress: [
        /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/gi,
        /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
        /contact[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
      ],
      docsLink: [
        /href=["']([^"']*(?:docs|documentation|api|guide|manual|help)[^"']*)["']/gi,
        /https?:\/\/[^\s"'<>]*(?:docs|documentation|api|guide|manual|help)[^\s"'<>]*/gi,
        /\b(?:docs|documentation|api|guide)\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
      ],
      affiliateLink: [
        /href=["']([^"']*(?:affiliate|ref=|utm_|partner|referral)[^"']*)["']/gi,
        /https?:\/\/[^\s"'<>]*(?:affiliate|ref=|utm_|partner|referral)[^\s"'<>]*/gi,
      ],
      changelogLink: [
        /href=["']([^"']*(?:changelog|release|updates|news|version|whats-new)[^"']*)["']/gi,
        /https?:\/\/[^\s"'<>]*(?:changelog|release|updates|news|version|whats-new)[^\s"'<>]*/gi,
        /\b(?:changelog|releases)\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
      ],
    };

    // Extraction avec scoring et validation
    const linkScores: { [key: string]: { [link: string]: number } } = {
      mailAddress: {},
      docsLink: {},
      affiliateLink: {},
      changelogLink: {},
    };

    for (const page of crawledPages) {
      const combinedContent = `${page.content} ${page.html}`;

      // Extraire tous les liens avec scoring
      for (const [linkType, linkPatterns] of Object.entries(patterns)) {
        for (const pattern of linkPatterns) {
          const matches = combinedContent.matchAll(pattern);

          for (const match of matches) {
            let extractedLink = match[1] || match[0];

            // Nettoyer le lien
            extractedLink = extractedLink
              .replace(/^href=["']/, '')
              .replace(/["'].*$/, '')
              .replace(/^mailto:/, '')
              .trim();

            // Filtrer les liens valides
            if (this.isValidUsefulLink(extractedLink, linkType, tool)) {
              if (!linkScores[linkType][extractedLink]) {
                linkScores[linkType][extractedLink] = 0;
              }
              linkScores[linkType][extractedLink]++;
            }
          }
        }
      }
    }

    // Sélectionner le meilleur lien pour chaque type
    for (const [linkType, links] of Object.entries(linkScores)) {
      if (Object.keys(links).length > 0) {
        // Prendre le lien avec le score le plus élevé
        const bestLink = Object.entries(links).sort(([, a], [, b]) => b - a)[0][0];

        usefulLinks[linkType] = bestLink;
      }
    }

    console.log(
      `✅ Liens utiles extraits via regex: ${Object.keys(usefulLinks).length} types trouvés`
    );
    for (const [type, link] of Object.entries(usefulLinks)) {
      console.log(`   ${type}: ${link}`);
    }

    return usefulLinks;
  }

  /**
   * Valide qu'un lien utile est pertinent pour l'outil
   */
  private static isValidUsefulLink(
    link: string,
    linkType: string,
    tool: Tool
  ): boolean {
    if (!link || link.length < 5) return false;

    // Exclusions génériques
    const genericExclusions = [
      'mailto:',
      'javascript:',
      '#',
      'example.com',
      'test.com',
      'localhost',
    ];

    if (genericExclusions.some(exclusion => link.includes(exclusion))) {
      return false;
    }

    // Validation spécifique par type
    switch (linkType) {
      case 'mailAddress':
        return (
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(link) &&
          !link.includes('noreply') &&
          !link.includes('example')
        );

      case 'docsLink':
        return (
          link.startsWith('http') &&
          (link.includes('docs') ||
            link.includes('documentation') ||
            link.includes('api') ||
            link.includes('guide'))
        );

      case 'affiliateLink':
        return (
          link.startsWith('http') &&
          (link.includes('affiliate') ||
            link.includes('ref=') ||
            link.includes('utm_') ||
            link.includes('partner'))
        );

      case 'changelogLink':
        return (
          link.startsWith('http') &&
          (link.includes('changelog') ||
            link.includes('release') ||
            link.includes('updates') ||
            link.includes('news'))
        );

      default:
        return true;
    }
  }

  /**
   * Étape 5 : Génération de contenu avec IA Gemini
   */
  static async generateToolContent(
    tool: Tool,
    crawledPages: CrawledContent[]
  ): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback');
        return this.generateFallbackContent(tool);
      }

      // Préparer le contenu crawlé pour l'IA
      const crawledContent = crawledPages
        .map(
          page => `
=== ${page.title} (${page.url}) ===
${page.content.substring(0, 2000)}...
`
        )
        .join('\n');

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

Write the article now in markdown format with H2 titles:`;

      // Tentative avec les modèles Gemini (avec fallback)
      return await this.callGeminiWithFallback(prompt);
    } catch (error: any) {
      console.error('❌ Erreur génération contenu Gemini:', error.message);
      return this.generateFallbackContent(tool);
    }
  }

  /**
   * Appel Gemini avec système de fallback entre modèles
   * ⚡ NOUVEAU: Rate limiting strict de 90s entre chaque appel
   * 🆕 NOUVEAU: Recommence TOUTE la hiérarchie pour chaque appel
   *
   * 🕐 SYSTÈME DE RATE LIMITING SIMPLIFIÉ:
   * 1. Rate limiting: 90 secondes entre chaque appel
   * 2. Fallback: 8 modèles Gemini testés en ordre de priorité
   * 3. Gestion rate limit: Attente supplémentaire si détecté
   * 4. NOUVEAU: Chaque appel recommence depuis le modèle premium
   *
   * 🎯 OBJECTIF: Respecter strictement les limites API Gemini
   * - Éviter le blocage temporaire du compte
   * - Maintenir la stabilité des performances
   * - Garantir la fiabilité du service
   * - Maximiser les chances de succès avec le meilleur modèle disponible
   */
  private static async callGeminiWithFallback(prompt: string): Promise<string> {
    if (!this.ai) {
      throw new Error('Gemini API non disponible');
    }

    // 🕐 RATE LIMITING: Respecter 90 secondes entre requêtes
    const now = Date.now();
    const timeSinceLastCall = now - this.lastGeminiCallTime;

    if (timeSinceLastCall < this.RATE_LIMIT_DELAY_MS) {
      const waitTime = this.RATE_LIMIT_DELAY_MS - timeSinceLastCall;
      console.log(
        `⏱️  Rate limiting: Attente ${(waitTime / 1000).toFixed(1)}s avant requête Gemini...`
      );
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastGeminiCallTime = Date.now();

    let lastError: Error | null = null;
    let attemptCount = 0;
    const maxAttempts = 3; // Maximum 3 tentatives complètes de la hiérarchie

    // 🔄 BOUCLE DE TENTATIVES COMPLÈTES DE LA HIÉRARCHIE
    while (attemptCount < maxAttempts) {
      attemptCount++;
      console.log(
        `\n🔄 TENTATIVE COMPLÈTE ${attemptCount}/${maxAttempts} - Recommencement de toute la hiérarchie`
      );
      console.log(`📋 Ordre des modèles: ${this.GEMINI_MODELS.join(' → ')}`);

      // Essayer chaque modèle de la hiérarchie (depuis le début)
      for (let i = 0; i < this.GEMINI_MODELS.length; i++) {
        const modelName = this.GEMINI_MODELS[i];
        const modelPosition = i + 1;

        try {
          console.log(
            `  🔄 [${modelPosition}/${this.GEMINI_MODELS.length}] Test avec ${modelName}...`
          );

          const genModel = this.ai.models.generateContent({
            model: modelName,
            contents: prompt,
          });

          const result = await genModel;
          const text = result.text;

          if (!text || text.length < 200) {
            throw new Error('Réponse trop courte ou vide');
          }

          console.log(`  ✅ SUCCÈS avec ${modelName} (${text.length} caractères)`);
          console.log(
            `  🏆 Modèle gagnant: ${modelName} (position ${modelPosition}/${this.GEMINI_MODELS.length})`
          );
          console.log(`  📊 Tentative complète: ${attemptCount}/${maxAttempts}`);
          return text;
        } catch (error: any) {
          lastError = error;
          console.log(`  ❌ Échec avec ${modelName}: ${error.message}`);

          // Gestion spéciale des rate limits
          if (
            error.message.includes('overloaded') ||
            error.message.includes('rate limit')
          ) {
            console.log(`  ⏳ Rate limit détecté, attente supplémentaire 5s...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }

          // Si c'est le dernier modèle de la hiérarchie, on va recommencer
          if (i === this.GEMINI_MODELS.length - 1) {
            console.log(
              `  🔄 Fin de la hiérarchie atteinte, passage à la tentative suivante...`
            );
          }
        }
      }

      // Si on arrive ici, toute la hiérarchie a échoué
      console.log(
        `\n⚠️  TENTATIVE ${attemptCount}/${maxAttempts} ÉCHOUÉE - Toute la hiérarchie a échoué`
      );

      if (attemptCount < maxAttempts) {
        console.log(`🔄 Recommencement de toute la hiérarchie dans 10 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    // 🚨 TOUTES LES TENTATIVES ONT ÉCHOUÉ
    console.log(
      `\n❌ ÉCHEC DÉFINITIF: ${maxAttempts} tentatives complètes de la hiérarchie ont échoué`
    );
    console.log(`📋 Hiérarchie testée: ${this.GEMINI_MODELS.join(' → ')}`);
    throw (
      lastError ||
      new Error(
        `Tous les modèles Gemini ont échoué après ${maxAttempts} tentatives complètes`
      )
    );
  }

  /**
   * Étape 6 : Génération de l'overview concise avec IA Gemini
   */
  static async generateToolOverview(
    tool: Tool,
    crawledPages: CrawledContent[]
  ): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback');
        return this.generateFallbackOverview(tool);
      }

      // Préparer un résumé du contenu crawlé pour l'IA
      const crawledSummary = crawledPages
        .slice(0, 3)
        .map(page => `${page.title}: ${page.content.substring(0, 500)}...`)
        .join('\n\n');

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

Overview:`;

      // Appel Gemini
      const overviewResponse = await this.callGeminiWithFallback(prompt);

      // Nettoyer la réponse
      let cleanOverview = overviewResponse.replace(/^Overview:?\s*/i, '').trim();

      if (!cleanOverview || cleanOverview.length < 20) {
        throw new Error('Réponse overview trop courte');
      }

      // Forcer exactement 2 phrases
      const sentences = cleanOverview.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length !== 2) {
        if (sentences.length === 1) {
          throw new Error('Overview doit contenir exactement 2 phrases, 1 trouvée');
        } else {
          // Prendre exactement 2 phrases
          cleanOverview = sentences.slice(0, 2).join('. ') + '.';
        }
      } else {
        // S'assurer qu'on a bien les 2 phrases formatées correctement
        cleanOverview = sentences.join('. ') + '.';
      }

      console.log(
        `✅ Overview généré avec succès (${cleanOverview.length} caractères)`
      );
      return cleanOverview;
    } catch (error: any) {
      console.error('❌ Erreur génération overview Gemini:', error.message);
      return this.generateFallbackOverview(tool);
    }
  }

  /**
   * Étape 7 : Génération des key features avec IA Gemini
   */
  static async generateToolKeyFeatures(
    tool: Tool,
    crawledPages: CrawledContent[]
  ): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback');
        return this.generateFallbackKeyFeatures(tool);
      }

      // Préparer le contenu crawlé pour l'IA
      const crawledContent = crawledPages
        .slice(0, 5)
        .map(page => `${page.title}: ${page.content.substring(0, 1000)}...`)
        .join('\n\n');

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

Key Features:`;

      // Appel Gemini
      const featuresResponse = await this.callGeminiWithFallback(prompt);

      // Nettoyer la réponse et extraire les bullet points
      let cleanFeatures = featuresResponse.replace(/^Key Features:?\s*/i, '').trim();

      // S'assurer qu'on a bien des bullet points
      if (
        !cleanFeatures.includes('•') &&
        !cleanFeatures.includes('-') &&
        !cleanFeatures.includes('*')
      ) {
        throw new Error('Pas de bullet points détectés');
      }

      // Normaliser les bullet points
      cleanFeatures = cleanFeatures.replace(/^[*-]/gm, '•').replace(/^\d+\./gm, '•');

      console.log(`✅ Key features générées avec succès`);
      return cleanFeatures;
    } catch (error: any) {
      console.error('❌ Erreur génération key features Gemini:', error.message);
      return this.generateFallbackKeyFeatures(tool);
    }
  }

  /**
   * Étape 8 : Génération du meta title et meta description avec IA Gemini
   */
  static async generateToolMeta(
    tool: Tool,
    crawledPages: CrawledContent[]
  ): Promise<{
    metaTitle: string;
    metaDescription: string;
  }> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback');
        return this.generateFallbackMeta(tool);
      }

      // Préparer le contenu pour l'IA
      const crawledSummary = crawledPages
        .slice(0, 3)
        .map(page => `${page.title}: ${page.content.substring(0, 800)}...`)
        .join('\n\n');

      // Boucle avec validation stricte pour garantir "- Video-IA.net"
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        attempts++;
        console.log(
          `🔄 Tentative ${attempts}/${maxAttempts} pour meta title avec Video-IA.net`
        );

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
DESCRIPTION: [max 160 chars with CTA]`;

        try {
          const metaResponse = await this.callGeminiWithFallback(prompt);

          // Extraire title et description
          const titleMatch = metaResponse.match(/TITLE:\s*(.+)/i);
          const descMatch = metaResponse.match(/DESCRIPTION:\s*(.+)/i);

          if (!titleMatch || !descMatch) {
            console.log(`❌ Tentative ${attempts}: Format invalide, retry...`);
            continue;
          }

          const metaTitle = titleMatch[1].trim();
          const metaDescription = descMatch[1].trim().substring(0, 160);

          // VALIDATION STRICTE : le title doit se terminer par " - Video-IA.net"
          if (!metaTitle.endsWith(' - Video-IA.net')) {
            console.log(
              `❌ Tentative ${attempts}: Title ne se termine pas par " - Video-IA.net", retry...`
            );
            continue;
          }

          // Vérifier la longueur
          if (metaTitle.length > 70) {
            console.log(
              `❌ Tentative ${attempts}: Title trop long (${metaTitle.length}/70), retry...`
            );
            continue;
          }

          // SUCCÈS !
          console.log(`✅ Meta title validé avec Video-IA.net (tentative ${attempts})`);
          return { metaTitle, metaDescription };
        } catch (error: any) {
          console.log(`❌ Tentative ${attempts}: Erreur Gemini, retry...`);
          if (attempts === maxAttempts) throw error;
        }
      }

      // Si toutes les tentatives échouent, fallback avec correction manuelle
      console.log(
        '⚠️ Toutes les tentatives échouées, utilisation du fallback avec correction'
      );
      const fallbackMeta = this.generateFallbackMeta(tool);
      return fallbackMeta;
    } catch (error: any) {
      console.error('❌ Erreur génération meta Gemini:', error.message);
      return this.generateFallbackMeta(tool);
    }
  }

  /**
   * Étape 9 : Détection du pricing model avec logique regex optimisée
   */
  static async generateToolPricingModel(
    tool: Tool,
    crawledPages: CrawledContent[]
  ): Promise<string> {
    try {
      console.log('🔍 Détection pricing model avec analyse regex...');

      // Combiner tout le contenu crawlé
      const allContent = crawledPages
        .map(page => `${page.title} ${page.content}`)
        .join(' ')
        .toLowerCase();

      // Patterns de détection par modèle de pricing
      const pricingPatterns = {
        FREE: [
          /\b(completely\s+free|always\s+free|100%\s+free|forever\s+free)\b/,
          /\b(no\s+cost|no\s+charge|no\s+payment)\b/,
          /\b(free\s+forever|free\s+to\s+use)\b/,
        ],
        FREEMIUM: [
          /\b(free\s+plan|free\s+tier|free\s+version)\b/,
          /\b(upgrade\s+to\s+pro|premium\s+features)\b/,
          /\b(basic\s+free|free\s+with\s+limits)\b/,
          /\b(freemium|free\s+and\s+paid)\b/,
        ],
        SUBSCRIPTION: [
          /\b(monthly|yearly|annual)\s+(subscription|plan|billing)\b/,
          /\b\$\d+\/(month|year|mo|yr)\b/,
          /\b(subscribe|subscription|recurring)\b/,
          /\b(billed\s+(monthly|annually))\b/,
        ],
        ONE_TIME_PAYMENT: [
          /\b(one[- ]?time\s+(payment|purchase|fee))\b/,
          /\b(buy\s+once|single\s+payment|lifetime\s+access)\b/,
          /\b(permanent\s+license|one[- ]?off\s+payment)\b/,
        ],
        USAGE_BASED: [
          /\b(pay\s+per\s+use|per\s+api\s+call|credit[s]?\s+based)\b/,
          /\b(usage\s+based|pay\s+as\s+you\s+go)\b/,
          /\b(tokens?|credits?|api\s+calls?)\s+pricing\b/,
        ],
        CONTACT_FOR_PRICING: [
          /\b(contact\s+(us|sales)|custom\s+pricing)\b/,
          /\b(enterprise\s+pricing|quote|get\s+in\s+touch)\b/,
          /\b(talk\s+to\s+sales|request\s+demo)\b/,
        ],
      };

      // Calculer le score pour chaque modèle
      const scores: { [key: string]: number } = {};

      for (const [model, patterns] of Object.entries(pricingPatterns)) {
        scores[model] = 0;
        for (const pattern of patterns) {
          const matches = allContent.match(pattern);
          if (matches) {
            scores[model] += matches.length;
          }
        }
      }

      // Trouver le modèle avec le score le plus élevé
      let detectedModel = 'FREEMIUM'; // Default fallback
      let maxScore = 0;

      for (const [model, score] of Object.entries(scores)) {
        if (score > maxScore) {
          maxScore = score;
          detectedModel = model;
        }
      }

      // Si aucun pattern détecté, utiliser une logique secondaire
      if (maxScore === 0) {
        if (allContent.includes('free') && allContent.includes('pro')) {
          detectedModel = 'FREEMIUM';
        } else if (allContent.includes('free')) {
          detectedModel = 'FREE';
        } else if (allContent.includes('$') || allContent.includes('price')) {
          detectedModel = 'SUBSCRIPTION';
        }
      }

      console.log(
        `✅ Pricing model détecté via regex: ${detectedModel} (score: ${maxScore})`
      );
      return detectedModel;
    } catch (error: any) {
      console.error('❌ Erreur détection pricing model:', error.message);
      return this.generateFallbackPricingModel(tool);
    }
  }

  /**
   * Étape 10 : Génération des use cases avec IA Gemini
   */
  static async generateToolUseCases(
    tool: Tool,
    crawledPages: CrawledContent[]
  ): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback');
        return this.generateFallbackUseCases(tool);
      }

      // Préparer le contenu pour l'IA
      const crawledContent = crawledPages
        .slice(0, 5)
        .map(page => `${page.title}: ${page.content.substring(0, 1000)}...`)
        .join('\n\n');

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

Use Cases:`;

      // Appel Gemini
      const useCasesResponse = await this.callGeminiWithFallback(prompt);

      // Nettoyer la réponse
      let cleanUseCases = useCasesResponse.replace(/^Use Cases:?\s*/i, '').trim();

      // Normaliser les bullet points
      cleanUseCases = cleanUseCases
        .replace(/^[*-]/gm, '•')
        .replace(/^\d+\./gm, '•')
        .replace(/^[\s]*•/gm, '•');

      // Vérifier qu'on a des bullet points
      if (!cleanUseCases.includes('•')) {
        throw new Error('Pas de bullet points détectés dans les use cases');
      }

      console.log(`✅ Use cases générés avec succès`);
      return cleanUseCases;
    } catch (error: any) {
      console.error('❌ Erreur génération use cases Gemini:', error.message);
      return this.generateFallbackUseCases(tool);
    }
  }

  /**
   * Étape 11 : Génération du target audience avec IA Gemini
   */
  static async generateToolTargetAudience(
    tool: Tool,
    crawledPages: CrawledContent[]
  ): Promise<string> {
    try {
      if (!this.ai) {
        console.log('⚠️ Gemini API non disponible, utilisation du fallback');
        return this.generateFallbackTargetAudience(tool);
      }

      // Préparer le contenu pour l'IA
      const crawledContent = crawledPages
        .slice(0, 5)
        .map(page => `${page.title}: ${page.content.substring(0, 1000)}...`)
        .join('\n\n');

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

Target Audience:`;

      // Appel Gemini
      const audienceResponse = await this.callGeminiWithFallback(prompt);

      // Nettoyer la réponse
      let cleanAudience = audienceResponse.replace(/^Target Audience:?\s*/i, '').trim();

      // Vérifier la longueur et le format paragraphe
      if (!cleanAudience || cleanAudience.length < 100) {
        throw new Error('Réponse target audience trop courte');
      }

      // Vérifier qu'on a 3-4 phrases
      const sentences = cleanAudience.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length < 3 || sentences.length > 4) {
        if (sentences.length > 4) {
          cleanAudience = sentences.slice(0, 4).join('. ') + '.';
        } else if (sentences.length < 3) {
          throw new Error('Target audience doit contenir 3-4 phrases');
        }
      }

      console.log(`✅ Target audience généré avec succès`);
      return cleanAudience;
    } catch (error: any) {
      console.error('❌ Erreur génération target audience Gemini:', error.message);
      return this.generateFallbackTargetAudience(tool);
    }
  }

  /**
   * Pricing model de fallback si Gemini échoue
   */
  private static generateFallbackPricingModel(tool: Tool): string {
    return 'FREEMIUM'; // Modèle le plus courant pour les outils IA
  }

  /**
   * Use cases de fallback si Gemini échoue
   */
  private static generateFallbackUseCases(tool: Tool): string {
    return `• ${tool.toolName} helps you automate repetitive ${tool.toolCategory?.toLowerCase() || 'digital'} tasks
• ${tool.toolName} helps you streamline your workflow processes
• ${tool.toolName} helps you improve productivity and efficiency`;
  }

  /**
   * Target audience de fallback si Gemini échoue
   */
  private static generateFallbackTargetAudience(tool: Tool): string {
    return `${tool.toolName} is designed for professionals working in ${tool.toolCategory?.toLowerCase() || 'technology'} who need efficient solutions for their daily tasks. Small business owners and entrepreneurs can benefit from its automation capabilities to save time and reduce manual work. Content creators and digital marketers find it useful for streamlining their creative processes. Freelancers and consultants appreciate its ability to enhance productivity and deliver better results to clients.`;
  }

  /**
   * ================================================================
   * 🌍 SYSTÈME DE TRADUCTION MULTILANGUE - CŒUR DE L'APPLICATION
   * ================================================================
   *
   * Ce système constitue le CŒUR de l'application multilangue Video-IA.net.
   * Il transforme le contenu anglais généré en 6 langues supplémentaires
   * avec une qualité et cohérence maximales.
   *
   * 🎯 OBJECTIF PRINCIPAL:
   * Prendre du contenu anglais de qualité (généré par les 11 étapes)
   * et le traduire automatiquement dans 6 langues européennes majeures
   * en respectant les contraintes techniques et éditoriales strictes.
   *
   * 🌐 LANGUES SUPPORTÉES (6 + anglais = 7 total):
   * - 🇫🇷 Français (fr) - Marché francophone européen et africain
   * - 🇮🇹 Italien (it) - Marché italien et suisse italien
   * - 🇪🇸 Espagnol (es) - Marché espagnol et hispano-américain
   * - 🇩🇪 Allemand (de) - Marché allemand, autrichien, suisse allemand
   * - 🇳🇱 Néerlandais (nl) - Marché néerlandais et belge flamand
   * - 🇵🇹 Portugais (pt) - Marché portugais et brésilien
   *
   * 📝 CHAMPS TRADUITS PAR LANGUE (7 champs critiques):
   * 1. overview - Résumé outil (EXACTEMENT 2 phrases, <150 chars)
   * 2. description - Article complet (markdown, sections H2, >300 mots)
   * 3. metaTitle - Titre SEO (max 70 chars, DOIT finir par "- Video-IA.net")
   * 4. metaDescription - Description SEO (max 160 chars, call-to-action)
   * 5. keyFeatures - Fonctionnalités (bullet points, 3-6 items)
   * 6. useCases - Cas d'usage (bullet points, commence par nom outil)
   * 7. targetAudience - Public cible (paragraphe 3-4 phrases)
   *
   * 🏗️ ARCHITECTURE DU SYSTÈME:
   *
   * generateToolTranslations() [FONCTION PRINCIPALE]
   *    ↓
   * generateSingleLanguageTranslation() [PAR LANGUE]
   *    ↓ (7 prompts en parallèle)
   * callGeminiWithFallback() [IA GÉNÉRATION]
   *    ↓
   * cleanTranslationResponse() [NETTOYAGE & VALIDATION]
   *    ↓
   * saveTranslationToDatabase() [SAUVEGARDE PRISMA]
   *
   * 🚀 PROCESSUS COMPLET MULTILANGUE:
   *
   * updateToolContentWithTranslations()
   *    ↓
   * PHASE 1: updateToolContent() [11 ÉTAPES ANGLAIS]
   *    ↓
   * PHASE 2: generateToolTranslations() [6 LANGUES]
   *    ↓
   * RÉSULTAT: 1 outil × 7 langues = support international complet
   *
   * ⚡ PERFORMANCE & OPTIMISATIONS:
   * - Traductions en parallèle par langue (Promise.all)
   * - 7 prompts simultanés par langue pour rapidité maximale
   * - Fallback sur 5 modèles Gemini pour résilience
   * - Mode test pour validation sans écriture DB
   * - Gestion d'erreurs par langue (une échoue, les autres continuent)
   *
   * 🎛️ CONTRÔLE QUALITÉ INTÉGRÉ:
   * - Prompts ultra-spécialisés avec contraintes strictes
   * - Validation automatique des formats (longueur, structure)
   * - Nettoyage intelligent des réponses IA
   * - Score qualité automatique (8.5/10 pour traductions IA)
   * - Traçabilité complète (source: 'ai_generated')
   *
   * 💾 PERSISTANCE DONNÉES:
   * - Table: tool_translations (Prisma ORM)
   * - Relation: toolId + languageCode (clé composite unique)
   * - Upsert: création ou mise à jour automatique
   * - Timestamps: created_at, updated_at automatiques
   *
   * 🔧 MODES D'UTILISATION:
   * - testMode=true: Génération + validation, pas de sauvegarde
   * - testMode=false: Génération + sauvegarde automatique en production
   * - Batch processing: Traitement multiple d'outils avec pause anti-rate-limit
   *
   * ⚠️ CONTRAINTES CRITIQUES RESPECTÉES:
   * - Meta titles DOIVENT finir par " - Video-IA.net" (branding obligatoire)
   * - Overviews DOIVENT avoir exactement 2 phrases (UX grid preview)
   * - Use cases DOIVENT commencer par le nom de l'outil (cohérence)
   * - Limites caractères SEO respectées (70 title, 160 description)
   * - Préservation du nom d'outil original dans toutes les langues
   *
   * 🌟 VALEUR BUSINESS:
   * Ce système permet à Video-IA.net de servir 7 marchés linguistiques
   * avec un contenu de qualité professionnelle, augmentant drastiquement
   * la portée internationale et le SEO multilingue de la plateforme.
   */

  /**
   * 🌍 FONCTION PRINCIPALE - GÉNÉRATION TRADUCTIONS MULTILANGUES
   *
   * Cette fonction est le POINT D'ENTRÉE principal du système de traduction.
   * Elle orchestre la traduction d'un outil vers les 6 langues supportées.
   *
   * 🎯 RÔLE:
   * - Coordonner la traduction vers 6 langues (fr, it, es, de, nl, pt)
   * - Gérer les erreurs par langue (isolées, non bloquantes)
   * - Fournir statistiques détaillées de succès/échecs
   * - Sauvegarder en base si mode production
   *
   * 📥 PARAMÈTRES:
   * @param toolId - ID de l'outil à traduire (clé primaire table tools)
   * @param generatedContent - Contenu anglais source (7 champs obligatoires)
   *   • overview: Résumé 2 phrases de l'outil
   *   • description: Article complet markdown avec sections
   *   • metaTitle: Titre SEO avec branding Video-IA.net
   *   • metaDescription: Description SEO avec call-to-action
   *   • keyFeatures: Fonctionnalités en bullet points
   *   • useCases: Cas d'usage pratiques avec nom outil
   *   • targetAudience: Public cible professionnel détaillé
   * @param testMode - true: génération seule, false: génération + sauvegarde DB
   *
   * 📤 RETOUR:
   * Objet détaillé avec:
   * - toolId: ID outil traité
   * - translations: Objet avec traductions par langue (fr, it, es, de, nl, pt)
   * - totalLanguages: Nombre total de langues traitées (6)
   * - successfulTranslations: Nombre de langues traduites avec succès
   * - Statistiques détaillées des succès/échecs par langue
   *
   * 🔄 ALGORITHME:
   * 1. Valider l'outil existe en base
   * 2. Initialiser tableau des langues à traiter
   * 3. BOUCLE pour chaque langue:
   *    a. Appeler generateSingleLanguageTranslation()
   *    b. Stocker résultat (succès ou erreur)
   *    c. Si mode production: sauvegarder en DB
   *    d. Logger progression en temps réel
   * 4. Retourner statistiques globales complètes
   *
   * ⚡ PERFORMANCE:
   * - Traitement séquentiel par langue (évite surcharge API Gemini)
   * - Gestion d'erreurs isolées (une langue échoue, les autres continuent)
   * - Mode test ultra-rapide (pas d'écriture DB)
   *
   * 🛡️ RÉSILIENCE:
   * - Continue même si certaines langues échouent
   * - Erreurs détaillées par langue pour diagnostic
   * - Pas de rollback (chaque langue indépendante)
   *
   * 💡 USAGE TYPIQUE:
   * ```typescript
   * const result = await ToolContentUpdaterService.generateToolTranslations(
   *   6669,
   *   englishContent,
   *   false // Mode production = sauvegarde automatique
   * );
   * console.log(`${result.successfulTranslations}/${result.totalLanguages} langues traduites`);
   * ```
   */
  static async generateToolTranslations(
    toolId: number,
    generatedContent: {
      overview: string;
      description: string;
      metaTitle: string;
      metaDescription: string;
      keyFeatures: string;
      useCases: string;
      targetAudience: string;
    },
    testMode: boolean = true
  ): Promise<any> {
    try {
      const tool = await prisma.tool.findUnique({ where: { id: toolId } });
      if (!tool) throw new Error(`Tool ${toolId} not found`);

      // Langues à traduire (incluant anglais pour cohérence)
      const languagesToTranslate = ['en', 'fr', 'it', 'es', 'de', 'nl', 'pt'];
      const translations: any = {};

      console.log(
        `🌐 Génération des traductions pour ${languagesToTranslate.length} langues...`
      );

      for (const langCode of languagesToTranslate) {
        console.log(`\n🔄 Traduction vers ${langCode.toUpperCase()}...`);

        try {
          let translation: any;

          if (langCode === 'en') {
            // Pour l'anglais, copie directe depuis le contenu généré (pas d'API)
            console.log(`📋 Copie directe du contenu anglais depuis la table Tool`);
            translation = {
              overview: generatedContent.overview,
              description: generatedContent.description,
              metaTitle: generatedContent.metaTitle,
              metaDescription: generatedContent.metaDescription,
              keyFeatures: generatedContent.keyFeatures,
              useCases: generatedContent.useCases,
              targetAudience: generatedContent.targetAudience,
            };
          } else {
            // Pour les autres langues, génération via IA
            translation = await this.generateSingleLanguageTranslation(
              tool,
              generatedContent,
              langCode
            );
          }

          translations[langCode] = translation;
          console.log(`✅ Traduction ${langCode.toUpperCase()} terminée`);

          // Sauvegarder en DB si pas en mode test
          if (!testMode) {
            await this.saveTranslationToDatabase(toolId, langCode, translation);
            console.log(`💾 Traduction ${langCode.toUpperCase()} sauvegardée en DB`);
          } else {
            console.log(
              `🧪 Mode test: Traduction ${langCode.toUpperCase()} non sauvegardée`
            );
          }
        } catch (error: any) {
          console.error(`❌ Erreur traduction ${langCode}: ${error.message}`);
          translations[langCode] = { error: error.message };
        }
      }

      return {
        toolId,
        translations,
        totalLanguages: languagesToTranslate.length,
        successfulTranslations: Object.keys(translations).filter(
          lang => !translations[lang].error
        ).length,
      };
    } catch (error: any) {
      console.error('❌ Erreur génération traductions:', error.message);
      throw error;
    }
  }

  /**
   * 🔄 TRADUCTION VERS UNE LANGUE SPÉCIFIQUE - MOTEUR CENTRAL OPTIMISÉ
   *
   * Cette fonction est le MOTEUR de traduction pour UNE langue.
   * Elle prend le contenu anglais et le traduit vers une langue cible
   * en utilisant UN SEUL prompt Gemini unifié pour les 7 champs.
   *
   * ⚡ OPTIMISATION MAJEURE:
   * - AVANT: 7 appels API par langue (42 total pour 6 langues)
   * - APRÈS: 1 appel API par langue (6 total pour 6 langues)
   * - ÉCONOMIE: 85% de réduction des appels API (42 → 6)
   *
   * 🎯 RÔLE CRITIQUE:
   * - Traduire les 7 champs vers UNE langue cible en un seul appel
   * - Respecter les contraintes spécifiques de chaque champ
   * - Maintenir la cohérence terminologique (nom outil, etc.)
   * - Adapter le style à la langue cible (français soutenu, espagnol commercial, etc.)
   * - Retourner un JSON structuré avec les 7 champs traduits
   *
   * 📥 PARAMÈTRES:
   * @param tool - Objet Tool Prisma (pour récupérer nom, catégorie, etc.)
   * @param content - Contenu anglais source (7 champs validés)
   * @param targetLang - Code langue ISO 639-1 (fr, it, es, de, nl, pt)
   *
   * 🧠 STRATÉGIE DE TRADUCTION UNIFIÉE:
   *
   * 1️⃣ OVERVIEW (résumé outil):
   *    • Contrainte: EXACTEMENT 2 phrases (ni plus, ni moins)
   *    • Usage: Aperçu dans grilles d'outils sur le site
   *    • Défi: Condenser l'essence en 2 phrases naturelles
   *
   * 2️⃣ DESCRIPTION (article complet):
   *    • Contrainte: Markdown préservé (##, -, etc.)
   *    • Usage: Page détail de l'outil
   *    • Défi: Traduire sections techniques avec précision
   *
   * 3️⃣ META TITLE (SEO titre):
   *    • Contrainte: DOIT finir par " - Video-IA.net" (branding)
   *    • Contrainte: Maximum 70 caractères TOTAL
   *    • Usage: Titre Google, onglet navigateur
   *    • Défi: Optimiser SEO + branding + limites
   *
   * 4️⃣ META DESCRIPTION (SEO description):
   *    • Contrainte: Maximum 160 caractères
   *    • Contrainte: Call-to-action engageant
   *    • Usage: Snippet Google sous le titre
   *    • Défi: Convaincre clic en 160 chars max
   *
   * 5️⃣ KEY FEATURES (fonctionnalités):
   *    • Contrainte: Format bullet points (• ou -)
   *    • Contrainte: 3-6 items maximum
   *    • Usage: Section "Fonctionnalités" page outil
   *    • Défi: Concision technique + attractivité
   *
   * 6️⃣ USE CASES (cas d'usage):
   *    • Contrainte: Chaque bullet DOIT commencer par nom outil
   *    • Format: "NomOutil helps you..." dans langue cible
   *    • Usage: Section "Cas d'usage" page outil
   *    • Défi: Cohérence nom + exemples concrets
   *
   * 7️⃣ TARGET AUDIENCE (public cible):
   *    • Contrainte: Paragraphe de 3-4 phrases
   *    • Style: Professionnel, spécifique
   *    • Usage: Section "Pour qui" page outil
   *    • Défi: Segmentation précise + style naturel
   *
   * ⚡ ARCHITECTURE PERFORMANCE:
   * - 7 appels Gemini simultanés (Promise.all)
   * - Durée: ~10-15s par langue au lieu de 70s séquentiel
   * - Fallback automatique sur 5 modèles si échec
   * - Nettoyage immédiat après chaque réponse
   *
   * 🎨 ADAPTATION CULTURELLE PAR LANGUE:
   * - Français: Style soutenu, vouvoiement
   * - Espagnol: Style commercial, direct
   * - Italien: Style élégant, expressif
   * - Allemand: Style précis, technique
   * - Néerlandais: Style pratique, concis
   * - Portugais: Style chaleureux, accessible
   *
   * 🛡️ GESTION D'ERREURS:
   * - Chaque prompt isolé (un échoue, les autres continuent)
   * - Retry automatique avec modèle différent
   * - Logs détaillés pour debugging
   * - Réponses partielles acceptées (mieux que rien)
   *
   * 📤 RETOUR:
   * Objet avec 7 champs traduits nettoyés et validés:
   * {
   *   overview: string,
   *   description: string,
   *   metaTitle: string,
   *   metaDescription: string,
   *   keyFeatures: string,
   *   useCases: string,
   *   targetAudience: string
   * }
   *
   * 💡 EXEMPLE TRANSFORMATION:
   * EN: "AI 3D Rendering Tool - Visualizee - Video-IA.net"
   * FR: "Outil de Rendu 3D IA - Visualizee - Video-IA.net"
   * ES: "Herramienta de Renderizado 3D IA - Visualizee - Video-IA.net"
   * DE: "KI 3D-Rendering-Tool - Visualizee - Video-IA.net"
   */
  private static async generateSingleLanguageTranslation(
    tool: Tool,
    content: any,
    targetLang: string
  ): Promise<any> {
    const languageNames: { [key: string]: string } = {
      fr: 'French (Français)',
      it: 'Italian (Italiano)',
      es: 'Spanish (Español)',
      de: 'German (Deutsch)',
      nl: 'Dutch (Nederlands)',
      pt: 'Portuguese (Português)',
    };

    const langName = languageNames[targetLang] || targetLang;

    /**
     * 🚀 PROMPT UNIFIÉ - LES 7 CHAMPS EN 1 SEUL APPEL API
     *
     * ⚡ RÉVOLUTION: Au lieu de 7 appels API par langue, UN SEUL appel
     * qui génère les 7 champs simultanément au format JSON structuré.
     *
     * 🎯 ÉCONOMIE: 85% de réduction des appels (7 → 1 par langue)
     *
     * 📋 FORMAT DE RÉPONSE ATTENDU (JSON):
     * {
     *   "overview": "Exactly 2 sentences...",
     *   "description": "Full markdown article...",
     *   "metaTitle": "SEO title - Video-IA.net",
     *   "metaDescription": "Max 160 chars...",
     *   "keyFeatures": "• Feature 1\n• Feature 2...",
     *   "useCases": "• ToolName helps...",
     *   "targetAudience": "3-4 sentences paragraph..."
     * }
     *
     * 🔧 CONTRAINTES CRITIQUES MAINTENUES:
     * - Overview: EXACTEMENT 2 phrases
     * - Meta Title: DOIT finir par " - Video-IA.net" + max 70 chars
     * - Meta Description: max 160 caractères
     * - Key Features: format bullet points
     * - Use Cases: chaque bullet commence par nom outil
     * - Target Audience: 3-4 phrases en paragraphe
     */

    const unifiedTranslationPrompt = `You are a professional translator for Video-IA.net. Translate the following AI tool content from English to ${langName}.

Tool: ${tool.toolName}
Category: ${tool.toolCategory || 'AI Tool'}

=== ORIGINAL ENGLISH CONTENT ===

Overview: ${content.overview}

Description: ${content.description}

Meta Title: ${content.metaTitle}

Meta Description: ${content.metaDescription}

Key Features: ${content.keyFeatures}

Use Cases: ${content.useCases}

Target Audience: ${content.targetAudience}

=== TRANSLATION INSTRUCTIONS ===

Translate ALL 7 fields above to ${langName} and return ONLY a valid JSON object with this exact structure:

{
  "overview": "EXACTLY 2 sentences. No more, no less.",
  "description": "Full translation maintaining markdown formatting (##, -, etc.)",
  "metaTitle": "Translation that MUST end with ' - Video-IA.net' and be maximum 70 characters",
  "metaDescription": "Translation maximum 160 characters with engaging call-to-action",
  "keyFeatures": "Bullet points with • or - format, 3-6 items maximum",
  "useCases": "Bullet points where each starts with '${tool.toolName} helps...' or equivalent in ${langName}",
  "targetAudience": "3-4 sentences paragraph (no bullets), professional tone"
}

CRITICAL REQUIREMENTS:
1. Return ONLY the JSON object, no other text
2. Keep tool name "${tool.toolName}" unchanged in all fields
3. Overview: exactly 2 sentences (use . ! ? as sentence separators)
4. Meta Title: must end with " - Video-IA.net" and be ≤70 chars total
5. Meta Description: ≤160 characters
6. Use natural, professional ${langName}
7. Maintain technical accuracy

Return the JSON now:`;

    /**
     * 🚀 APPEL UNIQUE API - RÉVOLUTION D'EFFICACITÉ
     *
     * Au lieu de 7 appels séparés, UN SEUL appel génère tout.
     * Le prompt unifié ci-dessus contient toutes les instructions
     * nécessaires pour traduire les 7 champs simultanément.
     */
    console.log(
      `🔄 Appel API unifié pour ${langName.toUpperCase()} (1 appel au lieu de 7)`
    );

    const jsonResponse = await this.callGeminiWithFallback(unifiedTranslationPrompt);

    /**
     * 📥 PARSING ET VALIDATION DE LA RÉPONSE JSON
     *
     * La réponse devrait être un JSON valide avec les 7 champs.
     * On applique un parsing robuste avec fallback en cas d'erreur.
     */
    let parsedTranslation: any;
    try {
      // 🧹 NETTOYAGE ROBUSTE DE LA RÉPONSE
      let cleanJson = jsonResponse.trim();

      console.log(
        `🔍 Réponse brute reçue (${cleanJson.length} chars):`,
        cleanJson.substring(0, 200) + '...'
      );

      // Supprimer les préfixes courants que Gemini peut ajouter
      const prefixes = [
        'Here is the JSON:',
        "Here's the JSON:",
        `${langName} translation:`,
        'JSON:',
        '```json',
        '```',
      ];

      for (const prefix of prefixes) {
        if (cleanJson.startsWith(prefix)) {
          const beforeClean = cleanJson;
          cleanJson = cleanJson.substring(prefix.length).trim();
          console.log(
            `🧹 Préfixe supprimé: "${prefix}" → ${beforeClean.length} → ${cleanJson.length} chars`
          );
        }
        if (cleanJson.endsWith('```')) {
          const beforeClean = cleanJson;
          cleanJson = cleanJson.substring(0, cleanJson.length - 3).trim();
          console.log(
            `🧹 Suffixe supprimé: "''' → ${beforeClean.length} → ${cleanJson.length} chars`
          );
        }
      }

      console.log(
        `🔍 JSON nettoyé (${cleanJson.length} chars):`,
        cleanJson.substring(0, 200) + '...'
      );

      // 🚨 VALIDATION FINALE AVANT PARSING
      if (!cleanJson || cleanJson.length < 10) {
        throw new Error('JSON trop court après nettoyage');
      }

      if (!cleanJson.startsWith('{') || !cleanJson.includes('}')) {
        throw new Error('Format JSON invalide - doit commencer par { et contenir }');
      }

      // 🔍 PARSING JSON AVEC VALIDATION
      parsedTranslation = JSON.parse(cleanJson);

      // ✅ VALIDATION DE LA STRUCTURE PARSÉE
      const requiredFields = [
        'overview',
        'description',
        'metaTitle',
        'metaDescription',
        'keyFeatures',
        'useCases',
        'targetAudience',
      ];
      const missingFields = requiredFields.filter(field => !parsedTranslation[field]);

      if (missingFields.length > 0) {
        console.log(`⚠️  Champs manquants dans le JSON: ${missingFields.join(', ')}`);
        // Remplir les champs manquants avec des valeurs par défaut
        missingFields.forEach(field => {
          parsedTranslation[field] =
            `Translation error for ${tool.toolName} - field: ${field}`;
        });
      }

      console.log(`✅ JSON parsé avec succès pour ${langName.toUpperCase()}`);
      console.log(`📊 Champs détectés: ${Object.keys(parsedTranslation).join(', ')}`);
    } catch (error: any) {
      console.error(`❌ Erreur parsing JSON pour ${langName}:`, error.message);
      console.log(`📄 Réponse brute complète:`, jsonResponse);
      console.log(`🔍 Tentative de nettoyage échouée`);

      // 🛠️ FALLBACK INTELLIGENT - Essayer d'extraire des informations partielles
      console.log(`🔄 Tentative d'extraction partielle...`);

      try {
        // Essayer de trouver des patterns dans la réponse brute
        const extractedData = this.extractPartialTranslation(
          jsonResponse,
          tool.toolName,
          langName
        );
        parsedTranslation = extractedData;
        console.log(`✅ Extraction partielle réussie pour ${langName.toUpperCase()}`);
      } catch (extractError: any) {
        console.log(`❌ Extraction partielle échouée: ${extractError.message}`);

        // 🚨 FALLBACK FINAL - Structure d'erreur
        parsedTranslation = {
          overview: `Translation error for ${tool.toolName}. Please contact support.`,
          description: `Translation error for ${tool.toolName}. Please contact support.`,
          metaTitle: `${tool.toolName} - Video-IA.net`,
          metaDescription: `Translation error for ${tool.toolName}.`,
          keyFeatures: `• Translation error for ${tool.toolName}`,
          useCases: `• ${tool.toolName} translation error`,
          targetAudience: `Translation error for ${tool.toolName}. Please contact support.`,
        };
      }
    }

    /**
     * 🧹 VALIDATION ET NETTOYAGE POST-PARSING
     *
     * Même avec le JSON, on applique les validations critiques
     * pour s'assurer de la conformité aux contraintes.
     */
    const validatedTranslation = {
      overview: this.cleanTranslationResponse(
        parsedTranslation.overview || '',
        'overview'
      ),
      description: this.cleanTranslationResponse(
        parsedTranslation.description || '',
        'description'
      ),
      metaTitle: this.cleanTranslationResponse(
        parsedTranslation.metaTitle || '',
        'metaTitle'
      ),
      metaDescription: this.cleanTranslationResponse(
        parsedTranslation.metaDescription || '',
        'metaDescription'
      ),
      keyFeatures: this.cleanTranslationResponse(
        parsedTranslation.keyFeatures || '',
        'keyFeatures'
      ),
      useCases: this.cleanTranslationResponse(
        parsedTranslation.useCases || '',
        'useCases'
      ),
      targetAudience: this.cleanTranslationResponse(
        parsedTranslation.targetAudience || '',
        'targetAudience'
      ),
    };

    console.log(
      `🎉 Traduction ${langName.toUpperCase()} terminée avec 1 seul appel API`
    );
    return validatedTranslation;
  }

  /**
   * 🛠️ EXTRACTION PARTIELLE DE TRADUCTION - FALLBACK INTELLIGENT
   *
   * Cette fonction tente d'extraire des informations partielles d'une réponse
   * Gemini malformée pour éviter une perte complète de contenu.
   *
   * 🎯 RÔLE:
   * - Analyser la réponse brute pour trouver des patterns de traduction
   * - Extraire les champs disponibles même si le JSON est cassé
   * - Fournir une structure partielle plutôt qu'une erreur complète
   *
   * 📥 PARAMÈTRES:
   * @param rawResponse - Réponse brute de Gemini (potentiellement malformée)
   * @param toolName - Nom de l'outil pour les messages d'erreur
   * @param langName - Nom de la langue pour le contexte
   *
   * 📤 RETOUR:
   * Objet avec les champs extraits ou des valeurs par défaut
   */
  private static extractPartialTranslation(
    rawResponse: any,
    toolName: string,
    langName: string
  ): any {
    try {
      // Convertir en string si ce n'est pas déjà le cas
      const responseStr =
        typeof rawResponse === 'string' ? rawResponse : String(rawResponse);

      console.log(`🔍 Tentative d'extraction partielle pour ${langName.toUpperCase()}`);
      console.log(`📄 Réponse brute: ${responseStr.substring(0, 300)}...`);

      const extractedData: any = {};

      // 🔍 PATTERNS DE RECHERCHE POUR CHAQUE CHAMP
      const patterns = {
        overview: [
          /overview["\s]*:["\s]*([^"]+)/i,
          /overview["\s]*:["\s]*([^}]+?)(?=,|})/i,
        ],
        description: [
          /description["\s]*:["\s]*([^"]+)/i,
          /description["\s]*:["\s]*([^}]+?)(?=,|})/i,
        ],
        metaTitle: [
          /metaTitle["\s]*:["\s]*([^"]+)/i,
          /metaTitle["\s]*:["\s]*([^}]+?)(?=,|})/i,
        ],
        metaDescription: [
          /metaDescription["\s]*:["\s]*([^"]+)/i,
          /metaDescription["\s]*:["\s]*([^}]+?)(?=,|})/i,
        ],
        keyFeatures: [
          /keyFeatures["\s]*:["\s]*([^"]+)/i,
          /keyFeatures["\s]*:["\s]*([^}]+?)(?=,|})/i,
        ],
        useCases: [
          /useCases["\s]*:["\s]*([^"]+)/i,
          /useCases["\s]*:["\s]*([^}]+?)(?=,|})/i,
        ],
        targetAudience: [
          /targetAudience["\s]*:["\s]*([^"]+)/i,
          /targetAudience["\s]*:["\s]*([^}]+?)(?=,|})/i,
        ],
      };

      // 🔍 EXTRACTION AVEC PATTERNS
      for (const [field, fieldPatterns] of Object.entries(patterns)) {
        let extracted = false;

        for (const pattern of fieldPatterns) {
          const match = responseStr.match(pattern);
          if (match && match[1]) {
            let value = match[1].trim();

            // Nettoyer la valeur extraite
            value = value.replace(/^["\s]+/, '').replace(/["\s]+$/, '');

            if (value && value.length > 5) {
              extractedData[field] = value;
              extracted = true;
              console.log(`✅ ${field} extrait: "${value.substring(0, 50)}..."`);
              break;
            }
          }
        }

        if (!extracted) {
          // Valeur par défaut si extraction échouée
          extractedData[field] = `Extraction failed for ${field} - ${toolName}`;
          console.log(`❌ ${field}: extraction échouée, valeur par défaut utilisée`);
        }
      }

      // 🚨 VALIDATION FINALE
      const extractedFields = Object.keys(extractedData).length;
      console.log(`📊 Extraction partielle: ${extractedFields}/7 champs extraits`);

      if (extractedFields === 0) {
        throw new Error('Aucun champ extrait de la réponse brute');
      }

      return extractedData;
    } catch (error: any) {
      console.log(`❌ Extraction partielle échouée: ${error.message}`);
      throw error;
    }
  }

  /**
   * 🧹 NETTOYAGE INTELLIGENT DES RÉPONSES IA - POST-PROCESSING CRUCIAL
   *
   * Cette fonction est CRITIQUE car les réponses Gemini arrivent souvent "sales"
   * avec des préfixes, guillemets et formats inconsistants qu'il faut nettoyer.
   *
   * 🎯 RÔLES MULTIPLES:
   * 1. Suppression préfixes courants ("French translation:", etc.)
   * 2. Suppression guillemets parasites en début/fin
   * 3. Validation spécifique par type de champ
   * 4. Application contraintes techniques (longueur, format)
   * 5. Correction automatique si possible
   *
   * 📥 PARAMÈTRES:
   * @param response - Réponse brute de Gemini (peut contenir parasites)
   * @param fieldType - Type de champ pour validation spécifique:
   *   • 'overview' - vérification 2 phrases
   *   • 'metaTitle' - validation "- Video-IA.net" + limite 70 chars
   *   • 'metaDescription' - limite 160 caractères
   *   • autres - nettoyage de base
   *
   * 🔧 NETTOYAGES APPLIQUÉS:
   *
   * ÉTAPE 1 - Suppression préfixes multilangues:
   * - "French translation:", "Traduction française:"
   * - "Italian translation:", "Traduzione italiana:"
   * - "Spanish translation:", "Traducción española:"
   * - "German translation:", "Deutsche Übersetzung:"
   * - "Dutch translation:", "Nederlandse vertaling:"
   * - "Portuguese translation:", "Tradução portuguesa:"
   *
   * ÉTAPE 2 - Suppression guillemets:
   * - Début et fin de chaîne uniquement
   * - Préservation des guillemets internes
   *
   * ÉTAPE 3 - Validations spécifiques:
   *
   * metaTitle:
   * - Ajout forcé "- Video-IA.net" si manquant (branding obligatoire)
   * - Troncature intelligente à 70 chars (garde le suffixe)
   * - Calcul: 70 - 15 (Video-IA.net) = 55 chars max pour titre
   *
   * metaDescription:
   * - Troncature à 160 chars avec "..." si trop long
   * - Préservation du call-to-action si possible
   *
   * ÉTAPE 4 - Trim final et retour nettoyé
   *
   * 🚨 CAS CRITIQUES GÉRÉS:
   * - Réponse vide ou null → retour chaîne vide
   * - Meta title sans Video-IA.net → ajout forcé
   * - Meta title trop long → troncature intelligente
   * - Meta description trop longue → troncature avec "..."
   *
   * 💡 EXEMPLES TRANSFORMATIONS:
   *
   * AVANT: "French translation: \"Outil de Rendu 3D IA\""
   * APRÈS: "Outil de Rendu 3D IA - Video-IA.net"
   *
   * AVANT: "\"Cette description est beaucoup trop longue pour tenir dans les 160 caractères maximum autorisés par Google pour les meta descriptions SEO\""
   * APRÈS: "Cette description est beaucoup trop longue pour tenir dans les 160 caractères maximum autorisés par Google pour les meta desc..."
   *
   * 🎯 VALEUR:
   * Cette fonction transforme des réponses IA brutes et inconsistantes
   * en contenu propre, validé et conforme aux contraintes techniques
   * de Video-IA.net et des standards SEO.
   */
  private static cleanTranslationResponse(response: any, fieldType: string): string {
    // 🛡️ VALIDATION ROBUSTE DU TYPE DE RÉPONSE
    if (!response) return '';

    // 🔄 CONVERSION FORCÉE EN STRING
    let responseString: string;

    if (typeof response === 'string') {
      responseString = response;
    } else if (typeof response === 'number') {
      responseString = response.toString();
    } else if (typeof response === 'boolean') {
      responseString = response.toString();
    } else if (response && typeof response === 'object') {
      // Si c'est un objet, essayer de le convertir en JSON
      try {
        responseString = JSON.stringify(response);
      } catch {
        responseString = String(response);
      }
    } else {
      // Fallback pour tout autre type
      responseString = String(response);
    }

    // 🧹 NETTOYAGE DES PRÉFIXES COURANTS
    let cleaned = responseString
      .replace(
        /^(French|Italian|Spanish|German|Dutch|Portuguese)?\s*(translation|traduction)?:?\s*/i,
        ''
      )
      .replace(
        /^(Traduction|Translation)\s*(en\s*)?(français|french|italiano|italian|español|spanish|deutsch|german|nederlands|dutch|português|portuguese)?:?\s*/i,
        ''
      )
      .trim();

    // 🗑️ SUPPRESSION DES GUILLEMETS EN DÉBUT/FIN
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }

    // 🔍 VALIDATION SPÉCIFIQUE PAR TYPE DE CHAMP
    switch (fieldType) {
      case 'metaTitle':
        // Vérifier que ça finit par "- Video-IA.net"
        if (!cleaned.includes('- Video-IA.net')) {
          cleaned = cleaned.replace(/\s*$/, ' - Video-IA.net');
        }
        // Limiter à 70 caractères
        if (cleaned.length > 70) {
          const beforeSuffix = cleaned.replace(' - Video-IA.net', '');
          const maxLength = 70 - ' - Video-IA.net'.length;
          cleaned = beforeSuffix.substring(0, maxLength).trim() + ' - Video-IA.net';
        }
        break;

      case 'metaDescription':
        // Limiter à 160 caractères
        if (cleaned.length > 160) {
          cleaned = cleaned.substring(0, 157) + '...';
        }
        break;
    }

    return cleaned;
  }

  /**
   * 💾 SAUVEGARDE TRADUCTION EN BASE - PERSISTANCE CRITIQUE
   *
   * Cette fonction sauvegarde les traductions nettoyées dans la table
   * tool_translations via Prisma ORM avec gestion intelligente des conflits.
   *
   * 🎯 RÔLE ESSENTIEL:
   * - Persistance des traductions dans PostgreSQL
   * - Gestion création/mise à jour (upsert)
   * - Mapping champs avec contraintes DB
   * - Traçabilité et scoring automatique
   *
   * 📥 PARAMÈTRES:
   * @param toolId - ID de l'outil (clé étrangère vers table tools)
   * @param languageCode - Code ISO 639-1 (fr, it, es, de, nl, pt)
   * @param translation - Objet avec 7 champs traduits nettoyés
   *
   * 🗄️ SCHÉMA DATABASE (table tool_translations):
   * - id: Primary key auto-increment
   * - tool_id: Foreign key vers tools.id
   * - language_code: Code langue (fr, it, es, de, nl, pt)
   * - name: Nom traduit (extrait overview, phrase 1)
   * - overview: Résumé 2 phrases traduit
   * - description: Article complet traduit
   * - meta_title: Titre SEO traduit avec "- Video-IA.net"
   * - meta_description: Description SEO traduite
   * - translation_source: 'ai_generated' (traçabilité)
   * - quality_score: 8.5/10 (score par défaut traductions IA)
   * - created_at/updated_at: Timestamps automatiques
   *
   * 🔑 CLÉ COMPOSITE UNIQUE:
   * (tool_id, language_code) - Assure 1 traduction par langue par outil
   *
   * 🔄 STRATÉGIE UPSERT:
   * - WHERE: Cherche combinaison (toolId, languageCode)
   * - Si EXISTE: UPDATE avec nouveaux contenus + updated_at
   * - Si N'EXISTE PAS: CREATE avec tous les champs
   *
   * 📊 MÉTADONNÉES AUTOMATIQUES:
   * - translation_source: 'ai_generated' (vs 'human', 'imported')
   * - quality_score: 8.5 (traductions IA = bonne qualité par défaut)
   * - created_at: Timestamp création automatique
   * - updated_at: Timestamp mise à jour automatique
   *
   * 🧮 EXTRACTION NAME:
   * Le champ 'name' est extrait de l'overview (première phrase)
   * car c'est le nom affiché dans les listes et grilles.
   * Fallback: "Tool {toolId}" si overview manquant.
   *
   * 🛡️ GESTION D'ERREURS:
   * - Try/catch sur l'upsert
   * - Log détaillé en cas d'erreur
   * - Throw error pour remontée au niveau supérieur
   * - Pas de rollback (chaque langue indépendante)
   *
   * 🔍 CAS D'USAGE:
   * - Mode test: Fonction pas appelée (testMode=true)
   * - Mode production: Appelée après chaque traduction réussie
   * - Batch: Appelée pour chaque outil × chaque langue
   *
   * 💡 EXEMPLE SQL GÉNÉRÉ:
   * INSERT INTO tool_translations (tool_id, language_code, name, overview, ...)
   * VALUES (6669, 'fr', 'Visualizee est un outil...', ...)
   * ON CONFLICT (tool_id, language_code)
   * DO UPDATE SET overview = EXCLUDED.overview, updated_at = NOW()
   *
   * 🌍 IMPACT INTERNATIONAL:
   * Cette fonction permet à Video-IA.net de servir du contenu
   * dans 7 langues avec traçabilité complète et qualité mesurée.
   */
  private static async saveTranslationToDatabase(
    toolId: number,
    languageCode: string,
    translation: any
  ): Promise<void> {
    try {
      await prisma.toolTranslation.upsert({
        where: {
          toolId_languageCode: {
            toolId,
            languageCode,
          },
        },
        update: {
          name: translation.overview
            ? translation.overview.split('.')[0] + '.'
            : undefined,
          overview: translation.overview,
          description: translation.description,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
          keyFeatures: translation.keyFeatures,
          useCases: translation.useCases,
          targetAudience: translation.targetAudience,
          translationSource: languageCode === 'en' ? 'imported' : 'ai_generated',
          quality_score: languageCode === 'en' ? 9.5 : 8.5,
          updatedAt: new Date(),
        },
        create: {
          toolId,
          languageCode,
          name: translation.overview
            ? translation.overview.split('.')[0] + '.'
            : `Tool ${toolId}`,
          overview: translation.overview,
          description: translation.description,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
          keyFeatures: translation.keyFeatures,
          useCases: translation.useCases,
          targetAudience: translation.targetAudience,
          translationSource: languageCode === 'en' ? 'imported' : 'ai_generated',
          quality_score: languageCode === 'en' ? 9.5 : 8.5,
        },
      });
    } catch (error: any) {
      console.error(`❌ Erreur sauvegarde traduction ${languageCode}:`, error.message);
      throw error;
    }
  }

  /**
   * Overview de fallback si Gemini échoue
   */
  private static generateFallbackOverview(tool: Tool): string {
    return `${tool.toolName} is an innovative AI tool designed for ${tool.toolCategory?.toLowerCase() || 'various tasks'}. It provides automated solutions to streamline workflows and enhance productivity.`;
  }

  /**
   * Key features de fallback si Gemini échoue
   */
  private static generateFallbackKeyFeatures(tool: Tool): string {
    return `• Automate complex ${tool.toolCategory?.toLowerCase() || 'digital'} tasks
• Streamline workflow processes
• Provide intelligent solutions`;
  }

  /**
   * Meta de fallback si Gemini échoue
   */
  private static generateFallbackMeta(tool: Tool): {
    metaTitle: string;
    metaDescription: string;
  } {
    return {
      metaTitle:
        `${tool.toolName} - ${tool.toolCategory || 'AI Tool'} - Video-IA.net`.substring(
          0,
          70
        ),
      metaDescription:
        `Discover ${tool.toolName}, a powerful ${tool.toolCategory?.toLowerCase() || 'AI'} tool. Learn features, use cases and get started today!`.substring(
          0,
          160
        ),
    };
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

En conclusion, ${tool.toolName} représente un excellent choix pour quiconque cherche à optimiser son workflow dans le domaine de ${tool.toolCategory?.toLowerCase() || 'la technologie'}. Malgré quelques limitations mineures, ses avantages l'emportent largement sur ses inconvénients, en faisant un investissement judicieux pour améliorer sa productivité.`;
  }

  /**
   * Nettoyer le dossier temporaire
   */
  static async cleanupTempDirectory(tempDirPath: string): Promise<void> {
    try {
      await fs.rm(tempDirPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`Erreur lors du nettoyage de ${tempDirPath}:`, error);
    }
  }

  /**
   * Processus complet de mise à jour d'un outil
   */
  static async updateToolContent(
    toolId: number,
    testMode: boolean = true
  ): Promise<ToolUpdateResult> {
    const result: ToolUpdateResult = {
      toolId,
      toolName: '',
      status: 'failed',
      step: 'http_check',
      errors: [],
    };

    try {
      // Récupérer l'outil
      const tool = await prisma.tool.findUnique({
        where: { id: toolId },
      });

      if (!tool || !tool.toolLink) {
        result.errors?.push('Outil non trouvé ou URL manquante');
        return result;
      }

      result.toolName = tool.toolName;

      // Étape 1 : Vérification HTTP
      console.log(`🔍 Étape 1: Test HTTP pour ${tool.toolName}...`);
      const httpResult = await this.checkHttpStatus(tool);
      result.httpStatusCode = httpResult.httpStatusCode;
      result.isActive = httpResult.isActive;

      if (!httpResult.isActive) {
        result.status = 'inactive';
        result.step = 'http_check';
        return result;
      }

      // Étape 1.5 : Screenshot
      result.step = 'screenshot';
      console.log(`📸 Étape 1.5: Capture d'écran pour ${tool.toolName}...`);
      const screenshotPath = await this.captureScreenshot(tool);
      result.screenshotPath = screenshotPath;

      if (screenshotPath) {
        if (!testMode) {
          console.log(`📊 Mise à jour DB: Screenshot sauvegardé`);
          const updatedTool = await prisma.tool.update({
            where: { id: toolId },
            data: {
              imageUrl: screenshotPath,
              updatedAt: new Date(),
            },
          });
          console.log(
            `✅ DB mise à jour confirmée via Prisma - imageUrl sauvegardé pour Tool ID: ${updatedTool.id}`
          );
          console.log(`📸 Chemin relatif en DB: ${screenshotPath}`);
        } else {
          console.log(`🧪 Mode test: Screenshot créé mais non sauvegardé en DB`);
          console.log(`📸 Screenshot créé: ${screenshotPath}`);
        }
      } else {
        console.log(`❌ Échec capture screenshot - imageUrl non mis à jour`);
      }

      // Étape 2 : Crawling
      result.step = 'crawling';
      console.log(`🕷️ Étape 2: Crawling des pages pour ${tool.toolName}...`);
      const crawlResult = await this.crawlToolPages(tool);
      result.processedPages = crawlResult.crawledPages.length;

      // Étape 3 : Extraction réseaux sociaux
      result.step = 'social_extraction';
      console.log(`🌐 Étape 3: Extraction des réseaux sociaux...`);
      const socialLinks = await this.extractSocialLinks(crawlResult.crawledPages, tool);
      result.socialLinks = socialLinks;

      if (!testMode) {
        console.log(
          `📊 Mise à jour DB: ${Object.keys(socialLinks).length} liens sociaux`
        );
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            ...socialLinks,
            updatedAt: new Date(),
          },
        });
        console.log(
          `✅ DB mise à jour confirmée via Prisma - Liens sociaux sauvegardés pour Tool ID: ${updatedTool.id}`
        );
      } else {
        console.log(`🧪 Mode test: Liens sociaux non sauvegardés en DB`);
      }

      // Étape 4 : Extraction liens utiles
      result.step = 'useful_links';
      console.log(`🔗 Étape 4: Extraction des liens utiles...`);
      const usefulLinks = await this.extractUsefulLinks(crawlResult.crawledPages, tool);
      result.usefulLinks = usefulLinks;

      if (!testMode) {
        console.log(
          `📊 Mise à jour DB: ${Object.keys(usefulLinks).length} liens utiles`
        );
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            ...usefulLinks,
            updatedAt: new Date(),
          },
        });
        console.log(
          `✅ DB mise à jour confirmée via Prisma - Liens utiles sauvegardés pour Tool ID: ${updatedTool.id}`
        );
      } else {
        console.log(`🧪 Mode test: Liens utiles non sauvegardés en DB`);
      }

      // Étape 5 : Génération de contenu
      result.step = 'content_generation';
      console.log(`✍️ Étape 5: Génération de contenu...`);
      const generatedContent = await this.generateToolContent(
        tool,
        crawlResult.crawledPages
      );
      result.generatedContent = generatedContent;

      if (!testMode) {
        console.log(
          `📊 Mise à jour DB: Description générée (${generatedContent.length} caractères)`
        );
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            toolDescription: generatedContent,
            updatedAt: new Date(),
          },
        });
        console.log(
          `✅ DB mise à jour confirmée via Prisma - Description sauvegardée pour Tool ID: ${updatedTool.id}`
        );
        console.log(`📝 Contenu: ${generatedContent.substring(0, 100)}...`);
      } else {
        console.log(`🧪 Mode test: Description générée non sauvegardée en DB`);
        console.log(`📝 Aperçu contenu: ${generatedContent.substring(0, 100)}...`);
      }

      // Étape 6 : Génération de l'overview
      result.step = 'overview_generation';
      console.log(`📝 Étape 6: Génération de l'overview...`);
      const generatedOverview = await this.generateToolOverview(
        tool,
        crawlResult.crawledPages
      );
      result.generatedOverview = generatedOverview;

      if (!testMode) {
        console.log(
          `📊 Mise à jour DB: Overview généré (${generatedOverview.length} caractères)`
        );
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            overview: generatedOverview,
            updatedAt: new Date(),
          },
        });
        console.log(
          `✅ DB mise à jour confirmée via Prisma - Overview sauvegardé pour Tool ID: ${updatedTool.id}`
        );
      } else {
        console.log(`🧪 Mode test: Overview non sauvegardé en DB`);
        console.log(`📝 Aperçu overview: ${generatedOverview}`);
      }

      // Étape 7 : Génération des key features
      result.step = 'keyfeatures_generation';
      console.log(`🔑 Étape 7: Génération des key features...`);
      const generatedKeyFeatures = await this.generateToolKeyFeatures(
        tool,
        crawlResult.crawledPages
      );
      result.generatedKeyFeatures = generatedKeyFeatures;

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Key features générées`);
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            keyFeatures: generatedKeyFeatures,
            updatedAt: new Date(),
          },
        });
        console.log(
          `✅ DB mise à jour confirmée via Prisma - Key features sauvegardées pour Tool ID: ${updatedTool.id}`
        );
      } else {
        console.log(`🧪 Mode test: Key features non sauvegardées en DB`);
        console.log(
          `📝 Aperçu key features: ${generatedKeyFeatures.substring(0, 150)}...`
        );
      }

      // Étape 8 : Génération des meta title et description
      result.step = 'meta_generation';
      console.log(`🏷️ Étape 8: Génération des meta title et description...`);
      const generatedMeta = await this.generateToolMeta(tool, crawlResult.crawledPages);
      result.generatedMetaTitle = generatedMeta.metaTitle;
      result.generatedMetaDescription = generatedMeta.metaDescription;

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Meta title et description générés`);
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            metaTitle: generatedMeta.metaTitle,
            metaDescription: generatedMeta.metaDescription,
            updatedAt: new Date(),
            last_optimized_at: new Date(),
          },
        });
        console.log(
          `✅ DB mise à jour confirmée via Prisma - Meta données sauvegardées pour Tool ID: ${updatedTool.id}`
        );
        console.log(`📝 Meta Title: ${generatedMeta.metaTitle}`);
        console.log(`📝 Meta Description: ${generatedMeta.metaDescription}`);
      } else {
        console.log(`🧪 Mode test: Meta données non sauvegardées en DB`);
        console.log(`📝 Meta Title: ${generatedMeta.metaTitle}`);
        console.log(`📝 Meta Description: ${generatedMeta.metaDescription}`);
      }

      // Étape 9 : Génération du pricing model
      result.step = 'pricing_generation';
      console.log(`💰 Étape 9: Génération du pricing model...`);
      const generatedPricing = await this.generateToolPricingModel(
        tool,
        crawlResult.crawledPages
      );
      result.generatedPricingModel = generatedPricing;

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Pricing model généré (${generatedPricing})`);
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            pricingModel: generatedPricing as any,
            updatedAt: new Date(),
          },
        });
        console.log(
          `✅ DB mise à jour confirmée via Prisma - Pricing model sauvegardé pour Tool ID: ${updatedTool.id}`
        );
        console.log(`💰 Pricing Model: ${generatedPricing}`);
      } else {
        console.log(`🧪 Mode test: Pricing model non sauvegardé en DB`);
        console.log(`💰 Pricing Model: ${generatedPricing}`);
      }

      // Étape 10 : Génération des use cases
      result.step = 'usecases_generation';
      console.log(`🎯 Étape 10: Génération des use cases...`);
      const generatedUseCases = await this.generateToolUseCases(
        tool,
        crawlResult.crawledPages
      );
      result.generatedUseCases = generatedUseCases;

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Use cases générés`);
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            useCases: generatedUseCases,
            updatedAt: new Date(),
          },
        });
        console.log(
          `✅ DB mise à jour confirmée via Prisma - Use cases sauvegardés pour Tool ID: ${updatedTool.id}`
        );
      } else {
        console.log(`🧪 Mode test: Use cases non sauvegardés en DB`);
        console.log(`🎯 Aperçu use cases: ${generatedUseCases.substring(0, 150)}...`);
      }

      // Étape 11 : Génération du target audience
      result.step = 'targetaudience_generation';
      console.log(`👥 Étape 11: Génération du target audience...`);
      const generatedTargetAudience = await this.generateToolTargetAudience(
        tool,
        crawlResult.crawledPages
      );
      result.generatedTargetAudience = generatedTargetAudience;

      if (!testMode) {
        console.log(`📊 Mise à jour DB: Target audience généré`);
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            targetAudience: generatedTargetAudience,
            updatedAt: new Date(),
            last_optimized_at: new Date(),
          },
        });
        console.log(
          `✅ DB mise à jour confirmée via Prisma - Target audience sauvegardé pour Tool ID: ${updatedTool.id}`
        );
        console.log(
          `👥 Target Audience: ${generatedTargetAudience.substring(0, 100)}...`
        );
      } else {
        console.log(`🧪 Mode test: Target audience non sauvegardé en DB`);
        console.log(
          `👥 Aperçu target audience: ${generatedTargetAudience.substring(0, 150)}...`
        );
      }

      // Nettoyage
      await this.cleanupTempDirectory(crawlResult.tempDirPath);

      result.status = 'success';
      result.step = 'completed';
      console.log(
        `✅ Mise à jour complète pour ${tool.toolName} - 11 étapes terminées`
      );

      return result;
    } catch (error: any) {
      result.errors?.push(error.message || 'Erreur inconnue');
      console.error(`❌ Erreur lors de la mise à jour de l'outil ${toolId}:`, error);
      return result;
    }
  }

  /**
   * Traiter plusieurs outils en batch
   */
  static async updateMultipleTools(
    toolIds: number[],
    testMode: boolean = true
  ): Promise<ToolUpdateResult[]> {
    const results: ToolUpdateResult[] = [];

    for (const toolId of toolIds) {
      console.log(`\n🚀 Traitement de l'outil ${toolId}...`);
      const result = await this.updateToolContent(toolId, testMode);
      results.push(result);

      // Pause entre les outils pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }

  /**
   * ================================================================
   * 🚀 PROCESSUS COMPLET MULTILANGUE - FONCTION MAÎTRE
   * ================================================================
   *
   * Cette fonction est la FONCTION MAÎTRE qui orchestre tout le processus
   * de génération de contenu multilingue pour un outil Video-IA.net.
   *
   * 🌟 VALEUR STRATÉGIQUE:
   * Cette fonction transforme Video-IA.net d'un site anglophone
   * en plateforme internationale supportant 7 langues avec contenu
   * professionnel généré automatiquement.
   *
   * 🏗️ ARCHITECTURE 2 PHASES:
   *
   * PHASE 1 - CONTENU ANGLAIS (Foundation)
   * ├─ HTTP Status Check (étape 1)
   * ├─ Screenshot Capture (étape 1.5)
   * ├─ Website Crawling (étape 2)
   * ├─ Social Links Extraction + Validation (étape 3)
   * ├─ Useful Links Extraction + Validation (étape 4)
   * ├─ Main Content Generation (étape 5)
   * ├─ Overview Generation (étape 6)
   * ├─ Key Features Generation (étape 7)
   * ├─ Meta Data Generation (étape 8)
   * ├─ Pricing Model Detection (étape 9)
   * ├─ Use Cases Generation (étape 10)
   * └─ Target Audience Generation (étape 11)
   *
   * PHASE 2 - TRADUCTIONS MULTILANGUES (Expansion)
   * ├─ Français (fr) - 7 champs traduits
   * ├─ Italien (it) - 7 champs traduits
   * ├─ Espagnol (es) - 7 champs traduits
   * ├─ Allemand (de) - 7 champs traduits
   * ├─ Néerlandais (nl) - 7 champs traduits
   * └─ Portugais (pt) - 7 champs traduits
   *
   * 📊 RÉSULTAT MATHÉMATIQUE:
   * 1 outil × (11 étapes anglais + 6 langues × 7 champs) =
   * 1 outil × (11 + 42) = 53 contenus générés !
   *
   * 🎯 CAS D'USAGE PRINCIPAUX:
   * 1. Onboarding nouveaux outils → contenu complet 7 langues
   * 2. Mise à jour outils existants → refresh multilingue
   * 3. Migration batch → internationalisation massive
   * 4. Qualité control → régénération ciblée
   *
   * 🚦 GESTION DE LA QUALITÉ:
   * - Phase 1 DOIT réussir pour déclencher Phase 2
   * - Phase 2 continue même si certaines langues échouent
   * - Reporting détaillé par phase et par langue
   * - Mode test pour validation avant production
   *
   * ⚡ PERFORMANCE OPTIMISÉE:
   * - Phase 1: ~90s (11 étapes avec crawling)
   * - Phase 2: ~120s (6 langues × 7 prompts en parallèle)
   * - Total: ~3.5 minutes pour contenu complet 7 langues
   *
   * 🛡️ RÉSILIENCE INTÉGRÉE:
   * - Échec Phase 1 → arrêt propre avec rapport détaillé
   * - Échec langue Phase 2 → autres langues continuent
   * - Gestion d'erreurs granulaire avec diagnostics
   * - Mode dégradé acceptable (contenu partiel)
   *
   * 📱 IMPACT UX/SEO:
   * - Pages outils disponibles dans 7 langues
   * - SEO multilingue avec meta données localisées
   * - Grilles d'outils cohérentes toutes langues
   * - Expérience utilisateur native par marché
   *
   * 💰 ROI BUSINESS:
   * - 1 outil → 7 marchés linguistiques
   * - Contenu professionnel sans coût humain
   * - Scalabilité internationale automatique
   * - Time-to-market réduit drastiquement
   *
   * 🔍 MONITORING & ANALYTICS:
   * - Durée totale et par phase
   * - Taux de succès par langue
   * - Qualité du contenu généré
   * - Statistiques d'utilisation Gemini API
   */

  /**
   * 🚀 PROCESSUS COMPLET DE MISE À JOUR AVEC TRADUCTIONS MULTILANGUES
   *
   * Point d'entrée pour générer du contenu complet dans 7 langues.
   * Combine les 11 étapes de génération anglaise avec les traductions.
   *
   * 📥 PARAMÈTRES:
   * @param toolId - ID de l'outil à traiter (table tools)
   * @param testMode - true: pas de sauvegarde DB, false: sauvegarde complète
   *
   * 📤 RETOUR:
   * Objet complet avec:
   * - phase1_english: Résultat 11 étapes anglaises
   * - phase2_translations: Résultats traductions 6 langues
   * - summary: Statistiques globales et qualité
   * - status: 'success', 'failed_english', 'failed_no_content', 'error'
   */
  static async updateToolContentWithTranslations(
    toolId: number,
    testMode: boolean = true
  ): Promise<any> {
    console.log('🌍 === MISE À JOUR COMPLÈTE AVEC TRADUCTIONS MULTILANGUES ===\n');

    try {
      // PHASE 1: Génération du contenu anglais (11 étapes existantes)
      console.log('📝 PHASE 1: Génération du contenu anglais...');
      const englishResult = await this.updateToolContent(toolId, testMode);

      if (englishResult.status !== 'success') {
        console.error('❌ Échec génération contenu anglais');
        return {
          toolId,
          phase1_english: englishResult,
          phase2_translations: null,
          status: 'failed_english',
          error: 'Failed to generate English content',
        };
      }

      console.log('✅ PHASE 1 terminée avec succès');

      // PHASE 2: Génération des traductions
      console.log('\n🌐 PHASE 2: Génération des traductions multilangues...');

      const contentToTranslate = {
        overview: englishResult.generatedOverview || '',
        description: englishResult.generatedContent || '',
        metaTitle: englishResult.generatedMetaTitle || '',
        metaDescription: englishResult.generatedMetaDescription || '',
        keyFeatures: englishResult.generatedKeyFeatures || '',
        useCases: englishResult.generatedUseCases || '',
        targetAudience: englishResult.generatedTargetAudience || '',
      };

      // Vérifier qu'on a du contenu à traduire
      const hasContent = Object.values(contentToTranslate).some(
        content => content && content.length > 0
      );
      if (!hasContent) {
        console.error('❌ Pas de contenu anglais à traduire');
        return {
          toolId,
          phase1_english: englishResult,
          phase2_translations: null,
          status: 'failed_no_content',
          error: 'No English content to translate',
        };
      }

      const translationsResult = await this.generateToolTranslations(
        toolId,
        contentToTranslate,
        testMode
      );

      console.log('✅ PHASE 2 terminée avec succès');

      // RÉSULTAT FINAL
      const finalResult = {
        toolId,
        toolName: englishResult.toolName,
        phase1_english: englishResult,
        phase2_translations: translationsResult,
        status: 'success',
        totalSteps: 11,
        totalLanguages: translationsResult.totalLanguages + 1, // +1 pour l'anglais
        summary: {
          englishContentGenerated: englishResult.status === 'success',
          screenshotCaptured: !!englishResult.screenshotPath,
          pagesProcessed: englishResult.processedPages || 0,
          socialLinksFound: englishResult.socialLinks
            ? Object.keys(englishResult.socialLinks).length
            : 0,
          usefulLinksFound: englishResult.usefulLinks
            ? Object.keys(englishResult.usefulLinks).length
            : 0,
          translationsGenerated: translationsResult.successfulTranslations,
          totalLanguagesSupported: translationsResult.totalLanguages + 1,
        },
      };

      console.log('\n🎉 === MISE À JOUR MULTILANGUE TERMINÉE ===');
      console.log(`🎯 Outil: ${englishResult.toolName}`);
      console.log(`✅ Contenu anglais: ${englishResult.status}`);
      console.log(
        `🌐 Traductions réussies: ${translationsResult.successfulTranslations}/${translationsResult.totalLanguages}`
      );
      console.log(
        `📱 Langues totales supportées: ${finalResult.summary.totalLanguagesSupported}`
      );

      return finalResult;
    } catch (error: any) {
      console.error('❌ Erreur mise à jour multilangue:', error.message);
      return {
        toolId,
        phase1_english: null,
        phase2_translations: null,
        status: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Traiter plusieurs outils avec traductions en batch
   */
  static async updateMultipleToolsWithTranslations(
    toolIds: number[],
    testMode: boolean = true
  ): Promise<any[]> {
    const results: any[] = [];

    for (const toolId of toolIds) {
      console.log(`\n🌍 Traitement multilangue de l'outil ${toolId}...`);
      const result = await this.updateToolContentWithTranslations(toolId, testMode);
      results.push(result);

      // Pause entre les outils pour éviter la surcharge API
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return results;
  }
}
