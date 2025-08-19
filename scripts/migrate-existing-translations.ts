/**
 * ================================================================
 * 🔄 MIGRATION DONNÉES EXISTANTES - NOUVEAUX CHAMPS
 * ================================================================
 *
 * Script pour migrer les données existantes des tools vers
 * les nouveaux champs des tool_translations.
 *
 * 🎯 OBJECTIF:
 * Éviter de refaire tout le seed en copiant intelligemment
 * les données existantes depuis la table tools.
 */

import { prisma } from '../src/lib/database/client';

async function migrateExistingTranslations() {
  console.log('🔄 === MIGRATION DONNÉES EXISTANTES ===\n');

  try {
    // 1. Vérification données existantes
    console.log('📊 1. Analyse données existantes...');

    const stats = await prisma.toolTranslation.groupBy({
      by: ['languageCode'],
      _count: { id: true },
    });

    console.log('   Traductions par langue:');
    stats.forEach(stat => {
      console.log(`   - ${stat.languageCode}: ${stat._count.id} traductions`);
    });

    // 2. Migration pour l'anglais (copie depuis tools)
    console.log('\n🇺🇸 2. Migration traductions anglaises...');

    const result = await prisma.$executeRaw`
      UPDATE tool_translations 
      SET 
        key_features = tools.key_features,
        use_cases = tools.use_cases,
        target_audience = tools.target_audience,
        updated_at = NOW()
      FROM tools 
      WHERE tool_translations.tool_id = tools.id 
        AND tool_translations.language_code = 'en'
        AND tools.key_features IS NOT NULL
    `;

    console.log(`   ✅ ${result} traductions anglaises mises à jour`);

    // 3. Vérification du résultat
    console.log('\n📊 3. Vérification post-migration...');

    const updatedCount = await prisma.toolTranslation.count({
      where: {
        languageCode: 'en',
        AND: [{ keyFeatures: { not: null } }, { keyFeatures: { not: '' } }],
      },
    });

    console.log(`   ✅ ${updatedCount} traductions EN avec keyFeatures remplies`);

    // 4. Statistiques finales
    const totalTranslations = await prisma.toolTranslation.count();
    const withNewFields = await prisma.toolTranslation.count({
      where: {
        AND: [{ keyFeatures: { not: null } }, { keyFeatures: { not: '' } }],
      },
    });

    console.log('\n📈 RÉSULTATS MIGRATION:');
    console.log(`   📊 Total traductions: ${totalTranslations}`);
    console.log(`   ✅ Avec nouveaux champs: ${withNewFields}`);
    console.log(
      `   🎯 Taux de couverture: ${((withNewFields / totalTranslations) * 100).toFixed(1)}%`
    );

    if (withNewFields > 0) {
      console.log('\n🎉 MIGRATION RÉUSSIE !');
      console.log('   ✅ Données anglaises migrées depuis table tools');
      console.log('   ⚠️  Autres langues à regénérer avec le système optimisé');
      console.log('   💡 Utiliser updateToolContentWithTranslations() pour compléter');
    } else {
      console.log('\n⚠️  MIGRATION PARTIELLE');
      console.log('   🔍 Vérifier que la table tools contient les champs requis');
    }
  } catch (error: any) {
    console.error('\n❌ ERREUR MIGRATION:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingTranslations().catch(console.error);
