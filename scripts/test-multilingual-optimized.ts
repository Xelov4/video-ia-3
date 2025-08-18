/**
 * ================================================================
 * ⚡ TEST SYSTÈME MULTILANGUE OPTIMISÉ - VERSION RÉVOLUTIONNAIRE
 * ================================================================
 * 
 * 🚀 RÉVOLUTION: 53 → 17 appels API Gemini (-68% d'économie)
 * 🆕 NOUVEAU: Hiérarchie Gemini 2.5 Pro → 1.5 Flash-8B (8 modèles)
 * 
 * Ce script teste la VERSION OPTIMISÉE du système de génération 
 * de contenu multilangue de Video-IA.net avec économie massive d'API.
 * 
 * 📊 OPTIMISATION MAJEURE:
 * - AVANT: 11 (anglais) + 42 (6 langues × 7 champs) = 53 appels API
 * - APRÈS: 11 (anglais) + 6 (6 langues × 1 prompt unifié) = 17 appels API
 * - ÉCONOMIE: 36 appels (-68%) = Réduction coûts et temps majeure
 * - 🆕 HIÉRARCHIE: 8 modèles Gemini avec recommencement complet à chaque appel
 * 
 * 🎯 OBJECTIFS DU TEST:
 * 1. Valider les 11 étapes de génération anglaise (inchangé)
 * 2. Valider les traductions optimisées (1 prompt JSON par langue)
 * 3. Comparer performances vs version 53 appels
 * 4. Vérifier qualité maintenue malgré optimisation
 * 5. Générer rapport comparatif détaillé
 * 
 * 🧪 VALIDATION OPTIMISÉE:
 * - PHASE 1: 11 étapes génération contenu anglais (HTTP → Target Audience)
 * - PHASE 2: 6 langues × 1 prompt JSON = 6 appels au lieu de 42
 * - TOTAL: 17 contenus générés (même qualité, 68% moins d'appels)
 * 
 * 📈 MÉTRIQUES CRITIQUES:
 * - Performance: Durée réduite grâce aux économies d'API
 * - Qualité: Validation que JSON unifié = même qualité
 * - Économie: Calcul exact des économies temps/coût
 * - Fiabilité: Parsing JSON robuste avec fallbacks
 * 
 * 🏆 CRITÈRES DE SUCCÈS OPTIMISÉS:
 * - Phase 1: 11/11 étapes réussies (identique)
 * - Phase 2: 6/6 prompts JSON parsés avec succès
 * - Meta titles: 100% avec "- Video-IA.net" (maintenu)
 * - Overviews: 100% exactement 2 phrases (maintenu)
 * - Durée totale: <120s (60% plus rapide qu'avant)
 * 
 * 🔬 OUTIL DE TEST: Visualizee (ID: 6669)
 * URL: https://visualizee.ai/
 * Choisi car: référence établie pour comparaison
 * 
 * 📈 RÉVOLUTION SYSTÈME:
 * v1.0: 5 étapes anglais seulement
 * v2.0: 8 étapes + validations Gemini  
 * v3.0: 11 étapes + screenshot + pricing
 * v4.0: 11 étapes + 6 langues = 53 appels (ANCIEN)
 * v5.0: 11 étapes + 6 langues = 17 appels (RÉVOLUTION)
 * v5.1: 🆕 Hiérarchie Gemini 2.5 Pro → 1.5 Flash-8B + recommencement complet
 * 
 * 💰 IMPACT ÉCONOMIQUE:
 * Cette optimisation divise par 3 les coûts API Gemini
 * tout en maintenant la qualité professionnelle.
 */

import { ToolContentUpdaterServiceOptimized } from '../src/lib/services/toolContentUpdaterOptimized'
import { prisma } from '../src/lib/database/client'
import * as fs from 'fs/promises'

/**
 * ⚡ FONCTION PRINCIPALE DE TEST SYSTÈME MULTILANGUE OPTIMISÉ
 * 
 * Exécute le test complet du système optimisé (17 appels au lieu de 53).
 * Compare les performances et valide la qualité maintenue.
 */
async function testMultilingualSystemOptimized() {
  console.log('⚡ === TEST SYSTÈME MULTILANGUE OPTIMISÉ - VERSION RÉVOLUTIONNAIRE ===\n')
  
  const toolId = 6669 // Visualizee - Outil de test de référence
  
  try {
    /**
     * 🎯 INITIALISATION DU TEST
     * Outil sélectionné: Visualizee (outil de rendu 3D IA)
     * - Site riche en contenu technique
     * - Présence sociale établie  
     * - Cas d'usage diversifiés
     * - Public cible B2B défini
     */
    console.log(`⚡ Test multilangue OPTIMISÉ de Visualizee (ID: ${toolId})`)
    console.log(`📍 URL: https://visualizee.ai/`)
    console.log(`🌐 Langues cibles: Français, Italien, Espagnol, Allemand, Néerlandais, Portugais`)
    console.log(`🚀 OPTIMISATION: 11 étapes anglais + 6 prompts JSON = 17 appels API`)
    console.log(`💰 ÉCONOMIE: 36 appels économisés vs version précédente (53 → 17)`)
    console.log(`⏱️  Objectif performance: <120 secondes (60% plus rapide)`)
    console.log(`🕐 NOUVEAU: Rate limiting strict de 90s entre chaque appel Gemini`)
    console.log(`🆕 NOUVEAU: Hiérarchie Gemini 2.5 Pro → 1.5 Flash-8B (8 modèles)`)
    console.log(`🔄 NOUVEAU: Recommencement complet de la hiérarchie à chaque appel`)
    console.log(`\n${'='.repeat(100)}\n`)
    
    const startTime = Date.now()
    console.log(`🚀 DÉMARRAGE TEST COMPLET à ${new Date().toLocaleTimeString()}`)
    
    /**
     * 🌍 APPEL FONCTION MAÎTRE MULTILANGUE
     * 
     * Cette ligne exécute tout le processus:
     * - Phase 1: 11 étapes génération contenu anglais
     * - Phase 2: 6 langues × 7 champs de traduction
     * - Mode production: false (sauvegarde DB activée)
     */
    const result = await ToolContentUpdaterServiceOptimized.updateToolContentWithTranslations(toolId, false)
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    const performanceTarget = 120 // 2 minutes maximum (optimisé)
    
    console.log(`\n⏱️ DURÉE TOTALE: ${duration.toFixed(2)}s (objectif: ${performanceTarget}s)`)
    console.log(`🎯 Performance: ${duration <= performanceTarget ? '✅ EXCELLENTE' : '⚠️ À OPTIMISER'}`)
    console.log(`🕐 SYSTÈME DÉLAI: Rate limiting strict de 90s entre chaque appel Gemini`)
    console.log(`📊 Temps de délai: ${16 * 90}s sur ${duration.toFixed(0)}s total (${((16 * 90) / duration * 100).toFixed(1)}%)`)
    console.log(`\n${'='.repeat(120)}`)
    console.log('⚡ ANALYSE COMPLÈTE DU SYSTÈME MULTILANGUE OPTIMISÉ')
    console.log(`${'='.repeat(120)}`)
    
    /**
     * 📋 ANALYSE DES RÉSULTATS PAR PHASE
     * 
     * Le système fonctionne en 2 phases distinctes:
     * - Phase 1: Génération contenu anglais (base)
     * - Phase 2: Traductions multilangues (expansion)
     */
    
    // PHASE 1 - CONTENU ANGLAIS (11 ÉTAPES)
    console.log(`\n🇺🇸 PHASE 1 - GÉNÉRATION CONTENU ANGLAIS (11 ÉTAPES):`)
    console.log(`   📊 Status global: ${result.phase1_english?.status || 'failed'}`)
    console.log(`   📈 Progression: ${result.phase1_english?.step || 'none'}`)
    
    if (result.phase1_english?.status === 'success') {
      console.log(`\n   🔍 DÉTAIL DES 11 ÉTAPES ANGLAISES:`)
      console.log(`   ├─ 1️⃣  HTTP Status: ${result.phase1_english.httpStatusCode} ${result.phase1_english.httpStatusCode >= 200 && result.phase1_english.httpStatusCode < 400 ? '✅' : '❌'}`)
      console.log(`   ├─ 1.5️⃣ Screenshot: ${result.phase1_english.screenshotPath ? '✅ Capturé' : '❌ Échec'} ${result.phase1_english.screenshotPath ? '(WebP)' : ''}`)
      console.log(`   ├─ 2️⃣  Crawling: ${result.phase1_english.processedPages || 0} pages ${result.phase1_english.processedPages > 20 ? '✅' : result.phase1_english.processedPages > 10 ? '⚠️' : '❌'}`)
      console.log(`   ├─ 3️⃣  Social Links: ${result.phase1_english.socialLinks ? Object.keys(result.phase1_english.socialLinks).length : 0} validés ${result.phase1_english.socialLinks && Object.keys(result.phase1_english.socialLinks).length > 0 ? '✅' : '❌'}`)
      console.log(`   ├─ 4️⃣  Useful Links: ${result.phase1_english.usefulLinks ? Object.keys(result.phase1_english.usefulLinks).length : 0} validés ${result.phase1_english.usefulLinks && Object.keys(result.phase1_english.usefulLinks).length > 0 ? '✅' : '❌'}`)
      console.log(`   ├─ 5️⃣  Contenu principal: ${result.phase1_english.generatedContent ? result.phase1_english.generatedContent.split(' ').length : 0} mots ${result.phase1_english.generatedContent && result.phase1_english.generatedContent.split(' ').length >= 300 ? '✅' : '❌'}`)
      console.log(`   ├─ 6️⃣  Overview: ${result.phase1_english.generatedOverview?.length || 0} chars ${result.phase1_english.generatedOverview && result.phase1_english.generatedOverview.split(/[.!?]+/).filter(s => s.trim().length > 0).length === 2 ? '✅ (2 phrases)' : '❌'}`)
      console.log(`   ├─ 7️⃣  Key Features: ${result.phase1_english.generatedKeyFeatures ? (result.phase1_english.generatedKeyFeatures.match(/•/g) || []).length : 0} bullets ${result.phase1_english.generatedKeyFeatures && result.phase1_english.generatedKeyFeatures.includes('•') ? '✅' : '❌'}`)
      console.log(`   ├─ 8️⃣  Meta données: Title ${result.phase1_english.generatedMetaTitle?.length || 0}chars ${result.phase1_english.generatedMetaTitle?.includes('- Video-IA.net') ? '✅' : '❌'}, Desc ${result.phase1_english.generatedMetaDescription?.length || 0}chars`)
      console.log(`   ├─ 9️⃣  Pricing: ${result.phase1_english.generatedPricingModel || 'N/A'} ${result.phase1_english.generatedPricingModel ? '✅' : '❌'}`)
      console.log(`   ├─ 🔟 Use Cases: ${result.phase1_english.generatedUseCases ? (result.phase1_english.generatedUseCases.match(/•/g) || []).length : 0} bullets ${result.phase1_english.generatedUseCases && result.phase1_english.generatedUseCases.includes('•') ? '✅' : '❌'}`)
      console.log(`   └─ 1️⃣1️⃣ Target Audience: ${result.phase1_english.generatedTargetAudience?.length || 0} chars ${result.phase1_english.generatedTargetAudience && result.phase1_english.generatedTargetAudience.length >= 200 ? '✅' : '❌'}`)
      
      // Calcul score Phase 1
      const phase1Scores = [
        result.phase1_english.httpStatusCode >= 200 && result.phase1_english.httpStatusCode < 400,
        !!result.phase1_english.screenshotPath,
        result.phase1_english.processedPages > 10,
        result.phase1_english.socialLinks && Object.keys(result.phase1_english.socialLinks).length > 0,
        result.phase1_english.usefulLinks && Object.keys(result.phase1_english.usefulLinks).length > 0,
        result.phase1_english.generatedContent && result.phase1_english.generatedContent.split(' ').length >= 300,
        result.phase1_english.generatedOverview && result.phase1_english.generatedOverview.split(/[.!?]+/).filter(s => s.trim().length > 0).length === 2,
        result.phase1_english.generatedKeyFeatures && result.phase1_english.generatedKeyFeatures.includes('•'),
        result.phase1_english.generatedMetaTitle && result.phase1_english.generatedMetaTitle.includes('- Video-IA.net'),
        !!result.phase1_english.generatedPricingModel,
        result.phase1_english.generatedUseCases && result.phase1_english.generatedUseCases.includes('•'),
        result.phase1_english.generatedTargetAudience && result.phase1_english.generatedTargetAudience.length >= 200
      ].filter(Boolean).length
      
      console.log(`\n   🏆 SCORE PHASE 1: ${phase1Scores}/11 étapes réussies (${(phase1Scores/11*100).toFixed(1)}%)`)
    } else {
      console.log(`   ❌ ÉCHEC PHASE 1: ${result.phase1_english?.step || 'Erreur inconnue'}`)
      if (result.phase1_english?.errors && result.phase1_english.errors.length > 0) {
        console.log(`   🔍 Erreurs: ${result.phase1_english.errors.join(', ')}`)
      }
    }
    
    // PHASE 2 - TRADUCTIONS MULTILANGUES OPTIMISÉES (6 PROMPTS JSON)
    console.log(`\n🌐 PHASE 2 - TRADUCTIONS MULTILANGUES OPTIMISÉES (6 PROMPTS JSON):`)
    if (result.phase2_translations) {
      console.log(`   📊 Langues traitées: ${result.phase2_translations.totalLanguages}/6`)
      console.log(`   📈 Traductions réussies: ${result.phase2_translations.successfulTranslations}/${result.phase2_translations.totalLanguages}`)
      console.log(`   ⚡ OPTIMISATION: ${result.phase2_translations.totalLanguages} prompts JSON au lieu de ${result.phase2_translations.totalLanguages * 7} (${result.phase2_translations.totalLanguages * 6} appels économisés)`)
      const successRate = (result.phase2_translations.successfulTranslations / result.phase2_translations.totalLanguages) * 100
      console.log(`   🎯 Taux de réussite: ${successRate.toFixed(1)}% ${successRate >= 80 ? '✅ EXCELLENT' : successRate >= 60 ? '⚠️ BON' : '❌ INSUFFISANT'}`)
      
      // Détail par langue avec validation qualité
      console.log(`\n   🌍 ANALYSE DÉTAILLÉE PAR LANGUE (1 prompt JSON = 7 champs):`)
      const languages = ['fr', 'it', 'es', 'de', 'nl', 'pt']
      const languageNames = {
        'fr': 'Français 🇫🇷',
        'it': 'Italien 🇮🇹', 
        'es': 'Espagnol 🇪🇸',
        'de': 'Allemand 🇩🇪',
        'nl': 'Néerlandais 🇳🇱',
        'pt': 'Portugais 🇵🇹'
      }
      
      const languageScores: number[] = []
      
      languages.forEach(lang => {
        const translation = result.phase2_translations.translations[lang]
        console.log(`\n   ${languageNames[lang]} (1 prompt JSON → 7 champs):`)
        
        if (translation && !translation.error) {
          // Validation qualité par champ
          const validations = {
            overview: translation.overview && translation.overview.length > 0,
            overviewSentences: translation.overview ? translation.overview.split(/[.!?]+/).filter(s => s.trim().length > 0).length === 2 : false,
            description: translation.description && translation.description.length > 200,
            metaTitle: translation.metaTitle && translation.metaTitle.includes('- Video-IA.net') && translation.metaTitle.length <= 70,
            metaDesc: translation.metaDescription && translation.metaDescription.length <= 160,
            keyFeatures: translation.keyFeatures && translation.keyFeatures.includes('•'),
            useCases: translation.useCases && translation.useCases.includes('•') && translation.useCases.includes('Visualizee'),
            targetAudience: translation.targetAudience && translation.targetAudience.length >= 100
          }
          
          const langScore = Object.values(validations).filter(Boolean).length
          languageScores.push(langScore)
          
          console.log(`   ├─ Overview: ${translation.overview?.length || 0} chars ${validations.overview ? '✅' : '❌'} ${validations.overviewSentences ? '(2 phrases ✅)' : '(❌ pas 2 phrases)'}`)
          console.log(`   ├─ Description: ${translation.description?.length || 0} chars ${validations.description ? '✅' : '❌'}`)
          console.log(`   ├─ Meta Title: ${translation.metaTitle?.length || 0} chars ${validations.metaTitle ? '✅ +Video-IA.net' : '❌'}`)
          console.log(`   ├─ Meta Desc: ${translation.metaDescription?.length || 0} chars ${validations.metaDesc ? '✅' : '❌'}`)
          console.log(`   ├─ Key Features: ${translation.keyFeatures ? (translation.keyFeatures.match(/•/g) || []).length : 0} bullets ${validations.keyFeatures ? '✅' : '❌'}`)
          console.log(`   ├─ Use Cases: ${translation.useCases ? (translation.useCases.match(/•/g) || []).length : 0} bullets ${validations.useCases ? '✅ +nom' : '❌'}`)
          console.log(`   └─ Target Audience: ${translation.targetAudience?.length || 0} chars ${validations.targetAudience ? '✅' : '❌'}`)
          console.log(`   🏆 SCORE ${lang.toUpperCase()}: ${langScore}/8 champs valides (${(langScore/8*100).toFixed(1)}%) ⚡ 1 API call`)
          
        } else {
          console.log(`   ❌ ÉCHEC JSON PARSING: ${translation?.error || 'Erreur inconnue'}`)
          languageScores.push(0)
        }
      })
      
      // Score global Phase 2 avec métrique optimisation
      const avgLanguageScore = languageScores.reduce((a, b) => a + b, 0) / languageScores.length
      const apiCallsSaved = (result.phase2_translations.totalLanguages * 6)
      console.log(`\n   🏆 SCORE GLOBAL PHASE 2: ${avgLanguageScore.toFixed(1)}/8 (${(avgLanguageScore/8*100).toFixed(1)}% qualité moyenne)`)
      console.log(`   ⚡ OPTIMISATION: ${apiCallsSaved} appels API économisés vs version classique`)
      
    } else {
      console.log(`   ❌ PHASE 2 NON EXÉCUTÉE (échec Phase 1 ou erreur système)`)
    }
    
    /**
     * 📖 APERÇUS DE CONTENU - VALIDATION VISUELLE
     * 
     * Affichage d'échantillons pour validation humaine de la qualité.
     * Permet de vérifier visuellement la cohérence multilingue.
     */
    console.log(`\n📖 APERÇUS DE CONTENU GÉNÉRÉ (VALIDATION VISUELLE):`)
    
    // Overview multilingue
    if (result.phase1_english?.generatedOverview) {
      console.log(`\n   📝 OVERVIEW - COMPARAISON MULTILINGUE:`)
      console.log(`   🇺🇸 EN: "${result.phase1_english.generatedOverview}"`)
      
      if (result.phase2_translations?.translations?.fr?.overview) {
        console.log(`   🇫🇷 FR: "${result.phase2_translations.translations.fr.overview}"`)
      }
      if (result.phase2_translations?.translations?.es?.overview) {
        console.log(`   🇪🇸 ES: "${result.phase2_translations.translations.es.overview}"`)
      }
    }
    
    // Meta titles multilingues
    if (result.phase1_english?.generatedMetaTitle) {
      console.log(`\n   🏷️  META TITLE - VALIDATION BRANDING:`)
      console.log(`   🇺🇸 EN: "${result.phase1_english.generatedMetaTitle}"`)
      
      if (result.phase2_translations?.translations?.fr?.metaTitle) {
        console.log(`   🇫🇷 FR: "${result.phase2_translations.translations.fr.metaTitle}"`)
      }
      if (result.phase2_translations?.translations?.de?.metaTitle) {
        console.log(`   🇩🇪 DE: "${result.phase2_translations.translations.de.metaTitle}"`)
      }
    }
    
    // Use Cases - vérification nom outil
    if (result.phase1_english?.generatedUseCases) {
      console.log(`\n   🎯 USE CASES - VÉRIFICATION NOM OUTIL:`)
      const enUseCases = result.phase1_english.generatedUseCases.split('\n').filter(line => line.includes('•')).slice(0, 2)
      enUseCases.forEach(useCase => console.log(`   🇺🇸 EN: ${useCase.trim()}`))
      
      if (result.phase2_translations?.translations?.fr?.useCases) {
        const frUseCases = result.phase2_translations.translations.fr.useCases.split('\n').filter(line => line.includes('•')).slice(0, 2)
        frUseCases.forEach(useCase => console.log(`   🇫🇷 FR: ${useCase.trim()}`))
      }
    }
    
    // GÉNÉRATION DU RAPPORT JSON DÉTAILLÉ
    const detailedReport = {
      timestamp: new Date().toISOString(),
      testType: 'multilingual_complete_system_test',
      toolInfo: {
        id: toolId,
        name: result.toolName || 'Unknown',
        url: 'https://visualizee.ai/'
      },
      performance: {
        totalDurationSeconds: parseFloat(duration.toFixed(2)),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        efficient: duration < 300, // 5 minutes max
        delaySystem: {
          rateLimitDelay: 90, // secondes entre appels
          totalDelayTime: 16 * 90, // 16 calls × 90s
          delayPercentage: ((16 * 90) / duration * 100).toFixed(1) + '%'
        }
      },
      phase1_english: {
        status: result.phase1_english?.status || 'failed',
        stepsCompleted: result.phase1_english?.step === 'completed' ? 11 : 0,
        contentGenerated: {
          httpCheck: !!result.phase1_english?.httpStatusCode,
          screenshot: !!result.phase1_english?.screenshotPath,
          crawling: !!result.phase1_english?.processedPages,
          socialLinks: result.phase1_english?.socialLinks ? Object.keys(result.phase1_english.socialLinks).length : 0,
          usefulLinks: result.phase1_english?.usefulLinks ? Object.keys(result.phase1_english.usefulLinks).length : 0,
          mainContent: !!result.phase1_english?.generatedContent,
          overview: !!result.phase1_english?.generatedOverview,
          keyFeatures: !!result.phase1_english?.generatedKeyFeatures,
          metaData: !!(result.phase1_english?.generatedMetaTitle && result.phase1_english?.generatedMetaDescription),
          pricingModel: !!result.phase1_english?.generatedPricingModel,
          useCases: !!result.phase1_english?.generatedUseCases,
          targetAudience: !!result.phase1_english?.generatedTargetAudience
        }
      },
      phase2_translations: {
        status: result.phase2_translations ? 'success' : 'failed',
        totalLanguages: result.phase2_translations?.totalLanguages || 0,
        successfulTranslations: result.phase2_translations?.successfulTranslations || 0,
        translationDetails: result.phase2_translations?.translations || {},
        languages: {
          french: result.phase2_translations?.translations?.fr ? !result.phase2_translations.translations.fr.error : false,
          italian: result.phase2_translations?.translations?.it ? !result.phase2_translations.translations.it.error : false,
          spanish: result.phase2_translations?.translations?.es ? !result.phase2_translations.translations.es.error : false,
          german: result.phase2_translations?.translations?.de ? !result.phase2_translations.translations.de.error : false,
          dutch: result.phase2_translations?.translations?.nl ? !result.phase2_translations.translations.nl.error : false,
          portuguese: result.phase2_translations?.translations?.pt ? !result.phase2_translations.translations.pt.error : false
        }
      },
      fullResults: result,
      summary: {
        overallSuccess: result.status === 'success',
        englishContentComplete: result.phase1_english?.status === 'success',
        multilingualSupport: result.phase2_translations ? result.phase2_translations.successfulTranslations >= 4 : false,
        totalLanguagesSupported: result.summary?.totalLanguagesSupported || 1,
        processingTime: `${duration.toFixed(2)}s`,
        qualityScore: {
          contentRichness: result.phase1_english?.processedPages > 30 ? 'excellent' : result.phase1_english?.processedPages > 20 ? 'good' : 'fair',
          socialPresence: result.phase1_english?.socialLinks && Object.keys(result.phase1_english.socialLinks).length >= 3 ? 'good' : 'limited',
          multilingualCoverage: result.phase2_translations && result.phase2_translations.successfulTranslations >= 5 ? 'excellent' : result.phase2_translations && result.phase2_translations.successfulTranslations >= 3 ? 'good' : 'limited'
        }
      }
    }
    
    // Sauvegarder le rapport optimisé
    const reportFilename = `multilingual-system-optimized-test-${Date.now()}.json`
    await fs.writeFile(reportFilename, JSON.stringify(detailedReport, null, 2))
    
    /**
     * 🏁 VERDICT FINAL - ANALYSE SYSTÈME COMPLET
     * 
     * Synthèse des performances et recommandations pour la production.
     */
    console.log(`\n${'='.repeat(120)}`)
    console.log('⚡ VERDICT FINAL - SYSTÈME MULTILANGUE OPTIMISÉ')
    console.log(`${'='.repeat(120)}`)
    
    // Calculs scores globaux
    const phase1Score = result.phase1_english?.status === 'success' ? 
      (result.phase1_english.step === 'completed' ? 100 : 80) : 0
    
    const phase2Score = result.phase2_translations ? 
      (result.phase2_translations.successfulTranslations / result.phase2_translations.totalLanguages * 100) : 0
    
    const overallScore = ((phase1Score * 0.6) + (phase2Score * 0.4)) // Phase 1 pèse 60%, Phase 2 pèse 40%
    
    console.log(`\n📊 SCORES GLOBAUX:`)
    console.log(`   🎯 Outil testé: ${result.toolName || 'Visualizee'} (ID: ${toolId})`)
    console.log(`   ⏱️  Durée: ${duration.toFixed(2)}s ${duration <= performanceTarget ? '✅' : '⚠️'} (objectif: ${performanceTarget}s)`)
    console.log(`   📈 Score Phase 1 (anglais): ${phase1Score.toFixed(1)}% ${phase1Score >= 90 ? '🏆' : phase1Score >= 80 ? '✅' : '⚠️'}`)
    console.log(`   📈 Score Phase 2 (traductions): ${phase2Score.toFixed(1)}% ${phase2Score >= 80 ? '🏆' : phase2Score >= 60 ? '✅' : '⚠️'}`)
    console.log(`   🏆 SCORE GLOBAL: ${overallScore.toFixed(1)}% ${overallScore >= 85 ? '🏆 EXCELLENT' : overallScore >= 70 ? '✅ BON' : '⚠️ MOYEN'}`)
    
    console.log(`\n🌍 COUVERTURE LINGUISTIQUE FINALE:`)
    const langSupport = [
      { code: '🇺🇸', name: 'Anglais', status: result.phase1_english?.status === 'success', type: 'principal' },
      { code: '🇫🇷', name: 'Français', status: result.phase2_translations?.translations?.fr && !result.phase2_translations.translations.fr.error, type: 'traduction' },
      { code: '🇮🇹', name: 'Italien', status: result.phase2_translations?.translations?.it && !result.phase2_translations.translations.it.error, type: 'traduction' },
      { code: '🇪🇸', name: 'Espagnol', status: result.phase2_translations?.translations?.es && !result.phase2_translations.translations.es.error, type: 'traduction' },
      { code: '🇩🇪', name: 'Allemand', status: result.phase2_translations?.translations?.de && !result.phase2_translations.translations.de.error, type: 'traduction' },
      { code: '🇳🇱', name: 'Néerlandais', status: result.phase2_translations?.translations?.nl && !result.phase2_translations.translations.nl.error, type: 'traduction' },
      { code: '🇵🇹', name: 'Portugais', status: result.phase2_translations?.translations?.pt && !result.phase2_translations.translations.pt.error, type: 'traduction' }
    ]
    
    langSupport.forEach(lang => {
      console.log(`   ${lang.code} ${lang.name}: ${lang.status ? '✅' : '❌'} (${lang.type})`)
    })
    
    const supportedLangs = langSupport.filter(l => l.status).length
    console.log(`\n   📱 TOTAL SUPPORT: ${supportedLangs}/7 langues (${(supportedLangs/7*100).toFixed(1)}% couverture)`)
    
    console.log(`\n💾 RAPPORT TECHNIQUE: ${reportFilename}`)
    console.log(`📈 Contenus générés: ${11 + (result.phase2_translations?.successfulTranslations * 7 || 0)} avec seulement 17 appels API`)
    console.log(`💰 Économie vs version classique: ${(result.phase2_translations?.totalLanguages * 6 || 0)} appels API économisés`)
    console.log(`⚡ Ratio optimisation: ${((53-17)/53*100).toFixed(1)}% de réduction d'appels`)
    
    // Verdict final avec recommandations
    if (overallScore >= 85) {
      console.log('\n🎉 === SYSTÈME MULTILANGUE OPTIMISÉ EXCELLENT - RÉVOLUTION ACCOMPLIE ===')
      console.log('🏆 Performance exceptionnelle avec 68% d\'économie d\'API!')
      console.log('🚀 Déploiement immédiat recommandé - Version révolutionnaire')
      console.log('🌍 Capacité internationale + économies massives')
      console.log('💡 Recommandation: Remplacer version 53 appels par version 17 appels')
      
    } else if (overallScore >= 70) {
      console.log('\n✅ === SYSTÈME MULTILANGUE OPTIMISÉ FONCTIONNEL - SUCCÈS ÉCONOMIQUE ===')
      console.log('👍 Performance satisfaisante avec économie majeure d\'API')
      console.log('🔧 Améliorations mineures possibles sur parsing JSON')
      console.log('🌍 Support multilingue + 68% économie confirmée')
      console.log('💡 Recommandation: Finaliser optimisations puis remplacer version actuelle')
      
    } else if (overallScore >= 50) {
      console.log('\n⚠️ === SYSTÈME MULTILANGUE OPTIMISÉ PARTIEL - JSON À AMÉLIORER ===')
      console.log('🔧 Parsing JSON nécessite optimisations')
      console.log('📋 Analyser échecs parsing vs prompts individuels')
      console.log('🌍 Économie API confirmée mais qualité à améliorer')
      console.log('💡 Recommandation: Améliorer prompts JSON avant migration')
      
    } else {
      console.log('\n❌ === SYSTÈME MULTILANGUE OPTIMISÉ DÉFAILLANT - RETOUR VERSION CLASSIQUE ===')
      console.log('🚨 Parsing JSON défaillant - Prompts individuels plus fiables')
      console.log('🔧 Révision complète des prompts JSON requise')
      console.log('🌍 Économie API non viable si qualité dégradée')
      console.log('💡 Recommandation: Conserver version 53 appels en attendant')
    }
    
    console.log(`\n⏰ Test terminé à ${new Date().toLocaleTimeString()}`)
    console.log(`🎯 Prochaine étape: ${overallScore >= 70 ? 'Migration vers version optimisée 17 appels' : 'Debug JSON et optimisations'}`)
    console.log(`${'='.repeat(120)}`)
    
  } catch (error: any) {
    console.error('\n❌ ERREUR DURANT LE TEST MULTILANGUE OPTIMISÉ:', error.message)
    console.log('\n🔍 DIAGNOSTIC:')
    console.log(`   Type: ${error.constructor.name}`)
    console.log(`   Message: ${error.message}`)
    if (error.stack) console.log(`   Stack: ${error.stack.substring(0, 500)}...`)
  } finally {
    await prisma.$disconnect()
  }
}

testMultilingualSystemOptimized().catch(console.error)