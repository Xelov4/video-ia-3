/**
 * Test spécifique des traductions uniquement
 * Utilise un contenu anglais existant pour tester les traductions
 */

import { ToolContentUpdaterService } from '../src/lib/services/toolContentUpdater'
import { prisma } from '../src/lib/database/client'
import * as fs from 'fs/promises'

async function testTranslationsOnly() {
  console.log('🌐 === TEST TRADUCTIONS UNIQUEMENT ===\n')
  
  const toolId = 6669 // Visualizee
  
  try {
    console.log(`🎯 Test traductions pour Visualizee (ID: ${toolId})`)
    console.log(`🌐 6 langues: Français, Italien, Espagnol, Allemand, Néerlandais, Portugais`)
    console.log(`\n${'='.repeat(60)}\n`)
    
    // Contenu anglais simulé (exemple basé sur Visualizee)
    const mockEnglishContent = {
      overview: "Visualizee is an AI rendering tool that transforms sketches, images, 3D models, or text prompts into realistic visualizations. It allows users to create renders quickly, without needing expensive 3D software.",
      description: `## What's Visualizee?

Visualizee is a revolutionary AI-powered rendering tool that transforms your creative concepts into stunning photorealistic visualizations in seconds. Whether you're working with rough sketches, existing images, 3D models, or just text descriptions, this platform makes professional-quality rendering accessible to everyone.

## Key Features and Capabilities

- **Multi-Input Processing**: Upload sketches, images, 3D models (FBX, OBJ, GLTF), or describe your vision in text
- **Lightning-Fast Rendering**: Generate high-quality visualizations in seconds, not hours
- **Professional Quality**: Produce photorealistic results without expensive 3D software
- **User-Friendly Interface**: Simple drag-and-drop functionality requires no technical expertise
- **Versatile Applications**: Perfect for architecture, interior design, product visualization, and concept art

## Perfect For Creative Professionals

Visualizee streamlines the visualization process for architects, interior designers, product developers, and marketing teams who need quick, professional results without the complexity of traditional 3D rendering software.`,
      metaTitle: "AI 3D Rendering Tool Online - Visualizee - Video-IA.net",
      metaDescription: "Turn sketches & ideas into realistic 3D renders in seconds with AI! Get 3 free renders. No credit card needed. Try Visualizee now!",
      keyFeatures: `• Create realistic renders from sketches, images, 3D models, or text prompts
• Generate architectural visualizations without expensive 3D software  
• Design and visualize interior spaces with ease
• Quickly transform concepts into realistic visuals in seconds
• Produce photorealistic renderings for design presentations
• Enable rapid prototyping and iteration of design ideas`,
      useCases: `• Visualizee helps you transform architectural sketches into realistic 3D renderings without expensive 3D software
• Visualizee helps you visualize interior designs from sketches, images, or 3D models using text prompts  
• Visualizee helps you create realistic renders of car designs, like a "sport white sedan made by mercedes", from text prompts
• Visualizee helps you generate 3D visualizations from various 3D model formats like FBX, OBJ, and GLTF`,
      targetAudience: "Visualizee targets architects by offering a fast and cost-effective way to turn sketches, images, or 3D models into realistic renders, bypassing the need for expensive 3D software. Interior designers benefit from its ability to visualize spaces quickly using text prompts and existing design elements. Product designers and automotive professionals can create realistic product visualizations from simple descriptions or rough concepts. Marketing teams and real estate professionals find it valuable for creating compelling visual content without technical 3D modeling expertise."
    }
    
    const startTime = Date.now()
    
    // LANCER LES TRADUCTIONS
    const result = await ToolContentUpdaterService.generateToolTranslations(
      toolId,
      mockEnglishContent,
      true // Mode test
    )
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log(`\n⏱️ DURÉE TRADUCTIONS: ${duration.toFixed(2)}s`)
    console.log(`\n${'='.repeat(80)}`)
    console.log('📊 RÉSULTAT DES TRADUCTIONS')
    console.log(`${'='.repeat(80)}`)
    
    console.log(`\n📈 STATISTIQUES GÉNÉRALES:`)
    console.log(`   Langues traitées: ${result.totalLanguages}`)
    console.log(`   Traductions réussies: ${result.successfulTranslations}`)
    console.log(`   Taux de réussite: ${((result.successfulTranslations / result.totalLanguages) * 100).toFixed(1)}%`)
    
    // Détail par langue
    const languages = ['fr', 'it', 'es', 'de', 'nl', 'pt']
    const languageNames = {
      'fr': 'Français 🇫🇷',
      'it': 'Italien 🇮🇹', 
      'es': 'Espagnol 🇪🇸',
      'de': 'Allemand 🇩🇪',
      'nl': 'Néerlandais 🇳🇱',
      'pt': 'Portugais 🇵🇹'
    }
    
    console.log(`\n📝 RÉSULTATS PAR LANGUE:`)
    languages.forEach(lang => {
      const translation = result.translations[lang]
      console.log(`\n   ${languageNames[lang]}:`)
      
      if (translation && !translation.error) {
        console.log(`     ✅ Traduction réussie`)
        console.log(`     📏 Overview: ${translation.overview?.length || 0} caractères`)
        console.log(`     📏 Description: ${translation.description?.length || 0} caractères`)  
        console.log(`     📏 Meta Title: ${translation.metaTitle?.length || 0} caractères`)
        console.log(`     📏 Meta Description: ${translation.metaDescription?.length || 0} caractères`)
        console.log(`     📏 Key Features: ${translation.keyFeatures ? (translation.keyFeatures.match(/•/g) || []).length : 0} bullet points`)
        console.log(`     📏 Use Cases: ${translation.useCases ? (translation.useCases.match(/•/g) || []).length : 0} bullet points`)
        console.log(`     📏 Target Audience: ${translation.targetAudience?.length || 0} caractères`)
        
        // Vérifications qualité
        const hasVideoIA = translation.metaTitle?.includes('- Video-IA.net')
        const overviewSentences = translation.overview ? translation.overview.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0
        const targetSentences = translation.targetAudience ? translation.targetAudience.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0
        
        console.log(`     🔍 Qualité:`)
        console.log(`       ${hasVideoIA ? '✅' : '❌'} Meta title avec "- Video-IA.net"`)
        console.log(`       ${overviewSentences === 2 ? '✅' : '⚠️'} Overview (${overviewSentences} phrases, attendu: 2)`)
        console.log(`       ${targetSentences >= 3 && targetSentences <= 4 ? '✅' : '⚠️'} Target Audience (${targetSentences} phrases, attendu: 3-4)`)
        
      } else {
        console.log(`     ❌ Échec: ${translation?.error || 'Erreur inconnue'}`)
      }
    })
    
    // APERÇUS
    console.log(`\n📖 APERÇUS DE TRADUCTIONS:`)
    
    // Overview comparison
    console.log(`\n   📝 OVERVIEW:`)
    console.log(`   🇺🇸 Original: "${mockEnglishContent.overview}"`)
    if (result.translations.fr?.overview) {
      console.log(`   🇫🇷 Français: "${result.translations.fr.overview}"`)
    }
    if (result.translations.es?.overview) {
      console.log(`   🇪🇸 Espagnol: "${result.translations.es.overview}"`)
    }
    
    // Meta title comparison
    console.log(`\n   🏷️ META TITLE:`)
    console.log(`   🇺🇸 Original: "${mockEnglishContent.metaTitle}"`)
    if (result.translations.fr?.metaTitle) {
      console.log(`   🇫🇷 Français: "${result.translations.fr.metaTitle}"`)
    }
    if (result.translations.de?.metaTitle) {
      console.log(`   🇩🇪 Allemand: "${result.translations.de.metaTitle}"`)
    }
    
    // Rapport JSON détaillé
    const detailedReport = {
      timestamp: new Date().toISOString(),
      testType: 'translations_only_test',
      toolInfo: {
        id: toolId,
        name: 'Visualizee'
      },
      performance: {
        translationDurationSeconds: parseFloat(duration.toFixed(2)),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        efficient: duration < 120 // 2 minutes max pour traductions
      },
      inputContent: {
        overviewLength: mockEnglishContent.overview.length,
        descriptionLength: mockEnglishContent.description.length,
        metaTitleLength: mockEnglishContent.metaTitle.length,
        metaDescriptionLength: mockEnglishContent.metaDescription.length,
        keyFeaturesLength: mockEnglishContent.keyFeatures.length,
        useCasesLength: mockEnglishContent.useCases.length,
        targetAudienceLength: mockEnglishContent.targetAudience.length
      },
      translationResults: {
        totalLanguages: result.totalLanguages,
        successfulTranslations: result.successfulTranslations,
        successRate: (result.successfulTranslations / result.totalLanguages * 100),
        languageDetails: result.translations,
        quality: {
          french: result.translations.fr ? !result.translations.fr.error : false,
          italian: result.translations.it ? !result.translations.it.error : false,
          spanish: result.translations.es ? !result.translations.es.error : false,
          german: result.translations.de ? !result.translations.de.error : false,
          dutch: result.translations.nl ? !result.translations.nl.error : false,
          portuguese: result.translations.pt ? !result.translations.pt.error : false
        }
      },
      fullResults: result
    }
    
    // Sauvegarder le rapport
    const reportFilename = `translations-only-test-${Date.now()}.json`
    await fs.writeFile(reportFilename, JSON.stringify(detailedReport, null, 2))
    
    console.log(`\n${'='.repeat(80)}`)
    console.log('📊 RÉSUMÉ FINAL - TEST TRADUCTIONS')
    console.log(`${'='.repeat(80)}`)
    console.log(`⏱️  Durée: ${duration.toFixed(2)}s`)
    console.log(`🌐 Langues traitées: ${result.totalLanguages}`)
    console.log(`✅ Traductions réussies: ${result.successfulTranslations}`)
    console.log(`📈 Taux de réussite: ${((result.successfulTranslations / result.totalLanguages) * 100).toFixed(1)}%`)
    console.log(`💾 Rapport: ${reportFilename}`)
    
    const successRate = (result.successfulTranslations / result.totalLanguages) * 100
    
    if (successRate >= 90) {
      console.log('\n🎉 === TRADUCTIONS EXCELLENTES ===')
      console.log('🌍 Système de traduction parfaitement opérationnel!')
    } else if (successRate >= 75) {
      console.log('\n✅ === TRADUCTIONS BONNES ===')
      console.log('🌍 Système de traduction majoritairement fonctionnel')
    } else if (successRate >= 50) {
      console.log('\n⚠️ === TRADUCTIONS PARTIELLES ===')
      console.log('🌍 Système de traduction partiellement fonctionnel')
    } else {
      console.log('\n❌ === TRADUCTIONS DÉFAILLANTES ===')
      console.log('🌍 Système de traduction nécessite des corrections')
    }
    
  } catch (error: any) {
    console.error('\n❌ ERREUR DURANT LE TEST TRADUCTIONS:', error.message)
    console.log('\n🔍 DIAGNOSTIC:')
    console.log(`   Type: ${error.constructor.name}`)
    console.log(`   Message: ${error.message}`)
    if (error.stack) console.log(`   Stack: ${error.stack.substring(0, 400)}...`)
  } finally {
    await prisma.$disconnect()
  }
}

testTranslationsOnly().catch(console.error)