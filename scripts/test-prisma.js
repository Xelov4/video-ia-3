const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Test de connexion Prisma...');
    
    // Test simple - compter les outils
    const toolCount = await prisma.tool.count();
    console.log(`✅ Connexion réussie! Nombre d'outils: ${toolCount}`);
    
    // Test des autres tables
    const languageCount = await prisma.language.count();
    const categoryCount = await prisma.category.count();
    const tagCount = await prisma.tag.count();
    
    console.log(`📊 Statistiques:`);
    console.log(`   - Langues: ${languageCount}`);
    console.log(`   - Catégories: ${categoryCount}`);
    console.log(`   - Tags: ${tagCount}`);
    console.log(`   - Outils: ${toolCount}`);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 