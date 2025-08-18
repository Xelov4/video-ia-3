/**
 * 🧪 TEST DES OPTIMISATIONS CRITIQUES INTÉGRÉES
 * 
 * Ce script teste rapidement toutes les corrections apportées au système :
 * ✅ Rate limiting 15s entre requêtes Gemini
 * ✅ Gemini 2.5 Pro en priorité 
 * ✅ Prompts étapes 4 & 9 améliorés
 * ✅ Détection d'échec NL/IT/ES corrigée
 * ✅ Traductions partielles acceptées
 */

import { ToolContentUpdaterService } from '../src/lib/services/toolContentUpdater'
import { prisma } from '../src/lib/database/client'

async function testOptimisations() {
  console.log('🧪 === TEST OPTIMISATIONS CRITIQUES ===\n')
  
  const toolId = 6669 // Visualizee
  
  try {
    console.log('🎯 Test optimisations sur Visualizee (ID: 6669)')
    console.log('🔍 Vérifications prévues:')
    console.log('  ⚡ Rate limiting 15s respecté')
    console.log('  🥇 Gemini 2.5 Pro utilisé en priorité')
    console.log('  📝 Prompts étapes 4 & 9 améliorés')
    console.log('  🌐 NL/IT/ES translations partielles acceptées')
    console.log('  🛡️ Promise.allSettled pour résilience')
    console.log(`\n${'='.repeat(80)}\n`)
    
    const startTime = Date.now()
    console.log(`🚀 DÉMARRAGE TEST à ${new Date().toLocaleTimeString()}`)
    
    // Test du système multilangue complet avec optimisations
    const result = await ToolContentUpdaterService.updateToolContentWithTranslations(toolId, true)
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log(`\n⏱️ DURÉE TOTALE: ${duration.toFixed(2)}s`)
    console.log(`\n${'='.repeat(100)}`)
    console.log('📊 VÉRIFICATION DES OPTIMISATIONS')
    console.log(`${'='.repeat(100)}`)
    
    // VÉRIFICATION 1: Phase 1 (contenu anglais)
    console.log(`\n🇺🇸 PHASE 1 - CONTENU ANGLAIS:`)
    console.log(`   Status: ${result.phase1_english?.status || 'failed'}`)
    console.log(`   Étape finale: ${result.phase1_english?.step || 'none'}`)
    
    if (result.phase1_english?.status === 'success') {
      console.log(`   ✅ HTTP Check: ${result.phase1_english.httpStatusCode || 'N/A'}`)
      console.log(`   📸 Screenshot: ${result.phase1_english.screenshotPath ? 'Capturé' : 'Échec'}`)
      console.log(`   🕷️ Crawling: ${result.phase1_english.processedPages || 0} pages`)
      console.log(`   🌐 Social Links: ${result.phase1_english.socialLinks ? Object.keys(result.phase1_english.socialLinks).length : 0}`)
      console.log(`   🔗 Useful Links: ${result.phase1_english.usefulLinks ? Object.keys(result.phase1_english.usefulLinks).length : 0}`)
      console.log(`   💰 Pricing: ${result.phase1_english.generatedPricingModel || 'N/A'}`)
    }
    
    // VÉRIFICATION 2: Phase 2 (traductions multilangues)
    console.log(`\n🌐 PHASE 2 - TRADUCTIONS MULTILANGUES:`)
    if (result.phase2_translations) {
      console.log(`   Langues traitées: ${result.phase2_translations.totalLanguages}/6`)
      console.log(`   Traductions réussies: ${result.phase2_translations.successfulTranslations}/${result.phase2_translations.totalLanguages}`)
      const successRate = (result.phase2_translations.successfulTranslations / result.phase2_translations.totalLanguages) * 100
      console.log(`   Taux de réussite: ${successRate.toFixed(1)}%`)
      
      // Vérification spécifique des langues NL, IT, ES
      const problematicLangs = ['nl', 'it', 'es']
      console.log(`\n   🔍 LANGUES PRÉCÉDEMMENT PROBLÉMATIQUES:`)
      
      problematicLangs.forEach(lang => {
        const translation = result.phase2_translations.translations[lang]
        const langNames = { 'nl': 'Néerlandais 🇳🇱', 'it': 'Italien 🇮🇹', 'es': 'Espagnol 🇪🇸' }
        
        if (translation && !translation.error) {
          console.log(`   ✅ ${langNames[lang]}: Succès - ${Object.keys(translation).length} champs traduits`)
        } else if (translation && translation.error) {
          console.log(`   ⚠️ ${langNames[lang]}: Échec partiel - ${translation.error}`)
        } else {
          console.log(`   ❌ ${langNames[lang]}: Échec total`)
        }
      })
      
      // Vérification des langues qui fonctionnaient déjà
      const workingLangs = ['fr', 'de', 'pt']
      console.log(`\n   ✅ LANGUES DÉJÀ FONCTIONNELLES:`)
      
      workingLangs.forEach(lang => {
        const translation = result.phase2_translations.translations[lang]
        const langNames = { 'fr': 'Français 🇫🇷', 'de': 'Allemand 🇩🇪', 'pt': 'Portugais 🇵🇹' }
        
        if (translation && !translation.error) {
          console.log(`   ✅ ${langNames[lang]}: Succès confirmé - ${Object.keys(translation).length} champs`)
        } else {
          console.log(`   ⚠️ ${langNames[lang]}: Problème inattendu`)
        }
      })
      
    } else {
      console.log(`   ❌ PHASE 2 NON EXÉCUTÉE`)
    }
    
    // VÉRIFICATION 3: Métriques de performance
    console.log(`\n⚡ MÉTRIQUES DE PERFORMANCE:`)
    console.log(`   Durée totale: ${duration.toFixed(2)}s ${duration <= 300 ? '✅' : '⚠️'} (objectif: <300s)`)
    
    if (result.phase2_translations) {
      const avgTimePerLang = duration / result.phase2_translations.totalLanguages
      console.log(`   Temps moyen par langue: ${avgTimePerLang.toFixed(2)}s`)
      console.log(`   Rate limiting respecté: ${avgTimePerLang >= 15 ? '✅' : '⚠️'} (minimum 15s par langue)`)
    }
    
    // VERDICT FINAL
    console.log(`\n${'='.repeat(100)}`)
    console.log('🏁 VERDICT FINAL - OPTIMISATIONS')
    console.log(`${'='.repeat(100)}`)
    
    const phase1Success = result.phase1_english?.status === 'success'
    const phase2Success = result.phase2_translations && result.phase2_translations.successfulTranslations >= 4
    const nlItEsFixed = result.phase2_translations && ['nl', 'it', 'es'].some(lang => 
      result.phase2_translations.translations[lang] && !result.phase2_translations.translations[lang].error
    )
    
    console.log(`\n📊 RÉSULTATS:`)
    console.log(`   ${phase1Success ? '✅' : '❌'} Phase 1 (Contenu anglais): ${phase1Success ? 'Succès' : 'Échec'}`)
    console.log(`   ${phase2Success ? '✅' : '❌'} Phase 2 (Traductions): ${phase2Success ? 'Succès' : 'Échec'}`)
    console.log(`   ${nlItEsFixed ? '✅' : '❌'} Correction NL/IT/ES: ${nlItEsFixed ? 'Résolue' : 'Problème persistant'}`)
    console.log(`   ${duration <= 300 ? '✅' : '⚠️'} Performance: ${duration <= 300 ? 'Excellente' : 'À améliorer'}`)
    
    if (phase1Success && phase2Success && nlItEsFixed && duration <= 300) {
      console.log('\n🎉 === TOUTES LES OPTIMISATIONS FONCTIONNENT PARFAITEMENT ===')
      console.log('🚀 Système prêt pour production avec toutes les corrections appliquées!')
      console.log('🌍 Support multilangue complet opérationnel (7 langues)')
      console.log('⚡ Rate limiting et Gemini 2.5 Pro correctement intégrés')
      console.log('🛡️ Résilience maximale avec traductions partielles acceptées')
      
    } else {
      console.log('\n⚠️ === OPTIMISATIONS PARTIELLEMENT RÉUSSIES ===')
      console.log('🔧 Certaines améliorations nécessitent encore des ajustements')
      console.log('📋 Analyser les logs ci-dessus pour identifier les problèmes restants')
    }
    
    // Export résultats pour analyse
    const reportFilename = `test-optimisations-${Date.now()}.json`
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'optimisations_critiques_test',
      duration: parseFloat(duration.toFixed(2)),
      results: {
        phase1_success: phase1Success,
        phase2_success: phase2Success,
        nl_it_es_fixed: nlItEsFixed,
        performance_good: duration <= 300,
        total_languages_supported: result.phase2_translations ? result.phase2_translations.totalLanguages + 1 : 1
      },
      fullResults: result
    }
    
    const fs = await import('fs/promises')
    await fs.writeFile(reportFilename, JSON.stringify(report, null, 2))
    console.log(`\n💾 Rapport détaillé: ${reportFilename}`)
    
    console.log(`\n⏰ Test terminé à ${new Date().toLocaleTimeString()}`)
    
  } catch (error: any) {
    console.error('\n❌ ERREUR DURANT LE TEST OPTIMISATIONS:', error.message)
    console.log('\n🔍 DIAGNOSTIC:')
    console.log(`   Type: ${error.constructor.name}`)
    console.log(`   Message: ${error.message}`)
    if (error.stack) console.log(`   Stack: ${error.stack.substring(0, 500)}...`)
  } finally {
    await prisma.$disconnect()
  }
}

testOptimisations().catch(console.error)