/**
 * Script pour regénérer les nouveaux champs pour les outils populaires
 */

import { ToolContentUpdaterServiceOptimized } from '../src/lib/services/toolContentUpdaterOptimized';
import { prisma } from '../src/lib/database/client';

async function regeneratePopularTools() {
  console.log('🔥 Regénération outils populaires...\n');

  // Récupérer les 10 outils les plus consultés
  const popularTools = await prisma.tool.findMany({
    where: {
      isActive: true,
      toolLink: { not: null },
    },
    orderBy: { viewCount: 'desc' },
    take: 10,
    select: { id: true, toolName: true, viewCount: true },
  });

  console.log('🎯 Outils sélectionnés:');
  popularTools.forEach(tool => {
    console.log(`   - ${tool.toolName} (${tool.viewCount} vues)`);
  });

  // Regénérer un par un
  for (const tool of popularTools) {
    console.log(`\n🔄 Traitement ${tool.toolName}...`);

    try {
      // Utiliser le système optimisé en mode production
      const result =
        await ToolContentUpdaterServiceOptimized.updateToolContentWithTranslations(
          tool.id,
          false // Mode production
        );

      if (result.status === 'success') {
        console.log(
          `   ✅ ${tool.toolName} - ${result.phase2_translations?.successfulTranslations}/6 langues`
        );
      } else {
        console.log(`   ❌ ${tool.toolName} - Échec`);
      }
    } catch (error: any) {
      console.log(`   ❌ ${tool.toolName} - Erreur: ${error.message}`);
    }

    // Pause entre outils
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('\n🎉 Regénération terminée !');
  await prisma.$disconnect();
}

// regeneratePopularTools().catch(console.error)
