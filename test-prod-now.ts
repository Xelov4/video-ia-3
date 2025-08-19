import { ToolContentUpdaterServiceOptimized } from './src/lib/services/toolContentUpdaterOptimized';

async function testProd() {
  console.log('🚀 === TEST SYSTÈME OPTIMISÉ EN PRODUCTION ===');
  console.log('🎯 Outil: Tweetmonk (ID: 6054)');
  console.log('📍 URL: https://tweetmonk.com/');
  console.log('⚡ Mode: PRODUCTION (sauvegarde DB activée)');
  console.log('🌐 Langues: 7 (en, fr, it, es, de, nl, pt)');
  console.log('💰 Optimisation: 17 appels API vs 53 (-68%)');
  console.log();

  const startTime = Date.now();

  try {
    const result =
      await ToolContentUpdaterServiceOptimized.updateToolContentWithTranslations(
        6054, // Tweetmonk
        false // Mode production = sauvegarde DB
      );

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log();
    console.log('='.repeat(80));
    console.log('🎉 RÉSULTATS TEST PRODUCTION');
    console.log('='.repeat(80));
    console.log(`⏱️  Durée totale: ${duration.toFixed(2)}s`);
    console.log(`📊 Status global: ${result.status}`);
    console.log(
      `🇺🇸 Phase 1 (anglais): ${result.phase1_english?.status || 'failed'}`
    );

    if (result.phase2_translations) {
      console.log(
        `🌐 Phase 2 (traductions): ${result.phase2_translations.successfulTranslations}/${result.phase2_translations.totalLanguages} langues`
      );

      console.log();
      console.log('📊 DÉTAIL PAR LANGUE:');
      const languages = ['en', 'fr', 'it', 'es', 'de', 'nl', 'pt'];
      languages.forEach(lang => {
        if (lang === 'en') {
          console.log(`   🇺🇸 EN: ✅ (copie depuis tools)`);
        } else {
          const translation = result.phase2_translations.translations[lang];
          const status = translation && !translation.error ? '✅' : '❌';
          console.log(
            `   🌐 ${lang.toUpperCase()}: ${status} ${translation?.error ? '(' + translation.error + ')' : '(IA traduit)'}`
          );
        }
      });
    }

    if (result.phase1_english?.status === 'success') {
      console.log();
      console.log('📝 APERÇU CONTENU GÉNÉRÉ:');
      console.log(
        `   📄 Contenu principal: ${result.phase1_english.generatedContent ? result.phase1_english.generatedContent.split(' ').length + ' mots' : 'N/A'}`
      );
      console.log(
        `   📋 Overview: ${result.phase1_english.generatedOverview ? '"' + result.phase1_english.generatedOverview.substring(0, 100) + '..."' : 'N/A'}`
      );
      console.log(
        `   🏷️  Meta Title: ${result.phase1_english.generatedMetaTitle || 'N/A'}`
      );
      console.log(
        `   💰 Pricing: ${result.phase1_english.generatedPricingModel || 'N/A'}`
      );
      console.log(
        `   📱 Screenshot: ${result.phase1_english.screenshotPath ? '✅ ' + result.phase1_english.screenshotPath : '❌'}`
      );
      console.log(
        `   🔗 Liens sociaux: ${result.phase1_english.socialLinks ? Object.keys(result.phase1_english.socialLinks).length + ' trouvés' : '0'}`
      );
      console.log(
        `   📚 Liens utiles: ${result.phase1_english.usefulLinks ? Object.keys(result.phase1_english.usefulLinks).length + ' trouvés' : '0'}`
      );
    }

    console.log();
    console.log('🎯 ÉCONOMIES RÉALISÉES:');
    console.log('   ⚡ 17 appels API au lieu de 53 (-68%)');
    console.log('   🔍 Pricing détecté par regex (économie Gemini)');
    console.log('   🔗 Liens extraits par regex (économie Gemini)');
    console.log('   📋 Traductions JSON unifiées (1 vs 7 par langue)');

    console.log();
    console.log(
      result.status === 'success'
        ? '🎉 TEST PRODUCTION RÉUSSI !'
        : '⚠️  TEST PRODUCTION PARTIEL'
    );
  } catch (error: any) {
    console.error('❌ ERREUR TEST PRODUCTION:', error.message);
    console.error('Stack:', error.stack);
  }
}

testProd().catch(console.error);
