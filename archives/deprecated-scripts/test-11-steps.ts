/**
 * Test direct en TypeScript pour le système 11 étapes COMPLET
 * Exécute toutes les 11 étapes avec output détaillé
 */

import { ToolContentUpdaterService } from '../src/lib/services/toolContentUpdater';
import { prisma } from '../src/lib/database/client';
import * as fs from 'fs/promises';

async function testComplete11Steps() {
  console.log('🚀 === TEST COMPLET - SYSTÈME 11 ÉTAPES FINAL ===\n');

  const toolId = 6669; // Visualizee

  try {
    console.log(`🎯 Test de Visualizee (ID: ${toolId})`);
    console.log(`📍 URL: https://visualizee.ai/`);
    console.log(`\n${'='.repeat(60)}\n`);

    const startTime = Date.now();

    // LANCER LE TEST COMPLET 11 ÉTAPES
    const result = await ToolContentUpdaterService.updateToolContent(toolId, true);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`\n⏱️ DURÉE TOTALE: ${duration.toFixed(2)}s`);
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 RÉSULTAT DÉTAILLÉ DES 11 ÉTAPES COMPLÈTES');
    console.log(`${'='.repeat(80)}`);

    // AFFICHAGE DÉTAILLÉ
    console.log(`\n🏷️  INFORMATIONS GÉNÉRALES:`);
    console.log(`   Nom: ${result.toolName}`);
    console.log(`   ID: ${result.toolId}`);
    console.log(`   Status final: ${result.status}`);
    console.log(`   Étape atteinte: ${result.step}`);

    console.log(`\n🔍 ÉTAPE 1 - HTTP STATUS CHECK:`);
    if (result.httpStatusCode) {
      console.log(`   ✅ Code HTTP: ${result.httpStatusCode}`);
      console.log(
        `   ${result.isActive ? '🟢' : '🔴'} Status actif: ${result.isActive}`
      );
    } else {
      console.log(`   ❌ Impossible de récupérer le code HTTP`);
    }

    console.log(`\n📸 ÉTAPE 1.5 - SCREENSHOT CAPTURE:`);
    if (result.screenshotPath) {
      console.log(`   ✅ Screenshot capturé avec succès`);
      console.log(`   📁 Chemin: ${result.screenshotPath}`);
      console.log(`   🖼️  Format: WebP optimisé pour le web`);
    } else {
      console.log(`   ❌ Échec capture screenshot`);
    }

    console.log(`\n🕷️  ÉTAPE 2 - CRAWLING (MAX 50 PAGES):`);
    if (result.processedPages !== undefined) {
      console.log(`   📄 Pages crawlées: ${result.processedPages}`);
      console.log(
        `   📊 Efficacité: ${((result.processedPages / 50) * 100).toFixed(1)}% du maximum`
      );
    } else {
      console.log(`   ❌ Crawling non effectué`);
    }

    console.log(`\n🌐 ÉTAPE 3 - EXTRACTION + VALIDATION RÉSEAUX SOCIAUX:`);
    if (result.socialLinks && Object.keys(result.socialLinks).length > 0) {
      console.log(
        `   ✅ ${Object.keys(result.socialLinks).length} réseaux sociaux validés par Gemini:`
      );
      Object.entries(result.socialLinks).forEach(([platform, url]) => {
        const platformEmoji = {
          socialLinkedin: '💼',
          socialFacebook: '📘',
          socialX: '🐦',
          socialGithub: '🐙',
          socialDiscord: '🎮',
          socialInstagram: '📷',
          socialTiktok: '🎵',
        };
        console.log(
          `     ${platformEmoji[platform] || '🔗'} ${platform.replace('social', '').charAt(0).toUpperCase() + platform.replace('social', '').slice(1)}: ${url}`
        );
      });
    } else {
      console.log(`   ❌ Aucun réseau social validé`);
    }

    console.log(`\n🔗 ÉTAPE 4 - EXTRACTION + VALIDATION LIENS UTILES:`);
    if (result.usefulLinks && Object.keys(result.usefulLinks).length > 0) {
      console.log(
        `   ✅ ${Object.keys(result.usefulLinks).length} liens utiles validés par Gemini:`
      );
      Object.entries(result.usefulLinks).forEach(([type, url]) => {
        const linkEmoji = {
          mailAddress: '📧',
          docsLink: '📚',
          affiliateLink: '🤝',
          changelogLink: '📝',
        };
        const typeName = {
          mailAddress: 'Email',
          docsLink: 'Documentation',
          affiliateLink: 'Affiliation',
          changelogLink: 'Changelog',
        };
        console.log(
          `     ${linkEmoji[type] || '🔗'} ${typeName[type] || type}: ${url}`
        );
      });
    } else {
      console.log(`   ❌ Aucun lien utile validé`);
    }

    console.log(`\n✍️  ÉTAPE 5 - GÉNÉRATION CONTENU PRINCIPAL:`);
    if (result.generatedContent) {
      const wordCount = result.generatedContent.split(' ').length;
      const h2Count = (result.generatedContent.match(/## /g) || []).length;
      console.log(
        `   ✅ Article généré: ${result.generatedContent.length} chars, ${wordCount} mots`
      );
      console.log(`   📋 Structure: ${h2Count} sections H2`);
      console.log(
        `   ${result.generatedContent.includes("What's ") ? '✅' : '❌'} Titre requis présent`
      );
    } else {
      console.log(`   ❌ Pas de contenu généré`);
    }

    console.log(`\n📝 ÉTAPE 6 - GÉNÉRATION OVERVIEW:`);
    if (result.generatedOverview) {
      const sentenceCount = result.generatedOverview
        .split(/[.!?]+/)
        .filter(s => s.trim().length > 0).length;
      console.log(`   ✅ Overview généré: ${result.generatedOverview.length} chars`);
      console.log(`   📝 "${result.generatedOverview}"`);
      console.log(
        `   ${sentenceCount === 2 ? '✅' : '❌'} Exactement 2 phrases: ${sentenceCount}`
      );
    } else {
      console.log(`   ❌ Pas d'overview généré`);
    }

    console.log(`\n🔑 ÉTAPE 7 - GÉNÉRATION KEY FEATURES:`);
    if (result.generatedKeyFeatures) {
      const bulletCount = (result.generatedKeyFeatures.match(/•/g) || []).length;
      console.log(`   ✅ Key features générées: ${bulletCount} bullet points`);
      result.generatedKeyFeatures.split('\n').forEach(line => {
        if (line.trim()) console.log(`     ${line}`);
      });
    } else {
      console.log(`   ❌ Pas de key features générées`);
    }

    console.log(`\n🏷️  ÉTAPE 8 - GÉNÉRATION META DONNÉES:`);
    if (result.generatedMetaTitle && result.generatedMetaDescription) {
      console.log(`   ✅ Meta données générées`);
      console.log(
        `   📝 Title: "${result.generatedMetaTitle}" (${result.generatedMetaTitle.length}/70 chars)`
      );
      console.log(
        `   📝 Description: "${result.generatedMetaDescription}" (${result.generatedMetaDescription.length}/160 chars)`
      );
      console.log(
        `   ${result.generatedMetaTitle.includes('- Video-IA.net') ? '✅' : '❌'} Suffix Video-IA.net présent`
      );
    } else {
      console.log(`   ❌ Pas de meta données générées`);
    }

    console.log(`\n💰 ÉTAPE 9 - GÉNÉRATION PRICING MODEL:`);
    if (result.generatedPricingModel) {
      console.log(`   ✅ Pricing model détecté: ${result.generatedPricingModel}`);
      const validModels = [
        'FREE',
        'FREEMIUM',
        'SUBSCRIPTION',
        'ONE_TIME_PAYMENT',
        'USAGE_BASED',
        'CONTACT_FOR_PRICING',
      ];
      console.log(
        `   ${validModels.includes(result.generatedPricingModel) ? '✅' : '❌'} Modèle valide`
      );
    } else {
      console.log(`   ❌ Pas de pricing model généré`);
    }

    console.log(`\n🎯 ÉTAPE 10 - GÉNÉRATION USE CASES:`);
    if (result.generatedUseCases) {
      const bulletCount = (result.generatedUseCases.match(/•/g) || []).length;
      console.log(`   ✅ Use cases générés: ${bulletCount} bullet points`);
      result.generatedUseCases.split('\n').forEach(line => {
        if (line.trim()) console.log(`     ${line}`);
      });
      console.log(
        `   ${bulletCount >= 3 && bulletCount <= 4 ? '✅' : '⚠️'} Nombre optimal (3-4): ${bulletCount}`
      );
    } else {
      console.log(`   ❌ Pas de use cases générés`);
    }

    console.log(`\n👥 ÉTAPE 11 - GÉNÉRATION TARGET AUDIENCE:`);
    if (result.generatedTargetAudience) {
      const sentenceCount = result.generatedTargetAudience
        .split(/[.!?]+/)
        .filter(s => s.trim().length > 0).length;
      console.log(
        `   ✅ Target audience généré: ${result.generatedTargetAudience.length} chars`
      );
      console.log(
        `   📝 Contenu: "${result.generatedTargetAudience.substring(0, 200)}..."`
      );
      console.log(
        `   ${sentenceCount >= 3 && sentenceCount <= 4 ? '✅' : '⚠️'} Sentences (3-4): ${sentenceCount}`
      );
    } else {
      console.log(`   ❌ Pas de target audience généré`);
    }

    console.log(`\n❌ ERREURS RENCONTRÉES:`);
    if (result.errors && result.errors.length > 0) {
      console.log(`   ⚠️  ${result.errors.length} erreur(s):`);
      result.errors.forEach((error, index) => {
        console.log(`     ${index + 1}. ${error}`);
      });
    } else {
      console.log(`   ✅ Aucune erreur - Traitement parfait !`);
    }

    // GÉNÉRATION DU RAPPORT JSON COMPLET
    const detailedReport = {
      timestamp: new Date().toISOString(),
      testType: 'complete_11_steps_final_test',
      toolInfo: {
        id: toolId,
        name: result.toolName,
        url: 'https://visualizee.ai/',
        originallyActive: true,
      },
      performance: {
        durationSeconds: parseFloat(duration.toFixed(2)),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        efficient: duration < 180, // 3 minutes max pour 11 étapes
      },
      stepByStepResults: {
        step1_httpCheck: {
          name: 'HTTP Status Check',
          completed: !!result.httpStatusCode,
          success: result.httpStatusCode >= 200 && result.httpStatusCode < 400,
          data: { httpStatusCode: result.httpStatusCode, isActive: result.isActive },
        },
        step1_5_screenshot: {
          name: 'Screenshot Capture',
          completed: !!result.screenshotPath,
          success: !!result.screenshotPath,
          data: { screenshotPath: result.screenshotPath, format: 'webp' },
        },
        step2_crawling: {
          name: 'Website Crawling',
          completed: result.processedPages !== undefined,
          success: result.processedPages > 0,
          data: {
            pagesProcessed: result.processedPages || 0,
            efficiency: result.processedPages
              ? ((result.processedPages / 50) * 100).toFixed(1) + '%'
              : '0%',
          },
        },
        step3_socialLinks: {
          name: 'Social Links + Gemini Validation',
          completed: !!result.socialLinks,
          success: result.socialLinks && Object.keys(result.socialLinks).length > 0,
          data: {
            linksFound: result.socialLinks ? Object.keys(result.socialLinks).length : 0,
            socialLinks: result.socialLinks || {},
          },
        },
        step4_usefulLinks: {
          name: 'Useful Links + Gemini Validation',
          completed: !!result.usefulLinks,
          success: result.usefulLinks && Object.keys(result.usefulLinks).length > 0,
          data: {
            linksFound: result.usefulLinks ? Object.keys(result.usefulLinks).length : 0,
            usefulLinks: result.usefulLinks || {},
          },
        },
        step5_contentGeneration: {
          name: 'Content Generation',
          completed: !!result.generatedContent,
          success: result.generatedContent && result.generatedContent.length >= 300,
          data: {
            contentLength: result.generatedContent ? result.generatedContent.length : 0,
            wordCount: result.generatedContent
              ? result.generatedContent.split(' ').length
              : 0,
          },
        },
        step6_overview: {
          name: 'Overview Generation (2 sentences)',
          completed: !!result.generatedOverview,
          success:
            result.generatedOverview &&
            result.generatedOverview.split(/[.!?]+/).filter(s => s.trim().length > 0)
              .length === 2,
          data: {
            overviewLength: result.generatedOverview
              ? result.generatedOverview.length
              : 0,
            sentences: result.generatedOverview
              ? result.generatedOverview
                  .split(/[.!?]+/)
                  .filter(s => s.trim().length > 0).length
              : 0,
          },
        },
        step7_keyFeatures: {
          name: 'Key Features Generation',
          completed: !!result.generatedKeyFeatures,
          success:
            result.generatedKeyFeatures && result.generatedKeyFeatures.includes('•'),
          data: {
            bulletPoints: result.generatedKeyFeatures
              ? (result.generatedKeyFeatures.match(/•/g) || []).length
              : 0,
          },
        },
        step8_metaData: {
          name: 'Meta Title & Description (with Video-IA.net)',
          completed: !!(result.generatedMetaTitle && result.generatedMetaDescription),
          success: !!(
            result.generatedMetaTitle &&
            result.generatedMetaDescription &&
            result.generatedMetaTitle.includes('- Video-IA.net')
          ),
          data: {
            metaTitleLength: result.generatedMetaTitle
              ? result.generatedMetaTitle.length
              : 0,
            metaDescLength: result.generatedMetaDescription
              ? result.generatedMetaDescription.length
              : 0,
            hasVideoIASuffix: result.generatedMetaTitle
              ? result.generatedMetaTitle.includes('- Video-IA.net')
              : false,
          },
        },
        step9_pricingModel: {
          name: 'Pricing Model Detection',
          completed: !!result.generatedPricingModel,
          success:
            !!result.generatedPricingModel &&
            [
              'FREE',
              'FREEMIUM',
              'SUBSCRIPTION',
              'ONE_TIME_PAYMENT',
              'USAGE_BASED',
              'CONTACT_FOR_PRICING',
            ].includes(result.generatedPricingModel),
          data: {
            pricingModel: result.generatedPricingModel,
            isValid: [
              'FREE',
              'FREEMIUM',
              'SUBSCRIPTION',
              'ONE_TIME_PAYMENT',
              'USAGE_BASED',
              'CONTACT_FOR_PRICING',
            ].includes(result.generatedPricingModel || ''),
          },
        },
        step10_useCases: {
          name: 'Use Cases Generation (3-4 bullets with tool name)',
          completed: !!result.generatedUseCases,
          success:
            result.generatedUseCases &&
            result.generatedUseCases.includes('•') &&
            (result.generatedUseCases.match(/•/g) || []).length >= 3,
          data: {
            bulletPoints: result.generatedUseCases
              ? (result.generatedUseCases.match(/•/g) || []).length
              : 0,
            hasToolName: result.generatedUseCases
              ? result.generatedUseCases.includes(result.toolName)
              : false,
          },
        },
        step11_targetAudience: {
          name: 'Target Audience Generation (3-4 sentences paragraph)',
          completed: !!result.generatedTargetAudience,
          success:
            result.generatedTargetAudience &&
            result.generatedTargetAudience.length >= 200 &&
            result.generatedTargetAudience
              .split(/[.!?]+/)
              .filter(s => s.trim().length > 0).length >= 3,
          data: {
            textLength: result.generatedTargetAudience
              ? result.generatedTargetAudience.length
              : 0,
            sentences: result.generatedTargetAudience
              ? result.generatedTargetAudience
                  .split(/[.!?]+/)
                  .filter(s => s.trim().length > 0).length
              : 0,
          },
        },
      },
      fullResults: result,
      summary: {
        overallSuccess: result.status === 'success' && result.step === 'completed',
        stepsCompleted:
          result.step === 'completed'
            ? 11
            : [
                'http_check',
                'screenshot',
                'crawling',
                'social_extraction',
                'useful_links',
                'content_generation',
                'overview_generation',
                'keyfeatures_generation',
                'meta_generation',
                'pricing_generation',
                'usecases_generation',
                'targetaudience_generation',
              ].indexOf(result.step) + 1,
        stepsSuccessful: Object.values({
          step1: result.httpStatusCode >= 200 && result.httpStatusCode < 400,
          step1_5: !!result.screenshotPath,
          step2: result.processedPages > 0,
          step3: result.socialLinks && Object.keys(result.socialLinks).length > 0,
          step4: result.usefulLinks && Object.keys(result.usefulLinks).length > 0,
          step5: result.generatedContent && result.generatedContent.length >= 300,
          step6:
            result.generatedOverview &&
            result.generatedOverview.split(/[.!?]+/).filter(s => s.trim().length > 0)
              .length === 2,
          step7:
            result.generatedKeyFeatures && result.generatedKeyFeatures.includes('•'),
          step8:
            result.generatedMetaTitle &&
            result.generatedMetaDescription &&
            result.generatedMetaTitle.includes('- Video-IA.net'),
          step9:
            result.generatedPricingModel &&
            [
              'FREE',
              'FREEMIUM',
              'SUBSCRIPTION',
              'ONE_TIME_PAYMENT',
              'USAGE_BASED',
              'CONTACT_FOR_PRICING',
            ].includes(result.generatedPricingModel),
          step10: result.generatedUseCases && result.generatedUseCases.includes('•'),
          step11:
            result.generatedTargetAudience &&
            result.generatedTargetAudience.length >= 200,
        }).filter(Boolean).length,
        totalSteps: 11,
        hasErrors: result.errors && result.errors.length > 0,
        processingTime: `${duration.toFixed(2)}s`,
        dataQuality: {
          urlWorking: result.httpStatusCode >= 200 && result.httpStatusCode < 400,
          screenshotCaptured: !!result.screenshotPath,
          contentRich: result.processedPages > 10,
          socialPresence:
            result.socialLinks && Object.keys(result.socialLinks).length > 2,
          documentationAvailable: result.usefulLinks && result.usefulLinks.docsLink,
          completeContent:
            result.generatedContent && result.generatedContent.length >= 1000,
          properOverview:
            result.generatedOverview &&
            result.generatedOverview.split(/[.!?]+/).filter(s => s.trim().length > 0)
              .length === 2,
          goodKeyFeatures:
            result.generatedKeyFeatures &&
            (result.generatedKeyFeatures.match(/•/g) || []).length >= 3,
          validMetaData:
            result.generatedMetaTitle &&
            result.generatedMetaTitle.includes('- Video-IA.net'),
          pricingDetected: !!result.generatedPricingModel,
          specificUseCases:
            result.generatedUseCases &&
            result.generatedUseCases.includes(result.toolName),
          targetedAudience:
            result.generatedTargetAudience &&
            result.generatedTargetAudience.length >= 200,
        },
      },
    };

    // Sauvegarder le rapport
    const reportFilename = `complete-11-steps-final-test-${Date.now()}.json`;
    await fs.writeFile(reportFilename, JSON.stringify(detailedReport, null, 2));

    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 RÉSUMÉ FINAL - SYSTÈME 11 ÉTAPES COMPLET');
    console.log(`${'='.repeat(80)}`);
    console.log(`🎯 Outil testé: ${result.toolName} (ID: ${toolId})`);
    console.log(`⏱️  Durée totale: ${duration.toFixed(2)}s`);
    console.log(`✅ Status final: ${result.status.toUpperCase()}`);
    console.log(`🔄 Étapes complétées: ${detailedReport.summary.stepsCompleted}/11`);
    console.log(`🏆 Étapes réussies: ${detailedReport.summary.stepsSuccessful}/11`);

    console.log(`\n🔍 RÉSULTAT DÉTAILLÉ:`);
    console.log(
      `   ${detailedReport.stepByStepResults.step1_httpCheck.success ? '✅' : '❌'} HTTP Check`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step1_5_screenshot.success ? '✅' : '❌'} Screenshot WebP`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step2_crawling.success ? '✅' : '❌'} Crawling (${result.processedPages || 0} pages)`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step3_socialLinks.success ? '✅' : '❌'} Social + Validation (${detailedReport.stepByStepResults.step3_socialLinks.data.linksFound})`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step4_usefulLinks.success ? '✅' : '❌'} Useful + Validation (${detailedReport.stepByStepResults.step4_usefulLinks.data.linksFound})`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step5_contentGeneration.success ? '✅' : '❌'} Content (${detailedReport.stepByStepResults.step5_contentGeneration.data.wordCount} mots)`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step6_overview.success ? '✅' : '❌'} Overview (${detailedReport.stepByStepResults.step6_overview.data.sentences} phrases)`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step7_keyFeatures.success ? '✅' : '❌'} Key Features (${detailedReport.stepByStepResults.step7_keyFeatures.data.bulletPoints} bullets)`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step8_metaData.success ? '✅' : '❌'} Meta + Video-IA.net`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step9_pricingModel.success ? '✅' : '❌'} Pricing (${result.generatedPricingModel || 'N/A'})`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step10_useCases.success ? '✅' : '❌'} Use Cases (${detailedReport.stepByStepResults.step10_useCases.data.bulletPoints} bullets)`
    );
    console.log(
      `   ${detailedReport.stepByStepResults.step11_targetAudience.success ? '✅' : '❌'} Target Audience (${detailedReport.stepByStepResults.step11_targetAudience.data.sentences} phrases)`
    );

    console.log(`\n📊 QUALITÉ GLOBALE:`);
    const qualityChecks = Object.values(detailedReport.summary.dataQuality).filter(
      Boolean
    ).length;
    console.log(
      `   ${qualityChecks >= 8 ? '🏆' : qualityChecks >= 6 ? '✅' : '⚠️'} Score qualité: ${qualityChecks}/11`
    );

    console.log(`\n💾 Rapport JSON complet: ${reportFilename}`);
    console.log(`❌ Erreurs: ${detailedReport.summary.hasErrors ? 'Oui' : 'Non'}`);

    if (
      detailedReport.summary.overallSuccess &&
      detailedReport.summary.stepsSuccessful >= 9
    ) {
      console.log('\n🎉 === TEST COMPLET RÉUSSI - SYSTÈME PRÊT POUR PRODUCTION ===');
      console.log('🚀 Le système 11 étapes génère un contenu complet et de qualité !');
    } else if (detailedReport.summary.stepsSuccessful >= 7) {
      console.log(
        '\n✅ === TEST LARGEMENT RÉUSSI - QUELQUES AMÉLIORATIONS POSSIBLES ==='
      );
      console.log('🔧 Le système fonctionne bien, optimisations mineures à considérer');
    } else {
      console.log('\n⚠️ === TEST AVEC LIMITATIONS - RÉVISION NÉCESSAIRE ===');
      console.log('🔧 Plusieurs étapes nécessitent des améliorations');
    }
  } catch (error: any) {
    console.error('\n❌ ERREUR DURANT LE TEST:', error.message);
    console.log('\n🔍 DIAGNOSTIC COMPLET:');
    console.log(`   Type d'erreur: ${error.constructor.name}`);
    console.log(`   Message: ${error.message}`);
    if (error.code) console.log(`   Code: ${error.code}`);
    if (error.stack) console.log(`   Stack: ${error.stack.substring(0, 300)}...`);
  } finally {
    await prisma.$disconnect();
  }
}

testComplete11Steps().catch(console.error);

// Export pour utilisation dans d'autres scripts
export { testComplete11Steps };
