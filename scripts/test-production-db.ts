/**
 * ================================================================
 * 🚀 TEST PRODUCTION DB - SYSTÈME MULTILANGUE OPTIMISÉ
 * ================================================================
 *
 * 🎯 OBJECTIF: Tester le système en mode PRODUCTION avec connexion DB réelle
 *
 * ⚠️  ATTENTION: Ce script va MODIFIER la base de données
 * - Sauvegarde des contenus générés
 * - Sauvegarde des traductions multilangues
 * - Sauvegarde des métadonnées et liens
 *
 * 🔧 MODE: Production (testMode = false)
 * 📊 VALIDATION: Vérification complète de la persistance des données
 *
 * 🧪 OUTIL DE TEST: Visualizee (ID: 6669)
 * URL: https://visualizee.ai/
 *
 * 📈 MÉTRIQUES À VALIDER:
 * - Contenus anglais: 11 champs sauvegardés
 * - Traductions: 6 langues × 7 champs = 42 traductions
 * - Liens sociaux et utiles
 * - Screenshot et métadonnées
 *
 * 💾 VÉRIFICATIONS DB:
 * - Tool table: Contenu anglais mis à jour
 * - ToolTranslation table: 6 langues ajoutées
 * - ToolSocialLink table: Liens sociaux sauvegardés
 * - ToolUsefulLink table: Liens utiles sauvegardés
 */

import { ToolContentUpdaterServiceOptimized } from '../src/lib/services/toolContentUpdaterOptimized';
import { prisma } from '../src/lib/database/client';
import * as fs from 'fs/promises';

/**
 * 🚀 FONCTION PRINCIPALE DE TEST PRODUCTION
 *
 * Exécute le test complet en mode production avec sauvegarde DB.
 * Valide que toutes les données sont correctement persistées.
 */
async function testProductionDatabase() {
  console.log('🚀 === TEST PRODUCTION DB - SYSTÈME MULTILANGUE OPTIMISÉ ===\n');

  const toolId = 6669; // Visualizee - Outil de test de référence

  try {
    /**
     * 🎯 INITIALISATION DU TEST PRODUCTION
     */
    console.log(`🚀 Test PRODUCTION de Visualizee (ID: ${toolId})`);
    console.log(`📍 URL: https://visualizee.ai/`);
    console.log(
      `🌐 Langues cibles: Français, Italien, Espagnol, Allemand, Néerlandais, Portugais`
    );
    console.log(`🔧 MODE: Production (testMode = false)`);
    console.log(`💾 DB: Sauvegarde complète activée`);
    console.log(`⚠️  ATTENTION: Base de données sera modifiée`);
    console.log(`\n${'='.repeat(100)}\n`);

    const startTime = Date.now();
    console.log(`🚀 DÉMARRAGE TEST PRODUCTION à ${new Date().toLocaleTimeString()}`);

    // Vérifier l'état initial de l'outil
    console.log(`🔍 Vérification état initial de l'outil ${toolId}...`);
    const initialTool = await prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        translations: true,
        // ✅ Accès direct aux champs de la table Tool (pas de relations séparées)
      },
    });

    if (!initialTool) {
      throw new Error(`Outil ${toolId} non trouvé en base de données`);
    }

    console.log(`✅ Outil initial trouvé: ${initialTool.toolName}`);
    console.log(`📊 Traductions existantes: ${initialTool.translations.length}`);

    // ✅ Vérification des liens sociaux stockés directement dans la table Tool
    const initialSocialLinks = [
      initialTool.socialLinkedin && 'LinkedIn',
      initialTool.socialFacebook && 'Facebook',
      initialTool.socialX && 'X/Twitter',
      initialTool.socialGithub && 'GitHub',
      initialTool.socialDiscord && 'Discord',
      initialTool.socialInstagram && 'Instagram',
      initialTool.socialTiktok && 'TikTok',
    ].filter(Boolean);

    const initialUsefulLinks = [
      initialTool.docsLink && 'Documentation',
      initialTool.affiliateLink && 'Affiliate',
      initialTool.changelogLink && 'Changelog',
      initialTool.mailAddress && 'Mail',
    ].filter(Boolean);

    console.log(
      `🔗 Liens sociaux existants: ${initialSocialLinks.length} (${initialSocialLinks.join(', ')})`
    );
    console.log(
      `🔗 Liens utiles existants: ${initialUsefulLinks.length} (${initialUsefulLinks.join(', ')})`
    );

    /**
     * 🌍 APPEL FONCTION MAÎTRE MULTILANGUE EN MODE PRODUCTION
     *
     * testMode = false → Sauvegarde DB activée
     */
    console.log(
      `\n🌍 === MISE À JOUR COMPLÈTE AVEC TRADUCTIONS MULTILANGUES (MODE PRODUCTION) ===`
    );

    const result =
      await ToolContentUpdaterServiceOptimized.updateToolContentWithTranslations(
        toolId,
        false
      );

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`\n⏱️  DURÉE TOTALE: ${duration.toFixed(2)} secondes`);

    /**
     * 📊 VÉRIFICATION POST-TRAITEMENT EN BASE DE DONNÉES
     */
    console.log(`\n🔍 === VÉRIFICATION POST-TRAITEMENT EN BASE DE DONNÉES ===`);

    const finalTool = await prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        translations: true,
        // ✅ Accès direct aux champs de la table Tool (pas de relations séparées)
      },
    });

    if (!finalTool) {
      throw new Error(`Outil ${toolId} non trouvé après traitement`);
    }

    console.log(`\n📊 COMPARAISON AVANT/APRÈS:`);
    console.log(`   🎯 Nom: ${finalTool.toolName}`);
    console.log(
      `   📝 Description: ${finalTool.toolDescription ? '✅ Mise à jour' : '❌ Non mise à jour'}`
    );
    console.log(
      `   📖 Overview: ${finalTool.overview ? '✅ Mise à jour' : '❌ Non mise à jour'}`
    );
    console.log(
      `   🔑 Key Features: ${finalTool.keyFeatures ? '✅ Mise à jour' : '❌ Non mise à jour'}`
    );
    console.log(
      `   🎯 Use Cases: ${finalTool.useCases ? '✅ Mise à jour' : '❌ Non mise à jour'}`
    );
    console.log(
      `   👥 Target Audience: ${finalTool.targetAudience ? '✅ Mise à jour' : '❌ Non mise à jour'}`
    );
    console.log(
      `   💰 Pricing Model: ${finalTool.pricingModel ? '✅ Mise à jour' : '❌ Non mise à jour'}`
    );
    console.log(
      `   🖼️  Image URL: ${finalTool.imageUrl ? '✅ Mise à jour' : '❌ Non mise à jour'}`
    );

    console.log(`\n🌍 TRADUCTIONS MULTILANGUES:`);
    const translationsByLang = finalTool.translations.reduce(
      (acc, t) => {
        acc[t.languageCode] = acc[t.languageCode] || [];
        acc[t.languageCode].push(t);
        return acc;
      },
      {} as Record<string, any[]>
    );

    Object.entries(translationsByLang).forEach(([lang, trans]) => {
      console.log(`   ${lang.toUpperCase()}: ${trans.length} champs traduits`);
      trans.forEach(t => {
        console.log(`     - ${t.name}: ${t.overview || t.description ? '✅' : '❌'}`);
      });
    });

    console.log(`\n🔗 LIENS SOCIAUX (stockés directement dans la table Tool):`);
    if (finalTool.socialLinkedin)
      console.log(`   LinkedIn: ${finalTool.socialLinkedin} ✅`);
    if (finalTool.socialFacebook)
      console.log(`   Facebook: ${finalTool.socialFacebook} ✅`);
    if (finalTool.socialX) console.log(`   X/Twitter: ${finalTool.socialX} ✅`);
    if (finalTool.socialGithub) console.log(`   GitHub: ${finalTool.socialGithub} ✅`);
    if (finalTool.socialDiscord)
      console.log(`   Discord: ${finalTool.socialDiscord} ✅`);
    if (finalTool.socialInstagram)
      console.log(`   Instagram: ${finalTool.socialInstagram} ✅`);
    if (finalTool.socialTiktok) console.log(`   TikTok: ${finalTool.socialTiktok} ✅`);

    console.log(`\n🔗 LIENS UTILES (stockés directement dans la table Tool):`);
    if (finalTool.docsLink) console.log(`   Documentation: ${finalTool.docsLink} ✅`);
    if (finalTool.affiliateLink)
      console.log(`   Affiliate: ${finalTool.affiliateLink} ✅`);
    if (finalTool.changelogLink)
      console.log(`   Changelog: ${finalTool.changelogLink} ✅`);
    if (finalTool.mailAddress) console.log(`   Email: ${finalTool.mailAddress} ✅`);

    /**
     * 📈 RAPPORT DE VALIDATION PRODUCTION
     */
    const validationReport = {
      toolId,
      toolName: finalTool.toolName,
      testMode: false,
      timestamp: new Date().toISOString(),
      duration,
      result,
      databaseValidation: {
        toolUpdated: !!finalTool.toolDescription,
        translationsCount: finalTool.translations.length,
        socialLinksCount: [
          finalTool.socialLinkedin,
          finalTool.socialFacebook,
          finalTool.socialX,
          finalTool.socialGithub,
          finalTool.socialDiscord,
          finalTool.socialInstagram,
          finalTool.socialTiktok,
        ].filter(Boolean).length,
        usefulLinksCount: [
          finalTool.docsLink,
          finalTool.affiliateLink,
          finalTool.changelogLink,
          finalTool.mailAddress,
        ].filter(Boolean).length,
        translationsByLanguage: Object.keys(translationsByLang).length,
      },
      beforeAfter: {
        initialTranslations: initialTool.translations.length,
        finalTranslations: finalTool.translations.length,
        initialSocialLinks: [
          initialTool.socialLinkedin,
          initialTool.socialFacebook,
          initialTool.socialX,
          initialTool.socialGithub,
          initialTool.socialDiscord,
          initialTool.socialInstagram,
          initialTool.socialTiktok,
        ].filter(Boolean).length,
        finalSocialLinks: [
          finalTool.socialLinkedin,
          finalTool.socialFacebook,
          finalTool.socialX,
          finalTool.socialGithub,
          finalTool.socialDiscord,
          finalTool.socialInstagram,
          finalTool.socialTiktok,
        ].filter(Boolean).length,
        initialUsefulLinks: [
          initialTool.docsLink,
          initialTool.affiliateLink,
          initialTool.changelogLink,
          initialTool.mailAddress,
        ].filter(Boolean).length,
        finalUsefulLinks: [
          finalTool.docsLink,
          finalTool.affiliateLink,
          finalTool.changelogLink,
          finalTool.mailAddress,
        ].filter(Boolean).length,
      },
    };

    // Sauvegarder le rapport de validation
    const reportFilename = `production-db-validation-${Date.now()}.json`;
    await fs.writeFile(reportFilename, JSON.stringify(validationReport, null, 2));

    /**
     * 🏁 VERDICT FINAL - VALIDATION PRODUCTION
     */
    console.log(`\n${'='.repeat(120)}`);
    console.log('🚀 VERDICT FINAL - TEST PRODUCTION BASE DE DONNÉES');
    console.log(`${'='.repeat(120)}`);

    const translationsSuccess = finalTool.translations.length >= 30; // Au moins 5 langues × 6 champs
    const contentSuccess = !!finalTool.toolDescription && !!finalTool.overview;

    // ✅ Validation des liens stockés directement dans la table Tool
    const finalSocialLinksCount = [
      finalTool.socialLinkedin,
      finalTool.socialFacebook,
      finalTool.socialX,
      finalTool.socialGithub,
      finalTool.socialDiscord,
      finalTool.socialInstagram,
      finalTool.socialTiktok,
    ].filter(Boolean).length;

    const finalUsefulLinksCount = [
      finalTool.docsLink,
      finalTool.affiliateLink,
      finalTool.changelogLink,
      finalTool.mailAddress,
    ].filter(Boolean).length;

    const linksSuccess = finalSocialLinksCount > 0 || finalUsefulLinksCount > 0;

    console.log(`\n📊 VALIDATION PRODUCTION:`);
    console.log(`   🎯 Outil: ${finalTool.toolName} (ID: ${toolId})`);
    console.log(`   ⏱️  Durée: ${duration.toFixed(2)}s`);
    console.log(`   📝 Contenu anglais: ${contentSuccess ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
    console.log(
      `   🌍 Traductions: ${translationsSuccess ? '✅ SUCCÈS' : '❌ ÉCHEC'} (${finalTool.translations.length} champs)`
    );
    console.log(
      `   🔗 Liens: ${linksSuccess ? '✅ SUCCÈS' : '❌ ÉCHEC'} (${finalSocialLinksCount + finalUsefulLinksCount} liens)`
    );

    const overallSuccess = translationsSuccess && contentSuccess && linksSuccess;

    if (overallSuccess) {
      console.log(
        `\n🎉 === TEST PRODUCTION RÉUSSI - SYSTÈME PRÊT POUR LA PRODUCTION ===`
      );
      console.log('🏆 Toutes les validations sont passées avec succès');
      console.log('💾 Base de données correctement mise à jour');
      console.log('🌍 Traductions multilangues persistées');
      console.log('🚀 Système recommandé pour la production');
    } else {
      console.log(`\n⚠️ === TEST PRODUCTION PARTIEL - VÉRIFICATIONS REQUISES ===`);
      console.log('🔧 Certaines validations ont échoué');
      console.log('📋 Analyser le rapport détaillé');
      console.log('💡 Vérifier la configuration de la base de données');
    }

    console.log(`\n💾 RAPPORT DE VALIDATION: ${reportFilename}`);
    console.log(`📊 Traductions créées: ${finalTool.translations.length}`);
    console.log(`🔗 Liens sociaux sauvegardés: ${finalSocialLinksCount}`);
    console.log(`🔗 Liens utiles sauvegardés: ${finalUsefulLinksCount}`);
    console.log(
      `🔗 Total liens sauvegardés: ${finalSocialLinksCount + finalUsefulLinksCount}`
    );
    console.log(`⏰ Test terminé à ${new Date().toLocaleTimeString()}`);
    console.log(`${'='.repeat(120)}`);
  } catch (error: any) {
    console.error('\n❌ ERREUR DURANT LE TEST PRODUCTION:', error.message);
    console.log('\n🔍 DIAGNOSTIC:');
    console.log(`   Type: ${error.constructor.name}`);
    console.log(`   Message: ${error.message}`);
    if (error.stack) console.log(`   Stack: ${error.stack.substring(0, 500)}...`);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du test production
testProductionDatabase().catch(console.error);
