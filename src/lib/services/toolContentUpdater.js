"use strict";
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolContentUpdaterService = void 0;
var client_1 = require("../database/client");
var fs = require("fs/promises");
var path = require("path");
var axios_1 = require("axios");
var cheerio = require("cheerio");
var genai_1 = require("@google/genai");
var puppeteer_1 = require("puppeteer");
var ToolContentUpdaterService = /** @class */ (function () {
    function ToolContentUpdaterService() {
    }
    /**
     * Étape 1 : Test HTTP Status et validation de l'URL
     */
    ToolContentUpdaterService.checkHttpStatus = function (tool) {
        return __awaiter(this, void 0, void 0, function () {
            var response, httpStatusCode, isActive, updatedTool, error_1, httpStatusCode, updatedTool;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 5]);
                        return [4 /*yield*/, axios_1.default.get(tool.toolLink, {
                                timeout: this.REQUEST_TIMEOUT,
                                maxRedirects: 5,
                                validateStatus: function (status) { return status < 600; } // Accepter tous les codes < 600
                            })];
                    case 1:
                        response = _e.sent();
                        httpStatusCode = response.status;
                        isActive = httpStatusCode >= 200 && httpStatusCode < 400;
                        // Mise à jour dans la DB via Prisma
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: HTTP ".concat(httpStatusCode, ", isActive: ").concat(isActive));
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: tool.id },
                                data: {
                                    httpStatusCode: httpStatusCode,
                                    isActive: isActive,
                                    lastCheckedAt: new Date(),
                                    updatedAt: new Date()
                                }
                            })];
                    case 2:
                        updatedTool = _e.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Tool ID: ".concat(updatedTool.id, ", HTTP: ").concat(updatedTool.httpStatusCode, ", Active: ").concat(updatedTool.isActive));
                        return [2 /*return*/, {
                                httpStatusCode: httpStatusCode,
                                isActive: isActive,
                                redirectUrl: ((_b = response.request.res) === null || _b === void 0 ? void 0 : _b.responseUrl) !== tool.toolLink ? (_c = response.request.res) === null || _c === void 0 ? void 0 : _c.responseUrl : undefined
                            }];
                    case 3:
                        error_1 = _e.sent();
                        httpStatusCode = ((_d = error_1.response) === null || _d === void 0 ? void 0 : _d.status) || 0;
                        console.log("\u274C Erreur HTTP: ".concat(error_1.message, ", Code: ").concat(httpStatusCode));
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: HTTP ".concat(httpStatusCode, ", isActive: false (\u00E9chec)"));
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: tool.id },
                                data: {
                                    httpStatusCode: httpStatusCode,
                                    isActive: false,
                                    lastCheckedAt: new Date(),
                                    updatedAt: new Date()
                                }
                            })];
                    case 4:
                        updatedTool = _e.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Tool ID: ".concat(updatedTool.id, ", HTTP: ").concat(updatedTool.httpStatusCode, ", Active: ").concat(updatedTool.isActive, " (outil marqu\u00E9 inactif)"));
                        return [2 /*return*/, {
                                httpStatusCode: httpStatusCode,
                                isActive: false
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Étape 1.5 : Capture d'écran de la page d'accueil
     */
    ToolContentUpdaterService.captureScreenshot = function (tool) {
        return __awaiter(this, void 0, void 0, function () {
            var browser, publicImagesDir, error_2, sanitizedName, screenshotPath, relativeScreenshotPath, page, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        browser = null;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 13, 14, 17]);
                        console.log("\uD83D\uDCF8 Capture d'\u00E9cran de ".concat(tool.toolLink, "..."));
                        publicImagesDir = path.join(process.cwd(), 'public', 'images', 'tools');
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, fs.mkdir(publicImagesDir, { recursive: true })];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        sanitizedName = tool.toolName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                        screenshotPath = path.join(publicImagesDir, "".concat(sanitizedName, ".webp"));
                        relativeScreenshotPath = "/images/tools/".concat(sanitizedName, ".webp");
                        return [4 /*yield*/, puppeteer_1.default.launch({
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
                            })];
                    case 6:
                        // Lancer Puppeteer
                        browser = _b.sent();
                        return [4 /*yield*/, browser.newPage()
                            // Configuration de la page
                        ];
                    case 7:
                        page = _b.sent();
                        // Configuration de la page
                        return [4 /*yield*/, page.setViewport({ width: 1200, height: 800 })];
                    case 8:
                        // Configuration de la page
                        _b.sent();
                        return [4 /*yield*/, page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
                            // Navigation vers la page
                        ];
                    case 9:
                        _b.sent();
                        // Navigation vers la page
                        return [4 /*yield*/, page.goto(tool.toolLink, {
                                waitUntil: 'networkidle2',
                                timeout: 30000
                            })
                            // Attendre 5 secondes comme demandé
                        ];
                    case 10:
                        // Navigation vers la page
                        _b.sent();
                        // Attendre 5 secondes comme demandé
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })
                            // Prendre la capture d'écran en format WebP
                        ];
                    case 11:
                        // Attendre 5 secondes comme demandé
                        _b.sent();
                        // Prendre la capture d'écran en format WebP
                        return [4 /*yield*/, page.screenshot({
                                path: screenshotPath,
                                type: 'webp',
                                quality: 80,
                                fullPage: false // Seulement la partie visible
                            })];
                    case 12:
                        // Prendre la capture d'écran en format WebP
                        _b.sent();
                        console.log("\u2705 Screenshot sauvegard\u00E9: ".concat(relativeScreenshotPath));
                        return [2 /*return*/, relativeScreenshotPath];
                    case 13:
                        error_3 = _b.sent();
                        console.error("\u274C Erreur capture d'\u00E9cran: ".concat(error_3.message));
                        return [2 /*return*/, null];
                    case 14:
                        if (!browser) return [3 /*break*/, 16];
                        return [4 /*yield*/, browser.close()];
                    case 15:
                        _b.sent();
                        _b.label = 16;
                    case 16: return [7 /*endfinally*/];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Étape 2 : Crawling des 50 premières pages
     */
    ToolContentUpdaterService.crawlToolPages = function (tool) {
        return __awaiter(this, void 0, void 0, function () {
            var sanitizedName, tempDirPath, error_4, crawledPages, urlsToVisit, visitedUrls, baseUrl, crawlStopReason, newLinksFound, errorCount, _loop_1, this_1, i;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sanitizedName = tool.toolName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                        tempDirPath = path.join(process.cwd(), "".concat(this.TEMP_DIR_PREFIX).concat(sanitizedName));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.mkdir(tempDirPath, { recursive: true })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        crawledPages = [];
                        urlsToVisit = [tool.toolLink];
                        visitedUrls = new Set();
                        baseUrl = new URL(tool.toolLink).origin;
                        crawlStopReason = '';
                        newLinksFound = 0;
                        errorCount = 0;
                        _loop_1 = function (i) {
                            var currentUrl, response, $_1, content, title, crawledContent, filename, linksBefore, linksAfter, newLinks, error_5;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        currentUrl = urlsToVisit.shift();
                                        if (visitedUrls.has(currentUrl)) {
                                            console.log("\u23ED\uFE0F  Page ".concat(i + 1, ": URL d\u00E9j\u00E0 visit\u00E9e, passage \u00E0 la suivante"));
                                            return [2 /*return*/, "continue"];
                                        }
                                        visitedUrls.add(currentUrl);
                                        console.log("\uD83D\uDD0D Page ".concat(i + 1, "/").concat(this_1.MAX_PAGES_TO_CRAWL, ": Crawl de ").concat(currentUrl));
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 5, , 6]);
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, _this.CRAWL_DELAY); })];
                                    case 2:
                                        _c.sent();
                                        return [4 /*yield*/, axios_1.default.get(currentUrl, {
                                                timeout: this_1.REQUEST_TIMEOUT,
                                                headers: {
                                                    'User-Agent': 'Mozilla/5.0 (compatible; VideoIA-Bot/1.0)'
                                                }
                                            })];
                                    case 3:
                                        response = _c.sent();
                                        $_1 = cheerio.load(response.data);
                                        // Nettoyer le contenu
                                        $_1('script, style, nav, header, footer, .cookie-banner, .advertisement').remove();
                                        content = $_1('body').text().replace(/\s+/g, ' ').trim();
                                        title = $_1('title').text() || $_1('h1').first().text() || 'No Title';
                                        crawledContent = {
                                            url: currentUrl,
                                            content: content,
                                            title: title,
                                            html: response.data
                                        };
                                        crawledPages.push(crawledContent);
                                        filename = "page_".concat(i + 1, "_").concat(currentUrl.replace(/[^a-zA-Z0-9]/g, '_'), ".json");
                                        return [4 /*yield*/, fs.writeFile(path.join(tempDirPath, filename), JSON.stringify(crawledContent, null, 2))];
                                    case 4:
                                        _c.sent();
                                        console.log("\u2705 Page ".concat(i + 1, " crawl\u00E9e: \"").concat(title, "\" (").concat(content.length, " caract\u00E8res)"));
                                        // Extraire de nouveaux liens pour continuer le crawl
                                        if (crawledPages.length < this_1.MAX_PAGES_TO_CRAWL) {
                                            linksBefore = urlsToVisit.length;
                                            $_1('a[href]').each(function (_, element) {
                                                var href = $_1(element).attr('href');
                                                if (href) {
                                                    try {
                                                        var fullUrl = new URL(href, currentUrl).href;
                                                        if (fullUrl.startsWith(baseUrl) && !visitedUrls.has(fullUrl) && !urlsToVisit.includes(fullUrl)) {
                                                            urlsToVisit.push(fullUrl);
                                                        }
                                                    }
                                                    catch (_b) {
                                                        // Ignorer les URLs malformées
                                                    }
                                                }
                                            });
                                            linksAfter = urlsToVisit.length;
                                            newLinks = linksAfter - linksBefore;
                                            newLinksFound += newLinks;
                                            console.log("\uD83D\uDD17 ".concat(newLinks, " nouveaux liens trouv\u00E9s sur cette page"));
                                        }
                                        return [3 /*break*/, 6];
                                    case 5:
                                        error_5 = _c.sent();
                                        errorCount++;
                                        console.error("\u274C Erreur lors du crawl de ".concat(currentUrl, ": ").concat(error_5.message));
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _b.label = 5;
                    case 5:
                        if (!(i < this.MAX_PAGES_TO_CRAWL && urlsToVisit.length > 0)) return [3 /*break*/, 8];
                        return [5 /*yield**/, _loop_1(i)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        // Analyser pourquoi on n'a pas atteint 50 pages
                        if (crawledPages.length < this.MAX_PAGES_TO_CRAWL) {
                            if (urlsToVisit.length === 0) {
                                crawlStopReason = "Plus de liens internes \u00E0 crawler (".concat(newLinksFound, " liens d\u00E9couverts au total)");
                            }
                            else if (errorCount > crawledPages.length / 2) {
                                crawlStopReason = "Trop d'erreurs de crawl (".concat(errorCount, " erreurs)");
                            }
                            else {
                                crawlStopReason = "Structure du site limit\u00E9e (".concat(crawledPages.length, " pages accessibles)");
                            }
                            console.log("\u26A0\uFE0F  Crawling arr\u00EAt\u00E9 \u00E0 ".concat(crawledPages.length, "/").concat(this.MAX_PAGES_TO_CRAWL, " pages"));
                            console.log("\uD83D\uDCDD Raison: ".concat(crawlStopReason));
                            console.log("\uD83D\uDCCA Statistiques: ".concat(newLinksFound, " liens d\u00E9couverts, ").concat(errorCount, " erreurs, ").concat(visitedUrls.size, " URLs visit\u00E9es"));
                        }
                        else {
                            console.log("\uD83C\uDFAF Crawling complet: ".concat(this.MAX_PAGES_TO_CRAWL, "/").concat(this.MAX_PAGES_TO_CRAWL, " pages crawl\u00E9es"));
                        }
                        return [2 /*return*/, {
                                tempDirPath: tempDirPath,
                                crawledPages: crawledPages
                            }];
                }
            });
        });
    };
    /**
     * Valide les liens extraits avec Gemini AI
     */
    ToolContentUpdaterService.validateLinksWithGemini = function (links, tool, linkType) {
        return __awaiter(this, void 0, void 0, function () {
            var linksText, prompt_1, validatedResponse, jsonMatch, validatedLinks, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.ai || !links || Object.keys(links).length === 0) {
                            return [2 /*return*/, links];
                        }
                        linksText = Object.entries(links)
                            .map(function (_b) {
                            var key = _b[0], value = _b[1];
                            return "".concat(key, ": ").concat(value);
                        })
                            .join('\n');
                        prompt_1 = "You are a link validation expert. I need you to validate if the following ".concat(linkType, " links are actually related to the tool \"").concat(tool.toolName, "\" (URL: ").concat(tool.toolLink, ").\n\nTool to validate: ").concat(tool.toolName, "\nTool URL: ").concat(tool.toolLink, "\nTool Category: ").concat(tool.toolCategory || 'Unknown', "\n\n").concat(linkType === 'social' ? 'Social media' : 'Useful', " links found:\n").concat(linksText, "\n\nIMPORTANT: \n- Remove any generic links (like \"github.com/github\", \"fonts.googleapis.com\", \"docs.github.com\" for general GitHub docs)\n- Keep only links that are SPECIFICALLY related to \"").concat(tool.toolName, "\"\n- For social links, they must be the actual social profiles of this tool/company\n- For useful links, they must be specific documentation, affiliates, or contact info for this tool\n\nRespond ONLY with a JSON object containing the validated links. Remove any invalid/generic links completely.\nExample format:\n{\n  \"socialLinkedin\": \"linkedin.com/company/specific-tool-company\",\n  \"docsLink\": \"https://specific-tool-docs.com/api\"\n}\n\nIf no links are valid, return an empty object: {}");
                        return [4 /*yield*/, this.callGeminiWithFallback(prompt_1)];
                    case 1:
                        validatedResponse = _b.sent();
                        try {
                            jsonMatch = validatedResponse.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                validatedLinks = JSON.parse(jsonMatch[0]);
                                console.log("\uD83E\uDD16 Gemini validation: ".concat(Object.keys(links).length, " -> ").concat(Object.keys(validatedLinks).length, " links"));
                                return [2 /*return*/, validatedLinks];
                            }
                        }
                        catch (parseError) {
                            console.log('⚠️ Erreur parsing validation Gemini, conservation des liens originaux');
                        }
                        return [2 /*return*/, links];
                    case 2:
                        error_6 = _b.sent();
                        console.log("\u26A0\uFE0F Erreur validation Gemini (".concat(linkType, "): ").concat(error_6.message));
                        return [2 /*return*/, links];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Étape 3 : Extraction des liens des réseaux sociaux avec validation
     */
    ToolContentUpdaterService.extractSocialLinks = function (crawledPages, tool) {
        return __awaiter(this, void 0, void 0, function () {
            var socialPatterns, socialLinks, validationKeywords, _i, crawledPages_1, page, combinedContent, _b, _c, _d, platform, patterns, _e, patterns_1, pattern, matches, _f, matches_1, match, validatedSocialLinks;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        socialPatterns = {
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
                        socialLinks = {};
                        validationKeywords = this.generateValidationKeywords(tool);
                        for (_i = 0, crawledPages_1 = crawledPages; _i < crawledPages_1.length; _i++) {
                            page = crawledPages_1[_i];
                            combinedContent = "".concat(page.content, " ").concat(page.html);
                            for (_b = 0, _c = Object.entries(socialPatterns); _b < _c.length; _b++) {
                                _d = _c[_b], platform = _d[0], patterns = _d[1];
                                if (!socialLinks[platform]) {
                                    for (_e = 0, patterns_1 = patterns; _e < patterns_1.length; _e++) {
                                        pattern = patterns_1[_e];
                                        matches = combinedContent.match(pattern);
                                        if (matches) {
                                            // Valider chaque match trouvé
                                            for (_f = 0, matches_1 = matches; _f < matches_1.length; _f++) {
                                                match = matches_1[_f];
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
                        // Validation avec Gemini AI
                        console.log("\uD83E\uDD16 Validation Gemini des ".concat(Object.keys(socialLinks).length, " liens sociaux..."));
                        return [4 /*yield*/, this.validateLinksWithGemini(socialLinks, tool, 'social')];
                    case 1:
                        validatedSocialLinks = _g.sent();
                        return [2 /*return*/, validatedSocialLinks];
                }
            });
        });
    };
    /**
     * Génère des mots-clés de validation pour l'outil
     */
    ToolContentUpdaterService.generateValidationKeywords = function (tool) {
        var keywords = [];
        // Nom de l'outil (sans espaces, en minuscules)
        if (tool.toolName) {
            keywords.push(tool.toolName.toLowerCase().replace(/\s+/g, ''));
            keywords.push(tool.toolName.toLowerCase().replace(/\s+/g, '-'));
            keywords.push(tool.toolName.toLowerCase().replace(/\s+/g, '_'));
            // Variations du nom
            var nameParts = tool.toolName.toLowerCase().split(/\s+/);
            if (nameParts.length > 1) {
                keywords.push.apply(keywords, nameParts);
            }
        }
        // Extraire l'organisation/auteur depuis l'URL GitHub s'il y en a une
        if (tool.toolLink && tool.toolLink.includes('github.com')) {
            var githubMatch = tool.toolLink.match(/github\.com\/([^\/]+)/i);
            if (githubMatch && githubMatch[1]) {
                keywords.push(githubMatch[1].toLowerCase());
            }
        }
        // Extraire le domaine principal de l'URL
        if (tool.toolLink) {
            try {
                var url = new URL(tool.toolLink);
                var domain = url.hostname.replace('www.', '');
                var domainParts = domain.split('.');
                if (domainParts.length >= 2) {
                    keywords.push(domainParts[0].toLowerCase()); // ex: "cassetteai" de "cassetteai.com"
                }
            }
            catch (_b) {
                // Ignorer les URLs malformées
            }
        }
        return keywords;
    };
    /**
     * Valide qu'un lien social est vraiment lié à l'outil
     */
    ToolContentUpdaterService.validateSocialLink = function (link, validationKeywords, platform) {
        var linkLower = link.toLowerCase();
        // Rejeter les liens génériques ou de platforms
        var genericPatterns = [
            'github.com/github',
            'facebook.com/facebook',
            'twitter.com/twitter',
            'instagram.com/instagram',
            'linkedin.com/company/linkedin',
            'discord.com/discord',
            'tiktok.com/@tiktok'
        ];
        if (genericPatterns.some(function (generic) { return linkLower.includes(generic); })) {
            return false;
        }
        // Vérifier si le lien contient un des mots-clés de validation
        for (var _i = 0, validationKeywords_1 = validationKeywords; _i < validationKeywords_1.length; _i++) {
            var keyword = validationKeywords_1[_i];
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
    };
    /**
     * Étape 4 : Extraction des liens utiles
     */
    ToolContentUpdaterService.extractUsefulLinks = function (crawledPages, tool) {
        return __awaiter(this, void 0, void 0, function () {
            var usefulLinks, patterns, _i, crawledPages_2, page, combinedContent, _b, _c, pattern, matches, _d, _e, pattern, matches, _f, _g, pattern, matches, _h, _j, pattern, matches, validatedUsefulLinks;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        usefulLinks = {};
                        patterns = {
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
                        for (_i = 0, crawledPages_2 = crawledPages; _i < crawledPages_2.length; _i++) {
                            page = crawledPages_2[_i];
                            combinedContent = "".concat(page.content, " ").concat(page.html);
                            // Email
                            if (!usefulLinks.mailAddress) {
                                for (_b = 0, _c = patterns.mailAddress; _b < _c.length; _b++) {
                                    pattern = _c[_b];
                                    matches = combinedContent.match(pattern);
                                    if (matches && matches.length > 0) {
                                        usefulLinks.mailAddress = matches[0].replace('mailto:', '');
                                        break;
                                    }
                                }
                            }
                            // Documentation
                            if (!usefulLinks.docsLink) {
                                for (_d = 0, _e = patterns.docsLink; _d < _e.length; _d++) {
                                    pattern = _e[_d];
                                    matches = combinedContent.match(pattern);
                                    if (matches && matches.length > 0) {
                                        usefulLinks.docsLink = matches[0].replace(/href=["']/, '').replace(/["'].*/, '');
                                        break;
                                    }
                                }
                            }
                            // Liens d'affiliation
                            if (!usefulLinks.affiliateLink) {
                                for (_f = 0, _g = patterns.affiliateLink; _f < _g.length; _f++) {
                                    pattern = _g[_f];
                                    matches = combinedContent.match(pattern);
                                    if (matches && matches.length > 0) {
                                        usefulLinks.affiliateLink = matches[0].replace(/href=["']/, '').replace(/["'].*/, '');
                                        break;
                                    }
                                }
                            }
                            // Changelog
                            if (!usefulLinks.changelogLink) {
                                for (_h = 0, _j = patterns.changelogLink; _h < _j.length; _h++) {
                                    pattern = _j[_h];
                                    matches = combinedContent.match(pattern);
                                    if (matches && matches.length > 0) {
                                        usefulLinks.changelogLink = matches[0].replace(/href=["']/, '').replace(/["'].*/, '');
                                        break;
                                    }
                                }
                            }
                        }
                        // Validation avec Gemini AI
                        console.log("\uD83E\uDD16 Validation Gemini des ".concat(Object.keys(usefulLinks).length, " liens utiles..."));
                        return [4 /*yield*/, this.validateLinksWithGemini(usefulLinks, tool, 'useful')];
                    case 1:
                        validatedUsefulLinks = _k.sent();
                        return [2 /*return*/, validatedUsefulLinks];
                }
            });
        });
    };
    /**
     * Étape 5 : Génération de contenu avec IA Gemini
     */
    ToolContentUpdaterService.generateToolContent = function (tool, crawledPages) {
        return __awaiter(this, void 0, void 0, function () {
            var crawledContent, prompt_2, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.ai) {
                            console.log('⚠️ Gemini API non disponible, utilisation du fallback');
                            return [2 /*return*/, this.generateFallbackContent(tool)];
                        }
                        crawledContent = crawledPages.map(function (page) { return "\n=== ".concat(page.title, " (").concat(page.url, ") ===\n").concat(page.content.substring(0, 2000), "...\n"); }).join('\n');
                        prompt_2 = "You are a passionate journalist specializing in AI Tools and technologies. You are 28 years old and you love speaking directly to your audience while respecting them and paying great attention to the quality and clarity of the information you provide. You constantly try to give additional details and examples to dig deeper into topics.\n\nHere is a collection of several web pages about the tool ".concat(tool.toolName, ". I want you to write an article that explains what this tool is, what it's used for, and why someone would want to use it. I also want you to give reasons why this tool might not be the most interesting option, if you find any. You don't need to follow this brief to the letter.\n\nI want you to write a minimum of 300 words divided into at least 3 parts and up to 6 parts. Use H2 titles and always use \"What's ").concat(tool.toolName, "?\" for the first title. For the other titles, you can choose.\n\nIMPORTANT: Write the entire article in ENGLISH.\n\nTool to analyze: ").concat(tool.toolName, "\nCategory: ").concat(tool.toolCategory || 'Undefined', "\nURL: ").concat(tool.toolLink, "\n\nContent from crawled pages:\n").concat(crawledContent, "\n\nWrite the article now in markdown format with H2 titles:");
                        return [4 /*yield*/, this.callGeminiWithFallback(prompt_2)];
                    case 1: 
                    // Tentative avec les modèles Gemini (avec fallback)
                    return [2 /*return*/, _b.sent()];
                    case 2:
                        error_7 = _b.sent();
                        console.error('❌ Erreur génération contenu Gemini:', error_7.message);
                        return [2 /*return*/, this.generateFallbackContent(tool)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Appel Gemini avec système de fallback entre modèles
     */
    ToolContentUpdaterService.callGeminiWithFallback = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var lastError, _i, _b, modelName, genModel, result, text, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.ai) {
                            throw new Error('Gemini API non disponible');
                        }
                        lastError = null;
                        _i = 0, _b = this.GEMINI_MODELS;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        modelName = _b[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 7]);
                        console.log("\uD83D\uDD04 Tentative avec mod\u00E8le: ".concat(modelName));
                        genModel = this.ai.models.generateContent({
                            model: modelName,
                            contents: prompt
                        });
                        return [4 /*yield*/, genModel];
                    case 3:
                        result = _c.sent();
                        text = result.text;
                        if (!text || text.length < 200) {
                            throw new Error('Réponse trop courte ou vide');
                        }
                        console.log("\u2705 Contenu g\u00E9n\u00E9r\u00E9 avec succ\u00E8s par ".concat(modelName, " (").concat(text.length, " caract\u00E8res)"));
                        return [2 /*return*/, text];
                    case 4:
                        error_8 = _c.sent();
                        lastError = error_8;
                        console.log("\u274C \u00C9chec avec ".concat(modelName, ": ").concat(error_8.message));
                        if (!(error_8.message.includes('overloaded') || error_8.message.includes('rate limit'))) return [3 /*break*/, 6];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: throw lastError || new Error('Tous les modèles Gemini ont échoué');
                }
            });
        });
    };
    /**
     * Étape 6 : Génération de l'overview concise avec IA Gemini
     */
    ToolContentUpdaterService.generateToolOverview = function (tool, crawledPages) {
        return __awaiter(this, void 0, void 0, function () {
            var crawledSummary, prompt_3, overviewResponse, cleanOverview, sentences, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.ai) {
                            console.log('⚠️ Gemini API non disponible, utilisation du fallback');
                            return [2 /*return*/, this.generateFallbackOverview(tool)];
                        }
                        crawledSummary = crawledPages.slice(0, 3).map(function (page) {
                            return "".concat(page.title, ": ").concat(page.content.substring(0, 500), "...");
                        }).join('\n\n');
                        prompt_3 = "You are an expert at writing concise tool descriptions. Based on the crawled content below, write a very brief overview of ".concat(tool.toolName, ".\n\nTool: ").concat(tool.toolName, "\nCategory: ").concat(tool.toolCategory || 'AI Tool', "\nURL: ").concat(tool.toolLink, "\n\nCrawled content summary:\n").concat(crawledSummary, "\n\nCRITICAL: Write EXACTLY 2 sentences. No more, no less. Each sentence should be concise and focused. This will be used as a preview in a tools grid on a website.\n\nWrite in ENGLISH only. Be direct and clear. Focus on the tool's primary function.\n\nExample formats:\n- \"Visualizee is an AI-powered rendering tool that converts sketches into realistic 3D visualizations. It helps designers and architects create professional renders in seconds without complex 3D software.\"\n- \"QueryGPT is a NodeJS library for building custom Q&A chatbots using OpenAI's GPT models. It enables developers to create personalized knowledge bases and automated support systems.\"\n\nOverview:");
                        return [4 /*yield*/, this.callGeminiWithFallback(prompt_3)
                            // Nettoyer la réponse
                        ];
                    case 1:
                        overviewResponse = _b.sent();
                        cleanOverview = overviewResponse.replace(/^Overview:?\s*/i, '').trim();
                        if (!cleanOverview || cleanOverview.length < 20) {
                            throw new Error('Réponse overview trop courte');
                        }
                        sentences = cleanOverview.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; });
                        if (sentences.length !== 2) {
                            if (sentences.length === 1) {
                                throw new Error('Overview doit contenir exactement 2 phrases, 1 trouvée');
                            }
                            else {
                                // Prendre exactement 2 phrases
                                cleanOverview = sentences.slice(0, 2).join('. ') + '.';
                            }
                        }
                        else {
                            // S'assurer qu'on a bien les 2 phrases formatées correctement
                            cleanOverview = sentences.join('. ') + '.';
                        }
                        console.log("\u2705 Overview g\u00E9n\u00E9r\u00E9 avec succ\u00E8s (".concat(cleanOverview.length, " caract\u00E8res)"));
                        return [2 /*return*/, cleanOverview];
                    case 2:
                        error_9 = _b.sent();
                        console.error('❌ Erreur génération overview Gemini:', error_9.message);
                        return [2 /*return*/, this.generateFallbackOverview(tool)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Étape 7 : Génération des key features avec IA Gemini
     */
    ToolContentUpdaterService.generateToolKeyFeatures = function (tool, crawledPages) {
        return __awaiter(this, void 0, void 0, function () {
            var crawledContent, prompt_4, featuresResponse, cleanFeatures, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.ai) {
                            console.log('⚠️ Gemini API non disponible, utilisation du fallback');
                            return [2 /*return*/, this.generateFallbackKeyFeatures(tool)];
                        }
                        crawledContent = crawledPages.slice(0, 5).map(function (page) {
                            return "".concat(page.title, ": ").concat(page.content.substring(0, 1000), "...");
                        }).join('\n\n');
                        prompt_4 = "You are an expert at identifying key use cases for tools. Based on the crawled content below, identify the main use cases and problems that ".concat(tool.toolName, " can solve.\n\nTool: ").concat(tool.toolName, "\nCategory: ").concat(tool.toolCategory || 'AI Tool', "\n\nCrawled content:\n").concat(crawledContent, "\n\nIMPORTANT: Create a bullet list of 3-6 key use cases/problems this tool solves. Each bullet should be:\n- Very concise (max 10-15 words)\n- Focus on WHAT problems it solves or WHAT tasks it helps with\n- Be specific and actionable\n- Written in ENGLISH\n\nFormat as markdown bullets like this:\n\u2022 Convert sketches into photorealistic 3D renderings\n\u2022 Generate product visualizations for marketing materials\n\u2022 Create architectural mockups from floor plans\n\nKey Features:");
                        return [4 /*yield*/, this.callGeminiWithFallback(prompt_4)
                            // Nettoyer la réponse et extraire les bullet points
                        ];
                    case 1:
                        featuresResponse = _b.sent();
                        cleanFeatures = featuresResponse.replace(/^Key Features:?\s*/i, '').trim();
                        // S'assurer qu'on a bien des bullet points
                        if (!cleanFeatures.includes('•') && !cleanFeatures.includes('-') && !cleanFeatures.includes('*')) {
                            throw new Error('Pas de bullet points détectés');
                        }
                        // Normaliser les bullet points
                        cleanFeatures = cleanFeatures
                            .replace(/^[*-]/gm, '•')
                            .replace(/^\d+\./gm, '•');
                        console.log("\u2705 Key features g\u00E9n\u00E9r\u00E9es avec succ\u00E8s");
                        return [2 /*return*/, cleanFeatures];
                    case 2:
                        error_10 = _b.sent();
                        console.error('❌ Erreur génération key features Gemini:', error_10.message);
                        return [2 /*return*/, this.generateFallbackKeyFeatures(tool)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Étape 8 : Génération du meta title et meta description avec IA Gemini
     */
    ToolContentUpdaterService.generateToolMeta = function (tool, crawledPages) {
        return __awaiter(this, void 0, void 0, function () {
            var crawledSummary, attempts, maxAttempts, prompt_5, metaResponse, titleMatch, descMatch, metaTitle, metaDescription, error_11, fallbackMeta, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        if (!this.ai) {
                            console.log('⚠️ Gemini API non disponible, utilisation du fallback');
                            return [2 /*return*/, this.generateFallbackMeta(tool)];
                        }
                        crawledSummary = crawledPages.slice(0, 3).map(function (page) {
                            return "".concat(page.title, ": ").concat(page.content.substring(0, 800), "...");
                        }).join('\n\n');
                        attempts = 0;
                        maxAttempts = 5;
                        _b.label = 1;
                    case 1:
                        if (!(attempts < maxAttempts)) return [3 /*break*/, 6];
                        attempts++;
                        console.log("\uD83D\uDD04 Tentative ".concat(attempts, "/").concat(maxAttempts, " pour meta title avec Video-IA.net"));
                        prompt_5 = "You are an SEO expert. Create SEO-optimized meta title and description for ".concat(tool.toolName, ".\n\nTool: ").concat(tool.toolName, "\nCategory: ").concat(tool.toolCategory || 'AI Tool', "\n\nContent summary:\n").concat(crawledSummary, "\n\nCRITICAL REQUIREMENTS:\n1. Meta Title: MUST end with \" - Video-IA.net\" (with space before dash)\n2. Meta Title: MAXIMUM 70 characters INCLUDING the \" - Video-IA.net\" suffix\n3. Meta Description: MAXIMUM 160 characters with call-to-action\n4. Write in ENGLISH only\n\nEXAMPLES of CORRECT format:\nTITLE: Visualizee AI Rendering Tool - Video-IA.net\nDESCRIPTION: Create stunning 3D renders from sketches in seconds. Try Visualizee free today!\n\nYour response MUST follow this EXACT format:\nTITLE: [max 55 chars] - Video-IA.net  \nDESCRIPTION: [max 160 chars with CTA]");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.callGeminiWithFallback(prompt_5)
                            // Extraire title et description
                        ];
                    case 3:
                        metaResponse = _b.sent();
                        titleMatch = metaResponse.match(/TITLE:\s*(.+)/i);
                        descMatch = metaResponse.match(/DESCRIPTION:\s*(.+)/i);
                        if (!titleMatch || !descMatch) {
                            console.log("\u274C Tentative ".concat(attempts, ": Format invalide, retry..."));
                            return [3 /*break*/, 1];
                        }
                        metaTitle = titleMatch[1].trim();
                        metaDescription = descMatch[1].trim().substring(0, 160);
                        // VALIDATION STRICTE : le title doit se terminer par " - Video-IA.net"
                        if (!metaTitle.endsWith(' - Video-IA.net')) {
                            console.log("\u274C Tentative ".concat(attempts, ": Title ne se termine pas par \" - Video-IA.net\", retry..."));
                            return [3 /*break*/, 1];
                        }
                        // Vérifier la longueur
                        if (metaTitle.length > 70) {
                            console.log("\u274C Tentative ".concat(attempts, ": Title trop long (").concat(metaTitle.length, "/70), retry..."));
                            return [3 /*break*/, 1];
                        }
                        // SUCCÈS !
                        console.log("\u2705 Meta title valid\u00E9 avec Video-IA.net (tentative ".concat(attempts, ")"));
                        return [2 /*return*/, { metaTitle: metaTitle, metaDescription: metaDescription }];
                    case 4:
                        error_11 = _b.sent();
                        console.log("\u274C Tentative ".concat(attempts, ": Erreur Gemini, retry..."));
                        if (attempts === maxAttempts)
                            throw error_11;
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 1];
                    case 6:
                        // Si toutes les tentatives échouent, fallback avec correction manuelle
                        console.log('⚠️ Toutes les tentatives échouées, utilisation du fallback avec correction');
                        fallbackMeta = this.generateFallbackMeta(tool);
                        return [2 /*return*/, fallbackMeta];
                    case 7:
                        error_12 = _b.sent();
                        console.error('❌ Erreur génération meta Gemini:', error_12.message);
                        return [2 /*return*/, this.generateFallbackMeta(tool)];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Étape 9 : Génération du pricing model avec IA Gemini
     */
    ToolContentUpdaterService.generateToolPricingModel = function (tool, crawledPages) {
        return __awaiter(this, void 0, void 0, function () {
            var crawledContent, prompt_6, pricingResponse, cleanPricing, validModels, _i, validModels_1, model, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.ai) {
                            console.log('⚠️ Gemini API non disponible, utilisation du fallback');
                            return [2 /*return*/, this.generateFallbackPricingModel(tool)];
                        }
                        crawledContent = crawledPages.slice(0, 5).map(function (page) {
                            return "".concat(page.title, ": ").concat(page.content.substring(0, 1200), "...");
                        }).join('\n\n');
                        prompt_6 = "You are a pricing analysis expert. Based on the crawled content below, determine the pricing model for ".concat(tool.toolName, ".\n\nTool: ").concat(tool.toolName, "\nCategory: ").concat(tool.toolCategory || 'AI Tool', "\nURL: ").concat(tool.toolLink, "\n\nContent from crawled pages:\n").concat(crawledContent, "\n\nIMPORTANT: You must choose EXACTLY ONE pricing model from these options:\n- FREE: The tool is completely free to use\n- FREEMIUM: Free version with premium features available\n- SUBSCRIPTION: Monthly/yearly subscription required\n- ONE_TIME_PAYMENT: One-time purchase required\n- USAGE_BASED: Pay per use/API calls/credits\n- CONTACT_FOR_PRICING: Enterprise/custom pricing\n\nAnalyze the content for:\n- Pricing pages, subscription plans\n- Free trial mentions, free version limits\n- Payment models, billing information\n- Enterprise/contact sales mentions\n\nRespond with ONLY the pricing model name (e.g., \"FREEMIUM\").\n\nPricing Model:");
                        return [4 /*yield*/, this.callGeminiWithFallback(prompt_6)
                            // Nettoyer la réponse et valider
                        ];
                    case 1:
                        pricingResponse = _b.sent();
                        cleanPricing = pricingResponse.replace(/^Pricing Model:?\s*/i, '').trim().toUpperCase();
                        validModels = ['FREE', 'FREEMIUM', 'SUBSCRIPTION', 'ONE_TIME_PAYMENT', 'USAGE_BASED', 'CONTACT_FOR_PRICING'];
                        if (!validModels.includes(cleanPricing)) {
                            // Essayer de détecter le modèle dans la réponse
                            for (_i = 0, validModels_1 = validModels; _i < validModels_1.length; _i++) {
                                model = validModels_1[_i];
                                if (pricingResponse.toUpperCase().includes(model)) {
                                    cleanPricing = model;
                                    break;
                                }
                            }
                            // Si aucun modèle détecté, utiliser FREEMIUM par défaut
                            if (!validModels.includes(cleanPricing)) {
                                cleanPricing = 'FREEMIUM';
                            }
                        }
                        console.log("\u2705 Pricing model d\u00E9tect\u00E9: ".concat(cleanPricing));
                        return [2 /*return*/, cleanPricing];
                    case 2:
                        error_13 = _b.sent();
                        console.error('❌ Erreur génération pricing model Gemini:', error_13.message);
                        return [2 /*return*/, this.generateFallbackPricingModel(tool)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Étape 10 : Génération des use cases avec IA Gemini
     */
    ToolContentUpdaterService.generateToolUseCases = function (tool, crawledPages) {
        return __awaiter(this, void 0, void 0, function () {
            var crawledContent, prompt_7, useCasesResponse, cleanUseCases, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.ai) {
                            console.log('⚠️ Gemini API non disponible, utilisation du fallback');
                            return [2 /*return*/, this.generateFallbackUseCases(tool)];
                        }
                        crawledContent = crawledPages.slice(0, 5).map(function (page) {
                            return "".concat(page.title, ": ").concat(page.content.substring(0, 1000), "...");
                        }).join('\n\n');
                        prompt_7 = "You are an expert at identifying practical use cases for tools. Based on the crawled content below, create specific, factual use cases for ".concat(tool.toolName, ".\n\nTool: ").concat(tool.toolName, "\nCategory: ").concat(tool.toolCategory || 'AI Tool', "\nURL: ").concat(tool.toolLink, "\n\nContent from crawled pages:\n").concat(crawledContent, "\n\nIMPORTANT: Create exactly 3-4 bullet points that show specific, practical examples of what users can do with ").concat(tool.toolName, ". Each bullet should:\n- Start with \"").concat(tool.toolName, " helps you\"\n- Be very factual and specific\n- Give concrete examples of tasks/outputs\n- Be concise (max 15-20 words per bullet)\n- Written in ENGLISH\n\nExamples of good format:\n\u2022 Visualizee helps you convert architectural sketches into photorealistic 3D renderings\n\u2022 Visualizee helps you generate product mockups for marketing campaigns\n\u2022 Visualizee helps you create interior design visualizations from floor plans\n\nUse Cases:");
                        return [4 /*yield*/, this.callGeminiWithFallback(prompt_7)
                            // Nettoyer la réponse
                        ];
                    case 1:
                        useCasesResponse = _b.sent();
                        cleanUseCases = useCasesResponse.replace(/^Use Cases:?\s*/i, '').trim();
                        // Normaliser les bullet points
                        cleanUseCases = cleanUseCases
                            .replace(/^[*-]/gm, '•')
                            .replace(/^\d+\./gm, '•')
                            .replace(/^[\s]*•/gm, '•');
                        // Vérifier qu'on a des bullet points
                        if (!cleanUseCases.includes('•')) {
                            throw new Error('Pas de bullet points détectés dans les use cases');
                        }
                        console.log("\u2705 Use cases g\u00E9n\u00E9r\u00E9s avec succ\u00E8s");
                        return [2 /*return*/, cleanUseCases];
                    case 2:
                        error_14 = _b.sent();
                        console.error('❌ Erreur génération use cases Gemini:', error_14.message);
                        return [2 /*return*/, this.generateFallbackUseCases(tool)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Étape 11 : Génération du target audience avec IA Gemini
     */
    ToolContentUpdaterService.generateToolTargetAudience = function (tool, crawledPages) {
        return __awaiter(this, void 0, void 0, function () {
            var crawledContent, prompt_8, audienceResponse, cleanAudience, sentences, error_15;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.ai) {
                            console.log('⚠️ Gemini API non disponible, utilisation du fallback');
                            return [2 /*return*/, this.generateFallbackTargetAudience(tool)];
                        }
                        crawledContent = crawledPages.slice(0, 5).map(function (page) {
                            return "".concat(page.title, ": ").concat(page.content.substring(0, 1000), "...");
                        }).join('\n\n');
                        prompt_8 = "You are an expert at identifying target audiences for tools. Based on the crawled content below, identify the main target audiences for ".concat(tool.toolName, ".\n\nTool: ").concat(tool.toolName, "\nCategory: ").concat(tool.toolCategory || 'AI Tool', "\nURL: ").concat(tool.toolLink, "\n\nContent from crawled pages:\n").concat(crawledContent, "\n\nIMPORTANT: Write a single paragraph of exactly 3-4 sentences that identifies 2-4 specific target audiences. Each sentence should:\n- Mention a specific professional group or user type\n- Explain WHY this tool is useful for them\n- Reference specific features or capabilities\n- Be very specific to this tool (not generic)\n- Written in ENGLISH\n\nExample format:\n\"").concat(tool.toolName, " is particularly valuable for architects and designers who need to quickly visualize concepts and present ideas to clients. Video game developers can leverage its rapid rendering capabilities to create environmental mockups and prototype visual assets. Marketing professionals benefit from its ability to generate product visualizations for campaigns without expensive 3D software. Real estate developers find it useful for creating property visualizations and marketing materials from basic plans.\"\n\nTarget Audience:");
                        return [4 /*yield*/, this.callGeminiWithFallback(prompt_8)
                            // Nettoyer la réponse
                        ];
                    case 1:
                        audienceResponse = _b.sent();
                        cleanAudience = audienceResponse.replace(/^Target Audience:?\s*/i, '').trim();
                        // Vérifier la longueur et le format paragraphe
                        if (!cleanAudience || cleanAudience.length < 100) {
                            throw new Error('Réponse target audience trop courte');
                        }
                        sentences = cleanAudience.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; });
                        if (sentences.length < 3 || sentences.length > 4) {
                            if (sentences.length > 4) {
                                cleanAudience = sentences.slice(0, 4).join('. ') + '.';
                            }
                            else if (sentences.length < 3) {
                                throw new Error('Target audience doit contenir 3-4 phrases');
                            }
                        }
                        console.log("\u2705 Target audience g\u00E9n\u00E9r\u00E9 avec succ\u00E8s");
                        return [2 /*return*/, cleanAudience];
                    case 2:
                        error_15 = _b.sent();
                        console.error('❌ Erreur génération target audience Gemini:', error_15.message);
                        return [2 /*return*/, this.generateFallbackTargetAudience(tool)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Pricing model de fallback si Gemini échoue
     */
    ToolContentUpdaterService.generateFallbackPricingModel = function (tool) {
        return 'FREEMIUM'; // Modèle le plus courant pour les outils IA
    };
    /**
     * Use cases de fallback si Gemini échoue
     */
    ToolContentUpdaterService.generateFallbackUseCases = function (tool) {
        var _b;
        return "\u2022 ".concat(tool.toolName, " helps you automate repetitive ").concat(((_b = tool.toolCategory) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || 'digital', " tasks\n\u2022 ").concat(tool.toolName, " helps you streamline your workflow processes\n\u2022 ").concat(tool.toolName, " helps you improve productivity and efficiency");
    };
    /**
     * Target audience de fallback si Gemini échoue
     */
    ToolContentUpdaterService.generateFallbackTargetAudience = function (tool) {
        var _b;
        return "".concat(tool.toolName, " is designed for professionals working in ").concat(((_b = tool.toolCategory) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || 'technology', " who need efficient solutions for their daily tasks. Small business owners and entrepreneurs can benefit from its automation capabilities to save time and reduce manual work. Content creators and digital marketers find it useful for streamlining their creative processes. Freelancers and consultants appreciate its ability to enhance productivity and deliver better results to clients.");
    };
    /**
     * Overview de fallback si Gemini échoue
     */
    ToolContentUpdaterService.generateFallbackOverview = function (tool) {
        var _b;
        return "".concat(tool.toolName, " is an innovative AI tool designed for ").concat(((_b = tool.toolCategory) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || 'various tasks', ". It provides automated solutions to streamline workflows and enhance productivity.");
    };
    /**
     * Key features de fallback si Gemini échoue
     */
    ToolContentUpdaterService.generateFallbackKeyFeatures = function (tool) {
        var _b;
        return "\u2022 Automate complex ".concat(((_b = tool.toolCategory) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || 'digital', " tasks\n\u2022 Streamline workflow processes\n\u2022 Provide intelligent solutions");
    };
    /**
     * Meta de fallback si Gemini échoue
     */
    ToolContentUpdaterService.generateFallbackMeta = function (tool) {
        var _b;
        return {
            metaTitle: "".concat(tool.toolName, " - ").concat(tool.toolCategory || 'AI Tool', " - Video-IA.net").substring(0, 70),
            metaDescription: "Discover ".concat(tool.toolName, ", a powerful ").concat(((_b = tool.toolCategory) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || 'AI', " tool. Learn features, use cases and get started today!").substring(0, 160)
        };
    };
    /**
     * Contenu de fallback si Gemini échoue
     */
    ToolContentUpdaterService.generateFallbackContent = function (tool) {
        var _b, _c;
        return "## What's ".concat(tool.toolName, "?\n\n").concat(tool.toolName, " est un outil IA innovant qui transforme la fa\u00E7on dont nous abordons ").concat(((_b = tool.toolCategory) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || 'les tâches numériques', ". Cet outil se distingue par sa capacit\u00E9 \u00E0 automatiser des processus complexes tout en maintenant une interface utilisateur intuitive et accessible.\n\n## Principales fonctionnalit\u00E9s\n\nL'un des atouts majeurs de ").concat(tool.toolName, " r\u00E9side dans ses fonctionnalit\u00E9s avanc\u00E9es qui permettent aux utilisateurs de gagner un temps consid\u00E9rable. L'outil propose une gamme compl\u00E8te d'options personnalisables qui s'adaptent aux besoins sp\u00E9cifiques de chaque utilisateur, qu'il soit d\u00E9butant ou expert.\n\n## Pourquoi choisir ").concat(tool.toolName, "?\n\nCe qui rend ").concat(tool.toolName, " particuli\u00E8rement attrayant, c'est sa capacit\u00E9 \u00E0 simplifier des t\u00E2ches qui prendraient normalement des heures de travail manuel. Les utilisateurs appr\u00E9cient particuli\u00E8rement sa facilit\u00E9 d'int\u00E9gration avec d'autres outils existants et sa courbe d'apprentissage relativement douce.\n\n## Points d'attention\n\nCependant, comme tout outil, ").concat(tool.toolName, " pr\u00E9sente certaines limitations qu'il convient de mentionner. L'outil peut parfois manquer de flexibilit\u00E9 pour des cas d'usage tr\u00E8s sp\u00E9cifiques, et ses fonctionnalit\u00E9s avanc\u00E9es n\u00E9cessitent parfois une p\u00E9riode d'adaptation pour \u00EAtre pleinement ma\u00EEtris\u00E9es.\n\n## Verdict final\n\nEn conclusion, ").concat(tool.toolName, " repr\u00E9sente un excellent choix pour quiconque cherche \u00E0 optimiser son workflow dans le domaine de ").concat(((_c = tool.toolCategory) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || 'la technologie', ". Malgr\u00E9 quelques limitations mineures, ses avantages l'emportent largement sur ses inconv\u00E9nients, en faisant un investissement judicieux pour am\u00E9liorer sa productivit\u00E9.");
    };
    /**
     * Nettoyer le dossier temporaire
     */
    ToolContentUpdaterService.cleanupTempDirectory = function (tempDirPath) {
        return __awaiter(this, void 0, void 0, function () {
            var error_16;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.rm(tempDirPath, { recursive: true, force: true })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_16 = _b.sent();
                        console.error("Erreur lors du nettoyage de ".concat(tempDirPath, ":"), error_16);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Processus complet de mise à jour d'un outil
     */
    ToolContentUpdaterService.updateToolContent = function (toolId_1) {
        return __awaiter(this, arguments, void 0, function (toolId, testMode) {
            var result, tool, httpResult, screenshotPath, updatedTool, crawlResult, socialLinks, updatedTool, usefulLinks, updatedTool, generatedContent, updatedTool, generatedOverview, updatedTool, generatedKeyFeatures, updatedTool, generatedMeta, updatedTool, generatedPricing, updatedTool, generatedUseCases, updatedTool, generatedTargetAudience, updatedTool, error_17;
            var _b, _c;
            if (testMode === void 0) { testMode = true; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        result = {
                            toolId: toolId,
                            toolName: '',
                            status: 'failed',
                            step: 'http_check',
                            errors: []
                        };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 48, , 49]);
                        return [4 /*yield*/, client_1.prisma.tool.findUnique({
                                where: { id: toolId }
                            })];
                    case 2:
                        tool = _d.sent();
                        if (!tool || !tool.toolLink) {
                            (_b = result.errors) === null || _b === void 0 ? void 0 : _b.push('Outil non trouvé ou URL manquante');
                            return [2 /*return*/, result];
                        }
                        result.toolName = tool.toolName;
                        // Étape 1 : Vérification HTTP
                        console.log("\uD83D\uDD0D \u00C9tape 1: Test HTTP pour ".concat(tool.toolName, "..."));
                        return [4 /*yield*/, this.checkHttpStatus(tool)];
                    case 3:
                        httpResult = _d.sent();
                        result.httpStatusCode = httpResult.httpStatusCode;
                        result.isActive = httpResult.isActive;
                        if (!httpResult.isActive) {
                            result.status = 'inactive';
                            result.step = 'http_check';
                            return [2 /*return*/, result];
                        }
                        // Étape 1.5 : Screenshot
                        result.step = 'screenshot';
                        console.log("\uD83D\uDCF8 \u00C9tape 1.5: Capture d'\u00E9cran pour ".concat(tool.toolName, "..."));
                        return [4 /*yield*/, this.captureScreenshot(tool)];
                    case 4:
                        screenshotPath = _d.sent();
                        result.screenshotPath = screenshotPath;
                        if (!screenshotPath) return [3 /*break*/, 8];
                        if (!!testMode) return [3 /*break*/, 6];
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: Screenshot sauvegard\u00E9");
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: toolId },
                                data: {
                                    imageUrl: screenshotPath,
                                    updatedAt: new Date()
                                }
                            })];
                    case 5:
                        updatedTool = _d.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - imageUrl sauvegard\u00E9 pour Tool ID: ".concat(updatedTool.id));
                        console.log("\uD83D\uDCF8 Chemin relatif en DB: ".concat(screenshotPath));
                        return [3 /*break*/, 7];
                    case 6:
                        console.log("\uD83E\uDDEA Mode test: Screenshot cr\u00E9\u00E9 mais non sauvegard\u00E9 en DB");
                        console.log("\uD83D\uDCF8 Screenshot cr\u00E9\u00E9: ".concat(screenshotPath));
                        _d.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        console.log("\u274C \u00C9chec capture screenshot - imageUrl non mis \u00E0 jour");
                        _d.label = 9;
                    case 9:
                        // Étape 2 : Crawling
                        result.step = 'crawling';
                        console.log("\uD83D\uDD77\uFE0F \u00C9tape 2: Crawling des pages pour ".concat(tool.toolName, "..."));
                        return [4 /*yield*/, this.crawlToolPages(tool)];
                    case 10:
                        crawlResult = _d.sent();
                        result.processedPages = crawlResult.crawledPages.length;
                        // Étape 3 : Extraction réseaux sociaux
                        result.step = 'social_extraction';
                        console.log("\uD83C\uDF10 \u00C9tape 3: Extraction des r\u00E9seaux sociaux...");
                        return [4 /*yield*/, this.extractSocialLinks(crawlResult.crawledPages, tool)];
                    case 11:
                        socialLinks = _d.sent();
                        result.socialLinks = socialLinks;
                        if (!!testMode) return [3 /*break*/, 13];
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: ".concat(Object.keys(socialLinks).length, " liens sociaux"));
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: toolId },
                                data: __assign(__assign({}, socialLinks), { updatedAt: new Date() })
                            })];
                    case 12:
                        updatedTool = _d.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Liens sociaux sauvegard\u00E9s pour Tool ID: ".concat(updatedTool.id));
                        return [3 /*break*/, 14];
                    case 13:
                        console.log("\uD83E\uDDEA Mode test: Liens sociaux non sauvegard\u00E9s en DB");
                        _d.label = 14;
                    case 14:
                        // Étape 4 : Extraction liens utiles
                        result.step = 'useful_links';
                        console.log("\uD83D\uDD17 \u00C9tape 4: Extraction des liens utiles...");
                        return [4 /*yield*/, this.extractUsefulLinks(crawlResult.crawledPages, tool)];
                    case 15:
                        usefulLinks = _d.sent();
                        result.usefulLinks = usefulLinks;
                        if (!!testMode) return [3 /*break*/, 17];
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: ".concat(Object.keys(usefulLinks).length, " liens utiles"));
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: toolId },
                                data: __assign(__assign({}, usefulLinks), { updatedAt: new Date() })
                            })];
                    case 16:
                        updatedTool = _d.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Liens utiles sauvegard\u00E9s pour Tool ID: ".concat(updatedTool.id));
                        return [3 /*break*/, 18];
                    case 17:
                        console.log("\uD83E\uDDEA Mode test: Liens utiles non sauvegard\u00E9s en DB");
                        _d.label = 18;
                    case 18:
                        // Étape 5 : Génération de contenu
                        result.step = 'content_generation';
                        console.log("\u270D\uFE0F \u00C9tape 5: G\u00E9n\u00E9ration de contenu...");
                        return [4 /*yield*/, this.generateToolContent(tool, crawlResult.crawledPages)];
                    case 19:
                        generatedContent = _d.sent();
                        result.generatedContent = generatedContent;
                        if (!!testMode) return [3 /*break*/, 21];
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: Description g\u00E9n\u00E9r\u00E9e (".concat(generatedContent.length, " caract\u00E8res)"));
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: toolId },
                                data: {
                                    toolDescription: generatedContent,
                                    updatedAt: new Date()
                                }
                            })];
                    case 20:
                        updatedTool = _d.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Description sauvegard\u00E9e pour Tool ID: ".concat(updatedTool.id));
                        console.log("\uD83D\uDCDD Contenu: ".concat(generatedContent.substring(0, 100), "..."));
                        return [3 /*break*/, 22];
                    case 21:
                        console.log("\uD83E\uDDEA Mode test: Description g\u00E9n\u00E9r\u00E9e non sauvegard\u00E9e en DB");
                        console.log("\uD83D\uDCDD Aper\u00E7u contenu: ".concat(generatedContent.substring(0, 100), "..."));
                        _d.label = 22;
                    case 22:
                        // Étape 6 : Génération de l'overview
                        result.step = 'overview_generation';
                        console.log("\uD83D\uDCDD \u00C9tape 6: G\u00E9n\u00E9ration de l'overview...");
                        return [4 /*yield*/, this.generateToolOverview(tool, crawlResult.crawledPages)];
                    case 23:
                        generatedOverview = _d.sent();
                        result.generatedOverview = generatedOverview;
                        if (!!testMode) return [3 /*break*/, 25];
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: Overview g\u00E9n\u00E9r\u00E9 (".concat(generatedOverview.length, " caract\u00E8res)"));
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: toolId },
                                data: {
                                    overview: generatedOverview,
                                    updatedAt: new Date()
                                }
                            })];
                    case 24:
                        updatedTool = _d.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Overview sauvegard\u00E9 pour Tool ID: ".concat(updatedTool.id));
                        return [3 /*break*/, 26];
                    case 25:
                        console.log("\uD83E\uDDEA Mode test: Overview non sauvegard\u00E9 en DB");
                        console.log("\uD83D\uDCDD Aper\u00E7u overview: ".concat(generatedOverview));
                        _d.label = 26;
                    case 26:
                        // Étape 7 : Génération des key features
                        result.step = 'keyfeatures_generation';
                        console.log("\uD83D\uDD11 \u00C9tape 7: G\u00E9n\u00E9ration des key features...");
                        return [4 /*yield*/, this.generateToolKeyFeatures(tool, crawlResult.crawledPages)];
                    case 27:
                        generatedKeyFeatures = _d.sent();
                        result.generatedKeyFeatures = generatedKeyFeatures;
                        if (!!testMode) return [3 /*break*/, 29];
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: Key features g\u00E9n\u00E9r\u00E9es");
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: toolId },
                                data: {
                                    keyFeatures: generatedKeyFeatures,
                                    updatedAt: new Date()
                                }
                            })];
                    case 28:
                        updatedTool = _d.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Key features sauvegard\u00E9es pour Tool ID: ".concat(updatedTool.id));
                        return [3 /*break*/, 30];
                    case 29:
                        console.log("\uD83E\uDDEA Mode test: Key features non sauvegard\u00E9es en DB");
                        console.log("\uD83D\uDCDD Aper\u00E7u key features: ".concat(generatedKeyFeatures.substring(0, 150), "..."));
                        _d.label = 30;
                    case 30:
                        // Étape 8 : Génération des meta title et description
                        result.step = 'meta_generation';
                        console.log("\uD83C\uDFF7\uFE0F \u00C9tape 8: G\u00E9n\u00E9ration des meta title et description...");
                        return [4 /*yield*/, this.generateToolMeta(tool, crawlResult.crawledPages)];
                    case 31:
                        generatedMeta = _d.sent();
                        result.generatedMetaTitle = generatedMeta.metaTitle;
                        result.generatedMetaDescription = generatedMeta.metaDescription;
                        if (!!testMode) return [3 /*break*/, 33];
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: Meta title et description g\u00E9n\u00E9r\u00E9s");
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: toolId },
                                data: {
                                    metaTitle: generatedMeta.metaTitle,
                                    metaDescription: generatedMeta.metaDescription,
                                    updatedAt: new Date(),
                                    last_optimized_at: new Date()
                                }
                            })];
                    case 32:
                        updatedTool = _d.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Meta donn\u00E9es sauvegard\u00E9es pour Tool ID: ".concat(updatedTool.id));
                        console.log("\uD83D\uDCDD Meta Title: ".concat(generatedMeta.metaTitle));
                        console.log("\uD83D\uDCDD Meta Description: ".concat(generatedMeta.metaDescription));
                        return [3 /*break*/, 34];
                    case 33:
                        console.log("\uD83E\uDDEA Mode test: Meta donn\u00E9es non sauvegard\u00E9es en DB");
                        console.log("\uD83D\uDCDD Meta Title: ".concat(generatedMeta.metaTitle));
                        console.log("\uD83D\uDCDD Meta Description: ".concat(generatedMeta.metaDescription));
                        _d.label = 34;
                    case 34:
                        // Étape 9 : Génération du pricing model
                        result.step = 'pricing_generation';
                        console.log("\uD83D\uDCB0 \u00C9tape 9: G\u00E9n\u00E9ration du pricing model...");
                        return [4 /*yield*/, this.generateToolPricingModel(tool, crawlResult.crawledPages)];
                    case 35:
                        generatedPricing = _d.sent();
                        result.generatedPricingModel = generatedPricing;
                        if (!!testMode) return [3 /*break*/, 37];
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: Pricing model g\u00E9n\u00E9r\u00E9 (".concat(generatedPricing, ")"));
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: toolId },
                                data: {
                                    pricingModel: generatedPricing,
                                    updatedAt: new Date()
                                }
                            })];
                    case 36:
                        updatedTool = _d.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Pricing model sauvegard\u00E9 pour Tool ID: ".concat(updatedTool.id));
                        console.log("\uD83D\uDCB0 Pricing Model: ".concat(generatedPricing));
                        return [3 /*break*/, 38];
                    case 37:
                        console.log("\uD83E\uDDEA Mode test: Pricing model non sauvegard\u00E9 en DB");
                        console.log("\uD83D\uDCB0 Pricing Model: ".concat(generatedPricing));
                        _d.label = 38;
                    case 38:
                        // Étape 10 : Génération des use cases
                        result.step = 'usecases_generation';
                        console.log("\uD83C\uDFAF \u00C9tape 10: G\u00E9n\u00E9ration des use cases...");
                        return [4 /*yield*/, this.generateToolUseCases(tool, crawlResult.crawledPages)];
                    case 39:
                        generatedUseCases = _d.sent();
                        result.generatedUseCases = generatedUseCases;
                        if (!!testMode) return [3 /*break*/, 41];
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: Use cases g\u00E9n\u00E9r\u00E9s");
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: toolId },
                                data: {
                                    useCases: generatedUseCases,
                                    updatedAt: new Date()
                                }
                            })];
                    case 40:
                        updatedTool = _d.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Use cases sauvegard\u00E9s pour Tool ID: ".concat(updatedTool.id));
                        return [3 /*break*/, 42];
                    case 41:
                        console.log("\uD83E\uDDEA Mode test: Use cases non sauvegard\u00E9s en DB");
                        console.log("\uD83C\uDFAF Aper\u00E7u use cases: ".concat(generatedUseCases.substring(0, 150), "..."));
                        _d.label = 42;
                    case 42:
                        // Étape 11 : Génération du target audience
                        result.step = 'targetaudience_generation';
                        console.log("\uD83D\uDC65 \u00C9tape 11: G\u00E9n\u00E9ration du target audience...");
                        return [4 /*yield*/, this.generateToolTargetAudience(tool, crawlResult.crawledPages)];
                    case 43:
                        generatedTargetAudience = _d.sent();
                        result.generatedTargetAudience = generatedTargetAudience;
                        if (!!testMode) return [3 /*break*/, 45];
                        console.log("\uD83D\uDCCA Mise \u00E0 jour DB: Target audience g\u00E9n\u00E9r\u00E9");
                        return [4 /*yield*/, client_1.prisma.tool.update({
                                where: { id: toolId },
                                data: {
                                    targetAudience: generatedTargetAudience,
                                    updatedAt: new Date(),
                                    last_optimized_at: new Date()
                                }
                            })];
                    case 44:
                        updatedTool = _d.sent();
                        console.log("\u2705 DB mise \u00E0 jour confirm\u00E9e via Prisma - Target audience sauvegard\u00E9 pour Tool ID: ".concat(updatedTool.id));
                        console.log("\uD83D\uDC65 Target Audience: ".concat(generatedTargetAudience.substring(0, 100), "..."));
                        return [3 /*break*/, 46];
                    case 45:
                        console.log("\uD83E\uDDEA Mode test: Target audience non sauvegard\u00E9 en DB");
                        console.log("\uD83D\uDC65 Aper\u00E7u target audience: ".concat(generatedTargetAudience.substring(0, 150), "..."));
                        _d.label = 46;
                    case 46: 
                    // Nettoyage
                    return [4 /*yield*/, this.cleanupTempDirectory(crawlResult.tempDirPath)];
                    case 47:
                        // Nettoyage
                        _d.sent();
                        result.status = 'success';
                        result.step = 'completed';
                        console.log("\u2705 Mise \u00E0 jour compl\u00E8te pour ".concat(tool.toolName, " - 11 \u00E9tapes termin\u00E9es"));
                        return [2 /*return*/, result];
                    case 48:
                        error_17 = _d.sent();
                        (_c = result.errors) === null || _c === void 0 ? void 0 : _c.push(error_17.message || 'Erreur inconnue');
                        console.error("\u274C Erreur lors de la mise \u00E0 jour de l'outil ".concat(toolId, ":"), error_17);
                        return [2 /*return*/, result];
                    case 49: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Traiter plusieurs outils en batch
     */
    ToolContentUpdaterService.updateMultipleTools = function (toolIds_1) {
        return __awaiter(this, arguments, void 0, function (toolIds, testMode) {
            var results, _i, toolIds_2, toolId, result;
            if (testMode === void 0) { testMode = true; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        results = [];
                        _i = 0, toolIds_2 = toolIds;
                        _b.label = 1;
                    case 1:
                        if (!(_i < toolIds_2.length)) return [3 /*break*/, 5];
                        toolId = toolIds_2[_i];
                        console.log("\n\uD83D\uDE80 Traitement de l'outil ".concat(toolId, "..."));
                        return [4 /*yield*/, this.updateToolContent(toolId, testMode)];
                    case 2:
                        result = _b.sent();
                        results.push(result);
                        // Pause entre les outils pour éviter la surcharge
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                    case 3:
                        // Pause entre les outils pour éviter la surcharge
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, results];
                }
            });
        });
    };
    var _a;
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
    ToolContentUpdaterService.ai = _a.GEMINI_API_KEY ? new genai_1.GoogleGenAI({ apiKey: _a.GEMINI_API_KEY }) : null;
    return ToolContentUpdaterService;
}());
exports.ToolContentUpdaterService = ToolContentUpdaterService;
