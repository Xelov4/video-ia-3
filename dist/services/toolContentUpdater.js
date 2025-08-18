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
var _a;
import { prisma } from '../database/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';
export class ToolContentUpdaterService {
    /**
     * Étape 1 : Test HTTP Status et validation de l'URL
     */
    static async checkHttpStatus(tool) {
        try {
            const response = await axios.get(tool.toolLink, {
                timeout: this.REQUEST_TIMEOUT,
                maxRedirects: 5,
                validateStatus: (status) => status < 600 // Accepter tous les codes < 600
            });
            const httpStatusCode = response.status;
            const isActive = httpStatusCode >= 200 && httpStatusCode < 400;
            // Mise à jour dans la DB
            await prisma.tool.update({
                where: { id: tool.id },
                data: {
                    httpStatusCode,
                    isActive,
                    lastCheckedAt: new Date(),
                    updatedAt: new Date()
                }
            });
            return {
                httpStatusCode,
                isActive,
                redirectUrl: response.request.res?.responseUrl !== tool.toolLink ? response.request.res?.responseUrl : undefined
            };
        }
        catch (error) {
            // En cas d'erreur, marquer comme inactif
            const httpStatusCode = error.response?.status || 0;
            await prisma.tool.update({
                where: { id: tool.id },
                data: {
                    httpStatusCode,
                    isActive: false,
                    lastCheckedAt: new Date(),
                    updatedAt: new Date()
                }
            });
            return {
                httpStatusCode,
                isActive: false
            };
        }
    }
    /**
     * Étape 2 : Crawling des 50 premières pages
     */
    static async crawlToolPages(tool) {
        const sanitizedName = tool.toolName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const tempDirPath = path.join(process.cwd(), `${this.TEMP_DIR_PREFIX}${sanitizedName}`);
        // Créer le dossier temporaire
        try {
            await fs.mkdir(tempDirPath, { recursive: true });
        }
        catch (error) {
            // Dossier existe déjà
        }
        const crawledPages = [];
        const urlsToVisit = [tool.toolLink];
        const visitedUrls = new Set();
        const baseUrl = new URL(tool.toolLink).origin;
        for (let i = 0; i < this.MAX_PAGES_TO_CRAWL && urlsToVisit.length > 0; i++) {
            const currentUrl = urlsToVisit.shift();
            if (visitedUrls.has(currentUrl))
                continue;
            visitedUrls.add(currentUrl);
            try {
                await new Promise(resolve => setTimeout(resolve, this.CRAWL_DELAY));
                const response = await axios.get(currentUrl, {
                    timeout: this.REQUEST_TIMEOUT,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; VideoIA-Bot/1.0)'
                    }
                });
                const $ = cheerio.load(response.data);
                // Nettoyer le contenu
                $('script, style, nav, header, footer, .cookie-banner, .advertisement').remove();
                const content = $('body').text().replace(/\s+/g, ' ').trim();
                const title = $('title').text() || $('h1').first().text() || 'No Title';
                const crawledContent = {
                    url: currentUrl,
                    content,
                    title,
                    html: response.data
                };
                crawledPages.push(crawledContent);
                // Sauvegarder dans le dossier temporaire
                const filename = `page_${i + 1}_${currentUrl.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
                await fs.writeFile(path.join(tempDirPath, filename), JSON.stringify(crawledContent, null, 2));
                // Extraire de nouveaux liens pour continuer le crawl
                if (crawledPages.length < this.MAX_PAGES_TO_CRAWL) {
                    $('a[href]').each((_, element) => {
                        const href = $(element).attr('href');
                        if (href) {
                            try {
                                const fullUrl = new URL(href, currentUrl).href;
                                if (fullUrl.startsWith(baseUrl) && !visitedUrls.has(fullUrl)) {
                                    urlsToVisit.push(fullUrl);
                                }
                            }
                            catch {
                                // Ignorer les URLs malformées
                            }
                        }
                    });
                }
            }
            catch (error) {
                console.error(`Erreur lors du crawl de ${currentUrl}:`, error);
            }
        }
        return {
            tempDirPath,
            crawledPages
        };
    }
    /**
     * Étape 3 : Extraction des liens des réseaux sociaux avec validation
     */
    static async extractSocialLinks(crawledPages, tool) {
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
        };
        const socialLinks = {};
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
                            if (socialLinks[platform])
                                break;
                        }
                    }
                }
            }
        }
        return socialLinks;
    }
    /**
     * Génère des mots-clés de validation pour l'outil
     */
    static generateValidationKeywords(tool) {
        const keywords = [];
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
            }
            catch {
                // Ignorer les URLs malformées
            }
        }
        return keywords;
    }
    /**
     * Valide qu'un lien social est vraiment lié à l'outil
     */
    static validateSocialLink(link, validationKeywords, platform) {
        const linkLower = link.toLowerCase();
        // Rejeter les liens génériques ou de platforms
        const genericPatterns = [
            'github.com/github',
            'facebook.com/facebook',
            'twitter.com/twitter',
            'instagram.com/instagram',
            'linkedin.com/company/linkedin',
            'discord.com/discord',
            'tiktok.com/@tiktok'
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
     * Étape 4 : Extraction des liens utiles
     */
    static async extractUsefulLinks(crawledPages) {
        const usefulLinks = {};
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
        };
        for (const page of crawledPages) {
            const combinedContent = `${page.content} ${page.html}`;
            // Email
            if (!usefulLinks.mailAddress) {
                for (const pattern of patterns.mailAddress) {
                    const matches = combinedContent.match(pattern);
                    if (matches && matches.length > 0) {
                        usefulLinks.mailAddress = matches[0].replace('mailto:', '');
                        break;
                    }
                }
            }
            // Documentation
            if (!usefulLinks.docsLink) {
                for (const pattern of patterns.docsLink) {
                    const matches = combinedContent.match(pattern);
                    if (matches && matches.length > 0) {
                        usefulLinks.docsLink = matches[0].replace(/href=["']/, '').replace(/["'].*/, '');
                        break;
                    }
                }
            }
            // Liens d'affiliation
            if (!usefulLinks.affiliateLink) {
                for (const pattern of patterns.affiliateLink) {
                    const matches = combinedContent.match(pattern);
                    if (matches && matches.length > 0) {
                        usefulLinks.affiliateLink = matches[0].replace(/href=["']/, '').replace(/["'].*/, '');
                        break;
                    }
                }
            }
            // Changelog
            if (!usefulLinks.changelogLink) {
                for (const pattern of patterns.changelogLink) {
                    const matches = combinedContent.match(pattern);
                    if (matches && matches.length > 0) {
                        usefulLinks.changelogLink = matches[0].replace(/href=["']/, '').replace(/["'].*/, '');
                        break;
                    }
                }
            }
        }
        return usefulLinks;
    }
    /**
     * Étape 5 : Génération de contenu avec IA Gemini
     */
    static async generateToolContent(tool, crawledPages) {
        try {
            if (!this.ai) {
                console.log('⚠️ Gemini API non disponible, utilisation du fallback');
                return this.generateFallbackContent(tool);
            }
            // Préparer le contenu crawlé pour l'IA
            const crawledContent = crawledPages.map(page => `
=== ${page.title} (${page.url}) ===
${page.content.substring(0, 2000)}...
`).join('\n');
            // Prompt optimisé pour Gemini
            const prompt = `Tu es un journaliste passionné de Tools IA et de technologies, tu as 28 ans et tu aimes parler directement à ton audience tout en la respectant et en portant beaucoup d'attention à la qualité et la clarté de l'information que tu donnes. Tu essayes constamment de donner des précisions supplémentaires et exemples pour creuser plus profondément les sujets.

Voici un lot de plusieurs pages web concernant l'outil ${tool.toolName}, je veux que tu m'écrives un article qui explique ce qu'est cet outil, à quoi il sert et pourquoi quelqu'un aimerait s'en servir. Je veux également que tu donnes des raisons pour lesquelles cet outil n'est pas le plus intéressant, si jamais tu en trouves. Tu n'as pas besoin de suivre ce brief à la lettre.

Je veux que tu écrives minimum 300 mots répartis dans au moins 3 parties et pouvant aller jusqu'à 6. Utilise des titres H2 et utilise toujours "What's ${tool.toolName}?" pour le premier titre, pour les autres titres je te laisse choisir.

Outil à analyser: ${tool.toolName}
Catégorie: ${tool.toolCategory || 'Non définie'}
URL: ${tool.toolLink}

Contenu des pages crawlées :
${crawledContent}

Rédige l'article maintenant en format markdown avec des titres H2 :`;
            // Tentative avec les modèles Gemini (avec fallback)
            return await this.callGeminiWithFallback(prompt);
        }
        catch (error) {
            console.error('❌ Erreur génération contenu Gemini:', error.message);
            return this.generateFallbackContent(tool);
        }
    }
    /**
     * Appel Gemini avec système de fallback entre modèles
     */
    static async callGeminiWithFallback(prompt) {
        if (!this.ai) {
            throw new Error('Gemini API non disponible');
        }
        let lastError = null;
        // Essayer chaque modèle
        for (const modelName of this.GEMINI_MODELS) {
            try {
                console.log(`🔄 Tentative avec modèle: ${modelName}`);
                const model = this.ai.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.9,
                        topK: 50,
                        maxOutputTokens: 4096
                    }
                });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                if (!text || text.length < 200) {
                    throw new Error('Réponse trop courte ou vide');
                }
                console.log(`✅ Contenu généré avec succès par ${modelName} (${text.length} caractères)`);
                return text;
            }
            catch (error) {
                lastError = error;
                console.log(`❌ Échec avec ${modelName}: ${error.message}`);
                // Attendre avant d'essayer le modèle suivant
                if (error.message.includes('overloaded') || error.message.includes('rate limit')) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        throw lastError || new Error('Tous les modèles Gemini ont échoué');
    }
    /**
     * Contenu de fallback si Gemini échoue
     */
    static generateFallbackContent(tool) {
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
    static async cleanupTempDirectory(tempDirPath) {
        try {
            await fs.rm(tempDirPath, { recursive: true, force: true });
        }
        catch (error) {
            console.error(`Erreur lors du nettoyage de ${tempDirPath}:`, error);
        }
    }
    /**
     * Processus complet de mise à jour d'un outil
     */
    static async updateToolContent(toolId, testMode = true) {
        const result = {
            toolId,
            toolName: '',
            status: 'failed',
            step: 'http_check',
            errors: []
        };
        try {
            // Récupérer l'outil
            const tool = await prisma.tool.findUnique({
                where: { id: toolId }
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
                await prisma.tool.update({
                    where: { id: toolId },
                    data: {
                        ...socialLinks,
                        updatedAt: new Date()
                    }
                });
            }
            // Étape 4 : Extraction liens utiles
            result.step = 'useful_links';
            console.log(`🔗 Étape 4: Extraction des liens utiles...`);
            const usefulLinks = await this.extractUsefulLinks(crawlResult.crawledPages);
            result.usefulLinks = usefulLinks;
            if (!testMode) {
                await prisma.tool.update({
                    where: { id: toolId },
                    data: {
                        ...usefulLinks,
                        updatedAt: new Date()
                    }
                });
            }
            // Étape 5 : Génération de contenu
            result.step = 'content_generation';
            console.log(`✍️ Étape 5: Génération de contenu...`);
            const generatedContent = await this.generateToolContent(tool, crawlResult.crawledPages);
            result.generatedContent = generatedContent;
            if (!testMode) {
                await prisma.tool.update({
                    where: { id: toolId },
                    data: {
                        toolDescription: generatedContent,
                        updatedAt: new Date(),
                        last_optimized_at: new Date()
                    }
                });
            }
            // Nettoyage
            await this.cleanupTempDirectory(crawlResult.tempDirPath);
            result.status = 'success';
            result.step = 'completed';
            console.log(`✅ Mise à jour complète pour ${tool.toolName}`);
            return result;
        }
        catch (error) {
            result.errors?.push(error.message || 'Erreur inconnue');
            console.error(`❌ Erreur lors de la mise à jour de l'outil ${toolId}:`, error);
            return result;
        }
    }
    /**
     * Traiter plusieurs outils en batch
     */
    static async updateMultipleTools(toolIds, testMode = true) {
        const results = [];
        for (const toolId of toolIds) {
            console.log(`\n🚀 Traitement de l'outil ${toolId}...`);
            const result = await this.updateToolContent(toolId, testMode);
            results.push(result);
            // Pause entre les outils pour éviter la surcharge
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        return results;
    }
}
_a = ToolContentUpdaterService;
ToolContentUpdaterService.TEMP_DIR_PREFIX = 'temporary.';
ToolContentUpdaterService.MAX_PAGES_TO_CRAWL = 50;
ToolContentUpdaterService.REQUEST_TIMEOUT = 10000;
ToolContentUpdaterService.CRAWL_DELAY = 1000; // Délai entre les requêtes en ms
// Configuration Gemini API (même que le système existant)
ToolContentUpdaterService.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
ToolContentUpdaterService.GEMINI_MODELS = [
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-1.5-pro-002',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
];
ToolContentUpdaterService.ai = _a.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: _a.GEMINI_API_KEY }) : null;
