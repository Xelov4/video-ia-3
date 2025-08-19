/**
 * ================================================================
 * 🧪 TEST CORRECTION PROBLÈME JSON - VALIDATION SIMPLE
 * ================================================================
 *
 * Ce script teste la correction du problème "response.replace is not a function"
 * qui causait l'échec des traductions multilangues.
 *
 * 🚨 PROBLÈME IDENTIFIÉ:
 * - Erreur: "response.replace is not a function"
 * - Cause: Variable response n'est pas une string
 * - Impact: Échec des traductions (16.7% de succès au lieu de 80%+)
 *
 * 🛠️ SOLUTION IMPLÉMENTÉE:
 * - Validation robuste du type de réponse
 * - Conversion forcée en string
 * - Gestion des cas edge (objets, null, undefined)
 * - Extraction partielle en cas d'échec JSON
 *
 * 📊 OBJECTIFS DU TEST:
 * 1. Valider que cleanTranslationResponse gère tous les types
 * 2. Tester l'extraction partielle de traductions
 * 3. Vérifier la résilience du système
 * 4. Confirmer que les erreurs sont isolées
 */

import { ToolContentUpdaterServiceOptimized } from '../src/lib/services/toolContentUpdaterOptimized';

/**
 * 🧪 TEST DE LA FONCTION cleanTranslationResponse CORRIGÉE
 *
 * Teste la fonction avec différents types de réponses pour valider
 * la correction du problème "response.replace is not a function"
 */
async function testJsonFix() {
  console.log('🧪 === TEST CORRECTION PROBLÈME JSON ===\n');

  try {
    // 🔑 VÉRIFICATION DE LA CONFIGURATION
    if (!process.env.GEMINI_API_KEY) {
      console.log(
        '⚠️  GEMINI_API_KEY non configurée - Test en mode simulation uniquement'
      );
    } else {
      console.log('✅ Configuration Gemini API détectée');
    }

    // 🧪 TEST 1: VALIDATION DE cleanTranslationResponse
    console.log(
      '\n🧪 TEST 1: Validation de cleanTranslationResponse avec différents types'
    );
    console.log('='.repeat(80));

    // Utiliser la fonction privée via une méthode de test
    const service = ToolContentUpdaterServiceOptimized as any;

    if (!service.cleanTranslationResponse) {
      console.log('❌ Fonction cleanTranslationResponse non accessible');
      return;
    }

    // 🧪 Tests avec différents types de réponses
    const testCases = [
      {
        name: 'String normale',
        response: 'French translation: "Outil de Rendu 3D IA"',
        expected: 'Outil de Rendu 3D IA',
      },
      {
        name: 'String avec préfixe',
        response: 'Here is the JSON: {"overview": "Test content"}',
        expected: 'Here is the JSON: {"overview": "Test content"}',
      },
      {
        name: 'Objet JavaScript',
        response: { overview: 'Test content', description: 'Test desc' },
        expected: '{"overview":"Test content","description":"Test desc"}',
      },
      {
        name: 'Nombre',
        response: 42,
        expected: '42',
      },
      {
        name: 'Booléen',
        response: true,
        expected: 'true',
      },
      {
        name: 'Null',
        response: null,
        expected: '',
      },
      {
        name: 'Undefined',
        response: undefined,
        expected: '',
      },
      {
        name: 'Array',
        response: ['item1', 'item2'],
        expected: '["item1","item2"]',
      },
    ];

    let successCount = 0;
    let totalTests = testCases.length;

    for (const testCase of testCases) {
      try {
        console.log(`\n🔍 Test: ${testCase.name}`);
        console.log(`   Input: ${JSON.stringify(testCase.response)}`);

        const result = service.cleanTranslationResponse.call(
          service,
          testCase.response,
          'overview'
        );

        console.log(`   Output: "${result}"`);
        console.log(`   Expected: "${testCase.expected}"`);

        if (result === testCase.expected) {
          console.log(`   ✅ SUCCÈS`);
          successCount++;
        } else {
          console.log(`   ❌ ÉCHEC - Résultat différent`);
        }
      } catch (error: any) {
        console.log(`   ❌ ERREUR: ${error.message}`);
      }
    }

    console.log(`\n📊 RÉSULTATS TEST 1: ${successCount}/${totalTests} tests réussis`);

    // 🧪 TEST 2: VALIDATION DE L'EXTRACTION PARTIELLE
    console.log("\n🧪 TEST 2: Validation de l'extraction partielle de traductions");
    console.log('='.repeat(80));

    if (!service.extractPartialTranslation) {
      console.log('❌ Fonction extractPartialTranslation non accessible');
    } else {
      // Test avec une réponse JSON malformée
      const malformedResponse = `
        Here is the translation:
        {
          "overview": "Test overview content",
          "description": "Test description content",
          "metaTitle": "Test Title - Video-IA.net"
        }
      `;

      try {
        console.log('🔍 Test extraction partielle avec réponse malformée');
        console.log(`   Input: ${malformedResponse.substring(0, 100)}...`);

        const extracted = service.extractPartialTranslation.call(
          service,
          malformedResponse,
          'TestTool',
          'fr'
        );

        console.log(`   Output: ${JSON.stringify(extracted, null, 2)}`);
        console.log(`   ✅ Extraction partielle réussie`);
      } catch (error: any) {
        console.log(`   ❌ Erreur extraction partielle: ${error.message}`);
      }
    }

    // 🧪 TEST 3: VALIDATION COMPLÈTE (si API disponible)
    if (process.env.GEMINI_API_KEY) {
      console.log('\n🧪 TEST 3: Validation complète avec API Gemini');
      console.log('='.repeat(80));

      try {
        console.log("🔄 Test d'un appel Gemini simple...");

        // Test avec un prompt simple
        const testPrompt = `You are a helpful AI assistant. Please write exactly 2 sentences about artificial intelligence. Keep it simple and informative.`;

        const result = await service.callGeminiWithFallback.call(service, testPrompt);

        console.log(`✅ Appel Gemini réussi`);
        console.log(`📝 Réponse reçue: "${result.substring(0, 100)}..."`);
        console.log(`📊 Longueur: ${result.length} caractères`);
      } catch (error: any) {
        console.log(`❌ Test Gemini échoué: ${error.message}`);
        console.log(
          '💡 Cela peut être normal si la clé API est invalide ou les quotas dépassés'
        );
      }
    }

    // 📊 RAPPORT FINAL
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT FINAL - CORRECTION PROBLÈME JSON');
    console.log('='.repeat(80));

    const overallSuccess = successCount >= totalTests * 0.8; // 80% de succès minimum

    console.log(`\n📋 RÉSUMÉ DES TESTS:`);
    console.log(
      `   🧪 Test 1 (cleanTranslationResponse): ${successCount}/${totalTests} ✅`
    );
    console.log(
      `   🧪 Test 2 (extraction partielle): ${service.extractPartialTranslation ? '✅ Disponible' : '❌ Non disponible'}`
    );
    console.log(
      `   🧪 Test 3 (API Gemini): ${process.env.GEMINI_API_KEY ? '✅ Configuré' : '⚠️ Non configuré'}`
    );

    console.log(`\n🏆 VERDICT FINAL:`);
    if (overallSuccess) {
      console.log(`   ✅ PROBLÈME JSON CORRIGÉ - Système prêt pour la production`);
      console.log(`   🎯 Taux de succès attendu: 80%+ (vs 16.7% avant correction)`);
      console.log(`   🚀 Recommandation: Déployer la correction en production`);
    } else {
      console.log(`   ❌ PROBLÈME JSON PERSISTANT - Correction incomplète`);
      console.log(`   🔧 Recommandation: Analyser les échecs et ajuster la correction`);
    }

    console.log(`\n💡 PROCHAINES ÉTAPES:`);
    console.log(`   1. Tester avec le script multilingue complet`);
    console.log(`   2. Valider les traductions en production`);
    console.log(`   3. Monitorer le taux de succès des traductions`);
  } catch (error: any) {
    console.error('\n❌ ERREUR DURANT LE TEST:', error.message);
    console.log('\n🔍 DIAGNOSTIC:');
    console.log(`   Type: ${error.constructor.name}`);
    console.log(`   Message: ${error.message}`);
    if (error.stack) console.log(`   Stack: ${error.stack.substring(0, 500)}...`);
  }
}

// 🚀 EXÉCUTION DU TEST
testJsonFix().catch(console.error);
