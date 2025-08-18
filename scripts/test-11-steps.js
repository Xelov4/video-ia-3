"use strict";
/**
 * Test direct en TypeScript pour le système 11 étapes COMPLET
 * Exécute toutes les 11 étapes avec output détaillé
 */
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
var toolContentUpdater_1 = require("../src/lib/services/toolContentUpdater");
var client_1 = require("../src/lib/database/client");
var fs = require("fs/promises");
function testComplete11Steps() {
    return __awaiter(this, void 0, void 0, function () {
        var toolId, startTime, result, endTime, duration, wordCount, h2Count, sentenceCount, bulletCount, validModels, bulletCount, sentenceCount, detailedReport, reportFilename, qualityChecks, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 === TEST COMPLET - SYSTÈME 11 ÉTAPES FINAL ===\n');
                    toolId = 6669 // Visualizee
                    ;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 7]);
                    console.log("\uD83C\uDFAF Test de Visualizee (ID: ".concat(toolId, ")"));
                    console.log("\uD83D\uDCCD URL: https://visualizee.ai/");
                    console.log("\n".concat('='.repeat(60), "\n"));
                    startTime = Date.now();
                    return [4 /*yield*/, toolContentUpdater_1.ToolContentUpdaterService.updateToolContent(toolId, true)];
                case 2:
                    result = _a.sent();
                    endTime = Date.now();
                    duration = (endTime - startTime) / 1000;
                    console.log("\n\u23F1\uFE0F DUR\u00C9E TOTALE: ".concat(duration.toFixed(2), "s"));
                    console.log("\n".concat('='.repeat(80)));
                    console.log('📊 RÉSULTAT DÉTAILLÉ DES 11 ÉTAPES COMPLÈTES');
                    console.log("".concat('='.repeat(80)));
                    // AFFICHAGE DÉTAILLÉ
                    console.log("\n\uD83C\uDFF7\uFE0F  INFORMATIONS G\u00C9N\u00C9RALES:");
                    console.log("   Nom: ".concat(result.toolName));
                    console.log("   ID: ".concat(result.toolId));
                    console.log("   Status final: ".concat(result.status));
                    console.log("   \u00C9tape atteinte: ".concat(result.step));
                    console.log("\n\uD83D\uDD0D \u00C9TAPE 1 - HTTP STATUS CHECK:");
                    if (result.httpStatusCode) {
                        console.log("   \u2705 Code HTTP: ".concat(result.httpStatusCode));
                        console.log("   ".concat(result.isActive ? '🟢' : '🔴', " Status actif: ").concat(result.isActive));
                    }
                    else {
                        console.log("   \u274C Impossible de r\u00E9cup\u00E9rer le code HTTP");
                    }
                    console.log("\n\uD83D\uDCF8 \u00C9TAPE 1.5 - SCREENSHOT CAPTURE:");
                    if (result.screenshotPath) {
                        console.log("   \u2705 Screenshot captur\u00E9 avec succ\u00E8s");
                        console.log("   \uD83D\uDCC1 Chemin: ".concat(result.screenshotPath));
                        console.log("   \uD83D\uDDBC\uFE0F  Format: WebP optimis\u00E9 pour le web");
                    }
                    else {
                        console.log("   \u274C \u00C9chec capture screenshot");
                    }
                    console.log("\n\uD83D\uDD77\uFE0F  \u00C9TAPE 2 - CRAWLING (MAX 50 PAGES):");
                    if (result.processedPages !== undefined) {
                        console.log("   \uD83D\uDCC4 Pages crawl\u00E9es: ".concat(result.processedPages));
                        console.log("   \uD83D\uDCCA Efficacit\u00E9: ".concat(((result.processedPages / 50) * 100).toFixed(1), "% du maximum"));
                    }
                    else {
                        console.log("   \u274C Crawling non effectu\u00E9");
                    }
                    console.log("\n\uD83C\uDF10 \u00C9TAPE 3 - EXTRACTION + VALIDATION R\u00C9SEAUX SOCIAUX:");
                    if (result.socialLinks && Object.keys(result.socialLinks).length > 0) {
                        console.log("   \u2705 ".concat(Object.keys(result.socialLinks).length, " r\u00E9seaux sociaux valid\u00E9s par Gemini:"));
                        Object.entries(result.socialLinks).forEach(function (_a) {
                            var platform = _a[0], url = _a[1];
                            var platformEmoji = {
                                socialLinkedin: '💼', socialFacebook: '📘', socialX: '🐦', socialGithub: '🐙',
                                socialDiscord: '🎮', socialInstagram: '📷', socialTiktok: '🎵'
                            };
                            console.log("     ".concat(platformEmoji[platform] || '🔗', " ").concat(platform.replace('social', '').charAt(0).toUpperCase() + platform.replace('social', '').slice(1), ": ").concat(url));
                        });
                    }
                    else {
                        console.log("   \u274C Aucun r\u00E9seau social valid\u00E9");
                    }
                    console.log("\n\uD83D\uDD17 \u00C9TAPE 4 - EXTRACTION + VALIDATION LIENS UTILES:");
                    if (result.usefulLinks && Object.keys(result.usefulLinks).length > 0) {
                        console.log("   \u2705 ".concat(Object.keys(result.usefulLinks).length, " liens utiles valid\u00E9s par Gemini:"));
                        Object.entries(result.usefulLinks).forEach(function (_a) {
                            var type = _a[0], url = _a[1];
                            var linkEmoji = { mailAddress: '📧', docsLink: '📚', affiliateLink: '🤝', changelogLink: '📝' };
                            var typeName = { mailAddress: 'Email', docsLink: 'Documentation', affiliateLink: 'Affiliation', changelogLink: 'Changelog' };
                            console.log("     ".concat(linkEmoji[type] || '🔗', " ").concat(typeName[type] || type, ": ").concat(url));
                        });
                    }
                    else {
                        console.log("   \u274C Aucun lien utile valid\u00E9");
                    }
                    console.log("\n\u270D\uFE0F  \u00C9TAPE 5 - G\u00C9N\u00C9RATION CONTENU PRINCIPAL:");
                    if (result.generatedContent) {
                        wordCount = result.generatedContent.split(' ').length;
                        h2Count = (result.generatedContent.match(/## /g) || []).length;
                        console.log("   \u2705 Article g\u00E9n\u00E9r\u00E9: ".concat(result.generatedContent.length, " chars, ").concat(wordCount, " mots"));
                        console.log("   \uD83D\uDCCB Structure: ".concat(h2Count, " sections H2"));
                        console.log("   ".concat(result.generatedContent.includes("What's ") ? '✅' : '❌', " Titre requis pr\u00E9sent"));
                    }
                    else {
                        console.log("   \u274C Pas de contenu g\u00E9n\u00E9r\u00E9");
                    }
                    console.log("\n\uD83D\uDCDD \u00C9TAPE 6 - G\u00C9N\u00C9RATION OVERVIEW:");
                    if (result.generatedOverview) {
                        sentenceCount = result.generatedOverview.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length;
                        console.log("   \u2705 Overview g\u00E9n\u00E9r\u00E9: ".concat(result.generatedOverview.length, " chars"));
                        console.log("   \uD83D\uDCDD \"".concat(result.generatedOverview, "\""));
                        console.log("   ".concat(sentenceCount === 2 ? '✅' : '❌', " Exactement 2 phrases: ").concat(sentenceCount));
                    }
                    else {
                        console.log("   \u274C Pas d'overview g\u00E9n\u00E9r\u00E9");
                    }
                    console.log("\n\uD83D\uDD11 \u00C9TAPE 7 - G\u00C9N\u00C9RATION KEY FEATURES:");
                    if (result.generatedKeyFeatures) {
                        bulletCount = (result.generatedKeyFeatures.match(/•/g) || []).length;
                        console.log("   \u2705 Key features g\u00E9n\u00E9r\u00E9es: ".concat(bulletCount, " bullet points"));
                        result.generatedKeyFeatures.split('\n').forEach(function (line) {
                            if (line.trim())
                                console.log("     ".concat(line));
                        });
                    }
                    else {
                        console.log("   \u274C Pas de key features g\u00E9n\u00E9r\u00E9es");
                    }
                    console.log("\n\uD83C\uDFF7\uFE0F  \u00C9TAPE 8 - G\u00C9N\u00C9RATION META DONN\u00C9ES:");
                    if (result.generatedMetaTitle && result.generatedMetaDescription) {
                        console.log("   \u2705 Meta donn\u00E9es g\u00E9n\u00E9r\u00E9es");
                        console.log("   \uD83D\uDCDD Title: \"".concat(result.generatedMetaTitle, "\" (").concat(result.generatedMetaTitle.length, "/70 chars)"));
                        console.log("   \uD83D\uDCDD Description: \"".concat(result.generatedMetaDescription, "\" (").concat(result.generatedMetaDescription.length, "/160 chars)"));
                        console.log("   ".concat(result.generatedMetaTitle.includes('- Video-IA.net') ? '✅' : '❌', " Suffix Video-IA.net pr\u00E9sent"));
                    }
                    else {
                        console.log("   \u274C Pas de meta donn\u00E9es g\u00E9n\u00E9r\u00E9es");
                    }
                    console.log("\n\uD83D\uDCB0 \u00C9TAPE 9 - G\u00C9N\u00C9RATION PRICING MODEL:");
                    if (result.generatedPricingModel) {
                        console.log("   \u2705 Pricing model d\u00E9tect\u00E9: ".concat(result.generatedPricingModel));
                        validModels = ['FREE', 'FREEMIUM', 'SUBSCRIPTION', 'ONE_TIME_PAYMENT', 'USAGE_BASED', 'CONTACT_FOR_PRICING'];
                        console.log("   ".concat(validModels.includes(result.generatedPricingModel) ? '✅' : '❌', " Mod\u00E8le valide"));
                    }
                    else {
                        console.log("   \u274C Pas de pricing model g\u00E9n\u00E9r\u00E9");
                    }
                    console.log("\n\uD83C\uDFAF \u00C9TAPE 10 - G\u00C9N\u00C9RATION USE CASES:");
                    if (result.generatedUseCases) {
                        bulletCount = (result.generatedUseCases.match(/•/g) || []).length;
                        console.log("   \u2705 Use cases g\u00E9n\u00E9r\u00E9s: ".concat(bulletCount, " bullet points"));
                        result.generatedUseCases.split('\n').forEach(function (line) {
                            if (line.trim())
                                console.log("     ".concat(line));
                        });
                        console.log("   ".concat(bulletCount >= 3 && bulletCount <= 4 ? '✅' : '⚠️', " Nombre optimal (3-4): ").concat(bulletCount));
                    }
                    else {
                        console.log("   \u274C Pas de use cases g\u00E9n\u00E9r\u00E9s");
                    }
                    console.log("\n\uD83D\uDC65 \u00C9TAPE 11 - G\u00C9N\u00C9RATION TARGET AUDIENCE:");
                    if (result.generatedTargetAudience) {
                        sentenceCount = result.generatedTargetAudience.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length;
                        console.log("   \u2705 Target audience g\u00E9n\u00E9r\u00E9: ".concat(result.generatedTargetAudience.length, " chars"));
                        console.log("   \uD83D\uDCDD Contenu: \"".concat(result.generatedTargetAudience.substring(0, 200), "...\""));
                        console.log("   ".concat(sentenceCount >= 3 && sentenceCount <= 4 ? '✅' : '⚠️', " Sentences (3-4): ").concat(sentenceCount));
                    }
                    else {
                        console.log("   \u274C Pas de target audience g\u00E9n\u00E9r\u00E9");
                    }
                    console.log("\n\u274C ERREURS RENCONTR\u00C9ES:");
                    if (result.errors && result.errors.length > 0) {
                        console.log("   \u26A0\uFE0F  ".concat(result.errors.length, " erreur(s):"));
                        result.errors.forEach(function (error, index) {
                            console.log("     ".concat(index + 1, ". ").concat(error));
                        });
                    }
                    else {
                        console.log("   \u2705 Aucune erreur - Traitement parfait !");
                    }
                    detailedReport = {
                        timestamp: new Date().toISOString(),
                        testType: 'complete_11_steps_final_test',
                        toolInfo: {
                            id: toolId,
                            name: result.toolName,
                            url: 'https://visualizee.ai/',
                            originallyActive: true
                        },
                        performance: {
                            durationSeconds: parseFloat(duration.toFixed(2)),
                            startTime: new Date(startTime).toISOString(),
                            endTime: new Date(endTime).toISOString(),
                            efficient: duration < 180 // 3 minutes max pour 11 étapes
                        },
                        stepByStepResults: {
                            step1_httpCheck: {
                                name: "HTTP Status Check",
                                completed: !!result.httpStatusCode,
                                success: result.httpStatusCode >= 200 && result.httpStatusCode < 400,
                                data: { httpStatusCode: result.httpStatusCode, isActive: result.isActive }
                            },
                            step1_5_screenshot: {
                                name: "Screenshot Capture",
                                completed: !!result.screenshotPath,
                                success: !!result.screenshotPath,
                                data: { screenshotPath: result.screenshotPath, format: 'webp' }
                            },
                            step2_crawling: {
                                name: "Website Crawling",
                                completed: result.processedPages !== undefined,
                                success: result.processedPages > 0,
                                data: { pagesProcessed: result.processedPages || 0, efficiency: result.processedPages ? ((result.processedPages / 50) * 100).toFixed(1) + '%' : '0%' }
                            },
                            step3_socialLinks: {
                                name: "Social Links + Gemini Validation",
                                completed: !!result.socialLinks,
                                success: result.socialLinks && Object.keys(result.socialLinks).length > 0,
                                data: { linksFound: result.socialLinks ? Object.keys(result.socialLinks).length : 0, socialLinks: result.socialLinks || {} }
                            },
                            step4_usefulLinks: {
                                name: "Useful Links + Gemini Validation",
                                completed: !!result.usefulLinks,
                                success: result.usefulLinks && Object.keys(result.usefulLinks).length > 0,
                                data: { linksFound: result.usefulLinks ? Object.keys(result.usefulLinks).length : 0, usefulLinks: result.usefulLinks || {} }
                            },
                            step5_contentGeneration: {
                                name: "Content Generation",
                                completed: !!result.generatedContent,
                                success: result.generatedContent && result.generatedContent.length >= 300,
                                data: { contentLength: result.generatedContent ? result.generatedContent.length : 0, wordCount: result.generatedContent ? result.generatedContent.split(' ').length : 0 }
                            },
                            step6_overview: {
                                name: "Overview Generation (2 sentences)",
                                completed: !!result.generatedOverview,
                                success: result.generatedOverview && result.generatedOverview.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length === 2,
                                data: { overviewLength: result.generatedOverview ? result.generatedOverview.length : 0, sentences: result.generatedOverview ? result.generatedOverview.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length : 0 }
                            },
                            step7_keyFeatures: {
                                name: "Key Features Generation",
                                completed: !!result.generatedKeyFeatures,
                                success: result.generatedKeyFeatures && result.generatedKeyFeatures.includes('•'),
                                data: { bulletPoints: result.generatedKeyFeatures ? (result.generatedKeyFeatures.match(/•/g) || []).length : 0 }
                            },
                            step8_metaData: {
                                name: "Meta Title & Description (with Video-IA.net)",
                                completed: !!(result.generatedMetaTitle && result.generatedMetaDescription),
                                success: !!(result.generatedMetaTitle && result.generatedMetaDescription && result.generatedMetaTitle.includes('- Video-IA.net')),
                                data: { metaTitleLength: result.generatedMetaTitle ? result.generatedMetaTitle.length : 0, metaDescLength: result.generatedMetaDescription ? result.generatedMetaDescription.length : 0, hasVideoIASuffix: result.generatedMetaTitle ? result.generatedMetaTitle.includes('- Video-IA.net') : false }
                            },
                            step9_pricingModel: {
                                name: "Pricing Model Detection",
                                completed: !!result.generatedPricingModel,
                                success: !!result.generatedPricingModel && ['FREE', 'FREEMIUM', 'SUBSCRIPTION', 'ONE_TIME_PAYMENT', 'USAGE_BASED', 'CONTACT_FOR_PRICING'].includes(result.generatedPricingModel),
                                data: { pricingModel: result.generatedPricingModel, isValid: ['FREE', 'FREEMIUM', 'SUBSCRIPTION', 'ONE_TIME_PAYMENT', 'USAGE_BASED', 'CONTACT_FOR_PRICING'].includes(result.generatedPricingModel || '') }
                            },
                            step10_useCases: {
                                name: "Use Cases Generation (3-4 bullets with tool name)",
                                completed: !!result.generatedUseCases,
                                success: result.generatedUseCases && result.generatedUseCases.includes('•') && (result.generatedUseCases.match(/•/g) || []).length >= 3,
                                data: { bulletPoints: result.generatedUseCases ? (result.generatedUseCases.match(/•/g) || []).length : 0, hasToolName: result.generatedUseCases ? result.generatedUseCases.includes(result.toolName) : false }
                            },
                            step11_targetAudience: {
                                name: "Target Audience Generation (3-4 sentences paragraph)",
                                completed: !!result.generatedTargetAudience,
                                success: result.generatedTargetAudience && result.generatedTargetAudience.length >= 200 && result.generatedTargetAudience.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length >= 3,
                                data: { textLength: result.generatedTargetAudience ? result.generatedTargetAudience.length : 0, sentences: result.generatedTargetAudience ? result.generatedTargetAudience.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length : 0 }
                            }
                        },
                        fullResults: result,
                        summary: {
                            overallSuccess: result.status === 'success' && result.step === 'completed',
                            stepsCompleted: result.step === 'completed' ? 11 : ['http_check', 'screenshot', 'crawling', 'social_extraction', 'useful_links', 'content_generation', 'overview_generation', 'keyfeatures_generation', 'meta_generation', 'pricing_generation', 'usecases_generation', 'targetaudience_generation'].indexOf(result.step) + 1,
                            stepsSuccessful: Object.values({
                                step1: result.httpStatusCode >= 200 && result.httpStatusCode < 400,
                                step1_5: !!result.screenshotPath,
                                step2: result.processedPages > 0,
                                step3: result.socialLinks && Object.keys(result.socialLinks).length > 0,
                                step4: result.usefulLinks && Object.keys(result.usefulLinks).length > 0,
                                step5: result.generatedContent && result.generatedContent.length >= 300,
                                step6: result.generatedOverview && result.generatedOverview.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length === 2,
                                step7: result.generatedKeyFeatures && result.generatedKeyFeatures.includes('•'),
                                step8: result.generatedMetaTitle && result.generatedMetaDescription && result.generatedMetaTitle.includes('- Video-IA.net'),
                                step9: result.generatedPricingModel && ['FREE', 'FREEMIUM', 'SUBSCRIPTION', 'ONE_TIME_PAYMENT', 'USAGE_BASED', 'CONTACT_FOR_PRICING'].includes(result.generatedPricingModel),
                                step10: result.generatedUseCases && result.generatedUseCases.includes('•'),
                                step11: result.generatedTargetAudience && result.generatedTargetAudience.length >= 200
                            }).filter(Boolean).length,
                            totalSteps: 11,
                            hasErrors: result.errors && result.errors.length > 0,
                            processingTime: "".concat(duration.toFixed(2), "s"),
                            dataQuality: {
                                urlWorking: result.httpStatusCode >= 200 && result.httpStatusCode < 400,
                                screenshotCaptured: !!result.screenshotPath,
                                contentRich: result.processedPages > 10,
                                socialPresence: result.socialLinks && Object.keys(result.socialLinks).length > 2,
                                documentationAvailable: result.usefulLinks && result.usefulLinks.docsLink,
                                completeContent: result.generatedContent && result.generatedContent.length >= 1000,
                                properOverview: result.generatedOverview && result.generatedOverview.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length === 2,
                                goodKeyFeatures: result.generatedKeyFeatures && (result.generatedKeyFeatures.match(/•/g) || []).length >= 3,
                                validMetaData: result.generatedMetaTitle && result.generatedMetaTitle.includes('- Video-IA.net'),
                                pricingDetected: !!result.generatedPricingModel,
                                specificUseCases: result.generatedUseCases && result.generatedUseCases.includes(result.toolName),
                                targetedAudience: result.generatedTargetAudience && result.generatedTargetAudience.length >= 200
                            }
                        }
                    };
                    reportFilename = "complete-11-steps-final-test-".concat(Date.now(), ".json");
                    return [4 /*yield*/, fs.writeFile(reportFilename, JSON.stringify(detailedReport, null, 2))];
                case 3:
                    _a.sent();
                    console.log("\n".concat('='.repeat(80)));
                    console.log('📊 RÉSUMÉ FINAL - SYSTÈME 11 ÉTAPES COMPLET');
                    console.log("".concat('='.repeat(80)));
                    console.log("\uD83C\uDFAF Outil test\u00E9: ".concat(result.toolName, " (ID: ").concat(toolId, ")"));
                    console.log("\u23F1\uFE0F  Dur\u00E9e totale: ".concat(duration.toFixed(2), "s"));
                    console.log("\u2705 Status final: ".concat(result.status.toUpperCase()));
                    console.log("\uD83D\uDD04 \u00C9tapes compl\u00E9t\u00E9es: ".concat(detailedReport.summary.stepsCompleted, "/11"));
                    console.log("\uD83C\uDFC6 \u00C9tapes r\u00E9ussies: ".concat(detailedReport.summary.stepsSuccessful, "/11"));
                    console.log("\n\uD83D\uDD0D R\u00C9SULTAT D\u00C9TAILL\u00C9:");
                    console.log("   ".concat(detailedReport.stepByStepResults.step1_httpCheck.success ? '✅' : '❌', " HTTP Check"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step1_5_screenshot.success ? '✅' : '❌', " Screenshot WebP"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step2_crawling.success ? '✅' : '❌', " Crawling (").concat(result.processedPages || 0, " pages)"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step3_socialLinks.success ? '✅' : '❌', " Social + Validation (").concat(detailedReport.stepByStepResults.step3_socialLinks.data.linksFound, ")"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step4_usefulLinks.success ? '✅' : '❌', " Useful + Validation (").concat(detailedReport.stepByStepResults.step4_usefulLinks.data.linksFound, ")"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step5_contentGeneration.success ? '✅' : '❌', " Content (").concat(detailedReport.stepByStepResults.step5_contentGeneration.data.wordCount, " mots)"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step6_overview.success ? '✅' : '❌', " Overview (").concat(detailedReport.stepByStepResults.step6_overview.data.sentences, " phrases)"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step7_keyFeatures.success ? '✅' : '❌', " Key Features (").concat(detailedReport.stepByStepResults.step7_keyFeatures.data.bulletPoints, " bullets)"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step8_metaData.success ? '✅' : '❌', " Meta + Video-IA.net"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step9_pricingModel.success ? '✅' : '❌', " Pricing (").concat(result.generatedPricingModel || 'N/A', ")"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step10_useCases.success ? '✅' : '❌', " Use Cases (").concat(detailedReport.stepByStepResults.step10_useCases.data.bulletPoints, " bullets)"));
                    console.log("   ".concat(detailedReport.stepByStepResults.step11_targetAudience.success ? '✅' : '❌', " Target Audience (").concat(detailedReport.stepByStepResults.step11_targetAudience.data.sentences, " phrases)"));
                    console.log("\n\uD83D\uDCCA QUALIT\u00C9 GLOBALE:");
                    qualityChecks = Object.values(detailedReport.summary.dataQuality).filter(Boolean).length;
                    console.log("   ".concat(qualityChecks >= 8 ? '🏆' : qualityChecks >= 6 ? '✅' : '⚠️', " Score qualit\u00E9: ").concat(qualityChecks, "/11"));
                    console.log("\n\uD83D\uDCBE Rapport JSON complet: ".concat(reportFilename));
                    console.log("\u274C Erreurs: ".concat(detailedReport.summary.hasErrors ? 'Oui' : 'Non'));
                    if (detailedReport.summary.overallSuccess && detailedReport.summary.stepsSuccessful >= 9) {
                        console.log('\n🎉 === TEST COMPLET RÉUSSI - SYSTÈME PRÊT POUR PRODUCTION ===');
                        console.log('🚀 Le système 11 étapes génère un contenu complet et de qualité !');
                    }
                    else if (detailedReport.summary.stepsSuccessful >= 7) {
                        console.log('\n✅ === TEST LARGEMENT RÉUSSI - QUELQUES AMÉLIORATIONS POSSIBLES ===');
                        console.log('🔧 Le système fonctionne bien, optimisations mineures à considérer');
                    }
                    else {
                        console.log('\n⚠️ === TEST AVEC LIMITATIONS - RÉVISION NÉCESSAIRE ===');
                        console.log('🔧 Plusieurs étapes nécessitent des améliorations');
                    }
                    return [3 /*break*/, 7];
                case 4:
                    error_1 = _a.sent();
                    console.error('\n❌ ERREUR DURANT LE TEST:', error_1.message);
                    console.log('\n🔍 DIAGNOSTIC COMPLET:');
                    console.log("   Type d'erreur: ".concat(error_1.constructor.name));
                    console.log("   Message: ".concat(error_1.message));
                    if (error_1.code)
                        console.log("   Code: ".concat(error_1.code));
                    if (error_1.stack)
                        console.log("   Stack: ".concat(error_1.stack.substring(0, 300), "..."));
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, client_1.prisma.$disconnect()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
testComplete11Steps().catch(console.error);
