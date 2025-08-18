/**
 * Test direct en TypeScript pour SommerAI
 * Exécute toutes les 5 étapes avec output détaillé
 */

import { ToolContentUpdaterService } from '../src/lib/services/toolContentUpdater'
import { prisma } from '../src/lib/database/client'
import * as fs from 'fs/promises'

async function testSommerAI() {
  console.log('🚀 === TEST COMPLET VISUALIZEE - 8 ÉTAPES ===\n')
  
  const toolId = 6669 // Visualizee
  
  try {
    console.log(`🎯 Test de Visualizee (ID: ${toolId})`)
    console.log(`📍 URL: https://visualizee.ai/`)
    console.log(`\n${'='.repeat(60)}\n`)
    
    const startTime = Date.now()
    
    // LANCER LE TEST COMPLET
    const result = await ToolContentUpdaterService.updateToolContent(toolId, true)
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log(`\n⏱️ DURÉE TOTALE: ${duration.toFixed(2)}s`)
    console.log(`\n${'='.repeat(80)}`)
    console.log('📊 RÉSULTAT DÉTAILLÉ DES 8 ÉTAPES')
    console.log(`${'='.repeat(80)}`)
    
    // AFFICHAGE DÉTAILLÉ
    console.log(`\n🏷️  INFORMATIONS GÉNÉRALES:`)
    console.log(`   Nom: ${result.toolName}`)
    console.log(`   ID: ${result.toolId}`)
    console.log(`   Status final: ${result.status}`)
    console.log(`   Étape atteinte: ${result.step}`)
    
    console.log(`\n🔍 ÉTAPE 1 - HTTP STATUS CHECK:`)
    if (result.httpStatusCode) {
      console.log(`   ✅ Code HTTP: ${result.httpStatusCode}`)
      console.log(`   ${result.isActive ? '🟢' : '🔴'} Status actif: ${result.isActive}`)
      if (result.httpStatusCode >= 200 && result.httpStatusCode < 300) {
        console.log(`   ✅ URL accessible et valide`)
      } else if (result.httpStatusCode >= 300 && result.httpStatusCode < 400) {
        console.log(`   ⚠️ Redirection détectée mais URL fonctionnelle`)
      } else {
        console.log(`   ❌ URL non accessible`)
      }
    } else {
      console.log(`   ❌ Impossible de récupérer le code HTTP`)
    }
    
    console.log(`\n🕷️  ÉTAPE 2 - CRAWLING (MAX 50 PAGES):`)
    if (result.processedPages !== undefined) {
      console.log(`   📄 Pages crawlées avec succès: ${result.processedPages}`)
      if (result.processedPages > 0) {
        console.log(`   ✅ Crawling réussi`)
        console.log(`   📊 Efficacité: ${((result.processedPages / 50) * 100).toFixed(1)}% du maximum`)
      } else {
        console.log(`   ❌ Aucune page crawlée`)
      }
    } else {
      console.log(`   ❌ Crawling non effectué`)
    }
    
    console.log(`\n🌐 ÉTAPE 3 - EXTRACTION RÉSEAUX SOCIAUX:`)
    if (result.socialLinks && Object.keys(result.socialLinks).length > 0) {
      console.log(`   ✅ ${Object.keys(result.socialLinks).length} réseaux sociaux détectés:`)
      Object.entries(result.socialLinks).forEach(([platform, url]) => {
        const platformEmoji = {
          socialLinkedin: '💼',
          socialFacebook: '📘', 
          socialX: '🐦',
          socialGithub: '🐙',
          socialDiscord: '🎮',
          socialInstagram: '📷',
          socialTiktok: '🎵'
        }
        console.log(`     ${platformEmoji[platform] || '🔗'} ${platform.replace('social', '').charAt(0).toUpperCase() + platform.replace('social', '').slice(1)}: ${url}`)
      })
    } else {
      console.log(`   ❌ Aucun réseau social détecté`)
      console.log(`   💡 Les patterns recherchés : LinkedIn, Facebook, X/Twitter, GitHub, Discord, Instagram, TikTok`)
    }
    
    console.log(`\n🔗 ÉTAPE 4 - EXTRACTION LIENS UTILES:`)
    if (result.usefulLinks && Object.keys(result.usefulLinks).length > 0) {
      console.log(`   ✅ ${Object.keys(result.usefulLinks).length} liens utiles détectés:`)
      Object.entries(result.usefulLinks).forEach(([type, url]) => {
        const linkEmoji = {
          mailAddress: '📧',
          docsLink: '📚',
          affiliateLink: '🤝',
          changelogLink: '📝'
        }
        const typeName = {
          mailAddress: 'Email de contact',
          docsLink: 'Documentation',
          affiliateLink: 'Lien d\'affiliation',
          changelogLink: 'Changelog/Mises à jour'
        }
        console.log(`     ${linkEmoji[type] || '🔗'} ${typeName[type] || type}: ${url}`)
      })
    } else {
      console.log(`   ❌ Aucun lien utile détecté`)
      console.log(`   💡 Recherche : emails, docs, liens d'affiliation, changelogs`)
    }
    
    console.log(`\n✍️  ÉTAPE 5 - GÉNÉRATION DE CONTENU IA:`)
    if (result.generatedContent) {
      console.log(`   ✅ Contenu généré avec succès`)
      console.log(`   📏 Longueur: ${result.generatedContent.length} caractères`)
      
      // Analyser la structure
      const h2Titles = result.generatedContent.match(/## .+/g) || []
      const wordCount = result.generatedContent.split(' ').length
      const hasRequiredTitle = result.generatedContent.includes("What's ")
      
      console.log(`   📊 Analyse de la structure:`)
      console.log(`     - Nombre de mots: ${wordCount}`)
      console.log(`     - Sections H2: ${h2Titles.length}`)
      console.log(`     - Titre requis "What's...": ${hasRequiredTitle ? '✅' : '❌'}`)
      console.log(`     - Longueur minimale (300 mots): ${wordCount >= 300 ? '✅' : '❌'}`)
      
      if (h2Titles.length > 0) {
        console.log(`   📋 Sections détectées:`)
        h2Titles.forEach((title, index) => {
          console.log(`     ${index + 1}. ${title}`)
        })
      }
      
      console.log(`\n📖 APERÇU DU CONTENU GÉNÉRÉ:`)
      console.log(`${'-'.repeat(80)}`)
      console.log(result.generatedContent.substring(0, 600) + '...')
      console.log(`${'-'.repeat(80)}`)
    } else {
      console.log(`   ❌ Pas de contenu généré`)
    }
    
    console.log(`\n❌ ERREURS RENCONTRÉES:`)
    if (result.errors && result.errors.length > 0) {
      console.log(`   ⚠️  ${result.errors.length} erreur(s):`)
      result.errors.forEach((error, index) => {
        console.log(`     ${index + 1}. ${error}`)
      })
    } else {
      console.log(`   ✅ Aucune erreur - Traitement parfait !`)
    }
    
    // GÉNÉRATION DU RAPPORT JSON COMPLET
    const detailedReport = {
      timestamp: new Date().toISOString(),
      testType: 'complete_real_tool_test',
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
        efficient: duration < 60
      },
      stepByStepResults: {
        step1_httpCheck: {
          name: "Test HTTP Status & URL Validation",
          completed: !!result.httpStatusCode,
          success: result.httpStatusCode >= 200 && result.httpStatusCode < 400,
          data: {
            httpStatusCode: result.httpStatusCode,
            isActive: result.isActive,
            urlAccessible: result.httpStatusCode >= 200 && result.httpStatusCode < 400
          }
        },
        step2_crawling: {
          name: "Website Crawling (Max 50 pages)",
          completed: result.processedPages !== undefined,
          success: result.processedPages > 0,
          data: {
            pagesProcessed: result.processedPages || 0,
            efficiency: result.processedPages ? ((result.processedPages / 50) * 100).toFixed(1) + '%' : '0%',
            tempFolderCreated: true
          }
        },
        step3_socialExtraction: {
          name: "Social Media Links Extraction", 
          completed: !!result.socialLinks,
          success: result.socialLinks && Object.keys(result.socialLinks).length > 0,
          data: {
            linksFound: result.socialLinks ? Object.keys(result.socialLinks).length : 0,
            socialLinks: result.socialLinks || {},
            platformsSupported: ['LinkedIn', 'Facebook', 'X/Twitter', 'GitHub', 'Discord', 'Instagram', 'TikTok']
          }
        },
        step4_usefulLinks: {
          name: "Useful Links Extraction",
          completed: !!result.usefulLinks,
          success: result.usefulLinks && Object.keys(result.usefulLinks).length > 0,
          data: {
            linksFound: result.usefulLinks ? Object.keys(result.usefulLinks).length : 0,
            usefulLinks: result.usefulLinks || {},
            typesSupported: ['Email Contact', 'Documentation', 'Affiliate Links', 'Changelog/Updates']
          }
        },
        step5_contentGeneration: {
          name: "AI Content Generation",
          completed: !!result.generatedContent,
          success: result.generatedContent && result.generatedContent.length >= 300,
          data: {
            contentLength: result.generatedContent ? result.generatedContent.length : 0,
            wordCount: result.generatedContent ? result.generatedContent.split(' ').length : 0,
            sectionsCount: result.generatedContent ? (result.generatedContent.match(/## /g) || []).length : 0,
            hasRequiredTitle: result.generatedContent ? result.generatedContent.includes("What's ") : false,
            meetsMinimumLength: result.generatedContent ? result.generatedContent.split(' ').length >= 300 : false
          }
        }
      },
      fullResults: result,
      summary: {
        overallSuccess: result.status === 'success' && result.step === 'completed',
        stepsCompleted: result.step === 'completed' ? 5 : ['http_check', 'crawling', 'social_extraction', 'useful_links', 'content_generation'].indexOf(result.step) + 1,
        stepsSuccessful: Object.values({
          step1: result.httpStatusCode >= 200 && result.httpStatusCode < 400,
          step2: result.processedPages > 0,
          step3: result.socialLinks && Object.keys(result.socialLinks).length > 0,
          step4: result.usefulLinks && Object.keys(result.usefulLinks).length > 0,
          step5: result.generatedContent && result.generatedContent.length >= 300
        }).filter(Boolean).length,
        totalSteps: 5,
        hasErrors: result.errors && result.errors.length > 0,
        processingTime: `${duration.toFixed(2)}s`,
        dataQuality: {
          urlWorking: result.httpStatusCode >= 200 && result.httpStatusCode < 400,
          contentRich: result.processedPages > 5,
          socialPresence: result.socialLinks && Object.keys(result.socialLinks).length > 0,
          documentationAvailable: result.usefulLinks && result.usefulLinks.docsLink,
          qualityContent: result.generatedContent && result.generatedContent.length >= 300
        }
      }
    }
    
    // Sauvegarder le rapport
    const reportFilename = `complete-sommerai-test-${Date.now()}.json`
    await fs.writeFile(reportFilename, JSON.stringify(detailedReport, null, 2))
    
    console.log(`\n${'='.repeat(80)}`)
    console.log('📊 RÉSUMÉ FINAL - SYSTÈME DE MISE À JOUR AUTOMATIQUE')
    console.log(`${'='.repeat(80)}`)
    console.log(`🎯 Outil testé: ${result.toolName} (ID: ${toolId})`)
    console.log(`⏱️  Durée totale: ${duration.toFixed(2)}s`)
    console.log(`✅ Status final: ${result.status.toUpperCase()}`)
    console.log(`🔄 Étapes complétées: ${detailedReport.summary.stepsCompleted}/5`)
    console.log(`🏆 Étapes réussies: ${detailedReport.summary.stepsSuccessful}/5`)
    
    console.log(`\n🔍 DÉTAIL DES RÉSULTATS:`)
    console.log(`   ${detailedReport.stepByStepResults.step1_httpCheck.success ? '✅' : '❌'} HTTP Status Check`)
    console.log(`   ${detailedReport.stepByStepResults.step2_crawling.success ? '✅' : '❌'} Website Crawling (${result.processedPages || 0} pages)`)
    console.log(`   ${detailedReport.stepByStepResults.step3_socialExtraction.success ? '✅' : '❌'} Social Links (${detailedReport.stepByStepResults.step3_socialExtraction.data.linksFound} trouvés)`)
    console.log(`   ${detailedReport.stepByStepResults.step4_usefulLinks.success ? '✅' : '❌'} Useful Links (${detailedReport.stepByStepResults.step4_usefulLinks.data.linksFound} trouvés)`)
    console.log(`   ${detailedReport.stepByStepResults.step5_contentGeneration.success ? '✅' : '❌'} Content Generation (${detailedReport.stepByStepResults.step5_contentGeneration.data.wordCount} mots)`)
    
    console.log(`\n📊 QUALITÉ DES DONNÉES:`)
    console.log(`   ${detailedReport.summary.dataQuality.urlWorking ? '✅' : '❌'} URL fonctionnelle`)
    console.log(`   ${detailedReport.summary.dataQuality.contentRich ? '✅' : '❌'} Contenu riche (${result.processedPages} pages)`)
    console.log(`   ${detailedReport.summary.dataQuality.socialPresence ? '✅' : '❌'} Présence sociale`)
    console.log(`   ${detailedReport.summary.dataQuality.qualityContent ? '✅' : '❌'} Contenu de qualité`)
    
    console.log(`\n💾 Rapport JSON complet: ${reportFilename}`)
    console.log(`❌ Erreurs: ${detailedReport.summary.hasErrors ? 'Oui' : 'Non'}`)
    
    if (detailedReport.summary.overallSuccess) {
      console.log('\n🎉 === TEST COMPLET TERMINÉ AVEC SUCCÈS ===')
      console.log('🚀 Le système est prêt pour la production !')
    } else {
      console.log('\n⚠️ === TEST TERMINÉ AVEC LIMITATIONS ===')
      console.log('🔧 Quelques ajustements peuvent être nécessaires')
    }
    
  } catch (error: any) {
    console.error('\n❌ ERREUR DURANT LE TEST:', error.message)
    console.log('\n🔍 DIAGNOSTIC COMPLET:')
    console.log(`   Type d'erreur: ${error.constructor.name}`)
    console.log(`   Message: ${error.message}`)
    if (error.code) console.log(`   Code: ${error.code}`)
    if (error.stack) console.log(`   Stack: ${error.stack.substring(0, 300)}...`)
  } finally {
    await prisma.$disconnect()
  }
}

testSommerAI().catch(console.error)